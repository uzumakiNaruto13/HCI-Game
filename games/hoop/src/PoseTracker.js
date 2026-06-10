import * as THREE from 'three';

export class PoseTracker {
    constructor(game) {
        this.game = game;
        game.poseDetector = null;
        game.cameraStream = null;
        game.lastPoseData = null;
        game.lastPoseWorldData = null;
        game.videoElement = null;
        game.cachedBones = null;
        game.initialQuats = null;
        game.initialHipsPos = null;
        game.modelFootOffset = 0;
        this._poseResultsHandler = null;

        game.boneSuffixes = {
            Hips: 'hips', Spine: 'spine', Chest: 'spine1', UpperChest: 'spine2',
            Neck: 'neck', Head: 'head',
            RightShoulder: 'rightshoulder', RightUpperArm: 'rightarm',
            RightLowerArm: 'rightforearm', RightHand: 'righthand',
            LeftShoulder: 'leftshoulder', LeftUpperArm: 'leftarm',
            LeftLowerArm: 'leftforearm', LeftHand: 'lefthand',
            RightUpperLeg: 'rightupleg', RightLowerLeg: 'rightleg',
            LeftUpperLeg: 'leftupleg', LeftLowerLeg: 'leftleg'
        };

        // 手机 IMU WebSocket
        this.imuData = { beta: 90, isActive: false, lastUpdate: 0 };
        this.smoothedThighAngle = 0;
        try {
            this.ws = new WebSocket('ws://10.160.211.244:8080');
            var self = this;
            this.ws.onmessage = function (e) {
                var data = JSON.parse(e.data);
                if (data.type === 'leg_imu') {
                    self.imuData.beta = data.beta;
                    self.imuData.isActive = true;
                    self.imuData.lastUpdate = performance.now();
                }
            };
        } catch (e) { console.warn('IMU WebSocket 连接失败'); }
    }

    setupPoseDetection(game) {
        if (!window.mpManager) {
            console.warn('[PoseTracker] MediaPipeManager 不存在');
            return;
        }

        // 复用全局 video 和流
        game.videoElement = window.mpManager.getVideoElement();
        game.cameraStream = window.mpManager.getStream();

        // 订阅全局 Pose 数据
        var self = this;
        this._poseResultsHandler = function (results) {
            game.lastPoseData = results.poseLandmarks;
            game.lastPoseWorldData = results.poseWorldLandmarks;
            // 关键点可视化由 MediaPipeManager 统一处理
        };
        window.mpManager.subscribe(this._poseResultsHandler);
        game.poseDetector = window.mpManager.pose;
        // 篮球场启用双机位拼盘模式
        if (window.mpManager._ipSnapshotCanvas) {
            window.mpManager._dualMode = true;
        }
        console.log('[PoseTracker] ✅ 已订阅 MediaPipeManager, 双机位:', window.mpManager._dualMode);
    }

    dispose() {
        if (window.mpManager && this._poseResultsHandler) {
            window.mpManager.unsubscribe(this._poseResultsHandler);
            this._poseResultsHandler = null;
            window.mpManager._dualMode = false;
            console.log('[PoseTracker] 已退订 MediaPipeManager，双机位关闭');
        }
    }

    updatePose(game, delta) {
        const isTrackingActive = game.lastPoseWorldData && game.lastPoseData && game.originalPlayerModel && typeof Kalidokit !== 'undefined';
        if (isTrackingActive) {
            if (!game.cachedBones) {
                game.cachedBones = {}; game.initialQuats = {};
                game.originalPlayerModel.traverse((child) => {
                    if (child.isBone) {
                        const nameStr = child.name.toLowerCase();
                        for (const [vrmName, suffix] of Object.entries(game.boneSuffixes)) {
                            if (nameStr.endsWith(suffix)) {
                                game.cachedBones[vrmName] = child;
                                game.initialQuats[vrmName] = child.quaternion.clone();
                                if (vrmName === 'Hips') game.initialHipsPos = child.position.clone();
                                break;
                            }
                        }
                    }
                });
            }

            // ---- 3D 深度诊断：每 60 帧输出一次 Z 轴数据 ----
            if (game.lastPoseWorldData && !game._depthDiagCount) game._depthDiagCount = 0;
            if (game.lastPoseWorldData && game._depthDiagCount++ % 60 === 0) {
                var wl = game.lastPoseWorldData;
                var noseZ = wl[0] ? wl[0].z.toFixed(2) : '?';
                var hipZ  = wl[23] ? wl[23].z.toFixed(2) : '?';
                var lAnkZ = wl[27] ? wl[27].z.toFixed(2) : '?';
                var rAnkZ = wl[28] ? wl[28].z.toFixed(2) : '?';
                console.log('[3D深度] 鼻尖Z:' + noseZ + ' 髋Z:' + hipZ + ' 左踝Z:' + lAnkZ + ' 右踝Z:' + rAnkZ);
            }

            let riggedPose = null;
            try { riggedPose = Kalidokit.Pose.solve(game.lastPoseWorldData, game.lastPoseData, { runtime: 'mediapipe', video: game.videoElement }); } catch (e) {}

            if (riggedPose) {
                // delta 自适应平滑 + 脊椎权重分配
                var dt = Math.min(delta, 0.1);
                var baseSmooth = Math.min(0.95, dt * 15);

                for (const [vrmName, bone] of Object.entries(game.cachedBones)) {
                    let posePart = riggedPose[vrmName];
                    if (!posePart) { const ak = Object.keys(riggedPose).find(k => k.toLowerCase() === vrmName.toLowerCase()); if (ak) posePart = riggedPose[ak]; }
                    if (!posePart) continue;
                    const rot = (vrmName === 'Hips') ? posePart.rotation : posePart;
                    if (!rot || typeof rot.x !== 'number') continue;
                    if (vrmName === 'Hips') continue;
                    // 拦截腿部：不直接映射 Kalidokit 旋转，交给 IK 解算
                    const isLegBone = vrmName.toLowerCase().includes('leg');
                    if (isLegBone) continue;

                    // 手臂 X 方向单独处理（举手=举手）
                    var isArm = vrmName.includes('Arm') || vrmName.includes('Hand');
                    var eX = isArm ? rot.x : -rot.x;
                    const kalidoQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(eX, -rot.y, -rot.z, 'XYZ'));
                    const targetQuat = game.initialQuats[vrmName].clone().multiply(kalidoQuat);
                    // 脊椎权重分配：多节脊柱共同承担躯干旋转
                    var weight = baseSmooth;
                    if (vrmName === 'Spine') weight = baseSmooth * 0.3;
                    else if (vrmName === 'Chest') weight = baseSmooth * 0.35;
                    else if (vrmName === 'UpperChest') weight = baseSmooth * 0.35;
                    bone.quaternion.slerp(targetQuat, weight);
                }
                if (game.cachedBones.Hips && game.initialHipsPos) game.cachedBones.Hips.position.copy(game.initialHipsPos);

                // ---- 躯干驱动两段式 Analytic IK (余弦定理) ----
                if (!game._legLengths) {
                    game._legLengths = { upper: game.modelHalfHeight * 0.45, lower: game.modelHalfHeight * 0.45 };
                }

                if (game.cachedBones.LeftUpperLeg && game.cachedBones.Hips) {
                    var hipWorldPos = new THREE.Vector3();
                    game.cachedBones.Hips.getWorldPosition(hipWorldPos);

                    var targetAnkleL = new THREE.Vector3(game.playerModel.position.x - 0.2, game.groundY, game.playerModel.position.z);
                    var targetAnkleR = new THREE.Vector3(game.playerModel.position.x + 0.2, game.groundY, game.playerModel.position.z);

                    function solveLegIK(hipPos, anklePos, upperLen, lowerLen) {
                        var dist = hipPos.distanceTo(anklePos);
                        var maxLen = upperLen + lowerLen;
                        dist = Math.max(0.01, Math.min(dist, maxLen * 0.99));
                        var cosKnee = (upperLen * upperLen + lowerLen * lowerLen - dist * dist) / (2 * upperLen * lowerLen);
                        var kneeAngle = Math.acos(cosKnee);
                        var boneKneeBend = Math.PI - kneeAngle;
                        var cosHipComp = (upperLen * upperLen + dist * dist - lowerLen * lowerLen) / (2 * upperLen * dist);
                        var hipCompAngle = Math.acos(cosHipComp);
                        var dx = anklePos.x - hipPos.x, dy = hipPos.y - anklePos.y, dz = anklePos.z - hipPos.z;
                        var verticalAngle = Math.atan2(Math.sqrt(dx * dx + dz * dz), dy);
                        return { upper: verticalAngle + hipCompAngle, lower: boneKneeBend };
                    }

                    var ikL = solveLegIK(hipWorldPos, targetAnkleL, game._legLengths.upper, game._legLengths.lower);
                    game.cachedBones.LeftUpperLeg.rotation.x = -ikL.upper;
                    if (game.cachedBones.LeftLowerLeg) game.cachedBones.LeftLowerLeg.rotation.x = ikL.lower;

                    var ikR = solveLegIK(hipWorldPos, targetAnkleR, game._legLengths.upper, game._legLengths.lower);
                    game.cachedBones.RightUpperLeg.rotation.x = -ikR.upper;
                    if (game.cachedBones.RightLowerLeg) game.cachedBones.RightLowerLeg.rotation.x = ikR.lower;
                }

                // ---- 手机 IMU 硬件级覆写（右腿）+ 左腿镜像对称 ----
                if (this.imuData.isActive && (performance.now() - this.imuData.lastUpdate < 1000)) {
                    var targetAngleRad = (this.imuData.beta - 90) * (Math.PI / 180);
                    targetAngleRad = Math.min(0.2, Math.max(-2.0, targetAngleRad));
                    this.smoothedThighAngle += (targetAngleRad - this.smoothedThighAngle) * 0.25;

                    // 右腿：手机直接驱动
                    if (game.cachedBones.RightUpperLeg) {
                        game.cachedBones.RightUpperLeg.rotation.x = this.smoothedThighAngle;
                        if (game.cachedBones.RightLowerLeg) {
                            game.cachedBones.RightLowerLeg.rotation.x = Math.max(0, -this.smoothedThighAngle * 1.2);
                        }
                    }
                    // 左腿：镜像对称（带延迟平滑，模拟交替行走）
                    if (!this._mirrorLegAngle) this._mirrorLegAngle = 0;
                    this._mirrorLegAngle += (-this.smoothedThighAngle * 0.8 - this._mirrorLegAngle) * 0.15;
                    if (game.cachedBones.LeftUpperLeg) {
                        game.cachedBones.LeftUpperLeg.rotation.x = this._mirrorLegAngle;
                        if (game.cachedBones.LeftLowerLeg) {
                            game.cachedBones.LeftLowerLeg.rotation.x = Math.max(0, -this._mirrorLegAngle * 1.2);
                        }
                    }
                }

                // 单摄像头 Z 轴精度不足做细粒度倾角检测，深度交互已移除。
                // ==== 躯干前倾冲刺引擎：肩膀超髋 → 受控前摔 → 爆发冲刺 ====
                if (game.lastPoseData && game.playerBody && !game.isSprinting && game.state.isPlaying) {
                    var lAnkleS = game.lastPoseData[27], rAnkleS = game.lastPoseData[28];
                    var lHipS = game.lastPoseData[23], rHipS = game.lastPoseData[24];
                    var lShS = game.lastPoseData[11], rShS = game.lastPoseData[12];
                    if (lAnkleS && rAnkleS && lHipS && rHipS && lShS && rShS) {
                        if (!game._sprintEngine) game._sprintEngine = { prevHipX: (lHipS.x + rHipS.x) / 2, energyPool: 0 };
                        var se = game._sprintEngine;
                        var midShX = (lShS.x + rShS.x) / 2, midShY = (lShS.y + rShS.y) / 2;
                        var midHipX = (lHipS.x + rHipS.x) / 2, midHipY = (lHipS.y + rHipS.y) / 2;
                        var leanOffset = Math.abs(midShX - midHipX);
                        var torsoHeight = Math.abs(midHipY - midShY) || 0.01;
                        var leanRatio = leanOffset / torsoHeight;
                        var hipVelocity = Math.abs(midHipX - se.prevHipX);
                        var strideAmplitude = Math.abs(lAnkleS.x - rAnkleS.x);
                        var LEAN_THRESHOLD = 0.25;
                        var currentEnergy = 0;
                        if (leanRatio > LEAN_THRESHOLD) {
                            var leanMultiplier = 1.0 + (leanRatio - LEAN_THRESHOLD) * 3;
                            currentEnergy = strideAmplitude * hipVelocity * leanMultiplier;
                        }
                        se.energyPool = (se.energyPool * 0.8) + currentEnergy;
                        if (se.energyPool > 0.003) {
                            console.log('🔥 躯干前倾突破临界点，触发冲刺！');
                            game.performSprint();
                            se.energyPool = 0;
                        }
                        se.prevHipX = midHipX;
                    }
                }

                // 可靠交互：手部 X/Y（弯腰拾球、蹲下蓄力）、手机 IMU（腿部）、行走检测。

                // 弯腰拾球
                if (game.lastPoseData && game.basketballBody && game.basketball && game.basketball.visible) {
                    var lm = game.lastPoseData, wlm = game.lastPoseWorldData;
                    var lSh = lm[11], rSh = lm[12], lHip2 = lm[23], rHip2 = lm[24];
                    var lWrist = wlm[15], rWrist = wlm[16], hipW = wlm[23];
                    var shoulderY = (lSh.y + rSh.y) / 2, hipY = (lHip2.y + rHip2.y) / 2;
                    var isBending = (shoulderY - hipY) / (Math.abs(hipY) + 0.01) < 0.25;
                    if (lWrist && rWrist && hipW && game.playerModel) {
                        var hipMP = new THREE.Vector3(hipW.x, hipW.y, -hipW.z);
                        var lOff = new THREE.Vector3(lWrist.x, lWrist.y, -lWrist.z).sub(hipMP);
                        var rOff = new THREE.Vector3(rWrist.x, rWrist.y, -rWrist.z).sub(hipMP);
                        var pp = game.playerModel.position;
                        var ballP = new THREE.Vector3(game.basketballBody.position.x, game.basketballBody.position.y, game.basketballBody.position.z);
                        var distL = pp.clone().add(lOff).distanceTo(ballP);
                        var distR = pp.clone().add(rOff).distanceTo(ballP);
                        if ((distL < (isBending ? 1.5 : 0.8) || distR < (isBending ? 1.5 : 0.8)) && !game.ballAttached && !game.defenderHoldingBall) {
                            game.basketballHandler.attachBall(game);
                        }
                    }
                }

                // 行走检测
                if (game.lastPoseData && game.playerBody && !game.isSprinting) {
                    var plm = game.lastPoseData;
                    var lKnee = plm[25], rKnee = plm[26], lHip3 = plm[23], rHip3 = plm[24];
                    var lAnkle = plm[27], rAnkle = plm[28], lSh2 = plm[11], rSh2 = plm[12];
                    if (lKnee && rKnee && lHip3 && rHip3 && lSh2 && rSh2) {
                        var lFootY = lAnkle ? lAnkle.y : lKnee.y, rFootY = rAnkle ? rAnkle.y : rKnee.y;
                        var hipAvgY = (lHip3.y + rHip3.y) / 2;
                        var liftDiff = (hipAvgY - (lKnee.y + lFootY) / 2) - (hipAvgY - (rKnee.y + rFootY) / 2);
                        if (!game._walkState) game._walkState = { prevSign: 0, moveX: 0, moveZ: 0, activeTimer: 0 };
                        var ws = game._walkState;
                        var currentSign = Math.sign(liftDiff);
                        if (currentSign !== 0 && currentSign !== ws.prevSign && Math.abs(liftDiff) > 0.008) {
                            ws.activeTimer = 0.45;
                            var shDx = rSh2.x - lSh2.x, shDy = rSh2.y - lSh2.y;
                            var shLen = Math.sqrt(shDx * shDx + shDy * shDy);
                            if (shLen > 0.01) { ws.moveX = -shDy / shLen; ws.moveZ = shDx / shLen; }
                        }
                        ws.prevSign = currentSign;
                        if (ws.activeTimer > 0) {
                            ws.activeTimer -= delta;
                            game.playerBody.velocity.x += (ws.moveX * game.moveSpeed * 0.85 - game.playerBody.velocity.x) * 0.35;
                            game.playerBody.velocity.z += (ws.moveZ * game.moveSpeed * 0.85 - game.playerBody.velocity.z) * 0.35;
                        }
                    }
                }

                // 蹲下蓄力投篮：髋部下降 → 开始蓄力，站起 → 出手
                if (game.lastPoseData && game.ballAttached && !game.isSprinting) {
                    var slm = game.lastPoseData;
                    var sHipL = slm[23], sHipR = slm[24];
                    if (sHipL && sHipR) {
                        var hipY = (sHipL.y + sHipR.y) / 2;
                        // 源头平滑：用指数移动平均过滤 MediaPipe 抖动
                        if (!game._smoothHipY) game._smoothHipY = hipY;
                        game._smoothHipY += (hipY - game._smoothHipY) * 0.3;

                        if (!game._squatBaseline) game._squatBaseline = game._smoothHipY;
                        if (game._squatLockTimer > 0) { game._squatLockTimer--; game._squatBaseline = game._smoothHipY; }
                        // 缓慢更新站立基准线
                        game._squatBaseline += (game._smoothHipY - game._squatBaseline) * 0.02;
                        var squatDepth = game._smoothHipY - game._squatBaseline;

                        if (squatDepth > 0.04 && !game.isCharging) {
                            // 蹲下 → 开始蓄力
                            game.isCharging = true;
                            game.chargeStartTime = performance.now() / 1000;
                            game.displayProgress = 0;
                        } else if (squatDepth < 0.015 && game.isCharging) {
                            // 站起 → 出手投篮
                            var progress = game.displayProgress;
                            var powerFactor = game.minCharge + (game.maxCharge - game.minCharge) * progress;
                            game.basketballHandler.shootFromHand(game, powerFactor);
                            game.isCharging = false;
                            game.displayProgress = 0;
                            // 投篮后锁基准 1 秒，防止落地误触
                            game._squatLockTimer = 60;
                            game._squatBaseline = game._smoothHipY;
                        }
                    }
                }

                // 暴露手部位置 + 头部 Enter 信号（供菜单/选择框联动）
                if (game.lastPoseData) {
                    var hlm = game.lastPoseData;
                    var lWristH = hlm[15], rWristH = hlm[16];
                    // 优先活跃手
                    if (rWristH && rWristH.visibility > 0.5) {
                        game.handSelectorPos = { x: rWristH.x, y: rWristH.y };
                    } else if (lWristH && lWristH.visibility > 0.5) {
                        game.handSelectorPos = { x: lWristH.x, y: lWristH.y };
                    } else {
                        game.handSelectorPos = null;
                    }

                    // 头部点头 → Enter 脉冲
                    var noseH = hlm[0];
                    if (noseH && noseH.visibility > 0.5) {
                        if (!game._headEnterState) game._headEnterState = { prevY: noseH.y, triggered: false };
                        var hes = game._headEnterState;
                        var headVel = noseH.y - hes.prevY;
                        if (headVel > 0.015 && !hes.triggered) {
                            game.headEnterSignal = true;
                            hes.triggered = true;
                        } else if (headVel < 0.005) {
                            hes.triggered = false;
                        }
                        hes.prevY = noseH.y;
                    }
                }
            }
        } else { if (game.mixer) game.mixer.update(delta); }
    }
}

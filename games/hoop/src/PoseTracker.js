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
        console.log('[PoseTracker] ✅ 已订阅 MediaPipeManager');
    }

    dispose() {
        if (window.mpManager && this._poseResultsHandler) {
            window.mpManager.unsubscribe(this._poseResultsHandler);
            this._poseResultsHandler = null;
            console.log('[PoseTracker] 已退订 MediaPipeManager');
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
                    // 数据已在 MediaPipeManager 源头翻转 X 轴，此处直接使用
                    const kalidoQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot.x, -rot.y, -rot.z, 'XYZ'));
                    const targetQuat = game.initialQuats[vrmName].clone().multiply(kalidoQuat);
                    // 脊椎权重分配：多节脊柱共同承担躯干旋转
                    var weight = baseSmooth;
                    if (vrmName === 'Spine') weight = baseSmooth * 0.3;
                    else if (vrmName === 'Chest') weight = baseSmooth * 0.35;
                    else if (vrmName === 'UpperChest') weight = baseSmooth * 0.35;
                    bone.quaternion.slerp(targetQuat, weight);
                }
                if (game.cachedBones.Hips && game.initialHipsPos) game.cachedBones.Hips.position.copy(game.initialHipsPos);

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
            }
        } else { if (game.mixer) game.mixer.update(delta); }
    }
}

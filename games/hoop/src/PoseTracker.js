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
        this._frameCount = 0;
        this._resultCount = 0;
        this._poseSolveCount = 0;

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

    async setupPoseDetection(game) {
        console.log('[PoseTracker] ====== 体感初始化开始 ======');

        // Step 1: 获取/创建 video 元素
        game.videoElement = document.getElementById('cam-video');
        if (!game.videoElement) {
            console.warn('[PoseTracker] 未找到 #cam-video，动态创建隐藏 video');
            game.videoElement = document.createElement('video');
            game.videoElement.id = 'cam-video';
            game.videoElement.setAttribute('playsinline', '');
            game.videoElement.setAttribute('autoplay', '');
            game.videoElement.setAttribute('muted', '');
            game.videoElement.style.display = 'none';
            document.body.appendChild(game.videoElement);
        } else {
            console.log('[PoseTracker] ✅ 找到 #cam-video 元素');
        }

        // Step 2: 获取 canvas 上下文
        const camCanvas = document.getElementById('cam-canvas');
        const camCtx = camCanvas ? camCanvas.getContext('2d') : null;
        console.log('[PoseTracker] cam-canvas:', camCanvas ? '✅ 存在' : '❌ 不存在');
        console.log('[PoseTracker] cam-ctx:', camCtx ? '✅ 可用' : '❌ 不可用');

        // Step 3: 请求摄像头
        console.log('[PoseTracker] 尝试复用全局摄像头流...');
        // 优先复用大厅已启动的全局摄像头流
        // 优先复用大厅已启动的全局摄像头流
        if (window._globalCameraStream && window._globalCameraStream.active) {
            game.videoElement.srcObject = window._globalCameraStream;
            await game.videoElement.play();
            game.cameraStream = window._globalCameraStream;
            console.log('[PoseTracker] ✅ 复用全局摄像头流');
        } else {
            console.log('[PoseTracker] 全局流不可用，尝试独立请求 getUserMedia...');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, frameRate: 30 } });
                console.log('[PoseTracker] ✅ getUserMedia 成功');
                game.videoElement.srcObject = stream;
                await game.videoElement.play();
                game.cameraStream = stream;
            } catch (err) {
                console.error('[PoseTracker] ❌ 摄像头失败:', err.name, err.message);
                if (err.name === 'NotAllowedError') console.error('[PoseTracker] → 用户拒绝了摄像头权限');
                if (err.name === 'NotFoundError') console.error('[PoseTracker] → 未找到摄像头设备');
                return;
            }
        }

        // Step 4: 检查 MediaPipe Pose
        const Pose = window.Pose;
        if (!Pose) {
            console.error('[PoseTracker] ❌ window.Pose 不存在，MediaPipe CDN 未加载');
            return;
        }
        console.log('[PoseTracker] ✅ window.Pose 可用');

        // Step 5: 初始化 Pose
        const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
        pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
        console.log('[PoseTracker] ✅ Pose 实例已创建, 选项: modelComplexity=1');

        // Step 6: 注册 onResults
        var self = this;
        pose.onResults((results) => {
            self._resultCount++;
            if (self._resultCount === 1) console.log('[PoseTracker] ✅ 首次收到 pose 数据!');
            if (self._resultCount % 60 === 0) console.log('[PoseTracker] 已收到', self._resultCount, '帧姿态数据');

            if (results.poseLandmarks && results.poseWorldLandmarks) {
                game.lastPoseData = results.poseLandmarks;
                game.lastPoseWorldData = results.poseWorldLandmarks;
                if (camCtx && camCanvas) {
                    camCanvas.width = game.videoElement.videoWidth || 200;
                    camCanvas.height = game.videoElement.videoHeight || 150;
                    camCtx.clearRect(0, 0, camCanvas.width, camCanvas.height);
                    results.poseLandmarks.forEach((landmark, index) => {
                        const x = landmark.x * camCanvas.width, y = landmark.y * camCanvas.height;
                        const isLegData = index >= 23 && index <= 28, isHandData = index >= 15 && index <= 22;
                        camCtx.beginPath(); camCtx.arc(x, y, isHandData ? 6 : (isLegData ? 5 : 3), 0, 2 * Math.PI);
                        camCtx.fillStyle = isHandData ? '#FF3333' : (isLegData ? '#33FF33' : '#00FF00'); camCtx.fill();
                        if (isHandData || isLegData) { camCtx.lineWidth = 2; camCtx.strokeStyle = isHandData ? '#FFFF00' : '#00FFFF'; camCtx.stroke(); }
                    });
                }
            }
        });
        game.poseDetector = pose;
        console.log('[PoseTracker] ✅ onResults 回调已注册');

        // Step 7: 启动帧循环
        const onVideoFrame = async () => {
            self._frameCount++;
            if (self._frameCount === 1) console.log('[PoseTracker] ✅ 首帧送入 MediaPipe');
            if (self._frameCount % 180 === 0) console.log('[PoseTracker] 已送入', self._frameCount, '帧到 MediaPipe, 收到', self._resultCount, '帧结果');
            if (game.videoElement && game.videoElement.readyState >= 2) {
                await pose.send({ image: game.videoElement });
            }
            if (game.videoElement && 'requestVideoFrameCallback' in game.videoElement) {
                game.videoElement.requestVideoFrameCallback(onVideoFrame);
            } else {
                setTimeout(onVideoFrame, 1000 / 30);
            }
        };
        if ('requestVideoFrameCallback' in game.videoElement) {
            console.log('[PoseTracker] ✅ 使用 requestVideoFrameCallback');
            game.videoElement.requestVideoFrameCallback(onVideoFrame);
        } else {
            console.log('[PoseTracker] ⚠ requestVideoFrameCallback 不可用，fallback 到 setTimeout');
            onVideoFrame();
        }
        console.log('[PoseTracker] ====== 体感初始化完成 ======');
    }

    updatePose(game, delta) {
        var missing = [];
        if (!game.lastPoseWorldData) missing.push('lastPoseWorldData');
        if (!game.lastPoseData) missing.push('lastPoseData');
        if (!game.originalPlayerModel) missing.push('originalPlayerModel');
        if (typeof Kalidokit === 'undefined') missing.push('Kalidokit');
        var isTrackingActive = missing.length === 0;

        if (!isTrackingActive && this._poseSolveCount === 0 && this._resultCount > 0) {
            console.warn('[PoseTracker] ⚠ 收到摄像头数据但无法驱动骨骼，缺少:', missing.join(', '));
        }

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
                var boneNames = Object.keys(game.cachedBones);
                var armBones = boneNames.filter(function(n) { return n.includes('Arm') || n.includes('Hand') || n.includes('Shoulder'); });
                var legBones = boneNames.filter(function(n) { return n.includes('Leg'); });
                console.log('[PoseTracker] ✅ 骨骼映射建立成功! 共', boneNames.length, '个');
                console.log('[PoseTracker]   手臂:', armBones.join(', ') || '(无)');
                console.log('[PoseTracker]   腿部:', legBones.join(', ') || '(无)');
            }

            let riggedPose = null;
            try {
                riggedPose = Kalidokit.Pose.solve(game.lastPoseWorldData, game.lastPoseData, { runtime: 'mediapipe', video: game.videoElement });
                this._poseSolveCount++;
                if (this._poseSolveCount === 1) {
                    console.log('[PoseTracker] ✅ 首次 Kalidokit 解算成功!');
                    // 检查解算结果中的腿部和手臂数据
                    var riggedKeys = Object.keys(riggedPose);
                    var riggedArms = riggedKeys.filter(function(k) { return k.includes('Arm') || k.includes('Hand'); });
                    var riggedLegs = riggedKeys.filter(function(k) { return k.includes('Leg'); });
                    console.log('[PoseTracker]   Kalidokit 输出手臂骨骼:', riggedArms.join(', ') || '(无)');
                    console.log('[PoseTracker]   Kalidokit 输出腿部骨骼:', riggedLegs.join(', ') || '(无)');
                }
            } catch (e) {
                console.error('[PoseTracker] ❌ Kalidokit 解算异常:', e.message);
            }

            if (riggedPose) {
                for (const [vrmName, bone] of Object.entries(game.cachedBones)) {
                    let posePart = riggedPose[vrmName];
                    if (!posePart) { const ak = Object.keys(riggedPose).find(k => k.toLowerCase() === vrmName.toLowerCase()); if (ak) posePart = riggedPose[ak]; }
                    if (!posePart) {
                        if (vrmName.includes('Leg') && this._poseSolveCount === 1) {
                            console.warn('[PoseTracker] ⚠ 腿部骨骼', vrmName, '在 Kalidokit 输出中未找到!');
                        }
                        continue;
                    }
                    const rot = (vrmName === 'Hips') ? posePart.rotation : posePart;
                    if (!rot || typeof rot.x !== 'number') continue;
                    if (vrmName === 'Hips') continue;

                    // 断层四：轴向重定向 — Arm/Hand/Leg 的 Z 轴不取反
                    let eulerX = rot.x, eulerY = -rot.y, eulerZ = -rot.z;
                    if (vrmName.includes('Arm') || vrmName.includes('Hand') || vrmName.includes('Leg')) eulerZ = rot.z;
                    const kalidoQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(eulerX, eulerY, eulerZ, 'XYZ'));
                    bone.quaternion.slerp(game.initialQuats[vrmName].clone().multiply(kalidoQuat), 0.6);
                }
                if (game.cachedBones.Hips && game.initialHipsPos) game.cachedBones.Hips.position.copy(game.initialHipsPos);

                // 腿部行走检测：髋(23,24) + 膝(25,26) + 踝(27,28) 综合判断
                if (game.lastPoseData && game.playerBody && !game.isSprinting) {
                    const lm = game.lastPoseData;
                    const lHip = lm[23], rHip = lm[24];
                    const lKnee = lm[25], rKnee = lm[26];
                    const lAnkle = lm[27], rAnkle = lm[28];
                    const lShoulder = lm[11], rShoulder = lm[12];
                    if (lKnee && rKnee && lHip && rHip && lShoulder && rShoulder) {
                        // 综合膝+踝的高度差，更准确的抬腿检测
                        var lFootY = lAnkle ? lAnkle.y : lKnee.y;
                        var rFootY = rAnkle ? rAnkle.y : rKnee.y;
                        const hipAvgY = (lHip.y + rHip.y) / 2;
                        const lLift = hipAvgY - (lKnee.y + lFootY) / 2;
                        const rLift = hipAvgY - (rKnee.y + rFootY) / 2;
                        const liftDiff = lLift - rLift;

                        if (!game._walkState) game._walkState = { prevSign: 0, moveX: 0, moveZ: 0, activeTimer: 0 };
                        const ws = game._walkState;
                        const currentSign = Math.sign(liftDiff);
                        if (currentSign !== 0 && currentSign !== ws.prevSign && Math.abs(liftDiff) > 0.008) {
                            ws.activeTimer = 0.45;
                            const shDx = rShoulder.x - lShoulder.x, shDy = rShoulder.y - lShoulder.y;
                            const shLen = Math.sqrt(shDx * shDx + shDy * shDy);
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

                // 弯腰检测 + 手势拾取篮球
                if (game.lastPoseWorldData && game.lastPoseData && game.basketballBody && game.basketball && game.basketball.visible) {
                    var wlm = game.lastPoseWorldData;
                    var lm = game.lastPoseData;
                    var lShoulder = lm[11], rShoulder = lm[12];
                    var lHip = lm[23], rHip = lm[24];
                    var lWrist = wlm[15], rWrist = wlm[16], hipW = wlm[23];

                    // 弯腰判定：肩-髋 Y 轴差值（站立时肩远高于髋，弯腰时接近或低于髋）
                    var shoulderY = (lShoulder.y + rShoulder.y) / 2;
                    var hipY = (lHip.y + rHip.y) / 2;
                    var bendRatio = (shoulderY - hipY) / (Math.abs(hipY) + 0.01); // 越小越弯腰
                    var isBending = bendRatio < 0.25; // 肩降到髋部25%以内视为弯腰

                    if (lWrist && rWrist && hipW && game.playerModel) {
                        var hipMP = new THREE.Vector3(hipW.x, hipW.y, -hipW.z);
                        var lHandMP = new THREE.Vector3(lWrist.x, lWrist.y, -lWrist.z);
                        var rHandMP = new THREE.Vector3(rWrist.x, rWrist.y, -rWrist.z);
                        var lOffset = lHandMP.clone().sub(hipMP);
                        var rOffset = rHandMP.clone().sub(hipMP);
                        var playerPos = game.playerModel.position;
                        var lHandWorld = playerPos.clone().add(lOffset);
                        var rHandWorld = playerPos.clone().add(rOffset);
                        var ballPos = new THREE.Vector3(game.basketballBody.position.x, game.basketballBody.position.y, game.basketballBody.position.z);

                        var distL = lHandWorld.distanceTo(ballPos);
                        var distR = rHandWorld.distanceTo(ballPos);
                        var pickupDist = isBending ? 1.5 : 0.8; // 弯腰时放宽拾取距离

                        if ((distL < pickupDist || distR < pickupDist) && !game.ballAttached && !game.defenderHoldingBall) {
                            game.basketballHandler.attachBall(game);
                        }
                    }
                }
            }
        } else { if (game.mixer) game.mixer.update(delta); }
    }
}

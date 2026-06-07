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

        // 断层二已修复：使用严格尾缀全等匹配 (endsWith)
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
        game.videoElement = document.getElementById('cam-video');
        if (!game.videoElement) {
            game.videoElement = document.createElement('video');
            game.videoElement.id = 'cam-video';
            game.videoElement.setAttribute('playsinline', '');
            game.videoElement.setAttribute('autoplay', '');
            game.videoElement.setAttribute('muted', '');
            game.videoElement.style.display = 'none';
            document.body.appendChild(game.videoElement);
            console.log("[DOM SAFETY] 已自动补全隐藏的摄像头视频载体标签");
        }

        const camCanvas = document.getElementById('cam-canvas');
        const camCtx = camCanvas ? camCanvas.getContext('2d') : null;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, frameRate: 30 }
            });
            game.videoElement.srcObject = stream;
            await game.videoElement.play();
            game.cameraStream = stream;
        } catch (err) {
            console.warn("无法调用摄像头，体感驱动已禁用:", err);
            return;
        }

        const Pose = window.Pose;
        if (!Pose) {
            console.warn("MediaPipe Pose 未加载，体感驱动已禁用");
            return;
        }

        const pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });

        pose.onResults((results) => {
            if (results.poseLandmarks && results.poseWorldLandmarks) {
                game.lastPoseData = results.poseLandmarks;
                game.lastPoseWorldData = results.poseWorldLandmarks;

                if (camCtx && camCanvas) {
                    camCanvas.width = game.videoElement.videoWidth || 200;
                    camCanvas.height = game.videoElement.videoHeight || 150;
                    camCtx.clearRect(0, 0, camCanvas.width, camCanvas.height);

                    results.poseLandmarks.forEach((landmark, index) => {
                        const x = landmark.x * camCanvas.width;
                        const y = landmark.y * camCanvas.height;
                        const isLegData = index >= 23 && index <= 28;
                        const isHandData = index >= 15 && index <= 22;

                        camCtx.beginPath();
                        camCtx.arc(x, y, isHandData ? 6 : (isLegData ? 5 : 3), 0, 2 * Math.PI);
                        camCtx.fillStyle = isHandData ? '#FF3333' : (isLegData ? '#33FF33' : '#00FF00');
                        camCtx.fill();

                        if (isHandData || isLegData) {
                            camCtx.lineWidth = 2;
                            camCtx.strokeStyle = isHandData ? '#FFFF00' : '#00FFFF';
                            camCtx.stroke();
                        }
                    });
                }
            }
        });

        game.poseDetector = pose;

        const onVideoFrame = async () => {
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
            game.videoElement.requestVideoFrameCallback(onVideoFrame);
        } else {
            onVideoFrame();
        }

        console.log("实时体感检测流初始化成功");
    }

    updatePose(game, delta) {
        const isTrackingActive = game.lastPoseWorldData && game.lastPoseData &&
            game.originalPlayerModel && typeof Kalidokit !== 'undefined';

        if (isTrackingActive) {
            // 断层二修复：使用严格尾缀匹配建立骨骼缓存
            if (!game.cachedBones) {
                game.cachedBones = {};
                game.initialQuats = {};

                game.originalPlayerModel.traverse((child) => {
                    if (child.isBone) {
                        const nameStr = child.name.toLowerCase();
                        for (const [vrmName, suffix] of Object.entries(game.boneSuffixes)) {
                            if (nameStr.endsWith(suffix)) {
                                game.cachedBones[vrmName] = child;
                                game.initialQuats[vrmName] = child.quaternion.clone();
                                // 断层三修复：保存 Hips 原始位置作为锚点
                                if (vrmName === 'Hips') {
                                    game.initialHipsPos = child.position.clone();
                                }
                                break;
                            }
                        }
                    }
                });
                console.log('%c[TELEMETRY] 严格尾缀骨骼映射缓存建立成功！绑定结果:',
                    'color: #00FF00; font-weight: bold;', game.cachedBones);
            }

            let riggedPose = null;
            try {
                riggedPose = Kalidokit.Pose.solve(game.lastPoseWorldData, game.lastPoseData, {
                    runtime: 'mediapipe',
                    video: game.videoElement
                });
            } catch (solverError) {
                console.error('[SOLVER ERROR] Kalidokit 解算器执行中断:', solverError);
            }

            if (riggedPose) {
                // 骨骼旋转应用（断层一 + 断层四修复）
                for (const [vrmName, bone] of Object.entries(game.cachedBones)) {
                    let posePart = riggedPose[vrmName];
                    if (!posePart) {
                        const actualKey = Object.keys(riggedPose).find(
                            k => k.toLowerCase() === vrmName.toLowerCase()
                        );
                        if (actualKey) posePart = riggedPose[actualKey];
                    }
                    if (!posePart) continue;

                    // 断层一修复：Hips 有嵌套 .rotation，其他关节直接用 posePart
                    const rot = (vrmName === 'Hips') ? posePart.rotation : posePart;
                    if (!rot || typeof rot.x !== 'number') continue;

                    // 断层三修复：Hips 旋转也不覆写（与位置锁定配合）
                    if (vrmName === 'Hips') continue;

                    // 断层四修复：轴向重定向
                    // Kalidokit 解算基于 VRM 人形标准，Mixamo 骨骼局部 Y 轴沿骨长方向
                    let eulerX = rot.x;
                    let eulerY = -rot.y;
                    let eulerZ = -rot.z;

                    // 四肢骨骼（手臂 + 手掌 + 腿部）Z 轴不取反
                    if (vrmName.includes('Arm') || vrmName.includes('Hand') || vrmName.includes('Leg')) {
                        eulerZ = rot.z;
                    }

                    const kalidoQuat = new THREE.Quaternion().setFromEuler(
                        new THREE.Euler(eulerX, eulerY, eulerZ, 'XYZ')
                    );
                    const targetQuat = game.initialQuats[vrmName].clone().multiply(kalidoQuat);
                    bone.quaternion.slerp(targetQuat, 0.6);
                }

                // 断层三修复：锁定 Hips 根骨骼位置为初始锚点
                // 空间位移全盘由 Cannon.js 物理刚体负责，体感数据不得覆写
                if (game.cachedBones.Hips && game.initialHipsPos) {
                    game.cachedBones.Hips.position.copy(game.initialHipsPos);
                }

                // 步行检测：通过膝盖交替抬升推算移动方向
                if (game.lastPoseData && game.playerBody && !game.isSprinting) {
                    const lm = game.lastPoseData;
                    const lKnee = lm[25], rKnee = lm[26];
                    const lHip = lm[23], rHip = lm[24];
                    const lShoulder = lm[11], rShoulder = lm[12];

                    if (lKnee && rKnee && lHip && rHip && lShoulder && rShoulder) {
                        const hipAvgY = (lHip.y + rHip.y) / 2;
                        const lLift = hipAvgY - lKnee.y;
                        const rLift = hipAvgY - rKnee.y;
                        const liftDiff = lLift - rLift;

                        if (!game._walkState) {
                            game._walkState = { prevSign: 0, moveX: 0, moveZ: 0, activeTimer: 0 };
                        }
                        const ws = game._walkState;

                        const currentSign = Math.sign(liftDiff);
                        if (currentSign !== 0 && currentSign !== ws.prevSign && Math.abs(liftDiff) > 0.012) {
                            ws.activeTimer = 0.45;

                            const shDx = rShoulder.x - lShoulder.x;
                            const shDy = rShoulder.y - lShoulder.y;
                            const shLen = Math.sqrt(shDx * shDx + shDy * shDy);
                            if (shLen > 0.01) {
                                ws.moveX = -shDy / shLen;
                                ws.moveZ = shDx / shLen;
                            }
                        }
                        ws.prevSign = currentSign;

                        if (ws.activeTimer > 0) {
                            ws.activeTimer -= delta;
                            const speed = game.moveSpeed * 0.85;
                            const targetVx = ws.moveX * speed;
                            const targetVz = ws.moveZ * speed;
                            game.playerBody.velocity.x += (targetVx - game.playerBody.velocity.x) * 0.35;
                            game.playerBody.velocity.z += (targetVz - game.playerBody.velocity.z) * 0.35;
                        }
                    }
                }
            }
        } else {
            // 无体感数据时使用默认动画混合器
            if (game.mixer) {
                game.mixer.update(delta);
            }
        }
    }
}

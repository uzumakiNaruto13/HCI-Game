// ====================================================================
// MediaPipeManager.js — 全局体感管理器（订阅/退订模式）
// 整个应用只有一个 video + 一个 Pose 实例，各场景通过 subscribe 获取数据
// ====================================================================

class MediaPipeManager {
    constructor() {
        // 处理用的隐藏 video（给 MediaPipe 喂帧）
        this.videoElement = document.createElement('video');
        this.videoElement.setAttribute('playsinline', '');
        this.videoElement.setAttribute('autoplay', '');
        this.videoElement.setAttribute('muted', '');
        this.videoElement.style.display = 'none';
        document.body.appendChild(this.videoElement);

        // 显示用的 video — 延迟到 initCamera 再查找（确保 DOM 已就绪）
        this.displayVideo = null;

        this.listeners = [];
        this.isReady = false;
        this.stream = null;

        this.initCamera();
    }

    async initCamera() {
        // 延迟查找显示 video（此时 DOM 已完整加载）
        this.displayVideo = document.getElementById('cam-video');
        if (!this.displayVideo) {
            console.warn('[MediaPipeManager] #cam-video 不存在，创建 fallback');
            this.displayVideo = document.createElement('video');
            this.displayVideo.id = 'cam-video';
            this.displayVideo.setAttribute('playsinline', '');
            this.displayVideo.setAttribute('autoplay', '');
            this.displayVideo.setAttribute('muted', '');
            document.body.appendChild(this.displayVideo);
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, frameRate: 30 }
            });
            // 喂给两个 video：隐藏的给 MediaPipe 处理，显示的给面板看
            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();
            this.displayVideo.srcObject = this.stream;
            await this.displayVideo.play();
            console.log('[MediaPipeManager] 摄像头已启动, displayVideo:', this.displayVideo.id, 'panel内:', !!this.displayVideo.closest('#cam-preview-hud'));
        } catch (err) {
            console.warn('[MediaPipeManager] 摄像头不可用:', err.message);
            return;
        }

        this.initPose();
    }

    initPose() {
        if (typeof Pose === 'undefined') {
            console.warn('[MediaPipeManager] MediaPipe Pose 未加载');
            return;
        }

        this.pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });

        // 全局唯一的原生回调 — 广播给订阅者 + 永久绘制关键点
        var self = this;
        this.pose.onResults((results) => {
            if (!results.poseLandmarks) return;

            // 核心修正：X 轴去镜像（Selfie Mode 反转）
            // MediaPipe 输出 0.0=画面最左, 1.0=画面最右
            // 前置摄像头是镜像的，必须翻转 X 才能让左右手和骨骼方向正确
            for (let i = 0; i < results.poseLandmarks.length; i++) {
                results.poseLandmarks[i].x = 1.0 - results.poseLandmarks[i].x;
            }

            // 1. 永久绘制关键点到 LIVE TRACKING canvas
            var canvas = document.getElementById('cam-canvas');
            if (canvas && self.displayVideo) {
                var ctx = canvas.getContext('2d');
                var vw = self.displayVideo.videoWidth || 320;
                var vh = self.displayVideo.videoHeight || 240;
                if (canvas.width !== vw) canvas.width = vw;
                if (canvas.height !== vh) canvas.height = vh;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // 绘制骨骼连接线
                var connections = [
                    [11,12], [11,13], [13,15], [12,14], [14,16], // 上半身
                    [11,23], [12,24], [23,24], // 躯干
                    [23,25], [25,27], [24,26], [26,28] // 下半身
                ];
                ctx.strokeStyle = '#00FFFF';
                ctx.lineWidth = 2;
                connections.forEach(function(conn) {
                    var from = results.poseLandmarks[conn[0]];
                    var to = results.poseLandmarks[conn[1]];
                    if (from && to) {
                        ctx.beginPath();
                        ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
                        ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
                        ctx.stroke();
                    }
                });

                // 绘制关键点
                results.poseLandmarks.forEach(function (lm, i) {
                    var x = lm.x * canvas.width, y = lm.y * canvas.height;
                    var isLeg = i >= 23 && i <= 32, isHand = i >= 15 && i <= 22;
                    ctx.beginPath(); ctx.arc(x, y, isHand ? 5 : (isLeg ? 4 : 2.5), 0, 2 * Math.PI);
                    ctx.fillStyle = isHand ? '#FF3333' : (isLeg ? '#33FF33' : '#00FF00'); ctx.fill();
                    if (isHand || isLeg) { ctx.lineWidth = 2; ctx.strokeStyle = isHand ? '#FFFF00' : '#00FFFF'; ctx.stroke(); }
                });
            }

            // 2. 广播给所有外部订阅者（数据已去镜像）
            self.listeners.forEach(callback => {
                if (typeof callback === 'function') {
                    callback(results);
                }
            });
        });

        // 使用 Camera 工具类驱动帧循环（更稳定）
        if (typeof Camera !== 'undefined') {
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    await this.pose.send({ image: this.videoElement });
                },
                width: 640,
                height: 480
            });
            this.camera.start().then(() => {
                this.isReady = true;
                console.log('[MediaPipeManager] 体感就绪');
            });
        } else {
            // fallback：手动帧循环
            const processFrame = async () => {
                if (this.videoElement.readyState >= 2) {
                    await this.pose.send({ image: this.videoElement });
                }
                requestAnimationFrame(processFrame);
            };
            processFrame();
            this.isReady = true;
            console.log('[MediaPipeManager] 体感就绪 (fallback 帧循环)');
        }
    }

    // ---- 对外接口 ----

    /** 订阅姿态数据。callback 接收 { poseLandmarks, poseWorldLandmarks } */
    subscribe(callback) {
        if (!this.listeners.includes(callback)) {
            this.listeners.push(callback);
            console.log('[MediaPipeManager] 订阅者 +1, 当前:', this.listeners.length);
        }
    }

    /** 取消订阅（切场景时必须调用，防止内存泄漏） */
    unsubscribe(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
        console.log('[MediaPipeManager] 订阅者 -1, 当前:', this.listeners.length);
    }

    /** 获取摄像头流引用（供 canvas 预览等使用） */
    getStream() { return this.stream; }

    /** 获取 video 元素 */
    getVideoElement() { return this.videoElement; }
}

// 挂载到全局 — 整个应用唯一实例
window.mpManager = new MediaPipeManager();

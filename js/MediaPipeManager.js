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
        this.displayVideo = document.getElementById('cam-video');
        if (!this.displayVideo) {
            this.displayVideo = document.createElement('video');
            this.displayVideo.id = 'cam-video';
            this.displayVideo.setAttribute('playsinline', '');
            this.displayVideo.setAttribute('autoplay', '');
            this.displayVideo.setAttribute('muted', '');
            document.body.appendChild(this.displayVideo);
        }

        // === 主方案：外接 IP 摄像头 ===
        var ipCamUrl = 'http://10.160.169.210:8080';
        var ipSuccess = await this._tryIPCamera(ipCamUrl);
        if (ipSuccess) {
            console.log('[MediaPipeManager] ✅ 外接摄像头已连接');
            this.initPose();
            return;
        }

        // === 备选方案：本地电脑摄像头 ===
        console.log('[MediaPipeManager] 外接摄像头不可用，fallback 到本地摄像头...');
        var localSuccess = await this._tryLocalCamera();
        if (localSuccess) {
            console.log('[MediaPipeManager] ✅ 本地摄像头已连接');
            this.initPose();
            return;
        }

        console.warn('[MediaPipeManager] ❌ 所有摄像头方案均失败');
    }

    async _tryIPCamera(url) {
        console.log('[MediaPipeManager] 尝试连接外接摄像头:', url);
        return new Promise((resolve) => {
            // 方案 A：video 直连 MJPEG 流
            var video = document.createElement('video');
            video.setAttribute('playsinline', '');
            video.setAttribute('autoplay', '');
            video.setAttribute('muted', '');
            video.crossOrigin = 'anonymous';
            video.src = url;

            var resolved = false;
            var done = function (ok) { if (!resolved) { resolved = true; resolve(ok); } };

            video.onloadedmetadata = function () {
                console.log('[MediaPipeManager] IP 摄像头 video 直连成功');
                this.videoElement.srcObject = null;
                // 用 canvas 桥接：定时抓 video 帧 → canvas → MediaPipe 处理
                this._setupIPCamBridge(video);
                done(true);
            }.bind(this);

            video.onerror = function () {
                console.log('[MediaPipeManager] video 直连失败，尝试 snapshot 轮询...');
                // 方案 B：snapshot 轮询
                this._trySnapshotPolling(url, done);
            }.bind(this);

            video.play().catch(function () {});
            // 超时：2 秒内连不上就走 snapshot
            setTimeout(function () { if (!resolved) video.onerror(); }, 2000);
        });
    }

    _setupIPCamBridge(sourceVideo) {
        // 隐藏 video 播 IP 流；MediaPipe 处理帧；display video 做镜像
        sourceVideo.style.display = 'none';
        document.body.appendChild(sourceVideo);
        this._ipSourceVideo = sourceVideo;
        this.videoElement = sourceVideo;
        this.displayVideo.srcObject = null;
        this.displayVideo.style.display = 'none'; // 隐藏原 video，改用 canvas 显示
        this._useIPCamCanvas = true;
    }

    _trySnapshotPolling(url, done) {
        var canvas = document.createElement('canvas');
        canvas.width = 640; canvas.height = 480;
        var ctx = canvas.getContext('2d');
        var img = new Image();
        img.crossOrigin = 'anonymous';
        var attempts = 0;
        var self = this;

        // 尝试常见 snapshot 路径
        var paths = [url, url + '/shot.jpg', url + '/snapshot', url + '/photo.jpg', url + '/capture'];
        var pathIdx = 0;

        function tryNext() {
            if (pathIdx >= paths.length) { console.warn('[MediaPipeManager] 所有 snapshot 路径均失败'); done(false); return; }
            var p = paths[pathIdx];
            console.log('[MediaPipeManager] 尝试 snapshot:', p);
            img.onload = function () {
                console.log('[MediaPipeManager] ✅ snapshot 轮询成功:', p);
                ctx.drawImage(img, 0, 0, 640, 480);
                // 用 canvas 作为 video 替代：每 100ms 抓一帧
                self._ipSnapshotCanvas = canvas;
                self._ipSnapshotPath = p;
                self._ipSnapshotImg = img;
                self._useIPCamCanvas = true;
                // 伪装成 video：MediaPipe 可以从 canvas 获取帧
                // 我们需要修改帧循环让 MediaPipe 从 canvas 读取
                self.videoElement = { readyState: 2, videoWidth: 640, videoHeight: 480, width: 640, height: 480 };
                self._ipPolling = true;
                self._doSnapshotPoll();
                done(true);
            };
            img.onerror = function () { pathIdx++; tryNext(); };
            img.src = p;
        }
        tryNext();
    }

    _refreshPanel() {
        var canvas = document.getElementById('cam-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = 640, h = 480;
        canvas.width = w; canvas.height = h;
        ctx.clearRect(0, 0, w, h);

        // 画摄像头底图
        if (this._ipSnapshotCanvas) {
            ctx.drawImage(this._ipSnapshotCanvas, 0, 0, w, h);
        } else if (this.displayVideo && this.displayVideo.videoWidth) {
            ctx.save();
            ctx.translate(w, 0); ctx.scale(-1, 1);
            ctx.drawImage(this.displayVideo, 0, 0, w, h);
            ctx.restore();
        }

        // 画关键点（统一使用这个绘制方法）
        var landmarks = this._lastPoseLandmarks;
        if (landmarks) {
            landmarks.forEach(function (lm, i) {
                var x = lm.x * w, y = lm.y * h;
                var isLeg = i >= 23 && i <= 32, isHand = i >= 15 && i <= 22;
                ctx.beginPath(); ctx.arc(x, y, isHand ? 5 : (isLeg ? 4 : 2.5), 0, 2 * Math.PI);
                ctx.fillStyle = isHand ? '#FF3333' : (isLeg ? '#33FF33' : '#00FF00'); ctx.fill();
                if (isHand || isLeg) { ctx.lineWidth = 2; ctx.strokeStyle = isHand ? '#FFFF00' : '#00FFFF'; ctx.stroke(); }
            });
        }
    }

    _doSnapshotPoll() {
        if (!this._ipPolling) return;
        var self = this;
        var img = this._ipSnapshotImg;
        img.src = this._ipSnapshotPath + '?t=' + Date.now();
        img.onload = function () {
            self._ipSnapshotCanvas.getContext('2d').drawImage(img, 0, 0, 640, 480);
            self._refreshPanel();
            setTimeout(function () { self._doSnapshotPoll(); }, 100);
        };
    }

    async _tryLocalCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, frameRate: 30 }
            });
            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();
            this.displayVideo.srcObject = this.stream;
            await this.displayVideo.play();
            return true;
        } catch (err) {
            console.warn('[MediaPipeManager] 本地摄像头不可用:', err.message);
            return false;
        }
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
            minTrackingConfidence: 0.6,
            selfieMode: true  // 前置自拍镜头，底层数据自动左右翻转
        });

          // 全局唯一的原生回调 — 广播给订阅者 + 刷新显示
        var self = this;
        this.pose.onResults((results) => {
            if (!results.poseLandmarks) return;

            // 核心修正：X 轴去镜像（Selfie Mode 反转）
            // MediaPipe 输出 0.0=画面最左, 1.0=画面最右
            // 前置摄像头是镜像的，必须翻转 X 才能让左右手和骨骼方向正确
            for (let i = 0; i < results.poseLandmarks.length; i++) {
                results.poseLandmarks[i].x = 1.0 - results.poseLandmarks[i].x;
            }

            self._lastPoseLandmarks = results.poseLandmarks;
            // 本地摄像头模式：更新 canvas
            if (!self._ipPolling) self._refreshPanel();
            // 广播原始数据给所有外部订阅者
            self.listeners.forEach(callback => { if (typeof callback === 'function') callback(results); });
        });

        // 帧循环：IP 摄像头用 polling canvas，本地摄像头用 Camera 工具类
        var self = this;
        if (this._ipPolling) {
            // IP 摄像头 snapshot 模式：从 canvas 喂帧给 MediaPipe
            var ipProcess = async function () {
                if (self._ipSnapshotCanvas) {
                    await self.pose.send({ image: self._ipSnapshotCanvas });
                }
                requestAnimationFrame(ipProcess);
            };
            ipProcess();
            this.isReady = true;
            console.log('[MediaPipeManager] 体感就绪 (IP 摄像头轮询)');
        } else if (typeof Camera !== 'undefined' && this.videoElement.readyState !== undefined) {
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => { await this.pose.send({ image: this.videoElement }); },
                width: 640, height: 480
            });
            this.camera.start().then(() => { this.isReady = true; console.log('[MediaPipeManager] 体感就绪'); });
        } else {
            var processFrame = async function () {
                if (self.videoElement.readyState >= 2) { await self.pose.send({ image: self.videoElement }); }
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

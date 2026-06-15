// ====================================================================
// MediaPipeManager.js — 全局体感管理器
// 单例 Pose + 本地摄像头 + 订阅/退订模式
// ====================================================================

// 手机陀螺仪 WebSocket 客户端
window._phoneIMU = { beta: 0, gamma: 0, alpha: 0, ts: 0 };
(function connectPhoneIMU() {
    try {
        var ws = new WebSocket('ws://' + window.location.hostname + ':8080');
        ws.onmessage = function (e) {
            var d = JSON.parse(e.data);
            if (d.type === 'leg_imu') window._phoneIMU = d;
        };
        ws.onclose = function () { setTimeout(connectPhoneIMU, 3000); };
        ws.onerror = function () {};
    } catch (e) {}
})();

class MediaPipeManager {
    constructor() {
        // 隐藏 video（MediaPipe 处理用）
        this.videoElement = document.createElement('video');
        this.videoElement.setAttribute('playsinline', '');
        this.videoElement.setAttribute('autoplay', '');
        this.videoElement.setAttribute('muted', '');
        this.videoElement.style.display = 'none';
        document.body.appendChild(this.videoElement);

        this.displayVideo = null;
        this.listeners = [];
        this.isReady = false;
        this.stream = null;
        this._dualMode = false;
        this._lastPoseLandmarks = null;

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

        var ok = await this._tryLocalCamera();
        if (ok) { console.log('[MediaPipeManager] 本地摄像头已连接'); this.initPose(); }
        else { console.warn('[MediaPipeManager] 本地摄像头不可用'); }
    }

    async _tryLocalCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, frameRate: 30 } });
            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();
            this.displayVideo.srcObject = this.stream;
            await this.displayVideo.play();
            return true;
        } catch (e) { console.warn('[MediaPipeManager] 摄像头错误:', e.message); return false; }
    }

    initPose() {
        if (typeof Pose === 'undefined') { console.warn('[MediaPipeManager] Pose 未加载'); return; }

        var self = this;
        this.pose = new Pose({ locateFile: function (f) { return 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/' + f; } });
        this.pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6, selfieMode: true });

        this.pose.onResults(function (results) {
            if (!results.poseLandmarks) return;
            self._lastPoseLandmarks = results.poseLandmarks;
            self._refreshPanel();
            self.listeners.forEach(function (cb) { if (typeof cb === 'function') cb(results); });
        });

        if (typeof Camera !== 'undefined' && this.videoElement.readyState !== undefined) {
            this.camera = new Camera(this.videoElement, {
                onFrame: async function () { await self.pose.send({ image: self.videoElement }); },
                width: 640, height: 480
            });
            this.camera.start().then(function () { self.isReady = true; });
        } else {
            var loop = async function () {
                if (self.videoElement.readyState >= 2) await self.pose.send({ image: self.videoElement });
                requestAnimationFrame(loop);
            };
            loop();
            this.isReady = true;
        }
    }

    _refreshPanel() {
        // ---- 本地摄像头面板 ----
        var canvas = document.getElementById('cam-canvas');
        if (canvas) {
            var ctx = canvas.getContext('2d');
            var w = 640, h = 480;
            canvas.width = w; canvas.height = h;
            ctx.clearRect(0, 0, w, h);

            if (this.displayVideo && this.displayVideo.videoWidth) {
                ctx.save(); ctx.translate(w, 0); ctx.scale(-1, 1);
                ctx.drawImage(this.displayVideo, 0, 0, w, h);
                ctx.restore();
            }

            if (this._lastPoseLandmarks) {
                var lm = this._lastPoseLandmarks;
                var BONES = [[11,12],[11,23],[12,24],[23,24],[12,14],[14,16],[11,13],[13,15],[24,26],[26,28],[23,25],[25,27],[0,11],[0,12]];
                ctx.strokeStyle = '#00FF00'; ctx.lineWidth = 2;
                BONES.forEach(function (b) {
                    var a = lm[b[0]], bb = lm[b[1]];
                    if (a && bb && a.visibility > 0.4 && bb.visibility > 0.4) {
                        ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(bb.x * w, bb.y * h); ctx.stroke();
                    }
                });
                lm.forEach(function (p, i) {
                    if (p.visibility < 0.4) return;
                    var x = p.x * w, y = p.y * h;
                    var isLeg = i >= 23, isHand = i >= 15 && i <= 22;
                    ctx.beginPath(); ctx.arc(x, y, isHand ? 5 : (isLeg ? 4 : 2.5), 0, 2 * Math.PI);
                    ctx.fillStyle = isHand ? '#FF3333' : (isLeg ? '#33FF33' : '#00FF00'); ctx.fill();
                    if (isHand || isLeg) { ctx.lineWidth = 2; ctx.strokeStyle = isHand ? '#FFFF00' : '#00FFFF'; ctx.stroke(); }
                });
            }
        }

        // ---- 侧摄像头面板 ----
        var sideCanvas = document.getElementById('cam-canvas-side');
        if (sideCanvas) { sideCanvas.style.display = this._dualMode ? 'block' : 'none'; }
    }

    subscribe(cb) { if (!this.listeners.includes(cb)) { this.listeners.push(cb); } }
    unsubscribe(cb) { this.listeners = this.listeners.filter(function (x) { return x !== cb; }); }
    getStream() { return this.stream; }
    getVideoElement() { return this.videoElement; }
}

window.mpManager = new MediaPipeManager();

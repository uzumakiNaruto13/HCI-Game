// ====================================================================
// MediaPipeManager.js — 全局体感管理器
// 核心职责：摄像头 → MediaPipe Pose → 骨架绘制 → 广播数据
// 设计原则：简单可靠，不依赖任何可选模块
// ====================================================================

class MediaPipeManager {
    constructor() {
        // 隐藏的处理用 video
        this.videoElement = document.createElement('video');
        this.videoElement.setAttribute('playsinline', '');
        this.videoElement.setAttribute('autoplay', '');
        this.videoElement.setAttribute('muted', '');
        this.videoElement.style.display = 'none';
        document.body.appendChild(this.videoElement);

        // 显示用的 video
        this.displayVideo = null;

        this.listeners = [];
        this.isReady = false;
        this.stream = null;
        this.pose = null;

        // 摄像头列表
        this.availableCameras = [];
        this.currentDeviceId = null;

        // 骨架平滑缓存
        this._smoothedLandmarks = null;
        this._smoothFactor = 0.4;

        this.initCamera();
    }

    // =================================================================
    //  摄像头初始化（优先手机 IP 摄像头，回退到本地摄像头）
    // =================================================================
    async initCamera() {
        console.log('[MP] ===== 初始化摄像头 =====');

        this.displayVideo = document.getElementById('cam-video');

        // 第 1 步：尝试连接手机 IP 摄像头
        var ipUrl = this._getIPCamUrl();
        if (ipUrl) {
            console.log('[MP] 尝试手机摄像头:', ipUrl);
            var ipOk = await this._connectIPCamera(ipUrl);
            if (ipOk) {
                console.log('[MP] ✅ 手机摄像头已连接');
                await this._enumCameras();
                this._buildSelectUI();
                await this._initPose();
                return;
            }
            console.warn('[MP] 手机摄像头不可用，回退到本地摄像头');
        }

        // 第 2 步：连接本地电脑摄像头
        var ok = await this._connectLocalCamera();
        if (!ok) {
            console.warn('[MP] ❌ 所有摄像头均失败');
            this._updateStatus('❌ 无摄像头', '#FF4444');
            return;
        }

        // 第 3 步：枚举摄像头
        await this._enumCameras();
        this._buildSelectUI();

        // 第 4 步：启动姿态检测
        await this._initPose();
    }

    // =================================================================
    //  获取手机 IP 摄像头地址
    // =================================================================
    _getIPCamUrl() {
        // 优先从 URL 参数读取：?cam=http://10.124.128.46:8080
        var params = new URLSearchParams(window.location.search);
        var urlParam = params.get('cam') || params.get('camera');
        if (urlParam) {
            localStorage.setItem('ipCamUrl', urlParam);
            return urlParam;
        }
        // 其次从 localStorage 读取
        return localStorage.getItem('ipCamUrl') || null;
    }

    // =================================================================
    //  连接手机 IP 摄像头（尝试多种 URL 格式）
    // =================================================================
    async _connectIPCamera(baseUrl) {
        this._updateStatus('⏳ 连接手机摄像头...', '#FF8800');

        // 尝试多种 URL 格式（不同 app 的路径不同）
        var urls = [
            baseUrl,                          // http://10.x.x.x:8080
            baseUrl.replace(/\/$/, '') + '/video',   // MJPEG 流
            baseUrl.replace(/\/$/, '') + '/mjpeg',   // 另一种 MJPEG 路径
        ];

        // 方案 1：尝试 video 元素直连 MJPEG 流
        for (var i = 0; i < urls.length; i++) {
            console.log('[MP] 尝试 video 直连:', urls[i]);
            var ok = await this._tryVideoConnect(urls[i]);
            if (ok) return true;
        }

        // 方案 2：尝试 snapshot 轮询模式
        console.log('[MP] video 直连均失败，尝试 snapshot 模式...');
        return await this._connectIPCameraSnapshot(baseUrl);
    }

    _tryVideoConnect(url) {
        var self = this;
        return new Promise(function (resolve) {
            var video = document.createElement('video');
            video.setAttribute('playsinline', '');
            video.setAttribute('autoplay', '');
            video.setAttribute('muted', '');
            video.crossOrigin = 'anonymous';
            video.style.display = 'none';
            document.body.appendChild(video);

            var done = false;
            function finish(result) {
                if (done) return;
                done = true;
                if (!result) video.remove();
                resolve(result);
            }

            video.onloadedmetadata = function () {
                console.log('[MP] ✅ video 直连成功:', url, video.videoWidth + 'x' + video.videoHeight);
                self._ipVideo = video;
                self.videoElement = video;
                self._isIPCamera = true;
                self._updateStatus('📱 手机摄像头', '#00FF00');
                finish(true);
            };

            video.onerror = function (e) {
                console.log('[MP] video 直连失败:', url);
                finish(false);
            };

            video.src = url;
            video.play().catch(function () {});
            setTimeout(function () { finish(false); }, 3000);
        });
    }

    // =================================================================
    //  IP 摄像头 snapshot 轮询模式
    // =================================================================
    async _connectIPCameraSnapshot(baseUrl) {
        var base = baseUrl.replace(/\/$/, '');
        var paths = [
            base + '/shot.jpg',
            base + '/photo.jpg',
            base + '/snapshot',
            base + '/capture',
            base + '/image',
            base + '/img.jpg',
        ];
        for (var i = 0; i < paths.length; i++) {
            console.log('[MP] 尝试 snapshot:', paths[i]);
            var ok = await this._trySnapshot(paths[i]);
            if (ok) {
                console.log('[MP] ✅ snapshot 成功:', paths[i]);
                this._isIPCamera = true;
                this._isSnapshotMode = true;
                this._snapshotPath = paths[i];
                this._updateStatus('📱 手机摄像头 (snapshot)', '#00FF00');
                return true;
            }
        }
        console.warn('[MP] 所有 snapshot 路径均失败');
        return false;
    }

    _trySnapshot(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.onload = function () { resolve(true); };
            img.onerror = function () { resolve(false); };
            img.src = url + '?t=' + Date.now();
            setTimeout(function () { resolve(false); }, 2000);
        });
    }

    // =================================================================
    //  连接本地电脑摄像头
    // =================================================================
    async _connectLocalCamera() {
        try {
            console.log('[MP] 请求本地摄像头权限...');
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
                audio: false
            });

            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();

            if (this.displayVideo) {
                this.displayVideo.srcObject = this.stream;
                await this.displayVideo.play();
            }

            var track = this.stream.getVideoTracks()[0];
            if (track) {
                var s = track.getSettings();
                this.currentDeviceId = s.deviceId;
                console.log('[MP] ✅ 本地摄像头:', track.label, s.width + 'x' + s.height, s.frameRate + 'fps');
            }

            this._updateStatus('📷 已连接', '#00FF00');
            return true;
        } catch (e) {
            console.warn('[MP] 本地摄像头失败:', e.name, e.message);
            this._updateStatus('❌ ' + e.message, '#FF4444');
            return false;
        }
    }

    // =================================================================
    //  枚举摄像头
    // =================================================================
    async _enumCameras() {
        try {
            var devices = await navigator.mediaDevices.enumerateDevices();
            this.availableCameras = devices.filter(function (d) { return d.kind === 'videoinput'; });
            console.log('[MP] 发现', this.availableCameras.length, '个摄像头');
        } catch (e) {
            this.availableCameras = [];
        }
    }

    // =================================================================
    //  摄像头选择 UI（包含手机 IP 摄像头输入框）
    // =================================================================
    _buildSelectUI() {
        var hud = document.getElementById('cam-preview-hud');
        if (!hud || document.getElementById('cam-info-bar')) return;

        var header = hud.querySelector('.cam-header');
        if (!header) return;

        var bar = document.createElement('div');
        bar.id = 'cam-info-bar';
        var self = this;

        // 第一行：摄像头数量 + 状态
        var row1 = document.createElement('div');
        row1.style.cssText = 'display:flex;align-items:center;gap:6px;';

        var label = document.createElement('span');
        label.id = 'cam-count-label';
        label.textContent = '📷 ' + this.availableCameras.length + ' 个摄像头';
        row1.appendChild(label);

        // 本地摄像头下拉（始终显示，方便切换 Iriun 等虚拟摄像头）
        if (this.availableCameras.length > 0 && !this._isIPCamera) {
            var sel = document.createElement('select');
            sel.id = 'cam-select';
            this.availableCameras.forEach(function (cam, i) {
                var opt = document.createElement('option');
                opt.value = cam.deviceId;
                opt.textContent = cam.label || ('摄像头 ' + (i + 1));
                sel.appendChild(opt);
            });
            if (this.currentDeviceId) sel.value = this.currentDeviceId;
            sel.addEventListener('change', function () { self._switchCam(sel.value); });
            row1.appendChild(sel);
        }

        var dot = document.createElement('span');
        dot.id = 'cam-status-dot';
        row1.appendChild(dot);
        bar.appendChild(row1);

        // 第二行：手机 IP 摄像头输入
        var row2 = document.createElement('div');
        row2.style.cssText = 'display:flex;align-items:center;gap:4px;margin-top:4px;';

        var ipLabel = document.createElement('span');
        ipLabel.textContent = '📱';
        ipLabel.style.cssText = 'font-size:11px;';
        row2.appendChild(ipLabel);

        var ipInput = document.createElement('input');
        ipInput.type = 'text';
        ipInput.id = 'cam-ip-input';
        ipInput.placeholder = '手机摄像头地址 (如 http://10.x.x.x:8080)';
        ipInput.value = localStorage.getItem('ipCamUrl') || '';
        ipInput.style.cssText = 'flex:1;background:#1a1a3e;color:#e0e0e0;border:1px solid #4a4a8a;border-radius:3px;padding:2px 6px;font-size:11px;min-width:0;';
        row2.appendChild(ipInput);

        var ipBtn = document.createElement('button');
        ipBtn.textContent = '连接';
        ipBtn.id = 'cam-ip-btn';
        ipBtn.style.cssText = 'background:#2a4a2a;color:#88ff88;border:1px solid #4a8a4a;border-radius:3px;padding:2px 8px;font-size:11px;cursor:pointer;white-space:nowrap;';
        ipBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var url = ipInput.value.trim();
            if (!url) { ipInput.style.borderColor = '#ff4444'; return; }
            if (!url.startsWith('http')) url = 'http://' + url;
            ipInput.style.borderColor = '#4a8a4a';
            ipBtn.textContent = '...';
            ipBtn.disabled = true;
            console.log('[MP] 保存手机摄像头地址:', url);
            localStorage.setItem('ipCamUrl', url);
            self._tryConnectIPNow(url, ipBtn, label);
        });
        row2.appendChild(ipBtn);

        // 清除按钮
        var clearBtn = document.createElement('button');
        clearBtn.textContent = '清除';
        clearBtn.title = '清除保存的 IP 地址';
        clearBtn.style.cssText = 'background:#3a2a2a;color:#ff8888;border:1px solid #8a4a4a;border-radius:3px;padding:2px 6px;font-size:11px;cursor:pointer;';
        clearBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            localStorage.removeItem('ipCamUrl');
            ipInput.value = '';
            console.log('[MP] 已清除 IP 摄像头地址');
        });
        row2.appendChild(clearBtn);

        bar.appendChild(row2);

        header.parentNode.insertBefore(bar, header.nextSibling);
    }

    // =================================================================
    //  直接连接手机 IP 摄像头（不刷新页面）
    // =================================================================
    async _tryConnectIPNow(url, btn, labelEl) {
        var self = this;
        btn.textContent = '连接中...';
        this._updateStatus('⏳ 连接 ' + url, '#FF8800');
        console.log('[MP] 正在连接手机摄像头:', url);

        // 停止当前摄像头
        if (this.stream) {
            this.stream.getTracks().forEach(function (t) { t.stop(); });
            this.stream = null;
        }

        var ok = await this._connectIPCamera(url);

        if (ok) {
            btn.textContent = '✅';
            btn.style.background = '#1a4a1a';
            labelEl.textContent = '📱 手机摄像头已连接';
            this._updateStatus('📱 手机摄像头', '#00FF00');
            this._smoothedLandmarks = null;

            // 重新初始化 Pose（如果还没初始化）
            if (!this.isReady) {
                await this._initPose();
            } else {
                // Pose 已存在，只需要更新 videoElement 指向
                console.log('[MP] Pose 已存在，已切换到手机摄像头');
            }
        } else {
            btn.textContent = '重试';
            btn.disabled = false;
            btn.style.background = '#4a2a2a';
            btn.style.color = '#ff8888';
            btn.style.borderColor = '#8a4a4a';
            this._updateStatus('❌ 连接失败', '#FF4444');
            console.warn('[MP] 手机摄像头连接失败，请检查：');
            console.warn('  1. 手机和电脑在同一 WiFi');
            console.warn('  2. 手机摄像头 app 已开启');
            console.warn('  3. 地址正确:', url);
        }
    }

    _updateStatus(text, color) {
        var dot = document.getElementById('cam-status-dot');
        if (dot) dot.style.background = color || '#888';
        var lbl = document.getElementById('cam-count-label');
        if (lbl && text) lbl.textContent = text;
    }

    async _switchCam(deviceId) {
        this._updateStatus('⏳ 切换中...', '#FF8800');
        if (this.stream) this.stream.getTracks().forEach(function (t) { t.stop(); });
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false
            });
            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();
            if (this.displayVideo) { this.displayVideo.srcObject = this.stream; await this.displayVideo.play(); }
            this.currentDeviceId = deviceId;
            this._updateStatus('📷 ' + this.availableCameras.length + ' 个摄像头', '#00FF00');
            this._smoothedLandmarks = null;
            if (!this.isReady) await this._initPose();
        } catch (e) {
            this._updateStatus('❌ 切换失败', '#FF4444');
        }
    }

    // =================================================================
    //  姿态检测初始化（核心）
    // =================================================================
    async _initPose() {
        if (typeof Pose === 'undefined') {
            console.warn('[MP] MediaPipe Pose 未加载');
            return;
        }

        console.log('[MP] 初始化 MediaPipe Pose...');

        // 等待 video 有有效画面（videoWidth > 0）
        var self = this;
        var waitCount = 0;
        while (this.videoElement.videoWidth === 0 && waitCount < 50) {
            await new Promise(function (r) { setTimeout(r, 100); });
            waitCount++;
        }
        if (this.videoElement.videoWidth === 0) {
            console.warn('[MP] ⚠️ video 无画面，继续尝试...');
        } else {
            console.log('[MP] video 就绪:', this.videoElement.videoWidth + 'x' + this.videoElement.videoHeight);
        }

        this.pose = new Pose({
            locateFile: function (f) { return 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/' + f; }
        });

        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6,
            selfieMode: false   // 关闭镜像！让 landmark X 坐标与真实世界一致
        });

        // 结果回调
        this.pose.onResults(function (results) {
            self._onResults(results);
        });

        // 启动帧循环
        this._startFrameLoop();
    }

    // =================================================================
    //  帧循环（支持本地摄像头 / IP 摄像头 / snapshot 模式）
    // =================================================================
    _startFrameLoop() {
        var self = this;

        function hasValidFrame() {
            return self.videoElement.videoWidth > 0 && self.videoElement.videoHeight > 0;
        }

        // ---- snapshot 轮询模式（某些手机 app 只支持快照截图）----
        if (this._isSnapshotMode) {
            this._startSnapshotLoop();
            return;
        }

        // ---- IP 摄像头 MJPEG 流 或 本地摄像头 ----
        if (typeof Camera !== 'undefined') {
            this.camera = new Camera(this.videoElement, {
                onFrame: async function () {
                    if (self.pose && hasValidFrame()) {
                        try { await self.pose.send({ image: self.videoElement }); } catch (e) {}
                    }
                },
                width: 640, height: 480
            });
            this.camera.start().then(function () {
                self.isReady = true;
                console.log('[MP] ✅ 体感就绪 (Camera)');
            }).catch(function () {
                // Camera 工具失败，用手动循环
                self._startManualLoop();
            });
            return;
        }

        this._startManualLoop();
    }

    _startManualLoop() {
        var self = this;
        var loop = async function () {
            if (self.videoElement.readyState >= 2 && self.pose &&
                self.videoElement.videoWidth > 0) {
                try { await self.pose.send({ image: self.videoElement }); } catch (e) {}
            }
            requestAnimationFrame(loop);
        };
        loop();
        this.isReady = true;
        console.log('[MP] ✅ 体感就绪 (manual loop)');
    }

    // =================================================================
    //  snapshot 轮询模式（从手机 app 拉取快照图片）
    // =================================================================
    _startSnapshotLoop() {
        var self = this;
        var canvas = document.createElement('canvas');
        canvas.width = 640; canvas.height = 480;
        var ctx = canvas.getContext('2d');
        var img = new Image();
        img.crossOrigin = 'anonymous';

        // 使用已验证的 snapshot 路径
        var snapshotUrl = this._snapshotPath || (localStorage.getItem('ipCamUrl') || '').replace(/\/$/, '') + '/shot.jpg';

        this._snapshotCanvas = canvas;

        var poll = function () {
            img.onload = async function () {
                ctx.drawImage(img, 0, 0, 640, 480);
                if (self.pose) {
                    try { await self.pose.send({ image: canvas }); } catch (e) {}
                }
                // 更新显示
                if (self.displayVideo) {
                    self.displayVideo.srcObject = null;
                    self.displayVideo.style.display = 'none';
                }
                setTimeout(poll, 60); // ~15fps
            };
            img.onerror = function () {
                setTimeout(poll, 200); // 失败时降低频率
            };
            img.src = snapshotUrl + '?t=' + Date.now();
        };

        poll();
        this.isReady = true;
        console.log('[MP] ✅ 体感就绪 (snapshot:', snapshotUrl, ')');
    }

    // =================================================================
    //  结果处理 + 骨架绘制 + 广播（核心）
    // =================================================================
    _onResults(results) {
        if (!results.poseLandmarks) return;

        var landmarks = results.poseLandmarks;

        // ---- 轻量 EMA 平滑 ----
        landmarks = this._smoothLandmarks(landmarks);

        // ---- 绘制骨架（镜像版本，匹配镜像的视频画面）----
        var mirrored = this._mirrorLandmarks(landmarks);
        this._lastPoseLandmarks = mirrored;
        this._drawPanel(mirrored);

        // ---- 广播原始坐标给游戏（非镜像，用于游戏逻辑）----
        var data = {
            poseLandmarks: landmarks,                // 原始坐标（左=真实左）
            poseWorldLandmarks: results.poseWorldLandmarks || null
        };
        for (var i = 0; i < this.listeners.length; i++) {
            try { this.listeners[i](data); } catch (e) {}
        }
    }

    /**
     * 镜像 landmark X 坐标（用于骨架绘制，匹配镜像的视频）
     */
    _mirrorLandmarks(landmarks) {
        if (!this._mirroredBuffer || this._mirroredBuffer.length !== landmarks.length) {
            this._mirroredBuffer = landmarks.map(function () { return { x: 0, y: 0, z: 0, visibility: 0 }; });
        }
        for (var i = 0; i < landmarks.length; i++) {
            this._mirroredBuffer[i].x = 1 - landmarks[i].x;  // X 翻转
            this._mirroredBuffer[i].y = landmarks[i].y;
            this._mirroredBuffer[i].z = landmarks[i].z;
            this._mirroredBuffer[i].visibility = landmarks[i].visibility;
        }
        return this._mirroredBuffer;
    }

    // =================================================================
    //  骨架平滑（EMA）
    // =================================================================
    _smoothLandmarks(raw) {
        if (!this._smoothedLandmarks || this._smoothedLandmarks.length !== raw.length) {
            // 首帧：直接复制
            this._smoothedLandmarks = raw.map(function (lm) {
                return { x: lm.x, y: lm.y, z: lm.z, visibility: lm.visibility };
            });
            return this._smoothedLandmarks;
        }

        var s = this._smoothedLandmarks;
        var f = this._smoothFactor;
        for (var i = 0; i < raw.length; i++) {
            // 只平滑可见的关键点
            if (raw[i].visibility > 0.4) {
                s[i].x += (raw[i].x - s[i].x) * f;
                s[i].y += (raw[i].y - s[i].y) * f;
                s[i].z += (raw[i].z - s[i].z) * f;
                s[i].visibility = raw[i].visibility;
            }
        }
        return s;
    }

    // =================================================================
    //  骨架绘制（摄像头画面 + 骨骼连线 + 关节点）
    // =================================================================
    _drawPanel(landmarks) {
        var canvas = document.getElementById('cam-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = 640, h = 480;
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);

        // 画摄像头画面（镜像）
        if (this.displayVideo && this.displayVideo.videoWidth) {
            ctx.save();
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(this.displayVideo, 0, 0, w, h);
            ctx.restore();
        }

        if (!landmarks) return;

        // ---- 骨骼连线 ----
        var BONES = [
            [11, 12], [11, 23], [12, 24], [23, 24],   // 躯干
            [12, 14], [14, 16], [11, 13], [13, 15],   // 手臂
            [24, 26], [26, 28], [23, 25], [25, 27],   // 腿
            [0, 11], [0, 12]                           // 头→肩
        ];

        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        for (var b = 0; b < BONES.length; b++) {
            var a = landmarks[BONES[b][0]];
            var c = landmarks[BONES[b][1]];
            if (a && c && a.visibility > 0.4 && c.visibility > 0.4) {
                ctx.beginPath();
                ctx.moveTo(a.x * w, a.y * h);
                ctx.lineTo(c.x * w, c.y * h);
                ctx.stroke();
            }
        }

        // ---- 关节点 ----
        for (var j = 0; j < landmarks.length; j++) {
            var lm = landmarks[j];
            if (!lm || lm.visibility < 0.4) continue;

            var x = lm.x * w, y = lm.y * h;
            var isLeg = j >= 23, isHand = j >= 15 && j <= 22;
            var radius = isHand ? 5 : (isLeg ? 4 : 2.5);

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = isHand ? '#FF3333' : (isLeg ? '#33FF33' : '#00FF00');
            ctx.fill();

            if (isHand || isLeg) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = isHand ? '#FFFF00' : '#00FFFF';
                ctx.stroke();
            }
        }
    }

    // =================================================================
    //  对外接口
    // =================================================================
    subscribe(fn) {
        if (this.listeners.indexOf(fn) === -1) this.listeners.push(fn);
    }

    unsubscribe(fn) {
        this.listeners = this.listeners.filter(function (cb) { return cb !== fn; });
    }

    getStream() { return this.stream; }
    getVideoElement() { return this.videoElement; }
    getCameras() { return this.availableCameras; }
    getCurrentCameraId() { return this.currentDeviceId; }

    async switchCamera(id) { return this._switchCam(id); }

    async refreshCameras() {
        await this._enumCameras();
        return this.availableCameras;
    }
}

// 全局唯一实例
window.mpManager = new MediaPipeManager();

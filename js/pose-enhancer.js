// ====================================================================
// pose-enhancer.js — 姿态增强层
// 在 MediaPipeManager 之上添加：
//   1. YOLOv8-Pose 辅助检测（ONNX Runtime Web）—— 异步后台运行
//   2. LandmarkFusion 双模型融合 —— 同步
//   3. LandmarkFilter + OneEuroFilter 平滑滤波 —— 同步
//   4. 可见性门控 —— 同步
// ====================================================================

(function () {
    'use strict';

    var _yoloDetector = null;
    var _filter = null;
    var _fusion = null;
    var _enabled = false;
    var _yoloReady = false;
    var _lastYoloResult = null;
    var _yoloRunning = false;
    var _videoSource = null;

    // ---- 配置 ----
    var CONFIG = {
        // YOLO 每隔多少帧运行一次（降低性能开销）
        yoloFrameInterval: 3,
        // 是否默认启用 YOLO 辅助
        yoloEnabledByDefault: false,
        // One Euro Filter 参数
        oneEuro: {
            minCutoff: 1.0,  // 越小越平滑（但延迟越大）
            beta: 0.007,     // 越大对快速运动越敏感
            dCutoff: 1.0
        },
        // EMA 平滑系数（当 One Euro 关闭时使用）
        emaSmoothFactor: 0.35,
        // 可见性阈值
        minVisibility: 0.45,
        // 融合参数
        fusion: {
            consistencyThreshold: 0.03,
            mpFallbackThreshold: 0.4,
            mpWeight: 0.7,
            yoloWeight: 0.3
        }
    };

    // ---- 帧计数器 ----
    var _frameCount = 0;

    /**
     * 初始化姿态增强层
     * @param {Object} options - 可选配置覆盖
     * @returns {Promise<boolean>} 是否成功初始化
     */
    async function initPoseEnhancer(options) {
        if (options) {
            for (var k in options) {
                if (options.hasOwnProperty(k)) {
                    if (k === 'oneEuro' || k === 'fusion') {
                        for (var sk in options[k]) {
                            if (options[k].hasOwnProperty(sk)) CONFIG[k][sk] = options[k][sk];
                        }
                    } else {
                        CONFIG[k] = options[k];
                    }
                }
            }
        }

        // 创建滤波器
        _filter = new LandmarkFilter({
            minVisibility: CONFIG.minVisibility,
            smoothFactor: CONFIG.emaSmoothFactor,
            oneEuro: true,
            minCutoff: CONFIG.oneEuro.minCutoff,
            beta: CONFIG.oneEuro.beta,
            dCutoff: CONFIG.oneEuro.dCutoff
        });

        // 创建融合器
        _fusion = new LandmarkFusion(CONFIG.fusion);

        // 尝试加载 YOLO 模型
        if (CONFIG.yoloEnabledByDefault) {
            await _initYOLO();
        }

        _enabled = true;
        console.log('[PoseEnhancer] ✅ 姿态增强层已初始化',
            '| YOLO:', _yoloReady ? 'ON' : 'OFF',
            '| Filter: OneEuro',
            '| Fusion: ON');
        return true;
    }

    /**
     * 单独初始化 YOLO 模型（可延迟加载）
     */
    async function _initYOLO() {
        if (_yoloReady) return true;

        try {
            _yoloDetector = new YOLOPoseDetector({
                modelPath: 'models/yolov8n-pose.onnx',
                inputSize: 640,
                confThreshold: 0.5
            });
            _yoloReady = await _yoloDetector.init();
            return _yoloReady;
        } catch (err) {
            console.warn('[PoseEnhancer] YOLO 初始化失败:', err.message);
            return false;
        }
    }

    /**
     * 【异步】后台 YOLO 检测循环 —— 独立于 MediaPipe 帧循环运行
     * 检测结果缓存到 _lastYoloResult，供 enhanceSync() 同步读取
     */
    async function _yoloBackgroundLoop() {
        if (!_yoloReady || !_yoloDetector || !_videoSource) return;

        while (_enabled && _yoloReady) {
            if (!_yoloRunning && _videoSource &&
                _videoSource.readyState >= 2) {
                _yoloRunning = true;
                try {
                    var result = await _yoloDetector.detect(_videoSource);
                    if (result) {
                        _lastYoloResult = {
                            landmarks: _yoloDetector.toMediaPipeFormat(result.keypoints),
                            timestamp: performance.now()
                        };
                    }
                } catch (e) { /* 静默 */ }
                _yoloRunning = false;
            }
            // 控制 YOLO 帧率：每 yoloFrameInterval 帧的间隔时间
            // MediaPipe 约 30fps → 每帧 33ms，YOLO 每 3 帧运行一次 ≈ 100ms 间隔
            await new Promise(function (r) { setTimeout(r, 80); });
        }
    }

    /**
     * 【同步】处理一帧姿态数据（在 MediaPipeManager.onResults 回调中调用）
     * 不含任何 await，保证与 MediaPipe 帧循环同步
     *
     * @param {Object} rawResults - MediaPipe 的原始 { poseLandmarks, poseWorldLandmarks }
     * @returns {Object} 增强后的 { poseLandmarks, poseWorldLandmarks, _meta }
     */
    function enhanceSync(rawResults) {
        if (!_enabled || !rawResults || !rawResults.poseLandmarks) {
            return rawResults;
        }

        _frameCount++;
        var mpLandmarks = rawResults.poseLandmarks;
        var yoloLandmarks = null;

        // 读取 YOLO 缓存结果（如果不超过 500ms 则视为有效）
        if (_lastYoloResult && (performance.now() - _lastYoloResult.timestamp) < 500) {
            yoloLandmarks = _lastYoloResult.landmarks;
        }

        // ---- 融合 ----
        var fusedLandmarks = mpLandmarks;
        if (yoloLandmarks) {
            fusedLandmarks = _fusion.fuse(mpLandmarks, yoloLandmarks);
        }

        // ---- 平滑滤波 ----
        var smoothedLandmarks = _filter.filter(fusedLandmarks);

        // 返回增强后的结果
        return {
            poseLandmarks: smoothedLandmarks,
            poseWorldLandmarks: rawResults.poseWorldLandmarks,
            _meta: {
                frameCount: _frameCount,
                yoloActive: _yoloReady,
                yoloUsedThisFrame: yoloLandmarks !== null,
                filtered: true
            }
        };
    }

    /**
     * 设置视频源（供 YOLO 后台检测使用）
     */
    function setVideoSource(videoElement) {
        _videoSource = videoElement;
    }

    /**
     * 动态开关 YOLO（运行时切换，不需要重启）
     */
    async function toggleYOLO(enable) {
        if (enable && !_yoloReady) {
            var ok = await _initYOLO();
            if (ok) _yoloBackgroundLoop(); // 启动后台检测
            return ok;
        }
        CONFIG.yoloEnabledByDefault = enable;
        if (enable && _yoloReady) _yoloBackgroundLoop();
        return _yoloReady;
    }

    /**
     * 获取当前状态
     */
    function getStatus() {
        return {
            enabled: _enabled,
            yoloReady: _yoloReady,
            yoloRunning: _yoloRunning,
            filterType: 'OneEuro',
            fusionActive: _yoloReady,
            frameCount: _frameCount,
            config: CONFIG
        };
    }

    /**
     * 重置滤波器状态（切换场景时调用）
     */
    function reset() {
        if (_filter) _filter.reset();
        _lastYoloResult = null;
        _frameCount = 0;
    }

    /**
     * 更新滤波参数（运行时调优）
     */
    function updateFilterParams(params) {
        if (params.minVisibility !== undefined) CONFIG.minVisibility = params.minVisibility;
        if (params.beta !== undefined) CONFIG.oneEuro.beta = params.beta;
        if (params.minCutoff !== undefined) CONFIG.oneEuro.minCutoff = params.minCutoff;
        // 重建滤波器
        _filter = new LandmarkFilter({
            minVisibility: CONFIG.minVisibility,
            smoothFactor: CONFIG.emaSmoothFactor,
            oneEuro: true,
            minCutoff: CONFIG.oneEuro.minCutoff,
            beta: CONFIG.oneEuro.beta,
            dCutoff: CONFIG.oneEuro.dCutoff
        });
        console.log('[PoseEnhancer] 滤波参数已更新:', params);
    }

    // ---- 挂载到全局 ----
    window.PoseEnhancer = {
        init: initPoseEnhancer,
        enhanceSync: enhanceSync,
        setVideoSource: setVideoSource,
        toggleYOLO: toggleYOLO,
        getStatus: getStatus,
        reset: reset,
        updateFilterParams: updateFilterParams
    };
})();

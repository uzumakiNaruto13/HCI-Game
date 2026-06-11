// ====================================================================
// landmark-filter.js — 关键点平滑 + 可见性过滤 + 双模型融合
// ====================================================================

// ---- One Euro Filter：低延迟高频噪声滤波器 ----
class OneEuroFilter {
    constructor(minCutoff, beta, dCutoff) {
        this.minCutoff = minCutoff || 1.0;
        this.beta = beta || 0.007;
        this.dCutoff = dCutoff || 1.0;
        this.xPrev = null;
        this.dxPrev = 0;
        this.tPrev = null;
    }

    filter(x, t) {
        if (this.tPrev === null) {
            this.tPrev = t;
            this.xPrev = x;
            return x;
        }
        var dt = Math.max(t - this.tPrev, 0.001);
        this.tPrev = t;

        var dx = (x - this.xPrev) / dt;
        var edx = this._lowPass(dx, this.dxPrev, dt, this.dCutoff);
        this.dxPrev = edx;

        var cutoff = this.minCutoff + this.beta * Math.abs(edx);
        var result = this._lowPass(x, this.xPrev, dt, cutoff);
        this.xPrev = result;
        return result;
    }

    _lowPass(x, xPrev, dt, cutoff) {
        var tau = 1.0 / (2 * Math.PI * cutoff);
        var alpha = 1.0 / (1.0 + tau / dt);
        return alpha * x + (1 - alpha) * xPrev;
    }

    reset() {
        this.xPrev = null;
        this.dxPrev = 0;
        this.tPrev = null;
    }
}

// ---- LandmarkFilter：逐关键点平滑 + 可见性门控 ----
class LandmarkFilter {
    constructor(options) {
        options = options || {};
        this.minVisibility = options.minVisibility || 0.5;
        this.smoothFactor = options.smoothFactor || 0.4;
        this._smoothed = null;
        // 为每个关键点维护独立的 One Euro Filter
        this._oneEuroFilters = null;
        this._oneEuroEnabled = options.oneEuro !== false;
        this._minCutoff = options.minCutoff || 1.0;
        this._beta = options.beta || 0.007;
    }

    filter(rawLandmarks) {
        if (!rawLandmarks || rawLandmarks.length === 0) return null;

        var len = rawLandmarks.length;

        // 初始化
        if (!this._smoothed || this._smoothed.length !== len) {
            this._smoothed = [];
            for (var i = 0; i < len; i++) {
                this._smoothed.push({
                    x: rawLandmarks[i].x,
                    y: rawLandmarks[i].y,
                    z: rawLandmarks[i].z || 0,
                    visibility: rawLandmarks[i].visibility
                });
            }
            if (this._oneEuroEnabled) {
                this._oneEuroFilters = [];
                for (var j = 0; j < len; j++) {
                    this._oneEuroFilters.push({
                        x: new OneEuroFilter(this._minCutoff, this._beta),
                        y: new OneEuroFilter(this._minCutoff, this._beta),
                        z: new OneEuroFilter(this._minCutoff, this._beta)
                    });
                }
            }
            return this._smoothed;
        }

        var now = performance.now() / 1000;

        for (var k = 0; k < len; k++) {
            var raw = rawLandmarks[k];
            var prev = this._smoothed[k];

            // 低可见度：保持上一帧位置，不更新
            if (raw.visibility !== undefined && raw.visibility < this.minVisibility) {
                continue;
            }

            if (this._oneEuroEnabled && this._oneEuroFilters && this._oneEuroFilters[k]) {
                // One Euro Filter 模式：自适应低延迟滤波
                var oef = this._oneEuroFilters[k];
                prev.x = oef.x.filter(raw.x, now);
                prev.y = oef.y.filter(raw.y, now);
                prev.z = oef.z.filter(raw.z || 0, now);
            } else {
                // EMA 模式：指数移动平均
                prev.x += (raw.x - prev.x) * this.smoothFactor;
                prev.y += (raw.y - prev.y) * this.smoothFactor;
                prev.z += ((raw.z || 0) - prev.z) * this.smoothFactor;
            }
            prev.visibility = raw.visibility;
        }
        return this._smoothed;
    }

    reset() {
        this._smoothed = null;
        this._oneEuroFilters = null;
    }
}

// ---- LandmarkFusion：MediaPipe + YOLO 双模型融合 ----
class LandmarkFusion {
    constructor(options) {
        options = options || {};
        // 一致性阈值：两个模型的同名关键点距离小于此值时认为"一致"
        this.consistencyThreshold = options.consistencyThreshold || 0.03;
        // MediaPipe 置信度低于此值时，尝试用 YOLO 补充
        this.mpFallbackThreshold = options.mpFallbackThreshold || 0.4;
        // 融合权重：MediaPipe vs YOLO（MediaPipe 通常更准，给更高权重）
        this.mpWeight = options.mpWeight || 0.7;
        this.yoloWeight = options.yoloWeight || 0.3;
    }

    /**
     * 融合 MediaPipe 和 YOLO 的 landmark 结果
     * @param {Array} mpLandmarks - MediaPipe 33 关键点
     * @param {Array} yoloLandmarks - YOLO 转换后的 33 关键点（可能有 null）
     * @returns {Array} 融合后的 33 关键点
     */
    fuse(mpLandmarks, yoloLandmarks) {
        if (!mpLandmarks) return yoloLandmarks;
        if (!yoloLandmarks) return mpLandmarks;

        var fused = [];
        var len = Math.max(mpLandmarks.length, yoloLandmarks.length);

        for (var i = 0; i < len; i++) {
            var mp = mpLandmarks[i];
            var yolo = yoloLandmarks[i];

            if (!mp && !yolo) {
                fused.push(null);
                continue;
            }

            // 情况1：两个模型都有该关键点
            if (mp && yolo) {
                var mpVis = mp.visibility || 0;
                var yoloVis = yolo.visibility || 0;

                // 计算两个模型的空间一致性
                var dist = Math.sqrt(
                    Math.pow(mp.x - yolo.x, 2) +
                    Math.pow(mp.y - yolo.y, 2)
                );

                if (dist < this.consistencyThreshold) {
                    // 一致：按置信度加权平均
                    var total = mpVis + yoloVis;
                    if (total > 0) {
                        var wMP = mpVis / total;
                        var wYolo = yoloVis / total;
                        fused.push({
                            x: mp.x * wMP + yolo.x * wYolo,
                            y: mp.y * wMP + yolo.y * wYolo,
                            z: mp.z * wMP + (yolo.z || 0) * wYolo,
                            visibility: Math.max(mpVis, yoloVis)
                        });
                    } else {
                        fused.push(mp);
                    }
                } else {
                    // 不一致：选择置信度更高的
                    fused.push(mpVis >= yoloVis ? mp : yolo);
                }
            }
            // 情况2：只有 MediaPipe 有
            else if (mp) {
                // 如果 MediaPipe 置信度低，标记为低可信
                if ((mp.visibility || 0) < this.mpFallbackThreshold) {
                    fused.push({
                        x: mp.x, y: mp.y, z: mp.z || 0,
                        visibility: mp.visibility,
                        _lowConf: true // 标记供下游使用
                    });
                } else {
                    fused.push(mp);
                }
            }
            // 情况3：只有 YOLO 有
            else {
                fused.push(yolo);
            }
        }
        return fused;
    }
}

// 挂载到全局
window.OneEuroFilter = OneEuroFilter;
window.LandmarkFilter = LandmarkFilter;
window.LandmarkFusion = LandmarkFusion;

// ====================================================================
// yolo-pose-detector.js — YOLOv8-Pose 浏览器端推理（ONNX Runtime Web）
// 作为 MediaPipe 的辅助验证层，提供 17 COCO 关键点 + 置信度
// ====================================================================

class YOLOPoseDetector {
    constructor(options = {}) {
        this.modelPath = options.modelPath || 'models/yolov8n-pose.onnx';
        this.inputSize = options.inputSize || 640;       // YOLO 输入尺寸
        this.confThreshold = options.confThreshold || 0.5;
        this.iouThreshold = options.iouThreshold || 0.45;
        this.session = null;
        this.isReady = false;

        // COCO 17 关键点 → MediaPipe 33 关键点的映射表
        // COCO: 0鼻,1左眼,2右眼,3左耳,4右耳,5左肩,6右肩,7左肘,8右肘,
        //       9左腕,10右腕,11左髋,12右髋,13左膝,14右膝,15左踝,16右踝
        this.cocoToMediaPipe = {
            0:  0,   // nose → nose
            1:  2,   // left_eye → left_eye (inner)
            2:  5,   // right_eye → right_eye (inner)
            3:  7,   // left_ear → left_ear
            4:  8,   // right_ear → right_ear
            5:  11,  // left_shoulder → left_shoulder
            6:  12,  // right_shoulder → right_shoulder
            7:  13,  // left_elbow → left_elbow
            8:  14,  // right_elbow → right_elbow
            9:  15,  // left_wrist → left_wrist
            10: 16,  // right_wrist → right_wrist
            11: 23,  // left_hip → left_hip
            12: 24,  // right_hip → right_hip
            13: 25,  // left_knee → left_knee
            14: 26,  // right_knee → right_knee
            15: 27,  // left_ankle → left_ankle
            16: 28,  // right_ankle → right_ankle
        };
    }

    async init() {
        try {
            // 动态加载 ONNX Runtime Web
            if (typeof ort === 'undefined') {
                await this._loadScript('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/ort.min.js');
            }

            // 配置 WASM 执行路径
            ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/';

            // 加载模型（优先 WebGL 后端，fallback 到 WASM）
            const providers = ['webgl', 'wasm'];
            this.session = await ort.InferenceSession.create(this.modelPath, {
                executionProviders: providers,
                graphOptimizationLevel: 'all'
            });

            this.isReady = true;
            console.log('[YOLOPose] ✅ 模型加载完成:', this.modelPath);
            return true;
        } catch (err) {
            console.warn('[YOLOPose] ❌ 模型加载失败:', err.message);
            return false;
        }
    }

    /**
     * 从视频帧中检测姿态
     * @param {HTMLVideoElement|HTMLCanvasElement} source - 视频源
     * @returns {Array|null} 检测到的关键点数组 (17个COCO格式)，或null
     */
    async detect(source) {
        if (!this.isReady || !this.session) return null;

        try {
            // 1. 预处理：将视频帧转为模型输入张量
            const { tensor, scaleX, scaleY, padX, padY } = this._preprocess(source);

            // 2. 推理
            const inputName = this.session.inputNames[0];
            const feeds = { [inputName]: tensor };
            const results = await this.session.run(feeds);

            // 3. 后处理：解析输出
            const output = results[this.session.outputNames[0]];
            const detections = this._postprocess(output, scaleX, scaleY, padX, padY);

            return detections.length > 0 ? detections[0] : null; // 返回最高置信度的人
        } catch (err) {
            console.warn('[YOLOPose] 推理错误:', err.message);
            return null;
        }
    }

    /**
     * 将 YOLO 的 COCO 关键点转换为 MediaPipe 格式
     * @param {Array} yoloKeypoints - YOLO 检测的 17 个关键点
     * @returns {Array} 33 个 MediaPipe 格式的关键点（未检测到的为 null）
     */
    toMediaPipeFormat(yoloKeypoints) {
        if (!yoloKeypoints) return null;

        // 初始化 33 个 null
        const mpLandmarks = new Array(33).fill(null);

        for (let i = 0; i < yoloKeypoints.length; i++) {
            const mpIdx = this.cocoToMediaPipe[i];
            if (mpIdx !== undefined && yoloKeypoints[i]) {
                mpLandmarks[mpIdx] = {
                    x: yoloKeypoints[i].x,
                    y: yoloKeypoints[i].y,
                    z: 0, // YOLO 没有深度信息
                    visibility: yoloKeypoints[i].confidence
                };
            }
        }
        return mpLandmarks;
    }

    // ===================== 内部方法 =====================

    _loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    _preprocess(source) {
        // 创建离屏 canvas 进行缩放
        const canvas = document.createElement('canvas');
        canvas.width = this.inputSize;
        canvas.height = this.inputSize;
        const ctx = canvas.getContext('2d');

        // 计算缩放比例（保持宽高比 + padding）
        const srcW = source.videoWidth || source.width || 640;
        const srcH = source.videoHeight || source.height || 480;
        const scale = Math.min(this.inputSize / srcW, this.inputSize / srcH);
        const newW = srcW * scale;
        const newH = srcH * scale;
        const padX = (this.inputSize - newW) / 2;
        const padY = (this.inputSize - newH) / 2;

        // 保存源尺寸供后处理使用
        this._lastSrcW = srcW;
        this._lastSrcH = srcH;

        // 填充灰色背景 + 绘制缩放后的图像
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, this.inputSize, this.inputSize);
        ctx.drawImage(source, padX, padY, newW, newH);

        // 获取像素数据并转为 Float32Array [1, 3, 640, 640]
        const imageData = ctx.getImageData(0, 0, this.inputSize, this.inputSize);
        const { data } = imageData;
        const float32 = new Float32Array(3 * this.inputSize * this.inputSize);

        for (let i = 0; i < this.inputSize * this.inputSize; i++) {
            float32[i] = data[i * 4] / 255.0;                          // R
            float32[i + this.inputSize * this.inputSize] = data[i * 4 + 1] / 255.0;  // G
            float32[i + 2 * this.inputSize * this.inputSize] = data[i * 4 + 2] / 255.0; // B
        }

        const tensor = new ort.Tensor('float32', float32, [1, 3, this.inputSize, this.inputSize]);
        return { tensor, scaleX: scale, scaleY: scale, padX, padY };
    }

    _postprocess(output, scaleX, scaleY, padX, padY) {
        // output shape: [1, 56, 8400]  (56 = 4 bbox + 1 conf + 51 keypoints(17*3))
        // 注：不同版本的 YOLOv8-pose 输出格式可能不同，需根据实际模型调整
        const data = output.data;
        const dims = output.dims;

        // 自动检测输出格式
        let numDetections, numFeatures;
        if (dims.length === 3) {
            // [1, 56, 8400] 格式
            numFeatures = dims[1];
            numDetections = dims[2];
        } else {
            console.warn('[YOLOPose] 未知输出格式:', dims);
            return [];
        }

        const detections = [];
        const inputW = this.inputSize;
        const inputH = this.inputSize;

        for (let i = 0; i < numDetections; i++) {
            // 读取置信度 (第5个元素，index 4)
            const confIdx = 4 * numDetections + i;
            const confidence = data[confIdx];
            if (confidence < this.confThreshold) continue;

            // 边界框 (cx, cy, w, h) — 前4个元素
            const cx = data[0 * numDetections + i];
            const cy = data[1 * numDetections + i];
            const w  = data[2 * numDetections + i];
            const h  = data[3 * numDetections + i];

            // 关键点 (17 × 3: x, y, conf)
            const keypoints = [];
            for (let k = 0; k < 17; k++) {
                const baseIdx = (5 + k * 3) * numDetections + i;
                const kx = data[baseIdx];
                const ky = data[baseIdx + numDetections];
                const kconf = data[baseIdx + 2 * numDetections];

                // 还原到原始图像坐标（去掉 padding，除以缩放比）
                const origX = (kx - padX) / scaleX;
                const origY = (ky - padY) / scaleY;

                // 归一化到 0-1（使用源视频实际尺寸）
                keypoints.push({
                    x: Math.max(0, Math.min(1, origX / (this._lastSrcW || inputW))),
                    y: Math.max(0, Math.min(1, origY / (this._lastSrcH || inputH))),
                    confidence: kconf
                });
            }

            detections.push({
                confidence,
                bbox: {
                    cx: (cx - padX) / (scaleX * (this._lastSrcW || inputW)),
                    cy: (cy - padY) / (scaleY * (this._lastSrcH || inputH)),
                    w: w / (scaleX * (this._lastSrcW || inputW)),
                    h: h / (scaleY * (this._lastSrcH || inputH))
                },
                keypoints
            });
        }

        // 按置信度排序
        detections.sort((a, b) => b.confidence - a.confidence);

        // NMS (非极大值抑制)
        return this._nms(detections);
    }

    _nms(detections) {
        if (detections.length <= 1) return detections;

        const keep = [];
        const suppressed = new Set();

        for (let i = 0; i < detections.length; i++) {
            if (suppressed.has(i)) continue;
            keep.push(detections[i]);

            for (let j = i + 1; j < detections.length; j++) {
                if (suppressed.has(j)) continue;
                const iou = this._calcIoU(detections[i].bbox, detections[j].bbox);
                if (iou > this.iouThreshold) suppressed.add(j);
            }
        }
        return keep;
    }

    _calcIoU(a, b) {
        const ax1 = a.cx - a.w / 2, ay1 = a.cy - a.h / 2;
        const ax2 = a.cx + a.w / 2, ay2 = a.cy + a.h / 2;
        const bx1 = b.cx - b.w / 2, by1 = b.cy - b.h / 2;
        const bx2 = b.cx + b.w / 2, by2 = b.cy + b.h / 2;

        const ix1 = Math.max(ax1, bx1), iy1 = Math.max(ay1, by1);
        const ix2 = Math.min(ax2, bx2), iy2 = Math.min(ay2, by2);
        const inter = Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1);
        const areaA = a.w * a.h, areaB = b.w * b.h;
        return inter / (areaA + areaB - inter);
    }
}

window.YOLOPoseDetector = YOLOPoseDetector;

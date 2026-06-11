// ====================================================================
// gesture-utils.js — 自适应手势检测工具
// 所有阈值基于身体比例（肩宽/躯干高），不依赖绝对坐标
// ====================================================================

(function () {
    'use strict';

    /**
     * 计算身体参考尺寸
     * @returns {Object|null} { shoulderWidth, torsoHeight } 或 null
     */
    function getBodyScale(lm) {
        if (!lm) return null;
        var ls = lm[11], rs = lm[12], lh = lm[23], rh = lm[24];
        if (!ls || !rs || !lh || !rh) return null;
        if ((ls.visibility || 0) < 0.35 || (rs.visibility || 0) < 0.35) return null;

        var sw = Math.abs(rs.x - ls.x) || 0.12;
        var shY = (ls.y + rs.y) / 2;
        var hpY = (lh.y + rh.y) / 2;
        var th = Math.abs(hpY - shY) || 0.18;

        return { shoulderWidth: sw, torsoHeight: th };
    }

    /**
     * 手臂是否举起（自适应）
     * @returns {boolean}
     */
    function isArmUp(lm, side) {
        var body = getBodyScale(lm);
        if (!body) return false;

        var shoulder, wrist;
        if (side === 'left') { shoulder = lm[11]; wrist = lm[15]; }
        else { shoulder = lm[12]; wrist = lm[16]; }

        if (!shoulder || !wrist) return false;
        if ((wrist.visibility || 0) < 0.4) return false;

        // 手腕相对肩膀的 Y 偏差，用肩宽归一化
        var diff = shoulder.y - wrist.y;
        var norm = diff / body.shoulderWidth;
        return norm > 0.35; // 手腕高于肩膀 35% 肩宽
    }

    /**
     * 双臂是否交叉（自适应）
     * @returns {boolean}
     */
    function isArmsCrossed(lm) {
        var body = getBodyScale(lm);
        if (!body) return false;

        var lw = lm[15], rw = lm[16];
        if (!lw || !rw) return false;
        if ((lw.visibility || 0) < 0.4 || (rw.visibility || 0) < 0.4) return false;

        // 左腕在右腕右侧 = 交叉（镜像坐标系）
        var gap = (lw.x - rw.x) / body.shoulderWidth;
        return gap < -0.15;
    }

    /**
     * 归一化位移（用身体比例缩放）
     * @returns {number} 归一化后的值
     */
    function normalizeDelta(delta, body) {
        if (!body) return delta;
        return delta / body.shoulderWidth;
    }

    // 挂载
    window.GestureUtils = {
        getBodyScale: getBodyScale,
        isArmUp: isArmUp,
        isArmsCrossed: isArmsCrossed,
        normalizeDelta: normalizeDelta
    };

    console.log('[GestureUtils] ✅ 自适应手势工具已加载');
})();

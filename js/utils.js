// ====================================================================
// utils.js — 工具函数
// ====================================================================

/** 快捷获取DOM元素 */
function $(id) {
  return document.getElementById(id);
}

/** 数值钳制 */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/** 线性插值 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** CanvasRenderingContext2D roundRect polyfill */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (r > w / 2) r = w / 2;
    if (r > h / 2) r = h / 2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x, y + r);
    this.closePath();
    return this;
  };
}

/** 格式化数字 */
function fmt(n, decimals) {
  decimals = decimals || 1;
  return Number(n).toFixed(decimals);
}

/** 随机整数 [min, max) */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/** 随机浮点 [min, max) */
function randRange(min, max) {
  return Math.random() * (max - min) + min;
}


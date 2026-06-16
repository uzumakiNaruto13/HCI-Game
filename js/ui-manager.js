// ====================================================================
// ui-manager.js — UI 管理器
// ====================================================================

var UIManager = (function () {

  /** 屏幕切换 */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function (s) {
      s.classList.remove('show');
    });
    var el = $(id);
    if (el) el.classList.add('show');
  }

  /** 动作反馈弹字 */
  function showFeedback(elementId, text, grade, combo) {
    var el = $(elementId);
    if (!el) return;
    var cls = 'feedback';
    if (grade === 'perfect') cls += ' perfect';
    else if (grade === 'good') cls += ' good';
    else cls += ' action';
    if (combo >= 5) cls = 'feedback combo';

    var displayText = text;
    if (combo >= 5) displayText = '🔥 COMBO x' + combo + '! ' + text;
    else if (grade === 'perfect') displayText = '✨ PERFECT! ' + text;
    else if (combo >= 3) displayText = '👍 GOOD! ' + text;

    el.textContent = displayText;
    el.className = cls;
    el.style.display = 'block';
    el.style.animation = 'none';
    el.offsetHeight; // 强制回流
    el.style.animation = 'feedbackPop .6s ease-out forwards';
    setTimeout(function () { el.style.display = 'none'; }, 700);
  }

  /** 雷达图 */
  function drawRadar(canvasId, labels, values) {
    var c = $(canvasId);
    if (!c) return;
    var ctx = c.getContext('2d');
    var size = 180;
    c.width = size;
    c.height = size;
    var cx = size / 2, cy = size / 2, R = 68, levels = 3;
    ctx.clearRect(0, 0, size, size);
    var maxVal = Math.max.apply(null, values.concat([1]));
    var normalized = values.map(function (v) { return v / maxVal; });
    var count = labels.length;
    var angleStep = (Math.PI * 2) / count;
    var startAngle = -Math.PI / 2;

    // 同心圆
    for (var l = 1; l <= levels; l++) {
      var rr = (R / levels) * l;
      ctx.beginPath();
      for (var i = 0; i < count; i++) {
        var a = startAngle + i * angleStep;
        var x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.04 + l * 0.03) + ')';
      ctx.stroke();
    }

    // 轴线
    for (var j = 0; j < count; j++) {
      var a2 = startAngle + j * angleStep;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(a2), cy + R * Math.sin(a2));
      ctx.strokeStyle = 'rgba(255,255,255,.1)';
      ctx.stroke();
    }

    // 数据区域
    ctx.beginPath();
    for (var k = 0; k < count; k++) {
      var v = normalized[k], rr2 = R * v;
      var a3 = startAngle + k * angleStep;
      if (k === 0) ctx.moveTo(cx + rr2 * Math.cos(a3), cy + rr2 * Math.sin(a3));
      else ctx.lineTo(cx + rr2 * Math.cos(a3), cy + rr2 * Math.sin(a3));
    }
    ctx.closePath();
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,212,255,.2)';
    ctx.fill();

    // 数据点
    for (var m = 0; m < count; m++) {
      var v2 = normalized[m], rr3 = R * v2;
      var a4 = startAngle + m * angleStep;
      ctx.fillStyle = '#00d4ff';
      ctx.beginPath();
      ctx.arc(cx + rr3 * Math.cos(a4), cy + rr3 * Math.sin(a4), 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 标签
    ctx.fillStyle = '#aaaacc';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    for (var n = 0; n < count; n++) {
      var a5 = startAngle + n * angleStep;
      ctx.fillText(
        labels[n] + ' (' + values[n] + ')',
        cx + (R + 16) * Math.cos(a5),
        cy - (R + 16) * Math.sin(a5) + 3
      );
    }
  }

  return {
    showScreen: showScreen,
    showFeedback: showFeedback,
    drawRadar: drawRadar
  };

})();

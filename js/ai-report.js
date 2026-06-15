// ====================================================================
// ai-report.js — 卡路里数据报告面板（独立模块）
// ====================================================================

var AIReport = {
  _sessions: [],

  init: function () {
    var raw = localStorage.getItem('hcigame_sessions');
    if (raw) { try { this._sessions = JSON.parse(raw); } catch (e) { this._sessions = []; } }
    this._bindUI();
  },

  _bindUI: function () {
    var self = this;
    setTimeout(function () {
      var badge = document.getElementById('kcal-badge');
      if (badge) badge.onclick = function () { self.open(); };
    }, 500);
    document.addEventListener('click', function (e) {
      if (e.target.id === 'kcal-report-close') self.close();
      if (e.target.id === 'kcal-export-btn') self._exportXLS();
      if (e.target.id === 'kcal-ai-send') self._askAI();
    });
    document.addEventListener('click', function (e) {
      var panel = document.getElementById('kcal-report-panel');
      if (panel && panel.style.display === 'flex' && !panel.contains(e.target) && e.target.id !== 'kcal-badge' && !document.getElementById('kcal-badge').contains(e.target)) {
        self.close();
      }
    });
  },

  _chatHistory: [],
  _askAI: function () {
    var input = document.getElementById('kcal-ai-input');
    var question = (input && input.value.trim()) || '分析我的运动数据';
    if (input) input.value = '';

    this._chatHistory.push({ role: 'user', text: question });
    this._renderChat();

    var today = this._getToday();
    var hourly = this._getHourlyData();
    var weekData = this._getWeekData();
    var weekVals = Object.values(weekData);
    var totalWeek = weekVals.reduce(function (a, b) { return a + b; }, 0);
    var peak = 0, peakHour = 0;
    for (var h = 0; h < 24; h++) { if (hourly[h] > peak) { peak = hourly[h]; peakHour = h; } }

    var dataCtx = '今日' + today.count + '次,' + today.kcal.toFixed(1) + 'kcal,' + today.min + '分钟; 峰值' + peakHour + '时' + peak.toFixed(1) + 'kcal; 7天' + totalWeek.toFixed(0) + 'kcal';

    var self = this;
    var fallback = '💪 今天' + today.kcal.toFixed(0) + 'kcal！' + (peak > 5 ? '运动高峰在' + peakHour + '点，保持这个节奏！' : '再加把劲，试试投篮挑战！');

    // 优先用 Python AI 服务（动态无响应超时）
    var wsSent = false, idleTimer = null, IDLE_MAX = 15000;
    try {
      var ws = new WebSocket('ws://localhost:8083');
      var resetIdle = function () {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(function () {
          if (ws.readyState === WebSocket.OPEN) { ws.close(); }
        }, IDLE_MAX);
      };
      // 清除上一轮的流式 ID
      for (var i = 0; i < self._chatHistory.length; i++) {
        if (self._chatHistory[i].id === 'ai-stream') delete self._chatHistory[i].id;
      }
      var streamIdx = -1;
      ws.onopen = function () {
        ws.send(JSON.stringify({ type: 'chat', question: question, data: dataCtx }));
        wsSent = true;
        self._chatHistory.push({ role: 'ai', id: 'ai-stream', text: '⏳...' });
        streamIdx = self._chatHistory.length - 1;
        self._renderChat();
        resetIdle();
      };
      ws.onmessage = function (e) {
        resetIdle();
        var d = JSON.parse(e.data);
        if (d.type === 'reply_chunk') {
          var el = document.getElementById('ai-stream');
          if (el) {
            if (el.textContent === '⏳...') el.textContent = '';
            el.textContent += d.text;
          }
        } else if (d.type === 'reply_done') {
          var el = document.getElementById('ai-stream');
          if (el) {
            // 保存最终文本到 history，清除 id 防止重复
            var finalText = el.textContent;
            for (var j = self._chatHistory.length - 1; j >= 0; j--) {
              if (self._chatHistory[j].id === 'ai-stream') {
                self._chatHistory[j].text = finalText;
                delete self._chatHistory[j].id;
                break;
              }
            }
            el.removeAttribute('id');
          }
          if (idleTimer) clearTimeout(idleTimer);
          ws.close();
        } else if (d.type === 'reply') {
          var el = document.getElementById('ai-stream');
          if (el) {
            var t = d.text;
            for (var k = self._chatHistory.length - 1; k >= 0; k--) {
              if (self._chatHistory[k].id === 'ai-stream') { self._chatHistory[k].text = t; delete self._chatHistory[k].id; break; }
            }
            el.textContent = t; el.removeAttribute('id');
          }
          if (idleTimer) clearTimeout(idleTimer);
          ws.close();
        }
      };
      ws.onerror = function () {};
      setTimeout(function () {
        if (!wsSent) { ws.close(); self._chatHistory.push({ role: 'ai', text: fallback }); self._renderChat(); }
      }, 4000);
    } catch (e) {
      self._chatHistory.push({ role: 'ai', text: fallback });
      self._renderChat();
    }
  },

  _renderChat: function () {
    var el = document.getElementById('kcal-ai-reply');
    if (!el) return;
    // 保留已有的流式气泡，只重建非流式的
    var streamEl = document.getElementById('ai-stream');
    var streamText = streamEl ? streamEl.textContent : '';
    var html = '';
    for (var i = Math.max(0, this._chatHistory.length - 6); i < this._chatHistory.length; i++) {
      var m = this._chatHistory[i];
      var color = m.role === 'ai' ? 'color:#86efac;' : 'color:#fbbf24;text-align:right;';
      var label = m.role === 'ai' ? '🤖 AI教练' : '👤 你';
      if (m.id === 'ai-stream') {
        html += '<div style="margin:4px 0;' + color + '"><b>' + label + ':</b> <span id="ai-stream">' + streamText + '</span></div>';
      } else {
        html += '<div style="margin:4px 0;' + color + '"><b>' + label + ':</b> ' + m.text + '</div>';
      }
    }
    el.innerHTML = html;
  },

  logSession: function (gameName, kcal, score, durationSec) {
    var now = new Date();
    var date = now.toISOString().slice(0, 10);
    var hour = now.getHours();
    this._sessions.push({ date: date, hour: hour, game: gameName, kcal: parseFloat(kcal.toFixed(1)), score: score, duration: Math.round(durationSec) });
    var cutoff = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    this._sessions = this._sessions.filter(function (s) { return s.date >= cutoff; });
    localStorage.setItem('hcigame_sessions', JSON.stringify(this._sessions));
  },

  _getToday: function () {
    var today = new Date().toISOString().slice(0, 10);
    var list = this._sessions.filter(function (s) { return s.date === today; });
    return { kcal: list.reduce(function (a, s) { return a + s.kcal; }, 0), count: list.length, min: Math.round(list.reduce(function (a, s) { return a + s.duration; }, 0) / 60) };
  },

  _getHourlyData: function () {
    var hours = {};
    for (var h = 0; h < 24; h++) hours[h] = 0;
    var today = new Date().toISOString().slice(0, 10);
    this._sessions.forEach(function (s) { if (s.date === today && hours[s.hour] !== undefined) hours[s.hour] += s.kcal; });
    return hours;
  },

  _getWeekData: function () {
    var days = {};
    for (var i = 6; i >= 0; i--) {
      var d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      days[d] = 0;
    }
    this._sessions.forEach(function (s) { if (days[s.date] !== undefined) days[s.date] += s.kcal; });
    return days;
  },

  _drawChart: function () {
    var canvas = document.getElementById('kcal-chart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width = canvas.offsetWidth || 600;
    var H = canvas.height = 240;
    ctx.clearRect(0, 0, W, H);

    // 24 小时柱状图
    var data = this._getHourlyData();
    var values = [];
    for (var h = 0; h < 24; h++) values.push(data[h] || 0);
    var maxV = Math.max.apply(null, values.concat([1])) * 1.2;

    var barW = Math.max(2, (W - 60) / 24 - 3);
    var pad = 40;

    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var gy = pad + (H - pad * 2) * (i / 4);
      ctx.beginPath(); ctx.moveTo(40, gy); ctx.lineTo(W - 10, gy); ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.font = '10px Arial';
      ctx.fillText((maxV * (1 - i / 4)).toFixed(0), 2, gy + 4);
    }

    for (var h = 0; h < 24; h++) {
      var barH = (values[h] / maxV) * (H - pad * 2);
      var x = 42 + h * (barW + 3);
      var y = H - pad - barH;
      var grad = ctx.createLinearGradient(x, y, x, H - pad);
      grad.addColorStop(0, h < 6 || h > 22 ? '#64748b' : '#a855f7');
      grad.addColorStop(1, h < 6 || h > 22 ? '#334155' : '#7c3aed');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);
      // 每 3 小时标标签
      if (h % 3 === 0) {
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px Arial'; ctx.textAlign = 'center';
        ctx.fillText(h + '时', x + barW / 2, H - pad + 14);
      }
    }
  },

  _exportXLS: function () {
    var rows = [['日期', '时间', '游戏', '消耗(kcal)', '得分', '时长(秒)']];
    this._sessions.forEach(function (s) {
      rows.push([s.date, s.hour + ':00', s.game, s.kcal.toFixed(1), s.score, s.duration]);
    });
    var csv = '﻿' + rows.map(function (r) { return r.join(','); }).join('\n');
    var blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '卡路里数据_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
  },

  open: function () {
    var panel = document.getElementById('kcal-report-panel');
    if (!panel) return;
    panel.style.display = 'flex';

    var today = this._getToday();
    var totalMin = this._sessions.reduce(function (a, s) { return a + Math.round(s.duration / 60); }, 0);
    document.getElementById('kcal-summary').innerHTML =
      '<div class="kcal-summary-card"><div class="val">' + today.count + '</div><div class="lbl">今日次数</div></div>' +
      '<div class="kcal-summary-card"><div class="val">' + today.kcal.toFixed(1) + '</div><div class="lbl">今日 kcal</div></div>' +
      '<div class="kcal-summary-card"><div class="val">' + today.min + '</div><div class="lbl">今日分钟</div></div>' +
      '<div class="kcal-summary-card"><div class="val">' + totalMin + '</div><div class="lbl">累计分钟</div></div>';

    // 表格
    var tbody = document.querySelector('#kcal-table tbody');
    if (tbody) {
      tbody.innerHTML = '';
      var recent = this._sessions.slice(-20).reverse();
      recent.forEach(function (s) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + s.date + '</td><td>' + s.game + '</td><td>' + s.kcal.toFixed(1) + '</td><td>' + (s.duration >= 60 ? Math.round(s.duration / 60) : '<1') + '</td>';
        tbody.appendChild(tr);
      });
    }

    setTimeout(this._drawChart.bind(this), 100);
  },

  close: function () {
    var panel = document.getElementById('kcal-report-panel');
    if (panel) panel.style.display = 'none';
  }
};

AIReport.init();

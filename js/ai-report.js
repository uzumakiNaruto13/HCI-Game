// ====================================================================
// ai-report.js — 卡路里数据报告面板（增强版）
// MET计算 + 目标设定 + Streak + 饼图 + AI教练
// ====================================================================

var AIReport = {
  _sessions: [],
  _settings: { weight: 70, dailyGoal: 100, weeklyGoal: 500 },

  // MET 代谢当量表 (每游戏)
  _MET: { '🏃 地铁跑酷': 6.0, '🏀 投篮挑战': 7.5, '🎮 Galgame': 1.5, '🧩 体感方块': 3.5 },

  init: function () {
    var raw = localStorage.getItem('hcigame_sessions');
    if (raw) { try { this._sessions = JSON.parse(raw); } catch (e) { this._sessions = []; } }
    var cfg = localStorage.getItem('hcigame_settings');
    if (cfg) { try { var s = JSON.parse(cfg); this._settings.weight = s.weight || 70; this._settings.dailyGoal = s.dailyGoal || 100; this._settings.weeklyGoal = s.weeklyGoal || 500; } catch (e) {} }
    this._bindUI();
    this._updateBadge();
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
      if (e.target.id === 'kcal-save-settings') self._saveSettings();
    });
    // 输入框 Enter 隔离：阻止事件冒泡到背景页面
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && document.getElementById('kcal-report-panel').style.display === 'flex') {
        if (e.target.id === 'kcal-ai-input') { self._askAI(); }
        e.stopPropagation();
        e.preventDefault();
      }
    }, true); // 捕获阶段拦截
  },

  logSession: function (gameName, kcal, score, durationSec) {
    var now = new Date();
    var date = now.toISOString().slice(0, 10);
    var hour = now.getHours();
    // MET 精确计算
    var met = this._MET[gameName] || 4;
    var metKcal = met * this._settings.weight * (durationSec / 3600);
    var finalKcal = metKcal > 0 ? parseFloat(metKcal.toFixed(1)) : parseFloat(kcal.toFixed(1));
    this._sessions.push({ date: date, hour: hour, game: gameName, kcal: finalKcal, score: score, duration: Math.round(durationSec) });
    var cutoff = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
    this._sessions = this._sessions.filter(function (s) { return s.date >= cutoff; });
    localStorage.setItem('hcigame_sessions', JSON.stringify(this._sessions));
    // 更新总 kcal
    window._totalKcal = this._sessions.reduce(function (a, s) { return a + s.kcal; }, 0);
    localStorage.setItem('hcigame_total_kcal', window._totalKcal.toFixed(1));
    this._updateBadge();
    // 检查目标达成
    var todayKcal = this._getToday().kcal;
    if (todayKcal >= this._settings.dailyGoal && !localStorage.getItem('hcigame_goal_notified_' + this._getDate())) {
      localStorage.setItem('hcigame_goal_notified_' + this._getDate(), '1');
      this._showGoalToast();
    }
  },

  _getDate: function () { return new Date().toISOString().slice(0, 10); },

  _getToday: function () {
    var today = this._getDate();
    var list = this._sessions.filter(function (s) { return s.date === today; });
    return { kcal: list.reduce(function (a, s) { return a + s.kcal; }, 0), count: list.length, min: Math.round(list.reduce(function (a, s) { return a + s.duration; }, 0) / 60) };
  },

  _getHourlyData: function () {
    var hours = {};
    for (var h = 0; h < 24; h++) hours[h] = 0;
    var today = this._getDate();
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

  _getGameBreakdown: function () {
    var bd = {};
    this._sessions.forEach(function (s) { bd[s.game] = (bd[s.game] || 0) + s.kcal; });
    return bd;
  },

  _getStreak: function () {
    var days = new Set();
    this._sessions.forEach(function (s) { if (s.kcal > 0) days.add(s.date); });
    var sorted = Array.from(days).sort().reverse();
    var streak = 0, today = this._getDate(), yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (!days.has(today) && !days.has(yesterday)) return 0;
    var check = days.has(today) ? today : yesterday;
    for (var i = 0; i < sorted.length; i++) {
      var expected = new Date(Date.now() - (streak + (days.has(today) ? 0 : 1)) * 86400000).toISOString().slice(0, 10);
      if (days.has(expected)) streak++;
      else break;
    }
    return streak;
  },

  _updateBadge: function () {
    var el = document.getElementById('totalKcal');
    var today = this._getToday();
    var pct = Math.min(100, Math.round(today.kcal / this._settings.dailyGoal * 100));
    var streak = this._getStreak();
    var text = today.kcal.toFixed(0) + '/' + this._settings.dailyGoal + ' kcal';
    if (streak > 1) text += ' 🔥' + streak + '天';
    if (el) el.textContent = text;
  },

  _showGoalToast: function () {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#22c55e;color:#fff;padding:12px 24px;border-radius:10px;z-index:99999;font-weight:bold;animation:fadeInOut 4s forwards;';
    toast.textContent = '🎉 恭喜达成今日目标 ' + this._settings.dailyGoal + ' kcal！';
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 4000);
  },

  _saveSettings: function () {
    var w = parseFloat(document.getElementById('kcal-set-weight').value) || 70;
    var d = parseInt(document.getElementById('kcal-set-daily').value) || 100;
    var wk = parseInt(document.getElementById('kcal-set-weekly').value) || 500;
    this._settings = { weight: w, dailyGoal: d, weeklyGoal: wk };
    localStorage.setItem('hcigame_settings', JSON.stringify(this._settings));
    this._updateBadge();
    this.open();
  },

  _drawChart: function () {
    var canvas = document.getElementById('kcal-chart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width = canvas.offsetWidth || 600;
    var H = canvas.height = 220;
    ctx.clearRect(0, 0, W, H);

    var data = this._getHourlyData();
    var values = [];
    for (var h = 0; h < 24; h++) values.push(data[h] || 0);
    var maxV = Math.max.apply(null, values.concat([1])) * 1.2;
    var barW = Math.max(2, (W - 60) / 24 - 3), pad = 35;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var gy = pad + (H - pad * 2) * (i / 4);
      ctx.beginPath(); ctx.moveTo(40, gy); ctx.lineTo(W - 10, gy); ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.font = '9px Arial';
      ctx.fillText((maxV * (1 - i / 4)).toFixed(0), 2, gy + 3);
    }
    for (var h = 0; h < 24; h++) {
      var barH = (values[h] / maxV) * (H - pad * 2);
      var x = 42 + h * (barW + 3), y = H - pad - barH;
      var night = h < 6 || h > 22;
      ctx.fillStyle = night ? 'rgba(100,116,139,0.5)' : 'rgba(168,85,247,0.7)';
      ctx.fillRect(x, y, barW, barH);
      if (h % 3 === 0) { ctx.fillStyle = '#94a3b8'; ctx.font = '8px Arial'; ctx.textAlign = 'center'; ctx.fillText(h + '时', x + barW / 2, H - pad + 12); }
    }
    // 目标线
    var goalY = H - pad - (this._settings.dailyGoal / 24 / (maxV || 1)) * (H - pad * 2);
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(40, goalY); ctx.lineTo(W - 10, goalY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#fbbf24'; ctx.font = '9px Arial'; ctx.fillText('目标', W - 40, goalY - 4);
  },

  _drawPie: function () {
    var canvas = document.getElementById('kcal-pie');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width = 300, H = canvas.height = 180;
    ctx.clearRect(0, 0, W, H);
    var bd = this._getGameBreakdown();
    var total = Object.values(bd).reduce(function (a, b) { return a + b; }, 0) || 1;
    var colors = { '🏃 地铁跑酷': '#f97316', '🏀 投篮挑战': '#3b82f6', '🎮 Galgame': '#ec4899', '🧩 体感方块': '#22c55e' };
    var cx = 80, cy = 90, r = 60, angle = -Math.PI / 2;
    Object.entries(bd).forEach(function (e) {
      var slice = (e[1] / total) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.fillStyle = colors[e[0]] || '#94a3b8';
      ctx.fill();
      angle += slice;
    });
    // 图例
    var ly = 30;
    Object.keys(colors).forEach(function (g, i) {
      ctx.fillStyle = colors[g]; ctx.fillRect(160, ly + i * 30, 12, 12);
      ctx.fillStyle = '#cbd5e1'; ctx.font = '11px Arial'; ctx.textAlign = 'left';
      ctx.fillText(g + ' ' + ((bd[g] || 0) / total * 100).toFixed(0) + '%', 178, ly + i * 30 + 11);
    });
  },

  _exportXLS: function () {
    var rows = [['日期', '时间', '游戏', '消耗(kcal)', 'MET', '得分', '时长(秒)']];
    var self = this;
    this._sessions.forEach(function (s) {
      rows.push([s.date, s.hour + ':00', s.game, s.kcal.toFixed(1), self._MET[s.game] || 4, s.score, s.duration]);
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
    var backdrop = document.getElementById('kcal-backdrop');
    if (backdrop) backdrop.style.display = 'block';
    panel.style.display = 'flex';

    var today = this._getToday();
    var totalKcal = this._sessions.reduce(function (a, s) { return a + s.kcal; }, 0);
    var totalMin = this._sessions.reduce(function (a, s) { return a + Math.round(s.duration / 60); }, 0);
    var streak = this._getStreak();
    var dailyPct = Math.min(100, Math.round(today.kcal / this._settings.dailyGoal * 100));
    var weekKcal = Object.values(this._getWeekData()).reduce(function (a, b) { return a + b; }, 0);
    var weekPct = Math.min(100, Math.round(weekKcal / this._settings.weeklyGoal * 100));

    document.getElementById('kcal-summary').innerHTML =
      '<div class="kcal-summary-card"><div class="val">' + today.count + '</div><div class="lbl">今日次数</div></div>' +
      '<div class="kcal-summary-card"><div class="val" style="color:' + (dailyPct >= 100 ? '#4ade80' : '#fbbf24') + '">' + today.kcal.toFixed(1) + '</div><div class="lbl">今日 kcal (' + dailyPct + '%)</div></div>' +
      '<div class="kcal-summary-card"><div class="val">' + today.min + '</div><div class="lbl">今日分钟</div></div>' +
      '<div class="kcal-summary-card"><div class="val">' + (streak > 0 ? '🔥' + streak + '天' : '0') + '</div><div class="lbl">连续打卡</div></div>' +
      '<div class="kcal-summary-card"><div class="val">' + weekKcal.toFixed(0) + '</div><div class="lbl">本周 /' + this._settings.weeklyGoal + ' (' + weekPct + '%)</div></div>' +
      '<div class="kcal-summary-card"><div class="val">' + totalMin + '</div><div class="lbl">累计分钟</div></div>';

    // 设定面板
    document.getElementById('kcal-settings').innerHTML =
      '<span style="color:#94a3b8;font-size:0.75rem;">体重</span><input id="kcal-set-weight" value="' + this._settings.weight + '" style="width:50px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;">kg' +
      '<span style="color:#94a3b8;font-size:0.75rem;margin-left:10px;">日目标</span><input id="kcal-set-daily" value="' + this._settings.dailyGoal + '" style="width:50px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;">kcal' +
      '<span style="color:#94a3b8;font-size:0.75rem;margin-left:10px;">周目标</span><input id="kcal-set-weekly" value="' + this._settings.weeklyGoal + '" style="width:50px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;">kcal' +
      '<button id="kcal-save-settings" style="margin-left:10px;background:#a855f7;border:none;border-radius:6px;padding:4px 12px;color:#fff;cursor:pointer;font-size:0.75rem;">保存</button>';

    // 表格
    var tbody = document.querySelector('#kcal-table tbody');
    if (tbody) {
      tbody.innerHTML = '';
      this._sessions.slice(-20).reverse().forEach(function (s) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + s.date + '</td><td>' + s.game + '</td><td>' + s.kcal.toFixed(1) + '</td><td>' + (s.duration >= 60 ? Math.round(s.duration / 60) : '<1') + '分</td>';
        tbody.appendChild(tr);
      });
    }

    setTimeout(this._drawChart.bind(this), 100);
    setTimeout(this._drawPie.bind(this), 150);
  },

  close: function () {
    var panel = document.getElementById('kcal-report-panel');
    if (panel) panel.style.display = 'none';
    var backdrop = document.getElementById('kcal-backdrop');
    if (backdrop) backdrop.style.display = 'none';
  },

  // ====== AI 聊天 (保留) ======
  _chatHistory: [],
  _askAI: function () {
    var input = document.getElementById('kcal-ai-input');
    var question = (input && input.value.trim()) || '分析我的运动数据';
    if (input) input.value = '';

    this._chatHistory.push({ role: 'user', text: question });
    this._renderChat();

    var today = this._getToday();
    var weekData = this._getWeekData();
    var weekVals = Object.values(weekData);
    var totalWeek = weekVals.reduce(function (a, b) { return a + b; }, 0);
    var bd = this._getGameBreakdown();
    var topGame = Object.entries(bd).sort(function (a, b) { return b[1] - a[1]; })[0];
    var streak = this._getStreak();
    var dailyPct = Math.round(today.kcal / this._settings.dailyGoal * 100);

    var dataCtx = '今日' + today.count + '次,' + today.kcal.toFixed(1) + 'kcal(' + dailyPct + '%),' + today.min + '分钟; 连续' + streak + '天; 最爱:' + (topGame ? topGame[0] : '无') + '; 7天' + totalWeek.toFixed(0) + '/' + this._settings.weeklyGoal + 'kcal';

    var self = this;
    var fallback = '💪 今日' + today.kcal.toFixed(0) + 'kcal (' + dailyPct + '%)' + (streak > 1 ? '，连续' + streak + '天打卡！' : '') + (dailyPct >= 100 ? ' 🎉目标达成！' : '，还差' + (this._settings.dailyGoal - today.kcal).toFixed(0) + 'kcal');

    for (var i = 0; i < self._chatHistory.length; i++) {
      if (self._chatHistory[i].id === 'ai-stream') delete self._chatHistory[i].id;
    }
    var wsSent = false, idleTimer = null;
    try {
      var ws = new WebSocket('ws://localhost:8083');
      var resetIdle = function () { if (idleTimer) clearTimeout(idleTimer); idleTimer = setTimeout(function () { if (ws.readyState === WebSocket.OPEN) ws.close(); }, 15000); };
      ws.onopen = function () { ws.send(JSON.stringify({ type: 'chat', question: question, data: dataCtx })); wsSent = true; self._chatHistory.push({ role: 'ai', id: 'ai-stream', text: '⏳...' }); self._renderChat(); resetIdle(); };
      ws.onmessage = function (e) { resetIdle(); var d = JSON.parse(e.data); if (d.type === 'reply_chunk') { var el = document.getElementById('ai-stream'); if (el) { if (el.textContent === '⏳...') el.textContent = ''; el.textContent += d.text; } } else if (d.type === 'reply_done') { var el = document.getElementById('ai-stream'); if (el) { for (var j = self._chatHistory.length - 1; j >= 0; j--) { if (self._chatHistory[j].id === 'ai-stream') { self._chatHistory[j].text = el.textContent; delete self._chatHistory[j].id; break; } } el.removeAttribute('id'); } if (idleTimer) clearTimeout(idleTimer); ws.close(); } };
      ws.onerror = function (err) {
        console.error('[AI报告] WebSocket 连接失败，请检查 Python 后端是否已运行在 8083 端口');
        self._chatHistory.push({ role: 'ai', text: '⚠️ AI教练连接失败，请确认已启动: python kcal_ai_service.py' });
        self._renderChat();
      };
      setTimeout(function () { if (!wsSent) { ws.close(); self._chatHistory.push({ role: 'ai', text: fallback }); self._renderChat(); } }, 4000);
    } catch (e) { self._chatHistory.push({ role: 'ai', text: fallback }); self._renderChat(); }
  },

  _renderChat: function () {
    var el = document.getElementById('kcal-ai-reply');
    if (!el) return;
    var streamEl = document.getElementById('ai-stream'), streamText = streamEl ? streamEl.textContent : '';
    var html = '';
    for (var i = Math.max(0, this._chatHistory.length - 6); i < this._chatHistory.length; i++) {
      var m = this._chatHistory[i];
      var color = m.role === 'ai' ? 'color:#86efac;' : 'color:#fbbf24;text-align:right;';
      var label = m.role === 'ai' ? '🤖 卡卡' : '👤 你';
      if (m.id === 'ai-stream') html += '<div style="margin:4px 0;' + color + '"><b>' + label + ':</b> <span id="ai-stream">' + streamText + '</span></div>';
      else html += '<div style="margin:4px 0;' + color + '"><b>' + label + ':</b> ' + m.text + '</div>';
    }
    el.innerHTML = html;
  }
};

AIReport.init();

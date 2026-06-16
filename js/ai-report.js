// ====================================================================
// ai-report.js — 卡路里数据报告面板（增强版）
// 基于 Harris-Benedict BMR × MET × 时间的科学卡路里模型
// 参考: 多参数线性模型 (体重+身高+年龄) + 物理兜底保护
// ====================================================================

var AIReport = {
  _sessions: [],
  _settings: { weight: 70, height: 175, age: 25, dailyGoal: 100, weeklyGoal: 500 },

  // MET 代谢当量表 (每游戏) — 1 MET = 1 kcal/kg/h (静息代谢)
  _MET: { '🏃 地铁跑酷': 6.0, '🏀 投篮挑战': 7.5, '🎮 Galgame': 1.5, '🧩 体感方块': 3.5 },

  /**
   * 计算基础代谢率 BMR (Harris-Benedict 公式)
   * BMR = 88.362 + 13.397×W + 4.799×H - 5.677×A  (男性)
   * BMR = 447.593 + 9.247×W + 3.098×H - 4.330×A  (女性)
   * @returns {number} 每日基础代谢 (kcal/day)，物理兜底 ≥ 0
   */
  _calculateBMR: function (weight, height, age, gender) {
    var bmr;
    if (gender === 'female') {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
    } else {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    }
    return Math.max(0, bmr);  // 物理兜底 — 极端输入下不产生负数
  },

  /**
   * 核心卡路里计算公式
   * kcal = MET × BMR/24 × duration_hours
   *      = MET × BMR × duration_sec / 86400
   *
   * 系数结构 (展开后等价于):
   *   calories_per_minute = (MET×13.397/1440)×W + (MET×4.799/1440)×H - (MET×5.677/1440)×A + (MET×88.362/1440)
   *   即: a×W + b×H + c×A + d    (四参数线性模型，同参考公式结构)
   */
  _calculateCalories: function (gameName, durationSec) {
    var met = this._MET[gameName] || 4;
    var w = this._settings.weight || 70;
    var h = this._settings.height || 175;
    var a = this._settings.age || 25;
    var g = this._settings.gender || 'male';

    var bmr = this._calculateBMR(w, h, a, g);
    // MET × BMR(kcal/day) × duration(秒) / 86400(秒/天)
    var kcal = met * bmr * (durationSec / 86400);
    return Math.max(0, parseFloat(kcal.toFixed(1)));  // 物理兜底
  },

  init: function () {
    var raw = localStorage.getItem('hcigame_sessions');
    if (raw) { try { this._sessions = JSON.parse(raw); } catch (e) { this._sessions = []; } }
    var cfg = localStorage.getItem('hcigame_settings');
    if (cfg) {
      try {
        var s = JSON.parse(cfg);
        this._settings.weight = s.weight || 70;
        this._settings.height = s.height || 175;
        this._settings.age = s.age || 25;
        this._settings.gender = s.gender || 'male';
        this._settings.dailyGoal = s.dailyGoal || 100;
        this._settings.weeklyGoal = s.weeklyGoal || 500;
      } catch (e) {}
    }
    this._bindUI();
    this._updateBadge();
  },

  _bindUI: function () {
    var self = this;
    setTimeout(function () {
      var badge = document.getElementById('kcal-badge');
      if (badge) badge.onclick = function () { Dashboard.open(); };
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
    // BMR × MET 科学计算 (多参数线性模型)
    var finalKcal = this._calculateCalories(gameName, durationSec);
    // 兜底: 如果计算结果为0但局内有累加值，使用局内值
    if (finalKcal <= 0 && kcal > 0) finalKcal = parseFloat(kcal.toFixed(1));
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
    var h = parseFloat(document.getElementById('kcal-set-height').value) || 175;
    var age = parseInt(document.getElementById('kcal-set-age').value) || 25;
    var g = document.getElementById('kcal-set-gender') ? document.getElementById('kcal-set-gender').value : 'male';
    var d = parseInt(document.getElementById('kcal-set-daily').value) || 100;
    var wk = parseInt(document.getElementById('kcal-set-weekly').value) || 500;
    this._settings = { weight: w, height: h, age: age, gender: g, dailyGoal: d, weeklyGoal: wk };
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

    // 设定面板 (体重/身高/年龄/性别/目标)
    var s = this._settings;
    var genderOpt = '<select id="kcal-set-gender" style="width:52px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;font-size:0.7rem;">' +
      '<option value="male"' + (s.gender === 'male' ? ' selected' : '') + '>男</option>' +
      '<option value="female"' + (s.gender === 'female' ? ' selected' : '') + '>女</option></select>';
    document.getElementById('kcal-settings').innerHTML =
      '<span style="color:#94a3b8;font-size:0.75rem;">体重</span><input id="kcal-set-weight" value="' + s.weight + '" style="width:44px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;font-size:0.7rem;">kg' +
      '<span style="color:#94a3b8;font-size:0.75rem;margin-left:8px;">身高</span><input id="kcal-set-height" value="' + s.height + '" style="width:44px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;font-size:0.7rem;">cm' +
      '<span style="color:#94a3b8;font-size:0.75rem;margin-left:8px;">年龄</span><input id="kcal-set-age" value="' + s.age + '" style="width:38px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;font-size:0.7rem;">岁' +
      '<span style="color:#94a3b8;font-size:0.75rem;margin-left:8px;">性别</span>' + genderOpt +
      '<span style="color:#94a3b8;font-size:0.75rem;margin-left:10px;">日目标</span><input id="kcal-set-daily" value="' + s.dailyGoal + '" style="width:44px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;font-size:0.7rem;">kcal' +
      '<span style="color:#94a3b8;font-size:0.75rem;margin-left:8px;">周目标</span><input id="kcal-set-weekly" value="' + s.weeklyGoal + '" style="width:44px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;font-size:0.7rem;">kcal' +
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

    self._chatHistory = self._chatHistory.filter(function (m) { return m.id !== 'ai-stream'; });
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

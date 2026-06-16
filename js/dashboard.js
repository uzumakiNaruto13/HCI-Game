// ====================================================================
// dashboard.js — 独立数据仪表盘 (FastAPI 数据 + AI 教练 + 图表)
// Phase 2: 数据同步 | Phase 3: 排行榜 + 社交 + 推送
// ====================================================================

var Dashboard = {
  _chatHistory: [],
  _MET: { '🏃 地铁跑酷': 6.0, '🏀 投篮挑战': 7.5, '🎮 Galgame': 1.5, '🧩 体感方块': 3.5 },
  _activeTab: 'overview',
  _lbScope: 'today',

  open: function () {
    UIManager.showScreen('screen-dashboard');
    // 仪表盘不采集摄像头，隐藏 LIVE TRACKING 面板
    var hud = document.getElementById('cam-preview-hud');
    var side = document.getElementById('cam-canvas-side');
    if (hud) hud.style.display = 'none';
    if (side) side.style.display = 'none';

    // 更新同步状态
    this._updateSyncStatus();

    this._refresh();
    this._bindEvents();
    this._initTabs();
    this._loadLeaderboard('today');
  },

  // ====== 事件绑定 ======
  _bindEvents: function () {
    var self = this;
    document.getElementById('dash-back-btn').onclick = function () { backToLobby(); };
    document.getElementById('dash-ai-send').onclick = function () { self._askAI(); };
    document.getElementById('kcal-ai-send').onclick = function () { self._askAI(); };
    document.getElementById('kcal-save-settings').onclick = function () { self._saveSettings(); };
    document.getElementById('kcal-export-btn').onclick = function () { self._exportCSV(); };
    document.getElementById('kcal-report-close').onclick = function () { self._closeModal(); };

    // 同步按钮
    var syncBtn = document.getElementById('dash-sync-btn');
    if (syncBtn) syncBtn.onclick = function () { self._syncData(); };

    // 社交搜索/关注
    var searchBtn = document.getElementById('social-search-btn');
    if (searchBtn) searchBtn.onclick = function () { self._handleFollow(); };
    var searchInput = document.getElementById('social-search-input');
    if (searchInput) {
      searchInput.onkeydown = function (e) { if (e.key === 'Enter') self._handleFollow(); };
    }
  },

  // ====== Tab 切换 ======
  _initTabs: function () {
    var self = this;
    document.querySelectorAll('.dash-tab').forEach(function (tab) {
      tab.onclick = function () {
        var tabName = this.dataset.dtab;
        self._switchTab(tabName);
      };
    });

    // 排行榜 scope 按钮
    document.querySelectorAll('.lb-scope-btn').forEach(function (btn) {
      btn.onclick = function () {
        var scope = this.dataset.lbscope;
        self._lbScope = scope;
        document.querySelectorAll('.lb-scope-btn').forEach(function (b) {
          b.style.background = 'rgba(255,255,255,0.03)';
          b.style.borderColor = 'rgba(255,255,255,0.1)';
          b.style.color = '#94a3b8';
          b.classList.remove('active');
        });
        this.style.background = 'rgba(168,85,247,0.2)';
        this.style.borderColor = 'rgba(168,85,247,0.5)';
        this.style.color = '#e2e8f0';
        this.classList.add('active');
        self._loadLeaderboard(scope);
      };
    });
  },

  _switchTab: function (tabName) {
    this._activeTab = tabName;
    // 更新 tab 样式
    document.querySelectorAll('.dash-tab').forEach(function (t) {
      t.style.background = 'rgba(255,255,255,0.03)';
      t.style.borderColor = 'rgba(255,255,255,0.08)';
      t.style.color = '#94a3b8';
      t.classList.remove('active');
    });
    var activeTab = document.querySelector('.dash-tab[data-dtab="' + tabName + '"]');
    if (activeTab) {
      activeTab.style.background = 'rgba(168,85,247,0.2)';
      activeTab.style.borderColor = 'rgba(168,85,247,0.4)';
      activeTab.style.color = '#e2e8f0';
      activeTab.classList.add('active');
    }

    // 切换面板
    document.getElementById('dash-panel-overview').style.display = tabName === 'overview' ? '' : 'none';
    document.getElementById('dash-panel-leaderboard').style.display = tabName === 'leaderboard' ? '' : 'none';
    document.getElementById('dash-panel-social').style.display = tabName === 'social' ? '' : 'none';

    // 加载对应数据
    if (tabName === 'leaderboard') this._loadLeaderboard(this._lbScope);
    if (tabName === 'social') { this._loadFriends(); this._loadFeed(); }
    if (tabName === 'overview') this._refresh();
  },

  // ====== 数据同步状态 ======
  _updateSyncStatus: function () {
    var el = document.getElementById('dash-sync-status');
    var btn = document.getElementById('dash-sync-btn');
    if (!el) return;
    if (API.isLoggedIn()) {
      el.textContent = '☁️ 已登录 · 云端数据';
      el.style.color = '#4ade80';
      if (btn) btn.style.display = '';
    } else {
      el.textContent = '💻 本地数据 (未登录)';
      el.style.color = '#fbbf24';
      if (btn) btn.style.display = 'none';
    }
  },

  // ====== Phase 2: 数据同步 (localStorage → 服务器) ======
  _syncData: function () {
    if (!API.isLoggedIn()) {
      alert('请先登录以同步数据到云端');
      return;
    }
    var self = this;
    var sessions = [];
    try { sessions = JSON.parse(localStorage.getItem('hcigame_sessions') || '[]'); } catch (e) {}
    var totalKcal = parseFloat(localStorage.getItem('hcigame_total_kcal') || '0');

    var btn = document.getElementById('dash-sync-btn');
    if (btn) { btn.textContent = '⏳ 同步中...'; btn.disabled = true; }

    API.syncLocalData(sessions, totalKcal).then(function (r) {
      if (btn) { btn.textContent = '🔄 同步数据'; btn.disabled = false; }
      if (r && r.ok) {
        var status = document.getElementById('dash-sync-status');
        if (status) status.textContent = '☁️ 已同步 ' + r.imported + ' 条记录';
        self._refresh();
      }
    }).catch(function () {
      if (btn) { btn.textContent = '🔄 同步数据'; btn.disabled = false; }
    });
  },

  _closeModal: function () {
    document.getElementById('kcal-report-panel').style.display = 'none';
    document.getElementById('kcal-backdrop').style.display = 'none';
  },

  // ====== 数据刷新 ======
  _refresh: function () {
    var self = this;
    // 优先从 FastAPI 拉数据
    if (API.isLoggedIn()) {
      API.getReport().then(function (r) {
        if (r && r.today_kcal !== undefined) {
          // 合并 sessions 数据用于表格
          self._data = r;
          self._data.sessions = self._data.sessions || [];
          self._render(r);
        } else { self._renderLocal(); }
      }).catch(function () { self._renderLocal(); });
    } else {
      this._renderLocal();
    }
  },

  _renderLocal: function () {
    var sessions = [];
    try { sessions = JSON.parse(localStorage.getItem('hcigame_sessions') || '[]'); } catch (e) {}
    var today = new Date().toISOString().slice(0, 10);
    var todayS = sessions.filter(function (s) { return s.date === today; });
    var allS = sessions;
    var weekS = []; var ws = new Date(); ws.setDate(ws.getDate() - ws.getDay());
    var wsd = ws.toISOString().slice(0, 10);
    weekS = sessions.filter(function (s) { return s.date >= wsd; });

    var data = {
      today_kcal: todayS.reduce(function (a, s) { return a + s.kcal; }, 0),
      today_count: todayS.length,
      today_min: Math.round(todayS.reduce(function (a, s) { return a + s.duration; }, 0) / 60),
      week_kcal: weekS.reduce(function (a, s) { return a + s.kcal; }, 0),
      total_kcal: allS.reduce(function (a, s) { return a + s.kcal; }, 0),
      total_min: Math.round(allS.reduce(function (a, s) { return a + s.duration; }, 0) / 60),
      streak: this._calcStreak(sessions),
      daily_goal: 100, weekly_goal: 500,
      game_breakdown: this._calcBreakdown(allS),
      hourly: this._calcHourly(todayS),
      week_data: this._calcWeek(allS),
      sessions: sessions
    };
    data.daily_pct = data.daily_goal ? Math.round(data.today_kcal / data.daily_goal * 100) : 0;
    data.weekly_pct = data.weekly_goal ? Math.round(data.week_kcal / data.weekly_goal * 100) : 0;
    this._data = data;
    this._render(data);
  },

  _render: function (data) {
    var cfg = {};
    try { cfg = JSON.parse(localStorage.getItem('hcigame_settings') || '{}'); } catch (e) {}
    var weight = cfg.weight || 70;
    var height = cfg.height || 175;
    var age = cfg.age || 25;
    var gender = cfg.gender || 'male';
    var dailyGoal = cfg.dailyGoal || 100;
    var weeklyGoal = cfg.weeklyGoal || 500;

    var dailyPct = Math.min(100, Math.round(data.today_kcal / dailyGoal * 100));
    var weeklyPct = Math.min(100, Math.round(data.week_kcal / weeklyGoal * 100));

    // 概要卡片
    var sumEl = document.getElementById('dash-summary') || document.getElementById('kcal-summary');
    if (sumEl) sumEl.innerHTML =
      '<div class="kcal-summary-card"><div class="val">' + (data.today_count || 0) + '</div><div class="lbl">今日次数</div></div>' +
      '<div class="kcal-summary-card"><div class="val" style="color:' + (dailyPct >= 100 ? '#4ade80' : '#fbbf24') + '">' + (data.today_kcal || 0).toFixed(1) + '</div><div class="lbl">今日 kcal (' + dailyPct + '%)</div></div>' +
      '<div class="kcal-summary-card"><div class="val">' + (data.today_min || 0) + '</div><div class="lbl">今日分钟</div></div>' +
      '<div class="kcal-summary-card"><div class="val">' + (data.streak > 0 ? '🔥' + data.streak + '天' : '0') + '</div><div class="lbl">连续打卡</div></div>' +
      '<div class="kcal-summary-card"><div class="val">' + (data.week_kcal || 0).toFixed(0) + '</div><div class="lbl">本周 /' + weeklyGoal + ' (' + weeklyPct + '%)</div></div>' +
      '<div class="kcal-summary-card"><div class="val">' + (data.total_min || 0) + '</div><div class="lbl">累计分钟</div></div>';

    // 设定栏 (体重/身高/年龄/性别/目标)
    var genderOpt = '<select id="kcal-set-gender" style="width:52px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;font-size:0.7rem;">' +
      '<option value="male"' + (gender === 'male' ? ' selected' : '') + '>男</option>' +
      '<option value="female"' + (gender === 'female' ? ' selected' : '') + '>女</option></select>';
    var setEl = document.getElementById('dash-settings') || document.getElementById('kcal-settings');
    if (setEl) setEl.innerHTML =
      '<span style="color:#94a3b8;font-size:0.75rem;">体重</span><input id="kcal-set-weight" value="' + weight + '" style="width:44px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;font-size:0.7rem;">kg' +
      '<span style="color:#94a3b8;font-size:0.75rem;margin-left:8px;">身高</span><input id="kcal-set-height" value="' + height + '" style="width:44px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;font-size:0.7rem;">cm' +
      '<span style="color:#94a3b8;font-size:0.75rem;margin-left:8px;">年龄</span><input id="kcal-set-age" value="' + age + '" style="width:38px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;font-size:0.7rem;">岁' +
      '<span style="color:#94a3b8;font-size:0.75rem;margin-left:8px;">性别</span>' + genderOpt +
      '<span style="color:#94a3b8;font-size:0.75rem;margin-left:10px;">日目标</span><input id="kcal-set-daily" value="' + dailyGoal + '" style="width:44px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;font-size:0.7rem;">kcal' +
      '<span style="color:#94a3b8;font-size:0.75rem;margin-left:8px;">周目标</span><input id="kcal-set-weekly" value="' + weeklyGoal + '" style="width:44px;margin:0 8px 0 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#e2e8f0;padding:4px;font-size:0.7rem;">kcal' +
      '<button id="kcal-save-settings" style="margin-left:10px;background:#a855f7;border:none;border-radius:6px;padding:4px 12px;color:#fff;cursor:pointer;font-size:0.75rem;">保存</button>';

    // 表格
    var tbody = document.querySelector('#dash-table tbody') || document.querySelector('#kcal-table tbody');
    if (tbody) {
      tbody.innerHTML = '';
      var sessions = data.sessions || [];
      sessions.slice(-15).reverse().forEach(function (s) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + s.date + '</td><td>' + (s.game || s.game_name) + '</td><td>' + (s.kcal || 0).toFixed(1) + '</td><td>' + ((s.duration || s.duration_sec) >= 60 ? Math.round((s.duration || s.duration_sec) / 60) : '<1') + '分</td>';
        tbody.appendChild(tr);
      });
    }

    // 图表
    this._data = data;
    setTimeout(function () { Dashboard._drawChart(data); Dashboard._drawPie(data); }, 200);

    // Phase 3: 检查目标达成并发送通知
    this._checkGoalNotification(data, dailyGoal, weeklyGoal);
  },

  // ====== Phase 3: 排行榜 ======
  _loadLeaderboard: function (scope) {
    var list = document.getElementById('dash-leaderboard-list');
    if (!list) return;
    list.innerHTML = '<div style="text-align:center;color:#64748b;padding:40px;">加载中...</div>';

    var self = this;
    API.getLeaderboard(scope).then(function (ranks) {
      if (!ranks || !ranks.length) {
        list.innerHTML = '<div style="text-align:center;color:#64748b;padding:40px;">暂无数据，快去运动吧！🏃</div>';
        return;
      }

      var medals = ['🥇', '🥈', '🥉'];
      var scopeLabel = { today: '今日', week: '本周', all: '累计' }[scope] || '今日';

      var html = '<div style="color:#e2e8f0;font-weight:bold;margin-bottom:12px;">🏆 ' + scopeLabel + '排行榜 TOP ' + ranks.length + '</div>';

      ranks.forEach(function (r, i) {
        var medal = i < 3 ? medals[i] : ('<span style="color:#64748b;min-width:24px;display:inline-block;">' + (i + 1) + '</span>');
        var bgColor = i === 0 ? 'rgba(255,215,0,0.08)' : (i === 1 ? 'rgba(192,192,192,0.06)' : (i === 2 ? 'rgba(205,127,50,0.05)' : 'transparent'));
        var barW = Math.max(2, (r.kcal / Math.max(1, ranks[0].kcal)) * 100);
        html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;margin-bottom:4px;background:' + bgColor + ';border-radius:8px;">' +
          '<span style="font-size:1.2rem;min-width:28px;text-align:center;">' + medal + '</span>' +
          '<span style="font-weight:bold;color:#e2e8f0;min-width:80px;">' + self._escapeHtml(r.username) + '</span>' +
          '<div style="flex:1;background:rgba(168,85,247,0.15);border-radius:4px;height:18px;position:relative;">' +
            '<div style="background:linear-gradient(90deg, #a855f7, #7c3aed);height:100%;width:' + barW + '%;border-radius:4px;min-width:2px;"></div>' +
          '</div>' +
          '<span style="color:#fbbf24;font-weight:bold;min-width:60px;text-align:right;">' + r.kcal.toFixed(0) + ' kcal</span>' +
          (r.streak !== undefined ? '<span style="color:#94a3b8;font-size:0.7rem;min-width:40px;text-align:right;">🔥' + r.streak + '天</span>' : '') +
        '</div>';
      });

      list.innerHTML = html;
    }).catch(function () {
      list.innerHTML = '<div style="text-align:center;color:#f87171;padding:40px;">加载失败，请检查服务器连接</div>';
    });
  },

  // ====== Phase 3: 社交 - 好友列表 ======
  _loadFriends: function () {
    var list = document.getElementById('dash-friends-list');
    if (!list) return;

    if (!API.isLoggedIn()) {
      list.innerHTML = '<div style="text-align:center;color:#64748b;padding:30px;">请先登录以查看好友</div>';
      return;
    }

    list.innerHTML = '<div style="text-align:center;color:#64748b;padding:20px;">加载中...</div>';

    API.getFriends().then(function (data) {
      if (!data) {
        list.innerHTML = '<div style="text-align:center;color:#f87171;padding:20px;">加载失败</div>';
        return;
      }

      var html = '';

      // 我关注的
      if (data.following && data.following.length > 0) {
        html += '<div style="color:#94a3b8;font-size:0.7rem;margin-bottom:6px;">我关注的 (' + data.following_count + ')</div>';
        data.following.forEach(function (f) {
          html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;margin-bottom:4px;background:rgba(168,85,247,0.06);border-radius:6px;">' +
            '<div><span style="color:#e2e8f0;font-weight:bold;">' + Dashboard._escapeHtml(f.username) + '</span>' +
            (f.is_mutual ? '<span style="color:#fbbf24;font-size:0.65rem;margin-left:4px;">🤝 互关</span>' : '') +
            '</div>' +
            '<div style="display:flex;gap:12px;align-items:center;">' +
              '<span style="color:#fbbf24;font-size:0.7rem;">🔥' + f.today_kcal.toFixed(0) + ' kcal</span>' +
              '<span style="color:#94a3b8;font-size:0.65rem;">🔥' + f.streak + '天</span>' +
              '<button onclick="Dashboard._unfollowUser(\'' + Dashboard._escapeHtml(f.username) + '\')" style="background:rgba(248,113,113,0.2);border:1px solid rgba(248,113,113,0.3);color:#f87171;font-size:0.6rem;padding:2px 8px;border-radius:4px;cursor:pointer;">取消</button>' +
            '</div></div>';
        });
      } else {
        html += '<div style="color:#64748b;font-size:0.75rem;padding:8px;">还没有关注任何人</div>';
      }

      // 关注我的
      if (data.followers && data.followers.length > 0) {
        html += '<div style="color:#94a3b8;font-size:0.7rem;margin:8px 0 6px;">关注我的 (' + data.follower_count + ')</div>';
        data.followers.forEach(function (f) {
          html += '<div style="padding:4px 8px;color:#94a3b8;font-size:0.75rem;">' + Dashboard._escapeHtml(f.username) + '</div>';
        });
      }

      list.innerHTML = html || '<div style="text-align:center;color:#64748b;padding:20px;">暂无好友</div>';
    }).catch(function () {
      list.innerHTML = '<div style="text-align:center;color:#f87171;padding:20px;">加载失败</div>';
    });
  },

  // ====== Phase 3: 社交 - 动态流 ======
  _loadFeed: function () {
    var list = document.getElementById('dash-feed-list');
    if (!list) return;

    if (!API.isLoggedIn()) {
      list.innerHTML = '<div style="text-align:center;color:#64748b;padding:30px;">请先登录以查看动态</div>';
      return;
    }

    list.innerHTML = '<div style="text-align:center;color:#64748b;padding:20px;">加载中...</div>';

    API.getFeed(30).then(function (feeds) {
      if (!feeds || !feeds.length) {
        list.innerHTML = '<div style="text-align:center;color:#64748b;padding:30px;">暂无动态，关注好友或开始运动吧！</div>';
        return;
      }

      var typeIcons = { game_played: '🎮', goal_achieved: '🎯', streak_milestone: '🔥', followed: '👋' };
      var html = '';
      feeds.forEach(function (f) {
        var icon = typeIcons[f.activity_type] || '📌';
        html += '<div style="padding:8px;margin-bottom:6px;background:rgba(255,255,255,0.02);border-radius:8px;border-left:2px solid rgba(168,85,247,0.3);">' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">' +
            '<span style="color:#a855f7;font-weight:bold;font-size:0.75rem;">' + Dashboard._escapeHtml(f.username) + '</span>' +
            '<span style="font-size:0.75rem;">' + icon + '</span>' +
            '<span style="color:#64748b;font-size:0.6rem;margin-left:auto;">' + Dashboard._formatTime(f.created_at) + '</span>' +
          '</div>' +
          '<div style="color:#cbd5e1;font-size:0.75rem;">' + Dashboard._escapeHtml(f.content) + '</div>' +
        '</div>';
      });
      list.innerHTML = html;
    }).catch(function () {
      list.innerHTML = '<div style="text-align:center;color:#f87171;padding:20px;">加载失败</div>';
    });
  },

  _handleFollow: function () {
    var input = document.getElementById('social-search-input');
    if (!input) return;
    var username = input.value.trim();
    if (!username) return;

    if (!API.isLoggedIn()) {
      alert('请先登录');
      return;
    }

    var self = this;
    API.follow(username).then(function (r) {
      if (r && r.ok) {
        input.value = '';
        self._loadFriends();
        self._loadFeed();
      } else {
        alert(r.detail || '关注失败');
      }
    }).catch(function () {
      alert('关注失败，请检查用户名是否正确');
    });
  },

  _unfollowUser: function (username) {
    if (!confirm('确定取消关注 ' + username + ' 吗？')) return;
    var self = this;
    API.unfollow(username).then(function (r) {
      if (r && r.ok) { self._loadFriends(); self._loadFeed(); }
      else { alert(r.detail || '操作失败'); }
    });
  },

  // ====== 辅助方法 ======
  _escapeHtml: function (str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  _formatTime: function (isoStr) {
    if (!isoStr) return '';
    try {
      var d = new Date(isoStr);
      var now = new Date();
      var diff = now - d;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      return d.toLocaleDateString('zh-CN');
    } catch (e) { return ''; }
  },

  // ====== Phase 3: 目标达成推送通知 ======
  _checkGoalNotification: function (data, dailyGoal, weeklyGoal) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'denied') return;

    // 每日目标达成
    if (data.today_kcal >= dailyGoal && data.today_kcal > 0) {
      var todayDone = sessionStorage.getItem('hcigame_notified_daily_' + new Date().toISOString().slice(0, 10));
      if (!todayDone) {
        this._sendNotification('🎯 每日目标达成！', '今日已消耗 ' + data.today_kcal.toFixed(0) + ' kcal，超过了 ' + dailyGoal + ' kcal 的目标！');
        sessionStorage.setItem('hcigame_notified_daily_' + new Date().toISOString().slice(0, 10), '1');
      }
    }

    // 每周目标达成
    if (data.week_kcal >= weeklyGoal && data.week_kcal > 0) {
      var weekDone = sessionStorage.getItem('hcigame_notified_weekly_' + new Date().toISOString().slice(0, 7));
      if (!weekDone) {
        this._sendNotification('🏆 每周目标达成！', '本周已消耗 ' + data.week_kcal.toFixed(0) + ' kcal，达成了 ' + weeklyGoal + ' kcal 的周目标！');
        sessionStorage.setItem('hcigame_notified_weekly_' + new Date().toISOString().slice(0, 7), '1');
      }
    }

    // 连续打卡里程碑 (3天, 7天, 30天)
    if (data.streak > 0 && [3, 7, 30].indexOf(data.streak) !== -1) {
      var streakDone = sessionStorage.getItem('hcigame_notified_streak_' + data.streak);
      if (!streakDone) {
        this._sendNotification('🔥 连续' + data.streak + '天打卡！', '你已经连续运动 ' + data.streak + ' 天了，保持节奏！');
        sessionStorage.setItem('hcigame_notified_streak_' + data.streak, '1');
      }
    }
  },

  _sendNotification: function (title, body) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(function (perm) {
        if (perm === 'granted') {
          new Notification(title, { body: body, icon: '🎯', tag: 'hcigame' });
        }
      });
    } else if (Notification.permission === 'granted') {
      new Notification(title, { body: body, icon: '🎯', tag: 'hcigame' });
    }
  },

  // ====== 旧方法 (保留兼容) ======
  _saveSettings: function () {
    var w = parseFloat(document.getElementById('kcal-set-weight').value) || 70;
    var h = parseFloat(document.getElementById('kcal-set-height').value) || 175;
    var age = parseInt(document.getElementById('kcal-set-age').value) || 25;
    var g = document.getElementById('kcal-set-gender') ? document.getElementById('kcal-set-gender').value : 'male';
    var d = parseInt(document.getElementById('kcal-set-daily').value) || 100;
    var wk = parseInt(document.getElementById('kcal-set-weekly').value) || 500;
    var cfg = { weight: w, height: h, age: age, gender: g, dailyGoal: d, weeklyGoal: wk };
    localStorage.setItem('hcigame_settings', JSON.stringify(cfg));
    if (API.isLoggedIn()) {
      API.updateProfile({ weight: w, height: h, age: age, gender: g, daily_goal: d, weekly_goal: wk });
    }
  },

  _drawChart: function (data) {
    var canvas = document.getElementById('dash-chart') || document.getElementById('kcal-chart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width = 600, H = canvas.height = 220;
    ctx.clearRect(0, 0, W, H);
    var hourly = data.hourly || {};
    var values = []; for (var h = 0; h < 24; h++) values.push(hourly[h] || hourly[String(h)] || 0);
    var maxV = Math.max.apply(null, values.concat([1])) * 1.2;
    var barW = Math.max(2, (W - 60) / 24 - 3), pad = 35;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var gy = pad + (H - pad * 2) * (i / 4);
      ctx.beginPath(); ctx.moveTo(40, gy); ctx.lineTo(W - 10, gy); ctx.stroke();
    }
    for (var h = 0; h < 24; h++) {
      var barH = (values[h] / maxV) * (H - pad * 2);
      var x = 42 + h * (barW + 3), y = H - pad - barH;
      ctx.fillStyle = (h < 6 || h > 22) ? 'rgba(100,116,139,0.5)' : 'rgba(168,85,247,0.7)';
      ctx.fillRect(x, y, barW, barH);
      if (h % 3 === 0) { ctx.fillStyle = '#94a3b8'; ctx.font = '8px Arial'; ctx.textAlign = 'center'; ctx.fillText(h + '时', x + barW / 2, H - pad + 12); }
    }
  },

  _drawPie: function (data) {
    var canvas = document.getElementById('dash-pie') || document.getElementById('kcal-pie');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 300, 180);
    var bd = data.game_breakdown || {};
    var total = Object.values(bd).reduce(function (a, b) { return a + b; }, 0) || 1;
    var colors = { '🏃 地铁跑酷': '#f97316', '🏀 投篮挑战': '#3b82f6', '🎮 Galgame': '#ec4899', '🧩 体感方块': '#22c55e' };
    var cx = 70, cy = 90, r = 55, angle = -Math.PI / 2;
    Object.entries(bd).forEach(function (e) {
      var slice = (e[1] / total) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.fillStyle = colors[e[0]] || '#94a3b8'; ctx.fill(); angle += slice;
    });
    var ly = 30;
    Object.keys(colors).forEach(function (g, i) {
      ctx.fillStyle = colors[g]; ctx.fillRect(150, ly + i * 30, 12, 12);
      ctx.fillStyle = '#cbd5e1'; ctx.font = '11px Arial'; ctx.textAlign = 'left';
      ctx.fillText(g + ' ' + ((bd[g] || 0) / total * 100).toFixed(0) + '%', 168, ly + i * 30 + 11);
    });
  },

  _calcStreak: function (sessions) {
    var days = new Set(); sessions.forEach(function (s) { if (s.kcal > 0) days.add(s.date); });
    var streak = 0, today = new Date().toISOString().slice(0, 10);
    var check = days.has(today) ? today : new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    while (days.has(check)) { streak++; check = new Date(Date.now() - (streak + (days.has(today) ? 0 : 1)) * 86400000).toISOString().slice(0, 10); }
    return streak;
  },

  _calcBreakdown: function (sessions) {
    var bd = {}; sessions.forEach(function (s) { bd[s.game || s.game_name] = (bd[s.game || s.game_name] || 0) + (s.kcal || 0); }); return bd;
  },

  _calcHourly: function (sessions) {
    var hd = {}; for (var h = 0; h < 24; h++) hd[h] = 0;
    sessions.forEach(function (s) { hd[s.hour || 0] = (hd[s.hour || 0] || 0) + (s.kcal || 0); }); return hd;
  },

  _calcWeek: function (sessions) {
    var wd = {};
    for (var i = 6; i >= 0; i--) { wd[new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)] = 0; }
    sessions.forEach(function (s) { if (wd[s.date] !== undefined) wd[s.date] += (s.kcal || 0); });
    return wd;
  },

  _exportCSV: function () {
    var sessions = this._data && this._data.sessions ? this._data.sessions : [];
    var rows = [['日期', '游戏', '消耗(kcal)', '得分', '时长(秒)']];
    var self = this;
    sessions.forEach(function (s) { rows.push([s.date, s.game || s.game_name, (s.kcal || 0).toFixed(1), s.score, s.duration || s.duration_sec]); });
    var csv = '﻿' + rows.map(function (r) { return r.join(','); }).join('\n');
    var blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = '卡路里数据_' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
  },

  // ====== AI 教练 ======
  _askAI: function () {
    var input = document.getElementById('dash-ai-input') || document.getElementById('kcal-ai-input');
    var replyEl = document.getElementById('dash-ai-reply') || document.getElementById('kcal-ai-reply');
    var question = (input && input.value.trim()) || '分析我的运动数据';
    if (input) input.value = '';

    this._chatHistory.push({ role: 'user', text: question });
    this._renderChat(replyEl);

    var data = this._data || {};
    var dataCtx = '今日' + (data.today_count || 0) + '次,' + (data.today_kcal || 0).toFixed(1) + 'kcal,' + (data.today_min || 0) + '分钟; 连续' + (data.streak || 0) + '天; 7天' + (data.week_kcal || 0).toFixed(0) + 'kcal';

    var self = this, wsSent = false, idleTimer = null;
    self._chatHistory = self._chatHistory.filter(function (m) { return m.id !== 'ai-stream'; });
    try {
      var ws = new WebSocket('ws://localhost:8083');
      var resetIdle = function () { if (idleTimer) clearTimeout(idleTimer); idleTimer = setTimeout(function () { if (ws.readyState === WebSocket.OPEN) ws.close(); }, 15000); };
      ws.onopen = function () { ws.send(JSON.stringify({ type: 'chat', question: question, data: dataCtx })); wsSent = true; self._chatHistory.push({ role: 'ai', id: 'ai-stream', text: '⏳...' }); self._renderChat(replyEl); resetIdle(); };
      ws.onmessage = function (e) { resetIdle(); var d = JSON.parse(e.data); if (d.type === 'reply_chunk') { var el = document.getElementById('ai-stream'); if (el) { if (el.textContent === '⏳...') el.textContent = ''; el.textContent += d.text; } } else if (d.type === 'reply_done') { var el2 = document.getElementById('ai-stream'); if (el2) { for (var j = self._chatHistory.length - 1; j >= 0; j--) { if (self._chatHistory[j].id === 'ai-stream') { self._chatHistory[j].text = el2.textContent; delete self._chatHistory[j].id; break; } } el2.removeAttribute('id'); } if (idleTimer) clearTimeout(idleTimer); ws.close(); } };
      ws.onerror = function () { self._chatHistory.push({ role: 'ai', text: '⚠️ AI教练连接失败，请确认已启动: python kcal_ai_service.py' }); self._renderChat(replyEl); };
      setTimeout(function () { if (!wsSent) { ws.close(); } }, 4000);
    } catch (e) {}
  },

  _renderChat: function (el) {
    if (!el) return;
    var streamEl = document.getElementById('ai-stream'), streamText = streamEl ? streamEl.textContent : '';
    var html = '';
    for (var i = Math.max(0, this._chatHistory.length - 10); i < this._chatHistory.length; i++) {
      var m = this._chatHistory[i];
      var color = m.role === 'ai' ? 'color:#86efac;' : 'color:#fbbf24;text-align:right;';
      var label = m.role === 'ai' ? '🤖 卡卡' : '👤 你';
      if (m.id === 'ai-stream') html += '<div style="margin:4px 0;' + color + '"><b>' + label + ':</b> <span id="ai-stream">' + streamText + '</span></div>';
      else html += '<div style="margin:4px 0;' + color + '"><b>' + label + ':</b> ' + m.text + '</div>';
    }
    el.innerHTML = html;
  }
};

// ====================================================================
// api-client.js — FastAPI 后端通信模块 (用户系统 + 数据同步)
// ====================================================================

var API = {
  _base: 'http://localhost:8000',
  _token: localStorage.getItem('hcigame_token') || '',

  _headers: function () {
    var h = { 'Content-Type': 'application/json' };
    if (this._token) h['Authorization'] = 'Bearer ' + this._token;
    return h;
  },

  setToken: function (t) { this._token = t; localStorage.setItem('hcigame_token', t); },
  isLoggedIn: function () { return !!this._token; },

  /** 注册 */
  register: function (username, password, email) {
    return fetch(this._base + '/api/auth/register', {
      method: 'POST', headers: this._headers(),
      body: JSON.stringify({ username: username, password: password, email: email || '' })
    }).then(function (r) { return r.json(); });
  },

  /** 登录 */
  login: function (username, password) {
    var self = this;
    return fetch(this._base + '/api/auth/login', {
      method: 'POST', headers: this._headers(),
      body: JSON.stringify({ username: username, password: password })
    }).then(function (r) { return r.json(); }).then(function (data) {
      if (data.token) { self.setToken(data.token); self._user = data.user; }
      return data;
    });
  },

  /** 获取当前用户 */
  me: function () {
    var self = this;
    return fetch(this._base + '/api/auth/me', { headers: this._headers() })
      .then(function (r) { return r.json(); }).then(function (u) { self._user = u; return u; });
  },

  /** 记录游戏会话 */
  logSession: function (gameName, kcal, score, durationSec, met) {
    if (!this._token) return;
    return fetch(this._base + '/api/sessions', {
      method: 'POST', headers: this._headers(),
      body: JSON.stringify({ game_name: gameName, kcal: kcal, score: score, duration_sec: durationSec, met: met || 4 })
    });
  },

  /** 获取报告 */
  getReport: function () {
    if (!this._token) return Promise.resolve(null);
    return fetch(this._base + '/api/report', { headers: this._headers() }).then(function (r) { return r.json(); });
  },

  /** 排行榜 (scope: today | week | all) */
  getLeaderboard: function (scope) {
    return fetch(this._base + '/api/leaderboard?scope=' + (scope || 'today'), { headers: this._headers() }).then(function (r) { return r.json(); });
  },

  /** 同步本地数据到服务器 */
  syncLocalData: function (sessions, totalKcal) {
    if (!this._token) return Promise.resolve(null);
    return fetch(this._base + '/api/sync', {
      method: 'POST', headers: this._headers(),
      body: JSON.stringify({ sessions: sessions || [], total_kcal: totalKcal || 0 })
    }).then(function (r) { return r.json(); });
  },

  /** 更新用户资料 */
  updateProfile: function (data) {
    if (!this._token) return Promise.resolve(null);
    return fetch(this._base + '/api/auth/profile', {
      method: 'PUT', headers: this._headers(),
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  },

  // ========== 社交 ==========

  /** 关注用户 */
  follow: function (username) {
    return fetch(this._base + '/api/social/follow', {
      method: 'POST', headers: this._headers(),
      body: JSON.stringify({ username: username })
    }).then(function (r) { return r.json(); });
  },

  /** 取消关注 */
  unfollow: function (username) {
    return fetch(this._base + '/api/social/follow', {
      method: 'DELETE', headers: this._headers(),
      body: JSON.stringify({ username: username })
    }).then(function (r) { return r.json(); });
  },

  /** 好友列表 */
  getFriends: function () {
    return fetch(this._base + '/api/social/friends', { headers: this._headers() }).then(function (r) { return r.json(); });
  },

  /** 好友动态 */
  getFeed: function (limit) {
    return fetch(this._base + '/api/social/feed?limit=' + (limit || 30), { headers: this._headers() }).then(function (r) { return r.json(); });
  }
};

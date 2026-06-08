// ====================================================================
// game-engine.js — 游戏引擎基类 (键盘版)
// ====================================================================

var GameEngine = function (gameId, mode) {
  this.gameId = gameId;
  this.mode = mode;
  this.canvas = null;
  this.ctx = null;
  this.running = false;
  this.onAction = null;
  this.frameCount = 0;
  this._readyActive = false;
  this._onReadyCallback = null;

  // 速度控制
  this.speed = GAME_SPEED;
};

GameEngine.prototype.setup = function () {
  this.canvas = $('gameCanvas' + this.mode);
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  this.ctx = this.canvas.getContext('2d');

  STATE.gameStats = { score: 0, time: 60, cal: 0, actions: 0, hp: 100, combo: 0, maxCombo: 0 };
  STATE.actionStats = { jump: 0, squat: 0, punch: 0, shoot: 0, run: 0 };
  STATE.gameRunning = true;
  this.running = true;
  this.frameCount = 0;
};

/** 处理动作结果 (游戏内调用, 非体感) */
GameEngine.prototype.handleActionResult = function (result, now) {
  if (!result) return;
  var stats = STATE.gameStats;
  var actions = STATE.actionStats;
  stats.score += result.points;
  stats.cal += result.cal;
  stats.actions++;
  stats.combo++;
  if (stats.combo > stats.maxCombo) stats.maxCombo = stats.combo;

  if (result.category === 'jump') actions.jump++;
  else if (result.category === 'squat') actions.squat++;
  else if (result.category === 'punch') actions.punch++;
  else if (result.category === 'shoot') actions.shoot++;
  else if (result.category === 'run') actions.run++;

  UIManager.showFeedback('fb' + this.mode, result.label, result.grade, stats.combo);
  stats.hp = clamp(stats.hp + (result.grade === 'perfect' ? 4 : 1), 0, 100);
};

/** 每帧tick — HP自然衰减 */
GameEngine.prototype.tick = function () {
  if (!this.running) return;
  var stats = STATE.gameStats;
  stats.hp = clamp(stats.hp - 0.08 * this.speed, 0, 100);
  if (stats.hp <= 0) this.endGame();
};

/** 倒计时 */
GameEngine.prototype.beginCountdown = function () {
  var self = this;
  STATE.gameTimer = setInterval(function () {
    if (!self.running) { clearInterval(STATE.gameTimer); return; }
    STATE.gameStats.time--;
    if (STATE.gameStats.time <= 0) self.endGame();
  }, 1000);
};

/** 结束游戏 */
GameEngine.prototype.endGame = function () {
  this.running = false;
  STATE.gameRunning = false;
  if (STATE.gameTimer) { clearInterval(STATE.gameTimer); STATE.gameTimer = null; }
  showResults();
};

// ====================================================================
// 准备界面 (点击按钮开始游戏)
// ====================================================================

GameEngine.prototype.showReadyScreen = function (onReady) {
  var self = this;
  this._readyActive = true;
  this._onReadyCallback = onReady;

  var guide = document.getElementById('actionGuide' + this.mode);
  if (guide) guide.classList.remove('hidden');

  var overlay = document.createElement('div');
  overlay.id = 'readyOverlay' + this.mode;
  overlay.className = 'ready-overlay';
  overlay.innerHTML =
    '<div class="ready-box">' +
    '<div class="ready-icon">🎮</div>' +
    '<div class="ready-title">准备开始游戏</div>' +
    '<div class="ready-sub">查看左侧操作说明，然后点击下方按钮</div>' +
    '<button id="readyStartBtn' + this.mode + '" class="bt bt-success" style="font-size:1.2rem;padding:0.8rem 3rem;">🎮 开始游戏</button>' +
    '</div>';
  document.getElementById('screen-game-' + ['subway', 'hoop', 'galgame'][this.mode]).appendChild(overlay);

  var doStart = function (e) {
    if (!self._readyActive) return;
    if (e) e.preventDefault();
    self._readyActive = false;
    var ov = document.getElementById('readyOverlay' + self.mode);
    if (ov) ov.remove();
    var g = document.getElementById('actionGuide' + self.mode);
    if (g) setTimeout(function () { g.classList.add('hidden'); }, 8000);
    if (self._onReadyCallback) self._onReadyCallback();
  };

  var btn = document.getElementById('readyStartBtn' + self.mode);
  if (btn) btn.addEventListener('click', doStart);

  var keyHandler = function (e) {
    if (e.code === 'Space' || e.code === 'Enter') {
      doStart(e);
    }
  };
  window.addEventListener('keydown', keyHandler);
  this._readyKeyHandler = keyHandler;

  // 体感点头确认：2 次点头 → 进入游戏
  var nodCount = 0, nodState = 0, nodTimer = 0;
  var prevNoseY, nodAccumY = 0;
  var nodHandler = function (results) {
    if (!self._readyActive) return;
    var lm = results.poseLandmarks;
    var nose = lm ? lm[0] : null;
    if (!nose) return;
    if (typeof prevNoseY === 'undefined') prevNoseY = nose.y;

    var deltaY = nose.y - prevNoseY;
    prevNoseY = nose.y;
    if (Math.abs(deltaY) > 0.005) nodAccumY += deltaY;
    if (nodTimer > 0) nodTimer--;

    if (nodState === 0 && nodAccumY > 0.04) { nodState = 1; nodAccumY = 0; }
    else if (nodState === 1 && nodAccumY < -0.04) { nodState = 0; nodCount++; nodTimer = 60; nodAccumY = 0; }
    if (nodTimer <= 0 && nodCount > 0) nodCount = 0;
    if (Math.abs(nodAccumY) > 0.15) nodAccumY = 0;

    if (nodCount >= 2) {
      nodCount = 0; nodState = 0; nodAccumY = 0;
      doStart();
    }
  };
  if (window.mpManager) window.mpManager.subscribe(nodHandler);

  // 清理函数注入 doStart
  var origDoStart = doStart;
  doStart = function (e) {
    if (window.mpManager) window.mpManager.unsubscribe(nodHandler);
    origDoStart(e);
  };
};

GameEngine.prototype.isReadyPhase = function () {
  return this._readyActive;
};

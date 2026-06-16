// ====================================================================
// results.js — 结算页面 & 游戏启动 (键盘版)
// ====================================================================

var currentGame = null;

/** 显示教程选择对话框 */
function showTutorialChoiceModal() {
  // 先切换到 subway 屏幕
  UIManager.showScreen('screen-game-subway');

  var overlay = document.getElementById('tutorial-choice-overlay');
  if (!overlay) { startGameDirect(); return; }

  var btnYes = document.getElementById('btn-tutorial-yes');
  var btnNo = document.getElementById('btn-tutorial-no');

  overlay.style.display = 'flex';

  function onYes() {
    STATE._tutorialMode = true;
    STATE._tutorialChoiceMade = true;
    overlay.style.display = 'none';
    removeListeners();
    startGame(0);
  }

  function onNo() {
    STATE._tutorialMode = false;
    STATE._tutorialChoiceMade = true;
    overlay.style.display = 'none';
    removeListeners();
    startGame(0);
  }

  function onKey(e) {
    if (e.code === 'Digit1' || e.code === 'Numpad1') onYes();
    else if (e.code === 'Digit2' || e.code === 'Numpad2') onNo();
    else if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); onYes(); }
  }

  function removeListeners() {
    if (btnYes) btnYes.removeEventListener('click', onYes);
    if (btnNo) btnNo.removeEventListener('click', onNo);
    window.removeEventListener('keydown', onKey);
  }

  if (btnYes) btnYes.addEventListener('click', onYes);
  if (btnNo) btnNo.addEventListener('click', onNo);
  window.addEventListener('keydown', onKey);
}

function startGameDirect() {
  STATE._tutorialMode = false;
  STATE._tutorialChoiceMade = true;
  startGame(0);
}

/** 显示结算页面 */
function showResults() {
  UIManager.showScreen('screen-results');
  var stats = STATE.gameStats;
  var actions = STATE.actionStats;
  var gameNames = ['🏃 地铁跑酷', '🏀 投篮挑战', '🎮 Galgame', '🧩 体感方块'];

  $('resultTitle').textContent = '🎉 ' + gameNames[STATE.gameMode] + ' 结束!';
  $('rsScore').textContent = Math.round(stats.score);
  $('rsActions').textContent = stats.actions;
  $('rsCal').textContent = fmt(stats.cal, 1);
  // 累计到总卡路里追踪器
  if (window._totalKcal === undefined) window._totalKcal = parseFloat(localStorage.getItem('hcigame_total_kcal') || '0');
  window._totalKcal += stats.cal;
  localStorage.setItem('hcigame_total_kcal', window._totalKcal.toFixed(1));
  var totalEl = document.getElementById('totalKcal');
  if (totalEl) totalEl.textContent = fmt(window._totalKcal, 1);
  // AI 报告：记录本次会话
  if (typeof AIReport !== 'undefined') {
    var playSec = currentGame && currentGame._playStartTime ? Math.round((Date.now() - currentGame._playStartTime) / 1000) : 0;
    AIReport.logSession(gameNames[STATE.gameMode], stats.cal, Math.round(stats.score), playSec);
  }
  // 同步到 FastAPI 后端
  if (typeof API !== 'undefined' && API.isLoggedIn()) {
    var playSec2 = currentGame && currentGame._playStartTime ? Math.round((Date.now() - currentGame._playStartTime) / 1000) : 0;
    API.logSession(gameNames[STATE.gameMode], stats.cal, Math.round(stats.score), playSec2);
  }
  $('rsCombo').textContent = stats.maxCombo;

  var labels = ['跳跃', '深蹲', '出拳', '投篮', '跑步', '左移', '右移', '旋转'];
  var values = [actions.jump, actions.squat, actions.punch, actions.shoot, actions.run, actions.left, actions.right, actions.rotate];
  UIManager.drawRadar('radarChart', labels, values);

  var colors = ['#4ade80', '#00d4ff', '#ffcc00', '#f97316', '#7c3aed', '#f472b6', '#fb923c', '#a78bfa'];
  var legend = labels.map(function (l, i) {
    return '<div><i style="background:' + colors[i] + '"></i>' + l + ' (' + values[i] + ')</div>';
  }).join('');
  $('radarLegend').innerHTML = legend;

  // 地铁跑酷：播放嘲讽视频
  if (STATE.gameMode === 0) {
    var wrap = document.getElementById('laughVideoWrap');
    var lv = document.getElementById('laughVideo');
    if (wrap && lv) {
      wrap.style.display = 'block';
      lv.style.opacity = '1';
      lv.src = 'games/subway/video/biglaugh.mp4';
      lv.currentTime = 0;
      lv.play().catch(function () {});
    }
  } else {
    var wrap2 = document.getElementById('laughVideoWrap');
    if (wrap2) wrap2.style.display = 'none';
  }
}

/** 返回大厅 */
function backToLobby() {
  UIManager.showScreen('screen-lobby');
  STATE._tutorialChoiceMade = false;
  STATE._tutorialMode = false;
  // 停止嘲讽视频
  var lv = document.getElementById('laughVideo');
  if (lv) { lv.pause(); lv.src = ''; }
  var wrap = document.getElementById('laughVideoWrap');
  if (wrap) wrap.style.display = 'none';
  if (currentGame) { currentGame.running = false; currentGame = null; }
  // 恢复摄像头面板
  var hud = document.getElementById('cam-preview-hud');
  if (hud) hud.style.display = '';
}

/** 启动游戏 */
function startGame(mode) {
  STATE.gameMode = mode;
  STATE.gameStats = { score: 0, time: 60, cal: 0, actions: 0, hp: 100, combo: 0, maxCombo: 0 };
  STATE.actionStats = { jump: 0, squat: 0, punch: 0, shoot: 0, run: 0, left: 0, right: 0, rotate: 0 };

  if (currentGame) { currentGame.running = false; currentGame = null; }

  var screenMap = ['screen-game-subway', 'screen-game-hoop', 'screen-game-galgame', 'screen-game-tetris'];
  UIManager.showScreen(screenMap[mode]);
  STATE.gameRunning = true;

  switch (mode) {
    case 0:
      if (!STATE._tutorialChoiceMade) {
        showTutorialChoiceModal();
        return;
      }
      currentGame = new SubwaySurfGame(); break;
    case 1: currentGame = new KobeShootingGame(); break;
    case 2: currentGame = new GalgameGame(); break;
    case 3: currentGame = new TetrisGame(); break;
  }
  currentGame.setup();
  // 投篮游戏：PoseTracker 自行订阅 MediaPipeManager
  if (mode === 1 && currentGame.poseTracker) {
    currentGame.poseTracker.setupPoseDetection(currentGame);
  }
}

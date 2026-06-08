// ====================================================================
// results.js — 结算页面 & 游戏启动 (键盘版)
// ====================================================================

var currentGame = null;

/** 显示结算页面 */
function showResults() {
  UIManager.showScreen('screen-results');
  var stats = STATE.gameStats;
  var actions = STATE.actionStats;
  var gameNames = ['🏃 地铁跑酷', '🏀 投篮挑战', '🎮 Galgame'];

  $('resultTitle').textContent = '🎉 ' + gameNames[STATE.gameMode] + ' 结束!';
  $('rsScore').textContent = Math.round(stats.score);
  $('rsActions').textContent = stats.actions;
  $('rsCal').textContent = fmt(stats.cal, 1);
  $('rsCombo').textContent = stats.maxCombo;

  var labels = ['跳跃', '深蹲', '出拳', '投篮', '跑步'];
  var values = [actions.jump, actions.squat, actions.punch, actions.shoot, actions.run];
  UIManager.drawRadar('radarChart', labels, values);

  var colors = ['#4ade80', '#00d4ff', '#ffcc00', '#f97316', '#7c3aed'];
  var legend = labels.map(function (l, i) {
    return '<div><i style="background:' + colors[i] + '"></i>' + l + ' (' + values[i] + ')</div>';
  }).join('');
  $('radarLegend').innerHTML = legend;
}

/** 返回大厅 */
function backToLobby() {
  UIManager.showScreen('screen-lobby');
  if (currentGame) { currentGame.running = false; currentGame = null; }
}

/** 启动游戏 */
function startGame(mode) {
  STATE.gameMode = mode;
  STATE.gameStats = { score: 0, time: 60, cal: 0, actions: 0, hp: 100, combo: 0, maxCombo: 0 };
  STATE.actionStats = { jump: 0, squat: 0, punch: 0, shoot: 0, run: 0 };

  if (currentGame) { currentGame.running = false; currentGame = null; }

  var screenMap = ['screen-game-subway', 'screen-game-hoop', 'screen-game-galgame'];
  UIManager.showScreen(screenMap[mode]);
  STATE.gameRunning = true;

  switch (mode) {
    case 0: currentGame = new SubwaySurfGame(); break;
    case 1: currentGame = new KobeShootingGame(); break;
    case 2: currentGame = new GalgameGame(); break;
  }
  currentGame.setup();
  // 投篮游戏：PoseTracker 自行订阅 MediaPipeManager
  if (mode === 1 && currentGame.poseTracker) {
    currentGame.poseTracker.setupPoseDetection(currentGame);
  }
}

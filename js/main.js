// ====================================================================
// main.js — 系统初始化入口 (键盘版)
// ====================================================================

// ---- 系统初始化 ----
function initSystem() {
  console.log('[系统] 初始化 · 键盘操作模式');

  // 游戏大厅 — 卡片选择
  document.querySelectorAll('.cd').forEach(function (c) {
    c.onclick = function () {
      document.querySelectorAll('.cd').forEach(function (x) { x.classList.remove('selected'); });
      this.classList.add('selected');
      STATE.gameMode = parseInt(this.dataset.game);
    };
  });

  // 开始游戏按钮
  $('btnPlay').onclick = function () { startGame(STATE.gameMode); };

  // 退出按钮
  $('quitBtn0').onclick = function () { if (currentGame) currentGame.endGame(); };
  $('quitBtn1').onclick = function () { if (currentGame) currentGame.endGame(); };
  $('quitBtn2').onclick = function () { if (currentGame) currentGame.endGame(); };

  // 结算页面按钮
  $('btnRetry').onclick = function () { startGame(STATE.gameMode); };
  $('btnLobby').onclick = function () { backToLobby(); };

  // ---- 键盘快捷键 ----
  document.addEventListener('keydown', function (e) {
    // 大厅 — 左右切换游戏 & 回车开始
    var cs = document.querySelectorAll('.cd');
    var isLobby = $('screen-lobby').classList.contains('show');
    if (e.key === 'ArrowLeft' && isLobby) {
      cs[STATE.gameMode].classList.remove('selected');
      STATE.gameMode = Math.max(0, STATE.gameMode - 1);
      cs[STATE.gameMode].classList.add('selected');
    } else if (e.key === 'ArrowRight' && isLobby) {
      cs[STATE.gameMode].classList.remove('selected');
      STATE.gameMode = Math.min(cs.length - 1, STATE.gameMode + 1);
      cs[STATE.gameMode].classList.add('selected');
    } else if ((e.key === 'Enter' || e.key === ' ') && isLobby) {
      e.preventDefault();
      startGame(STATE.gameMode);
    }
    // H = 切换操作映射面板
    if (e.key === 'h' || e.key === 'H') {
      var guide = document.getElementById('actionGuide' + STATE.gameMode);
      if (guide) {
        guide.classList.toggle('hidden');
        console.log('[快捷键] 操作映射面板:', guide.classList.contains('hidden') ? '隐藏' : '显示');
      }
    }
  });

  // 窗口大小调整
  window.addEventListener('resize', function () {
    [0, 1, 2].forEach(function (i) {
      var c = $('gameCanvas' + i);
      if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
    });
  });

  console.log('[系统] 初始化完成 · 键盘操作模式 · 等待用户选择游戏');
  return true;
}

// ---- DOM Ready ----
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    if (!initSystem()) {
      console.error('[系统] 初始化失败');
    }
  }, 300);
});

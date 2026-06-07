// ====================================================================
// main.js — 系统初始化入口 (科幻游戏UI版)
// ====================================================================

// 游戏元数据配置
var GAME_META = [
  {
    id: 0,
    name: '地铁跑酷',
    icon: '🏃',
    desc: '无尽奔跑 · 挑战极限速度',
    tags: ['🏃 跑酷', '🚂 地铁', '⚡ 速度'],
    color: 'orange',
    heroGlowColor: 'rgba(249, 115, 22, 0.5)',
    keys: [
      { key: '空格 / ↑', action: '跳跃越障' },
      { key: '↓', action: '深蹲滑铲' },
      { key: 'Shift', action: '加速奔跑' }
    ]
  },
  {
    id: 1,
    name: '投篮挑战',
    icon: '🏀',
    desc: '3D球场 · 精准投篮 · 热血扣篮',
    tags: ['🏀 投篮', '⛹️ 科比', '🔥 3D'],
    color: 'blue',
    heroGlowColor: 'rgba(0, 212, 255, 0.5)',
    keys: [
      { key: 'WASD', action: '移动角色' },
      { key: 'J 按住/松开', action: '蓄力投篮' },
      { key: 'E', action: '捡球/扣篮' }
    ]
  },
  {
    id: 2,
    name: 'Galgame',
    icon: '🎮',
    desc: '多结局剧情 · 好感度系统 · 沉浸体验',
    tags: ['🎮 游戏', '📖 剧情', '🎭 多结局'],
    color: 'pink',
    heroGlowColor: 'rgba(236, 72, 153, 0.5)',
    keys: [
      { key: '鼠标 / 空格', action: '继续对话' },
      { key: '按键 1/2/3', action: '选择选项' },
      { key: 'Tab', action: '快进对话' }
    ]
  }
];

// ---- 更新大厅UI以反映当前选中的游戏 ----
function updateLobbyUI(gameIdx) {
  var meta = GAME_META[gameIdx];
  if (!meta) return;

  // 更新游戏选择卡片选中状态
  document.querySelectorAll('.gsc').forEach(function (el, i) {
    el.classList.toggle('selected', i === gameIdx);
  });

  // 更新底部导航
  document.querySelectorAll('.bn-item').forEach(function (el, i) {
    el.classList.toggle('active', i === gameIdx);
  });

  // 更新英雄面板
  var heroIcon = document.getElementById('heroIcon');
  var heroName = document.getElementById('heroName');
  var heroDesc = document.getElementById('heroDesc');
  var heroTags = document.getElementById('heroTags');
  var heroGlow = document.getElementById('heroGlow');
  var heroIconWrap = document.getElementById('heroIconWrap');

  if (heroIcon) heroIcon.textContent = meta.icon;
  if (heroName) heroName.textContent = meta.name;
  if (heroDesc) heroDesc.textContent = meta.desc;
  if (heroTags) {
    heroTags.innerHTML = meta.tags.map(function (t) {
      return '<span class="htag">' + t + '</span>';
    }).join('');
  }
  if (heroGlow) {
    heroGlow.style.borderTopColor = meta.heroGlowColor;
    heroGlow.style.borderRightColor = meta.heroGlowColor.replace('0.5', '0.3');
  }
  if (heroIconWrap) {
    // 更新图标容器边框颜色
    heroIconWrap.style.borderColor = meta.heroGlowColor.replace('0.5', '0.3');
    heroIconWrap.style.boxShadow = '0 0 40px rgba(0,0,0,0.5), 0 0 25px ' + meta.heroGlowColor.replace('0.5', '0.2') + ', inset 0 0 40px rgba(0,0,0,0.4)';
  }

  // 更新操作预览面板
  var infoContent = document.getElementById('infoPanelContent');
  if (infoContent && meta.keys) {
    infoContent.innerHTML = meta.keys.map(function (k) {
      return '<div class="key-row"><kbd>' + k.key + '</kbd> <span>' + k.action + '</span></div>';
    }).join('');
  }
}

// ---- 系统初始化 ----
function initSystem() {
  console.log('[系统] 初始化 · 科幻游戏UI模式');

  // === 游戏选择卡片 (右侧面板) ===
  document.querySelectorAll('.gsc').forEach(function (card) {
    card.addEventListener('click', function () {
      var gameIdx = parseInt(this.dataset.game);
      STATE.gameMode = gameIdx;
      updateLobbyUI(gameIdx);
    });
  });

  // === 底部导航栏 ===
  document.querySelectorAll('.bn-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var gameIdx = parseInt(this.dataset.nav);
      STATE.gameMode = gameIdx;
      updateLobbyUI(gameIdx);
    });
  });

  // === 开始游戏按钮 ===
  var btnPlay = document.getElementById('btnPlay');
  if (btnPlay) {
    btnPlay.addEventListener('click', function () {
      startGame(STATE.gameMode);
    });
  }

  // === 退出按钮 ===
  var quitBtn0 = document.getElementById('quitBtn0');
  var quitBtn1 = document.getElementById('quitBtn1');
  var quitBtn2 = document.getElementById('quitBtn2');
  if (quitBtn0) quitBtn0.addEventListener('click', function () { if (currentGame) currentGame.endGame(); });
  if (quitBtn1) quitBtn1.addEventListener('click', function () { if (currentGame) currentGame.endGame(); });
  if (quitBtn2) quitBtn2.addEventListener('click', function () { if (currentGame) currentGame.endGame(); });

  // === 结算页面按钮 ===
  var btnRetry = document.getElementById('btnRetry');
  var btnLobby = document.getElementById('btnLobby');
  if (btnRetry) btnRetry.addEventListener('click', function () { startGame(STATE.gameMode); });
  if (btnLobby) btnLobby.addEventListener('click', function () { backToLobby(); });

  // === 键盘快捷键 ===
  document.addEventListener('keydown', function (e) {
    var isLobby = document.getElementById('screen-lobby').classList.contains('show');

    // 大厅 — 左右方向键切换游戏
    if (e.key === 'ArrowLeft' && isLobby) {
      e.preventDefault();
      STATE.gameMode = Math.max(0, STATE.gameMode - 1);
      updateLobbyUI(STATE.gameMode);
    } else if (e.key === 'ArrowRight' && isLobby) {
      e.preventDefault();
      STATE.gameMode = Math.min(GAME_META.length - 1, STATE.gameMode + 1);
      updateLobbyUI(STATE.gameMode);
    } else if ((e.key === 'Enter' || e.key === ' ') && isLobby) {
      e.preventDefault();
      startGame(STATE.gameMode);
    }
<<<<<<< HEAD

    // 数字键快速切换 (1/2/3)
    if (isLobby && e.key >= '1' && e.key <= '3') {
      var idx = parseInt(e.key) - 1;
      STATE.gameMode = idx;
      updateLobbyUI(idx);
    }

    // H = 切换操作映射面板
    if (e.key === 'h' || e.key === 'H') {
      var guide = document.getElementById('actionGuide' + STATE.gameMode);
      if (guide) {
        guide.classList.toggle('hidden');
        console.log('[快捷键] 操作映射面板:', guide.classList.contains('hidden') ? '隐藏' : '显示');
=======
    // ESC = 暂停/继续 (暂停时显示操作面板，运行时隐藏)
    if (e.key === 'Escape') {
      e.preventDefault();
      if (currentGame && currentGame._paused !== undefined) {
        var guide = document.getElementById('actionGuide' + STATE.gameMode);
        if (currentGame._paused) {
          // 恢复游戏
          currentGame._paused = false;
          if (guide) guide.classList.add('hidden');
          currentGame.startLoop();
        } else if (currentGame._running) {
          // 暂停游戏
          currentGame._paused = true;
          currentGame._running = false;
          if (guide) guide.classList.remove('hidden');
          if (currentGame._animFrameId) {
            cancelAnimationFrame(currentGame._animFrameId);
            currentGame._animFrameId = null;
          }
        }
>>>>>>> d703222 (fix:修改了第一款游戏的体验感问题，修复了第二款游戏在抢球中卡死的问题)
      }
    }
  });

  // === 窗口大小调整 ===
  window.addEventListener('resize', function () {
    [0, 1, 2].forEach(function (i) {
      var c = document.getElementById('gameCanvas' + i);
      if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
    });
  });

  // 初始状态
  updateLobbyUI(STATE.gameMode);

  console.log('[系统] 初始化完成 · 科幻游戏UI模式 · 等待用户选择游戏');
  return true;
}

// ---- DOM Ready ----
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    if (!initSystem()) {
      console.error('[系统] 初始化失败');
    }
  }, 200);
});

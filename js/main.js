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
  },
  {
    id: 3,
    name: '体感方块',
    icon: '🧩',
    desc: '体感操控 · 经典方块 · 消行挑战',
    tags: ['🧩 方块', '🎮 体感', '⚡ 限时'],
    color: 'green',
    heroGlowColor: 'rgba(34, 197, 94, 0.5)',
    keys: [
      { key: '举起左臂', action: '方块左移' },
      { key: '举起右臂', action: '方块右移' },
      { key: '双臂交叉', action: '旋转方块' }
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
  var quitBtn3 = document.getElementById('quitBtn3');
  if (quitBtn0) quitBtn0.addEventListener('click', function () { if (currentGame) currentGame.endGame(); });
  if (quitBtn1) quitBtn1.addEventListener('click', function () { if (currentGame) currentGame.endGame(); });
  if (quitBtn2) quitBtn2.addEventListener('click', function () { if (currentGame) currentGame.endGame(); });
  if (quitBtn3) quitBtn3.addEventListener('click', function () { if (currentGame) currentGame.endGame(); });

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
    // ESC = 暂停/继续 (暂停时显示操作面板，运行时隐藏)
    if (e.key === 'Escape') {
      e.preventDefault();
      if (currentGame && currentGame._paused !== undefined) {
        var guide = document.getElementById('actionGuide' + STATE.gameMode);
        if (currentGame._paused) {
          // 恢复游戏
          currentGame._paused = false;
          if (guide) guide.classList.add('hidden');
          // 重新启动倒计时
          currentGame.beginCountdown();
          currentGame.startLoop();
        } else if (currentGame._running) {
          // 暂停游戏
          currentGame._paused = true;
          currentGame._running = false;
          if (guide) guide.classList.remove('hidden');
          // 清除倒计时
          if (STATE.gameTimer) {
            clearInterval(STATE.gameTimer);
            STATE.gameTimer = null;
          }
          if (currentGame._animFrameId) {
            cancelAnimationFrame(currentGame._animFrameId);
            currentGame._animFrameId = null;
          }
        }
      }
    }
  });

  // === 窗口大小调整 ===
  window.addEventListener('resize', function () {
    [0, 1, 2, 3].forEach(function (i) {
      var c = document.getElementById('gameCanvas' + i);
      if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
    });
  });

  // === 全局摄像头面板：拖拽移动 + 四向缩放 ===
  (function setupCamPanel() {
    var hud = document.getElementById('cam-preview-hud');
    var header = document.getElementById('cam-drag-handle');
    if (!hud || !header) return;

    var MIN_W = 160, MIN_H = 140, MAX_W = 800, MAX_H = 600;
    var isDragging = false, isResizing = false;
    var dragStartX, dragStartY, startLeft, startTop;
    var resizeDir = '', resizeStartX, resizeStartY, startW, startH, startL, startT;

    // ---- 拖拽移动 ----
    header.addEventListener('mousedown', function (e) {
      if (e.target.classList.contains('cam-resize-n') || e.target.classList.contains('cam-resize-s') ||
          e.target.classList.contains('cam-resize-w') || e.target.classList.contains('cam-resize-e') ||
          e.target.classList.contains('cam-resize-nw') || e.target.classList.contains('cam-resize-ne') ||
          e.target.classList.contains('cam-resize-sw') || e.target.classList.contains('cam-resize-se')) return;
      isDragging = true;
      dragStartX = e.clientX; dragStartY = e.clientY;
      startLeft = hud.offsetLeft; startTop = hud.offsetTop;
      e.preventDefault();
    });

    // ---- 缩放手柄 ----
    var resizeHandles = hud.querySelectorAll('[class^="cam-resize-"]');
    resizeHandles.forEach(function (h) {
      h.addEventListener('mousedown', function (e) {
        isResizing = true;
        resizeDir = h.className.replace('cam-resize-', '');
        resizeStartX = e.clientX; resizeStartY = e.clientY;
        startW = hud.offsetWidth; startH = hud.offsetHeight;
        startL = hud.offsetLeft; startT = hud.offsetTop;
        e.preventDefault();
        e.stopPropagation();
      });
    });

    window.addEventListener('mousemove', function (e) {
      if (isDragging) {
        var newL = startLeft + (e.clientX - dragStartX);
        var newT = startTop + (e.clientY - dragStartY);
        newL = Math.max(0, Math.min(window.innerWidth - hud.offsetWidth, newL));
        newT = Math.max(0, Math.min(window.innerHeight - hud.offsetHeight, newT));
        hud.style.left = newL + 'px'; hud.style.top = newT + 'px';
        hud.style.right = 'auto'; hud.style.bottom = 'auto';
      }
      if (isResizing) {
        var dx = e.clientX - resizeStartX, dy = e.clientY - resizeStartY;
        var newW = startW, newH = startH, newL = startL, newT = startT;

        if (resizeDir.indexOf('e') !== -1) newW = Math.max(MIN_W, Math.min(MAX_W, startW + dx));
        if (resizeDir.indexOf('w') !== -1) { newW = Math.max(MIN_W, Math.min(MAX_W, startW - dx)); newL = startL + (startW - newW); }
        if (resizeDir.indexOf('s') !== -1) newH = Math.max(MIN_H, Math.min(MAX_H, startH + dy));
        if (resizeDir.indexOf('n') !== -1) { newH = Math.max(MIN_H, Math.min(MAX_H, startH - dy)); newT = startT + (startH - newH); }

        hud.style.width = newW + 'px'; hud.style.height = newH + 'px';
        hud.style.left = newL + 'px'; hud.style.top = newT + 'px';
        hud.style.right = 'auto'; hud.style.bottom = 'auto';
      }
    });

    window.addEventListener('mouseup', function () { isDragging = false; isResizing = false; });
  })();

  // === 大厅手势：身体比例自适应 + 简单防抖 ===
  if (window.mpManager) {
    var swipeAccumL = 0, swipeAccumR = 0, swipePrevL = null, swipePrevR = null;
    var swipeCooldown = 0;
    var nodState = 0, nodCount = 0, nodTimer = 0, prevNoseY = null, nodAccumY = 0;

    window.mpManager.subscribe(function (results) {
      var isLobby = document.getElementById('screen-lobby').classList.contains('show');
      if (!isLobby) { swipePrevL = null; swipePrevR = null; nodCount = 0; return; }

      var lm = results.poseLandmarks;
      if (!lm) return;

      var GU = window.GestureUtils;
      var body = GU ? GU.getBodyScale(lm) : null;
      var sw = body ? body.shoulderWidth : 0.15;

      var lWrist = lm[15], rWrist = lm[16], nose = lm[0];
      if (!lWrist || !rWrist || !nose) return;

      // ---- 滑动检测 ----
      if (swipeCooldown > 0) { swipeCooldown--; swipePrevL = lWrist.y; swipePrevR = rWrist.y; return; }

      // 左手
      if (lWrist.visibility > 0.4 && swipePrevL !== null) {
        var dyL = (lWrist.y - swipePrevL) / sw; // 归一化
        if (Math.abs(dyL) > 0.02) swipeAccumL += dyL;
      }
      swipePrevL = lWrist.y;

      // 右手
      if (rWrist.visibility > 0.4 && swipePrevR !== null) {
        var dyR = (rWrist.y - swipePrevR) / sw;
        if (Math.abs(dyR) > 0.02) swipeAccumR += dyR;
      }
      swipePrevR = rWrist.y;

      // 阻尼
      swipeAccumL *= 0.85;
      swipeAccumR *= 0.85;

      // 阈值（归一化后）
      var swipeThresh = 0.5;
      if (swipeAccumL > swipeThresh || swipeAccumR > swipeThresh) {
        STATE.gameMode = Math.min(GAME_META.length - 1, STATE.gameMode + 1);
        updateLobbyUI(STATE.gameMode);
        swipeCooldown = 25; swipeAccumL = 0; swipeAccumR = 0;
        console.log('[手势] 👋 下一个游戏');
      } else if (swipeAccumL < -swipeThresh || swipeAccumR < -swipeThresh) {
        STATE.gameMode = Math.max(0, STATE.gameMode - 1);
        updateLobbyUI(STATE.gameMode);
        swipeCooldown = 25; swipeAccumL = 0; swipeAccumR = 0;
        console.log('[手势] 👋 上一个游戏');
      }

      // ---- 点头检测 ----
      if (nose.visibility > 0.5) {
        if (prevNoseY !== null) {
          var dY = nose.y - prevNoseY;
          if (Math.abs(dY) > 0.003) nodAccumY += dY;
        }
        prevNoseY = nose.y;
        nodAccumY *= 0.85;

        // 阈值：0.035（原始坐标，点头时鼻尖 Y 位移约 0.02-0.05）
        if (nodState === 0 && nodAccumY > 0.035) { nodState = 1; nodAccumY = 0; }
        else if (nodState === 1 && nodAccumY < -0.035) { nodState = 0; nodCount++; nodTimer = 90; nodAccumY = 0; }
      }
      if (nodTimer > 0) nodTimer--;
      if (nodTimer <= 0 && nodCount > 0) nodCount = 0;

      if (nodCount >= 2) {
        nodCount = 0; nodState = 0; nodAccumY = 0;
        console.log('[手势] ✅ 2次点头，进入游戏');
        startGame(STATE.gameMode);
      }
    });
  }

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

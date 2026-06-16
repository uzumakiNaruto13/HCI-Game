// ====================================================================
// games/subway/game.js — 地铁跑酷 · 无尽奔跑
// ====================================================================

var SubwaySurfGame = function () {
  GameEngine.call(this, 'screen-game-subway', 0);
};

SubwaySurfGame.prototype = Object.create(GameEngine.prototype);
SubwaySurfGame.prototype.constructor = SubwaySurfGame;

SubwaySurfGame.prototype.setup = function () {
  GameEngine.prototype.setup.call(this);

  this.obstacles = [];
  this.coins = [];
  this.scrollSpeed = 9.5 * this.speed;
  this.targetSpeed = 9.5 * this.speed;
  this.distance = 0;
  this.playerY = 0;
  this.playerVY = 0;
  this.isSliding = false;
  this.isJumping = false;
  this.slideTimer = 0;
  this.speedLevel = 1;
  this.obstacleTimer = 0;
  this.obstacleGap = 0;
  this.obstaclePending = 0;
  this.coinTimer = 0;
  this.bgClouds = [];
  this.bgBuildings = [];
  this.groundTiles = [];
  this.particles = [];
  this.screenShake = 0;
  this.invincibleTimer = 0;
  this.hitFlash = 0;
  this._shiftHeld = false;
  this.sprintCooldown = 0;
  this.freezeTimer = 0;
  this._paused = false;
  this.runFrames = [];

  // 影子角色 (右侧蓝色幻影，完美AI)
  this.shadowOffset = -80; // 同一起跑线，略偏左
  this.shadowY = 0;
  this.shadowVY = 0;
  this.shadowJumping = false;
  this.shadowSliding = false;
  this.shadowSlideTimer = 0;
  this.shadowFrameIdx = 0;
  this.shadowFrameTimer = 0;
  this.shadowJumpFrameIdx = 0;
  this._wasShadowJumping = false;

  // 特殊钱币系统
  this.specialCoins = [];
  this.normalCoinCollected = 0;
  this.powerInvincible = 0;
  this.powerDoubleActive = false;
  this.powerDoubleTimer = 0;
  this.powerSlowActive = false;
  this.powerSlowTimer = 0;
  this.powerSlowSavedSpeed = 0;
  this.runFrameIdx = 0;
  this.runFrameTimer = 0;
  this.jumpFrameIdx = 0;
  this._wasJumping = false;

  // 操作面板初始隐藏，ESC 暂停时才显示
  var guide0 = document.getElementById('actionGuide0');
  if (guide0) guide0.classList.add('hidden');

  // 预加载 6 帧跑步精灵
  for (var fi = 1; fi <= 6; fi++) {
    var rimg = new Image();
    rimg.src = 'games/subway/pictures/' + fi + '.png';
    this.runFrames.push(rimg);
  }

  // 预加载 5 帧跳跃精灵 (Geometry Dash, 280×460)
  this.jumpFrames = [];
  var jumpFrameNums = [1, 4, 5, 6, 8];
  for (var fj = 0; fj < jumpFrameNums.length; fj++) {
    var jimg = new Image();
    jimg.src = 'games/subway/pictures/Geometry Dash/jump_frame_' + jumpFrameNums[fj] + '-removebg-preview.png';
    this.jumpFrames.push(jimg);
  }

  // 预加载 4 种特殊钱币图片
  this.dollarImgs = {};
  var dollarMap = ['invincible', 'heal', 'double', 'slow'];
  for (var di = 0; di < 4; di++) {
    var dimg = new Image();
    dimg.src = 'games/subway/pictures/dollar' + (di + 1) + '.png';
    this.dollarImgs[dollarMap[di]] = dimg;
  }

  for (var i = 0; i < 8; i++) {
    this.bgClouds.push({ x: randRange(0, 1200), y: randRange(20, 180), w: randRange(80, 160), speed: randRange(0.2, 0.6) * this.speed });
  }
  for (var j = 0; j < 10; j++) {
    this.bgBuildings.push({ x: j * 130, h: 80 + Math.random() * 120, w: 50 + Math.random() * 40, color: ['#1a1a3e','#1e1e50','#222255'][randInt(0,3)] });
  }
  for (var k = 0; k < 25; k++) {
    this.groundTiles.push({ x: k * 60 });
  }

  var self = this;
  this._keyHandler = function (e) {
    if (!self.running) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (!self.isJumping) {
        self.isJumping = true;
        self.isSliding = false;
        self.playerVY = -18 * self.speed;
        var cx = self.canvas ? self.canvas.width / 2 : window.innerWidth / 2;
        var cy = (self.playerY > 0) ? self.playerY : (self.canvas ? self.canvas.height / 2 + 30 : 300);
        self.emitParticles(cx, cy, 'rgba(0,212,255,', 8);
      }
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      if (!self.isJumping && !self.isSliding) {
        self.isSliding = true;
        self.slideTimer = 20;
      }
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      self.targetSpeed = Math.min(16 * self.speed, self.targetSpeed + 1.0 * self.speed);
      self._shiftHeld = true;
    } else if (e.code === 'KeyX') {
      e.preventDefault();
      if (self.sprintCooldown <= 0 && self.freezeTimer <= 0) {
        self._triggerSprint();
      }
    }
  };
  this._keyUpHandler = function (e) {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      self._shiftHeld = false;
    }
  };
  window.addEventListener('keydown', this._keyHandler);
  window.addEventListener('keyup', this._keyUpHandler);

  // 体感跳跃：订阅 MediaPipeManager，躯干上移 → 触发跳跃
  var self = this;
  this._poseJumpAccum = 0;
  this._posePrevHipY = null;
  this._poseJumpHandler = function (results) {
    if (!self._running || self.isJumping) return;
    var lm = results.poseLandmarks;
    var lHip = lm[23], rHip = lm[24];
    if (!lHip || !rHip) { self._posePrevHipY = null; self._poseJumpAccum = 0; return; }
    var hipY = (lHip.y + rHip.y) / 2;
    if (self._posePrevHipY !== null) {
      var delta = self._posePrevHipY - hipY; // 正值 = 向上移动
      if (Math.abs(delta) > 0.003) self._poseJumpAccum += delta;
      if (self._poseJumpAccum < 0) self._poseJumpAccum = 0; // 只累积向上
      if (self._poseJumpAccum > 0.025) {
        self.isJumping = true;
        self.isSliding = false;
        self.playerVY = -18 * self.speed;
        self._poseJumpAccum = 0;
      }
      if (Math.abs(self._poseJumpAccum) > 0.1) self._poseJumpAccum = 0; // 误差清理
    }
    self._posePrevHipY = hipY;
  };
  if (window.mpManager) window.mpManager.subscribe(this._poseJumpHandler);

  // 开场动画序列 / 教学模式分流
  if (STATE._tutorialMode) {
    this._startTutorialFlow();
  } else {
    this._startIntroSequence();
  }
};

SubwaySurfGame.prototype._startIntroSequence = function () {
  var self = this;
  var overlay = document.getElementById('intro-overlay');
  var frameImg = document.getElementById('intro-frame');

  // 互斥标志：防止 video canplay / timeout / readyState 竞态重复启动
  self._introStarted = false;

  // 创建 BGM (游戏中循环播放)
  var djBgm = new Audio('games/subway/sounds/nianzhangshi.mp3');
  djBgm.loop = true;
  djBgm.volume = 0.5;
  self._bgm = djBgm;

  // 预加载开场帧 (3 张)
  var introFrames = [];
  for (var i = 1; i <= 3; i++) {
    var img = new Image();
    img.src = 'games/subway/pictures/start/' + i + '.png';
    introFrames.push(img);
  }

  // 帧序列播放
  var idx = 0;
  var showNext = function () {
    if (idx >= 3) {
      if (overlay) overlay.style.display = 'none';
      djBgm.play().catch(function () {});
      self.startLoop();
      return;
    }
    var f = introFrames[idx];
    if (frameImg && f && f.complete) {
      frameImg.src = f.src;
    }
    idx++;
    setTimeout(showNext, 1000);
  };

  // 帧序列启动
  var startFrameShow = function () {
    if (introFrames[0] && introFrames[0].complete) {
      if (frameImg) frameImg.src = introFrames[0].src;
      idx = 1;
      setTimeout(showNext, 1000);
    } else {
      setTimeout(startFrameShow, 100);
    }
  };

  // 创建开场视频 (屏幕正中)
  var introVideo = document.createElement('video');
  introVideo.src = 'games/subway/video/runafterme.mp4';
  introVideo.volume = 1.0;
  introVideo.playsInline = true;
  introVideo.style.cssText =
    'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);' +
    'max-height:70%;max-width:70%;z-index:91;opacity:0;' +
    'transition:opacity 0.8s ease;' +
    'pointer-events:none;';

  // 视频播放完毕 → 淡出 → 图片动画
  var onVideoEnd = function () {
    introVideo.removeEventListener('ended', onVideoEnd);
    introVideo.style.opacity = '0';
    setTimeout(function () {
      if (introVideo.parentNode) introVideo.parentNode.removeChild(introVideo);
      startFrameShow();
    }, 850);
  };
  introVideo.addEventListener('ended', onVideoEnd);

  // 视频加载完成后显示 overlay + 播放
  var startVideo = function () {
    if (self._introStarted) return;
    self._introStarted = true;
    if (overlay) overlay.style.display = 'flex';
    if (overlay && !introVideo.parentNode) overlay.appendChild(introVideo);
    requestAnimationFrame(function () {
      introVideo.style.opacity = '1';
    });
    introVideo.play().catch(function () {
      // 播放失败 → 跳过视频，直接图片动画
      if (introVideo.parentNode) introVideo.parentNode.removeChild(introVideo);
      if (overlay) overlay.style.display = 'flex';
      startFrameShow();
    });
  };

  // 等待视频可播放
  if (introVideo.readyState >= 2) {
    startVideo();
  } else {
    introVideo.addEventListener('canplay', function () {
      startVideo();
    });
    // 超时兜底 (3 秒)
    setTimeout(function () {
      if (self._introStarted) return;
      self._introStarted = true;
      if (introVideo.parentNode) introVideo.parentNode.removeChild(introVideo);
      if (overlay) overlay.style.display = 'flex';
      startFrameShow();
    }, 3000);
  }
};

// ====================================================================
// 教学模式
// ====================================================================

SubwaySurfGame.prototype._startTutorialFlow = function () {
  this._tutorialPhase = 'galge1';
  this._tutorialCoinCount = 0;
  this._tutorialCoins = [];
  this._tutorialCoinTimer = 0;
  this._tutorialRunning = false;
  this._tutorialTreadmillOffset = 0;
  this._runFrameTimer = 0;
  this._runFrameIdx = 0;
  this._isJumping = false;
  this._playerVY = 0;
  this._playerY = this.canvas.height * 0.68 + 6;
  this._tutorialJumpFrameIdx = 0;

  // 先绘制公司背景到 Canvas，让 galge 对话框后面看到办公室
  this._renderTutorialSceneBg();

  var overlay = document.getElementById('tutorial-dialog-overlay');
  var charWrap = document.getElementById('tutorial-char-wrap');
  var bubble = document.getElementById('tutorial-dialog-bubble');
  var text = document.getElementById('tutorial-dialog-text');

  if (!overlay || !charWrap || !bubble || !text) {
    // 降级：直接进入教程 gameplay
    this._startTutorialGameplay();
    return;
  }

  text.textContent = '咱平时啊，在公司就练起来！';
  overlay.style.display = 'block';

  // 确保初始位置正确
  charWrap.classList.remove('slide-out');
  // 触发滑入 (下一帧让 CSS transition 生效)
  requestAnimationFrame(function () {
    charWrap.classList.add('slide-in');
    bubble.classList.add('show');
  });

  // 播放语音，播放完毕才能继续
  this._tutorialDialogReady = false;
  var hint = document.getElementById('tutorial-dialog-hint');
  if (hint) hint.textContent = '🔊 播放中...';

  var audio = new Audio('games/subway/sounds/38482806682-1-192 (online-video-cutter.com).mp3');
  audio.volume = 1.0;
  var self = this;
  audio.onended = function () {
    self._tutorialDialogReady = true;
    if (hint) hint.textContent = '点击或按空格继续';
  };
  audio.onerror = function () {
    // 加载失败时直接允许继续
    self._tutorialDialogReady = true;
    if (hint) hint.textContent = '点击或按空格继续';
  };
  audio.play().catch(function () {
    self._tutorialDialogReady = true;
    if (hint) hint.textContent = '点击或按空格继续';
  });

  this._tutorialDialogHandler = function (e) {
    if (!self._tutorialDialogReady) return;
    if (e.type === 'keydown') {
      if (e.code !== 'Space' && e.code !== 'Enter') return;
      e.preventDefault();
    }
    self._onTutorialDialogClick();
  };
  overlay.addEventListener('click', this._tutorialDialogHandler);
  window.addEventListener('keydown', this._tutorialDialogHandler);
};

SubwaySurfGame.prototype._onTutorialDialogClick = function () {
  var overlay = document.getElementById('tutorial-dialog-overlay');
  var charWrap = document.getElementById('tutorial-char-wrap');
  var bubble = document.getElementById('tutorial-dialog-bubble');

  // 解绑事件
  if (this._tutorialDialogHandler) {
    overlay.removeEventListener('click', this._tutorialDialogHandler);
    window.removeEventListener('keydown', this._tutorialDialogHandler);
    this._tutorialDialogHandler = null;
  }

  var self = this;
  var phase = this._tutorialPhase;

  if (phase === 'galge2') {
    // galge2: 立即切到主游戏，不做滑回动画
    if (overlay) overlay.style.display = 'none';
    if (charWrap) {
      charWrap.classList.remove('slide-in');
      charWrap.classList.remove('slide-out');
    }
    if (bubble) bubble.classList.remove('show');
    // 清理所有教程 UI
    var els = ['tutorial-choice-overlay', 'tutorial-center-text'];
    for (var ei = 0; ei < els.length; ei++) {
      var el = document.getElementById(els[ei]);
      if (el) el.style.display = 'none';
    }
    // 清理教程键盘
    if (self._tutorialKeyHandler) {
      window.removeEventListener('keydown', self._tutorialKeyHandler);
      self._tutorialKeyHandler = null;
    }
    // 清理教程摄像头体感
    if (self._tutorialPoseHandler && window.mpManager) {
      window.mpManager.unsubscribe(self._tutorialPoseHandler);
      self._tutorialPoseHandler = null;
    }
    // 恢复主游戏 HTML HUD
    var hudEls = document.querySelectorAll('#screen-game-subway .hud, #screen-game-subway .rules-bar');
    for (var hi = 0; hi < hudEls.length; hi++) {
      hudEls[hi].style.display = '';
    }
    self._tutorialPhase = 'done';
    STATE._tutorialMode = false;
    self._startIntroSequence();
    return;
  }

  // galge1: 角色滑回后进入教程 gameplay
  if (charWrap) {
    charWrap.classList.remove('slide-in');
    charWrap.classList.add('slide-out');
  }
  if (bubble) bubble.classList.remove('show');

  setTimeout(function () {
    if (overlay) overlay.style.display = 'none';
    if (charWrap) charWrap.classList.remove('slide-out');
    self._startTutorialGameplay();
  }, 500);
};

SubwaySurfGame.prototype._startTutorialGameplay = function () {
  this._tutorialPhase = 'gameplay';
  this._tutorialCoinCount = 0;
  this._tutorialCoins = [];
  this._tutorialCoinTimer = 0;
  this._tutorialTreadmillOffset = 0;
  this._groundY = this.canvas.height * 0.68 + 6;  // 传送带顶面
  this._playerY = this._groundY;
  this._isJumping = false;
  this._playerVY = 0;
  this._tutorialJumpFrameIdx = 0;

  // 隐藏 intro overlay (如果还在)
  var intro = document.getElementById('intro-overlay');
  if (intro) intro.style.display = 'none';

  // 隐藏主游戏 HTML HUD (滑铲/Shift等描述不适用于教程，避免重复元素)
  var hudEls = document.querySelectorAll('#screen-game-subway .hud, #screen-game-subway .rules-bar');
  for (var hi = 0; hi < hudEls.length; hi++) {
    hudEls[hi].style.display = 'none';
  }

  // 教程专用键盘：只响应跳跃
  var self = this;
  this._tutorialKeyHandler = function (e) {
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !self._isJumping) {
      e.preventDefault();
      self._isJumping = true;
      self._playerVY = -15 * self.speed;
      self._tutorialJumpFrameIdx = 0;
    }
  };
  window.addEventListener('keydown', this._tutorialKeyHandler);

  // 教程摄像头体感跳跃 (同主游戏逻辑)
  this._tutorialPoseJumpAccum = 0;
  this._tutorialPosePrevHipY = null;
  this._tutorialPoseHandler = function (results) {
    if (!self._tutorialRunning || self._isJumping) return;
    var lm = results.poseLandmarks;
    var lHip = lm[23], rHip = lm[24];
    if (!lHip || !rHip) { self._tutorialPosePrevHipY = null; self._tutorialPoseJumpAccum = 0; return; }
    var hipY = (lHip.y + rHip.y) / 2;
    if (self._tutorialPosePrevHipY !== null) {
      var delta = self._tutorialPosePrevHipY - hipY; // 正值 = 向上
      if (Math.abs(delta) > 0.003) self._tutorialPoseJumpAccum += delta;
      if (self._tutorialPoseJumpAccum < 0) self._tutorialPoseJumpAccum = 0;
      if (self._tutorialPoseJumpAccum > 0.025) {
        self._isJumping = true;
        self._playerVY = -15 * self.speed;
        self._tutorialJumpFrameIdx = 0;
        self._tutorialPoseJumpAccum = 0;
      }
      if (Math.abs(self._tutorialPoseJumpAccum) > 0.1) self._tutorialPoseJumpAccum = 0;
    }
    self._tutorialPosePrevHipY = hipY;
  };
  if (window.mpManager) window.mpManager.subscribe(this._tutorialPoseHandler);

  // 启动教程循环
  this._tutorialRunning = true;
  (function tutLoop() {
    if (!self._tutorialRunning) return;
    self._tutorialUpdate();
    self._tutorialRender();
    self._tutorialRafId = requestAnimationFrame(tutLoop);
  })();
};

SubwaySurfGame.prototype._tutorialUpdate = function () {
  var W = this.canvas.width, H = this.canvas.height;
  var groundY = H * 0.68 + 6;  // 传送带顶面 = 跑步机站立面

  // 跳跃物理
  if (this._isJumping) {
    this._playerVY += 0.55 * this.speed;
    this._playerY += this._playerVY;
    if (this._playerY >= groundY) {
      this._playerY = groundY;
      this._playerVY = 0;
      this._isJumping = false;
    }
  } else {
    this._playerY = groundY;
  }

  // 跑步机传送带动画
  this._tutorialTreadmillOffset += 3;
  if (this._tutorialTreadmillOffset > 40) this._tutorialTreadmillOffset = 0;

  // 跑步动画计时
  if (this._runFrameTimer === undefined) this._runFrameTimer = 0;
  this._runFrameTimer++;
  if (this._runFrameTimer >= 8) {
    this._runFrameTimer = 0;
    if (this._runFrameIdx === undefined) this._runFrameIdx = 0;
    this._runFrameIdx = (this._runFrameIdx + 1) % 6;
  }

  // 跳跃帧动画
  if (this._isJumping) {
    if (this._tutorialJumpFrameTimer === undefined) this._tutorialJumpFrameTimer = 0;
    this._tutorialJumpFrameTimer++;
    if (this._tutorialJumpFrameTimer >= 4) {
      this._tutorialJumpFrameTimer = 0;
      this._tutorialJumpFrameIdx = (this._tutorialJumpFrameIdx + 1) % 5;
    }
  }

  // 金币生成：在跳跃最高点附近 (跳跃峰值 ~105px 高于传送带)
  this._tutorialCoinTimer++;
  var activeCoins = this._tutorialCoins.filter(function (c) { return !c.collected; }).length;
  var remainingNeeded = 3 - this._tutorialCoinCount - activeCoins;
  if (this._tutorialCoinTimer > 80 && activeCoins < 2 && remainingNeeded > 0) {
    this._tutorialCoins.push({
      x: W + 60,
      y: groundY - 105 - Math.random() * 25,
      r: 16,
      collected: false,
      sparkle: 0
    });
    this._tutorialCoinTimer = 0;
  }

  // 金币移动 & 碰撞
  var coinSpeed = 3.2;
  for (var i = this._tutorialCoins.length - 1; i >= 0; i--) {
    var coin = this._tutorialCoins[i];
    coin.x -= coinSpeed;
    coin.sparkle += 0.08;

    if (!coin.collected) {
      // 角色碰撞中心：水平居中，垂直 ~角色上身
      var cx = W / 2;
      var cy = this._playerY - 65;
      var dist = Math.hypot(cx - coin.x, cy - coin.y);
      if (dist < 42) {
        coin.collected = true;
        this._tutorialCoinCount++;
        if (this._tutorialCoinCount >= 3) {
          this._tutorialRunning = false;
          if (this._tutorialRafId) cancelAnimationFrame(this._tutorialRafId);
          this._showTiredText();
          return;
        }
      }
    }

    if (coin.x < -50 || coin.collected) {
      this._tutorialCoins.splice(i, 1);
    }
  }
};

SubwaySurfGame.prototype._renderTutorialSceneBg = function () {
  var ctx = this.ctx;
  var W = this.canvas.width, H = this.canvas.height;
  var wallBottom = H * 0.68;

  ctx.clearRect(0, 0, W, H);

  // === 办公室墙壁 ===
  var wallGrad = ctx.createLinearGradient(0, 0, 0, wallBottom);
  wallGrad.addColorStop(0, '#f5efe6');
  wallGrad.addColorStop(0.5, '#ede5d8');
  wallGrad.addColorStop(1, '#dcd0bf');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, W, wallBottom);

  // 踢脚线
  ctx.fillStyle = '#c4b5a2';
  ctx.fillRect(0, wallBottom - 10, W, 12);
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.fillRect(0, wallBottom - 10, W, 2);

  // === 窗户 (3扇) ===
  var winY = H * 0.06, winH = H * 0.18;
  var winW = [140, 155, 140];
  var totalW = winW[0] + winW[1] + winW[2] + 90;
  var startX = (W - totalW) / 2;

  for (var wi = 0; wi < 3; wi++) {
    var wx = startX + wi * (winW[wi] + 45);
    // 窗框外框
    ctx.fillStyle = '#a09080';
    ctx.fillRect(wx - 5, winY - 5, winW[wi] + 10, winH + 10);
    // 玻璃
    var glGrad = ctx.createLinearGradient(wx, winY, wx, winY + winH);
    glGrad.addColorStop(0, 'rgba(140,210,240,0.45)');
    glGrad.addColorStop(0.4, 'rgba(185,220,238,0.38)');
    glGrad.addColorStop(1, 'rgba(155,200,225,0.44)');
    ctx.fillStyle = glGrad;
    ctx.fillRect(wx, winY, winW[wi], winH);
    // 十字窗格
    ctx.strokeStyle = '#a09080';
    ctx.lineWidth = 3;
    ctx.strokeRect(wx, winY, winW[wi], winH);
    ctx.beginPath();
    ctx.moveTo(wx + winW[wi] / 2, winY);
    ctx.lineTo(wx + winW[wi] / 2, winY + winH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx, winY + winH / 2);
    ctx.lineTo(wx + winW[wi], winY + winH / 2);
    ctx.stroke();
    // 百叶窗
    ctx.strokeStyle = 'rgba(180,170,155,0.45)';
    ctx.lineWidth = 1;
    for (var bl = winY + 9; bl < winY + winH; bl += 12) {
      ctx.beginPath();
      ctx.moveTo(wx + 2, bl);
      ctx.lineTo(wx + winW[wi] - 2, bl);
      ctx.stroke();
    }
  }

  // === 挂钟 (右上角) ===
  var clX = W - 100, clY = H * 0.14, clR = 33;
  ctx.fillStyle = '#fdfdfd';
  ctx.beginPath();
  ctx.arc(clX, clY, clR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b0a090';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(clX, clY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(clX, clY); ctx.lineTo(clX + 14, clY - 9); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(clX, clY); ctx.lineTo(clX - 7, clY + 13); ctx.stroke();

  // === 木地板 ===
  var floorY = wallBottom;
  var flGrad = ctx.createLinearGradient(0, floorY, 0, H);
  flGrad.addColorStop(0, '#c8a882');
  flGrad.addColorStop(0.3, '#ba966e');
  flGrad.addColorStop(1, '#8a6d4e');
  ctx.fillStyle = flGrad;
  ctx.fillRect(0, floorY, W, H - floorY);

  // 地板横纹
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  for (var fy = floorY; fy < H; fy += 20) {
    ctx.beginPath();
    ctx.moveTo(0, fy);
    ctx.lineTo(W, fy);
    ctx.stroke();
  }
  // 地板竖接缝
  for (var fy2 = floorY; fy2 < H; fy2 += 20) {
    var ri = Math.floor((fy2 - floorY) / 20);
    var off = (ri % 3) * 55;
    for (var fx = off; fx < W; fx += 190) {
      ctx.beginPath();
      ctx.moveTo(fx, fy2);
      ctx.lineTo(fx, fy2 + 20);
      ctx.stroke();
    }
  }

  // === 跑步机 - 侧面视图 ===
  var tmBeltX = W / 2 - 170;       // 传送带左端
  var tmBeltW = 340;               // 传送带长度
  var tmBeltTop = wallBottom + 6;   // 传送带顶面 = 角色站立面
  var tmBeltH = 8;                 // 传送带厚度
  var tmBaseH = 6;                 // 底座高度

  // --- 底座 ---
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.roundRect(tmBeltX - 8, tmBeltTop + tmBeltH, tmBeltW + 16, tmBaseH, 3);
  ctx.fill();

  // --- 传送带 ---
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(tmBeltX, tmBeltTop, tmBeltW, tmBeltH, 3);
  ctx.clip();
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(tmBeltX, tmBeltTop, tmBeltW, tmBeltH);
  // 传送带滚动纹理
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  for (var bl = this._tutorialTreadmillOffset; bl < tmBeltW; bl += 22) {
    ctx.beginPath();
    ctx.moveTo(tmBeltX + bl, tmBeltTop);
    ctx.lineTo(tmBeltX + bl, tmBeltTop + tmBeltH);
    ctx.stroke();
  }
  ctx.restore();

  // 传送带边框
  ctx.strokeStyle = '#3d3d3d';
  ctx.lineWidth = 1;
  ctx.stroke();

  // --- 前滚轴 (右端凸起) ---
  var rollerX = tmBeltX + tmBeltW - 15;
  ctx.fillStyle = '#4a4a4a';
  ctx.beginPath();
  ctx.roundRect(rollerX, tmBeltTop - 4, 22, tmBeltH + 8, 6);
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.stroke();

  // --- 后滚轴 (左端凸起) ---
  var rearRollerX = tmBeltX - 7;
  ctx.fillStyle = '#3d3d3d';
  ctx.beginPath();
  ctx.roundRect(rearRollerX, tmBeltTop - 2, 14, tmBeltH + 4, 4);
  ctx.fill();
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // --- 马达罩 (右端上方) ---
  var motorX = tmBeltX + tmBeltW - 58;
  var motorW = 60;
  var motorH = 52;
  var motorY = tmBeltTop - motorH;
  var mGrad = ctx.createLinearGradient(0, motorY, 0, tmBeltTop);
  mGrad.addColorStop(0, '#4a4a4a');
  mGrad.addColorStop(0.4, '#3d3d3d');
  mGrad.addColorStop(1, '#2e2e2e');
  ctx.fillStyle = mGrad;
  ctx.beginPath();
  ctx.roundRect(motorX, motorY, motorW, motorH, 4);
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.stroke();
  // 马达散热槽
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (var ms = 0; ms < 6; ms++) {
    ctx.beginPath();
    ctx.moveTo(motorX + 8, motorY + 10 + ms * 7);
    ctx.lineTo(motorX + motorW - 8, motorY + 10 + ms * 7);
    ctx.stroke();
  }

  // --- 控制面板 (马达上方) ---
  var pnlW = 55, pnlH = 38;
  var pnlX = motorX + motorW / 2 - pnlW / 2;
  var pnlY = motorY - pnlH + 8;
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath();
  ctx.roundRect(pnlX, pnlY, pnlW, pnlH, 4);
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.stroke();
  // 屏幕
  ctx.fillStyle = '#0a0';
  ctx.fillRect(pnlX + 8, pnlY + 5, pnlW - 16, 15);
  ctx.fillStyle = '#0f0';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('8.5', pnlX + pnlW / 2, pnlY + 16);
  ctx.textAlign = 'start';

};

SubwaySurfGame.prototype._tutorialRender = function () {
  var ctx = this.ctx;
  var W = this.canvas.width, H = this.canvas.height;
  var wallBottom = H * 0.68;
  var tmBeltTop = wallBottom + 6;   // 传送带顶面 = 角色站立面

  // 绘制场景背景
  this._renderTutorialSceneBg();

  // === 角色 (站在跑步机传送带上) ===
  var charX = W / 2;
  var groundY = tmBeltTop;  // 地面 = 传送带表面
  var charDrawY;
  if (this._isJumping) {
    var jumpOffset = groundY - this._playerY;
    charDrawY = tmBeltTop - jumpOffset;
  } else {
    charDrawY = tmBeltTop + Math.sin(this._runFrameTimer * 0.18) * 2;
  }

  if (this._isJumping && this.jumpFrames && this.jumpFrames.length > 0) {
    var jf = this.jumpFrames[this._tutorialJumpFrameIdx % 5];
    if (jf && jf.complete && jf.naturalWidth > 0) {
      ctx.drawImage(jf, charX - 32, charDrawY - 78, 64, 100);
    }
  } else if (this.runFrames && this.runFrames.length > 0) {
    var rf = this.runFrames[this._runFrameIdx % 6];
    if (rf && rf.complete && rf.naturalWidth > 0) {
      ctx.drawImage(rf, charX - 32, charDrawY - 78, 64, 100);
    }
  }

  // === 金币 ===
  for (var ci = 0; ci < this._tutorialCoins.length; ci++) {
    var coin = this._tutorialCoins[ci];
    if (coin.collected) continue;
    ctx.save();
    ctx.shadowColor = 'rgba(255,215,0,0.8)';
    ctx.shadowBlur = 14;
    var cg = ctx.createRadialGradient(coin.x - 2, coin.y - 2, 0, coin.x, coin.y, coin.r);
    cg.addColorStop(0, '#fff7a0');
    cg.addColorStop(0.5, '#ffd700');
    cg.addColorStop(1, '#b8860b');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(coin.x - 2, coin.y - 2, coin.r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(180,140,0,0.7)';
    ctx.font = 'bold ' + (coin.r * 1.15) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', coin.x, coin.y);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }

  // === HUD: 大字提示 (屏幕偏上方) ===
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 2.2rem "Microsoft YaHei","PingFang SC",Arial';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 12;
  ctx.fillText('空格跳跃，吃满三个金币！', W / 2, H * 0.26);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'start';

  // === HUD: 金币计数 (右上角) ===
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.roundRect(W - 140, 14, 120, 32, 7);
  ctx.fill();
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 0.95rem Arial';
  ctx.textAlign = 'right';
  ctx.fillText('🪙 ' + this._tutorialCoinCount + '/3', W - 28, 36);
  ctx.textAlign = 'start';

  // === HUD: 进度条 (顶部居中) ===
  var barX = W / 2 - 70, barY = 56, barW = 140, barH = 5;
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 2.5);
  ctx.fill();
  var prog = Math.min(this._tutorialCoinCount / 3, 1);
  if (prog > 0) {
    var pGrad = ctx.createLinearGradient(barX, 0, barX + barW * prog, 0);
    pGrad.addColorStop(0, '#ffd700');
    pGrad.addColorStop(1, '#ff8c00');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * prog, barH, 2.5);
    ctx.fill();
  }
};

SubwaySurfGame.prototype._showTiredText = function () {
  this._tutorialPhase = 'tired_text';

  // 清理教程键盘事件
  if (this._tutorialKeyHandler) {
    window.removeEventListener('keydown', this._tutorialKeyHandler);
    this._tutorialKeyHandler = null;
  }
  // 清理教程摄像头体感
  if (this._tutorialPoseHandler && window.mpManager) {
    window.mpManager.unsubscribe(this._tutorialPoseHandler);
    this._tutorialPoseHandler = null;
  }

  var ct = document.getElementById('tutorial-center-text');
  if (ct) ct.style.display = 'flex';

  var self = this;
  setTimeout(function () {
    if (ct) ct.style.display = 'none';
    self._showGalge2();
  }, 1800);
};

SubwaySurfGame.prototype._showGalge2 = function () {
  this._tutorialPhase = 'galge2';

  var overlay = document.getElementById('tutorial-dialog-overlay');
  var charWrap = document.getElementById('tutorial-char-wrap');
  var bubble = document.getElementById('tutorial-dialog-bubble');
  var text = document.getElementById('tutorial-dialog-text');
  var charImg = document.getElementById('tutorial-char-img');

  if (!overlay || !charWrap || !bubble || !text) {
    this._tutorialFadeToMainGame();
    return;
  }

  // 替换为第二张角色图片
  if (charImg) {
    charImg.src = 'games/subway/pictures/QQ20260611-183819.png';
  }

  text.textContent = '卷不动了就滚';
  overlay.style.display = 'block';
  charWrap.classList.remove('slide-out');

  requestAnimationFrame(function () {
    charWrap.classList.add('slide-in');
    bubble.classList.add('show');
  });

  // 播放语音，播放完毕才能继续
  this._tutorialDialogReady = false;
  var hint = document.getElementById('tutorial-dialog-hint');
  if (hint) hint.textContent = '🔊 播放中...';

  var audio = new Audio('games/subway/sounds/gundan.mp3');
  audio.volume = 1.0;
  var self = this;
  audio.onended = function () {
    self._tutorialDialogReady = true;
    if (hint) hint.textContent = '点击或按空格继续';
  };
  audio.onerror = function () {
    self._tutorialDialogReady = true;
    if (hint) hint.textContent = '点击或按空格继续';
  };
  audio.play().catch(function () {
    self._tutorialDialogReady = true;
    if (hint) hint.textContent = '点击或按空格继续';
  });

  this._tutorialDialogHandler = function (e) {
    if (!self._tutorialDialogReady) return;
    if (e.type === 'keydown') {
      if (e.code !== 'Space' && e.code !== 'Enter') return;
      e.preventDefault();
    }
    self._onTutorialDialogClick();
  };
  overlay.addEventListener('click', this._tutorialDialogHandler);
  window.addEventListener('keydown', this._tutorialDialogHandler);
};

SubwaySurfGame.prototype._tutorialFadeToMainGame = function () {
  this._tutorialPhase = 'fadeout';
  var fade = document.getElementById('tutorial-fade-overlay');
  var self = this;

  // 淡入黑色遮罩
  if (fade) {
    fade.style.display = 'block';
    requestAnimationFrame(function () {
      fade.classList.add('fade-in');
    });
  }

  setTimeout(function () {
    // 清理所有教程 UI
    var els = ['tutorial-choice-overlay', 'tutorial-dialog-overlay', 'tutorial-center-text'];
    for (var ei = 0; ei < els.length; ei++) {
      var el = document.getElementById(els[ei]);
      if (el) el.style.display = 'none';
    }

    // 清理事件
    if (self._tutorialDialogHandler) {
      var ov = document.getElementById('tutorial-dialog-overlay');
      if (ov) ov.removeEventListener('click', self._tutorialDialogHandler);
      window.removeEventListener('keydown', self._tutorialDialogHandler);
      self._tutorialDialogHandler = null;
    }
    if (self._tutorialKeyHandler) {
      window.removeEventListener('keydown', self._tutorialKeyHandler);
      self._tutorialKeyHandler = null;
    }

    // 淡出 → 开始正篇
    if (fade) {
      fade.classList.remove('fade-in');
      setTimeout(function () {
        fade.style.display = 'none';
        self._tutorialPhase = 'done';
        STATE._tutorialMode = false;
        self._startIntroSequence();
      }, 850);
    } else {
      self._tutorialPhase = 'done';
      STATE._tutorialMode = false;
      self._startIntroSequence();
    }
  }, 900);
};

SubwaySurfGame.prototype.emitParticles = function(x, y, color, count) {
  for (var i = 0; i < count; i++) {
    this.particles.push({ x: x + randRange(-15, 15), y: y + randRange(-15, 15), vx: randRange(-4, 4), vy: randRange(-5, 0), life: 1, color: color, size: randRange(3, 6) });
  }
};

SubwaySurfGame.prototype._triggerSprint = function () {
  this.freezeTimer = 60;       // 1 秒冻结 (60fps)
  this.sprintCooldown = 180;   // 3 秒冷却
  this.invincibleTimer = 60;   // 冻结期间无敌

  // 显示冲刺照片叠加
  var overlay = document.getElementById('sprint-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    setTimeout(function () {
      overlay.style.display = 'none';
    }, 1000);
  }

  // 清除前方所有障碍物（冲刺斩击效果）
  this.obstacles = [];

  // 爆发粒子
  var cx = this.canvas ? this.canvas.width / 2 : window.innerWidth / 2;
  var cy = this.playerY || (this.canvas ? this.canvas.height / 2 + 30 : 300);
  for (var i = 0; i < 20; i++) {
    this.particles.push({
      x: cx + randRange(-40, 40), y: cy + randRange(-40, 40),
      vx: randRange(-10, 10), vy: randRange(-12, -3),
      life: 1, color: 'rgba(255,255,255,', size: randRange(5, 10)
    });
  }
};

SubwaySurfGame.prototype._applyPowerUp = function (type) {
  switch (type) {
    case 'invincible':
      this.powerInvincible = 360; // 6 秒无敌
      break;
    case 'heal':
      STATE.gameStats.hp = Math.min(100, STATE.gameStats.hp + 20);
      break;
    case 'double':
      this.powerDoubleActive = true;
      this.powerDoubleTimer = 1800; // 30 秒
      break;
    case 'slow':
      if (!this.powerSlowActive) {
        this.powerSlowSavedSpeed = this.targetSpeed;
      }
      this.powerSlowActive = true;
      this.powerSlowTimer = 1800; // 30 秒
      this.targetSpeed = this.targetSpeed * 0.5;
      break;
  }
};

SubwaySurfGame.prototype.startLoop = function () {
  var self = this;
  if (this._running) return; // 防止重复启动
  this._running = true;
  (function loop() {
    if (!self._running) return;
    try {
      self.update();
      self.render();
    } catch (e) {
      console.error('[Subway] 游戏循环崩溃:', e);
      self._running = false;
      return;
    }
    self._animFrameId = requestAnimationFrame(loop);
  })();
};

SubwaySurfGame.prototype.update = function () {
  this.frameCount++;
  // 冲刺冷却 + 冻结计时
  if (this.sprintCooldown > 0) this.sprintCooldown--;
  if (this.freezeTimer > 0) {
    this.freezeTimer--;
    // 冻结期间跳过所有游戏逻辑
    this.render();
    return;
  }
  // 无尽模式：HP 仅受碰撞影响，不自动衰减
  var stats = STATE.gameStats;
  var W = this.canvas.width, H = this.canvas.height;

  // 速度随距离增长，2000m 后封顶
  this.speedLevel = 1 + Math.floor(Math.min(this.distance, 2000) / 300);
  var baseSpeed = (8 + this.speedLevel * 1.5) * this.speed;
  // Shift 加速 / 松开衰减
  if (this._shiftHeld) {
    this.targetSpeed = Math.min(16 * this.speed, this.targetSpeed + 0.5);
  } else {
    this.targetSpeed = lerp(this.targetSpeed, baseSpeed, 0.1);
  }
  this.targetSpeed = Math.max(baseSpeed, this.targetSpeed);
  this.scrollSpeed = lerp(this.scrollSpeed, this.targetSpeed, 0.1);
  var effectiveSpeed = this.powerSlowActive ? this.scrollSpeed * 0.5 : this.scrollSpeed;
  this.distance += effectiveSpeed * 0.12;

  var groundY = H / 2 + 30;
  if (this.playerY === 0 && !this.isJumping) this.playerY = groundY;

  if (this.isJumping) {
    this.playerVY += 0.65 * this.speed;
    this.playerY += this.playerVY;
    if (this.playerY >= groundY) {
      this.playerY = groundY;
      this.playerVY = 0;
      this.isJumping = false;
      this.emitParticles(W / 2, groundY, 'rgba(255,255,255,', 5);
    }
  } else {
    this.playerY = groundY;
  }

  if (this.isSliding) {
    this.slideTimer--;
    if (this.slideTimer <= 0) this.isSliding = false;
  }

  // ---- 影子角色物理 ----
  if (this.shadowY === 0 && !this.shadowJumping) this.shadowY = groundY;
  if (this.shadowJumping) {
    this.shadowVY += 0.65 * this.speed;
    this.shadowY += this.shadowVY;
    if (this.shadowY >= groundY) {
      this.shadowY = groundY;
      this.shadowVY = 0;
      this.shadowJumping = false;
    }
  } else {
    this.shadowY = groundY;
  }
  if (this.shadowSliding) {
    this.shadowSlideTimer--;
    if (this.shadowSlideTimer <= 0) this.shadowSliding = false;
  }

  var spd = effectiveSpeed * 0.8;

  // ---- Dino 式障碍物生成 ----
  // 使用间隔计数器保证最小反应距离，而非完全随机
  this.obstacleTimer++;
  this.invincibleTimer = Math.max(0, this.invincibleTimer - 1);

  if (this.obstaclePending > 0) {
    // 正在生成连续障碍物对
    this.obstaclePending--;
    if (this.obstaclePending === 0) {
      // 第二个障碍物紧跟第一个之后
      var types2 = ['box', 'barrier', 'spike'];
      // 5级以后解锁天花板尖刺
      if (this.speedLevel >= 5) types2.push('ceiling_spike');
      var type2 = types2[randInt(0, types2.length)];
      this.obstacles.push({
        x: W + 100 + randRange(60, 120),
        y: groundY - (type2 === 'spike' ? 15 : type2 === 'ceiling_spike' ? 180 : type2 === 'barrier' ? 35 : 28),
        w: type2 === 'spike' ? 28 : type2 === 'ceiling_spike' ? 28 : type2 === 'barrier' ? 24 : 38,
        h: type2 === 'spike' ? 15 : type2 === 'ceiling_spike' ? 25 : type2 === 'barrier' ? 60 : 32,
        type: type2,
        passed: false
      });
    }
  } else {
    // 固定间隔 — 不随速度增加障碍物密度，速度增加体现在滚动更快
    var minGap = 450;
    this.obstacleGap += spd;

    if (this.obstacleGap > minGap) {
      var types = ['box', 'barrier', 'spike'];
      if (this.speedLevel >= 3) types.push('train');
      if (this.speedLevel >= 5) types.push('ceiling_spike');
      var type = types[randInt(0, types.length)];
      this.obstacles.push({
        x: W + 100,
        y: type === 'spike' ? groundY - 15 :
           type === 'ceiling_spike' ? 20 :
           type === 'train' ? groundY - 50 :
           type === 'barrier' ? groundY - 35 : groundY - 28,
        w: type === 'spike' || type === 'ceiling_spike' ? 28 :
           type === 'train' ? 85 :
           type === 'barrier' ? 24 : 38,
        h: type === 'spike' || type === 'ceiling_spike' ? 15 :
           type === 'train' ? 55 :
           type === 'barrier' ? 60 : 32,
        type: type,
        passed: false
      });
      this.obstacleGap = 0;

      // 10% 概率出连续障碍物对
      if (this.speedLevel >= 3 && Math.random() < 0.1) {
        this.obstaclePending = Math.floor(randRange(6, 12));
      } else {
        this.obstaclePending = 0;
      }
    }
  }

  // 金币生成
  this.coinTimer++;
  if (this.coinTimer > 50 && Math.random() < 0.3) {
    this.coins.push({ x: W + 60, y: groundY - randRange(60, 140), r: 9, collected: false, sparkle: 0 });
    this.coinTimer = 0;
    // 每生成 20 个普通币 → 生成一枚特殊币
    this.normalCoinCollected++;
    if (this.normalCoinCollected >= 20) {
      this.normalCoinCollected = 0;
      var specTypes = ['invincible', 'heal', 'double', 'slow'];
      var stype = specTypes[randInt(0, 4)];
      this.specialCoins.push({
        x: W + 80, y: groundY - randRange(80, 160),
        r: 14, type: stype, collected: false, sparkle: 0
      });
    }
  }

  // 碰撞检测 (含无敌帧 + 能力无敌)
  var isInvincible = this.invincibleTimer > 0 || this.powerInvincible > 0;
  for (var i = this.obstacles.length - 1; i >= 0; i--) {
    var o = this.obstacles[i];
    o.x -= spd;
    var px = W / 2 - 15, pw = 30;
    var py = this.isSliding ? this.playerY + 10 : this.playerY - 50;
    var ph = this.isSliding ? 20 : 50;
    if (!o.passed && !isInvincible && px < o.x + o.w && px + pw > o.x && py < o.y + o.h && py + ph > o.y) {
      stats.hp = clamp(stats.hp - 15, 0, 100);
      if (stats.hp <= 0) { this.endGame(); return; }
      this.screenShake = 28;
      this.hitFlash = 1.0;
      this.invincibleTimer = 55;
      this.emitParticles(W / 2, this.playerY - 20, 'rgba(239,68,68,', 18);
      for (var pi = 0; pi < 8; pi++) {
        this.particles.push({
          x: W / 2, y: this.playerY - 30,
          vx: randRange(-8, 8), vy: randRange(-10, -2),
          life: 1, color: 'rgba(255,180,0,', size: randRange(4, 8)
        });
      }
      o.passed = true;
    }
    if (o.x < -100) this.obstacles.splice(i, 1);
  }

  // 普通金币收集
  for (var j = this.coins.length - 1; j >= 0; j--) {
    var cn = this.coins[j];
    cn.x -= spd;
    cn.sparkle += 0.1;
    if (!cn.collected && Math.hypot(W / 2 - cn.x, this.playerY - 30 - cn.y) < 35) {
      cn.collected = true;
      var pts = this.powerDoubleActive ? 10 : 5;
      stats.score += pts;
      stats.cal += 0.1;
      this.emitParticles(cn.x, cn.y, 'rgba(255,215,0,', 6);
    }
    if (cn.x < -30 || cn.collected) this.coins.splice(j, 1);
  }

  // 特殊钱币收集
  for (var sj = this.specialCoins.length - 1; sj >= 0; sj--) {
    var sc = this.specialCoins[sj];
    sc.x -= spd;
    sc.sparkle += 0.1;
    if (!sc.collected && Math.hypot(W / 2 - sc.x, this.playerY - 30 - sc.y) < 40) {
      sc.collected = true;
      this._applyPowerUp(sc.type);
      this.emitParticles(sc.x, sc.y, 'rgba(255,255,255,', 12);
    }
    if (sc.x < -40 || sc.collected) this.specialCoins.splice(sj, 1);
  }

  // ---- 影子 AI：完美躲避障碍 + 吃金币 ----
  var shadowX = W / 2 + this.shadowOffset;
  var reactDist = 90;
  for (var si2 = 0; si2 < this.obstacles.length; si2++) {
    var so = this.obstacles[si2];
    var dShadow = so.x - shadowX;
    if (dShadow > 0 && dShadow < reactDist && !so.passed) {
      var needSlide = so.type === 'ceiling_spike' || (so.type === 'barrier' && so.h > 45);
      if (needSlide) {
        if (!this.shadowJumping && !this.shadowSliding) {
          this.shadowSliding = true;
          this.shadowSlideTimer = 15;
        }
      } else {
        if (!this.shadowJumping) {
          this.shadowJumping = true;
          this.shadowVY = -18 * this.speed;
          this.shadowJumpFrameIdx = 0;
        }
      }
    }
  }
  // 影子不拾取金币和特殊币（取消获取能力）

  // 影子动画计时
  this.shadowFrameTimer++;
  if (this.shadowFrameTimer >= 8) {
    this.shadowFrameTimer = 0;
    this.shadowFrameIdx = (this.shadowFrameIdx + 1) % 6;
  }
  if (this.shadowJumping) {
    if (this.shadowFrameTimer % 4 === 0) {
      this.shadowJumpFrameIdx = (this.shadowJumpFrameIdx + 1) % 5;
    }
  }

  // 能力计时更新
  if (this.powerInvincible > 0) this.powerInvincible--;
  if (this.powerDoubleTimer > 0) {
    this.powerDoubleTimer--;
    if (this.powerDoubleTimer <= 0) this.powerDoubleActive = false;
  }
  if (this.powerSlowTimer > 0) {
    this.powerSlowTimer--;
    if (this.powerSlowTimer <= 0) {
      this.powerSlowActive = false;
      this.targetSpeed = this.powerSlowSavedSpeed;
    }
  }

  for (var k = this.particles.length - 1; k >= 0; k--) {
    var p = this.particles[k];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life -= 0.03;
    if (p.life <= 0) this.particles.splice(k, 1);
  }

  this.screenShake = lerp(this.screenShake, 0, 0.06);
  this.hitFlash = lerp(this.hitFlash, 0, 0.08);
  if (Math.abs(this.screenShake) < 0.3) this.screenShake = 0;
  if (this.hitFlash < 0.01) this.hitFlash = 0;

  for (var g = 0; g < this.groundTiles.length; g++) {
    this.groundTiles[g].x -= spd;
    if (this.groundTiles[g].x < -70) this.groundTiles[g].x += 1500;
  }
  for (var c = 0; c < this.bgClouds.length; c++) {
    this.bgClouds[c].x -= this.bgClouds[c].speed;
    if (this.bgClouds[c].x < -180) { this.bgClouds[c].x = W + 100; this.bgClouds[c].y = randRange(20, 180); }
  }
  for (var b = 0; b < this.bgBuildings.length; b++) {
    this.bgBuildings[b].x -= this.scrollSpeed * 0.1;
    if (this.bgBuildings[b].x < -120) { this.bgBuildings[b].x = W + 50; this.bgBuildings[b].h = 80 + Math.random() * 120; }
  }

  $('dist0').textContent = Math.floor(this.distance);
  $('combo0').textContent = stats.combo;
  $('timer0').textContent = '∞';
  $('cal0').textContent = fmt(stats.cal, 1);
};

SubwaySurfGame.prototype.render = function () {
  var ctx = this.ctx;
  var W = this.canvas.width, H = this.canvas.height;
  var shakeX = (Math.random() - 0.5) * this.screenShake;
  var shakeY = (Math.random() - 0.5) * this.screenShake;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // 天空
  var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, '#0a0a2e');
  skyGrad.addColorStop(0.5, '#141445');
  skyGrad.addColorStop(1, '#1a1a4e');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-20, -20, W + 40, H + 40);

  // 星星
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  for (var s = 0; s < 30; s++) {
    var sx = (s * 137 + this.frameCount * 0.1) % W;
    var sy = (s * 73) % (H * 0.4);
    ctx.beginPath();
    ctx.arc(sx, sy, Math.sin(this.frameCount * 0.02 + s) * 0.5 + 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // 云朵
  var self = this;
  this.bgClouds.forEach(function (cl) {
    var cg = ctx.createRadialGradient(cl.x, cl.y, 0, cl.x, cl.y, cl.w / 2);
    cg.addColorStop(0, 'rgba(255,255,255,0.12)');
    cg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.ellipse(cl.x, cl.y, cl.w / 2, cl.w / 4, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // 建筑
  this.bgBuildings.forEach(function (b) {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, H / 2 - b.h + 40, b.w, b.h);
    for (var wy = H / 2 - b.h + 50; wy < H / 2 + 20; wy += 18) {
      for (var wx = b.x + 8; wx < b.x + b.w - 8; wx += 14) {
        var on = Math.sin((wx + wy) * 0.2 + self.frameCount * 0.01) > 0.2;
        ctx.fillStyle = on ? 'rgba(255,220,100,0.4)' : 'rgba(255,255,255,0.06)';
        ctx.fillRect(wx, wy, 6, 10);
      }
    }
  });

  var groundY = H / 2 + 30;

  // 地面
  var gGrad = ctx.createLinearGradient(0, groundY, 0, H);
  gGrad.addColorStop(0, '#151530');
  gGrad.addColorStop(1, '#0a0a1a');
  ctx.fillStyle = gGrad;
  ctx.fillRect(-20, groundY, W + 40, H - groundY + 20);

  // 地面线条
  ctx.fillStyle = 'rgba(0,212,255,0.15)';
  ctx.fillRect(-20, groundY, W + 40, 3);

  this.groundTiles.forEach(function (gt) {
    ctx.fillStyle = 'rgba(0,212,255,0.08)';
    ctx.fillRect(gt.x, groundY + 8, 40, 2);
  });

  // 铁轨
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 20);
  ctx.lineTo(W, groundY + 20);
  ctx.stroke();

  // 金币
  this.coins.forEach(function (cn) {
    ctx.shadowColor = 'rgba(255,215,0,0.8)';
    ctx.shadowBlur = 14;
    var cGrad = ctx.createRadialGradient(cn.x - 2, cn.y - 2, 0, cn.x, cn.y, cn.r);
    cGrad.addColorStop(0, '#fff7a0');
    cGrad.addColorStop(0.5, '#ffd700');
    cGrad.addColorStop(1, '#b8860b');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.arc(cn.x, cn.y, cn.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(cn.x - 2, cn.y - 2, cn.r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(180,140,0,0.7)';
    ctx.font = 'bold ' + (cn.r * 1.2) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', cn.x, cn.y);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowBlur = 0;
  });

  // 特殊钱币 (dollar 图片，统一 36px 等比例缩放)
  this.specialCoins.forEach(function (sc) {
    var dimg = self.dollarImgs[sc.type];
    if (dimg && dimg.complete && dimg.naturalWidth > 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(255,255,255,0.6)';
      ctx.shadowBlur = 12 + Math.sin(sc.sparkle * 3) * 4;
      var size = 36;
      ctx.drawImage(dimg, sc.x - size / 2, sc.y - size / 2, size, size);
      ctx.restore();
    }
  });

  // 障碍物
  this.obstacles.forEach(function (o) {
    ctx.shadowColor = 'rgba(239,68,68,0.5)';
    ctx.shadowBlur = 15;

    if (o.type === 'spike') {
      // 地面尖刺 (Geometry Dash 风格)
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = 'rgba(255,80,80,0.8)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(o.x - o.w / 2, o.y + o.h);
      ctx.lineTo(o.x, o.y);
      ctx.lineTo(o.x + o.w / 2, o.y + o.h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ff8888';
      ctx.beginPath();
      ctx.moveTo(o.x - o.w / 4, o.y + o.h - 2);
      ctx.lineTo(o.x, o.y + 4);
      ctx.lineTo(o.x + o.w / 4, o.y + o.h - 2);
      ctx.closePath();
      ctx.fill();
    } else if (o.type === 'ceiling_spike') {
      // 天花板尖刺
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = 'rgba(255,80,80,0.8)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(o.x - o.w / 2, o.y);
      ctx.lineTo(o.x, o.y + o.h);
      ctx.lineTo(o.x + o.w / 2, o.y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ff8888';
      ctx.beginPath();
      ctx.moveTo(o.x - o.w / 4, o.y + 3);
      ctx.lineTo(o.x, o.y + o.h - 5);
      ctx.lineTo(o.x + o.w / 4, o.y + 3);
      ctx.closePath();
      ctx.fill();
    } else if (o.type === 'train') {
      var tg = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
      tg.addColorStop(0, '#e53e3e');
      tg.addColorStop(1, '#991b1b');
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.roundRect(o.x - o.w / 2, o.y, o.w, o.h, 5);
      ctx.fill();
      ctx.fillStyle = '#c53030';
      ctx.fillRect(o.x - o.w / 2 + 5, o.y - 8, o.w - 10, 10);
      ctx.fillStyle = 'rgba(100,180,255,0.35)';
      ctx.fillRect(o.x - o.w / 2 + 8, o.y + 6, 18, 14);
      ctx.fillRect(o.x + o.w / 2 - 26, o.y + 6, 18, 14);
      var blink = Math.sin(Date.now() * 0.01) > 0;
      ctx.fillStyle = blink ? '#ffcc00' : '#665500';
      ctx.beginPath();
      ctx.arc(o.x - o.w / 2 + 6, o.y + o.h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(o.x + o.w / 2 - 6, o.y + o.h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (o.type === 'barrier') {
      var bg = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
      bg.addColorStop(0, '#fbbf24');
      bg.addColorStop(1, '#d97706');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(o.x - o.w / 2, o.y, o.w, o.h, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      for (var bi = 0; bi < 3; bi++) {
        ctx.fillRect(o.x - o.w / 2 + 2, o.y + bi * 18 + 6, o.w - 4, 10);
      }
      var warn = Math.sin(Date.now() * 0.015) > 0;
      ctx.shadowColor = warn ? 'rgba(255,100,0,0.8)' : 'transparent';
      ctx.shadowBlur = warn ? 12 : 0;
      ctx.fillStyle = warn ? '#ff6600' : '#663300';
      ctx.beginPath();
      ctx.arc(o.x, o.y - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      var bxG = ctx.createLinearGradient(o.x - o.w / 2, o.y, o.x + o.w / 2, o.y + o.h);
      bxG.addColorStop(0, '#ef4444');
      bxG.addColorStop(1, '#b91c1c');
      ctx.fillStyle = bxG;
      ctx.beginPath();
      ctx.roundRect(o.x - o.w / 2, o.y, o.w, o.h, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(o.x - o.w / 2 + 3, o.y + 3, o.w - 6, 5);
    }
    ctx.shadowBlur = 0;
  });

  // 玩家精灵动画
  var px = W / 2;
  var py = this.playerY;
  ctx.save();

  if (this.isJumping) {
    // 跳跃：快速切换 8 帧 GD 精灵
    if (!this._wasJumping) {
      this.jumpFrameIdx = 0;  // 起跳时重置
    }
    this.runFrameTimer++;
    if (this.runFrameTimer >= 3) {  // 每 3 帧切一张 (快速)
      this.runFrameTimer = 0;
      this.jumpFrameIdx = (this.jumpFrameIdx + 1) % 5;
    }
    var jframe = this.jumpFrames[this.jumpFrameIdx];
    if (jframe && jframe.complete) {
      var jfw = 56, jfh = 92;
      var jOff = Math.sin(Math.abs(this.playerVY) * 0.1) * 3;
      ctx.drawImage(jframe, px - jfw / 2, py - 70 + jOff, jfw, jfh);
    }
  } else if (this.isSliding) {
    // 滑铲：用跑步帧
    this.runFrameTimer++;
    if (this.runFrameTimer >= 8) {
      this.runFrameTimer = 0;
      this.runFrameIdx = (this.runFrameIdx + 1) % 6;
    }
    var sframe = this.runFrames[this.runFrameIdx];
    if (sframe && sframe.complete) {
      ctx.drawImage(sframe, px - 28, py - 15, 56, 50);
    }
  } else {
    // 跑步：正常循环 6 帧
    this.runFrameTimer++;
    if (this.runFrameTimer >= 8) {
      this.runFrameTimer = 0;
      this.runFrameIdx = (this.runFrameIdx + 1) % 6;
    }
    var rframe = this.runFrames[this.runFrameIdx];
    if (rframe && rframe.complete) {
      ctx.drawImage(rframe, px - 28, py - 68, 56, 92);
    }
  }
  this._wasJumping = this.isJumping;
  ctx.restore();

  // ---- 影子角色渲染 (蓝色幻影，右侧固定距离) ----
  var sx = W / 2 + this.shadowOffset;
  var sy = this.shadowY;
  ctx.save();
  // 张雪峰 ID 标签
  ctx.fillStyle = 'rgba(100, 180, 255, 0.85)';
  ctx.font = 'bold 13px "Microsoft YaHei","PingFang SC",Arial';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.fillText('张雪峰', sx, sy - 78);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'start';
  if (this.shadowJumping) {
    if (!this._wasShadowJumping) this.shadowJumpFrameIdx = 0;
    var sjf = this.jumpFrames[this.shadowJumpFrameIdx % 5];
    if (sjf && sjf.complete && sjf.naturalWidth > 0) {
      var sjOff = Math.sin(Math.abs(this.shadowVY) * 0.1) * 3;
      ctx.drawImage(sjf, sx - 28, sy - 70 + sjOff, 56, 92);
      // 蓝色滤镜
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(30, 100, 255, 0.4)';
      ctx.fillRect(sx - 28, sy - 70 + sjOff, 56, 92);
    }
  } else if (this.shadowSliding) {
    var ssf = this.runFrames[this.shadowFrameIdx % 6];
    if (ssf && ssf.complete && ssf.naturalWidth > 0) {
      ctx.drawImage(ssf, sx - 28, sy - 15, 56, 50);
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(30, 100, 255, 0.4)';
      ctx.fillRect(sx - 28, sy - 15, 56, 50);
    }
  } else {
    var srf = this.runFrames[this.shadowFrameIdx % 6];
    if (srf && srf.complete && srf.naturalWidth > 0) {
      ctx.drawImage(srf, sx - 28, sy - 68, 56, 92);
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(30, 100, 255, 0.4)';
      ctx.fillRect(sx - 28, sy - 68, 56, 92);
    }
  }
  this._wasShadowJumping = this.shadowJumping;
  ctx.restore();

  // 粒子
  this.particles.forEach(function (pt) {
    ctx.fillStyle = pt.color + (pt.life * 0.7) + ')';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();

  // 爱心血量 (7 颗心，每颗 ≈14.3 HP)
  var hearts = Math.ceil(STATE.gameStats.hp / 15);
  for (var hi = 0; hi < 7; hi++) {
    var hx = 20 + hi * 30;
    var hy = 20;
    // 爱心路径
    ctx.save();
    ctx.translate(hx, hy);
    ctx.scale(0.7, 0.7);
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(-8, 0, -16, -8, -16, -16);
    ctx.bezierCurveTo(-16, -24, -8, -28, 0, -22);
    ctx.bezierCurveTo(8, -28, 16, -24, 16, -16);
    ctx.bezierCurveTo(16, -8, 8, 0, 0, 6);
    ctx.closePath();
    if (hi < hearts) {
      ctx.fillStyle = '#ff3366';
      ctx.shadowColor = 'rgba(255,51,102,0.6)';
      ctx.shadowBlur = 6;
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.shadowBlur = 0;
    }
    ctx.fill();
    ctx.restore();
  }

  // 红色闪屏叠加 (碰撞反馈)
  if (this.hitFlash > 0.01) {
    ctx.fillStyle = 'rgba(255,30,0,' + (this.hitFlash * 0.35) + ')';
    ctx.fillRect(-20, -20, W + 40, H + 40);
  }

  // 速度UI
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(12, H - 48, 125, 32, 6);
  ctx.fill();
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('速度 x' + this.speedLevel + ' | ' + fmt(this.scrollSpeed, 1) + ' km/h', 18, H - 26);
  ctx.textAlign = 'start';

  // 能力状态栏
  var activeBuffs = [];
  if (this.powerInvincible > 0) activeBuffs.push('🛡' + (this.powerInvincible / 60).toFixed(1) + 's');
  if (this.powerDoubleActive) activeBuffs.push('x2 ' + (this.powerDoubleTimer / 60).toFixed(0) + 's');
  if (this.powerSlowActive) activeBuffs.push('🐢' + (this.powerSlowTimer / 60).toFixed(0) + 's');
  if (activeBuffs.length > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    var buffText = activeBuffs.join('  ');
    var buffW = ctx.measureText(buffText).width + 20;
    ctx.beginPath();
    ctx.roundRect(W / 2 - buffW / 2, 52, buffW, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(buffText, W / 2, 72);
    ctx.textAlign = 'start';
  }

  // 冲刺冷却指示器
  if (this.sprintCooldown > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(W - 100, H - 48, 85, 32, 6);
    ctx.fill();
    ctx.fillStyle = '#888';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('[X] ' + (this.sprintCooldown / 60).toFixed(1) + 's', W - 20, H - 26);
    ctx.textAlign = 'start';
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(W - 100, H - 48, 85, 32, 6);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('[X] 就绪', W - 20, H - 26);
    ctx.textAlign = 'start';
  }
};

SubwaySurfGame.prototype.endGame = function () {
  this._running = false;
  if (this._poseJumpHandler && window.mpManager) window.mpManager.unsubscribe(this._poseJumpHandler);
  if (this._bgm) { this._bgm.pause(); this._bgm = null; }
  if (this._animFrameId) { cancelAnimationFrame(this._animFrameId); this._animFrameId = null; }
  if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
  if (this._keyUpHandler) window.removeEventListener('keyup', this._keyUpHandler);
  GameEngine.prototype.endGame.call(this);
};
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
  this.scrollSpeed = 6 * this.speed;
  this.targetSpeed = 6 * this.speed;
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
  this.hpMax = 7;
  this._paused = false;
  this.runFrames = [];

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
    rimg.onerror = function () { console.warn('[Subway] 跑步精灵加载失败:', this.src); };
    rimg.src = 'games/subway/pictures/' + fi + '.png';
    this.runFrames.push(rimg);
  }

  // 预加载 5 帧跳跃精灵 (Geometry Dash, 280×460)
  this.jumpFrames = [];
  var jumpFrameNums = [1, 4, 5, 6, 8];
  for (var fj = 0; fj < jumpFrameNums.length; fj++) {
    var jimg = new Image();
    jimg.onerror = function () { console.warn('[Subway] 跳跃精灵加载失败:', this.src); };
    jimg.src = 'games/subway/pictures/Geometry Dash/jump_frame_' + jumpFrameNums[fj] + '-removebg-preview.png';
    this.jumpFrames.push(jimg);
  }

  // 预加载 4 种特殊钱币图片
  this.dollarImgs = {};
  var dollarMap = ['invincible', 'heal', 'double', 'slow'];
  for (var di = 0; di < 4; di++) {
    var dimg = new Image();
    dimg.onerror = function () { console.warn('[Subway] 特殊币图片加载失败:', this.src); };
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

  // 开场动画序列
  this._startIntroSequence();
};

SubwaySurfGame.prototype._startIntroSequence = function () {
  var self = this;
  var overlay = document.getElementById('intro-overlay');
  var frameImg = document.getElementById('intro-frame');
  var bgm = new Audio('games/subway/sounds/The_Start_BGM.mp3');
  bgm.volume = 0.5;
  self._bgm = bgm;

  // 预加载开场帧 (3 张)
  var introFrames = [];
  for (var i = 1; i <= 3; i++) {
    var img = new Image();
    img.src = 'games/subway/pictures/start/' + i + '.png';
    introFrames.push(img);
  }

  var idx = 0;
  var showNext = function () {
    if (idx >= 3) {
      // 所有帧展示完毕，播放 BGM 后开始游戏
      if (overlay) overlay.style.display = 'none';
      bgm.play().catch(function () {});
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

  // 等第一帧加载完再开始
  var checkStart = function () {
    if (introFrames[0] && introFrames[0].complete) {
      if (overlay) overlay.style.display = 'flex';
      if (frameImg) frameImg.src = introFrames[0].src;
      idx = 1;
      setTimeout(showNext, 1000);
    } else {
      setTimeout(checkStart, 100);
    }
  };
  checkStart();
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

  // 速度随帧数增长，600 帧 (≈10s) 后封顶
  var cappedFrames = Math.min(this.frameCount, 600);
  this.speedLevel = 1 + Math.floor(cappedFrames / 100);
  var baseSpeed = (5 + this.speedLevel * 1.5) * this.speed;
  // Shift 松开后速度缓慢衰减回基础速度
  if (!this._shiftHeld) {
    this.targetSpeed = lerp(this.targetSpeed, baseSpeed, 0.02);
  }
  this.targetSpeed = Math.max(baseSpeed, this.targetSpeed);
  this.scrollSpeed = lerp(this.scrollSpeed, this.targetSpeed, 0.06);
  // 减速能力：实际滚动速度减半
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
  if (this._bgm) { this._bgm.pause(); this._bgm = null; }
  if (this._animFrameId) { cancelAnimationFrame(this._animFrameId); this._animFrameId = null; }
  if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
  if (this._keyUpHandler) window.removeEventListener('keyup', this._keyUpHandler);
  GameEngine.prototype.endGame.call(this);
};
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
  this.coinTimer = 0;
  this.bgClouds = [];
  this.bgBuildings = [];
  this.groundTiles = [];
  this.particles = [];
  this.screenShake = 0;

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
        self.playerVY = -13 * self.speed;
        self.emitParticles(W / 2, self.playerY - 20, 'rgba(0,212,255,', 8);
      }
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      if (!self.isJumping && !self.isSliding) {
        self.isSliding = true;
        self.slideTimer = 20;
      }
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      self.targetSpeed = Math.min(16 * self.speed, self.targetSpeed + 1.0 * self.speed);
    }
  };
  window.addEventListener('keydown', this._keyHandler);

  this.startLoop();
  this.beginCountdown();
};

SubwaySurfGame.prototype.emitParticles = function(x, y, color, count) {
  for (var i = 0; i < count; i++) {
    this.particles.push({ x: x + randRange(-15, 15), y: y + randRange(-15, 15), vx: randRange(-4, 4), vy: randRange(-5, 0), life: 1, color: color, size: randRange(3, 6) });
  }
};

SubwaySurfGame.prototype.startLoop = function () {
  var self = this;
  window._gameLoop0 = true;
  (function loop() {
    if (!window._gameLoop0) return;
    self.update();
    self.render();
    requestAnimationFrame(loop);
  })();
};

SubwaySurfGame.prototype.update = function () {
  this.frameCount++;
  this.tick();
  var stats = STATE.gameStats;
  var W = this.canvas.width, H = this.canvas.height;

  this.speedLevel = 1 + Math.floor((60 - stats.time) / 10);
  this.targetSpeed = Math.max((5 + this.speedLevel * 1.5) * this.speed, this.targetSpeed);
  this.scrollSpeed = lerp(this.scrollSpeed, this.targetSpeed, 0.06);
  this.distance += this.scrollSpeed * 0.12;

  var groundY = H / 2 + 30;
  if (!this.playerY) this.playerY = groundY;

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

  var spd = this.scrollSpeed * 0.8;

  this.obstacleTimer++;
  var spawnRate = Math.max(40, 90 - this.speedLevel * 5);
  if (this.obstacleTimer > spawnRate && Math.random() < 0.3) {
    var types = this.speedLevel < 3 ? ['box', 'barrier'] : ['box', 'barrier', 'train'];
    var type = types[randInt(0, types.length)];
    this.obstacles.push({
      x: W + 100,
      y: groundY - (type === 'train' ? 50 : type === 'barrier' ? 35 : 28),
      w: type === 'train' ? 85 : type === 'barrier' ? 24 : 38,
      h: type === 'train' ? 55 : type === 'barrier' ? 60 : 32,
      type: type,
      passed: false
    });
    this.obstacleTimer = 0;
  }

  this.coinTimer++;
  if (this.coinTimer > 50 && Math.random() < 0.3) {
    this.coins.push({ x: W + 60, y: groundY - randRange(60, 140), r: 9, collected: false, sparkle: 0 });
    this.coinTimer = 0;
  }

  for (var i = this.obstacles.length - 1; i >= 0; i--) {
    var o = this.obstacles[i];
    o.x -= spd;
    var px = W / 2 - 15, pw = 30;
    var py = this.isSliding ? this.playerY + 12 : this.playerY - 45;
    var ph = this.isSliding ? 20 : 45;
    if (!o.passed && px < o.x + o.w && px + pw > o.x && py < o.y + o.h && py + ph > o.y) {
      stats.hp = clamp(stats.hp - 20, 0, 100);
      this.screenShake = 12;
      this.emitParticles(W / 2, this.playerY - 20, 'rgba(239,68,68,', 10);
      o.passed = true;
    }
    if (o.x < -100) this.obstacles.splice(i, 1);
  }

  for (var j = this.coins.length - 1; j >= 0; j--) {
    var cn = this.coins[j];
    cn.x -= spd;
    cn.sparkle += 0.1;
    if (!cn.collected && Math.hypot(W / 2 - cn.x, this.playerY - 30 - cn.y) < 35) {
      cn.collected = true;
      stats.score += 5;
      stats.cal += 0.1;
      this.emitParticles(cn.x, cn.y, 'rgba(255,215,0,', 6);
    }
    if (cn.x < -30 || cn.collected) this.coins.splice(j, 1);
  }

  for (var k = this.particles.length - 1; k >= 0; k--) {
    var p = this.particles[k];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life -= 0.03;
    if (p.life <= 0) this.particles.splice(k, 1);
  }

  this.screenShake = lerp(this.screenShake, 0, 0.15);
  if (Math.abs(this.screenShake) < 0.5) this.screenShake = 0;

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
  $('timer0').textContent = stats.time;
  $('cal0').textContent = fmt(stats.cal, 1);
  UIManager.updateHP(stats.hp, 'hp0', 'hpText0');
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

  // 障碍物
  this.obstacles.forEach(function (o) {
    ctx.shadowColor = 'rgba(239,68,68,0.5)';
    ctx.shadowBlur = 15;

    if (o.type === 'train') {
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

  // 玩家
  var px = W / 2;
  var py = this.playerY;
  ctx.save();
  ctx.shadowColor = 'rgba(0,212,255,0.6)';
  ctx.shadowBlur = 25;

  if (this.isSliding) {
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.roundRect(px - 28, py + 2, 56, 20, 10);
    ctx.fill();
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.arc(px - 15, py + 5, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px - 18, py + 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#080818';
    ctx.beginPath();
    ctx.arc(px - 17, py + 4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(91,33,182,0.5)';
    ctx.fillRect(px + 8, py + 8, 18, 5);
  } else if (this.isJumping) {
    var jOff = Math.sin(Math.abs(this.playerVY) * 0.1) * 3;
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.roundRect(px - 16, py - 28 + jOff, 32, 32, 8);
    ctx.fill();
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.arc(px, py - 40 + jOff, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px - 5, py - 42 + jOff, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 5, py - 42 + jOff, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#080818';
    ctx.beginPath();
    ctx.arc(px - 4, py - 41 + jOff, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 6, py - 41 + jOff, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(px, py - 48 + jOff, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5b21b6';
    ctx.fillRect(px - 10, py + 2 + jOff, 7, 12);
    ctx.fillRect(px + 3, py + 2 + jOff, 7, 12);
  } else {
    var lp = Math.sin(this.frameCount * 0.25) * 10;
    var ap = Math.sin(this.frameCount * 0.25) * 8;
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.roundRect(px - 15, py - 30, 30, 38, 8);
    ctx.fill();
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.arc(px, py - 42, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px - 5, py - 44, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 5, py - 44, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#080818';
    ctx.beginPath();
    ctx.arc(px - 4, py - 43, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 6, py - 43, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(px, py - 50, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(px - 24, py - 20 + ap, 7, 18);
    ctx.fillRect(px + 17, py - 20 - ap, 7, 18);
    ctx.fillStyle = '#5b21b6';
    ctx.fillRect(px - 10, py + 5, 7, 12 + lp);
    ctx.fillRect(px + 3, py + 5, 7, 12 - lp);
  }
  ctx.restore();

  // 粒子
  this.particles.forEach(function (pt) {
    ctx.fillStyle = pt.color + (pt.life * 0.7) + ')';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();

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
};

SubwaySurfGame.prototype.endGame = function () {
  window._gameLoop0 = false;
  if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
  GameEngine.prototype.endGame.call(this);
};
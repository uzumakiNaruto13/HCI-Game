// ====================================================================
// games/galgame/renpy-launcher.js — LearnToCodeRPG Web Launcher | 网页启动器
// ====================================================================

var GalgameGame = function () {
  GameEngine.call(this, 'screen-game-galgame', 2);
};

GalgameGame.prototype = Object.create(GameEngine.prototype);
GalgameGame.prototype.constructor = GalgameGame;

GalgameGame.prototype.setup = function () {
  GameEngine.prototype.setup.call(this);
  this.phase = 'launcher';
  this.status = 'Checking game... | 检查游戏中...';
  this.error = null;
  this.serverPort = 8765;
  this.serverProc = null;
  this.introPhase = 'typing';
  this.introIndex = 0;
  this.introText = 'Learn To Code RPG | 编程学习视觉小说';
  this.introTypingText = '';
  this.introFadeAlpha = 0;
  this.introFadeDir = 0;
  this.started = false;

  this.startIntro();

  // 体感手势翻页：左/下=下一页，右/上=上一页
  var self = this;
  this._galGestureState = { prevLX: null, prevLY: null, prevRX: null, prevRY: null, accumLX: 0, accumLY: 0, accumRX: 0, accumRY: 0, cooldown: 0 };
  this._galGestureHandler = function (results) {
    var s = self._galGestureState;
    if (s.cooldown > 0) { s.cooldown--; return; }
    var lm = results.poseLandmarks;
    var lw = lm[15], rw = lm[16];
    var triggered = 0;

    [['L', lw, 'prevLX', 'accumLX'], ['R', rw, 'prevRX', 'accumRX']].forEach(function (cfg) {
      var wrist = cfg[1];
      if (!wrist || wrist.visibility < 0.5) return;
      var pxKey = cfg[2], pyKey = cfg[3].replace('X', 'Y'), axKey = cfg[3], ayKey = cfg[3].replace('X', 'Y');
      if (s[pxKey] !== null) {
        var dx = wrist.x - s[pxKey], dy = wrist.y - (s[pyKey] || wrist.y);
        if (Math.abs(dx) > 0.003) s[axKey] += dx;
        if (Math.abs(dy) > 0.003) s[ayKey] = (s[ayKey] || 0) + dy;
      }
      s[pxKey] = wrist.x; s[pyKey] = wrist.y;
      // 阻尼衰减
      s[axKey] *= 0.85; s[ayKey] = (s[ayKey] || 0) * 0.85;

      // 左(< -0.06) 或 下(> 0.06) → 下一页
      if (s[axKey] < -0.06 || (s[ayKey] || 0) > 0.06) triggered = 1;
      // 右(> 0.06) 或 上(< -0.06) → 上一页
      if (s[axKey] > 0.06 || (s[ayKey] || 0) < -0.06) triggered = -1;
    });

    if (triggered === 1) {
      // 下一页：模拟空格
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
      s.cooldown = 20;
      // 清零累积
      s.accumLX = s.accumRX = s.accumLY = s.accumRY = 0;
    } else if (triggered === -1) {
      // 上一页：模拟滚轮上滚
      var iframe = document.querySelector('#renpy-container iframe') || document.querySelector('#renpy-container');
      if (iframe) {
        iframe.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true }));
      }
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', key: 'ArrowUp', bubbles: true }));
      s.cooldown = 20;
      s.accumLX = s.accumRX = s.accumLY = s.accumRY = 0;
    }
  };
  if (window.mpManager) window.mpManager.subscribe(this._galGestureHandler);
};

GalgameGame.prototype.startIntro = function () {
  this.phase = 'intro';
  this.introPhase = 'typing';
  this.introIndex = 0;
  this.introTypingText = '';
  this.introFadeAlpha = 0;
  this.introDone = false;

  var self = this;
  window._gameLoop2 = true;
  (function loop() {
    if (!window._gameLoop2) return;
    self.update();
    self.render();
    requestAnimationFrame(loop);
  })();
};

GalgameGame.prototype.update = function () {
  this.frameCount++;

  if (this.phase === 'intro') {
    if (this.introPhase === 'typing') {
      if (this.frameCount % 2 === 0) {
        if (this.introIndex < this.introText.length) {
          this.introIndex++;
          this.introTypingText = this.introText.substring(0, this.introIndex);
        } else {
          this.introPhase = 'wait';
        }
      }
    } else if (this.introPhase === 'wait') {
      if (this.frameCount % 60 === 0) {
        this.phase = 'launcher';
        this.checkAndLaunch();
      }
    }
  } else if (this.phase === 'loading') {
    this.phase = 'running';
    this.launchGame();
    window._gameLoop2 = false;
  }
};

GalgameGame.prototype.render = function (ctx, W, H) {
  if (!ctx) {
    var canvas = this.canvas || document.getElementById('gameCanvas2');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    W = canvas.width;
    H = canvas.height;
  }
  if (this.phase === 'intro') {
    this.renderIntro(ctx, W, H);
  } else if (this.phase === 'launcher' || this.phase === 'loading') {
    this.renderLauncher(ctx, W, H);
  }
};

GalgameGame.prototype.renderIntro = function (ctx, W, H) {
  var grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0a0520');
  grad.addColorStop(0.5, '#1a0a3e');
  grad.addColorStop(1, '#0f3460');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  for (var i = 0; i < 50; i++) {
    var sx = (i * 137.5) % W;
    var sy = (i * 97.3 + this.frameCount * 0.3) % H;
    var sb = 0.3 + Math.sin(this.frameCount * 0.05 + i) * 0.3;
    ctx.fillStyle = 'rgba(255,255,255,' + sb + ')';
    ctx.beginPath();
    ctx.arc(sx, sy, i % 3 === 0 ? 2 : 1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.shadowColor = '#4a90e2';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#e9d5ff';
  ctx.font = 'bold 32px "Microsoft YaHei", Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Learn To Code RPG', W / 2, H * 0.32);
  ctx.restore();

  ctx.fillStyle = 'rgba(200,180,255,0.7)';
  ctx.font = '16px "Microsoft YaHei", Arial';
  ctx.textAlign = 'center';
  ctx.fillText('编程学习视觉小说', W / 2, H * 0.32 + 36);

  ctx.fillStyle = 'rgba(200,180,255,0.4)';
  ctx.font = '12px "Microsoft YaHei", Arial';
  ctx.fillText('Programming Learning Visual Novel', W / 2, H * 0.32 + 56);

  var lineW = 300;
  ctx.strokeStyle = 'rgba(74,144,226,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - lineW / 2, H * 0.50);
  ctx.lineTo(W / 2 + lineW / 2, H * 0.50);
  ctx.stroke();

  var boxW = W * 0.7;
  var boxH = 80;
  var boxX = (W - boxW) / 2;
  var boxY = H * 0.56;
  ctx.fillStyle = 'rgba(15,10,30,0.85)';
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(74,144,226,0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 16);
  ctx.stroke();

  ctx.fillStyle = '#c4b5fd';
  ctx.font = '18px "Microsoft YaHei", Arial';
  ctx.textAlign = 'center';
  ctx.fillText(this.introTypingText, W / 2, boxY + boxH / 2 + 6);

  if (this.introPhase === 'typing' && Math.sin(this.frameCount * 0.15) > 0) {
    var lastLine = this.introTypingText;
    var curX = W / 2 + ctx.measureText(lastLine).width / 2 + 5;
    ctx.fillText('|', curX, boxY + boxH / 2 + 6);
  }

  ctx.textAlign = 'start';
};

GalgameGame.prototype.renderLauncher = function (ctx, W, H) {
  var grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0a0520');
  grad.addColorStop(1, '#1a0a3e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.shadowColor = '#4a90e2';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#e9d5ff';
  ctx.font = 'bold 28px "Microsoft YaHei", Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Learn To Code RPG', W / 2, H * 0.35);
  ctx.restore();

  ctx.fillStyle = 'rgba(200,180,255,0.5)';
  ctx.font = '13px "Microsoft YaHei", Arial';
  ctx.textAlign = 'center';
  ctx.fillText(this.status, W / 2, H * 0.48);

  if (this.error) {
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '14px "Microsoft YaHei", Arial';
    ctx.fillText(this.error, W / 2, H * 0.56);
  }

  if (this.phase === 'loading') {
    var barW = 300;
    var barH = 20;
    var barX = (W - barW) / 2;
    var barY = H * 0.55;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 10);
    ctx.fill();
    ctx.fillStyle = '#4a90e2';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * 0.6, barH, 10);
    ctx.fill();
  }

  ctx.textAlign = 'start';
};

GalgameGame.prototype.checkAndLaunch = function () {
  this.phase = 'loading';
  this.status = 'Checking files... | 检查文件...';

  var self = this;

  fetch('games/galgame/game/index.html', { method: 'HEAD' })
    .then(function(response) {
      if (response.ok) {
        self.status = 'Found! Launching... | 找到游戏，启动中...';
      } else {
        self.error = 'Error: incomplete files | 游戏文件不完整';
        self.status = 'Please rebuild web version | 请重新构建Web版本';
        self.phase = 'launcher';
      }
    })
    .catch(function() {
      self.error = 'Error: game files not found | 未找到游戏文件';
      self.status = 'Please build Web in Ren\'Py SDK | 请在Ren\'Py SDK中构建';
      self.phase = 'launcher';
    });
};

GalgameGame.prototype.launchGame = function () {
  var canvas = this.canvas || document.getElementById('gameCanvas2');
  if (canvas) {
    canvas.style.display = 'none';
  }

  var container = document.getElementById('renpy-container');
  if (container) {
    container.innerHTML = '<iframe src="games/galgame/game/index.html" style="width:100%;height:100%;border:none;"></iframe>';
  }
  this.started = true;
  var btn = document.getElementById('quitBtn2');
  if (btn) btn.style.display = 'block';

  // Show Chinese operation guide | 显示中文操作指南
  var guide = document.getElementById('galgame-guide');
  if (guide) guide.style.display = 'block';
};

GalgameGame.prototype.endGame = function () {
  window._gameLoop2 = false;
  if (this._galGestureHandler && window.mpManager) window.mpManager.unsubscribe(this._galGestureHandler);

  var canvas = this.canvas || document.getElementById('gameCanvas2');
  if (canvas) {
    canvas.style.display = 'block';
  }

  var container = document.getElementById('renpy-container');
  if (container) {
    container.innerHTML = '<p style="color:#fff;text-align:center;margin-top:100px;font-size:16px">Loading Game...<br><small style="color:#aaa">正在加载游戏...</small></p>';
  }

  // Hide Chinese guide | 隐藏操作指南
  var guide = document.getElementById('galgame-guide');
  if (guide) guide.style.display = 'none';

  this.started = false;
  GameEngine.prototype.endGame.call(this);
};

window.GalgameGame = GalgameGame;

// ====================================================================
// games/tetris/game.js — 体感方块 · 俄罗斯方块 + MediaPipe 手势控制
// ====================================================================

var TetrisGame = function () {
  GameEngine.call(this, 'screen-game-tetris', 3);

  // 网格配置
  this.COLS = 10;
  this.ROWS = 20;
  this.CELL_SIZE = 0; // 动态计算

  // 游戏状态
  this.grid = [];
  this.currentPiece = null;
  this.nextPiece = null;
  this.score = 0;
  this.linesCleared = 0;
  this.level = 1;
  this.dropInterval = 1000; // 初始下落间隔(ms)
  this.lastDrop = 0;
  this.lockDelay = 500; // 锁定延迟
  this.lockTimer = 0;
  this.isLocking = false;
  this.gameOver = false;

  // 7种标准 Tetromino
  this.TETROMINOES = {
    I: { shape: [[1,1,1,1]], color: '#00f0f0', name: 'I', fry: 'yellow' },
    O: { shape: [[1,1],[1,1]], color: '#f0f000', name: 'O', fry: 'yellow' },
    T: { shape: [[0,1,0],[1,1,1]], color: '#a000f0', name: 'T', fry: 'yellow' },
    S: { shape: [[0,1,1],[1,1,0]], color: '#00f000', name: 'S', fry: 'red' },
    Z: { shape: [[1,1,0],[0,1,1]], color: '#f00000', name: 'Z', fry: 'red' },
    J: { shape: [[1,0,0],[1,1,1]], color: '#0000f0', name: 'J', fry: 'green' },
    L: { shape: [[0,0,1],[1,1,1]], color: '#f0a000', name: 'L', fry: 'green' }
  };

  // 薯条图片
  this.fryImages = {
    yellow: new Image(),
    red: new Image(),
    green: new Image()
  };
  this.fryImages.yellow.src = 'games/tetris/fry-yellow.png';
  this.fryImages.red.src = 'games/tetris/fry-red.png';
  this.fryImages.green.src = 'games/tetris/fry-green.png';
  this.PIECE_NAMES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

  // 体感状态 - 新手势系统
  this.gestureCooldown = 0;
  this.prevLeftArmUp = false;
  this.prevRightArmUp = false;
  this.prevArmsCrossed = false;
  this.leftArmTriggered = false;
  this.rightArmTriggered = false;
  this.fastDrop = false; // 点头时加速下落
  this.fastDropTimer = 0;
  // 点头检测状态
  this.prevNoseY = null;
  this.nodAccumY = 0;
  this.nodState = 0; // 0=等待下, 1=等待上
  this.nodCount = 0;
  this.nodTimer = 0;

  // 特效
  this.lineClearEffects = [];
  this.particles = [];
  this.screenShake = 0;

  // 方块掉落动画状态
  this.fallingBlocks = []; // { row, col, cell, targetY, currentY, speed }
  this.isFalling = false;

  // 手势提示
  this.gestureHint = '';
  this.gestureHintTimer = 0;
};

TetrisGame.prototype = Object.create(GameEngine.prototype);
TetrisGame.prototype.constructor = TetrisGame;

// ====================================================================
// setup — 初始化游戏
// ====================================================================
TetrisGame.prototype.setup = function () {
  GameEngine.prototype.setup.call(this);
  var self = this;

  // 动态计算格子大小 (保持比例放大)
  var topMargin = 80;   // 顶部 HUD 区域
  var bottomMargin = 120; // 底部手势提示区域
  var availableHeight = window.innerHeight - topMargin - bottomMargin;
  var availableWidth = window.innerWidth - 40; // 左右留 20px 边距

  // 计算格子大小，保持比例，填满可用空间
  var maxCellW = Math.floor(availableWidth / this.COLS);
  var maxCellH = Math.floor(availableHeight / this.ROWS);
  this.CELL_SIZE = Math.min(maxCellW, maxCellH);

  // 网格偏移 (水平居中，垂直居中于可用空间)
  this.gridOffsetX = Math.floor((window.innerWidth - this.COLS * this.CELL_SIZE) / 2);
  var gridHeight = this.ROWS * this.CELL_SIZE;
  this.gridOffsetY = topMargin + Math.floor((availableHeight - gridHeight) / 2);

  // 初始化空网格
  this.grid = [];
  for (var r = 0; r < this.ROWS; r++) {
    this.grid[r] = [];
    for (var c = 0; c < this.COLS; c++) {
      this.grid[r][c] = null; // null 表示空，字符串表示颜色
    }
  }

  // 生成第一个方块
  this.nextPiece = this._randomPiece();
  this._spawnPiece();

  // 游戏状态
  this.score = 0;
  this.linesCleared = 0;
  this.level = 1;
  this.baseSpeed = 1.2; // 初始速度：1.2格/秒
  this.speedPerLine = 0.2; // 每消行一次增加0.2格/秒
  this.dropInterval = 1000 / this.baseSpeed; // 初始下落间隔(ms)
  this.lastDrop = performance.now();
  this.gameOver = false;
  this._running = true;
  this._paused = false;

  // 体感方块使用 2 分钟倒计时
  STATE.gameStats.time = 120;

  // 背景图片
  this.bgImage = new Image();
  this.bgImage.src = 'games/tetris/sea.png';

  // NEXT预览区背景图片
  this.nextBgImage = new Image();
  this.nextBgImage.src = 'games/tetris/m.png';

  // 消行音效
  this.clearSound = new Audio('games/tetris/excellent.mp3');
  this.clearSound.volume = 0.8;

  // 重置掉落动画状态
  this.fallingBlocks = [];
  this.isFalling = false;

  // 重置体感状态 - 新手势系统
  this.gestureCooldown = 0;
  this.prevLeftArmUp = false;
  this.prevRightArmUp = false;
  this.prevArmsCrossed = false;
  this.leftArmTriggered = false;
  this.rightArmTriggered = false;
  this.fastDrop = false;
  this.fastDropTimer = 0;
  this.prevNoseY = null;
  this.nodAccumY = 0;
  this.nodState = 0;
  this.nodCount = 0;
  this.nodTimer = 0;

  // 隐藏操作指南
  var guide = document.getElementById('actionGuide3');
  if (guide) guide.classList.add('hidden');

  // 绑定键盘
  this._keydownHandler = function (e) {
    if (!self.running || self.gameOver) return;
    if (self.isReadyPhase()) return;

    switch (e.code) {
      case 'ArrowLeft':
        e.preventDefault();
        self._movePiece(-1, 0);
        break;
      case 'ArrowRight':
        e.preventDefault();
        self._movePiece(1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        self._softDrop();
        break;
      case 'ArrowUp':
        e.preventDefault();
        self._rotatePiece();
        break;
      case 'Space':
        e.preventDefault();
        self._hardDrop();
        break;
    }
  };
  window.addEventListener('keydown', this._keydownHandler);

  // 窗口大小调整时重新计算布局
  this._resizeHandler = function () {
    self._recalcLayout();
  };
  window.addEventListener('resize', this._resizeHandler);

  // 订阅体感
  this._poseHandler = function (results) {
    if (!self.running || self.gameOver || self.isReadyPhase() || self._paused) return;
    self._handlePoseInput(results);
  };
  if (window.mpManager) {
    window.mpManager.subscribe(this._poseHandler);
  }

  // 启动游戏循环
  this.startLoop();

  // 显示准备界面
  this.showReadyScreen(function () {
    self.beginCountdown();
  });
};

// ====================================================================
// 游戏主循环
// ====================================================================
TetrisGame.prototype.startLoop = function () {
  var self = this;
  this._running = true;

  function loop() {
    if (!self._running) return;
    self._animFrameId = requestAnimationFrame(loop);

    if (self._paused || self.isReadyPhase()) {
      self.render();
      return;
    }

    self.update();
    self.render();
  }
  this._animFrameId = requestAnimationFrame(loop);
};

// ====================================================================
// update — 每帧逻辑更新
// ====================================================================
TetrisGame.prototype.update = function () {
  if (this.gameOver) return;

  var now = performance.now();

  // 手势冷却
  if (this.gestureCooldown > 0) this.gestureCooldown--;

  // 手势提示计时
  if (this.gestureHintTimer > 0) {
    this.gestureHintTimer--;
    if (this.gestureHintTimer <= 0) this.gestureHint = '';
  }

  // 自动下落 (双臂展开时加速)
  var currentInterval = this.fastDrop ? 50 : this.dropInterval;
  if (now - this.lastDrop >= currentInterval) {
    this.lastDrop = now;
    if (!this._movePiece(0, 1)) {
      // 无法下移，开始锁定延迟
      if (!this.isLocking) {
        this.isLocking = true;
        this.lockTimer = now;
      }
    } else {
      this.isLocking = false;
      // 加速下落时加分
      if (this.fastDrop) {
        this.score += 1;
        STATE.gameStats.cal += 0.01;
      }
    }
  }

  // 锁定延迟
  if (this.isLocking) {
    if (now - this.lockTimer >= this.lockDelay) {
      this._lockPiece();
    }
  }

  // 更新掉落动画
  if (this.isFalling) {
    this._updateFallingBlocks();
  }

  // 特效更新
  this._updateEffects();

  // 同步HUD
  this._syncHUD();
};

// ====================================================================
// render — Canvas 渲染
// ====================================================================
TetrisGame.prototype.render = function () {
  var ctx = this.ctx;
  var cs = this.CELL_SIZE;
  var ox = this.gridOffsetX;
  var oy = this.gridOffsetY;

  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // 绘制背景图片（如果加载完成）
  if (this.bgImage && this.bgImage.complete) {
    ctx.drawImage(this.bgImage, 0, 0, this.canvas.width, this.canvas.height);
  } else {
    // 备用渐变背景
    var grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, '#0a0520');
    grad.addColorStop(1, '#1a0a30');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // 毛玻璃效果 - 游戏区域背景
  var padding = 12;
  var glassX = ox - padding;
  var glassY = oy - padding;
  var glassW = this.COLS * cs + padding * 2;
  var glassH = this.ROWS * cs + padding * 2;

  // 绘制毛玻璃底板
  ctx.save();
  ctx.fillStyle = 'rgba(10, 5, 30, 0.6)';
  ctx.shadowColor = 'rgba(168, 85, 247, 0.3)';
  ctx.shadowBlur = 20;
  this._roundRect(ctx, glassX, glassY, glassW, glassH, 12);
  ctx.fill();

  // 内部高光边框
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  this._roundRect(ctx, glassX, glassY, glassW, glassH, 12);
  ctx.stroke();

  // 外部发光边框
  ctx.shadowColor = 'rgba(168, 85, 247, 0.4)';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
  ctx.lineWidth = 1.5;
  this._roundRect(ctx, glassX, glassY, glassW, glassH, 12);
  ctx.stroke();
  ctx.restore();

  // 绘制网格背景
  this._drawGrid(ctx, ox, oy, cs);

  // 绘制已锁定的方块
  this._drawLockedPieces(ctx, ox, oy, cs);

  // 绘制掉落中的方块
  this._drawFallingBlocks(ctx, ox, oy, cs);

  // 绘制阴影 (Ghost)
  this._drawGhost(ctx, ox, oy, cs);

  // 绘制当前方块
  this._drawCurrentPiece(ctx, ox, oy, cs);

  // 绘制边框
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(ox, oy, this.COLS * cs, this.ROWS * cs);

  // 绘制下一个方块预览
  this._drawNextPreview(ctx);

  // 绘制手势提示
  this._drawGestureHint(ctx);

  // 绘制特效
  this._drawEffects(ctx, ox, oy, cs);

  // 暂停遮罩
  if (this._paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 48px Microsoft YaHei, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⏸ 暂停中', this.canvas.width / 2, this.canvas.height / 2);
    ctx.font = '18px Microsoft YaHei, Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText('按 ESC 继续', this.canvas.width / 2, this.canvas.height / 2 + 40);
  }
};

// ====================================================================
// 绘制辅助方法
// ====================================================================

TetrisGame.prototype._drawGrid = function (ctx, ox, oy, cs) {
  ctx.strokeStyle = 'rgba(100, 100, 150, 0.08)';
  ctx.lineWidth = 0.5;
  for (var r = 0; r <= this.ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(ox, oy + r * cs);
    ctx.lineTo(ox + this.COLS * cs, oy + r * cs);
    ctx.stroke();
  }
  for (var c = 0; c <= this.COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(ox + c * cs, oy);
    ctx.lineTo(ox + c * cs, oy + this.ROWS * cs);
    ctx.stroke();
  }
};

TetrisGame.prototype._drawLockedPieces = function (ctx, ox, oy, cs) {
  for (var r = 0; r < this.ROWS; r++) {
    for (var c = 0; c < this.COLS; c++) {
      var cell = this.grid[r][c];
      if (cell) {
        this._drawCell(ctx, ox + c * cs, oy + r * cs, cs, cell.color, cell.fry);
      }
    }
  }
};

TetrisGame.prototype._drawCurrentPiece = function (ctx, ox, oy, cs) {
  if (!this.currentPiece) return;
  var shape = this.currentPiece.shape;
  var color = this.currentPiece.color;
  var fryType = this.currentPiece.fry;
  for (var r = 0; r < shape.length; r++) {
    for (var c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        var px = this.currentPiece.x + c;
        var py = this.currentPiece.y + r;
        if (py >= 0) {
          this._drawCell(ctx, ox + px * cs, oy + py * cs, cs, color, fryType);
        }
      }
    }
  }
};

TetrisGame.prototype._drawFallingBlocks = function (ctx, ox, oy, cs) {
  if (!this.isFalling || this.fallingBlocks.length === 0) return;

  for (var i = 0; i < this.fallingBlocks.length; i++) {
    var block = this.fallingBlocks[i];
    var x = ox + block.col * cs;
    var y = oy + block.currentY * cs;
    this._drawCell(ctx, x, y, cs, block.cell.color, block.cell.fry);
  }
};

TetrisGame.prototype._drawGhost = function (ctx, ox, oy, cs) {
  if (!this.currentPiece) return;
  var ghostY = this._getGhostY();
  if (ghostY === this.currentPiece.y) return;

  var shape = this.currentPiece.shape;
  ctx.globalAlpha = 0.2;
  for (var r = 0; r < shape.length; r++) {
    for (var c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        var px = this.currentPiece.x + c;
        var py = ghostY + r;
        if (py >= 0) {
          this._drawCell(ctx, ox + px * cs, oy + py * cs, cs, this.currentPiece.color, this.currentPiece.fry);
        }
      }
    }
  }
  ctx.globalAlpha = 1.0;
};

TetrisGame.prototype._roundRect = function (ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

TetrisGame.prototype._drawCell = function (ctx, x, y, size, color, fryType) {
  // 检查是否有对应的薯条图片
  var fryImg = fryType ? this.fryImages[fryType] : null;

  if (fryImg && fryImg.complete) {
    // 绘制薯条图片
    ctx.drawImage(fryImg, x + 1, y + 1, size - 2, size - 2);
  } else {
    // 备用纯色
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  }

  // 高光效果
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(x + 1, y + 1, size - 2, 2);
  ctx.fillRect(x + 1, y + 1, 2, size - 2);

  // 阴影效果
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(x + 1, y + size - 3, size - 2, 2);
  ctx.fillRect(x + size - 3, y + 1, 2, size - 2);
};

TetrisGame.prototype._drawNextPreview = function (ctx) {
  if (!this.nextPiece) return;
  var cs = Math.floor(this.CELL_SIZE * 0.7);
  var previewX = this.gridOffsetX + this.COLS * this.CELL_SIZE + 20;
  var previewY = this.gridOffsetY + 20;

  // 背景框 - 毛玻璃效果
  var boxW = cs * 5 + 16;
  var boxH = cs * 4 + 40;

  ctx.save();

  // 绘制背景图片（如果加载完成）
  if (this.nextBgImage && this.nextBgImage.complete) {
    // 创建圆角裁剪路径
    this._roundRect(ctx, previewX, previewY, boxW, boxH, 10);
    ctx.clip();
    // 绘制图片填充
    ctx.drawImage(this.nextBgImage, previewX, previewY, boxW, boxH);
    // 恢复路径
    ctx.restore();
    ctx.save();
  } else {
    // 备用：半透明底板
    ctx.fillStyle = 'rgba(10, 5, 30, 0.7)';
    ctx.shadowColor = 'rgba(0, 212, 255, 0.3)';
    ctx.shadowBlur = 15;
    this._roundRect(ctx, previewX, previewY, boxW, boxH, 10);
    ctx.fill();
  }

  // 内部高光边框
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  this._roundRect(ctx, previewX, previewY, boxW, boxH, 10);
  ctx.stroke();

  // 外部发光边框 (青色)
  ctx.shadowColor = 'rgba(0, 212, 255, 0.4)';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
  ctx.lineWidth = 1.5;
  this._roundRect(ctx, previewX, previewY, boxW, boxH, 10);
  ctx.stroke();
  ctx.restore();

  // 标题
  ctx.fillStyle = '#a855f7';
  ctx.font = 'bold 12px Microsoft YaHei, Arial';
  ctx.textAlign = 'center';
  ctx.fillText('NEXT', previewX + boxW / 2, previewY + 16);

  // 方块
  var shape = this.nextPiece.shape;
  var offsetX = previewX + (boxW - shape[0].length * cs) / 2;
  var offsetY = previewY + 28;
  for (var r = 0; r < shape.length; r++) {
    for (var c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        this._drawCell(ctx, offsetX + c * cs, offsetY + r * cs, cs, this.nextPiece.color, this.nextPiece.fry);
      }
    }
  }
  ctx.textAlign = 'left';
};

TetrisGame.prototype._drawGestureHint = function (ctx) {
  if (!this.gestureHint) return;
  ctx.fillStyle = 'rgba(0, 212, 255, 0.9)';
  ctx.font = 'bold 16px Microsoft YaHei, Arial';
  ctx.textAlign = 'center';
  ctx.fillText(this.gestureHint, this.canvas.width / 2, this.gridOffsetY - 10);
  ctx.textAlign = 'left';
};

TetrisGame.prototype._drawEffects = function (ctx, ox, oy, cs) {
  // 消行特效
  for (var i = 0; i < this.lineClearEffects.length; i++) {
    var eff = this.lineClearEffects[i];
    var alpha = eff.life / eff.maxLife;
    ctx.fillStyle = 'rgba(255, 255, 255,' + (alpha * 0.8) + ')';
    ctx.fillRect(ox, oy + eff.row * cs, this.COLS * cs, cs);
  }

  // 粒子
  for (var j = 0; j < this.particles.length; j++) {
    var p = this.particles[j];
    ctx.fillStyle = 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + p.a + ')';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
};

// ====================================================================
// 俄罗斯方块核心逻辑
// ====================================================================

TetrisGame.prototype._randomPiece = function () {
  var name = this.PIECE_NAMES[randInt(0, this.PIECE_NAMES.length)];
  var tetro = this.TETROMINOES[name];
  return {
    shape: tetro.shape.map(function (row) { return row.slice(); }),
    color: tetro.color,
    fry: tetro.fry,
    name: tetro.name,
    x: 0,
    y: 0
  };
};

TetrisGame.prototype._spawnPiece = function () {
  this.currentPiece = this.nextPiece;
  this.nextPiece = this._randomPiece();

  // 居中放置
  this.currentPiece.x = Math.floor((this.COLS - this.currentPiece.shape[0].length) / 2);
  this.currentPiece.y = 0;
  this.isLocking = false;

  // 检查是否能放置
  if (this._checkCollision(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
    this.gameOver = true;
    this._showGameOver();
  }
};

TetrisGame.prototype._movePiece = function (dx, dy) {
  if (!this.currentPiece || this.gameOver) return false;
  var newX = this.currentPiece.x + dx;
  var newY = this.currentPiece.y + dy;

  if (!this._checkCollision(this.currentPiece.shape, newX, newY)) {
    this.currentPiece.x = newX;
    this.currentPiece.y = newY;
    if (dy > 0) {
      this.lastDrop = performance.now(); // 重置下落计时器
    }
    return true;
  }
  return false;
};

TetrisGame.prototype._rotatePiece = function () {
  if (!this.currentPiece || this.gameOver) return;
  var shape = this.currentPiece.shape;
  var rows = shape.length;
  var cols = shape[0].length;
  var rotated = [];

  // 顺时针旋转
  for (var c = 0; c < cols; c++) {
    rotated[c] = [];
    for (var r = rows - 1; r >= 0; r--) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }

  // 尝试旋转，如果碰撞则尝试墙踢
  var kicks = [0, -1, 1, -2, 2];
  for (var i = 0; i < kicks.length; i++) {
    if (!this._checkCollision(rotated, this.currentPiece.x + kicks[i], this.currentPiece.y)) {
      this.currentPiece.shape = rotated;
      this.currentPiece.x += kicks[i];
      this._showGesture('🔄 旋转');
      return;
    }
  }
};

TetrisGame.prototype._softDrop = function () {
  if (this._movePiece(0, 1)) {
    this.score += 1;
    this.lastDrop = performance.now();
  }
};

TetrisGame.prototype._hardDrop = function () {
  if (!this.currentPiece || this.gameOver) return;
  var dropDist = 0;
  while (this._movePiece(0, 1)) {
    dropDist++;
  }
  this.score += dropDist * 2;
  this._lockPiece();
  this._showGesture('⬇️ 硬降');
};

TetrisGame.prototype._lockPiece = function () {
  if (!this.currentPiece) return;
  var shape = this.currentPiece.shape;
  var color = this.currentPiece.color;
  var fryType = this.currentPiece.fry;

  // 将方块写入网格
  for (var r = 0; r < shape.length; r++) {
    for (var c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        var gridY = this.currentPiece.y + r;
        var gridX = this.currentPiece.x + c;
        if (gridY >= 0 && gridY < this.ROWS && gridX >= 0 && gridX < this.COLS) {
          this.grid[gridY][gridX] = { color: color, fry: fryType };
        }
      }
    }
  }

  // 清除当前方块
  this.currentPiece = null;

  // 检查消行
  var cleared = this._clearLines();
  if (cleared > 0) {
    this.linesCleared += cleared;
    this._updateScore(cleared);
    this._updateLevel();

    // HP 恢复
    var hpRestore = [0, 5, 10, 15, 25][Math.min(cleared, 4)];
    STATE.gameStats.hp = clamp(STATE.gameStats.hp + hpRestore, 0, 100);

    // 播放消行音效
    if (this.clearSound) {
      this.clearSound.currentTime = 0;
      this.clearSound.play().catch(function(){});
    }

    // 每消3行触发飞吻动画 (3, 6, 9, 12...)
    var prevLinesCleared = this.linesCleared - cleared;
    if (Math.floor(prevLinesCleared / 3) < Math.floor(this.linesCleared / 3)) {
      var self = this;
      // 等掉落动画完成后再播放
      var checkKiss = setInterval(function() {
        if (!self.isFalling) {
          clearInterval(checkKiss);
          self._playKissAnimation();
        }
      }, 100);
    }
  }

  // 如果有掉落动画，等动画完成后再生成新方块
  if (this.isFalling) {
    this._waitFallingThenSpawn();
  } else {
    // 生成新方块
    this.isLocking = false;
    this._spawnPiece();
  }
};

// 等待掉落动画完成后生成新方块
TetrisGame.prototype._waitFallingThenSpawn = function () {
  var self = this;
  var checkInterval = setInterval(function () {
    if (!self.isFalling) {
      clearInterval(checkInterval);
      self.isLocking = false;
      self._spawnPiece();
    }
  }, 50);
};

TetrisGame.prototype._clearLines = function () {
  var cleared = 0;
  var linesToClear = [];

  // 找出需要消除的行
  for (var r = this.ROWS - 1; r >= 0; r--) {
    var full = true;
    for (var c = 0; c < this.COLS; c++) {
      if (!this.grid[r][c]) {
        full = false;
        break;
      }
    }
    if (full) {
      linesToClear.push(r);
    }
  }

  if (linesToClear.length === 0) return 0;

  // 添加消行特效和粒子
  for (var i = 0; i < linesToClear.length; i++) {
    var row = linesToClear[i];
    this.lineClearEffects.push({ row: row, life: 15, maxLife: 15 });

    for (var p = 0; p < 10; p++) {
      this.particles.push({
        x: this.gridOffsetX + randRange(0, this.COLS * this.CELL_SIZE),
        y: this.gridOffsetY + row * this.CELL_SIZE + this.CELL_SIZE / 2,
        vx: randRange(-3, 3),
        vy: randRange(-5, -1),
        size: randRange(2, 5),
        r: 255, g: 255, b: 255,
        a: 1,
        life: 30
      });
    }
  }

  // 找出需要掉落的方块（在被消除行上方的方块）
  var blocksToFall = [];
  var clearSet = new Set(linesToClear);

  for (var r = 0; r < this.ROWS; r++) {
    if (clearSet.has(r)) continue; // 跳过被消除的行
    for (var c = 0; c < this.COLS; c++) {
      if (this.grid[r][c]) {
        // 计算这个方块下面有多少行被消除
        var fallDistance = 0;
        for (var checkRow = r + 1; checkRow < this.ROWS; checkRow++) {
          if (clearSet.has(checkRow)) fallDistance++;
        }
        if (fallDistance > 0) {
          blocksToFall.push({
            row: r,
            col: c,
            cell: this.grid[r][c],
            fallDistance: fallDistance
          });
        }
      }
    }
  }

  // 先清除被消除的行
  for (var i = linesToClear.length - 1; i >= 0; i--) {
    this.grid.splice(linesToClear[i], 1);
  }
  // 在顶部添加空行
  for (var i = 0; i < linesToClear.length; i++) {
    var emptyRow = [];
    for (var ec = 0; ec < this.COLS; ec++) emptyRow.push(null);
    this.grid.unshift(emptyRow);
  }

  // 创建掉落动画
  for (var i = 0; i < blocksToFall.length; i++) {
    var block = blocksToFall[i];
    // 清除原位置
    this.grid[block.row][block.col] = null;
    // 添加到掉落动画列表
    this.fallingBlocks.push({
      col: block.col,
      cell: block.cell,
      startY: block.row,
      currentY: block.row,
      targetY: block.row + block.fallDistance,
      speed: 0.3 // 掉落速度
    });
  }

  if (this.fallingBlocks.length > 0) {
    this.isFalling = true;
  }

  cleared = linesToClear.length;
  return cleared;
};

TetrisGame.prototype._updateScore = function (lines) {
  var points = [0, 100, 300, 500, 800][Math.min(lines, 4)];
  this.score += points;
  STATE.gameStats.score = this.score;
  STATE.gameStats.actions += lines;

  // 连击
  STATE.gameStats.combo++;
  if (STATE.gameStats.combo > STATE.gameStats.maxCombo) {
    STATE.gameStats.maxCombo = STATE.gameStats.combo;
  }

  // 反馈
  var labels = ['', 'SINGLE!', 'DOUBLE!', 'TRIPLE!', 'TETRIS!'];
  var grades = ['', 'good', 'good', 'perfect', 'perfect'];
  UIManager.showFeedback('fb3', labels[Math.min(lines, 4)], grades[Math.min(lines, 4)], STATE.gameStats.combo);
};

TetrisGame.prototype._updateLevel = function () {
  // 计算当前速度：初始速度 + 消行数 * 每行增速
  var currentSpeed = this.baseSpeed + (this.linesCleared * this.speedPerLine);
  this.dropInterval = 1000 / currentSpeed;
  // 更新等级显示（每5行算一级）
  this.level = Math.floor(this.linesCleared / 5) + 1;
};

TetrisGame.prototype._checkCollision = function (shape, x, y) {
  for (var r = 0; r < shape.length; r++) {
    for (var c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        var newX = x + c;
        var newY = y + r;
        // 边界检查
        if (newX < 0 || newX >= this.COLS || newY >= this.ROWS) return true;
        // 网格碰撞
        if (newY >= 0 && this.grid[newY][newX]) return true;
      }
    }
  }
  return false;
};

TetrisGame.prototype._getGhostY = function () {
  if (!this.currentPiece) return 0;
  var ghostY = this.currentPiece.y;
  while (!this._checkCollision(this.currentPiece.shape, this.currentPiece.x, ghostY + 1)) {
    ghostY++;
  }
  return ghostY;
};

// ====================================================================
// 体感输入处理（身体比例自适应 + 简单防抖）
// ====================================================================

TetrisGame.prototype._handlePoseInput = function (results) {
  var lm = results.poseLandmarks;
  if (!lm) return;

  var lWrist = lm[15], rWrist = lm[16];
  var lShoulder = lm[11], rShoulder = lm[12];
  var nose = lm[0];
  if (!lWrist || !rWrist || !lShoulder || !rShoulder || !nose) return;

  // 可见性门控
  if ((lWrist.visibility < 0.4) && (rWrist.visibility < 0.4)) return;
  if ((lShoulder.visibility < 0.4) || (rShoulder.visibility < 0.4)) return;

  // ---- 身体比例（用于自适应阈值） ----
  var GU = window.GestureUtils;
  var body = GU ? GU.getBodyScale(lm) : null;
  var sw = body ? body.shoulderWidth : 0.15; // fallback 肩宽

  // ---- 冷却 ----
  if (this.gestureCooldown > 0) { this.gestureCooldown--; return; }

  // ---- 手臂举起（自适应阈值） ----
  var leftArmUp, rightArmUp;
  if (GU) {
    leftArmUp = GU.isArmUp(lm, 'left');
    rightArmUp = GU.isArmUp(lm, 'right');
  } else {
    // fallback：简单判断
    leftArmUp = lWrist.y < lShoulder.y - 0.05;
    rightArmUp = rWrist.y < rShoulder.y - 0.05;
  }

  // ---- 双臂交叉（自适应阈值） ----
  var armsCrossed;
  if (GU) {
    armsCrossed = GU.isArmsCrossed(lm);
  } else {
    armsCrossed = lWrist.x > rWrist.x - 0.05;
  }

  // ---- 点头检测（阻尼累积） ----
  if (this.prevNoseY !== null) {
    var deltaY = nose.y - this.prevNoseY;
    if (Math.abs(deltaY) > 0.003) this.nodAccumY += deltaY;
  }
  this.prevNoseY = nose.y;
  this.nodAccumY *= 0.88;

  // 点头状态机（原始坐标阈值，点头位移约 0.02-0.05）
  if (this.nodState === 0 && this.nodAccumY > 0.03) {
    this.nodState = 1; this.nodAccumY = 0;
  } else if (this.nodState === 1 && this.nodAccumY < -0.03) {
    this.nodState = 0; this.nodCount++; this.nodTimer = 50; this.nodAccumY = 0;
  }
  if (this.nodTimer > 0) this.nodTimer--;
  if (this.nodTimer <= 0 && this.nodCount > 0) this.nodCount = 0;

  if (this.nodCount >= 1) {
    this.nodCount = 0; this.nodState = 0;
    this.fastDrop = true; this.fastDropTimer = 30;
    this._showGesture('⬇️ 加速');
    STATE.gameStats.cal += 0.02;
  }

  if (this.fastDropTimer > 0) {
    this.fastDropTimer--;
    if (this.fastDropTimer <= 0) this.fastDrop = false;
  }

  // ---- 左臂举起 → 左移 ----
  if (leftArmUp && !this.prevLeftArmUp) {
    this._movePiece(-1, 0);
    this.gestureCooldown = 12;
    this._showGesture('👈 左移');
    STATE.gameStats.cal += 0.02;
    STATE.actionStats.left++;
  }

  // ---- 右臂举起 → 右移 ----
  if (rightArmUp && !this.prevRightArmUp) {
    this._movePiece(1, 0);
    this.gestureCooldown = 12;
    this._showGesture('👉 右移');
    STATE.gameStats.cal += 0.02;
    STATE.actionStats.right++;
  }

  // ---- 双臂交叉 → 旋转 ----
  if (armsCrossed && !this.prevArmsCrossed) {
    this._rotatePiece();
    this.gestureCooldown = 18;
    this._showGesture('🔄 旋转');
    STATE.gameStats.cal += 0.05;
    STATE.actionStats.rotate++;
  }

  // 更新上一帧状态
  this.prevLeftArmUp = leftArmUp;
  this.prevRightArmUp = rightArmUp;
  this.prevArmsCrossed = armsCrossed;
};

// ====================================================================
// 重新计算布局 (窗口大小变化时调用)
// ====================================================================

TetrisGame.prototype._recalcLayout = function () {
  // 更新 canvas 大小
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;

  // 动态计算格子大小 (保持比例放大)
  var topMargin = 80;   // 顶部 HUD 区域
  var bottomMargin = 120; // 底部手势提示区域
  var availableHeight = window.innerHeight - topMargin - bottomMargin;
  var availableWidth = window.innerWidth - 40; // 左右留 20px 边距

  // 计算格子大小，保持比例，填满可用空间
  var maxCellW = Math.floor(availableWidth / this.COLS);
  var maxCellH = Math.floor(availableHeight / this.ROWS);
  this.CELL_SIZE = Math.min(maxCellW, maxCellH);

  // 网格偏移 (水平居中，垂直居中于可用空间)
  this.gridOffsetX = Math.floor((window.innerWidth - this.COLS * this.CELL_SIZE) / 2);
  var gridHeight = this.ROWS * this.CELL_SIZE;
  this.gridOffsetY = topMargin + Math.floor((availableHeight - gridHeight) / 2);
};

TetrisGame.prototype._showGesture = function (text) {
  this.gestureHint = text;
  this.gestureHintTimer = 30; // 约0.5秒
};

// ====================================================================
// 掉落动画更新
// ====================================================================

TetrisGame.prototype._updateFallingBlocks = function () {
  var allDone = true;

  for (var i = this.fallingBlocks.length - 1; i >= 0; i--) {
    var block = this.fallingBlocks[i];
    block.currentY += block.speed;

    // 检查是否到达目标位置
    if (block.currentY >= block.targetY) {
      block.currentY = block.targetY;
      // 将方块放入网格
      var targetRow = Math.round(block.targetY);
      if (targetRow >= 0 && targetRow < this.ROWS) {
        this.grid[targetRow][block.col] = block.cell;
      }
      this.fallingBlocks.splice(i, 1);
    } else {
      allDone = false;
    }
  }

  if (allDone && this.fallingBlocks.length === 0) {
    this.isFalling = false;
  }
};

// ====================================================================
// 特效更新
// ====================================================================

TetrisGame.prototype._updateEffects = function () {
  // 消行特效
  for (var i = this.lineClearEffects.length - 1; i >= 0; i--) {
    this.lineClearEffects[i].life--;
    if (this.lineClearEffects[i].life <= 0) {
      this.lineClearEffects.splice(i, 1);
    }
  }

  // 粒子
  for (var j = this.particles.length - 1; j >= 0; j--) {
    var p = this.particles[j];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2; // 重力
    p.life--;
    p.a = p.life / 30;
    if (p.life <= 0) {
      this.particles.splice(j, 1);
    }
  }
};

// ====================================================================
// HUD 同步
// ====================================================================

TetrisGame.prototype._syncHUD = function () {
  var stats = STATE.gameStats;

  // 分数
  var scoreEl = document.getElementById('score3');
  if (scoreEl) scoreEl.textContent = this.score;

  // 消行数
  var linesEl = document.getElementById('lines3');
  if (linesEl) linesEl.textContent = this.linesCleared;

  // 等级
  var levelEl = document.getElementById('level3');
  if (levelEl) levelEl.textContent = this.level;

  // 倒计时
  var timerEl = document.getElementById('timer3');
  if (timerEl) timerEl.textContent = stats.time;

  // HP
  UIManager.updateHP(stats.hp, 'hp3', 'hpText3');

  // 卡路里
  var calEl = document.getElementById('cal3');
  if (calEl) calEl.textContent = fmt(stats.cal, 1);

  // 手势提示
  var hintEl = document.getElementById('hint3');
  if (hintEl) hintEl.textContent = this.gestureHint || '🧩 体感方块 · 手势控制';
};

// ====================================================================
// 飞吻动画
// ====================================================================

TetrisGame.prototype._playKissAnimation = function () {
  var self = this;

  // 暂停游戏
  this._paused = true;
  this._running = false;
  if (this._animFrameId) {
    cancelAnimationFrame(this._animFrameId);
    this._animFrameId = null;
  }

  // 暂停倒计时
  if (STATE.gameTimer) {
    clearInterval(STATE.gameTimer);
    STATE.gameTimer = null;
  }

  // 获取 DOM 元素
  var overlay = document.getElementById('kiss-overlay');
  var character = document.getElementById('kiss-character');
  var kissEffect = document.getElementById('kiss-effect');
  var kissText = document.getElementById('kiss-text');

  if (!overlay || !character || !kissEffect) return;

  // 重置状态
  character.classList.remove('zoom-in');
  kissEffect.classList.remove('show');
  if (kissText) kissText.classList.remove('show');
  overlay.style.display = 'flex';

  // 人物放大动画
  setTimeout(function() {
    character.classList.add('zoom-in');
  }, 50);

  // 显示飞吻效果
  setTimeout(function() {
    kissEffect.classList.add('show');
    if (kissText) kissText.classList.add('show');
  }, 1500);

  // 5秒后恢复游戏
  setTimeout(function() {
    overlay.style.display = 'none';
    character.classList.remove('zoom-in');
    kissEffect.classList.remove('show');
    if (kissText) kissText.classList.remove('show');

    // 恢复游戏
    self._paused = false;
    self.beginCountdown();
    self.startLoop();
  }, 5000);
};

// ====================================================================
// 游戏结束
// ====================================================================

TetrisGame.prototype._showGameOver = function () {
  this.running = false;
  this._running = false;

  // 显示游戏结束文字
  var ctx = this.ctx;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 48px Microsoft YaHei, Arial';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);

  ctx.fillStyle = '#ffd700';
  ctx.font = '24px Microsoft YaHei, Arial';
  ctx.fillText('得分: ' + this.score, this.canvas.width / 2, this.canvas.height / 2 + 20);

  ctx.textAlign = 'left';

  // 延迟显示结算页面
  setTimeout(function () {
    showResults();
  }, 2000);
};

// ====================================================================
// endGame — 清理资源
// ====================================================================

TetrisGame.prototype.endGame = function () {
  this._running = false;
  this.running = false;

  // 退订体感
  if (this._poseHandler && window.mpManager) {
    window.mpManager.unsubscribe(this._poseHandler);
  }

  // 移除键盘监听
  if (this._keydownHandler) {
    window.removeEventListener('keydown', this._keydownHandler);
    this._keydownHandler = null;
  }

  // 移除窗口大小调整监听
  if (this._resizeHandler) {
    window.removeEventListener('resize', this._resizeHandler);
    this._resizeHandler = null;
  }

  // 取消动画帧
  if (this._animFrameId) {
    cancelAnimationFrame(this._animFrameId);
    this._animFrameId = null;
  }

  // 停止音效
  if (this.clearSound) {
    this.clearSound.pause();
    this.clearSound = null;
  }

  GameEngine.prototype.endGame.call(this);
};

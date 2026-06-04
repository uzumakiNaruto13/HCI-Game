// ====================================================================
// games/hoop/game.js — 3D 篮球视觉交互游戏 (合并自 manba 项目)
// 基于 Three.js + Cannon-es + GameEngine 框架
// ====================================================================

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { SceneManager } from './src/SceneManager.js';
import { PhysicsWorld } from './src/Physics.js';
import { Player } from './src/Player.js';
import { BasketballHandler } from './src/Basketball.js';
import { Defenders } from './src/Defenders.js';
import { CameraController } from './src/Camera.js';
import { UIManager } from './src/UI.js';
import { SoundManager } from './src/Sound.js';
import { EffectsManager } from './src/Effects.js';

window.KobeShootingGame = function () {
  GameEngine.call(this, 'screen-game-hoop', 1);

  this.clock = new THREE.Clock();
  this.sceneManager = new SceneManager(this);
  this.physics = new PhysicsWorld(this);
  this.sound = new SoundManager(this);
  this.ui = new UIManager(this);
  this.effects = new EffectsManager(this);
  this.cameraCtrl = new CameraController(this);
  this.player = new Player(this);
  this.basketballHandler = new BasketballHandler(this);
  this.defendersHandler = new Defenders(this);

  this.score = 0;
  this.opponentScore = 0;
  this.pickupDistance = 1.5;
  this.freezeTimer = 0;
  this.freezeDuration = 0.2;

  this.keys = {
    w: false, a: false, s: false, d: false,
    ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
  };
  this.isSprinting = false;
  this.sprintCooldown = 0;
  this.sprintTimer = 0;
  this.isCharging = false;
  this.chargeStartTime = 0;
  this.displayProgress = 0;

  this._animFrameId = null;
  this._keydownHandler = null;
  this._keyupHandler = null;
};

KobeShootingGame.prototype = Object.create(GameEngine.prototype);
KobeShootingGame.prototype.constructor = KobeShootingGame;

// ====================================================================
// setup — 初始化 3D 游戏
// ====================================================================

KobeShootingGame.prototype.setup = function () {
  GameEngine.prototype.setup.call(this);

  // 隐藏 2D Canvas，使用 Three.js WebGL 渲染
  this.canvas.style.display = 'none';

  var self = this;

  // 初始化所有 3D 组件 (顺序不能乱)
  this.sceneManager.createScene(this);
  this.sceneManager.createCamera(this);
  this.sceneManager.createRenderer(this);
  this.sceneManager.setupPostProcessing(this);
  this.sceneManager.createLights(this);
  this.sceneManager.createGround(this);
  this.physics.createGroundBody(this);
  this.sceneManager.createCourtLines(this);
  this._createBasketballHoop();
  this.sceneManager.createScoreboard(this);
  this.sceneManager.createArenaLights(this);
  this.sceneManager.createBoundaryWalls(this);
  this.player.createHandMarker(this);
  this.basketballHandler.createBasketball(this);
  this.player.loadPlayerModel(this);
  this.sceneManager.setupWindowResize(this);
  this.ui.setupDunkVideo(this);
  this.defendersHandler.initTestDefenders(this);

  // 将防守者感叹号精灵加入场景
  if (this.exclamationSprite) this.scene.add(this.exclamationSprite);

  // 初始比分显示
  this.sceneManager.updateScoreDisplay(this);

  // 键盘支持 (辅助操作)
  this._setupKeyboard();

  // 体感动作映射 — 核心：将父框架识别的动作转化为游戏操作
  this.onAction = function (result, now) {
    if (!result) return;

    // 准备阶段也要允许捡球 (让玩家在倒计时结束后就能操作)
    if (!self.state.isPlaying) return;

    if (result.action === 'shoot') {
      if (self.ballAttached) {
        // 持球时：出手投篮
        var power = self.isCharging ? self.displayProgress : 0.7;
        self.basketballHandler.shootFromHand(self, power);
        self.isCharging = false;
        self.displayProgress = 0;
      } else if (self.basketballBody && self.basketball.visible) {
        // 未持球时：尝试捡球
        self.basketballHandler.attachBall(self);
      }
    } else if (result.action === 'jump') {
      if (!self.isJumping && self.state.isModelLoaded) {
        self.verticalVelocity = self.jumpPower;
        self.isJumping = true;
        if (self.playerBody) self.playerBody.velocity.y = self.jumpPower;
        // 跳跃时如果持球且靠近篮筐 → 扣篮
        if (self.ballAttached) {
          self.basketballHandler.performDunk(self);
        }
      }
    }

    // 所有动作都更新 HP/分数/卡路里
    self.handleActionResult(result, now);
  };

  // 准备界面 → 倒计时 → 开始游戏
  this.showReadyScreen(function () {
    self.state.isPlaying = true;
    self._startGameLoop();
    self.beginCountdown();
  });
};

// ====================================================================
// 键盘支持 (保留基本操作，体感优先)
// ====================================================================

KobeShootingGame.prototype._setupKeyboard = function () {
  var self = this;

  this._keydownHandler = function (event) {
    if (!self.running) return;

    var mk = ['w', 'a', 's', 'd', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];
    if (mk.indexOf(event.key) !== -1) {
      self.keys[event.key] = true;
      event.preventDefault();
    }

    if (event.code === 'Space') {
      event.preventDefault();
      if (self.state.isPlaying && !self.isJumping && self.state.isModelLoaded) {
        self.verticalVelocity = self.jumpPower;
        self.isJumping = true;
        if (self.playerBody) self.playerBody.velocity.y = self.jumpPower;
      }
    }

    if (event.key === 'e' || event.key === 'E') {
      event.preventDefault();
      if (!self.state.isPlaying) return;
      if (self.ballAttached) {
        self.basketballHandler.detachBall(self);
      } else {
        self.basketballHandler.attachBall(self);
      }
    }

    if (event.key === 'j' || event.key === 'J') {
      event.preventDefault();
      if (!self.state.isPlaying || !self.ballAttached) return;
      self.isCharging = true;
      self.chargeStartTime = performance.now() / 1000;
      self.displayProgress = 0;
    }

    if (event.key === 'k' || event.key === 'K') {
      event.preventDefault();
      if (self.state.isPlaying) self.basketballHandler.performDunk(self);
    }

    if (event.key === 'q' || event.key === 'Q') {
      event.preventDefault();
      if (self.state.isPlaying && self.defenderHoldingBall) {
        self.defendersHandler.performPlayerSteal(self);
      }
    }
  };

  this._keyupHandler = function (event) {
    var mk = ['w', 'a', 's', 'd', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];
    if (mk.indexOf(event.key) !== -1) {
      self.keys[event.key] = false;
      event.preventDefault();
    }

    if (event.key === 'j' || event.key === 'J') {
      if (self.isCharging && self.ballAttached) {
        var progress = self.displayProgress;
        var powerFactor = self.minCharge + (self.maxCharge - self.minCharge) * progress;
        self.basketballHandler.shootFromHand(self, powerFactor);
      }
      self.isCharging = false;
      self.displayProgress = 0;
    }
  };

  window.addEventListener('keydown', this._keydownHandler);
  window.addEventListener('keyup', this._keyupHandler);
};

// ====================================================================
// 创建篮球架 (双篮筐：玩家侧 Z-18.65 + 对手侧 Z+18.65)
// ====================================================================

KobeShootingGame.prototype._createBasketballHoop = function () {
  var self = this;
  var hoopGroup = new THREE.Group();
  var textureLoader = new THREE.TextureLoader();

  var poleTexture = textureLoader.load('games/hoop/pictures/metal_pole.png');
  var backboardTexture = textureLoader.load('games/hoop/pictures/backboard_glass.png');
  var rimTexture = textureLoader.load('games/hoop/pictures/metal_rim.png');
  var borderTexture = textureLoader.load('games/hoop/pictures/metal_border.png');

  [poleTexture, backboardTexture, rimTexture, borderTexture].forEach(function (tex) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
  });

  var poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 4, 16);
  var poleMat = new THREE.MeshStandardMaterial({ map: poleTexture, roughness: 0.8, metalness: 0.6 });

  var backboardGeo = new THREE.BoxGeometry(2.0, 1.4, 0.15);
  var backboardMat = new THREE.MeshStandardMaterial({
    map: backboardTexture, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.9
  });

  var borderMat = new THREE.MeshStandardMaterial({ map: borderTexture, roughness: 0.2, metalness: 0.8 });
  var rimGeo = new THREE.TorusGeometry(0.45, 0.06, 16, 32);
  var rimMat = new THREE.MeshStandardMaterial({
    map: rimTexture, roughness: 0.1, metalness: 0.9, emissive: 0x442200, emissiveIntensity: 0.4
  });

  var connectorGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
  var connectorMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.7, metalness: 0.8 });

  var supportMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.7, metalness: 0.8 });
  var backSupportGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.8, 8);
  var bottomSupportGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
  var jointGeo = new THREE.SphereGeometry(0.15, 16, 16);

  var buildHoopAtBoundary = function (side) {
    var g = new THREE.Group();
    var baseZ = 19.5 * side;
    var dir = -side;

    var pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(0, 2, baseZ);
    pole.castShadow = true;
    g.add(pole);

    var boardZ = baseZ + 0.35 * dir;
    var backboard = new THREE.Mesh(backboardGeo, backboardMat);
    backboard.position.set(0, 3.9, boardZ);
    backboard.castShadow = true;
    g.add(backboard);

    var bw = 0.05, bd = 0.18;
    var topB = new THREE.Mesh(new THREE.BoxGeometry(2.05, bw, bd), borderMat);
    topB.position.set(0, 4.62, boardZ); topB.castShadow = true; g.add(topB);
    var botB = new THREE.Mesh(new THREE.BoxGeometry(2.05, bw, bd), borderMat);
    botB.position.set(0, 3.18, boardZ); botB.castShadow = true; g.add(botB);
    var lB = new THREE.Mesh(new THREE.BoxGeometry(bw, 1.45, bd), borderMat);
    lB.position.set(-1.02, 3.9, boardZ); lB.castShadow = true; g.add(lB);
    var rB = new THREE.Mesh(new THREE.BoxGeometry(bw, 1.45, bd), borderMat);
    rB.position.set(1.02, 3.9, boardZ); rB.castShadow = true; g.add(rB);

    var rimZ = boardZ + 0.5 * dir;
    var rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 3.05, rimZ);
    rim.castShadow = true;
    g.add(rim);

    var connector = new THREE.Mesh(connectorGeo, connectorMat);
    connector.rotation.x = Math.PI / 2;
    connector.position.set(0, 3.05, boardZ + 0.23 * dir);
    connector.castShadow = true;
    g.add(connector);

    for (var i = 0; i < 4; i++) {
      var netR = 0.45 - (i * 0.03);
      var netY = 2.95 - (i * 0.1);
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(netR, 0.02, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xCC5500, roughness: 0.6, metalness: 0.2 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, netY, rimZ);
      ring.castShadow = true;
      g.add(ring);
    }

    var bs = new THREE.Mesh(backSupportGeo, supportMat);
    bs.position.set(0, 1.5, baseZ - 0.6 * dir);
    bs.rotation.x = (-Math.PI / 3.2) * side;
    bs.castShadow = true; g.add(bs);

    var bts = new THREE.Mesh(bottomSupportGeo, supportMat);
    bts.position.set(0, 0.25, baseZ - 0.35 * dir);
    bts.rotation.z = Math.PI / 2;
    bts.castShadow = true; g.add(bts);

    var j1 = new THREE.Mesh(jointGeo, supportMat);
    j1.position.set(0, 2.8, baseZ); j1.castShadow = true; g.add(j1);
    var j2 = new THREE.Mesh(jointGeo, supportMat);
    j2.position.set(0, 0.25, baseZ); j2.castShadow = true; g.add(j2);

    hoopGroup.add(g);

    // 篮板物理
    var bb = new CANNON.Body({ mass: 0, material: self.backboardMaterial });
    bb.addShape(new CANNON.Box(new CANNON.Vec3(1.2, 1.0, 0.15)));
    bb.position.set(0, 3.9, boardZ);
    self.world.addBody(bb);
    self.staticBodies.push(bb);

    // 篮筐物理
    var rb = new CANNON.Body({ mass: 0, material: self.hoopMaterial, collisionFilterGroup: 1 });
    rb.addShape(new CANNON.Cylinder(0.45, 0.45, 0.08, 16));
    rb.position.set(0, 3.05, rimZ);
    var q = new CANNON.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    rb.quaternion.copy(q);
    self.world.addBody(rb);
    self.staticBodies.push(rb);

    if (side === -1) {
      self.hoopCenter.set(0, 3.05, rimZ);
    }
  };

  buildHoopAtBoundary(-1);
  buildHoopAtBoundary(1);

  this.scene.add(hoopGroup);
  this.physics.addHoopContactMaterials(this);
};

// ====================================================================
// 游戏主循环
// ====================================================================

KobeShootingGame.prototype._startGameLoop = function () {
  var self = this;
  (function loop() {
    if (!self.running) return;
    self._animFrameId = requestAnimationFrame(loop);
    self._update3D();
  })();
};

KobeShootingGame.prototype._update3D = function () {
  this.frameCount++;

  var unscaledDelta = this.clock.getDelta();
  var delta = unscaledDelta;

  // 未开始游戏时只渲染不更新逻辑
  if (!this.state.isPlaying) {
    this.player.syncModelWhenPaused(this);
    if (this.basketballBody && this.basketball) {
      this.basketball.position.copy(this.basketballBody.position);
      this.basketball.quaternion.copy(this.basketballBody.quaternion);
    }
    this.cameraCtrl.update(this);
    this.composer.render();
    return;
  }

  // === 以下仅游戏进行中执行 ===

  // HP 衰减 + 计时检查 (每帧)
  this.tick();

  // 冻结帧
  if (this.freezeTimer > 0) {
    this.freezeTimer -= delta;
    delta = 0;
  }

  if (this.sprintCooldown > 0) this.sprintCooldown -= delta;

  delta = this.effects.updateSlowMotion(this, delta);
  this.player.handleMovement(this, delta);

  // 动画混合器
  if (this.mixer) this.mixer.update(delta);

  // AI
  this.defendersHandler.updateDefenders(this, delta);

  // 物理
  this.physics.step(this, unscaledDelta);
  this.player.updateJump(this, delta);
  this.player.syncBallToHand(this);
  this.basketballHandler.safetyCheck(this);
  this.physics.syncPhysicsBodies(this);

  // UI
  this.ui.updateChargeBar(this, delta);

  // 特效
  this.effects.updateBallTrailPoints(this);
  this.basketballHandler.checkScoring(this);
  this.effects.updateParticles(this);

  // 相机 + 渲染
  this.cameraCtrl.update(this);
  this.composer.render();

  // HUD
  this._syncHUD();

  // 胜利
  if (this.score >= 11 && this.slowMotionTimer <= 0) {
    this.sound.playGameWinner(this);
    this.slowMotionTimer = 0.5;
  }
};

// ====================================================================
// HUD 同步
// ====================================================================

KobeShootingGame.prototype._syncHUD = function () {
  var stats = STATE.gameStats;
  var scoreEl = document.getElementById('score1');
  var timerEl = document.getElementById('timer1');
  var calEl = document.getElementById('cal1');
  var accEl = document.getElementById('acc1');
  var hintEl = document.getElementById('hint1');

  if (scoreEl) scoreEl.textContent = this.score;
  if (timerEl) timerEl.textContent = stats.time;
  if (calEl) calEl.textContent = fmt(stats.cal, 1);
  if (accEl) accEl.textContent = '--';
  UIManager.updateHP(stats.hp, 'hp1', 'hpText1');

  if (hintEl) {
    var hint;
    if (this.defenderHoldingBall) {
      hint = '⚡ 对手持球! 按Q键抢断!';
    } else if (this.ballAttached) {
      hint = '🏀 按J键蓄力投篮!';
    } else {
      hint = '🏀 靠近篮球按E键捡球!';
    }
    hintEl.textContent = hint;
  }
};

// ====================================================================
// 结束游戏 (清理资源)
// ====================================================================

KobeShootingGame.prototype.endGame = function () {
  if (this._animFrameId) {
    cancelAnimationFrame(this._animFrameId);
    this._animFrameId = null;
  }
  // 移除键盘事件监听
  if (this._keydownHandler) {
    window.removeEventListener('keydown', this._keydownHandler);
    this._keydownHandler = null;
  }
  if (this._keyupHandler) {
    window.removeEventListener('keyup', this._keyupHandler);
    this._keyupHandler = null;
  }
  GameEngine.prototype.endGame.call(this);
};

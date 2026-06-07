import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
    BALL_RADIUS, BALL_MASS, BALL_HOLD_OFFSET_X, BALL_HOLD_OFFSET_Y, BALL_HOLD_OFFSET_Z,
    FIXED_SHOT_HEIGHT, MIN_CHARGE, MAX_CHARGE,
    HOOP_CENTER_X, HOOP_CENTER_Y, HOOP_CENTER_Z, HOOP_Z_OFFSET,
    COLLISION_GROUP_STATIC, COLLISION_GROUP_DYNAMIC
} from './constants.js';

export class BasketballHandler {
    constructor(game) {
        this.game = game;
        game.basketball = null;
        game.basketballBody = null;
        game.ballAttached = false;
        game.ballHoldOffset = new THREE.Vector3(BALL_HOLD_OFFSET_X, BALL_HOLD_OFFSET_Y, BALL_HOLD_OFFSET_Z);
        game.hoopZOffset = HOOP_Z_OFFSET;
        game.hoopCenter = new THREE.Vector3(HOOP_CENTER_X, HOOP_CENTER_Y, HOOP_CENTER_Z);
        game.hasScored = false;
        game.fixedShotHeight = FIXED_SHOT_HEIGHT;
        game.isCharging = false;
        game.chargeStartTime = 0;
        game.minCharge = MIN_CHARGE;
        game.maxCharge = MAX_CHARGE;
        game.displayProgress = 0;
        game.pendingShotPoints = 2;
        game.prevBallPos = undefined;
    }

    createBasketball(game) {
        const loader = new GLTFLoader();
        loader.load(
            'games/hoop/models/basketball.glb',
            (gltf) => {
                const ballModel = gltf.scene;
                ballModel.scale.set(0.5, 0.5, 0.5);
                ballModel.position.set(0, BALL_RADIUS + 0.1, -7);
                ballModel.visible = false;
                game.scene.add(ballModel);
                this._setupBallPhysics(game, ballModel);
                game.effects.createBallTrail(game);
                console.log('Basketball model loaded successfully');
            },
            undefined,
            (error) => {
                console.error('Failed to load basketball model, using fallback sphere', error);
                const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
                const ballMaterial = new THREE.MeshStandardMaterial({
                    color: 0xFF6600,
                    roughness: 0.4,
                    metalness: 0.2
                });
                const basketball = new THREE.Mesh(ballGeometry, ballMaterial);
                basketball.position.set(0, BALL_RADIUS, -7);
                basketball.visible = false;
                basketball.castShadow = true;
                basketball.receiveShadow = true;
                game.scene.add(basketball);
                this._setupBallPhysics(game, basketball);
                game.effects.createBallTrail(game);
            }
        );
    }

    _setupBallPhysics(game, ballMesh) {
        const ballBody = new CANNON.Body({
            mass: BALL_MASS,
            shape: new CANNON.Sphere(BALL_RADIUS),
            material: game.ballMaterial,
            collisionFilterGroup: COLLISION_GROUP_DYNAMIC,
            collisionFilterMask: COLLISION_GROUP_STATIC
        });
        ballBody.position.set(0, BALL_RADIUS + 0.1, -7);
        ballBody.velocity.set(0, 0, 0);
        ballBody.angularVelocity.set(0, 0, 0);
        ballBody.collisionResponse = false;
        ballBody.ccdSpeedThreshold = 1;
        ballBody.ccdIterations = 4;
        game.world.addBody(ballBody);

        ballBody.userData = { mesh: ballMesh };
        game.physicsBodies.push({ body: ballBody, mesh: ballMesh });

        game.basketballBody = ballBody;
        game.basketball = ballMesh;
    }

    resetBasketball(game) {
        if (!game.basketball || !game.basketballBody) return;
        game.ballAttached = false;

        const groundPos = new THREE.Vector3(0, BALL_RADIUS + 0.3, -7);
        game.basketballBody.position.set(groundPos.x, groundPos.y, groundPos.z);
        game.basketballBody.velocity.set(0, 0, 0);
        game.basketballBody.angularVelocity.set(0, 0, 0);
        game.basketballBody.collisionResponse = true;

        game.basketball.position.copy(game.basketballBody.position);
        game.basketball.quaternion.copy(game.basketballBody.quaternion);
        game.basketball.visible = true;

        game.hasScored = false;
        game.ballTrail = [];
        if (game.ballTrailLine) game.ballTrailLine.visible = false;
        game.prevBallPos = undefined;

        game.defenders.forEach(d => { d.hasTriggeredWhat = false; });
    }

    attachBall(game) {
        if (!game.basketball || !game.basketballBody || !game.basketball.visible) return;
        if (!game.playerModel) return;

        const playerXZ = new THREE.Vector2(game.playerModel.position.x, game.playerModel.position.z);
        const ballXZ = new THREE.Vector2(game.basketballBody.position.x, game.basketballBody.position.z);
        const horizontalDist = playerXZ.distanceTo(ballXZ);
        const verticalDist = Math.abs(game.basketballBody.position.y - game.playerModel.position.y);

        if (horizontalDist > game.pickupDistance || verticalDist > 1.5) {
            console.log(`Ball too far: horizontal=${horizontalDist.toFixed(2)}m, vertical=${verticalDist.toFixed(2)}m`);
            return;
        }

        if (game.defenderHoldingBall) {
            console.log("%c[BALL STRIPPED] 玩家通过 E 键直接夺取了防守者的篮球！", "color: #ffaa00; font-weight: bold;");
            game.sound.triggerCnmAudio(game);
            game.defenderHoldingBall.hasBall = false;
            game.defenderHoldingBall.cooldown = 1.5;
            game.defenderHoldingBall = null;
        }
        game.defenders.forEach(def => { def.hasBall = false; });

        game.ballAttached = true;
        game.basketballBody.mass = 0;
        game.basketballBody.collisionResponse = false;
        game.basketballBody.velocity.set(0, 0, 0);
        game.basketballBody.angularVelocity.set(0, 0, 0);

        const handPos = game.player.getHandWorldPos(game);
        game.basketballBody.position.copy(handPos);
        game.basketball.position.copy(handPos);

        const chargeContainer = document.getElementById('charge-bar-container');
        if (chargeContainer) chargeContainer.style.display = 'block';
    }

    detachBall(game) {
        if (!game.basketballBody) return;
        game.ballAttached = false;
        game.basketballBody.mass = BALL_MASS;
        game.basketballBody.type = CANNON.Body.DYNAMIC;
        game.basketballBody.updateMassProperties();
        game.basketballBody.collisionResponse = true;

        const chargeContainer = document.getElementById('charge-bar-container');
        if (chargeContainer) chargeContainer.style.display = 'none';
    }

    shootFromHand(game, powerFactor = 1.0) {
        if (!game.ballAttached || !game.basketballBody || !game.basketball) return;

        const handPos = game.player.getHandWorldPos(game);
        game.hoopCenter.set(0, HOOP_CENTER_Y, HOOP_CENTER_Z);

        const playerXZ = new THREE.Vector2(game.playerModel.position.x, game.playerModel.position.z);
        const hoopXZ = new THREE.Vector2(game.hoopCenter.x, game.hoopCenter.z);
        const shotDist = playerXZ.distanceTo(hoopXZ);

        game.pendingShotPoints = (shotDist >= 6.75) ? 3 : 2;
        console.log(`[SHOT DISTANCE] 出手距离: ${shotDist.toFixed(2)}m -> 判定为 ${game.pendingShotPoints} 分球`);

        if (game.hoopCenter.distanceTo(handPos) < 1.0) {
            console.warn('目标点异常，取消投篮');
            return;
        }

        const dx = game.hoopCenter.x - handPos.x;
        const dz = game.hoopCenter.z - handPos.z;
        const gravity = 9.82;
        const hoopY = game.hoopCenter.y;
        const handY = handPos.y;

        const apexY = Math.max(game.fixedShotHeight, Math.max(handY, hoopY) + 0.5);
        const dyMax = apexY - handY;
        const dyDown = apexY - hoopY;

        const tUp = Math.sqrt(2 * dyMax / gravity);
        const tDown = Math.sqrt(2 * dyDown / gravity);
        const preciseTotalTime = tUp + tDown;

        const vy = gravity * tUp;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minDist = 2.0;
        const maxDist = Math.abs(game.hoopCenter.z);

        const currentProgress = (powerFactor - game.minCharge) / (game.maxCharge - game.minCharge);
        const currentPercent = currentProgress * 100;
        const recommendedPercent = Math.min(100, Math.max(0, ((dist - 2) / (maxDist - 2)) * 100));

        let desiredDist;
        if (Math.abs(currentPercent - recommendedPercent) <= 9) {
            desiredDist = dist;
            console.log(`%c[PERFECT SNAP] 临近最优蓄力区间触发完美吸附！强制锁死空心命中！`, 'color: #FFD700; font-weight: bold;');
        } else {
            desiredDist = minDist + (maxDist - minDist) * currentProgress;
        }

        const horizSpeed = desiredDist / preciseTotalTime;
        const vx = (dx / dist) * horizSpeed;
        const vz = (dz / dist) * horizSpeed;

        game.basketballBody.mass = BALL_MASS;
        game.basketballBody.type = CANNON.Body.DYNAMIC;
        game.basketballBody.updateMassProperties();
        game.basketballBody.collisionResponse = true;
        game.basketballBody.velocity.set(vx, vy, vz);
        game.basketballBody.angularVelocity.set(
            (Math.random() - 0.5) * 10 * powerFactor,
            (Math.random() - 0.5) * 10 * powerFactor,
            (Math.random() - 0.5) * 10 * powerFactor
        );

        game.ballAttached = false;
        game.isCharging = false;
        game.displayProgress = 0;

        const chargeContainer = document.getElementById('charge-bar-container');
        if (chargeContainer) chargeContainer.style.display = 'none';
        const fill = document.getElementById('charge-fill');
        if (fill) fill.style.width = '0%';

        game.ballTrail = [];
        game.effects.updateBallTrail(game);
    }

    performDunk(game) {
        if (!game.ballAttached || !game.basketballBody || !game.basketball) return;
        if (!game.isJumping) {
            console.log("扣篮失败：角色未处于跳跃状态");
            return;
        }

        const handPos = game.player.getHandWorldPos(game);
        const dx = game.hoopCenter.x - handPos.x;
        const dz = game.hoopCenter.z - handPos.z;
        const distXZ = Math.sqrt(dx * dx + dz * dz);

        if (distXZ > 1.5) {
            console.log(`扣篮失败：距离篮筐太远 (${distXZ.toFixed(2)}m)`);
            return;
        }

        console.log("BOOM! 触发扣篮！");
        game.pendingShotPoints = 2;

        game.ballAttached = false;
        game.basketballBody.mass = BALL_MASS;
        game.basketballBody.type = CANNON.Body.DYNAMIC;
        game.basketballBody.updateMassProperties();
        game.basketballBody.collisionResponse = true;

        const chargeContainer = document.getElementById('charge-bar-container');
        if (chargeContainer) chargeContainer.style.display = 'none';
        game.isCharging = false;
        game.displayProgress = 0;

        const targetY = 2.8;
        const dy = targetY - handPos.y;
        const t = 0.15;
        const vx = dx / t;
        const vz = dz / t;
        const vy = (dy - 0.5 * -9.82 * t * t) / t;

        game.basketballBody.velocity.set(vx, vy, vz);
        game.basketballBody.angularVelocity.set(20, 0, 0);

        game.ballTrail = [];
        game.effects.updateBallTrail(game);
        game.ui.playDunkVideo(game);
        game.cameraCtrl.triggerScreenShake(game);
    }

    checkScoring(game) {
        if (!game.basketballBody || game.hasScored || !game.basketball.visible || game.ballAttached || game.defenderHoldingBall) return;

        const ballPos = game.basketballBody.position;
        if (game.prevBallPos !== undefined) {
            if (game.prevBallPos.y >= game.hoopCenter.y && ballPos.y < game.hoopCenter.y) {
                const t = (game.prevBallPos.y - game.hoopCenter.y) / (game.prevBallPos.y - ballPos.y);
                const exactX = game.prevBallPos.x + t * (ballPos.x - game.prevBallPos.x);
                const exactZ = game.prevBallPos.z + t * (ballPos.z - game.prevBallPos.z);

                const dx = exactX - game.hoopCenter.x;
                const dz = exactZ - game.hoopCenter.z;
                const distXZ = Math.sqrt(dx * dx + dz * dz);

                if (distXZ < 0.45) {
                    game.hasScored = true;
                    game.score += game.pendingShotPoints;
                    game.sceneManager.updateScoreDisplay(game);

                    const pointStr = (game.pendingShotPoints === 3) ? "🔥 三分球空心入网！+3分" : "🏀 稳稳命中！+2分";
                    console.log(`%c${pointStr} (总分: ${game.score})`, "color: #00FF00; font-size: 16px; font-weight: bold;");

                    if (game.basketball) game.basketball.visible = false;
                    game.basketballBody.velocity.set(0, 0, 0);
                    game.basketballBody.angularVelocity.set(0, 0, 0);
                    game.basketballBody.collisionResponse = false;

                    game.ballTrail = [];
                    game.effects.updateBallTrail(game);
                    game.effects.playFireEffect(game, game.hoopCenter.clone());
                    game.freezeTimer = game.freezeDuration;
                    game.ui.showDunkBadge(game);

                    if (game.score >= 11) {
                        game.sound.playGameWinner(game);
                        game.slowMotionTimer = 1.0;
                    } else {
                        game.sound.playScore(game);
                    }

                    if (game.state.isPlaying) {
                        setTimeout(() => this.resetBasketball(game), 800);
                    }
                }
            }
        }

        if (!game.prevBallPos) {
            game.prevBallPos = new THREE.Vector3();
        }
        game.prevBallPos.copy(ballPos);
    }

    safetyCheck(game) {
        if (!game.basketballBody || game.ballAttached || game.defenderHoldingBall) return;

        var bx = game.basketballBody.position.x;
        var by = game.basketballBody.position.y;
        var bz = game.basketballBody.position.z;

        // 穿透地板 (极端情况才重置)
        if (by < -5.0) {
            console.warn('[BASKETBALL] 穿透地板，重置到半场');
            game.basketballBody.position.set(0, BALL_RADIUS + 0.3, 7);
            game.basketballBody.velocity.set(0, 0, 0);
            game.basketballBody.angularVelocity.set(0, 0, 0);
            game.basketballBody.collisionResponse = true;
            if (game.basketball) { game.basketball.position.set(0, BALL_RADIUS, 7); game.basketball.visible = true; }
        }

        // 球飞出界外 (XZ 超出球场)
        var maxX = 20, maxZ = 30;
        if (Math.abs(bx) > maxX || Math.abs(bz) > maxZ) {
            console.log('[BASKETBALL] 球出界，重置');
            game.basketballBody.position.set(
                Math.sign(bx) * Math.min(Math.abs(bx), maxX - 1),
                BALL_RADIUS + 0.3,
                Math.sign(bz) * Math.min(Math.abs(bz), maxZ - 1)
            );
            game.basketballBody.velocity.set(0, 0, 0);
            game.basketballBody.angularVelocity.set(0, 0, 0);
            game.basketballBody.collisionResponse = true;
            if (game.basketball) { game.basketball.position.copy(game.basketballBody.position); game.basketball.visible = true; }
        }
    }
}

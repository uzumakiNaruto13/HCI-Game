import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {
    MOVE_SPEED, PLAYER_STEAL_RANGE, DEFENDER_RADIUS,
    DEFENDER_HEIGHT, DEFENDER_HALF_HEIGHT,
    OPPONENT_HOOP_X, OPPONENT_HOOP_Y, OPPONENT_HOOP_Z,
    COLLISION_GROUP_STATIC, COLLISION_GROUP_DYNAMIC
} from './constants.js';

export class Defenders {
    constructor(game) {
        this.game = game;
        game.defenders = [];
        game.defenderHoldingBall = null;
        game.opponentHoop = new THREE.Vector3(OPPONENT_HOOP_X, OPPONENT_HOOP_Y, OPPONENT_HOOP_Z);
        game.playerStealRange = PLAYER_STEAL_RANGE;
        game.exclamationCanvas = document.createElement('canvas');
        game.exclamationCanvas.width = 128; game.exclamationCanvas.height = 128;
        game.exclamationCtx = game.exclamationCanvas.getContext('2d');
        game.exclamationTexture = new THREE.CanvasTexture(game.exclamationCanvas);
        const spriteMat = new THREE.SpriteMaterial({ map: game.exclamationTexture, transparent: true, depthTest: false });
        game.exclamationSprite = new THREE.Sprite(spriteMat);
        game.exclamationSprite.scale.set(1.5, 1.5, 1.5);
        game.exclamationSprite.visible = false;
        game.exclamationRedTimer = 0;
    }

    initTestDefenders(game) { this.addDefender(game, -6, 3); this.addDefender(game, 6, 10); }

    addDefender(game, initialX, initialZ) {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, DEFENDER_HEIGHT, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0xCC0000, roughness: 0.5, metalness: 0.3 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true; mesh.receiveShadow = true;
        mesh.position.set(initialX, DEFENDER_HALF_HEIGHT, initialZ);
        game.scene.add(mesh);
        const body = new CANNON.Body({ mass: 80, type: CANNON.Body.DYNAMIC, fixedRotation: true, allowSleep: false, material: game.defenderMaterial, collisionFilterGroup: COLLISION_GROUP_DYNAMIC, collisionFilterMask: COLLISION_GROUP_STATIC | COLLISION_GROUP_DYNAMIC });
        const shape = new CANNON.Cylinder(DEFENDER_RADIUS, DEFENDER_RADIUS, DEFENDER_HEIGHT, 8);
        const quat = new CANNON.Quaternion(); quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
        body.addShape(shape, new CANNON.Vec3(0, 0, 0), quat);
        body.linearDamping = 0;
        body.position.set(initialX, DEFENDER_HALF_HEIGHT, initialZ);
        game.world.addBody(body);
        const defender = { mesh, body, continuousStealTime: 0, pickupCooldown: 0, stealHistory: [], cooldown: 0, hasBall: false, hasTriggeredWhat: false };
        game.defenders.push(defender);
        return defender;
    }

    updateDefenders(game, delta) {
        if (!game.state.isPlaying) return;
        const now = performance.now();
        const playerPos = game.playerModel ? game.playerModel.position : new THREE.Vector3();
        const ballPos = game.basketballBody.position;
        let maxContinuousPct = 0, maxCumulativePct = 0, triggerRedThisFrame = false;
        if (game.exclamationRedTimer > 0) { game.exclamationRedTimer -= delta; triggerRedThisFrame = true; }
        let activeOffender = null;
        for (const def of game.defenders) { if (def.hasBall) { activeOffender = def; break; } }
        if (activeOffender) {
            for (const def of game.defenders) {
                if (!def.hasBall) {
                    const dx = playerPos.x - def.body.position.x, dz = playerPos.z - def.body.position.z;
                    if (Math.sqrt(dx * dx + dz * dz) <= 1.0 && !def.hasTriggeredWhat) { game.sound.playWhat(game); def.hasTriggeredWhat = true; }
                }
            }
        }
        for (const def of game.defenders) {
            if (def.cooldown > 0) def.cooldown -= delta;
            if (def.pickupCooldown > 0) def.pickupCooldown -= delta;
            if (def.hasBall) { this._handleOffense(game, def, delta); }
            else if (game.ballAttached && def.cooldown <= 0) {
                this._moveDefenderTo(def, playerPos, delta, 0.75);
                const dx = playerPos.x - def.body.position.x, dz = playerPos.z - def.body.position.z;
                const distXZ = Math.sqrt(dx * dx + dz * dz);
                if (distXZ <= 1.0) { def.continuousStealTime += delta; def.stealHistory.push({ time: now, delta }); }
                else { def.continuousStealTime = 0; }
                def.stealHistory = def.stealHistory.filter(item => (now - item.time) <= 5000);
                const accumulatedTime = def.stealHistory.reduce((sum, item) => sum + item.delta, 0);
                const currentContPct = Math.min(1.0, def.continuousStealTime / 1.0);
                const currentCumPct = Math.min(1.0, accumulatedTime / 1.5);
                if (currentContPct > maxContinuousPct) maxContinuousPct = currentContPct;
                if (currentCumPct > maxCumulativePct) maxCumulativePct = currentCumPct;
                if (def.continuousStealTime >= 1.0 || accumulatedTime >= 1.5) { this.handleStealSuccess(game, def); triggerRedThisFrame = true; game.exclamationRedTimer = 0.4; }
            } else if (activeOffender) {
                def.continuousStealTime = 0; def.stealHistory = [];
                const distToOffender = def.body.position.distanceTo(activeOffender.body.position);
                if (distToOffender < 2.0) {
                    const pushX = def.body.position.x - activeOffender.body.position.x, pushZ = def.body.position.z - activeOffender.body.position.z;
                    const pLen = Math.sqrt(pushX * pushX + pushZ * pushZ) || 1;
                    def.body.velocity.x = (pushX / pLen) * MOVE_SPEED * 0.8;
                    def.body.velocity.z = (pushZ / pLen) * MOVE_SPEED * 0.8;
                } else { this._screenAndBlockPlayer(def, playerPos, delta); }
            } else {
                def.continuousStealTime = 0;
                if (!game.ballAttached) def.stealHistory = [];
                this._moveDefenderTo(def, ballPos, delta, 0.85);
                if (def.body.position.distanceTo(ballPos) < 1.0 && !game.defenderHoldingBall && def.pickupCooldown <= 0) { this.defenderPickUpBall(game, def); }
            }
            def.mesh.position.copy(def.body.position);
        }
        if (game.exclamationSprite && game.playerModel) { game.exclamationSprite.position.set(playerPos.x, playerPos.y + 2.2, playerPos.z); game.ui.drawExclamationUI(game, maxContinuousPct, maxCumulativePct, triggerRedThisFrame); }
    }

    _handleOffense(game, def, delta) {
        const dx = game.opponentHoop.x - def.body.position.x, dz = game.opponentHoop.z - def.body.position.z;
        const distXZ = Math.sqrt(dx * dx + dz * dz);
        let avoidX = 0, avoidZ = 0;
        for (const otherDef of game.defenders) {
            if (otherDef !== def) {
                const ox = def.body.position.x - otherDef.body.position.x, oz = def.body.position.z - otherDef.body.position.z;
                const oDist = Math.sqrt(ox * ox + oz * oz);
                if (oDist < 2.5 && oDist > 0.1) { avoidX += (ox / oDist) * (2.5 - oDist) * 1.5; avoidZ += (oz / oDist) * (2.5 - oDist) * 1.5; }
            }
        }
        if (distXZ > 2.0) {
            const baseDirX = dx / distXZ, baseDirZ = dz / distXZ;
            const finalDirX = baseDirX + avoidX, finalDirZ = baseDirZ + avoidZ;
            const fLen = Math.sqrt(finalDirX * finalDirX + finalDirZ * finalDirZ);
            def.body.velocity.x = (finalDirX / fLen) * MOVE_SPEED * 1.2;
            def.body.velocity.z = (finalDirZ / fLen) * MOVE_SPEED * 1.2;
            def.mesh.rotation.y = Math.atan2(finalDirX, finalDirZ);
            def.body.position.y = DEFENDER_HALF_HEIGHT;
        } else { def.body.velocity.x = (dx / distXZ) * 4.0; def.body.velocity.z = (dz / distXZ) * 4.0; def.body.velocity.y = 5.0; }
        const holdOffset = game.ballHoldOffset.clone();
        const defQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), def.mesh.rotation.y);
        holdOffset.applyQuaternion(defQuat);
        game.basketballBody.position.set(def.body.position.x + holdOffset.x, def.body.position.y + holdOffset.y, def.body.position.z + holdOffset.z);
        game.basketballBody.velocity.set(0, 0, 0);
        if (game.basketball) { game.basketball.position.copy(game.basketballBody.position); game.basketball.visible = true; }
        if (distXZ < 0.8 && def.body.position.y > 1.8) { def.body.position.y = DEFENDER_HALF_HEIGHT; def.body.velocity.set(0, 0, 0); this.defenderDunk(game, def); }
    }

    _moveDefenderTo(def, target, delta, speedMultiplier) {
        const dx = target.x - def.body.position.x, dz = target.z - def.body.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.1) { def.body.velocity.x = (dx / dist) * MOVE_SPEED * speedMultiplier; def.body.velocity.z = (dz / dist) * MOVE_SPEED * speedMultiplier; def.mesh.rotation.y = Math.atan2(dx, dz); }
        else { def.body.velocity.set(0, 0, 0); }
    }

    _screenAndBlockPlayer(def, targetPos, delta) {
        const dx = targetPos.x - def.body.position.x, dz = targetPos.z - def.body.position.z;
        const distXZ = Math.sqrt(dx * dx + dz * dz);
        if (distXZ > 0.8) { def.body.velocity.x = (dx / distXZ) * MOVE_SPEED * 0.7; def.body.velocity.z = (dz / distXZ) * MOVE_SPEED * 0.7; def.mesh.rotation.y = Math.atan2(dx, dz); }
        else { def.body.velocity.x = (dx / distXZ) * (MOVE_SPEED * 0.1); def.body.velocity.z = (dz / distXZ) * (MOVE_SPEED * 0.1); def.mesh.rotation.y = Math.atan2(dx, dz); }
        def.body.position.y = DEFENDER_HALF_HEIGHT;
    }

    handleStealSuccess(game, defender) {
        game.basketballHandler.detachBall(game);
        this.defenderPickUpBall(game, defender);
        game.exclamationRedTimer = 0.5; defender.cooldown = 2.0; defender.continuousStealTime = 0; defender.stealHistory = [];
        for (const def of game.defenders) { if (def !== defender && def.cooldown <= 0) def.cooldown = 1.5; }
    }

    defenderPickUpBall(game, def) {
        game.defenders.forEach(d => { d.hasTriggeredWhat = false; });
        if (game.ballAttached) game.basketballHandler.detachBall(game);
        game.ballAttached = false;
        game.defenders.forEach(d => { d.hasBall = false; });
        def.hasBall = true;
        game.defenderHoldingBall = def;
        game.basketballBody.mass = 0;
        game.basketballBody.collisionResponse = false;
        if (game.basketball) game.basketball.visible = true;
        game.ballTrail = []; game.effects.updateBallTrail(game);
    }

    defenderDunk(game, def) {
        game.opponentScore++; game.sceneManager.updateScoreDisplay(game);
        game.effects.playFireEffect(game, game.opponentHoop.clone());
        game.sound.playDefenderDunk(game);
        setTimeout(() => game.sound.playWhat(game), 400);
        if (game.basketball) game.basketball.visible = false;
        if (game.basketballBody) { game.basketballBody.velocity.set(0, 0, 0); game.basketballBody.angularVelocity.set(0, 0, 0); game.basketballBody.collisionResponse = false; }
        game.ballTrail = []; game.effects.updateBallTrail(game);
        def.hasBall = false; game.defenderHoldingBall = null; def.cooldown = 2.0;
        game.defenders.forEach(d => { d.hasTriggeredWhat = false; });
        setTimeout(() => game.basketballHandler.resetBasketball(game), 800);
    }

    performPlayerSteal(game) {
        if (!game.defenderHoldingBall) return false;
        const def = game.defenderHoldingBall;
        if (game.playerModel.position.distanceTo(def.body.position) <= game.playerStealRange) {
            game.sound.triggerCnmAudio(game);
            def.hasBall = false; game.defenderHoldingBall = null;
            game.defenders.forEach(d => { d.hasBall = false; });
            game.ballAttached = true;
            game.basketballBody.mass = 0; game.basketballBody.collisionResponse = false;
            game.basketballBody.velocity.set(0, 0, 0); game.basketballBody.angularVelocity.set(0, 0, 0);
            const handPos = game.player.getHandWorldPos(game);
            game.basketballBody.position.copy(handPos);
            if (game.basketball) { game.basketball.position.copy(handPos); game.basketball.visible = true; }
            const chargeContainer = document.getElementById('charge-bar-container');
            if (chargeContainer) chargeContainer.style.display = 'block';
            def.body.velocity.x -= (game.playerModel.position.x - def.body.position.x) * 2;
            def.cooldown = 1.5;
            game.effects.playLightningEffect(game, game.playerModel.position, def.body.position);
            return true;
        }
        return false;
    }
}

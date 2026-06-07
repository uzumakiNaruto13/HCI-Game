import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {
    PLAYER_DESIRED_HEIGHT, PLAYER_MASS, PLAYER_CYLINDER_RADIUS,
    PLAYER_CYLINDER_HEIGHT, MOVE_SPEED, GRAVITY, JUMP_POWER, GROUND_Y,
    COLLISION_GROUP_STATIC, COLLISION_GROUP_DYNAMIC
} from './constants.js';

export class Player {
    constructor(game) {
        this.game = game;
        game.playerModel = null;
        game.playerShadow = null;
        game.handMarker = null;
        game.handMarkerOutline = null;
        game.mixer = null;
        game.animations = {};
        game.originalPlayerModel = null;
        game.modelHalfHeight = PLAYER_DESIRED_HEIGHT / 2;
        game.playerBody = null;
        game.isJumping = false;
        game.verticalVelocity = 0;
        game.moveSpeed = MOVE_SPEED;
        game.gravity = GRAVITY;
        game.jumpPower = JUMP_POWER;
        game.groundY = GROUND_Y;
        game.state = { isPlaying: false, isModelLoaded: false };
    }

    createHandMarker(game) {
        const outlineGeometry = new THREE.BoxGeometry(0.36, 0.36, 0.36);
        const outlineMaterial = new THREE.MeshToonMaterial({ color: 0x000000 });
        game.handMarkerOutline = new THREE.Mesh(outlineGeometry, outlineMaterial);
        game.handMarkerOutline.visible = false;
        game.scene.add(game.handMarkerOutline);

        const innerGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const innerMaterial = new THREE.MeshToonMaterial({ color: 0xFFFF00 });
        game.handMarker = new THREE.Mesh(innerGeometry, innerMaterial);
        game.handMarker.visible = false;
        game.scene.add(game.handMarker);
    }

    loadPlayerModel(game) {
        // 不加载 3D 模型，创建不可见容器替代角色视觉
        const modelContainer = new THREE.Group();
        modelContainer.position.set(0, 0, 7);

        game.playerModel = modelContainer;
        game.originalPlayerModel = modelContainer;
        game.modelHalfHeight = PLAYER_DESIRED_HEIGHT / 2;
        game.modelFootOffset = 0;

        game.scene.add(modelContainer);
        this.createPlayerShadow(game);
        game.state.isModelLoaded = true;
        game.resetBasketball();
    }

    createPlayerShadow(game) {
        const shadowGeometry = new THREE.BoxGeometry(0.8, 0.03, 0.8);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.5
        });
        game.playerShadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        game.playerShadow.position.set(0, 0.015, 7);
        game.scene.add(game.playerShadow);

        game.playerBody = new CANNON.Body({
            mass: PLAYER_MASS,
            type: CANNON.Body.DYNAMIC,
            fixedRotation: true,
            allowSleep: false,
            material: game.groundMaterial,
            collisionFilterGroup: COLLISION_GROUP_STATIC,
            collisionFilterMask: COLLISION_GROUP_STATIC | COLLISION_GROUP_DYNAMIC
        });

        const cylinder = new CANNON.Cylinder(PLAYER_CYLINDER_RADIUS, PLAYER_CYLINDER_RADIUS, PLAYER_CYLINDER_HEIGHT, 8);
        const quat = new CANNON.Quaternion();
        quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
        game.playerBody.addShape(cylinder, new CANNON.Vec3(0, 0, 0), quat);

        game.playerBody.linearDamping = 0;
        game.playerBody.position.set(0, game.modelHalfHeight, 7);
        game.world.addBody(game.playerBody);
        game.staticBodies.push(game.playerBody);
    }


    updatePlayerShadow(game) {
        if (game.playerModel && game.playerShadow) {
            game.playerShadow.position.x = game.playerModel.position.x;
            game.playerShadow.position.z = game.playerModel.position.z;
        }
    }

    getHandWorldPos(game) {
        if (!game.playerModel || !game.originalPlayerModel) {
            return new THREE.Vector3(0, 1, 7);
        }
        const offset = game.ballHoldOffset.clone();
        const modelQuat = new THREE.Quaternion();
        game.originalPlayerModel.getWorldQuaternion(modelQuat);
        offset.applyQuaternion(modelQuat);
        return game.playerModel.position.clone().add(offset);
    }

    handleMovement(game, delta) {
        if (!game.playerModel || !game.playerBody) return;

        game.playerBody.wakeUp();

        if (!game.isSprinting) {
            let moveX = 0, moveZ = 0;
            if (game.keys.w || game.keys.ArrowUp) moveZ -= 1;
            if (game.keys.s || game.keys.ArrowDown) moveZ += 1;
            if (game.keys.a || game.keys.ArrowLeft) moveX -= 1;
            if (game.keys.d || game.keys.ArrowRight) moveX += 1;

            if (moveX !== 0 || moveZ !== 0) {
                const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
                const nMoveX = moveX / len;
                const nMoveZ = moveZ / len;

                const forward = new THREE.Vector3(-Math.sin(game.cameraAngleY), 0, -Math.cos(game.cameraAngleY));
                const right = new THREE.Vector3(Math.cos(game.cameraAngleY), 0, -Math.sin(game.cameraAngleY));

                const moveDir = new THREE.Vector3(0, 0, 0);
                moveDir.addScaledVector(forward, -nMoveZ);
                moveDir.addScaledVector(right, nMoveX);

                game.playerBody.velocity.x = moveDir.x * game.moveSpeed;
                game.playerBody.velocity.z = moveDir.z * game.moveSpeed;
            } else {
                game.playerBody.velocity.x = 0;
                game.playerBody.velocity.z = 0;
            }
        }

        if (game.isJumping) {
            game.playerBody.velocity.y = game.verticalVelocity;
        } else {
            game.playerBody.velocity.y = -0.01;
        }
    }

    updateJump(game, delta) {
        if (!game.playerModel || !game.playerBody) return;

        const dt = Math.min(delta, 0.1);
        if (game.isJumping) {
            game.verticalVelocity -= game.gravity * dt;
            game.playerBody.velocity.y = game.verticalVelocity;
            if (game.playerBody.position.y - game.modelHalfHeight <= game.groundY) {
                game.playerBody.position.y = game.modelHalfHeight + game.groundY;
                game.verticalVelocity = 0;
                game.isJumping = false;
                game.playerBody.velocity.y = 0;
            }
        } else {
            game.playerBody.position.y = game.modelHalfHeight + game.groundY;
        }

        game.playerModel.position.copy(game.playerBody.position);
        game.playerModel.rotation.y = game.cameraAngleY + Math.PI;
        this.updatePlayerShadow(game);
    }

    syncBallToHand(game) {
        if (game.ballAttached && game.basketballBody && game.basketball) {
            const handPos = this.getHandWorldPos(game);
            game.basketballBody.position.set(handPos.x, handPos.y, handPos.z);
            game.basketballBody.velocity.set(0, 0, 0);
            game.basketballBody.angularVelocity.set(0, 0, 0);
            game.basketball.position.copy(handPos);
            game.basketball.quaternion.copy(game.basketballBody.quaternion);
        }
    }

    syncModelWhenPaused(game) {
        if (game.playerModel && game.playerBody) {
            game.playerBody.position.y = game.modelHalfHeight + game.groundY;
            game.playerModel.position.copy(game.playerBody.position);
            game.playerModel.rotation.y = game.cameraAngleY + Math.PI;
            this.updatePlayerShadow(game);
        }
    }
}

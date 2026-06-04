import * as THREE from 'three';
import {
    CAMERA_DISTANCE, CAMERA_HEIGHT,
    CAMERA_ANGLE_Y_INIT, CAMERA_ANGLE_X_INIT
} from './constants.js';

export class CameraController {
    constructor(game) {
        this.game = game;
        game.cameraTarget = new THREE.Vector3();
        game.cameraDistance = CAMERA_DISTANCE;
        game.cameraHeight = CAMERA_HEIGHT;
        game.cameraAngleY = CAMERA_ANGLE_Y_INIT;
        game.cameraAngleX = CAMERA_ANGLE_X_INIT;
    }

    update(game) {
        const cameraOffset = new THREE.Vector3(
            Math.sin(game.cameraAngleY) * game.cameraDistance,
            game.cameraHeight + Math.sin(game.cameraAngleX) * 3,
            Math.cos(game.cameraAngleY) * game.cameraDistance
        );

        if (game.playerModel) {
            game.cameraTarget.copy(game.playerModel.position);
        }
        game.camera.position.copy(game.cameraTarget).add(cameraOffset);
        game.camera.lookAt(game.cameraTarget.x, game.cameraTarget.y + 1, game.cameraTarget.z);
    }

    triggerScreenShake(game) {
        let shakeTime = 0.3;
        const interval = setInterval(() => {
            shakeTime -= 0.05;
            if (shakeTime <= 0) {
                clearInterval(interval);
            } else {
                game.cameraTarget.x += (Math.random() - 0.5) * 0.3;
                game.cameraTarget.y += (Math.random() - 0.5) * 0.3;
            }
        }, 50);
    }
}

import * as THREE from 'three';

export class EffectsManager {
    constructor(game) {
        this.game = game;
        game.particles = [];
        game.lightningEffects = [];
        game.ballTrail = [];
        game.ballTrailMax = 100;
        game.ballTrailLine = null;
        game.slowMotionTimer = 0;
        game.freezeTimer = 0;
        game.freezeDuration = 0.2;
    }

    createBallTrail(game) {
        const positions = new Float32Array(game.ballTrailMax * 3);
        const trailGeometry = new THREE.BufferGeometry();
        trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0xff6600,
            linewidth: 1,
            transparent: true,
            opacity: 0.7
        });
        game.ballTrailLine = new THREE.Line(trailGeometry, trailMaterial);
        game.ballTrailLine.visible = false;
        game.scene.add(game.ballTrailLine);
    }

    playFireEffect(game, position) {
        const particleCount = 25;
        const colors = [0xFF0000, 0xFF6600, 0xFFFF00];

        for (let i = 0; i < particleCount; i++) {
            const size = 0.15 + Math.random() * 0.15;
            if (!game._sharedFireGeo) {
                game._sharedFireGeo = new THREE.BoxGeometry(1, 1, 1);
            }
            const geometry = game._sharedFireGeo;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const material = new THREE.MeshBasicMaterial({ color: color });
            const particle = new THREE.Mesh(geometry, material);
            particle.scale.set(size, size, size);
            particle.position.copy(position);
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.2 + 0.1,
                (Math.random() - 0.5) * 0.3
            );
            particle.userData.life = 1.0;
            particle.userData.decay = 0.02 + Math.random() * 0.01;

            game.particles.push(particle);
            game.scene.add(particle);
        }
    }

    playLightningEffect(game, from, to) {
        const segments = 8;
        const points = [];
        points.push(new THREE.Vector3(from.x, from.y, from.z));

        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const baseX = from.x + (to.x - from.x) * t;
            const baseY = from.y + (to.y - from.y) * t;
            const baseZ = from.z + (to.z - from.z) * t;
            const offset = (i === segments - 1) ? 0 : 0.3;
            points.push(new THREE.Vector3(
                baseX + (Math.random() - 0.5) * offset,
                baseY + (Math.random() - 0.5) * offset,
                baseZ + (Math.random() - 0.5) * offset
            ));
        }
        points.push(new THREE.Vector3(to.x, to.y, to.z));

        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i + 1];
            const length = start.distanceTo(end);
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            const midZ = (start.z + end.z) / 2;
            const segmentAngle = Math.atan2(end.z - start.z, end.x - start.x);

            const geometry = new THREE.BoxGeometry(length, 0.08, 0.08);
            const material = new THREE.MeshBasicMaterial({ color: 0x00FFFF });
            const segment = new THREE.Mesh(geometry, material);
            segment.position.set(midX, midY, midZ);
            segment.rotation.y = -segmentAngle;
            segment.userData.life = 1.0;
            segment.userData.decay = 0.05;

            game.lightningEffects.push(segment);
            game.scene.add(segment);
        }
    }

    updateParticles(game) {
        for (let i = game.particles.length - 1; i >= 0; i--) {
            const particle = game.particles[i];
            particle.position.add(particle.userData.velocity);
            particle.userData.velocity.y -= 0.005;
            particle.userData.life -= particle.userData.decay;
            particle.material.opacity = particle.userData.life;
            particle.material.transparent = true;

            if (particle.userData.life <= 0) {
                game.scene.remove(particle);
                if (particle.geometry !== game._sharedFireGeo) {
                    particle.geometry.dispose();
                }
                particle.material.dispose();
                game.particles.splice(i, 1);
            }
        }

        for (let i = game.lightningEffects.length - 1; i >= 0; i--) {
            const lightning = game.lightningEffects[i];
            lightning.userData.life -= lightning.userData.decay;
            lightning.material.opacity = lightning.userData.life;
            lightning.material.transparent = true;

            if (lightning.userData.life <= 0) {
                game.scene.remove(lightning);
                lightning.geometry.dispose();
                lightning.material.dispose();
                game.lightningEffects.splice(i, 1);
            }
        }
    }

    updateBallTrail(game) {
        if (!game.ballTrailLine) return;
        const points = game.ballTrail;
        if (points.length < 2) {
            game.ballTrailLine.visible = false;
            return;
        }

        const posAttr = game.ballTrailLine.geometry.attributes.position;
        const arr = posAttr.array;
        const len = Math.min(points.length, game.ballTrailMax);
        for (let i = 0; i < len; i++) {
            arr[i * 3] = points[i].x;
            arr[i * 3 + 1] = points[i].y;
            arr[i * 3 + 2] = points[i].z;
        }
        posAttr.needsUpdate = true;
        game.ballTrailLine.geometry.setDrawRange(0, len);
        game.ballTrailLine.visible = true;
    }

    updateSlowMotion(game, delta) {
        let slowMotionFactor = 1.0;
        if (game.slowMotionTimer > 0) {
            game.slowMotionTimer -= delta;
            slowMotionFactor = 0.2;
            delta *= slowMotionFactor;
            if (game.bloomPass) {
                game.bloomPass.strength = 0.3;
                game.bloomPass.threshold = 0.6;
                game.bloomPass.radius = 0.2;
            }
            if (game.rgbShiftPass) {
                game.rgbShiftPass.uniforms['amount'].value = 0.01;
            }
        } else {
            if (game.bloomPass) {
                game.bloomPass.strength = 0.3;
                game.bloomPass.threshold = 0.6;
                game.bloomPass.radius = 0.2;
            }
            if (game.rgbShiftPass) {
                game.rgbShiftPass.uniforms['amount'].value = 0.0;
            }
        }
        return delta;
    }

    updateBallTrailPoints(game) {
        if (game.basketballBody && game.basketball) {
            const pos = new THREE.Vector3(
                game.basketballBody.position.x,
                game.basketballBody.position.y,
                game.basketballBody.position.z
            );
            game.ballTrail.push(pos);
            if (game.ballTrail.length > game.ballTrailMax) {
                game.ballTrail.shift();
            }
            this.updateBallTrail(game);
        }
    }
}

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { COURT_WIDTH, COURT_LENGTH } from './constants.js';

export class SceneManager {
    constructor(game) {
        this.game = game;
        game.scene = null; game.camera = null; game.renderer = null;
        game.composer = null; game.bloomPass = null; game.rgbShiftPass = null;
        game.sceneLights = []; game.lightsEnabled = true;
    }

    createScene(game) { game.scene = new THREE.Scene(); game.scene.background = new THREE.Color(0x2a2a4e); }

    createCamera(game) {
        game.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        game.camera.position.set(0, 5, 15); game.camera.lookAt(0, 2, 7);
    }

    createRenderer(game) {
        game.renderer = new THREE.WebGLRenderer({ antialias: false });
        game.renderer.setSize(window.innerWidth, window.innerHeight);
        game.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        game.renderer.shadowMap.enabled = false;
        const container = document.querySelector('#screen-game-hoop .game-area') || document.getElementById('game-container') || document.body;
        container.appendChild(game.renderer.domElement);
    }

    createLights(game) {
        const ambientLight = new THREE.AmbientLight(0x888899, 0.6); game.scene.add(ambientLight); game.sceneLights.push(ambientLight);
        const hemisphereLight = new THREE.HemisphereLight(0x7799DD, 0x334466, 0.4); hemisphereLight.position.set(0, 10, 0); game.scene.add(hemisphereLight); game.sceneLights.push(hemisphereLight);
        const directionalLight = new THREE.DirectionalLight(0xEEEEEE, 0.6); directionalLight.position.set(10, 15, 5); game.scene.add(directionalLight); game.sceneLights.push(directionalLight);
        const mainSpotLight = new THREE.SpotLight(0xfff8ee, 2, 30, Math.PI / 5, 0.25, 0.5); mainSpotLight.position.set(0, 18, -3); game.scene.add(mainSpotLight); game.sceneLights.push(mainSpotLight);
        const hoopSpotLight = new THREE.SpotLight(0xffffff, 1.5, 25, Math.PI / 6, 0.15, 0.4); hoopSpotLight.position.set(0, 15, 5.35 + game.hoopZOffset - 2); game.scene.add(hoopSpotLight); game.sceneLights.push(hoopSpotLight);
        const playerSpotLight = new THREE.SpotLight(0xfff8ee, 1.5, 25, Math.PI / 6, 0.15, 0.4); playerSpotLight.position.set(0, 15, 5); game.scene.add(playerSpotLight); game.sceneLights.push(playerSpotLight);
        for (let i = 0; i < 6; i++) { const angle = (i / 6) * Math.PI * 2, radius = 12; const pointLight = new THREE.PointLight(0xfff0dd, 0.3, 20); pointLight.position.set(radius * Math.cos(angle), 16, radius * Math.sin(angle)); game.scene.add(pointLight); game.sceneLights.push(pointLight); }
        const naturalFillLight = new THREE.HemisphereLight(0xfff0dd, 0x445566, 0.3); game.scene.add(naturalFillLight); game.sceneLights.push(naturalFillLight);
    }

    createArenaLights(game) {
        const lightGroup = new THREE.Group();
        const lightModelGeo = new THREE.BoxGeometry(0.8, 0.4, 0.4), lightModelMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff5e6, emissiveIntensity: 5 });
        const boundsX = 29.5, boundsZ = 19.5, spacing = 10;
        const addLightAt = (x, z, angle) => {
            const fixture = new THREE.Mesh(lightModelGeo, lightModelMaterial); fixture.position.set(x, 14.5, z); fixture.rotation.y = angle; lightGroup.add(fixture);
            const spotLight = new THREE.SpotLight(0xfff0dd, 2, 70, Math.PI / 3, 0.5, 0.8); spotLight.position.set(x, 14.4, z); spotLight.target.position.set(x * 0.6, 0, z * 0.6); game.scene.add(spotLight); game.scene.add(spotLight.target); game.sceneLights.push(spotLight); game.sceneLights.push(fixture);
        };
        for (let x = -boundsX + 5; x <= boundsX - 5; x += spacing) { addLightAt(x, -boundsZ, 0); addLightAt(x, boundsZ, Math.PI); }
        for (let z = -boundsZ + 5; z <= boundsZ - 5; z += spacing) { addLightAt(-boundsX, z, Math.PI / 2); addLightAt(boundsX, z, -Math.PI / 2); }
        game.scene.add(lightGroup);
    }

    toggleLights(game) { game.lightsEnabled = !game.lightsEnabled; game.sceneLights.forEach(light => { light.visible = game.lightsEnabled; }); }

    createGround(game) {
        const groundGeometry = new THREE.PlaneGeometry(COURT_WIDTH, COURT_LENGTH);
        const textureLoader = new THREE.TextureLoader();
        const courtTexture = textureLoader.load('games/hoop/models/QQ_1778144395641.png');
        courtTexture.wrapS = THREE.RepeatWrapping; courtTexture.wrapT = THREE.RepeatWrapping; courtTexture.repeat.set(8, 12);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, map: courtTexture, roughness: 0.8, metalness: 0.1 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; game.scene.add(ground);
    }

    createCourtLines(game) {
        const lineWidth = 0.06, lineThickness = 0.01, lineY = 0.01, lineColor = 0xFFFFFF;
        this._createLine(game, 0, lineY, 0, 40, lineWidth, lineThickness, 'z', lineColor);
        const drawHalfCourtLines = (side) => {
            const hoopZ = 18.65 * side, baseZ = 20.0 * side, dir = -side;
            this._createLine(game, 0, lineY, baseZ, 40, lineWidth, lineThickness, 'x', lineColor);
            const freeThrowZ = baseZ + 5.8 * dir;
            this._createLine(game, -2.45, lineY, baseZ + 2.9 * dir, lineWidth, 5.8, lineThickness, 'z', lineColor);
            this._createLine(game, 2.45, lineY, baseZ + 2.9 * dir, lineWidth, 5.8, lineThickness, 'z', lineColor);
            this._createLine(game, 0, lineY, freeThrowZ, 4.9, lineWidth, lineThickness, 'x', lineColor);
            const arcRadius = 6.75, segments = 24, startAngle = -Math.PI / 2 + 0.3, endAngle = Math.PI / 2 - 0.3;
            for (let i = 0; i < segments; i++) {
                const t1 = i / segments, t2 = (i + 1) / segments;
                const a1 = startAngle + (endAngle - startAngle) * t1, a2 = startAngle + (endAngle - startAngle) * t2;
                const x1 = arcRadius * Math.sin(a1), z1 = hoopZ + arcRadius * Math.cos(a1) * dir;
                const x2 = arcRadius * Math.sin(a2), z2 = hoopZ + arcRadius * Math.cos(a2) * dir;
                const length = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2), midX = (x1 + x2) / 2, midZ = (z1 + z2) / 2, angle = Math.atan2(z2 - z1, x2 - x1);
                const geo = new THREE.BoxGeometry(length, lineThickness, lineWidth), mat = new THREE.MeshStandardMaterial({ color: lineColor, roughness: 0.3 });
                const mesh = new THREE.Mesh(geo, mat); mesh.position.set(midX, lineY, midZ); mesh.rotation.y = -angle; mesh.receiveShadow = true; game.scene.add(mesh);
            }
            const straightLen = Math.abs(baseZ - (hoopZ + arcRadius * Math.cos(startAngle) * dir)), straightMidZ = baseZ + (straightLen / 2) * dir, sideX = arcRadius * Math.sin(endAngle);
            this._createLine(game, -sideX, lineY, straightMidZ, lineWidth, straightLen, lineThickness, 'z', lineColor);
            this._createLine(game, sideX, lineY, straightMidZ, lineWidth, straightLen, lineThickness, 'z', lineColor);
        };
        drawHalfCourtLines(-1); drawHalfCourtLines(1);
    }

    _createLine(game, x, y, z, width, height, thickness, axis, color) {
        const geometry = new THREE.BoxGeometry(width, thickness, height);
        const material = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.1, emissive: color, emissiveIntensity: 0.2 });
        const line = new THREE.Mesh(geometry, material); line.position.set(x, y, z); line.receiveShadow = true; game.scene.add(line);
    }

    createBoundaryWalls(game) {
        const wallHeight = 10;
        const configs = [
            { pos: { x: -20.5, y: wallHeight / 2, z: 0 }, size: { x: 0.1, y: wallHeight, z: 61 } },
            { pos: { x: 20.5, y: wallHeight / 2, z: 0 }, size: { x: 0.1, y: wallHeight, z: 61 } },
            { pos: { x: 0, y: wallHeight / 2, z: -30.5 }, size: { x: 41, y: wallHeight, z: 0.1 } },
            { pos: { x: 0, y: wallHeight / 2, z: 30.5 }, size: { x: 41, y: wallHeight, z: 0.1 } }
        ];
        configs.forEach(c => { const b = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(c.size.x / 2, c.size.y / 2, c.size.z / 2)), material: game.groundMaterial }); b.position.set(c.pos.x, c.pos.y, c.pos.z); game.world.addBody(b); });
    }

    setupPostProcessing(game) {
        game.composer = new EffectComposer(game.renderer);
        game.composer.addPass(new RenderPass(game.scene, game.camera));
        game.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 0.6, 0.2);
        game.composer.addPass(game.bloomPass);
        game.rgbShiftPass = new ShaderPass(RGBShiftShader); game.rgbShiftPass.uniforms['amount'].value = 0.0; game.rgbShiftPass.renderToScreen = true;
        game.composer.addPass(game.rgbShiftPass);
    }

    createScoreboard(game) {
        game.scoreGroups = [];
        game.scoreCanvas = document.createElement('canvas'); game.scoreCanvas.width = 512; game.scoreCanvas.height = 128;
        game.scoreCtx = game.scoreCanvas.getContext('2d');
        const scoreTexture = new THREE.CanvasTexture(game.scoreCanvas);
        const buildBoard = (x, z, rotationY) => {
            const group = new THREE.Group();
            const screenGeo = new THREE.PlaneGeometry(15.4, 3.85), screenMat = new THREE.MeshBasicMaterial({ map: scoreTexture });
            group.add(new THREE.Mesh(screenGeo, screenMat));
            const frameGeo = new THREE.BoxGeometry(16, 4.2, 0.5), frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
            const frame = new THREE.Mesh(frameGeo, frameMat); frame.position.z = -0.3; group.add(frame);
            const standGeo = new THREE.CylinderGeometry(0.2, 0.2, 6, 8), standMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
            const stand = new THREE.Mesh(standGeo, standMat); stand.position.set(0, -4, -0.3); group.add(stand);
            group.position.set(x, 6, z); group.rotation.y = rotationY; game.scene.add(group); game.scoreGroups.push(group);
        };
        buildBoard(20, 1.0, -Math.PI / 2); buildBoard(-20, 1.0, Math.PI / 2);
    }

    drawScoreOnCanvas(game, homeScore, awayScore) {
        if (!game.scoreCtx) return;
        const ctx = game.scoreCtx, w = game.scoreCanvas.width, h = game.scoreCanvas.height;
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, w, h);
        ctx.font = 'bold 80px "Arial Black", "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#ff3333'; ctx.textAlign = 'center'; ctx.fillText(homeScore, w * 0.25, h * 0.72);
        ctx.fillStyle = '#ffffff'; ctx.fillText(awayScore, w * 0.75, h * 0.72);
        ctx.fillStyle = '#555555'; ctx.fillRect(w * 0.5 - 2, h * 0.1, 4, h * 0.8);
        if (game.scoreGroups) game.scoreGroups.forEach(group => { const sm = group.children[0]; if (sm && sm.material.map) sm.material.map.needsUpdate = true; });
    }

    updateScoreDisplay(game) { this.drawScoreOnCanvas(game, game.score.toString().padStart(2, '0'), game.opponentScore.toString().padStart(2, '0')); }

    setupWindowResize(game) {
        window.addEventListener('resize', () => { game.camera.aspect = window.innerWidth / window.innerHeight; game.camera.updateProjectionMatrix(); game.renderer.setSize(window.innerWidth, window.innerHeight); });
    }
}

import * as CANNON from 'cannon-es';
import {
    GRAVITY, BALL_RADIUS, BALL_MASS,
    COLLISION_GROUP_STATIC, COLLISION_GROUP_DYNAMIC,
    COURT_WIDTH, COURT_LENGTH
} from './constants.js';

export class PhysicsWorld {
    constructor(game) {
        this.game = game;
        game.world = new CANNON.World();
        game.world.gravity.set(0, -GRAVITY, 0);
        game.world.solver.iterations = 20;
        game.world.solver.tolerance = 0.001;
        game.physicsTimeStep = 1 / 240;
        game.physicsBodies = [];
        game.staticBodies = [];

        game.ballMaterial = new CANNON.Material('ball');
        game.groundMaterial = new CANNON.Material('ground');
        game.hoopMaterial = new CANNON.Material('hoop');
        game.backboardMaterial = new CANNON.Material('backboard');
        game.defenderMaterial = new CANNON.Material('defender');

        const ballGroundContact = new CANNON.ContactMaterial(game.ballMaterial, game.groundMaterial, {
            friction: 0.8,
            restitution: 0.7,
            contactEquationStiffness: 1e8
        });
        game.world.addContactMaterial(ballGroundContact);

        const playerGroundContact = new CANNON.ContactMaterial(game.groundMaterial, game.groundMaterial, {
            friction: 0,
            restitution: 0
        });
        game.world.addContactMaterial(playerGroundContact);

        const defenderGroundContact = new CANNON.ContactMaterial(game.defenderMaterial, game.groundMaterial, {
            friction: 0,
            restitution: 0
        });
        game.world.addContactMaterial(defenderGroundContact);

        const defenderSelfContact = new CANNON.ContactMaterial(game.defenderMaterial, game.defenderMaterial, {
            friction: 0.3,
            restitution: 0,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3
        });
        game.world.addContactMaterial(defenderSelfContact);
    }

    createGroundBody(game) {
        const groundBody = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(COURT_WIDTH / 2, 0.25, COURT_LENGTH / 2)),
            material: game.groundMaterial,
            collisionFilterGroup: COLLISION_GROUP_STATIC
        });
        groundBody.position.set(0, -0.25, 0);
        game.world.addBody(groundBody);
    }

    createBoundaryWallBodies(game) {
        const wallHeight = 10;
        const bounds = { minX: -20, maxX: 20, minZ: -30, maxZ: 30 };

        const wallConfigs = [
            { pos: { x: bounds.minX - 0.5, y: wallHeight / 2, z: 0 }, size: { x: 0.1, y: wallHeight, z: 61 } },
            { pos: { x: bounds.maxX + 0.5, y: wallHeight / 2, z: 0 }, size: { x: 0.1, y: wallHeight, z: 61 } },
            { pos: { x: 0, y: wallHeight / 2, z: bounds.minZ - 0.5 }, size: { x: 41, y: wallHeight, z: 0.1 } },
            { pos: { x: 0, y: wallHeight / 2, z: bounds.maxZ + 0.5 }, size: { x: 41, y: wallHeight, z: 0.1 } }
        ];

        wallConfigs.forEach(config => {
            const wallBody = new CANNON.Body({
                mass: 0,
                shape: new CANNON.Box(new CANNON.Vec3(config.size.x / 2, config.size.y / 2, config.size.z / 2)),
                material: game.groundMaterial
            });
            wallBody.position.set(config.pos.x, config.pos.y, config.pos.z);
            game.world.addBody(wallBody);
        });
    }

    addHoopContactMaterials(game) {
        const ballBackboardContact = new CANNON.ContactMaterial(game.ballMaterial, game.backboardMaterial, {
            friction: 0.5, restitution: 0.6
        });
        game.world.addContactMaterial(ballBackboardContact);

        const ballRimContact = new CANNON.ContactMaterial(game.ballMaterial, game.hoopMaterial, {
            friction: 0.4, restitution: 0.5
        });
        game.world.addContactMaterial(ballRimContact);
    }

    step(game, unscaledDelta) {
        const maxSubSteps = 10;
        const fixedTimeStep = 1 / 240;
        game.world.step(fixedTimeStep, Math.min(unscaledDelta, 0.1), maxSubSteps);
    }

    syncPhysicsBodies(game) {
        for (const pb of game.physicsBodies) {
            if (pb.mesh && pb.body) {
                pb.mesh.position.copy(pb.body.position);
                pb.mesh.quaternion.copy(pb.body.quaternion);
            }
        }
    }
}

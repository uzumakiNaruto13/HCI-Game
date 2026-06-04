import * as CANNON from 'cannon-es';

export const MOVE_SPEED = 5.0;
export const GRAVITY = 9.82;
export const JUMP_POWER = 6.0;
export const GROUND_Y = 0;

export const FIXED_SHOT_HEIGHT = 5.5;
export const SHOT_ANGLE = 45 * Math.PI / 180;
export const V_MIN = 4.75;
export const V_MAX = 15.90;
export const MIN_CHARGE = 1.0;
export const CHARGE_TIME_FULL = 1.5;
export const MAX_CHARGE = V_MAX / V_MIN;

export const PICKUP_DISTANCE = 1.5;
export const BALL_HOLD_OFFSET_X = -0.25;
export const BALL_HOLD_OFFSET_Y = 0.8;
export const BALL_HOLD_OFFSET_Z = 0.6;

export const HOOP_Z_OFFSET = -14.65;
export const HOOP_CENTER_X = 0;
export const HOOP_CENTER_Y = 3.05;
export const HOOP_CENTER_Z = -18.65;
export const HOOP_RADIUS = 0.35;
export const HOOP_HEIGHT_THRESHOLD = 2.9;

export const OPPONENT_HOOP_X = 0;
export const OPPONENT_HOOP_Y = 3.05;
export const OPPONENT_HOOP_Z = 18.65;

export const CAMERA_DISTANCE = 8;
export const CAMERA_HEIGHT = 3;
export const CAMERA_ANGLE_Y_INIT = 0;
export const CAMERA_ANGLE_X_INIT = 0.3;

export const SPRINT_DURATION = 0.2;
export const SPRINT_COOLDOWN = 2.0;
export const SPRINT_SPEED = 30;

export const PLAYER_STEAL_RANGE = 1.5;
export const FREEZE_DURATION = 0.2;

export const BALL_RADIUS = 0.24;
export const BALL_MASS = 0.8;
export const PLAYER_MASS = 80;
export const PLAYER_CYLINDER_RADIUS = 0.4;
export const PLAYER_CYLINDER_HEIGHT = 1.5;
export const PLAYER_DESIRED_HEIGHT = 1.8;

export const COURT_WIDTH = 40;
export const COURT_LENGTH = 60;

export const COLLISION_GROUP_STATIC = 1;
export const COLLISION_GROUP_DYNAMIC = 2;

export const DEFENDER_RADIUS = 0.7;
export const DEFENDER_HEIGHT = 1.8;
export const DEFENDER_HALF_HEIGHT = 0.9;

import Phaser from 'phaser';

export interface ISteeringAgent {
    position: Phaser.Math.Vector2;
    velocity: Phaser.Math.Vector2;
    maxSpeed: number;
    maxForce: number;
    mass: number;
}

export interface ISteeringTarget {
    position: Phaser.Math.Vector2;
    velocity?: Phaser.Math.Vector2;
}

export const SteeringState = {
    IDLE: 'IDLE',
    SEEK: 'SEEK',
    FLEE: 'FLEE',
    ARRIVE: 'ARRIVE',
    WANDER: 'WANDER',
    ORBIT: 'ORBIT'
} as const;

export type SteeringState = typeof SteeringState[keyof typeof SteeringState];

export interface SteeringConfig {
    arrivalThreshold: number;
    wanderDistance: number;
    wanderRadius: number;
    wanderJitter: number;
    seekOffset: number;
}

import Phaser from 'phaser';
import type { ISteeringAgent } from '../types/steering';
import { SteeringManager } from '../systems/SteeringManager';
import type { UnitStats } from '../types/unitTypes';
import { UNIT_CLASSES } from '../types/unitTypes';

import { Nebula } from './Nebula';

export class Unit extends Phaser.GameObjects.Sprite implements ISteeringAgent {
    public team: 'PLAYER' | 'ENEMY';
    public velocity: Phaser.Math.Vector2;
    public maxSpeed: number;
    public maxForce: number;
    public mass: number;
    public hp: number;
    public stats: UnitStats;
    
    protected steeringManager: SteeringManager;
    protected wanderTarget: Phaser.Math.Vector2;

    constructor(scene: Phaser.Scene, x: number, y: number, team: 'PLAYER' | 'ENEMY', className: string = 'FIGHTER') {
        super(scene, x, y, 'ship');
        scene.add.existing(this);
        this.setDepth(5); // Units on top of background
        
        this.team = team;
        this.stats = UNIT_CLASSES[className] || UNIT_CLASSES.FIGHTER;
        this.maxSpeed = this.stats.maxSpeed;
        this.maxForce = this.stats.maxForce;
        this.mass = this.stats.mass;
        this.hp = this.stats.hp;
        this.setTint(this.stats.color);
        
        this.velocity = new Phaser.Math.Vector2(Math.random() - 0.5, Math.random() - 0.5);
        this.steeringManager = new SteeringManager();
        this.wanderTarget = new Phaser.Math.Vector2(Math.random() - 0.5, Math.random() - 0.5).normalize();
    }

    public get position(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.x, this.y);
    }

    public updateUnit(delta: number, neighbors: Unit[], nebulas: Nebula[], targetPos?: Phaser.Math.Vector2) {
        let totalSteering = new Phaser.Math.Vector2(0, 0);

        // Check for nebula slowdown
        let currentMaxSpeed = this.maxSpeed;
        for (const nebula of nebulas) {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, nebula.x, nebula.y);
            if (dist < nebula.displayWidth / 2) {
                currentMaxSpeed *= nebula.slowFactor;
                break;
            }
        }

        // 1. Separation (High priority)
        const sep = this.steeringManager.separate(this, neighbors, 25).scale(1.5);
        totalSteering.add(sep);

        // 2. Cohesion & Alignment (Group flow)
        if (neighbors.length > 0) {
            const coh = this.steeringManager.cohesion(this, neighbors, 50).scale(0.5);
            const ali = this.steeringManager.align(this, neighbors, 50).scale(0.5);
            totalSteering.add(coh);
            totalSteering.add(ali);
        }

        // 3. Movement Goal
        if (targetPos) {
            const seek = this.steeringManager.seek(this, targetPos, 10).scale(1.0);
            totalSteering.add(seek);
        } else {
            const wander = this.steeringManager.wander(this, this.wanderTarget).scale(0.2);
            totalSteering.add(wander);
        }

        // Apply Steering
        totalSteering.limit(this.maxForce);
        totalSteering.divide(new Phaser.Math.Vector2(this.mass, this.mass));
        
        // Use a lerp or smoother addition for velocity to reduce jitter
        const targetVelocity = this.velocity.clone().add(totalSteering);
        this.velocity.lerp(targetVelocity, 0.1); 
        this.velocity.limit(currentMaxSpeed);

        this.x += this.velocity.x * (delta / 16.6);
        this.y += this.velocity.y * (delta / 16.6);

        // Update rotation based on velocity
        if (this.velocity.length() > 0.1) {
            this.rotation = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;
        }
    }
}

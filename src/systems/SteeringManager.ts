import Phaser from 'phaser';
import type { ISteeringAgent, SteeringConfig } from '../types/steering';

export class SteeringManager {
    private config: SteeringConfig = {
        arrivalThreshold: 100,
        wanderDistance: 50,
        wanderRadius: 20,
        wanderJitter: 5,
        seekOffset: 200
    };

    /**
     * SEEK: Steer towards a target position
     */
    public seek(agent: ISteeringAgent, target: Phaser.Math.Vector2, jitter: number = 0): Phaser.Math.Vector2 {
        const desired = target.clone();
        
        if (jitter > 0) {
            desired.x += (Math.random() - 0.5) * jitter;
            desired.y += (Math.random() - 0.5) * jitter;
        }

        desired.subtract(agent.position).normalize().scale(agent.maxSpeed);
        return desired.subtract(agent.velocity);
    }

    /**
     * FLEE: Steer away from a target position
     */
    public flee(agent: ISteeringAgent, target: Phaser.Math.Vector2): Phaser.Math.Vector2 {
        const desired = agent.position.clone().subtract(target).normalize().scale(agent.maxSpeed);
        return desired.subtract(agent.velocity);
    }

    /**
     * ARRIVAL: Steer towards a target and slow down as you get closer
     */
    public arrive(agent: ISteeringAgent, target: Phaser.Math.Vector2): Phaser.Math.Vector2 {
        const desired = target.clone().subtract(agent.position);
        const distance = desired.length();

        if (distance < this.config.arrivalThreshold) {
            desired.normalize().scale(agent.maxSpeed * (distance / this.config.arrivalThreshold));
        } else {
            desired.normalize().scale(agent.maxSpeed);
        }

        return desired.subtract(agent.velocity);
    }

    /**
     * WANDER: Random movement that maintains a heading
     */
    public wander(agent: ISteeringAgent, wanderTarget: Phaser.Math.Vector2): Phaser.Math.Vector2 {
        // Add jitter to wander target
        wanderTarget.x += (Math.random() - 0.5) * this.config.wanderJitter;
        wanderTarget.y += (Math.random() - 0.5) * this.config.wanderJitter;
        wanderTarget.normalize().scale(this.config.wanderRadius);

        // Project ahead of agent
        const projectPos = agent.velocity.clone().normalize().scale(this.config.wanderDistance);
        const targetWorld = agent.position.clone().add(projectPos).add(wanderTarget);

        return this.seek(agent, targetWorld);
    }

    /**
     * SEPARATION: Avoid crowding local flockmates
     */
    public separate(agent: ISteeringAgent, neighbors: ISteeringAgent[], radius: number = 30): Phaser.Math.Vector2 {
        const steering = new Phaser.Math.Vector2(0, 0);
        let count = 0;

        for (const other of neighbors) {
            const d = agent.position.distance(other.position);
            if (d > 0 && d < radius) {
                const diff = agent.position.clone().subtract(other.position).normalize().divide(new Phaser.Math.Vector2(d, d));
                steering.add(diff);
                count++;
            }
        }

        if (count > 0) {
            steering.divide(new Phaser.Math.Vector2(count, count));
        }

        if (steering.length() > 0) {
            steering.normalize().scale(agent.maxSpeed).subtract(agent.velocity);
        }

        return steering;
    }

    /**
     * ALIGNMENT: Steer towards the average heading of local flockmates
     */
    public align(agent: ISteeringAgent, neighbors: ISteeringAgent[], radius: number = 50): Phaser.Math.Vector2 {
        const sum = new Phaser.Math.Vector2(0, 0);
        let count = 0;

        for (const other of neighbors) {
            const d = agent.position.distance(other.position);
            if (d > 0 && d < radius) {
                sum.add(other.velocity);
                count++;
            }
        }

        if (count > 0) {
            sum.divide(new Phaser.Math.Vector2(count, count)).normalize().scale(agent.maxSpeed);
            const steer = sum.subtract(agent.velocity);
            return steer;
        }

        return new Phaser.Math.Vector2(0, 0);
    }

    /**
     * COHESION: Steer towards the average position of local flockmates
     */
    public cohesion(agent: ISteeringAgent, neighbors: ISteeringAgent[], radius: number = 50): Phaser.Math.Vector2 {
        const sum = new Phaser.Math.Vector2(0, 0);
        let count = 0;

        for (const other of neighbors) {
            const d = agent.position.distance(other.position);
            if (d > 0 && d < radius) {
                sum.add(other.position);
                count++;
            }
        }

        if (count > 0) {
            sum.divide(new Phaser.Math.Vector2(count, count));
            return this.seek(agent, sum);
        }

        return new Phaser.Math.Vector2(0, 0);
    }
}

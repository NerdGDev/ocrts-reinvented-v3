import Phaser from 'phaser';
import { Unit } from '../entities/Unit';

export class CombatManager {
    private scene: Phaser.Scene;
    private laserGraphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.laserGraphics = this.scene.add.graphics();
        this.laserGraphics.setDepth(10);
    }

    public update(_delta: number, playerUnits: Unit[], enemyUnits: Unit[]) {
        this.laserGraphics.clear();
        
        // Player attacks Enemy
        this.processCombat(playerUnits, enemyUnits, 0x00ff00);
        
        // Enemy attacks Player
        this.processCombat(enemyUnits, playerUnits, 0xff0000);
    }

    private processCombat(attackers: Unit[], targets: Unit[], color: number) {
        attackers.forEach(attacker => {
            // Simple target finding (nearest)
            let nearestTarget: Unit | null = null;
            let minDist = attacker.stats.range;

            for (const target of targets) {
                const dist = Phaser.Math.Distance.Between(attacker.x, attacker.y, target.x, target.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearestTarget = target;
                }
            }

            if (nearestTarget) {
                // Shoot!
                this.fireLaser(attacker, nearestTarget, color);
                nearestTarget.hp -= (attacker.stats.maxForce * 10); // Simple damage scaling
            }
        });
    }

    private fireLaser(from: Unit, to: Unit, color: number) {
        this.laserGraphics.lineStyle(2, color, 0.6);
        this.laserGraphics.lineBetween(from.x, from.y, to.x, to.y);
        
        // Add a small flash at the tip
        if (Math.random() > 0.8) {
            this.scene.add.circle(to.x, to.y, 2, color, 1)
                .setDepth(11)
                .setAlpha(1);
        }
    }
}

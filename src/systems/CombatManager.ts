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

        // Add a fade effect to the lines by not clearing every frame?
        // Actually, Phaser Graphics .clear() is required, so we use a lifed system if we want persistence.
        // For now, let's just make them thinner and higher alpha.
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
        this.laserGraphics.lineStyle(1, color, 0.4); // Thinner and more transparent
        this.laserGraphics.lineBetween(from.x, from.y, to.x, to.y);
        
        // Add a small flash at the tip
        if (Math.random() > 0.95) { // Less frequent flashes to reduce jitter visual
            const circle = this.scene.add.circle(to.x, to.y, 1.5, color, 0.8);
            this.scene.tweens.add({
                targets: circle,
                alpha: 0,
                scale: 2,
                duration: 100,
                onComplete: () => circle.destroy()
            });
        }
    }
}

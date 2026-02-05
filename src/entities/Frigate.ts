import Phaser from 'phaser';
import { Unit } from './Unit';

export class Frigate extends Unit {
    public hangarCapacity: number = 2;
    public dockedUnits: Unit[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, team: 'PLAYER' | 'ENEMY') {
        super(scene, x, y, team, 'FRIGATE');
        
        // Frigates are larger
        this.setScale(2.5);
    }

    public canDock(): boolean {
        return this.dockedUnits.length < this.hangarCapacity;
    }

    public dockUnit(unit: Unit) {
        if (this.canDock()) {
            this.dockedUnits.push(unit);
            unit.setVisible(false);
            unit.setActive(false);
        }
    }

    public launchUnit(): Unit | undefined {
        const unit = this.dockedUnits.shift();
        if (unit) {
            unit.setVisible(true);
            unit.setActive(true);
            unit.setPosition(this.x, this.y);
            // Give it a little push
            unit.velocity.set(Phaser.Math.Between(-1, 1), Phaser.Math.Between(-1, 1)).normalize().scale(unit.maxSpeed);
        }
        return unit;
    }

    public updateUnit(delta: number, neighbors: Unit[], nebulas: import('./Nebula').Nebula[], targetPos?: Phaser.Math.Vector2) {
        // Frigates have slower, more stable movement
        super.updateUnit(delta, neighbors, nebulas, targetPos);
        
        // Repair docked units over time
        this.dockedUnits.forEach(unit => {
            if (unit.hp < unit.stats.hp) {
                unit.hp += 5 * (delta / 1000); // 5 HP per second
            }
        });
    }
}

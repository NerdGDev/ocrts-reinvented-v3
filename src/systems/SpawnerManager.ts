import Phaser from 'phaser';
import { Unit } from '../entities/Unit';
import { StrategicNode } from '../entities/StrategicNode';
import { NodeTeam } from '../types/nodeTypes';

export class SpawnerManager {
    private scene: Phaser.Scene;
    private lastSpawn: number = 0;
    private spawnInterval: number = 3000;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public update(time: number, nodes: StrategicNode[], playerUnits: Unit[], enemyUnits: Unit[]) {
        if (time - this.lastSpawn > this.spawnInterval) {
            nodes.forEach(node => {
                if (node.team === NodeTeam.PLAYER && playerUnits.length < 100) {
                    this.spawnUnit(node, 'PLAYER', playerUnits);
                } else if (node.team === NodeTeam.ENEMY && enemyUnits.length < 100) {
                    this.spawnUnit(node, 'ENEMY', enemyUnits);
                }
            });
            this.lastSpawn = time;
        }
    }

    private spawnUnit(node: StrategicNode, team: 'PLAYER' | 'ENEMY', list: Unit[]) {
        const classes = ['SCOUT', 'FIGHTER', 'HEAVY'];
        const className = classes[Math.floor(Math.random() * classes.length)];
        const unit = new Unit(this.scene, node.x, node.y, team, className);
        list.push(unit);
    }
}

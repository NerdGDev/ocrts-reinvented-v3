import Phaser from 'phaser';
import { Unit } from './entities/Unit';
import { UIManager } from './systems/UIManager';
import { CombatManager } from './systems/CombatManager';
import { StrategicNode } from './entities/StrategicNode';
import { NodeTeam } from './types/nodeTypes';
import { SpawnerManager } from './systems/SpawnerManager';
import { Nebula } from './entities/Nebula';
import { Asteroid } from './entities/Asteroid';

class MainScene extends Phaser.Scene {
    private playerUnits: Unit[] = [];
    private enemyUnits: Unit[] = [];
    private nodes: StrategicNode[] = [];
    private nebulas: Nebula[] = [];
    private asteroids: Asteroid[] = [];
    private rallyPoint: Phaser.Math.Vector2 | null = null;
    private uiManager!: UIManager;
    private combatManager!: CombatManager;
    private spawnerManager!: SpawnerManager;

    constructor() {
        super('MainScene');
    }

    preload() {
        // Create a simple ship texture programmatically
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.setVisible(false);
        graphics.fillStyle(0x00ff00, 1);
        graphics.beginPath();
        graphics.moveTo(0, -10);
        graphics.lineTo(7, 10);
        graphics.lineTo(-7, 10);
        graphics.closePath();
        graphics.fillPath();
        graphics.generateTexture('ship', 20, 20);

        // Node texture
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(15, 15, 15);
        graphics.generateTexture('node', 30, 30);

        // Nebula texture
        graphics.clear();
        const nebulaSize = 128;
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * nebulaSize;
            const y = Math.random() * nebulaSize;
            const radius = 10 + Math.random() * 20;
            graphics.fillStyle(0x00ffff, 0.05);
            graphics.fillCircle(x, y, radius);
        }
        graphics.generateTexture('nebula', nebulaSize, nebulaSize);

        // Asteroid texture
        graphics.clear();
        graphics.fillStyle(0x888888, 1);
        graphics.fillCircle(10, 10, 10);
        graphics.generateTexture('asteroid', 20, 20);
    }

    create() {
        const { width, height } = this.scale;
        this.uiManager = new UIManager(this);
        this.combatManager = new CombatManager(this);
        this.spawnerManager = new SpawnerManager(this);
        
        // Background
        this.add.grid(width/2, height/2, width, height, 40, 40, 0x001100, 0.5, 0x004400, 0.2);

        // Create Nodes
        this.nodes.push(new StrategicNode(this, 100, height / 2, NodeTeam.PLAYER));
        this.nodes.push(new StrategicNode(this, width / 2, 150, NodeTeam.NEUTRAL));
        this.nodes.push(new StrategicNode(this, width / 2, height - 150, NodeTeam.NEUTRAL));
        this.nodes.push(new StrategicNode(this, width - 100, height / 2, NodeTeam.ENEMY));

        // Create Nebulae
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            this.nebulas.push(new Nebula(this, x, y));
        }

        // Create Asteroids
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            this.asteroids.push(new Asteroid(this, x, y));
        }

        // Spawn Player Units
        const classes = ['SCOUT', 'FIGHTER', 'HEAVY'];
        for (let i = 0; i < 30; i++) {
            const x = 100 + Math.random() * 100;
            const y = height / 2 + (Math.random() - 0.5) * 200;
            const className = classes[Math.floor(Math.random() * classes.length)];
            const unit = new Unit(this, x, y, 'PLAYER', className);
            this.playerUnits.push(unit);
        }

        // Spawn Enemy Units
        for (let i = 0; i < 30; i++) {
            const x = width - 100 - Math.random() * 100;
            const y = height / 2 + (Math.random() - 0.5) * 200;
            const className = classes[Math.floor(Math.random() * classes.length)];
            const unit = new Unit(this, x, y, 'ENEMY', className);
            unit.setFlipX(true);
            this.enemyUnits.push(unit);
        }

        // Click to set rally point
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.rallyPoint = new Phaser.Math.Vector2(pointer.x, pointer.y);
            this.uiManager.createPing(pointer.x, pointer.y);
            
            if (pointer.rightButtonDown()) {
                this.uiManager.showRadialMenu(pointer.x, pointer.y, ['SCOUT', 'FIGHTER', 'HEAVY']);
            }
        });
    }

    public update(time: number, delta: number) {
        this.uiManager.updateUnitCount(this.playerUnits.length);
        
        // Update Spawning
        this.spawnerManager.update(time, this.nodes, this.playerUnits, this.enemyUnits);

        // Check Victory/Loss
        const playerNodes = this.nodes.filter(n => n.team === NodeTeam.PLAYER).length;
        const enemyNodes = this.nodes.filter(n => n.team === NodeTeam.ENEMY).length;

        if (playerNodes === this.nodes.length) {
            this.uiManager.showOverlay('SECTOR SECURED', 0x00ff00);
        } else if (enemyNodes === this.nodes.length) {
            this.uiManager.showOverlay('MISSION FAILURE', 0xff0000);
        }

        // Update Nodes
        const allUnits = [...this.playerUnits, ...this.enemyUnits];
        this.nodes.forEach(node => node.updateNode(allUnits));

        // Update Combat
        this.combatManager.update(delta, this.playerUnits, this.enemyUnits);

        // Update Asteroids
        this.asteroids.forEach(a => a.update());

        // Check Asteroid Collisions
        this.physics.add.overlap(this.playerUnits, this.asteroids, (u, a) => {
            (u as Unit).hp -= (a as Asteroid).damageValue * (delta / 1000);
        });
        this.physics.add.overlap(this.enemyUnits, this.asteroids, (u, a) => {
            (u as Unit).hp -= (a as Asteroid).damageValue * (delta / 1000);
        });

        // Update Units & Remove Dead ones
        this.playerUnits = this.playerUnits.filter(u => {
            if (u.hp <= 0) { u.destroy(); return false; }
            u.updateUnit(delta, this.playerUnits, this.nebulas, this.rallyPoint || undefined);
            return true;
        });

        this.enemyUnits = this.enemyUnits.filter(u => {
            if (u.hp <= 0) { u.destroy(); return false; }
            // AI simple logic: Enemies move towards player units
            const target = this.playerUnits.length > 0 ? this.playerUnits[0].position : undefined;
            u.updateUnit(delta, this.enemyUnits, this.nebulas, target);
            return true;
        });
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000800',
    parent: 'app',
    scene: MainScene,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

new Phaser.Game(config);

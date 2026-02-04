import Phaser from 'phaser';
import { NodeTeam, NODE_CONFIG } from '../types/nodeTypes';
import { Unit } from './Unit';

export class StrategicNode extends Phaser.GameObjects.Container {
    public team: NodeTeam;
    public captureProgress: number = 0; // -100 to 100
    private baseSprite: Phaser.GameObjects.Sprite;
    private ringGfx: Phaser.GameObjects.Graphics;
    private label: Phaser.GameObjects.Text;
    
    constructor(scene: Phaser.Scene, x: number, y: number, initialTeam: NodeTeam = NodeTeam.NEUTRAL) {
        super(scene, x, y);
        this.team = initialTeam;
        scene.add.existing(this);

        // Core Sprite
        this.baseSprite = scene.add.sprite(0, 0, 'node');
        this.baseSprite.setTint(NODE_CONFIG.color[this.team]);
        this.add(this.baseSprite);

        // Capture Ring
        this.ringGfx = scene.add.graphics();
        this.add(this.ringGfx);

        // Label
        this.label = scene.add.text(0, 40, this.team, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.add(this.label);

        // Set initial progress based on team
        if (this.team === NodeTeam.PLAYER) this.captureProgress = 100;
        if (this.team === NodeTeam.ENEMY) this.captureProgress = -100;
    }

    public updateNode(units: Unit[]) {
        let playerNear = 0;
        let enemyNear = 0;

        units.forEach(u => {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, u.x, u.y);
            if (dist < 150) { // Increased capture range
                if (u.team === 'PLAYER') playerNear++;
                else enemyNear++;
            }
        });

        // Basic capture logic
        if (playerNear > enemyNear) this.captureProgress += 0.5; // Faster capture
        else if (enemyNear > playerNear) this.captureProgress -= 0.5;

        this.captureProgress = Phaser.Math.Clamp(this.captureProgress, -100, 100);

        // Team switching
        if (this.captureProgress >= 100) this.setTeam(NodeTeam.PLAYER);
        else if (this.captureProgress <= -100) this.setTeam(NodeTeam.ENEMY);
        else if (Math.abs(this.captureProgress) < 10) this.setTeam(NodeTeam.NEUTRAL);

        this.drawRing();
    }

    private drawRing() {
        this.ringGfx.clear();
        this.ringGfx.lineStyle(4, 0x00ff00, 0.3);
        this.ringGfx.strokeCircle(0, 0, 35);
        
        // Draw progress arc
        if (this.captureProgress !== 0) {
            const color = this.captureProgress > 0 ? 0x00ff00 : 0xff0000;
            const angle = Phaser.Math.DegToRad((Math.abs(this.captureProgress) / 100) * 360);
            this.ringGfx.lineStyle(4, color, 1);
            this.ringGfx.beginPath();
            this.ringGfx.arc(0, 0, 35, -Math.PI/2, -Math.PI/2 + angle, false);
            this.ringGfx.strokePath();
        }
    }

    public setTeam(newTeam: NodeTeam) {
        this.team = newTeam;
        this.baseSprite.setTint(NODE_CONFIG.color[this.team]);
        this.label.setText(this.team);
    }
}

import Phaser from 'phaser';

export class Nebula extends Phaser.GameObjects.Sprite {
    public slowFactor: number = 0.4;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'nebula');
        scene.add.existing(this);
        this.setAlpha(0.3);
        this.setDepth(2);
        this.setScale(2 + Math.random() * 2);
        this.setRotation(Math.random() * Math.PI * 2);
    }
}

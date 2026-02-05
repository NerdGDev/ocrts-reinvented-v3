import Phaser from 'phaser';

export class Asteroid extends Phaser.Physics.Arcade.Sprite {
    public damageValue: number = 5;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'asteroid');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Random drift
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(
            Phaser.Math.Between(-20, 20),
            Phaser.Math.Between(-20, 20)
        );
        body.setImmovable(true);
        body.setCircle(this.width / 2);
    }

    public update() {
        this.angle += 0.5;
    }
}

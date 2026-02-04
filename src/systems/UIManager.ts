import Phaser from 'phaser';

export class UIManager {
    private scene: Phaser.Scene;
    private hudContainer: Phaser.GameObjects.Container;
    private unitCountText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.hudContainer = this.scene.add.container(0, 0);
        this.hudContainer.setScrollFactor(0);
        this.hudContainer.setDepth(100); // Ensure HUD is on top

        // Glassmorphism Header
        const headerBg = this.scene.add.graphics();
        headerBg.fillStyle(0x000000, 0.4);
        headerBg.fillRoundedRect(10, 10, 200, 60, 12);
        headerBg.lineStyle(1, 0x00ff00, 0.3);
        headerBg.strokeRoundedRect(10, 10, 200, 60, 12);
        this.hudContainer.add(headerBg);

        this.unitCountText = this.scene.add.text(25, 20, 'FLEET: 0', {
            fontSize: '18px',
            color: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        });
        this.hudContainer.add(this.unitCountText);

        this.scene.add.text(25, 42, 'STATUS: NOMINAL', {
            fontSize: '12px',
            color: '#ffffff',
            fontFamily: 'monospace'
        });
        this.hudContainer.add(this.unitCountText);
    }

    public updateUnitCount(count: number) {
        this.unitCountText.setText(`FLEET: ${count}`);
    }

    /**
     * Create a tactical ping at the target location
     */
    public createPing(x: number, y: number, color: number = 0x00ff00) {
        const ping = this.scene.add.circle(x, y, 5, color, 0.8);
        const ring = this.scene.add.circle(x, y, 5, color, 0);
        ring.setStrokeStyle(2, color, 1);

        this.scene.tweens.add({
            targets: ring,
            radius: 40,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.out',
            onComplete: () => {
                ping.destroy();
                ring.destroy();
            }
        });
    }

    /**
     * Show a context-sensitive radial menu
     */
    public showRadialMenu(x: number, y: number, options: string[]) {
        const menuContainer = this.scene.add.container(x, y);
        const count = options.length;
        const radius = 60;

        options.forEach((opt, i) => {
            const angle = (i / count) * Math.PI * 2;
            const ox = Math.cos(angle) * radius;
            const oy = Math.sin(angle) * radius;

            const btnBg = this.scene.add.circle(ox, oy, 25, 0x000000, 0.6);
            btnBg.setStrokeStyle(1, 0x00ff00, 0.5);
            btnBg.setInteractive();

            const btnText = this.scene.add.text(ox, oy, opt, {
                fontSize: '10px',
                color: '#ffffff',
                fontFamily: 'monospace'
            }).setOrigin(0.5);

            menuContainer.add([btnBg, btnText]);

            // Hover effects
            btnBg.on('pointerover', () => btnBg.setStrokeStyle(2, 0x00ff00, 1));
            btnBg.on('pointerout', () => btnBg.setStrokeStyle(1, 0x00ff00, 0.5));
        });

        // Close after 3 seconds or on click away
        this.scene.time.delayedCall(3000, () => menuContainer.destroy());
    }
}

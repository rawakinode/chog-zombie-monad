import Phaser from 'phaser';

export default class HowToPlay extends Phaser.Scene {
    constructor() {
        super('HowToPlay');
    }

    create() {
        // Background warna
        this.add.rectangle(600, 450, 1200, 900, 0x222244);

        // Judul
        this.add.text(600, 80, 'HOW TO PLAY', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Instruksi
        const instructions = [
            '1. Click Login (Privy email login)',
            '2. Set your Name / Username',
            '3. Click Play Now !',
            '4. Kill all Zombies !',
            '',
            'WASD / Arrow => Move Player',
            'Mouse Click => Shoot',
            'Click and Hold => Auto Shoot'
        ];

        instructions.forEach((txt, i) => {
            this.add.text(600, 200 + i * 50, txt, {
                fontFamily: '"Press Start 2P"',
                fontSize: '21px',
                fill: '#ffcc00',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5);
        });

        // Tombol Back
        const backBtn = this.add.text(600, 800, 'BACK', {
            fontFamily: '"Press Start 2P"',
            fontSize: '30px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setInteractive();

        backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#ff0000' }));
        backBtn.on('pointerout', () => backBtn.setStyle({ fill: '#ffffff' }));
        backBtn.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
    }
}

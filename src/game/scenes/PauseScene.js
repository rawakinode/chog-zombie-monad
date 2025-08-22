import Phaser from 'phaser';

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6);

        // Tombol Resume
        const resumeBtn = this.add.text(W / 2, H / 2 - 30, 'RESUME', {
            fontFamily: '"Press Start 2P"',
            fontSize: '30px',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setInteractive();

        // Tombol End Game
        const endBtn = this.add.text(W / 2, H / 2 + 40, 'END GAME', {
            fontFamily: '"Press Start 2P"',
            fontSize: '30px',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setInteractive();

        // Hover efek
        [resumeBtn, endBtn].forEach(btn => {
            btn.on('pointerover', () => { btn.setStyle({ fill: '#ffff00' }), this.sound.play('hoverSfx', { volume: 2 }) });
            btn.on('pointerout', () => btn.setStyle({ fill: btn === resumeBtn ? '#00ff00' : '#ff0000' }));
        });

        // Aksi klik
        resumeBtn.on('pointerdown', () => {
            this.scene.stop();               // tutup PauseScene
            this.scene.resume('DungeonScene'); // lanjutkan DungeonScene
        });

        endBtn.on('pointerdown', () => {
            const dungeon = this.scene.get('DungeonScene');
            dungeon.stopMusic();
            this.scene.stop('DungeonScene');   // stop game utama
            this.scene.start('MainMenuScene');
        });
    }
}

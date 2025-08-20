import Phaser from 'phaser';

export default class Leaderboard extends Phaser.Scene {
    constructor() {
        super('Leaderboard');
    }

    create() {
        // Background
        this.add.rectangle(600, 450, 1200, 900, 0x003344);

        // Judul
        this.add.text(600, 80, 'LEADERBOARD', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Dummy data leaderboard
        const scores = [
            { name: 'AAA', score: 12345 },
            { name: 'BBB', score: 9500 },
            { name: 'CCC', score: 7250 },
            { name: 'YOU', score: 5000 },
            { name: 'DDD', score: 3200 }
        ];

        scores.forEach((row, i) => {
            this.add.text(600, 200 + i * 50, `${i + 1}. ${row.name} - ${row.score}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: '21px',
                fill: i === 3 ? '#ffcc00' : '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
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

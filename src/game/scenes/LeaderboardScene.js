import axios from "axios";
import Phaser from 'phaser';

export default class Leaderboard extends Phaser.Scene {
    constructor() {
        super('Leaderboard');
    }

    async create() {
        // Background
        this.add.rectangle(600, 450, 1200, 900, 0x160024);

        // Judul
        this.add.text(600, 80, 'TOP LEADERBOARD', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Loading text
        this.loadingText = this.add.text(600, 400, 'Loading data ...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

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

        // get data all leaderboard
        const getScore = await this.getLeaderboard();
        if (getScore === false) {
            this.loadingText.setText('No data.')
        } else {
            getScore.result.forEach((row, i) => {
                this.add.text(200, 180 + i * 30, `${row.rank}. ${row.username}`, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '21px',
                    fill:'#ffcc00',
                    align: 'left',
                    stroke: '#000000',
                    strokeThickness: 4
                }).setOrigin(0, 0);

                this.add.text(1000, 180 + i * 30, `${row.highscore} Score`, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '21px',
                    fill: '#ffcc00',
                    align: 'right',
                    stroke: '#000000',
                    strokeThickness: 4
                }).setOrigin(1, 0);
            });
            this.loadingText.setVisible(false);

            if (getScore.wallet != null) {
                this.add.text(600, 580, 'My Rank', {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '30px',
                    fill: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 6
                }).setOrigin(0.5);

                this.add.text(600, 630, `${getScore.wallet.rank}`, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '40px',
                    fill: '#ffcc00',
                    stroke: '#000000',
                    strokeThickness: 6
                }).setOrigin(0.5);

                this.add.text(600, 680, `(${getScore.wallet.highscore})`, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '20px',
                    fill: '#ffcc00',
                    stroke: '#000000',
                    strokeThickness: 6
                }).setOrigin(0.5);
            }
        }
    }

    async getLeaderboard() {
        try {
            const wallet = window?.PrivyBridge?.getUser?.().linkedAccounts?.[0]?.embeddedWallets?.[0]?.address ?? '';
            const response = await axios.get(`${import.meta.env.VITE_GAME_API_URL}/leaderboard?address=${wallet}`);
            const data = response.data;
            console.log(data);
            
            if (data.success === true) { return data; }
            return false;
        } catch (error) {
            return false;
        }
    }
}

import Phaser from 'phaser';
import axios from "axios";

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        this.cameras.main.setBackgroundColor('#062154');
    }

    create() {

        // event listener dari React / usePrivyBridge
        window.addEventListener("privy_update", (e) => {
            this.updatePrivyStatus(e.detail);
        });

        const W = 1200;
        const H = 900;

        // Gambar di atas background
        this.add.image(570, 420, 'hero')
            .setOrigin(0.5)
            .setScale(1.6);

        // Judul game
        const titleGame = this.add.text(W / 2, H / 5, 'CHOG ZOMBIE', {
            fontFamily: '"Press Start 2P"',
            fontSize: '70px',
            fill: '#20082b'
        }).setOrigin(0.5);
        titleGame.setStroke('#ff2424', 15);
        titleGame.angle = 2;
        titleGame.setShadow(3, 3, '#000000', 15, true, true);

        this.tweens.add({
            targets: titleGame,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Tombol Play
        this.playText = this.add.text(W / 2, H / 2, '> PLAY NOW <', {
            fontFamily: '"Press Start 2P"',
            fontSize: '50px',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive();
        this.playText.setStroke('#000000', 10);
        this.playText.setVisible(false);
        this.playText.on('pointerdown', () => {
            this.menuMusic.stop();
            this.scene.start('DungeonScene');
        });

        // Tombol login
        this.loginText = this.add.text(W / 2, H / 2, '> LOGIN <', {
            fontFamily: '"Press Start 2P"',
            fontSize: '50px',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive();
        this.loginText.setStroke('#000000', 10);
        this.loginText.setVisible(false);
        this.loginText.on('pointerdown', async () => {
            await window.PrivyBridge?.login?.();
        });

        //Tombol set Username
        this.setUsernameText = this.add.text(W / 2, H / 2, '> SET USERNAME <', {
            fontFamily: '"Press Start 2P"',
            fontSize: '50px',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive();
        this.setUsernameText.setStroke('#000000', 10);
        this.setUsernameText.setVisible(false);
        this.setUsernameText.on('pointerdown', async () => {
            window.open("https://monad-games-id-site.vercel.app/", "_blank");
        });

        // Tombol logout
        this.logoutText = this.add.text(W / 2, H / 2 + 260, '> LOGOUT', {
            fontFamily: '"Press Start 2P"',
            fontSize: '30px',
            fill: '#ffff00'
        }).setOrigin(0.5).setInteractive();
        this.logoutText.setStroke('#000000', 10);
        this.logoutText.setVisible(false);
        this.logoutText.on('pointerdown', async () => {
            await window.PrivyBridge?.logout?.();
        })

        // User text
        this.userText = this.add.text(W / 2, H / 2 - 90, 'Loading user data...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '15px',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive();
        this.userText.setStroke('#000000', 5);


        // Tombol How To Play
        const howToPlayText = this.add.text(W / 2, H / 2 + 110, '> HOW TO PLAY', {
            fontFamily: '"Press Start 2P"',
            fontSize: '30px',
            fill: '#ffff00'
        }).setOrigin(0.5).setInteractive();
        howToPlayText.setStroke('#000000', 10);
        howToPlayText.on('pointerdown', () => {
            this.scene.start('HowToPlay');
        });

        // Tombol Leaderboard
        const leaderboardText = this.add.text(W / 2, H / 2 + 160, '> LEADERBOARD', {
            fontFamily: '"Press Start 2P"',
            fontSize: '30px',
            fill: '#ffff00'
        }).setOrigin(0.5).setInteractive();
        leaderboardText.setStroke('#000000', 10);
        leaderboardText.on('pointerdown', () => {
            this.scene.start('Leaderboard');
        })

        // Tombol about
        const optionText = this.add.text(W / 2, H / 2 + 210, '> ABOUT', {
            fontFamily: '"Press Start 2P"',
            fontSize: '30px',
            fill: '#ffff00'
        }).setOrigin(0.5).setInteractive();
        optionText.setStroke('#000000', 10);
        optionText.on('pointerdown', () => {
            this.scene.start('AboutScene');
        })

        // Footer Game
        const footerText = this.add.text(W / 2, H / 2 + 400, 'Created by Rawakinode', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            fill: '#e09c14'
        }).setOrigin(0.5).setInteractive();
        footerText.setStroke('#000000', 5);

        // Hover efek
        [leaderboardText, optionText, howToPlayText, this.logoutText].forEach(btn => {
            btn.on('pointerover', () => {
                btn.setFill('#e01414ff');
                this.sound.play('hoverSfx', { volume: 2 });
                this.tweens.add({
                    targets: btn,
                    angle: 3,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 150,
                    ease: 'Sine.easeInOut'
                });
            });
            btn.on('pointerout', () => {
                btn.setFill('#ffff00');
                this.tweens.add({
                    targets: btn,
                    angle: 0,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150,
                    ease: 'Sine.easeInOut'
                });
            });
        });

        [this.playText, this.loginText, this.setUsernameText].forEach(btn => {
            btn.on('pointerover', () => {
                btn.setFill('#7d14e0ff');
                this.sound.play('hoverSfx', { volume: 2 });
                this.tweens.add({
                    targets: btn,
                    angle: 3,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 150,
                    ease: 'Sine.easeInOut'
                });
            });
            btn.on('pointerout', () => {
                btn.setFill('#ffffffff');
                this.tweens.add({
                    targets: btn,
                    angle: 0,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150,
                    ease: 'Sine.easeInOut'
                });
            });
        });

        // Cek apakah musik sudah dibuat sebelumnya
        if (!this.sound.get('homepageSound')) {
            this.menuMusic = this.sound.add('homepageSound', { loop: true, volume: 0.5 });
            this.menuMusic.play();
        } else {
            this.menuMusic = this.sound.get('homepageSound');
            if (!this.menuMusic.isPlaying) {
                this.menuMusic.play();
            }
        }

        this.updatePrivyStatus(window.PrivyBridge);
    }

    async updatePrivyStatus(privy) {
        if (!privy?.ready) {
            this.userText.setText('Check authentication ...')
        }

        if (!privy?.isAuthenticated?.()) {
            this.userText.setText('Please login with Monad Games ID !')
            this.loginText.setVisible(true);
            this.playText.setVisible(false);
            this.logoutText.setVisible(false);
        } else {
            const user = privy?.getUser?.();
            if (user?.linkedAccounts?.length > 0) {
                const wallet = user?.linkedAccounts?.[0]?.embeddedWallets?.[0]?.address;
                this.loginText.setVisible(false);
                try {
                    const response = await axios.get(`https://monad-games-id-site.vercel.app/api/check-wallet?wallet=${wallet}`);
                    const res = response.data;

                    if (res.hasUsername == true) {
                        this.userText.setText(`Welcome ${res.user.username}, Enjoy Game!`);
                        this.playText.setVisible(true);
                        this.logoutText.setVisible(true);
                    } else {
                        this.userText.setText(`Please set your username first!`)
                        this.setUsernameText.setVisible(true);
                        this.playText.setVisible(false);
                        this.logoutText.setVisible(true);
                    }

                } catch (error) {
                    this.userText.setText(`Failed to get Username! Refresh this page !`);
                    this.loginText.setVisible(false);
                    this.playText.setVisible(false);
                    this.logoutText.setVisible(true);
                }


            }

        }
    }



}

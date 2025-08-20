import Phaser from 'phaser';

export default class AboutScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AboutScene' });
    }

    create() {
        // Background warna
        this.add.rectangle(600, 450, 1200, 900, 0x222244);

        // Judul
        this.add.text(600, 100, "ABOUT THIS GAME", {
            fontFamily: '"Press Start 2P"',
            fontSize: "30px",
            fill: "#ffffff",
            stroke: "#000000",
            strokeThickness: 6
        }).setOrigin(0.5);

        // Deskripsi
        this.add.text(600, 200, "This game is part of \n the Monad Mission 7: Game Jam!", {
            fontFamily: '"Press Start 2P"',
            fontSize: "21px",
            fill: "#ffff00",
            align: "center"
        }).setOrigin(0.5);

        // Link Website
        let webLink = this.add.text(600, 320, "🌐 Website. https://rawaki.xyz", {
            fontFamily: '"Press Start 2P"',
            fontSize: "18px",
            fill: "#00ffff"
        }).setOrigin(0.5).setInteractive();

        webLink.on("pointerdown", () => {
            window.open("https://rawaki.xyz", "_blank");
        });

        // Link Twitter
        let twitterLink = this.add.text(600, 380, "🐦 Twitter. https://twitter.com/rawakinode", {
            fontFamily: '"Press Start 2P"',
            fontSize: "18px",
            fill: "#00ffff"
        }).setOrigin(0.5).setInteractive();

        twitterLink.on("pointerdown", () => {
            window.open("https://twitter.com/rawakinode", "_blank");
        });

        // Link GitHub
        let githubLink = this.add.text(600, 440, "💻 GitHub. https://github.com/rawakinode", {
            fontFamily: '"Press Start 2P"',
            fontSize: "18px",
            fill: "#00ffff"
        }).setOrigin(0.5).setInteractive();

        githubLink.on("pointerdown", () => {
            window.open("https://github.com/rawakinode", "_blank");
        });

        // Tombol Back
        let backBtn = this.add.text(600, 800, "BACK", {
            fontFamily: '"Press Start 2P"',
            fontSize: "30px",
            fill: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5).setInteractive();

        backBtn.on("pointerover", () => backBtn.setStyle({ fill: "#ff0000" }));
        backBtn.on("pointerout", () => backBtn.setStyle({ fill: "#ffffff" }));
        backBtn.on("pointerdown", () => {
            this.scene.start("MainMenuScene");
        });
    }
}

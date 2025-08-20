import Phaser from 'phaser';
import hoverMusic from '../../assets/sound/hoverAudio.ogg'
import homepageMusic from '../../assets/sound/homepage.ogg'
import gunMusic from '../../assets/sound/gun.mp3'
import gameplayMusic from '../../assets/sound/gameplay.ogg'
import gameoverMusic from '../../assets/sound/gameover.ogg'
import heroImage from '../../assets/image/hero3.png'
import enemyImage from '../../assets/image/enemy.png'
import playerImage from '../../assets/image/chog.png'

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.loadingText = this.add.text(W / 2, H / 2, 'Loading...', {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(W / 2 - 160, H / 2 + 40, 320, 30);

    this.load.on('progress', value => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(W / 2 - 150, H / 2 + 45, 300 * value, 20);
    });

    // Load assets
    this.load.image('hero', heroImage);
    this.load.audio('homepageSound', homepageMusic);
    this.load.audio('hoverSfx', hoverMusic);
    this.load.audio('shoot', gunMusic);
    this.load.image('enemy', enemyImage);
    this.load.image('player', playerImage);
    this.load.audio('gameBgm', gameplayMusic);
    this.load.audio('gameoverSound', gameoverMusic);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.loadingText.setText('Ready!');

    const playButton = this.add.text(W / 2, H / 2 + 120, 'ENTER GAME', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setInteractive();

    playButton.on('pointerover', () => {
      playButton.setTint(0xff0000);
      this.sound.play('hoverSfx', { volume: 3 });
    });
    playButton.on('pointerout', () => playButton.clearTint());

    playButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }
}

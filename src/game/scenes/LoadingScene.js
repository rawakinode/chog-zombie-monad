import Phaser from 'phaser';
import hoverMusic from '../../assets/sound/hoverAudio.ogg'
import homepageMusic from '../../assets/sound/homepage.ogg'
import gunMusic from '../../assets/sound/gun.mp3'
import gameplayMusic from '../../assets/sound/gameplay.ogg'
import gameoverMusic from '../../assets/sound/gameover.ogg'
import zombieKilled from '../../assets/sound/blood.mp3'
import zombieSound from '../../assets/sound/zombie.mp3'
import heroImage from '../../assets/image/background.png'
import enemyImage from '../../assets/image/enemy.png'
import playerImage from '../../assets/image/player.png'
import logoChog from '../../assets/image/logo-512.png'
import gameplayImage from '../../assets/image/gameplay.png'
import iconDead from '../../assets/image/dead_zombie.png'

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
    this.load.image('logo', logoChog);
    this.load.image('hero', heroImage);
    this.load.image('enemy', enemyImage);
    this.load.image('player', playerImage);
    this.load.image('iconDead', iconDead);
    this.load.image('gameplayBg', gameplayImage);
    this.load.audio('homepageSound', homepageMusic);
    this.load.audio('hoverSfx', hoverMusic);
    this.load.audio('shoot', gunMusic);
    this.load.audio('gameBgm', gameplayMusic);
    this.load.audio('gameoverSound', gameoverMusic);
    this.load.audio('zombieKilled', zombieKilled);
    this.load.audio('zombieSound', zombieSound);

    // Load joystick plugin
    this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.loadingText.setText('Ready!');

    this.add.image(600, 280, 'logo')
      .setOrigin(0.5)
      .setScale(0.5);

    const playButton = this.add.text(W / 2, H / 2 + 160, 'ENTER GAME', {
      fontFamily: '"Press Start 2P"',
      fontSize: '35px',
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

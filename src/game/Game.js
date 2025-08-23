import Phaser from 'phaser';
import LoadingScene from './scenes/LoadingScene';
import MainMenuScene from './scenes/MainMenuScene';
import DungeonScene from './scenes/DungeonScene';
import PauseScene from './scenes/PauseScene';
import HowToPlay from './scenes/HowToPlayScene';
import Leaderboard from './scenes/LeaderboardScene';
import AboutScene from './scenes/AboutScene';

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 900,
  parent: 'phaser-game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
      fps: 60
    }
  },
  scene: [LoadingScene, MainMenuScene, HowToPlay, Leaderboard, AboutScene, DungeonScene, PauseScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

export default function startGame() {
  new Phaser.Game(config);
}

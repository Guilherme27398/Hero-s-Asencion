// Exercicio_pratico_1/jogo.js

import MenuScene  from './scenes/MenuScene.js';
import GameScene  from './scenes/GameScene.js';
import DeathScene from './scenes/DeathScene.js';
import WinScene from './scenes/WinScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',

 
  scale: {
    mode: Phaser.Scale.FIT,             
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width:  window.innerWidth,
    height: window.innerHeight,
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },

  scene: [ MenuScene, GameScene, DeathScene, WinScene ]
};

const game = new Phaser.Game(config);


window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

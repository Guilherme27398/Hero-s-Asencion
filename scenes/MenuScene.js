// Exercicio_pratico_1/scenes/MenuScene.js

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {
    this.load.image('menuBg',  'assets/images/menu_background.png');
    this.load.image('titleImg','assets/images/title.png');
    this.load.image('playBtn', 'assets/images/button.png');
  }

  create() {
    const { width, height } = this.scale;
    
    // 1) BACKGROUND — escala uniforme para cobrir todo o ecrã sem distorcer
    const bg = this.add.image(width/2, height/2, 'menuBg');
    const scaleX = width  / bg.width;
    const scaleY = height / bg.height;
    const scale  = Math.max(scaleX, scaleY);
    bg.setScale(scale).setOrigin(0.5);

    // 2) TÍTULO via imagem, reduzido para caber bem
    this.add.image(width/4, 150, 'titleImg')
      .setOrigin(0.5)
      .setScale(0.5);

    // 3) BOTÃO “Play”, redimensionado e centralizado
    const btn = this.add.image(width/4, height - 120, 'playBtn')
      .setOrigin(0.5)
      .setInteractive()
      .setScale(0.4);

    btn.on('pointerup',   () => this.scene.start('GameScene'));
  }
}

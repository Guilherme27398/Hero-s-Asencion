export default class DeathScene extends Phaser.Scene {
    constructor() {
        super('DeathScene');
    }

    preload() {
        this.load.image('deathBackground', 'Assets/images/DEATHScene.png');
    }

    create() {
        // Adiciona o background
        const bg = this.add.image(0, 0, 'deathBackground');
        bg.setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Texto de instrução para reiniciar
        const restartText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 50,
            'Pressione ESPAÇO para recomeçar',
            { font: '32px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);

        // Input para reiniciar o jogo
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }
} 
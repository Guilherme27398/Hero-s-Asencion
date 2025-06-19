export default class WinScene extends Phaser.Scene {
    constructor() {
        super('WinScene');
    }

    preload() {
        // Carrega a imagem de fundo da vitória (você pode adicionar sua própria imagem)
        this.load.image('winBackground', 'Assets/images/WINScene.png');
    }

    create() {
        // Adiciona o background
        const bg = this.add.image(0, 0, 'winBackground');
        bg.setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Timer para voltar ao menu após 20 segundos
        this.time.delayedCall(20000, () => {
            this.cameras.main.fadeOut(1000);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });
    }
} 
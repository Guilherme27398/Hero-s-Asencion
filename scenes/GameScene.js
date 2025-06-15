export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Corrigido: nome do mapa JSON
        this.load.tilemapTiledJSON('dungeon', 'Assets/maps/dungeon_map.json');

        // Tileset imagem correta
        this.load.image('Map01', 'Assets/images/tile/Map01.png');

        // Spritesheet do jogador
        this.load.spritesheet('adventurer', 'Assets/images/adventurer.png', {
            frameWidth: 50,
            frameHeight: 37
        });
    }

    create() {
        // Cria o tilemap
        const map = this.make.tilemap({ key: 'dungeon' });

        // Adiciona tileset (nome no Tiled e nome da imagem)
        const tileset = map.addTilesetImage('Map01', 'Map01');

        // Cria camadas – nomes reais no JSON
        map.createLayer('Camada de Blocos 1', tileset, 0, 0);
        map.createLayer('Camada de Blocos 2', tileset, 0, 0);
        map.createLayer('Camada de Blocos 3', tileset, 0, 0);
        map.createLayer('Camada de Blocos 4', tileset, 0, 0);

        // Player
        this.player = this.physics.add.sprite(32, 32, 'adventurer');
        this.player.setCollideWorldBounds(true);

        // Câmera segue o jogador
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Animações
        this.createAnimations();
    }

    createAnimations() {
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('adventurer', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('adventurer', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('adventurer', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('adventurer', { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('adventurer', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNumbers('adventurer', { start: 16, end: 19 }),
            frameRate: 12,
            repeat: 0
        });
    }

    update(time, delta) {
        const speed = 0.2 * delta;
        const player = this.player;

        player.setVelocity(0);

        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            player.anims.play('attack', true);
            return;
        }

        if (this.cursors.left.isDown) {
            player.setVelocityX(-speed);
            player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            player.setVelocityX(speed);
            player.anims.play('right', true);
        } else if (this.cursors.up.isDown) {
            player.setVelocityY(-speed);
            player.anims.play('up', true);
        } else if (this.cursors.down.isDown) {
            player.setVelocityY(speed);
            player.anims.play('down', true);
        } else {
            player.anims.play('idle', true);
        }
    }
}

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Corrigir nome do tileset conforme seu arquivo real
        this.load.tilemapTiledJSON('cityMap', 'city_map.json');
        this.load.image('tileset', 'Assets/images/tile/town_tileset.png');

        // Corrigir para seu sprite sheet real
        this.load.spritesheet('adventurer', 'Assets/images/adventurer.png', {
            frameWidth: 50,
            frameHeight: 37
        });
    }

    create() {
        // Mapa
        const map = this.make.tilemap({ key: 'cityMap' });

        // ⚠️ O nome "tileset" abaixo precisa ser:
        // - o MESMO nome usado no Tiled como nome do tileset
        // - e o mesmo que está no JSON ("tileset.png")
        const tileset = map.addTilesetImage('tileset', 'tileset');

        const ground = map.createLayer('Ground', tileset, 0, 0);

        // Player
        this.player = this.physics.add.sprite(100, 100, 'adventurer');
        this.player.setCollideWorldBounds(true);

        // Câmera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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
            frames: this.anims.generateFrameNumbers('adventurer', { start: 16, end: 19 }), // ajuste conforme sprite real
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

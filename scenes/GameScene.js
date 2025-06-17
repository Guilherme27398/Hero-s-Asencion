export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Adicionar tratamento de erros para carregamento de assets
        this.load.on('loaderror', (fileObj) => {
            console.error('Erro ao carregar:', fileObj.src);
        });

        this.load.on('filecomplete', (key) => {
            console.log('Asset carregado com sucesso:', key);
        });

        this.load.tilemapTiledJSON('dungeon', 'Assets/maps/dungeonnewmap.json');
        this.load.image('Map01', 'Assets/images/tile/Map01.png');
        this.load.image('furniture', 'Assets/images/tile/fancy_mansion_furnitureset.png');
        this.load.image('B32x32', 'Assets/images/tile/B32x32.png');
        this.load.spritesheet('adventurer', 'Assets/images/adventurer.png', { frameWidth: 50, frameHeight: 37 });
        this.load.spritesheet('adventurer_run', 'Assets/images/adventurer-run-Sheet.png', { frameWidth: 50, frameHeight: 37 });
    }

    create() {
        const map = this.make.tilemap({ key: 'dungeon' });
        const tileset1 = map.addTilesetImage('Map01', 'Map01');
        const tileset2 = map.addTilesetImage('fancy_mansion_furnitureset', 'furniture');
        const tileset3 = map.addTilesetImage('B32x32', 'B32x32');
        
        // Criar as camadas usando todos os tilesets
        this.blocks1 = map.createLayer('Camada de Blocos 1', [tileset1, tileset2, tileset3], 0, 0);
        this.blocks2 = map.createLayer('Camada de Blocos 2', [tileset1, tileset2, tileset3], 0, 0);
        this.blocks3 = map.createLayer('Camada de Blocos 3', [tileset1, tileset2, tileset3], 0, 0);
        this.blocks4 = map.createLayer('Camada de Blocos 4', [tileset1, tileset2, tileset3], 0, 0);

        this.player = this.physics.add.sprite(32, 32, 'adventurer');
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.player.setCollideWorldBounds(true);

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setZoom(2.5);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({ up: 'W', left: 'A', down: 'S', right: 'D' });
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.createAnimations();

        // bloqueia movimento durante ataque
        this.isAttacking = false;
        this.player.on('animationcomplete-attack', () => {
            this.isAttacking = false;
        });
    }

    createAnimations() {
        this.anims.create({ key: 'idle', frames: this.anims.generateFrameNumbers('adventurer', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
        this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('adventurer', { start: 4, end: 7 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('adventurer', { start: 8, end: 11 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'up', frames: this.anims.generateFrameNumbers('adventurer', { start: 12, end: 15 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'down', frames: this.anims.generateFrameNumbers('adventurer', { start: 20, end: 23 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'run', frames: this.anims.generateFrameNumbers('adventurer_run', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'attack', frames: this.anims.generateFrameNumbers('adventurer', { start: 45, end: 55 }), frameRate: 6, repeat: 0 });
    }

    update() {
        if (this.isAttacking) {
            this.player.setVelocity(0);
            return;
        }

        const speed = 120;
        this.player.setVelocity(0);

        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.isAttacking = true;
            this.player.play('attack', true);
            return;
        }

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('run', true);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play('run', true);
            this.player.setFlipX(false);
        } else if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.setVelocityY(-speed);
            this.player.anims.play('up', true);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.setVelocityY(speed);
            this.player.anims.play('down', true);
        } else {
            this.player.anims.play('idle', true);
        }
    }
}

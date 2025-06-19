export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.on('loaderror', (fileObj) => console.error('Erro ao carregar:', fileObj.src));
        this.load.on('filecomplete', (key) => console.log('Asset carregado:', key));

        this.load.tilemapTiledJSON('dungeon', 'Assets/maps/dungeonnewmap.json');
        this.load.image('Map01', 'Assets/images/tile/Map01.png');
        this.load.image('furniture', 'Assets/images/tile/fancy_mansion_furnitureset.png');
        this.load.image('B32x32', 'Assets/images/tile/B32x32.png');
        this.load.spritesheet('adventurer', 'Assets/images/adventurer.png', { frameWidth: 50, frameHeight: 37 });
        this.load.spritesheet('adventurer_run', 'Assets/images/adventurer-run-Sheet.png', { frameWidth: 50, frameHeight: 37 });
        this.load.spritesheet('slime', 'Assets/images/enemies/slime-Sheet.png', { frameWidth: 32, frameHeight: 28 });
        this.load.spritesheet('golem', 'Assets/images/enemies/fire-golem-Sheet.png', { frameWidth: 64 , frameHeight: 57 });
        this.load.spritesheet('reaper', 'Assets/images/enemies/reaper-Sheet.png', { frameWidth: 48 , frameHeight: 46  });
    }

    create() {
        // MAPA E TILESSETS
        const map = this.make.tilemap({ key: 'dungeon' });
        const ts1 = map.addTilesetImage('Map01', 'Map01');
        const ts2 = map.addTilesetImage('fancy_mansion_furnitureset', 'furniture');
        const ts3 = map.addTilesetImage('B32x32', 'B32x32');
        this.blocks1 = map.createLayer('Camada de Blocos 1', [ts1, ts2, ts3], 0, 0);
        this.blocks2 = map.createLayer('Camada de Blocos 2', [ts1, ts2, ts3], 0, 0);
        this.blocks3 = map.createLayer('Camada de Blocos 3', [ts1, ts2, ts3], 0, 0);
        this.blocks4 = map.createLayer('Camada de Blocos 4', [ts1, ts2, ts3], 0, 0);

        // PLAYER
        const tileSize = 32;
        this.player = this.physics.add.sprite(8 * tileSize, 4 * tileSize, 'adventurer');
        this.player.setCollideWorldBounds(true);
        this.player.body.setImmovable(false);
        this.player.body.setSize(20, 28).setOffset(15, 7);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // CÂMARA
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(2.5);

        // INPUT
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({ up:'W', left:'A', down:'S', right:'D' });
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.chargeAttackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

        // ANIMAÇÕES
        this.createAnimations();
        this.isAttacking = false;
        this.isQuickAttacking = false;
        // Libera ataque do player só quando animação termina
        this.player.on('animationcomplete-attack', () => { this.isAttacking = false; });
        this.player.on('animationcomplete-quick_attack', () => { this.isQuickAttacking = false; });

        // COLISÕES
        this.enemies = this.physics.add.group();
        [this.blocks1, this.blocks2, this.blocks3, this.blocks4].forEach(layer => {
            layer.setCollisionByProperty({ collidable:true });
            this.physics.add.collider(this.player, layer);
        });
        this.physics.add.collider(this.player, this.enemies);
        this.physics.add.collider(this.enemies, this.enemies);
        // Overlap para ataques sempre ativo
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, null, this);

        // === VIDA ===
        this.maxHealth = 300;
        this.currentHealth = 300;
        this.lastDamageTime = 0;
        this.regenDelay = 15000; // 15 segundos
        this.regenRate = 3000; // 3 segundos
        this.regenAmount = 10;
        this.nextRegenTime = 0;
        this.isPlayerDead = false;
        this.regenStartHealth = this.currentHealth;
      
    
        // Barra vermelha (vida) fixa na tela
       


        // === BARRA DE VIDA EM CIMA DO PLAYER ===
        this.playerHealthBarBg = this.add.rectangle(0, 0, 40, 8, 0x000000)
            .setOrigin(0.5, 1)
            .setDepth(10001);
        this.playerHealthBar = this.add.rectangle(0, 0, 36, 4, 0xff0000)
            .setOrigin(0.5, 1)
            .setDepth(10002);
        this.playerHealthBarBg.setVisible(true);
        this.playerHealthBar.setVisible(true);

        // TRIGGER NA PONTE
        this.bridgeTrigger = this.add.zone(8 * tileSize, 19 * tileSize, 5 * tileSize, 2 * tileSize);
        this.physics.add.existing(this.bridgeTrigger);
        this.bridgeTrigger.body.setAllowGravity(false);
        this.bridgeTrigger.body.setImmovable(true);
        this.bridgeTriggered = false;
        this.physics.add.overlap(this.player, this.bridgeTrigger, () => {
            if (!this.bridgeTriggered) {
                this.bridgeTriggered = true;
                // Spawn de slimes
                this.spawnSlime(14*tileSize,28*tileSize);
                this.spawnSlime(5*tileSize,25*tileSize);
                this.spawnSlime(15*tileSize,23*tileSize);
                this.spawnSlime(2*tileSize,22*tileSize);
                
                
                // Spawn de golems
                this.spawnGolem(50 * tileSize, 50 * tileSize);
                this.spawnGolem(62 * tileSize, 52 * tileSize);
                this.spawnGolem(48 * tileSize, 48 * tileSize);
                // Spawn de Reaper
                this.spawnReaper(40 * tileSize, 18 * tileSize);
                this.spawnReaper(42 * tileSize, 10 * tileSize);
                this.spawnReaper(90 * tileSize, 45 * tileSize);
                this.spawnReaper(85 * tileSize, 40 * tileSize);
                
                [this.blocks1,this.blocks2,this.blocks3,this.blocks4].forEach(layer => this.physics.add.collider(this.enemies, layer));
            }
        }, null, this);
    }

    updateHealthBar() {
        if (this.healthBarRect) {
            const percent = Phaser.Math.Clamp(this.currentHealth / this.maxHealth, 0, 1);
            this.healthBarRect.width = 200 * percent;
        }
        if (this.healthBarText) {
            this.healthBarText.setText(`${this.currentHealth}/${this.maxHealth}`);
        }
        // Atualiza barra de vida acima do player
        if (this.playerHealthBar) {
            const percent = Phaser.Math.Clamp(this.currentHealth / this.maxHealth, 0, 1);
            this.playerHealthBar.width = 36 * percent;
        }
        if (this.currentHealth <= 0 && !this.isPlayerDead) {
            this.playerDies();
        }
    }

    playerDies() {
        this.isPlayerDead = true;
        this.player.setTint(0x555555);
        this.player.setVelocity(0);
        this.player.anims.stop();

        // Fade out
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        // Quando o fade out terminar, muda para a DeathScene
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('DeathScene');
        });
    }

    createAnimations() {
        this.anims.create({ key:'idle', frames:this.anims.generateFrameNumbers('adventurer',{start:0,end:3}), frameRate:4, repeat:-1 });
        this.anims.create({ key:'left', frames:this.anims.generateFrameNumbers('adventurer',{start:4,end:7}), frameRate:6, repeat:-1 });
        this.anims.create({ key:'right', frames:this.anims.generateFrameNumbers('adventurer',{start:8,end:11}), frameRate:6, repeat:-1 });
        this.anims.create({ key:'up', frames:this.anims.generateFrameNumbers('adventurer',{start:12,end:15}), frameRate:6, repeat:-1 });
        this.anims.create({ key:'down', frames:this.anims.generateFrameNumbers('adventurer',{start:20,end:23}), frameRate:6, repeat:-1 });
        this.anims.create({ key:'run', frames:this.anims.generateFrameNumbers('adventurer_run',{start:0,end:5}), frameRate:8, repeat:-1 });
        this.anims.create({ key:'attack', frames:this.anims.generateFrameNumbers('adventurer',{start:45,end:55}), frameRate:6, repeat:0 });
        this.anims.create({ key:'quick_attack', frames:this.anims.generateFrameNumbers('adventurer',{start:24,end:27}), frameRate:16, repeat:0 });

        // SLIME ANIMATIONS (corrigido para 0-15)
        this.anims.create({ key:'slime_walk', frames:this.anims.generateFrameNumbers('slime',{start:0,end:7}), frameRate:8, repeat:-1 });
        this.anims.create({ key:'slime_attack', frames:this.anims.generateFrameNumbers('slime',{start:8,end:15}), frameRate:8, repeat:0 });
        this.anims.create({ key:'slime_die', frames:this.anims.generateFrameNumbers('slime',{start:15,end:15}), frameRate:8, repeat:0 });

        // GOLEM ANIMATIONS 
        this.anims.create({ key:'golem_idle', frames:this.anims.generateFrameNumbers('golem',{start:0,end:5}), frameRate:6, repeat:-1 });
        this.anims.create({ key:'golem_walk', frames:this.anims.generateFrameNumbers('golem',{start:6,end:11}), frameRate:8, repeat:-1 });
        this.anims.create({ key:'golem_attack', frames:this.anims.generateFrameNumbers('golem',{start:12,end:17}), frameRate:10, repeat:0 });
        this.anims.create({ key:'golem_die', frames:this.anims.generateFrameNumbers('golem',{start:36,end:41}), frameRate:8, repeat:0 });

        // REAPER ANIMATIONS
        this.anims.create({ key:'reaper_idle', frames:this.anims.generateFrameNumbers('reaper',{start:0,end:3}), frameRate:6, repeat:-1 });
        this.anims.create({ key:'reaper_walk', frames:this.anims.generateFrameNumbers('reaper',{start:4,end:7}), frameRate:8, repeat:-1 });
        this.anims.create({ key:'reaper_attack', frames:this.anims.generateFrameNumbers('reaper',{start:8,end:11}), frameRate:10, repeat:0 });
        this.anims.create({ key:'reaper_die', frames:this.anims.generateFrameNumbers('reaper',{start:12,end:25}), frameRate:8, repeat:0 });
    }

    spawnSlime(x,y) {
        const slime = this.enemies.create(x,y,'slime');
        slime.setCollideWorldBounds(true);
        slime.health=30; slime.maxHealth=30; slime.damage=10;
        slime.state='idle'; slime.nextMoveTime=0;
        slime.setDepth(10); slime.play('slime_walk');
        slime.isAttacking = false;
        slime.body.setImmovable(false);
        slime.body.setSize(20, 18).setOffset(6, 12);
       
        slime.on('animationcomplete-slime_attack', (anim, frame, sprite) => {
            const s = sprite || slime;
            if (!s || !s.active || !s.anims) return;
            s.isAttacking = false;
            s.state = 'walk';
            if (s.anims && this.anims.exists('slime_walk')) s.play('slime_walk', true);
        });
        return slime;
    }

    spawnGolem(x, y) {
        const golem = this.enemies.create(x, y, 'golem');
        golem.setCollideWorldBounds(true);
        golem.health = 100;
        golem.maxHealth = 100;
        golem.damage = 20;
        golem.state = 'idle';
        golem.nextMoveTime = 0;
        golem.setDepth(10);
        golem.play('golem_idle');
        golem.isAttacking = false;
        golem.body.setImmovable(false);
        golem.body.setSize(44, 48).setOffset(10, 7);
        golem.on('animationcomplete-golem_attack', (anim, frame, sprite) => {
            const g = sprite || golem;
            if (!g || !g.active || !g.anims) return;
            g.isAttacking = false;
            g.state = 'walk';
            if (g.anims && this.anims.exists('golem_walk')) g.play('golem_walk', true);
        });
        [this.blocks1, this.blocks2, this.blocks3, this.blocks4].forEach(layer => {
            this.physics.add.collider(golem, layer);
        });
        this.physics.add.collider(golem, this.enemies);
        return golem;
    }

    spawnReaper(x, y) {
        const reaper = this.enemies.create(x, y, 'reaper');
        reaper.health = 30;
        reaper.maxHealth = 30;
        reaper.damage = 15;
        reaper.state = 'idle';
        reaper.nextMoveTime = 0;
        reaper.setDepth(10);
        reaper.play('reaper_idle');
        reaper.isAttacking = false;
        reaper.body.setImmovable(false);
        reaper.body.setSize(44, 56).setOffset(10, 8);
        // Não colide com nada!
        reaper.body.checkCollision.none = true;
        reaper.on('animationcomplete-reaper_attack', (anim, frame, sprite) => {
            const r = sprite || reaper;
            if (!r || !r.active || !r.anims) return;
            r.isAttacking = false;
            r.state = 'walk';
            if (r.anims && this.anims.exists('reaper_walk')) r.play('reaper_walk', true);
        });
        return reaper;
    }

    onPlayerHit(player, slime) {
        if (slime.state==='die' || this.isPlayerDead) return;
        if (!slime.isAttacking && Phaser.Math.Distance.Between(slime.x,slime.y,player.x,player.y)<48) {
            slime.isAttacking=true; slime.state='attack'; slime.setVelocity(0); slime.play('slime_attack', true);
            this.currentHealth -= slime.damage;
            this.lastDamageTime = this.time.now;
            this.nextRegenTime = this.time.now + this.regenDelay; // reset ao cronómetro de regen
            this.regenStartHealth = this.currentHealth;
            this.updateHealthBar();
            this.time.delayedCall(800, ()=>{
                slime.isAttacking=false; slime.state='walk'; slime.play('slime_walk', true);
            });
        }
    }

    playerAttack(type = 'quick') {
        const attackDamage = type === 'charge' ? 40 : 15;
        if (this.enemies) {
            this.enemies.children.iterate(slime => {
                if (!slime || slime.state === 'die') return;
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, slime.x, slime.y);
                if (dist < 48) {
                    slime.health -= attackDamage;
                    if (slime.texture.key !== 'golem') {
                        slime.setTint(0xffffff);
                        this.time.delayedCall(100, () => slime.clearTint());
                    }
                }
            });
        }
    }

    update(time,delta) {
        if (this.isAttacking || this.isQuickAttacking) { this.player.setVelocity(0); return; }
        const speed=120; this.player.setVelocity(0);
        // Ataque rápido (Espaço)
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.isQuickAttacking = true;
            this.player.play('quick_attack',true);
            this.playerAttack('quick');
            return;
        }
        // Ataque carregado (C)
        if (Phaser.Input.Keyboard.JustDown(this.chargeAttackKey)) {
            this.isAttacking = true;
            this.player.play('attack',true);
            this.playerAttack('charge');
            return;
        }
        if (this.cursors.left.isDown||this.wasd.left.isDown) { this.player.setVelocityX(-speed); this.player.anims.play('run',true); this.player.setFlipX(true); }
        else if (this.cursors.right.isDown||this.wasd.right.isDown) { this.player.setVelocityX(speed); this.player.anims.play('run',true); this.player.setFlipX(false); }
        else if (this.cursors.up.isDown||this.wasd.up.isDown) { this.player.setVelocityY(-speed); this.player.anims.play('up',true); }
        else if (this.cursors.down.isDown||this.wasd.down.isDown) { this.player.setVelocityY(speed); this.player.anims.play('down',true); }
        else { this.player.anims.play('idle',true); }

        // Verifica condição de vitória
        if (this.enemies.getChildren().length === 0) { // Se todos os inimigos estiverem mortos
            // Pega o tile na posição atual do player
            const playerTileX = Math.floor(this.player.x / 32);
            const playerTileY = Math.floor(this.player.y / 32);
            
            // Verifica se o player está em um tile do tipo 472 (tile de vitória)
            const victoryTile = this.blocks1.getTileAt(playerTileX, playerTileY) || 
                              this.blocks2.getTileAt(playerTileX, playerTileY) ||
                              this.blocks3.getTileAt(playerTileX, playerTileY) ||
                              this.blocks4.getTileAt(playerTileX, playerTileY);
            
            if (victoryTile && victoryTile.index === 472) {
                // Inicia a sequência de vitória
                this.cameras.main.fadeOut(1000);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('WinScene');
                });
            }
        }

        if (this.enemies) this.enemies.children.iterate(enemy => {
            if (!enemy || !enemy.body || !enemy.active || enemy.state === 'die') return;

            // Verificar morte primeiro, antes de qualquer outra lógica
            if (enemy.health <= 0 && enemy.state !== 'die') {
                this.handleEnemyDeath(enemy);
                return;
            }

            // GOLEM IA
            if (enemy.texture.key === 'golem') {
                this.updateGolemAI(enemy, time);
                return;
            }

            // REAPER IA
            if (enemy.texture.key === 'reaper') {
                this.updateReaperAI(enemy, time);
                return;
            }

            // SLIME IA (default)
            this.updateSlimeAI(enemy, time);
        });
        // Atualiza posição da barra de vida acima do player
        if (this.player && this.playerHealthBar && this.playerHealthBarBg) {
            const offsetY = -10; // pixels acima da cabeça
            this.playerHealthBarBg.x = this.player.x;
            this.playerHealthBarBg.y = this.player.y + offsetY;
            this.playerHealthBar.x = this.player.x;
            this.playerHealthBar.y = this.player.y + offsetY - 2;
        }
        // Regeneração de vida do player
        if (!this.isPlayerDead && this.currentHealth > 0 && this.currentHealth < this.maxHealth) {
            if (time > this.nextRegenTime) {
                // Só pode curar até 50 pontos acima do valor inicial da regeneração
                const maxRegen = Math.min(this.regenStartHealth + 50, this.maxHealth);
                this.currentHealth = Math.min(this.currentHealth + this.regenAmount, maxRegen);
                this.updateHealthBar();
                this.nextRegenTime = time + this.regenRate;
            }
        }
    }

    handleEnemyDeath(enemy) {
        if (!enemy || !enemy.active) return;
        
        enemy.state = 'die';
        enemy.setVelocity(0);
        
        switch(enemy.texture.key) {
            case 'slime':
                if (enemy.anims && this.anims.exists('slime_die')) {
                    enemy.play('slime_die', true);
                    this.time.delayedCall(500, () => {
                        if (enemy && enemy.active) enemy.destroy();
                    });
                }
                break;
                
            case 'golem':
                if (enemy.anims && this.anims.exists('golem_die')) {
                    enemy.play('golem_die', true);
                    this.time.delayedCall(700, () => {
                        if (enemy && enemy.active) enemy.destroy();
                    });
                }
                break;
                
            case 'reaper':
                if (enemy.anims && this.anims.exists('reaper_die')) {
                    enemy.play('reaper_die', true);
                    this.time.delayedCall(600, () => {
                        if (enemy && enemy.active) enemy.destroy();
                    });
                }
                break;
                
            default:
                if (enemy && enemy.active) enemy.destroy();
        }
    }

    updateGolemAI(enemy, time) {
        if (enemy.health<=0 && enemy.state!=='die') {
            enemy.state='die';
            enemy.setVelocity(0);
            if (enemy.anims && this.anims.exists('golem_die')) enemy.play('golem_die', true);
            this.time.delayedCall(700,()=>{ if(enemy && enemy.active) enemy.destroy(); });
            return;
        }
        if (enemy.state==='attack' || enemy.isAttacking) {
            enemy.setVelocity(0);
            return;
        }
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (dist < 56) {
            if (!enemy.isAttacking) {
                enemy.isAttacking = true;
                enemy.state = 'attack';
                enemy.setVelocity(0);
                if (enemy.anims && this.anims.exists('golem_attack')) enemy.play('golem_attack', true);
                this.currentHealth -= enemy.damage;
                this.updateHealthBar();
            }
            return;
        }
        if (dist < 220) {
            enemy.state = 'walk';
            this.physics.moveToObject(enemy, this.player, 60);
            if (this.player.x < enemy.x) {
                enemy.setFlipX(false);
            } else {
                enemy.setFlipX(true);
            }
            if (enemy.anims && enemy.anims.currentAnim && enemy.anims.currentAnim.key !== 'golem_walk' && this.anims.exists('golem_walk')) {
                enemy.play('golem_walk', true);
            }
        } else {
            if (enemy.state !== 'idle') {
                enemy.state = 'idle';
                enemy.setVelocity(0);
            }
            if (time > enemy.nextMoveTime) {
                const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                const vx = Math.cos(angle) * 20;
                enemy.setVelocity(vx, Math.sin(angle) * 20);
                if (vx < 0) {
                    enemy.setFlipX(false);
                } else {
                    enemy.setFlipX(true);
                }
                enemy.nextMoveTime = time + Phaser.Math.Between(1000, 2000);
                if (enemy.anims && enemy.anims.currentAnim && enemy.anims.currentAnim.key !== 'golem_walk' && this.anims.exists('golem_walk')) {
                    enemy.play('golem_walk', true);
                }
            }
        }
    }

    updateReaperAI(enemy, time) {
        if (enemy.health<=0 && enemy.state!=='die') {
            enemy.state='die';
            enemy.setVelocity(0);
            if (enemy.anims && this.anims.exists('reaper_die')) enemy.play('reaper_die', true);
            this.time.delayedCall(600,()=>{ if(enemy && enemy.active) enemy.destroy(); });
            return;
        }
        if (enemy.state==='attack' || enemy.isAttacking) {
            enemy.setVelocity(0);
            return;
        }
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (dist < 48) {
            if (!enemy.isAttacking) {
                enemy.isAttacking = true;
                enemy.state = 'attack';
                enemy.setVelocity(0);
                if (enemy.anims && this.anims.exists('reaper_attack')) enemy.play('reaper_attack', true);
                this.currentHealth -= enemy.damage;
                this.updateHealthBar();
            }
            return;
        }
        if (dist < 250) {  // Aumenta o alcance de detecção
            enemy.state = 'chase';
            this.physics.moveToObject(enemy, this.player, 100);  // Aumenta a velocidade
            if (this.player.x < enemy.x) {
                enemy.setFlipX(false);
            } else {
                enemy.setFlipX(true);
            }
            if (enemy.anims && enemy.anims.currentAnim && enemy.anims.currentAnim.key !== 'reaper_walk' && this.anims.exists('reaper_walk')) {
                enemy.play('reaper_walk', true);
            }
        } else {  // Se não detectou o player, procura por ele
            enemy.state = 'search';
            // Move em direção ao último local conhecido do player, mas mais lentamente
            this.physics.moveToObject(enemy, this.player, 50);
            if (enemy.anims && enemy.anims.currentAnim && enemy.anims.currentAnim.key !== 'reaper_walk' && this.anims.exists('reaper_walk')) {
                enemy.play('reaper_walk', true);
            }
        }
    }

    updateSlimeAI(enemy, time) {
        if (enemy.health<=0 && enemy.state!=='die') {
            enemy.state='die';
            enemy.setVelocity(0);
            if (enemy.texture.key === 'slime' && enemy.anims && this.anims.exists('slime_die')) {
                enemy.play('slime_die', true);
                this.time.delayedCall(500,()=>{ if(enemy && enemy.active) enemy.destroy(); });
            } else if (enemy.texture.key === 'golem' && enemy.anims && this.anims.exists('golem_die')) {
                enemy.play('golem_die', true);
                this.time.delayedCall(700,()=>{ if(enemy && enemy.active) enemy.destroy(); });
            } else {
                if(enemy && enemy.active) enemy.destroy();
            }
            return;
        }
        if (enemy.state==='attack' || enemy.isAttacking) {
            enemy.setVelocity(0);
            return;
        }
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (dist < 48) {
            if (!enemy.isAttacking) {
                enemy.isAttacking = true;
                enemy.state = 'attack';
                enemy.setVelocity(0);
                if (enemy.anims && this.anims.exists('slime_attack')) enemy.play('slime_attack', true);
                this.currentHealth -= enemy.damage;
                this.updateHealthBar();
            }
            return;
        }
        if (dist < 180) {
            enemy.state = 'chase';
            this.physics.moveToObject(enemy, this.player, 60);
            if (this.player.x < enemy.x) {
                enemy.setFlipX(false);
            } else {
                enemy.setFlipX(true);
            }
            if (enemy.anims && enemy.anims.currentAnim && enemy.anims.currentAnim.key !== 'slime_walk' && this.anims.exists('slime_walk')) {
                enemy.play('slime_walk', true);
            }
        } else {
            if (enemy.state !== 'idle') {
                enemy.state = 'idle';
                enemy.setVelocity(0);
            }
            if (time > enemy.nextMoveTime) {
                const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                const vx = Math.cos(angle) * 20;
                enemy.setVelocity(vx, Math.sin(angle) * 20);
                if (vx < 0) {
                    enemy.setFlipX(false);
                } else {
                    enemy.setFlipX(true);
                }
                enemy.nextMoveTime = time + Phaser.Math.Between(1000, 2000);
                if (enemy.anims && enemy.anims.currentAnim && enemy.anims.currentAnim.key !== 'slime_walk' && this.anims.exists('slime_walk')) {
                    enemy.play('slime_walk', true);
                }
            }
        }
    }
}

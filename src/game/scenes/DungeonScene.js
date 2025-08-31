import Phaser from 'phaser';
import axios from "axios";

export default class DungeonScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DungeonScene' });
    }

    preload() { }

    create() {
        const W = 1200, H = 900;
        // this.cameras.main.setBackgroundColor('#888888');

        // Cursor
        this.targetSprite = this.add.image(0, 0, 'targetRound')
            .setDepth(999)     // biar selalu di depan
            .setScale(0.7)     // sesuaikan ukuran
            .setVisible(false);

        // Sembunyikan cursor asli
        this.game.canvas.style.cursor = 'none';

        // Update posisi saat pointer bergerak
        this.input.on('pointermove', (pointer) => {
            this.targetSprite.setVisible(true);
            this.targetSprite.x = pointer.worldX;
            this.targetSprite.y = pointer.worldY;
        });

        // Update juga saat pointer down (biar di mobile muncul target saat sentuh)
        this.input.on('pointerdown', (pointer) => {
            this.targetSprite.setVisible(true);
            this.targetSprite.x = pointer.worldX;
            this.targetSprite.y = pointer.worldY;
        });

        // Sembunyikan lagi kalau pointer keluar
        this.input.on('pointerout', () => {
            this.targetSprite.setVisible(false);
        });

        // variabel offset untuk efek getar
        this.pointerOffset = { x: 0, y: 0 };

        // Gameplay image
        this.add.image(600, 420, 'gameplayBg')
            .setOrigin(0.5)
            .setScale(1.1);

        // Icon Zombie dead
        this.add.image(50, 50, 'iconDead')
            .setOrigin(0.5)
            .setScale(0.1);

        // Create pistol texture
        this.createPistolTexture();

        // PERBAIKAN: Set bounds yang lebih besar untuk physics world
        this.physics.world.setBounds(0, 0, W, H);

        // player
        this.player = this.physics.add.sprite(W / 2, H / 2, 'player').setDepth(2);
        this.player.setCollideWorldBounds(true);

        // PERBAIKAN: Atur physics body sesuai dengan asset baru
        this.player.setScale(0.27); // contoh scale visual
        this.player.body.setSize(150, 150);
        this.player.body.setOffset(80, 80);
        this.player.speed = 200;
        this.player.maxHealth = 300;
        this.player.health = this.player.maxHealth;
        this.player.lastHit = 0;
        this.player.invulnMs = 700;

        // Background Musik Playgame
        this.gameMusic = this.sound.add('gameBgm', { loop: true, volume: 0.5 });
        this.gameMusic.play();

        // Fisik peluru bullet dari gambar
        this.bullets = this.physics.add.group({
            defaultKey: 'bulletImg',
            maxSize: 50,
            createCallback: bullet => {
                bullet.setOrigin(0.5, 0.5);
                bullet.setCircle(4);
                bullet.body.setOffset(
                    bullet.width / 2 - 4,  
                    bullet.height / 2 - 4
                );
            }
        });

        // Grup zombie
        this.enemies = this.physics.add.group();

        // konfigurasi enemy types
        this.ENEMY_TYPES = {
            1: { key: 'enemy1', hp: 40, speed: 60, scale: 0.22 },
            2: { key: 'enemy2', hp: 80, speed: 80, scale: 0.25 },
            3: { key: 'enemy3', hp: 300, speed: 80, scale: 0.32 },
            4: { key: 'enemy4', hp: 60, speed: 180, scale: 0.28 },
            5: { key: 'enemy5', hp: 300, speed: 150, scale: 0.32 },
            6: { key: 'enemy6', hp: 500, speed: 180, scale: 0.32 },
        };

        this.WAVE_CONFIG = {
            // --- Early Game (1–20) ---
            // 1: { 1: 5 },
            1: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 },
            2: { 1: 6, 2: 2 },
            3: { 1: 6, 2: 4 },
            4: { 1: 5, 2: 6 },
            5: { 1: 8, 2: 4 },
            6: { 1: 10, 2: 5 },
            7: { 1: 8, 2: 6, 4: 2 },
            8: { 1: 6, 2: 8, 4: 2 },
            9: { 1: 8, 2: 10 },
            10: { 1: 6, 2: 8, 3: 2 },

            11: { 1: 10, 2: 6, 3: 2 },
            12: { 1: 12, 2: 6, 4: 3 },
            13: { 1: 10, 2: 8, 3: 3 },
            14: { 1: 12, 2: 8, 4: 3 },
            15: { 1: 10, 2: 10, 3: 4 },
            16: { 1: 14, 2: 10 },
            17: { 1: 12, 2: 8, 4: 4 },
            18: { 1: 14, 2: 8, 3: 2, 4: 2 },
            19: { 1: 16, 2: 10, 3: 3 },
            20: { 1: 10, 2: 10, 3: 4, 4: 4 },

            // --- Mid Game (21–40) ---
            21: { 2: 12, 3: 4, 4: 2 },
            22: { 2: 10, 3: 6, 4: 2 },
            23: { 2: 12, 3: 6, 4: 3 },
            24: { 1: 10, 2: 12, 3: 6 },
            25: { 2: 12, 3: 6, 4: 4 },
            26: { 1: 8, 2: 12, 3: 8, 4: 2 },
            27: { 2: 14, 3: 6, 4: 4 },
            28: { 1: 10, 2: 10, 3: 10 },
            29: { 2: 12, 3: 8, 4: 5 },
            30: { 1: 6, 2: 10, 3: 10, 4: 6 },

            31: { 2: 12, 3: 12, 4: 6 },
            32: { 2: 14, 3: 12 },
            33: { 1: 10, 2: 10, 3: 12 },
            34: { 2: 12, 3: 12, 4: 8 },
            35: { 2: 14, 3: 12, 4: 6 },
            36: { 1: 10, 2: 12, 3: 14 },
            37: { 2: 16, 3: 12, 4: 6 },
            38: { 2: 12, 3: 14, 4: 8 },
            39: { 2: 14, 3: 14, 4: 6 },
            40: { 2: 16, 3: 14, 4: 8 },

            // --- Hard (41–60) ---
            41: { 2: 12, 3: 16, 4: 8 },
            42: { 2: 14, 3: 16, 4: 10 },
            43: { 2: 12, 3: 18, 4: 10 },
            44: { 2: 16, 3: 16, 4: 12 },
            45: { 2: 14, 3: 18, 4: 12 },
            46: { 2: 18, 3: 16, 4: 10 },
            47: { 2: 16, 3: 18, 4: 12 },
            48: { 2: 18, 3: 18, 4: 12 },
            49: { 2: 16, 3: 20, 4: 12 },
            50: { 2: 18, 3: 20, 4: 14 },

            51: { 3: 20, 4: 14 },
            52: { 3: 22, 4: 14 },
            53: { 3: 20, 4: 16 },
            54: { 3: 22, 4: 16 },
            55: { 3: 24, 4: 16 },
            56: { 3: 20, 4: 18 },
            57: { 3: 22, 4: 18 },
            58: { 3: 24, 4: 18 },
            59: { 3: 22, 4: 20 },
            60: { 3: 24, 4: 20 },

            // --- Very Hard (61–80) ---
            61: { 3: 20, 4: 20, 5: 2 },
            62: { 3: 22, 4: 20, 5: 3 },
            63: { 3: 24, 4: 20, 5: 4 },
            64: { 3: 22, 4: 22, 5: 4 },
            65: { 3: 24, 4: 22, 5: 5 },
            66: { 3: 26, 4: 22, 5: 6 },
            67: { 3: 24, 4: 24, 5: 6 },
            68: { 3: 26, 4: 24, 5: 7 },
            69: { 3: 28, 4: 24, 5: 8 },
            70: { 3: 30, 4: 24, 5: 8 },

            71: { 3: 28, 4: 26, 5: 8 },
            72: { 3: 30, 4: 26, 5: 9 },
            73: { 3: 28, 4: 28, 5: 10 },
            74: { 3: 30, 4: 28, 5: 10 },
            75: { 3: 32, 4: 28, 5: 10 },
            76: { 3: 30, 4: 30, 5: 12 },
            77: { 3: 32, 4: 30, 5: 12 },
            78: { 3: 34, 4: 30, 5: 12 },
            79: { 3: 32, 4: 32, 5: 14 },
            80: { 3: 34, 4: 32, 5: 14 },

            // --- Endgame (81–100) ---
            81: { 3: 32, 4: 34, 5: 14 },
            82: { 3: 34, 4: 34, 5: 15 },
            83: { 3: 36, 4: 34, 5: 16 },
            84: { 3: 34, 4: 36, 5: 16 },
            85: { 3: 36, 4: 36, 5: 18 },
            86: { 3: 38, 4: 36, 5: 18 },
            87: { 3: 36, 4: 38, 5: 18 },
            88: { 3: 38, 4: 38, 5: 20 },
            89: { 3: 40, 4: 38, 5: 20 },
            90: { 3: 42, 4: 38, 5: 20 },

            91: { 3: 40, 4: 40, 5: 22 },
            92: { 3: 42, 4: 40, 5: 22 },
            93: { 3: 44, 4: 40, 5: 24 },
            94: { 3: 42, 4: 42, 5: 24 },
            95: { 3: 44, 4: 42, 5: 25 },
            96: { 3: 46, 4: 42, 5: 26 },
            97: { 3: 44, 4: 44, 5: 26 },
            98: { 3: 46, 4: 44, 5: 28 },
            99: { 3: 48, 4: 44, 5: 28 },
            100: { 3: 50, 4: 46, 5: 30 },

            // lanjutan wave
            101: { 3: 52, 4: 48, 5: 32, 6: 2 },
            102: { 3: 54, 4: 50, 5: 34, 6: 3 },
            103: { 3: 56, 4: 52, 5: 36, 6: 4 },
            104: { 3: 58, 4: 54, 5: 38, 6: 5 },
            105: { 3: 60, 4: 56, 5: 40, 6: 6 },

            106: { 2: 20, 3: 62, 4: 58, 5: 42, 6: 7 },
            107: { 2: 18, 3: 64, 4: 60, 5: 44, 6: 8 },
            108: { 2: 16, 3: 66, 4: 62, 5: 46, 6: 9 },
            109: { 2: 14, 3: 68, 4: 64, 5: 48, 6: 10 },
            110: { 2: 12, 3: 70, 4: 66, 5: 50, 6: 12 },

            111: { 3: 72, 4: 68, 5: 52, 6: 14 },
            112: { 3: 74, 4: 70, 5: 54, 6: 16 },
            113: { 3: 76, 4: 72, 5: 56, 6: 18 },
            114: { 3: 78, 4: 74, 5: 58, 6: 20 },
            115: { 3: 80, 4: 76, 5: 60, 6: 22 },

            116: { 3: 82, 4: 78, 5: 62, 6: 24 },
            117: { 3: 84, 4: 80, 5: 64, 6: 26 },
            118: { 3: 86, 4: 82, 5: 66, 6: 28 },
            119: { 3: 88, 4: 84, 5: 68, 6: 30 },
            120: { 3: 90, 4: 86, 5: 70, 6: 32 },

            121: { 3: 92, 4: 88, 5: 72, 6: 34 },
            122: { 3: 94, 4: 90, 5: 74, 6: 36 },
            123: { 3: 96, 4: 92, 5: 76, 6: 38 },
            124: { 3: 98, 4: 94, 5: 78, 6: 40 },
            125: { 3: 100, 4: 96, 5: 80, 6: 42 },

            126: { 3: 102, 4: 98, 5: 82, 6: 44 },
            127: { 3: 104, 4: 100, 5: 84, 6: 46 },
            128: { 3: 106, 4: 102, 5: 86, 6: 48 },
            129: { 3: 108, 4: 104, 5: 88, 6: 50 },
            130: { 3: 110, 4: 106, 5: 90, 6: 52 },

            131: { 3: 112, 4: 108, 5: 92, 6: 54 },
            132: { 3: 114, 4: 110, 5: 94, 6: 56 },
            133: { 3: 116, 4: 112, 5: 96, 6: 58 },
            134: { 3: 118, 4: 114, 5: 98, 6: 60 },
            135: { 3: 120, 4: 116, 5: 100, 6: 62 },

            136: { 3: 122, 4: 118, 5: 102, 6: 64 },
            137: { 3: 124, 4: 120, 5: 104, 6: 66 },
            138: { 3: 126, 4: 122, 5: 106, 6: 68 },
            139: { 3: 128, 4: 124, 5: 108, 6: 70 },
            140: { 3: 130, 4: 126, 5: 110, 6: 72 },

            141: { 3: 132, 4: 128, 5: 112, 6: 74 },
            142: { 3: 134, 4: 130, 5: 114, 6: 76 },
            143: { 3: 136, 4: 132, 5: 116, 6: 78 },
            144: { 3: 138, 4: 134, 5: 118, 6: 80 },
            145: { 3: 140, 4: 136, 5: 120, 6: 82 },

            146: { 3: 142, 4: 138, 5: 122, 6: 84 },
            147: { 3: 144, 4: 140, 5: 124, 6: 86 },
            148: { 3: 146, 4: 142, 5: 126, 6: 88 },
            149: { 3: 148, 4: 144, 5: 128, 6: 90 },
            150: { 3: 150, 4: 146, 5: 130, 6: 100 },
        };

        // sound tembakan
        this.shootSound = this.sound.add('shoot', { volume: 2 });

        // HUD
        this.score = 0; this.wave = 1;
        this.scoreText = this.add.text(80, 38, '0', {
            fontFamily: '"Press Start 2P"',
            fontSize: '23px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 6
        });
        this.waveText = this.add.text(1070, 850, 'WAVE 1', {
            fontFamily: '"Press Start 2P"',
            fontSize: '15px',
            fill: '#ffff00'
        });

        // Tombol pause
        this.pauseBtn = this.add.text(W - 150, 30, 'PAUSE', {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setInteractive().setDepth(10);

        this.pauseBtn.on('pointerdown', () => {
            this.game.canvas.style.cursor = 'default';
            this.scene.launch('PauseScene');   // buka scene Pause
            this.scene.pause();                // pause game utama
        });

        // Player health bar
        this.playerHealthBar = this.add.graphics().setDepth(2);
        this.updatePlayerHealthBar();

        // input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.on('pointerdown', (ptr) => this.shootBullet(ptr));

        // Auto-shooting
        this.isMouseDown = false;
        this.input.on('pointerup', () => this.isMouseDown = false);
        this.input.on('pointerdown', () => this.isMouseDown = true);
        this.lastShotTime = 0;
        this.shootCooldown = 100;

        // collisions - PERBAIKAN UTAMA: Pastikan overlap tetap aktif
        this.physics.add.overlap(this.bullets, this.enemies, this.onBulletHitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.onEnemyTouchPlayer, null, this);

        // spawn loop
        this.spawnRate = 1400;
        this.maxEnemies = 6;

        // crosshair
        this.cross = this.add.image(W - 20, 20, 'cross').setScale(0.9).setScrollFactor(0);

        // mulai wave pertama
        this.startWave(this.wave);
    }

    startWave(waveNumber) {
        this.wave = waveNumber;
        this.waveText.setText('WAVE ' + this.wave);

        const config = this.WAVE_CONFIG[waveNumber];
        if (!config) {
            console.log("All waves finished!");
            return;
        }

        // spawn sesuai config
        for (let type in config) {
            const count = config[type];
            for (let i = 0; i < count; i++) {
                this.spawnEnemy(parseInt(type));
            }
        }
    }

    stopMusic() {
        this.gameMusic.stop();
    }

    createPistolTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        // pistol
        g.fillStyle(0x555555, 1); g.fillRect(0, 6, 20, 6);
        g.fillStyle(0x999999, 1); g.fillRect(20, 8, 6, 2);
        g.generateTexture('pistol', 26, 16); g.clear();

        // bullet
        g.fillStyle(0xffe17a, 1); g.fillCircle(4, 4, 4);
        g.generateTexture('bullet', 8, 8); g.clear();

        // cross
        g.lineStyle(2, 0xffffff, 1); g.strokeCircle(8, 8, 7);
        g.strokeLineShape(new Phaser.Geom.Line(8, 1, 8, 3));
        g.strokeLineShape(new Phaser.Geom.Line(8, 13, 8, 15));
        g.generateTexture('cross', 16, 16); g.clear();

        // hit effect
        g.fillStyle(0xffffff, 1); g.fillCircle(0, 0, 3);
        g.generateTexture('hit', 6, 6); g.clear();
    }

    spawnEnemy(typeId) {
        const W = 1200, H = 900;
        const config = this.ENEMY_TYPES[typeId];
        if (!config) return;

        // posisi random di tepi layar
        const edge = Phaser.Math.Between(0, 3);
        let x = 0, y = 0;
        if (edge === 0) { x = Phaser.Math.Between(0, W); y = -20; }
        else if (edge === 1) { x = Phaser.Math.Between(0, W); y = H + 20; }
        else if (edge === 2) { x = -20; y = Phaser.Math.Between(0, H); }
        else { x = W + 20; y = Phaser.Math.Between(0, H); }

        const e = this.physics.add.sprite(x, y, config.key);
        e.setScale(config.scale);
        e.body.setSize(200, 200);
        e.body.setOffset(80, 80);

        e.speed = config.speed;
        e.maxHP = config.hp;
        e.hp = e.maxHP;

        // <<< UPDATE: tambahkan healthBar untuk tiap musuh
        e.healthBar = this.add.graphics();
        e.healthBar.setDepth(10);

        // <<< UPDATE: hancurkan healthBar saat musuh mati
        e.on('destroy', () => {
            if (e.healthBar) {
                e.healthBar.destroy();
                e.healthBar = null;
            }
        });

        this.enemies.add(e);
    }

    shootBullet(pointer) {
        const p = pointer || this.input.activePointer;
        this.shootSound.play();

        // --- Atur offset mulut senjata (dalam koordinat lokal sprite) ---
        const muzzleForward = 50;  // jarak ke depan dari pusat badan menuju arah laras
        const muzzleUp = 18;  // + turun, - naik relatif ke sprite (karena sumbu Y layar ke bawah)

        // Sudut orientasi player saat ini
        const a = this.player.rotation;

        // Jika kamu tetap pakai flipY di update(), kita butuh balik offset vertikalnya
        const ly = this.player.flipY ? -muzzleUp : muzzleUp;

        // Konversi offset lokal -> dunia (rotasi 2D standar)
        const sx = this.player.x + (muzzleForward * Math.cos(a)) - (ly * Math.sin(a));
        const sy = this.player.y + (muzzleForward * Math.sin(a)) + (ly * Math.cos(a));

        // Sudut tembakan harus dari MULUT SENJATA ke pointer, biar selalu lurus ke pointer
        const shotAngle = Phaser.Math.Angle.Between(sx, sy, p.worldX, p.worldY);

        // Ambil peluru dari pool
        const bullet = this.bullets.get(sx, sy, 'bulletImg');
        if (!bullet) return;

        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setCircle(4);
        bullet.attack = 18;

        // Kecepatan peluru mengikuti shotAngle
        const speed = 520;
        this.physics.velocityFromRotation(shotAngle, speed, bullet.body.velocity);

        // arah tembakan PNG
        bullet.setRotation(shotAngle + Phaser.Math.DegToRad(180));

        // Umur + efek
        bullet.lifespan = 1200;
        this.createMuzzleFlash(sx, sy, shotAngle);

        // 🔥 ditambahkan: Efek getar pada custom pointer (sprite crosshair)
        if (this.targetSprite) {
            this.tweens.add({
                targets: this.pointerOffset,
                x: Phaser.Math.Between(-5, 5),
                y: Phaser.Math.Between(-5, 5),
                duration: 40,
                yoyo: true,
                repeat: 2,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    this.pointerOffset.x = 0;
                    this.pointerOffset.y = 0;
                }
            });
        }
    }

    createMuzzleFlash(x, y, angle) {
        const flash = this.add.graphics();
        flash.fillStyle(0xFFFF00, 1);
        flash.fillCircle(0, 0, 4);
        flash.setPosition(x, y);
        flash.setDepth(4);

        // Posisikan flash di ujung pistol
        flash.x += Math.cos(angle) * 20;
        flash.y += Math.sin(angle) * 20;

        // Animasi fade out
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 80,
            onComplete: () => flash.destroy()
        });
    }

    createHitEffect(x, y) {
        // Efek partikel ketika peluru mengenai musuh
        for (let i = 0; i < 5; i++) {
            const particle = this.add.sprite(x, y, 'hit');
            particle.setDepth(5);
            particle.setTint(0xff0000);
            particle.setScale(3);

            const angle = Phaser.Math.Between(0, 360);
            const distance = Phaser.Math.Between(5, 30);

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(Phaser.Math.DegToRad(angle)) * distance,
                y: y + Math.sin(Phaser.Math.DegToRad(angle)) * distance,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => particle.destroy()
            });
        }
    }

    onBulletHitEnemy(bullet, enemy) {
        if (!bullet.active || !enemy.active) return;

        // Efek tumbukan
        this.createHitEffect(bullet.x, bullet.y);
        bullet.destroy();

        // Kerusakan pada musuh
        enemy.hp -= bullet.attack || 10;

        // Flash musuh berwarna merah
        enemy.setTint(0xff0000);
        this.time.delayedCall(100, () => {
            if (enemy.active) enemy.clearTint();
        });

        // Knockback
        const angle = Phaser.Math.Angle.Between(bullet.x, bullet.y, enemy.x, enemy.y);
        enemy.body.velocity.x += Math.cos(angle) * 120;
        enemy.body.velocity.y += Math.sin(angle) * 120;

        // Musuh mati
        if (enemy.hp <= 0) {
            this.score += 1; // tambah skor langsung
            this.scoreText.setText(this.score);
            this.sound.play('zombieKilled', { volume: 1 });

            enemy.healthBar.clear();
            enemy.destroy();
        }
    }

    onEnemyTouchPlayer(player, enemy) {

        // getarkan camera
        this.cameras.main.shake(100, 0.005);

        const now = this.time.now;
        if (now - player.lastHit < player.invulnMs) return;
        player.lastHit = now;

        player.health -= 8 + Phaser.Math.Between(0, 4);
        // this.playerHealthText.setText(`HP: ${player.health}/${player.maxHealth}`);
        this.updatePlayerHealthBar();

        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
        player.body.velocity.x += Math.cos(angle) * 180;
        player.body.velocity.y += Math.sin(angle) * 180;

        // Animasi flash pada pemain
        this.tweens.addCounter({
            from: 0, to: 1, duration: 300,
            onUpdate: t => {
                const v = Math.sin(t.getValue() * Math.PI * 6) > 0 ? 0xff9999 : 0xffffff;
                player.setTint(v);
            }, onComplete: () => player.clearTint()
        });

        if (player.health <= 0) this.onPlayerDeath();
    }

    updatePlayerHealthBar() {
        this.playerHealthBar.clear();

        // Background
        this.playerHealthBar.fillStyle(0x333333);
        this.playerHealthBar.fillRect(this.player.x - 25, this.player.y - 30, 50, 5);

        // Health bar
        const healthPercent = this.player.health / this.player.maxHealth;
        const healthColor = healthPercent > 0.7 ? 0x00ff00 :
            healthPercent > 0.3 ? 0xffff00 : 0xff0000;

        this.playerHealthBar.fillStyle(healthColor);
        this.playerHealthBar.fillRect(this.player.x - 25, this.player.y - 30, 50 * healthPercent, 5);

        // Border
        this.playerHealthBar.lineStyle(1, 0xffffff);
        this.playerHealthBar.strokeRect(this.player.x - 25, this.player.y - 30, 50, 5);
    }

    async onPlayerDeath() {

        this.game.canvas.style.cursor = 'default';
        this.physics.pause();

        // Stop Music from dungeon
        const dungeon = this.scene.get('DungeonScene');
        dungeon.stopMusic();

        this.gameOverMusic = this.sound.add('gameoverSound', { loop: false, volume: 2 });
        this.gameOverMusic.play();

        this.add.rectangle(600, 450, 1200, 900, 0x000000, 0.7).setDepth(10);
        this.add.text(600, 300, 'GAME OVER', {
            fontFamily: '"Press Start 2P"',
            fontSize: '60px',
            fill: '#910000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(11);

        this.add.text(600, 400, `Final Score: ${this.score}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(11);

        this.savegameText = this.add.text(600, 500, `Wait, Saving score ...`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5).setDepth(11);
        this.savegameText.setVisible(false);

        if (this.score > 0) {
            this.savegameText.setVisible(true);
            const nextSave = await this.saveScore(this.score);
            if (nextSave === true) {
                this.savegameText.setText('Saved.');
                this.savegameText.setFill('#009c15ff');
            } else {
                this.savegameText.setText('Failed save score game!');
                this.savegameText.setFill('#c94118ff');
            }
        }

        const tryagain = this.add.text(370, 600, `TRY AGAIN`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '30px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(11).setInteractive();

        const mainmenu = this.add.text(800, 600, `MAIN MENU`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '30px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(11).setInteractive();

        [tryagain, mainmenu].forEach(btn => {
            btn.on('pointerover', () => { btn.setFill('#ff0000ff'), this.sound.play('hoverSfx', { volume: 2 }); }); // merah saat hover
            btn.on('pointerout', () => btn.setFill('#ffffff'));  // putih saat keluar
        });

        mainmenu.on('pointerdown', () => { this.scene.start('MainMenuScene'), this.gameOverMusic.stop() });
        tryagain.on('pointerdown', () => { this.scene.restart(), this.gameOverMusic.stop() });
    }

    update(time, delta) {
        // Gerakan pemain
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -1;
        if (this.cursors.right.isDown || this.wasd.D.isDown) vx = 1;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -1;
        if (this.cursors.down.isDown || this.wasd.S.isDown) vy = 1;

        // Normalisasi gerakan diagonal
        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }

        this.player.setVelocity(vx * this.player.speed, vy * this.player.speed);

        // Rotasi senjata ke pointer
        const p = this.input.activePointer;
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, p.worldX, p.worldY);

        // Pindahkan targetSprite saat menembaki
        if (this.targetSprite) {
            this.targetSprite.setPosition(
                p.worldX + this.pointerOffset.x,
                p.worldY + this.pointerOffset.y
            );
        }

        // Player berotasi mengikuti pointer
        this.player.rotation = angle;

        // kalau pointer di kiri → flipY true, kalau di kanan → flipY false
        if (p.worldX < this.player.x) {
            this.player.setFlipY(true);
        } else {
            this.player.setFlipY(false);
        }

        // Auto-tembak
        if (this.isMouseDown && time > this.lastShotTime + this.shootCooldown) {
            this.shootBullet();
            this.lastShotTime = time;
        }

        // Tembak dengan spasi
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.shootBullet();

        // Musuh mengikuti pemain + update health bar
        this.enemies.getChildren().forEach(e => {
            if (!e.active) return;
            this.physics.moveToObject(e, this.player, e.speed);

            // Flip arah musuh sesuai posisi player
            e.setFlipX(this.player.x < e.x);

            // Health bar musuh
            if (e.healthBar) {
                e.healthBar.clear();

                // background bar hitam
                e.healthBar.fillStyle(0x000000, 1);
                e.healthBar.fillRect(e.x - 15, e.y - 25, 30, 4);

                // bar merah sesuai HP
                const pct = Phaser.Math.Clamp(e.hp / e.maxHP, 0, 1);
                const w = 30 * pct;
                e.healthBar.fillStyle(0xff0000, 1);
                e.healthBar.fillRect(e.x - 15, e.y - 25, w, 4);
            }
        });

        // Pembersihan peluru
        this.bullets.getChildren().forEach(b => {
            if (!b.active) return;
            if (b.x < -100 || b.x > 1300 || b.y < -100 || b.y > 1000) {
                b.destroy();
            }
        });

        // Crosshair mengikuti pointer
        this.cross.x = p.x;
        this.cross.y = p.y;

        // Update health bar pemain
        if (this.player.active) {
            this.updatePlayerHealthBar();
        }

        // Cek wave selesai
        // Cek kalau semua musuh sudah mati
        if (this.enemies.countActive(true) === 0) {
            if (this.wave < 50) {
                this.startWave(this.wave + 1);
            } else {
                this.scene.pause();
                this.add.text(400, 300, "GAME WAVE CLEAR!", {
                    fontSize: '40px',
                    fill: '#fff'
                }).setOrigin(0.5);
            }
        }
    }

    async saveScore(score) {
        try {
            const payload = {
                token: await window?.PrivyBridge?.getAccessToken?.(),
                score: Number(score),
                playerAddress: window?.PrivyBridge?.getUser?.().linkedAccounts?.[0]?.embeddedWallets?.[0]?.address,
                timestamp: Date.now(),
            };
            const signature = await this.signHMAC(payload, import.meta.env.VITE_SECRET_KEY);
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_GAME_API_URL}/submitscore`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "x-signature": signature,
                        },
                    }
                );
                const data = response.data;
                if (data.ok === true) {
                    return true;
                }
            } catch (error) {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    async signHMAC(payloadObj, secret) {
        const message = JSON.stringify(payloadObj);
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            enc.encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
        return btoa(String.fromCharCode(...new Uint8Array(signature))); // base64
    }
}

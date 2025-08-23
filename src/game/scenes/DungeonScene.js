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
        this.player.setScale(0.3); // contoh scale visual
        this.player.body.setSize(150, 150);
        this.player.body.setOffset(80, 80);
        this.player.speed = 200;
        this.player.maxHealth = 100;
        this.player.health = this.player.maxHealth;
        this.player.lastHit = 0;
        this.player.invulnMs = 700;

        // Background Musik Playgame
        this.gameMusic = this.sound.add('gameBgm', { loop: true, volume: 0.5 });
        this.gameMusic.play();

        // groups
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 50,
            createCallback: bullet => bullet.setCircle(4)
        });

        this.enemies = this.physics.add.group();

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
        this.time.addEvent({ delay: this.spawnRate, loop: true, callback: this.spawnEnemyWave, callbackScope: this });

        // difficulty increase
        this.time.addEvent({
            delay: 20000, loop: true, callback: () => {
                this.wave++;
                this.spawnRate = Math.max(350, this.spawnRate - 100);
                this.maxEnemies = Math.min(40, this.maxEnemies + 2);
                this.waveText.setText('WAVE ' + this.wave);
            }
        });

        // crosshair
        this.cross = this.add.image(W - 20, 20, 'cross').setScale(0.9).setScrollFactor(0);
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

    spawnEnemyWave() {
        const toSpawn = Phaser.Math.Between(1, Math.min(3, this.maxEnemies - this.enemies.getLength()));
        for (let i = 0; i < toSpawn; i++) this.spawnEnemy();
    }

    spawnEnemy() {
        this.sound.play('zombieSound', { volume: 1 });
        const W = 1200, H = 900;
        const edge = Phaser.Math.Between(0, 3);
        let x = 0, y = 0;
        if (edge === 0) { x = Phaser.Math.Between(0, W); y = -20; }
        else if (edge === 1) { x = Phaser.Math.Between(0, W); y = H + 20; }
        else if (edge === 2) { x = -20; y = Phaser.Math.Between(0, H); }
        else { x = W + 20; y = Phaser.Math.Between(0, H); }

        const e = this.physics.add.sprite(x, y, 'enemy');

        // PERBAIKAN PENTING: Atur physics body untuk asset baru
        // Skala visual
        e.setScale(0.2);

        // Atur ukuran body sesuai ukuran visual
        e.body.setSize(230, 230);

        // Hitung offset supaya body berada di tengah gambar
        e.body.setOffset(100, 100);

        e.speed = 40 + (this.wave - 1) * 8 + Phaser.Math.Between(0, 20);
        e.maxHP = 30 + Math.floor((this.wave - 1) * 2) + Phaser.Math.Between(0, 10);
        e.hp = e.maxHP;
        e.reward = 5 + this.wave;
        e.setCollideWorldBounds(true);
        e.healthBar = this.add.graphics().setDepth(4);
        e.setBounce(0.5);

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
        const bullet = this.bullets.get(sx, sy, 'bullet');
        if (!bullet) return;

        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setCircle(4);
        bullet.attack = 18;

        // Kecepatan peluru mengikuti shotAngle
        const speed = 520;
        this.physics.velocityFromRotation(shotAngle, speed, bullet.body.velocity);

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

            const angle = Phaser.Math.Between(0, 360);
            const distance = Phaser.Math.Between(5, 20);

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

        // Pindahkan custom pointere saat menembaki
        if (this.targetSprite) {   // 🔄 customPointer -> targetSprite
            this.targetSprite.setPosition(
                p.worldX + this.pointerOffset.x,
                p.worldY + this.pointerOffset.y
            );
        }

        // Player berotasi mengikuti pointer
        this.player.rotation = angle;

        // this.weapon.x = this.player.x;
        // this.weapon.y = this.player.y;
        // this.weapon.rotation = angle;

        // kalau pointer di kiri → flipX true, kalau di kanan → flipX false
        if (p.worldX < this.player.x) {
            this.player.setFlipY(true);   // pakai flipY kalau sprite default hadap kanan
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

        // Musuh mengikuti pemain
        this.enemies.getChildren().forEach(e => {
            if (!e.active) return;
            this.physics.moveToObject(e, this.player, e.speed);

            // Flip arah musuh sesuai posisi player
            if (this.player.x < e.x) {
                e.setFlipX(true);   // menghadap kiri
            } else {
                e.setFlipX(false);  // menghadap kanan (default)
            }

            // Health bar musuh
            e.healthBar.clear();
            const pct = Phaser.Math.Clamp(e.hp / e.maxHP, 0, 1);
            const w = 30 * pct;
            e.healthBar.fillStyle(0xff0000, 1);
            e.healthBar.fillRect(e.x - 15, e.y - 25, w, 4);
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

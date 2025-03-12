/**
 * Oyun sınıfı
 */

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Oyun durumu
        this.gameOver = false;
        this.showMenu = true;
        this.showUpgradeMenu = false;
        this.showProfileMenu = false;
        this.isCreatingProfile = false;
        this.newProfileName = "";
        
        // Profil yönetimi
        this.profiles = [];
        this.currentProfile = null;
        this.loadProfiles();
        
        // Oyun değişkenleri
        this.score = 0;
        this.gold = 0;
        this.level = 1;
        this.upgrades = {
            health: 0,
            damage: 0,
            speed: 0,
            fireRate: 0
        };
        
        // Oyun nesneleri
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.specialEffects = [];
        
        // Düşman oluşturma
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1500; // ms
        this.maxEnemies = 10;
        
        // Oyun kontrolü
        this.keys = {};
        this.mousePosition = { x: 0, y: 0 };
        this.lastTime = 0;
        
        // Olay dinleyicileri
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('click', this.handleClick.bind(this));
        canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        
        // Zemin
        this.ground = {
            gridSize: 50,
            color: '#2c3e50'
        };
        
        // Oyun başlat
        this.init();
    }
    
    init() {
        // Profilleri yükle
        this.loadProfiles();
        console.log("Oyun başlatıldı, profiller:", this.profiles);
        
        // Oyun döngüsünü başlat
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    handleClick(event) {
        // Mouse0 tuşunu aktif et
        this.keys['mouse0'] = true;
        
        // Tıklama işlemi bittikten sonra mouse0 tuşunu deaktif et
        setTimeout(() => {
            this.keys['mouse0'] = false;
        }, 100);
        
        if (this.showMenu) {
            // Menüdeyken tıklama
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            if (this.showUpgradeMenu) {
                // Güçlendirme menüsündeyken tıklama
                const buttonWidth = 300;
                const buttonHeight = 60;
                const startY = this.height / 3;
                const spacing = 80;
                const buttonX = this.width / 2 - buttonWidth / 2;
                
                // Sağlık güçlendirme düğmesi
                if (x > buttonX && x < buttonX + buttonWidth && 
                    y > startY && y < startY + buttonHeight) {
                    this.upgradeHealth();
                }
                
                // Hasar güçlendirme düğmesi
                if (x > buttonX && x < buttonX + buttonWidth && 
                    y > startY + spacing && y < startY + spacing + buttonHeight) {
                    this.upgradeDamage();
                }
                
                // Hız güçlendirme düğmesi
                if (x > buttonX && x < buttonX + buttonWidth && 
                    y > startY + spacing * 2 && y < startY + spacing * 2 + buttonHeight) {
                    this.upgradeSpeed();
                }
                
                // Ateş hızı güçlendirme düğmesi
                if (x > buttonX && x < buttonX + buttonWidth && 
                    y > startY + spacing * 3 && y < startY + spacing * 3 + buttonHeight) {
                    this.upgradeFireRate();
                }
                
                // Geri dönüş düğmesi
                if (x > this.width / 2 - 100 && x < this.width / 2 + 100 && 
                    y > startY + spacing * 4 && y < startY + spacing * 4 + 50) {
                    this.showUpgradeMenu = false;
                }
                
                return;
            }
            
            if (this.showProfileMenu) {
                // Profil menüsündeyken tıklama
                if (this.isCreatingProfile) {
                    // Profil oluşturma modundayken tıklama
                    const centerY = this.height / 2;
                    const boxWidth = 400;
                    const boxHeight = 200;
                    
                    // Profil adı giriş alanı
                    if (x > this.width / 2 - 150 && x < this.width / 2 + 150 &&
                        y > centerY - 20 && y < centerY + 20) {
                        // Klavye girişi için bir şey yapmaya gerek yok
                        // Klavye olayları ayrıca ele alınacak
                    }
                    
                    // Oluştur düğmesi
                    if (x > this.width / 2 - 100 && x < this.width / 2 + 100 &&
                        y > centerY + 40 && y < centerY + 80 && this.newProfileName.length > 0) {
                        this.createProfile();
                    }
                    
                    // İptal düğmesi
                    if (x > this.width / 2 - 100 && x < this.width / 2 + 100 &&
                        y > centerY + 90 && y < centerY + 130) {
                        this.isCreatingProfile = false;
                        this.newProfileName = "";
                    }
                    
                    return;
                }
                
                // Profil listesi
                const startY = this.height / 4;
                const spacing = 60;
                const buttonWidth = 300;
                const buttonHeight = 50;
                
                // Profilleri kontrol et
                for (let i = 0; i < this.profiles.length; i++) {
                    const profileY = startY + spacing * (i + 1);
                    
                    // Profil düğmesi
                    if (x > this.width / 2 - buttonWidth / 2 && x < this.width / 2 + buttonWidth / 2 &&
                        y > profileY && y < profileY + buttonHeight) {
                        this.selectProfile(i);
                    }
                    
                    // Silme düğmesi
                    if (x > this.width / 2 + buttonWidth / 2 + 10 && x < this.width / 2 + buttonWidth / 2 + 50 &&
                        y > profileY && y < profileY + buttonHeight) {
                        this.deleteProfile(i);
                    }
                }
                
                // Yeni profil oluştur düğmesi
                const newProfileY = startY + spacing * (this.profiles.length + 1.5);
                if (x > this.width / 2 - buttonWidth / 2 && x < this.width / 2 + buttonWidth / 2 &&
                    y > newProfileY && y < newProfileY + buttonHeight) {
                    this.startCreateProfile();
                }
                
                // Geri dönüş düğmesi
                const backY = newProfileY + spacing * 1.5;
                if (x > this.width / 2 - 100 && x < this.width / 2 + 100 &&
                    y > backY && y < backY + 50) {
                    this.showProfileMenu = false;
                }
                
                return;
            }
            
            // Ana menüdeyken tıklama
            
            // Başlat düğmesi kontrolü
            if (x > this.width / 2 - 100 && x < this.width / 2 + 100 &&
                y > this.height / 2 - 25 && y < this.height / 2 + 25) {
                if (this.currentProfile) {
                    this.startGame();
                } else {
                    this.showMessage("Lütfen önce bir profil seçin!", 2000);
                }
            }
            
            // Güçlendirme düğmesi kontrolü
            if (x > this.width / 2 - 100 && x < this.width / 2 + 100 &&
                y > this.height / 2 + 40 && y < this.height / 2 + 90) {
                if (this.currentProfile) {
                    this.showUpgradeMenu = true;
                } else {
                    this.showMessage("Lütfen önce bir profil seçin!", 2000);
                }
            }
            
            // Profil düğmesi kontrolü
            if (x > this.width / 2 - 100 && x < this.width / 2 + 100 &&
                y > this.height / 2 + 105 && y < this.height / 2 + 155) {
                this.showProfileMenu = true;
            }
        } else if (this.gameOver) {
            // Oyun bittiyse yeniden başlat
            this.restart();
        }
    }
    
    handleTouch(event) {
        event.preventDefault();
        if (this.showMenu) {
            // Menüdeyken dokunma
            const rect = this.canvas.getBoundingClientRect();
            const x = event.touches[0].clientX - rect.left;
            const y = event.touches[0].clientY - rect.top;
            
            if (this.showUpgradeMenu) {
                // Güçlendirme menüsündeyken dokunma
                const buttonWidth = 300;
                const buttonHeight = 60;
                const startY = this.height / 3;
                const spacing = 80;
                const buttonX = this.width / 2 - buttonWidth / 2;
                
                // Sağlık güçlendirme düğmesi
                if (x > buttonX && x < buttonX + buttonWidth && 
                    y > startY && y < startY + buttonHeight) {
                    this.upgradeHealth();
                }
                
                // Hasar güçlendirme düğmesi
                if (x > buttonX && x < buttonX + buttonWidth && 
                    y > startY + spacing && y < startY + spacing + buttonHeight) {
                    this.upgradeDamage();
                }
                
                // Hız güçlendirme düğmesi
                if (x > buttonX && x < buttonX + buttonWidth && 
                    y > startY + spacing * 2 && y < startY + spacing * 2 + buttonHeight) {
                    this.upgradeSpeed();
                }
                
                // Ateş hızı güçlendirme düğmesi
                if (x > buttonX && x < buttonX + buttonWidth && 
                    y > startY + spacing * 3 && y < startY + spacing * 3 + buttonHeight) {
                    this.upgradeFireRate();
                }
                
                // Geri dönüş düğmesi
                if (x > this.width / 2 - 100 && x < this.width / 2 + 100 && 
                    y > startY + spacing * 4 && y < startY + spacing * 4 + 50) {
                    this.showUpgradeMenu = false;
                }
                
                return;
            }
            
            if (this.showProfileMenu) {
                // Profil menüsündeyken dokunma
                if (this.isCreatingProfile) {
                    // Profil oluşturma modundayken dokunma
                    const centerY = this.height / 2;
                    
                    // Oluştur düğmesi
                    if (x > this.width / 2 - 100 && x < this.width / 2 + 100 &&
                        y > centerY + 40 && y < centerY + 80 && this.newProfileName.length > 0) {
                        this.createProfile();
                    }
                    
                    // İptal düğmesi
                    if (x > this.width / 2 - 100 && x < this.width / 2 + 100 &&
                        y > centerY + 90 && y < centerY + 130) {
                        this.isCreatingProfile = false;
                        this.newProfileName = "";
                    }
                    
                    return;
                }
                
                // Profil listesi
                const startY = this.height / 4;
                const spacing = 60;
                const buttonWidth = 300;
                const buttonHeight = 50;
                
                // Profilleri kontrol et
                for (let i = 0; i < this.profiles.length; i++) {
                    const profileY = startY + spacing * (i + 1);
                    
                    // Profil düğmesi
                    if (x > this.width / 2 - buttonWidth / 2 && x < this.width / 2 + buttonWidth / 2 &&
                        y > profileY && y < profileY + buttonHeight) {
                        this.selectProfile(i);
                    }
                    
                    // Silme düğmesi
                    if (x > this.width / 2 + buttonWidth / 2 + 10 && x < this.width / 2 + buttonWidth / 2 + 50 &&
                        y > profileY && y < profileY + buttonHeight) {
                        this.deleteProfile(i);
                    }
                }
                
                // Yeni profil oluştur düğmesi
                const newProfileY = startY + spacing * (this.profiles.length + 1.5);
                if (x > this.width / 2 - buttonWidth / 2 && x < this.width / 2 + buttonWidth / 2 &&
                    y > newProfileY && y < newProfileY + buttonHeight) {
                    this.startCreateProfile();
                }
                
                // Geri dönüş düğmesi
                const backY = newProfileY + spacing * 1.5;
                if (x > this.width / 2 - 100 && x < this.width / 2 + 100 &&
                    y > backY && y < backY + 50) {
                    this.showProfileMenu = false;
                }
                
                return;
            }
            
            // Ana menüdeyken dokunma
            
            // Başlat düğmesi kontrolü
            if (x > this.width / 2 - 100 && x < this.width / 2 + 100 &&
                y > this.height / 2 - 25 && y < this.height / 2 + 25) {
                if (this.currentProfile) {
                    this.startGame();
                } else {
                    this.showMessage("Lütfen önce bir profil seçin!", 2000);
                }
            }
            
            // Güçlendirme düğmesi kontrolü
            if (x > this.width / 2 - 100 && x < this.width / 2 + 100 &&
                y > this.height / 2 + 40 && y < this.height / 2 + 90) {
                if (this.currentProfile) {
                    this.showUpgradeMenu = true;
                } else {
                    this.showMessage("Lütfen önce bir profil seçin!", 2000);
                }
            }
            
            // Profil düğmesi kontrolü
            if (x > this.width / 2 - 100 && x < this.width / 2 + 100 &&
                y > this.height / 2 + 105 && y < this.height / 2 + 155) {
                this.showProfileMenu = true;
            }
        } else if (this.gameOver) {
            // Oyun bittiyse yeniden başlat
            this.restart();
        }
    }
    
    startGame() {
        // Menüyü kapat
        this.showMenu = false;
        this.showUpgradeMenu = false;
        this.showProfileMenu = false;
        
        // Oyun nesnelerini temizle
        this.enemies = [];
        this.projectiles = [];
        this.specialEffects = [];
        
        // Oyuncuyu oluştur
        this.player = new Tank(
            this.width / 2,
            this.height / 2,
            this
        );
        
        // Güçlendirmeleri uygula
        this.applyUpgrades();
        
        // Oyun durumunu sıfırla
        this.gameOver = false;
        this.score = 0;
        
        // Oyun döngüsünü başlat
        this.lastTime = performance.now();
    }
    
    applyUpgrades() {
        if (!this.player) return;
        
        // Sağlık güçlendirmesi
        const healthBonus = this.upgrades.health * 20; // Her seviye +20 sağlık
        this.player.maxHealth = 100 + healthBonus;
        this.player.health = this.player.maxHealth;
        
        // Hasar güçlendirmesi
        const damageBonus = this.upgrades.damage * 5; // Her seviye +5 hasar
        this.player.damage = 20 + damageBonus;
        
        // Hız güçlendirmesi
        const speedBonus = this.upgrades.speed * 0.2; // Her seviye +0.2 hız
        this.player.speed = 3 + speedBonus;
        
        // Ateş hızı güçlendirmesi
        const fireRateBonus = this.upgrades.fireRate * 50; // Her seviye -50ms ateş aralığı
        this.player.fireRate = Math.max(200, 500 - fireRateBonus); // Minimum 200ms
    }
    
    restart() {
        // Oyun verilerini kaydet
        this.saveGame();
        
        // Menüyü göster
        this.showMenu = true;
    }
    
    loadLevel(level) {
        // Seviye ayarlarını yükle
        const levelData = getLevelData(level);
        
        // Düşmanları temizle
        this.enemies = [];
        
        // Düşman sayısını ayarla
        this.enemySpawnInterval = levelData.enemySpawnInterval;
        this.maxEnemies = levelData.maxEnemies;
        
        // Güç artırımı oranını ayarla
        this.powerupSpawnInterval = levelData.powerupSpawnInterval;
        
        // Seviye başlangıç efekti
        this.addSpecialEffect(new SpecialEffect(
            this.width / 2,
            this.height / 2,
            50,
            '#f39c12',
            1000,
            'text'
        ));
        
        // Seviye başlangıç metni
        const levelEffect = new SpecialEffect(
            this.width / 2,
            this.height / 2,
            30,
            '#f39c12',
            2000,
            'text'
        );
        levelEffect.text = `LEVEL ${level}`;
        this.addSpecialEffect(levelEffect);
    }
    
    gameLoop(timestamp) {
        // Zaman farkını hesapla
        if (!this.lastTime) {
            this.lastTime = timestamp;
        }
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Ekranı temizle
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Zemin çiz
        this.drawGround();
        
        if (this.showMenu) {
            // Menüyü çiz
            this.drawMenu();
        } else if (!this.gameOver) {
            // Oyun durumunu güncelle
            this.update(deltaTime);
            
            // Oyun nesnelerini çiz
            this.draw();
        } else {
            // Oyun sonu ekranını çiz
            this.drawGameOver();
        }
        
        // Bir sonraki kareyi iste
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(deltaTime) {
        // Oyuncu güncelleme
        if (this.player) {
            this.player.update(deltaTime);
            
            // Oyuncu öldüyse oyun biter
            if (this.player.health <= 0) {
                this.gameOver = true;
                this.saveGame();
                return;
            }
        }
        
        // Düşmanları güncelle
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime);
            
            // Düşman öldüyse
            if (enemy.health <= 0) {
                // Altın ve skor ekle
                this.gold += enemy.goldValue || 10;
                this.score += enemy.scoreValue || 100;
                
                // Düşmanı kaldır
                this.enemies.splice(i, 1);
                
                // Patlama efekti ekle
                this.addSpecialEffect(new SpecialEffect(
                    enemy.x,
                    enemy.y,
                    30,
                    '#e74c3c',
                    500,
                    'explosion'
                ));
                
                continue;
            }
            
            // Oyuncu ile çarpışma kontrolü
            if (this.player && checkCollision(enemy, this.player)) {
                // Oyuncuya hasar ver
                this.player.takeDamage(enemy.damage || 10);
                
                // Düşmanı kaldır
                this.enemies.splice(i, 1);
                
                // Patlama efekti ekle
                this.addSpecialEffect(new SpecialEffect(
                    enemy.x,
                    enemy.y,
                    30,
                    '#e74c3c',
                    500,
                    'explosion'
                ));
            }
        }
        
        // Mermileri güncelle
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);
            
            // Menzil dışına çıktıysa kaldır
            if (projectile.x < 0 || projectile.x > this.width || 
                projectile.y < 0 || projectile.y > this.height) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // Düşmanlarla çarpışma kontrolü
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (checkCollision(projectile, enemy)) {
                    // Düşmana hasar ver
                    enemy.takeDamage(projectile.damage);
                    
                    // Mermiyi kaldır
                    this.projectiles.splice(i, 1);
                    
                    // Çarpışma efekti ekle
                    this.addSpecialEffect(new SpecialEffect(
                        projectile.x,
                        projectile.y,
                        15,
                        '#f39c12',
                        300,
                        'hit'
                    ));
                    
                    break;
                }
            }
        }
        
        // Özel efektleri güncelle
        for (let i = this.specialEffects.length - 1; i >= 0; i--) {
            const effect = this.specialEffects[i];
            effect.update(deltaTime);
            
            // Süresi dolduysa kaldır
            if (effect.duration <= 0) {
                this.specialEffects.splice(i, 1);
            }
        }
        
        // Düşman oluşturma
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnInterval && this.enemies.length < this.maxEnemies) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
    }
    
    draw() {
        // Oyuncuyu çiz
        if (this.player) {
            this.player.draw(this.ctx);
        }
        
        // Düşmanları çiz
        for (const enemy of this.enemies) {
            enemy.draw(this.ctx);
        }
        
        // Mermileri çiz
        for (const projectile of this.projectiles) {
            projectile.draw(this.ctx);
        }
        
        // Özel efektleri çiz
        for (const effect of this.specialEffects) {
            effect.draw(this.ctx);
        }
        
        // Arayüzü çiz
        this.drawUI();
    }
    
    drawGround() {
        // Zemin rengini çiz
        this.ctx.fillStyle = this.ground.color;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Izgara çiz
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Yatay çizgiler
        for (let y = 0; y < this.height; y += this.ground.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        // Dikey çizgiler
        for (let x = 0; x < this.width; x += this.ground.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
    }
    
    drawMenu() {
        // Menü arkaplanı
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Profil menüsü
        if (this.showProfileMenu) {
            this.drawProfileMenu();
            return;
        }
        
        // Güçlendirme menüsü
        if (this.showUpgradeMenu) {
            this.drawUpgradeMenu();
            return;
        }
        
        // Ana menü
        
        // Oyun başlığı
        this.ctx.fillStyle = '#3498db';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('TANK SAVAŞI', this.width / 2, this.height / 3);
        
        // Mevcut profil bilgisi
        if (this.currentProfile) {
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Profil: ${this.currentProfile.name}`, this.width / 2, this.height / 3 + 50);
            this.ctx.fillText(`Altın: ${this.gold}`, this.width / 2, this.height / 3 + 80);
            this.ctx.fillText(`En Yüksek Skor: ${this.currentProfile.highScore || 0}`, this.width / 2, this.height / 3 + 110);
        } else {
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Profil seçilmedi', this.width / 2, this.height / 3 + 50);
        }
        
        // Başlat düğmesi
        this.ctx.fillStyle = this.currentProfile ? '#2ecc71' : '#95a5a6';
        this.ctx.fillRect(this.width / 2 - 100, this.height / 2 - 25, 200, 50);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('BAŞLAT', this.width / 2, this.height / 2 + 10);
        
        // Güçlendirme düğmesi
        this.ctx.fillStyle = this.currentProfile ? '#3498db' : '#95a5a6';
        this.ctx.fillRect(this.width / 2 - 100, this.height / 2 + 40, 200, 50);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('GÜÇLENDİRMELER', this.width / 2, this.height / 2 + 75);
        
        // Profil düğmesi
        this.ctx.fillStyle = '#9b59b6';
        this.ctx.fillRect(this.width / 2 - 100, this.height / 2 + 105, 200, 50);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('PROFİLLER', this.width / 2, this.height / 2 + 140);
    }
    
    drawUpgradeMenu() {
        // Arkaplan
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Başlık
        this.ctx.fillStyle = '#3498db';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GÜÇLENDİRMELER', this.width / 2, this.height / 6);
        
        // Altın bilgisi
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Altın: ${this.gold}`, this.width / 2, this.height / 6 + 40);
        
        // Güçlendirme düğmeleri
        const buttonWidth = 300;
        const buttonHeight = 60;
        const startY = this.height / 3;
        const spacing = 80;
        const buttonX = this.width / 2 - buttonWidth / 2;
        
        // Sağlık güçlendirme
        const healthCost = 100 + (this.upgrades.health * 50);
        const canUpgradeHealth = this.gold >= healthCost && this.upgrades.health < 10;
        
        this.ctx.fillStyle = canUpgradeHealth ? '#2ecc71' : '#95a5a6';
        this.ctx.fillRect(buttonX, startY, buttonWidth, buttonHeight);
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Sağlık +20 (${this.upgrades.health}/10)`, buttonX + 20, startY + 25);
        this.ctx.fillText(`${healthCost} Altın`, buttonX + 20, startY + 50);
        
        // Hasar güçlendirme
        const damageCost = 100 + (this.upgrades.damage * 50);
        const canUpgradeDamage = this.gold >= damageCost && this.upgrades.damage < 10;
        
        this.ctx.fillStyle = canUpgradeDamage ? '#e74c3c' : '#95a5a6';
        this.ctx.fillRect(buttonX, startY + spacing, buttonWidth, buttonHeight);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`Hasar +5 (${this.upgrades.damage}/10)`, buttonX + 20, startY + spacing + 25);
        this.ctx.fillText(`${damageCost} Altın`, buttonX + 20, startY + spacing + 50);
        
        // Hız güçlendirme
        const speedCost = 100 + (this.upgrades.speed * 50);
        const canUpgradeSpeed = this.gold >= speedCost && this.upgrades.speed < 10;
        
        this.ctx.fillStyle = canUpgradeSpeed ? '#3498db' : '#95a5a6';
        this.ctx.fillRect(buttonX, startY + spacing * 2, buttonWidth, buttonHeight);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`Hız +0.2 (${this.upgrades.speed}/10)`, buttonX + 20, startY + spacing * 2 + 25);
        this.ctx.fillText(`${speedCost} Altın`, buttonX + 20, startY + spacing * 2 + 50);
        
        // Ateş hızı güçlendirme
        const fireRateCost = 100 + (this.upgrades.fireRate * 50);
        const canUpgradeFireRate = this.gold >= fireRateCost && this.upgrades.fireRate < 10;
        
        this.ctx.fillStyle = canUpgradeFireRate ? '#f39c12' : '#95a5a6';
        this.ctx.fillRect(buttonX, startY + spacing * 3, buttonWidth, buttonHeight);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`Ateş Hızı +10% (${this.upgrades.fireRate}/10)`, buttonX + 20, startY + spacing * 3 + 25);
        this.ctx.fillText(`${fireRateCost} Altın`, buttonX + 20, startY + spacing * 3 + 50);
        
        // Geri dönüş düğmesi
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.fillRect(this.width / 2 - 100, startY + spacing * 4, 200, 50);
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GERİ', this.width / 2, startY + spacing * 4 + 30);
    }
    
    drawUI() {
        // Skor ve altın bilgisi
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Skor: ${this.score}`, 20, 30);
        this.ctx.fillText(`Altın: ${this.gold}`, 20, 60);
        
        // Oyuncu sağlık çubuğu
        if (this.player) {
            const healthBarWidth = 200;
            const healthBarHeight = 20;
            const healthBarX = this.width - healthBarWidth - 20;
            const healthBarY = 20;
            
            // Arka plan
            this.ctx.fillStyle = '#7f8c8d';
            this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
            
            // Sağlık
            const healthRatio = this.player.health / this.player.maxHealth;
            this.ctx.fillStyle = getHealthColor(this.player.health, this.player.maxHealth);
            this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthRatio, healthBarHeight);
            
            // Sağlık değeri
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${Math.ceil(this.player.health)} / ${this.player.maxHealth}`, healthBarX + healthBarWidth / 2, healthBarY + 15);
        }
    }
    
    drawGameOver() {
        // Arkaplan
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Oyun sonu mesajı
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('OYUN BİTTİ', this.width / 2, this.height / 3);
        
        // Skor
        this.ctx.fillStyle = '#f39c12';
        this.ctx.font = '36px Arial';
        this.ctx.fillText(`Skor: ${this.score}`, this.width / 2, this.height / 2);
        
        // Kazanılan altın
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillText(`Kazanılan Altın: ${this.gold}`, this.width / 2, this.height / 2 + 50);
        
        // Yeniden başlat mesajı
        this.ctx.fillStyle = '#3498db';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Devam etmek için tıklayın', this.width / 2, this.height * 2/3);
    }
    
    spawnEnemy() {
        // Rastgele düşman türü seç
        const enemyTypes = ['basic', 'fast', 'heavy'];
        const weights = [
            70 - this.level * 5, // Temel düşman ağırlığı (seviye arttıkça azalır)
            20 + this.level * 2, // Hızlı düşman ağırlığı (seviye arttıkça artar)
            10 + this.level * 3  // Ağır düşman ağırlığı (seviye arttıkça artar)
        ];
        
        const enemyType = weightedRandom(enemyTypes, weights);
        
        // Rastgele konum seç (ekranın dışından)
        let x, y;
        const side = Math.floor(Math.random() * 4); // 0: üst, 1: sağ, 2: alt, 3: sol
        
        switch (side) {
            case 0: // Üst
                x = Math.random() * this.width;
                y = -50;
                break;
            case 1: // Sağ
                x = this.width + 50;
                y = Math.random() * this.height;
                break;
            case 2: // Alt
                x = Math.random() * this.width;
                y = this.height + 50;
                break;
            case 3: // Sol
                x = -50;
                y = Math.random() * this.height;
                break;
        }
        
        // Düşmanı oluştur
        this.addEnemy(new Enemy(x, y, enemyType, this));
    }
    
    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }
    
    addEnemy(enemy) {
        this.enemies.push(enemy);
    }
    
    addSpecialEffect(effect) {
        this.specialEffects.push(effect);
    }
    
    showMessage(text, duration = 2000) {
        // Metin efekti oluştur
        const messageEffect = new SpecialEffect(
            this.width / 2,
            this.height / 2,
            30,
            '#f39c12',
            duration,
            'text'
        );
        messageEffect.text = text;
        this.addSpecialEffect(messageEffect);
    }
    
    endGame() {
        this.gameOver = true;
        
        // Oyun sonu efekti
        this.addSpecialEffect(new SpecialEffect(
            this.width / 2,
            this.height / 2,
            100,
            'rgba(231, 76, 60, 0.7)',
            1000,
            'explosion'
        ));
        
        // Oyun sonu metni
        const gameOverEffect = new SpecialEffect(
            this.width / 2,
            this.height / 2,
            40,
            '#e74c3c',
            2000,
            'text'
        );
        gameOverEffect.text = 'GAME OVER';
        this.addSpecialEffect(gameOverEffect);
        
        // Skor metni
        const scoreEffect = new SpecialEffect(
            this.width / 2,
            this.height / 2 + 50,
            25,
            '#f1c40f',
            2000,
            'text'
        );
        scoreEffect.text = `SKOR: ${this.score}`;
        this.addSpecialEffect(scoreEffect);
        
        // Ses efekti
        playSound('sounds/gameover.mp3', 0.7);
        
        // Oyun verilerini kaydet
        this.saveGameData();
    }
    
    // Güçlendirme fonksiyonları
    upgradeHealth() {
        const cost = 100 + (this.upgrades.health * 50);
        
        if (this.gold >= cost && this.upgrades.health < 10) {
            this.gold -= cost;
            this.upgrades.health++;
            this.saveGame();
            this.showMessage(`Sağlık güçlendirildi! (${this.upgrades.health}/10)`, 2000);
        } else if (this.upgrades.health >= 10) {
            this.showMessage("Maksimum seviyeye ulaşıldı!", 2000);
        } else {
            this.showMessage(`Yeterli altın yok! ${cost} altın gerekiyor.`, 2000);
        }
    }
    
    upgradeDamage() {
        const cost = 100 + (this.upgrades.damage * 50);
        
        if (this.gold >= cost && this.upgrades.damage < 10) {
            this.gold -= cost;
            this.upgrades.damage++;
            this.saveGame();
            this.showMessage(`Hasar güçlendirildi! (${this.upgrades.damage}/10)`, 2000);
        } else if (this.upgrades.damage >= 10) {
            this.showMessage("Maksimum seviyeye ulaşıldı!", 2000);
        } else {
            this.showMessage(`Yeterli altın yok! ${cost} altın gerekiyor.`, 2000);
        }
    }
    
    upgradeSpeed() {
        const cost = 100 + (this.upgrades.speed * 50);
        
        if (this.gold >= cost && this.upgrades.speed < 10) {
            this.gold -= cost;
            this.upgrades.speed++;
            this.saveGame();
            this.showMessage(`Hız güçlendirildi! (${this.upgrades.speed}/10)`, 2000);
        } else if (this.upgrades.speed >= 10) {
            this.showMessage("Maksimum seviyeye ulaşıldı!", 2000);
        } else {
            this.showMessage(`Yeterli altın yok! ${cost} altın gerekiyor.`, 2000);
        }
    }
    
    upgradeFireRate() {
        const cost = 100 + (this.upgrades.fireRate * 50);
        
        if (this.gold >= cost && this.upgrades.fireRate < 10) {
            this.gold -= cost;
            this.upgrades.fireRate++;
            this.saveGame();
            this.showMessage(`Ateş hızı güçlendirildi! (${this.upgrades.fireRate}/10)`, 2000);
        } else if (this.upgrades.fireRate >= 10) {
            this.showMessage("Maksimum seviyeye ulaşıldı!", 2000);
        } else {
            this.showMessage(`Yeterli altın yok! ${cost} altın gerekiyor.`, 2000);
        }
    }
    
    // Oyun verilerini kaydet
    saveGameData() {
        const gameData = {
            gold: this.gold,
            upgrades: this.upgrades,
            highScore: Math.max(this.score, this.getHighScore())
        };
        
        try {
            localStorage.setItem('tankGameData', JSON.stringify(gameData));
        } catch (error) {
            console.warn('Oyun verileri kaydedilemedi:', error);
        }
    }
    
    // Oyun verilerini yükle
    loadGameData() {
        try {
            const gameDataStr = localStorage.getItem('tankGameData');
            if (gameDataStr) {
                const gameData = JSON.parse(gameDataStr);
                this.gold = gameData.gold || 0;
                this.upgrades = gameData.upgrades || {
                    health: 0,
                    damage: 0,
                    speed: 0,
                    fireRate: 0
                };
            }
        } catch (error) {
            console.warn('Oyun verileri yüklenemedi:', error);
        }
    }
    
    // En yüksek skoru al
    getHighScore() {
        try {
            const gameDataStr = localStorage.getItem('tankGameData');
            if (gameDataStr) {
                const gameData = JSON.parse(gameDataStr);
                return gameData.highScore || 0;
            }
        } catch (error) {
            console.warn('Yüksek skor yüklenemedi:', error);
        }
        return 0;
    }
    
    drawProfileMenu() {
        // Arkaplan
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Profil oluşturma modundaysa
        if (this.isCreatingProfile) {
            this.drawCreateProfileUI();
            return;
        }
        
        // Başlık
        this.ctx.fillStyle = '#9b59b6';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PROFİL YÖNETİMİ', this.width / 2, this.height / 6);
        
        // Mevcut profil bilgisi
        if (this.currentProfile) {
            this.ctx.fillStyle = '#3498db';
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Aktif Profil: ${this.currentProfile.name}`, this.width / 2, this.height / 6 + 40);
        }
        
        // Profil listesi
        const startY = this.height / 4;
        const spacing = 60;
        const buttonWidth = 300;
        const buttonHeight = 50;
        
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fillText('Profiller:', this.width / 2, startY);
        
        // Profilleri listele
        if (this.profiles.length === 0) {
            this.ctx.fillStyle = '#95a5a6';
            this.ctx.fillText('Henüz profil bulunmuyor', this.width / 2, startY + spacing);
        } else {
            for (let i = 0; i < this.profiles.length; i++) {
                const profileY = startY + spacing * (i + 1);
                const profile = this.profiles[i];
                
                // Profil düğmesi
                this.ctx.fillStyle = this.currentProfile && this.currentProfile.name === profile.name ? '#27ae60' : '#3498db';
                this.ctx.fillRect(this.width / 2 - buttonWidth / 2, profileY, buttonWidth, buttonHeight);
                
                // Profil adı
                this.ctx.fillStyle = '#fff';
                this.ctx.fillText(profile.name, this.width / 2, profileY + 30);
                
                // Silme düğmesi
                this.ctx.fillStyle = '#e74c3c';
                this.ctx.fillRect(this.width / 2 + buttonWidth / 2 + 10, profileY, 40, buttonHeight);
                this.ctx.fillStyle = '#fff';
                this.ctx.fillText('X', this.width / 2 + buttonWidth / 2 + 30, profileY + 30);
            }
        }
        
        // Yeni profil oluştur düğmesi
        const newProfileY = startY + spacing * (this.profiles.length + 1.5);
        this.ctx.fillStyle = '#f39c12';
        this.ctx.fillRect(this.width / 2 - buttonWidth / 2, newProfileY, buttonWidth, buttonHeight);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('YENİ PROFİL OLUŞTUR', this.width / 2, newProfileY + 30);
        
        // Geri dönüş düğmesi
        const backY = newProfileY + spacing * 1.5;
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.fillRect(this.width / 2 - 100, backY, 200, 50);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('GERİ', this.width / 2, backY + 30);
    }
    
    drawCreateProfileUI() {
        // Arkaplan kutusu
        const centerY = this.height / 2;
        const boxWidth = 400;
        const boxHeight = 200;
        
        this.ctx.fillStyle = 'rgba(52, 73, 94, 0.9)';
        this.ctx.fillRect(this.width / 2 - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight);
        
        // Başlık
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = '28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Yeni Profil Oluştur', this.width / 2, centerY - 60);
        
        // Giriş alanı
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.width / 2 - 150, centerY - 20, 300, 40);
        
        // Girilen metin
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(this.newProfileName, this.width / 2 - 140, centerY + 5);
        
        // İmleç animasyonu
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            const textWidth = this.ctx.measureText(this.newProfileName).width;
            this.ctx.fillRect(this.width / 2 - 140 + textWidth, centerY - 15, 2, 30);
        }
        
        // Oluştur düğmesi
        this.ctx.fillStyle = this.newProfileName.length > 0 ? '#2ecc71' : '#95a5a6';
        this.ctx.fillRect(this.width / 2 - 100, centerY + 40, 200, 40);
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('OLUŞTUR', this.width / 2, centerY + 65);
        
        // İptal düğmesi
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(this.width / 2 - 100, centerY + 90, 200, 40);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('İPTAL', this.width / 2, centerY + 115);
    }
    
    // Profil yönetimi fonksiyonları
    startCreateProfile() {
        this.isCreatingProfile = true;
        this.newProfileName = "";
        
        // Klavye olaylarını dinle
        document.addEventListener('keydown', this.handleProfileKeyDown.bind(this));
    }
    
    handleProfileKeyDown(event) {
        if (!this.isCreatingProfile) return;
        
        if (event.key === 'Escape') {
            // İptal et
            this.isCreatingProfile = false;
            this.newProfileName = "";
            document.removeEventListener('keydown', this.handleProfileKeyDown);
        } else if (event.key === 'Enter') {
            // Profil oluştur
            if (this.newProfileName.length > 0) {
                this.createProfile();
            }
        } else if (event.key === 'Backspace') {
            // Son karakteri sil
            this.newProfileName = this.newProfileName.slice(0, -1);
        } else if (event.key.length === 1) {
            // Karakter ekle (sadece tek karakter tuşları)
            if (this.newProfileName.length < 15) { // Maksimum 15 karakter
                this.newProfileName += event.key;
            }
        }
    }
    
    createProfile() {
        // Aynı isimde profil var mı kontrol et
        const existingProfile = this.profiles.find(p => p.name === this.newProfileName);
        if (existingProfile) {
            this.showMessage("Bu isimde bir profil zaten var!", 2000);
            return;
        }
        
        // Yeni profil oluştur
        const newProfile = {
            name: this.newProfileName,
            gold: 0,
            level: 1,
            score: 0,
            highScore: 0,
            upgrades: {
                health: 0,
                damage: 0,
                speed: 0,
                fireRate: 0
            }
        };
        
        // Profili ekle
        this.profiles.push(newProfile);
        
        // Profili seç
        this.currentProfile = newProfile;
        
        // Profil verilerini yükle
        this.gold = newProfile.gold;
        this.level = newProfile.level;
        this.score = 0;
        this.upgrades = { ...newProfile.upgrades };
        
        // Profil oluşturma modunu kapat
        this.isCreatingProfile = false;
        this.newProfileName = "";
        
        // Klavye olaylarını kaldır
        document.removeEventListener('keydown', this.handleProfileKeyDown);
        
        // Profilleri kaydet
        this.saveProfiles();
        
        // Bildirim göster
        this.showMessage(`Profil oluşturuldu: ${newProfile.name}`, 2000);
    }
    
    selectProfile(index) {
        if (index >= 0 && index < this.profiles.length) {
            // Profili seç
            this.currentProfile = this.profiles[index];
            
            // Profil verilerini yükle
            this.gold = this.currentProfile.gold;
            this.level = this.currentProfile.level;
            this.score = 0;
            this.upgrades = { ...this.currentProfile.upgrades };
            
            // Bildirim göster
            this.showMessage(`Profil seçildi: ${this.currentProfile.name}`, 2000);
        }
    }
    
    deleteProfile(index) {
        if (index >= 0 && index < this.profiles.length) {
            const profileName = this.profiles[index].name;
            
            // Aktif profil siliniyorsa, aktif profili temizle
            if (this.currentProfile && this.currentProfile.name === profileName) {
                this.currentProfile = null;
                this.gold = 0;
                this.level = 1;
                this.score = 0;
                this.upgrades = {
                    health: 0,
                    damage: 0,
                    speed: 0,
                    fireRate: 0
                };
            }
            
            // Profili sil
            this.profiles.splice(index, 1);
            
            // Profilleri kaydet
            this.saveProfiles();
            
            // Bildirim göster
            this.showMessage(`Profil silindi: ${profileName}`, 2000);
        }
    }
    
    saveProfiles() {
        try {
            localStorage.setItem('tankGameProfiles', JSON.stringify(this.profiles));
            console.log("Profiller kaydedildi:", this.profiles);
        } catch (error) {
            console.warn('Profiller kaydedilemedi:', error);
        }
    }
    
    loadProfiles() {
        try {
            const profilesStr = localStorage.getItem('tankGameProfiles');
            if (profilesStr) {
                this.profiles = JSON.parse(profilesStr);
                console.log("Profiller yüklendi:", this.profiles);
            } else {
                this.profiles = [];
                console.log("Profil bulunamadı, boş liste oluşturuldu.");
            }
        } catch (error) {
            console.warn('Profiller yüklenemedi:', error);
            this.profiles = [];
        }
    }
    
    saveGame() {
        if (!this.currentProfile) return;
        
        // Profil verilerini güncelle
        this.currentProfile.gold = this.gold;
        this.currentProfile.level = this.level;
        
        // Yüksek skor kontrolü
        if (this.score > this.currentProfile.highScore) {
            this.currentProfile.highScore = this.score;
        }
        
        // Güçlendirmeleri kaydet
        this.currentProfile.upgrades = { ...this.upgrades };
        
        // Profilleri kaydet
        this.saveProfiles();
    }
    
    handleKeyDown(event) {
        // Tuş kodunu kaydet
        this.keys[event.key] = true;
        
        // ESC tuşu ile oyunu duraklat/devam ettir
        if (event.key === 'Escape' && !this.showMenu) {
            this.showMenu = true;
        }
    }
    
    handleKeyUp(event) {
        // Tuş kodunu temizle
        this.keys[event.key] = false;
    }
    
    handleMouseMove(event) {
        // Fare pozisyonunu güncelle
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition.x = event.clientX - rect.left;
        this.mousePosition.y = event.clientY - rect.top;
    }
    
    handleTouchMove(event) {
        // Dokunma pozisyonunu güncelle
        event.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition.x = event.touches[0].clientX - rect.left;
        this.mousePosition.y = event.touches[0].clientY - rect.top;
    }
}

/**
 * İki nesne arasında çarpışma kontrolü yapar
 * @param {Object} obj1 - Birinci nesne (x, y, radius özellikleri olmalı)
 * @param {Object} obj2 - İkinci nesne (x, y, radius özellikleri olmalı)
 * @returns {boolean} - Çarpışma varsa true, yoksa false
 */
function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < obj1.radius + obj2.radius;
}

/**
 * Sağlık durumuna göre renk döndürür
 * @param {number} health - Mevcut sağlık
 * @param {number} maxHealth - Maksimum sağlık
 * @returns {string} - Renk kodu
 */
function getHealthColor(health, maxHealth) {
    const ratio = health / maxHealth;
    if (ratio > 0.7) {
        return '#2ecc71'; // Yeşil
    } else if (ratio > 0.3) {
        return '#f39c12'; // Turuncu
    } else {
        return '#e74c3c'; // Kırmızı
    }
}

/**
 * Ağırlıklı rastgele seçim yapar
 * @param {Array} items - Seçilecek öğeler
 * @param {Array} weights - Öğelerin ağırlıkları
 * @returns {*} - Seçilen öğe
 */
function weightedRandom(items, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
        if (random < weights[i]) {
            return items[i];
        }
        random -= weights[i];
    }
    
    return items[0]; // Varsayılan olarak ilk öğeyi döndür
}

/**
 * Ses çalar
 * @param {string} src - Ses dosyası yolu
 * @param {number} volume - Ses seviyesi (0-1 arası)
 */
function playSound(src, volume = 1.0) {
    const sound = new Audio(src);
    sound.volume = volume;
    sound.play().catch(e => console.log("Ses çalınamadı:", e));
}

/**
 * Belirli bir seviye için veri döndürür
 * @param {number} level - Seviye
 * @returns {Object} - Seviye verileri
 */
function getLevelData(level) {
    return {
        enemySpawnInterval: Math.max(500, 1500 - level * 100), // Her seviye -100ms
        maxEnemies: Math.min(20, 10 + level), // Her seviye +1 düşman
        powerupSpawnInterval: Math.max(10000, 20000 - level * 1000) // Her seviye -1s
    };
} 
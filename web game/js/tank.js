/**
 * Oyuncunun kontrol ettiği tank sınıfı
 */

class Tank {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.game = game;
        
        // Tank özellikleri
        this.radius = 20;
        this.color = '#3498db';
        this.speed = 3;
        this.rotationSpeed = 0.05;
        this.direction = 0; // Radyan cinsinden yön
        
        // Sağlık ve hasar
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.damage = 20;
        
        // Ateş etme
        this.fireRate = 500; // ms
        this.lastFireTime = 0;
        
        // Namlu
        this.barrelLength = 30;
        this.barrelWidth = 8;
    }
    
    update(deltaTime) {
        // Hareket
        this.handleMovement();
        
        // Fare ile nişan alma
        this.handleAiming();
        
        // Ateş etme
        this.handleShooting(deltaTime);
    }
    
    handleMovement() {
        // WASD veya ok tuşları ile hareket
        let dx = 0;
        let dy = 0;
        
        if (!this.game || !this.game.keys) return;
        
        if (this.game.keys['w'] || this.game.keys['ArrowUp']) {
            dy -= this.speed;
        }
        if (this.game.keys['s'] || this.game.keys['ArrowDown']) {
            dy += this.speed;
        }
        if (this.game.keys['a'] || this.game.keys['ArrowLeft']) {
            dx -= this.speed;
        }
        if (this.game.keys['d'] || this.game.keys['ArrowRight']) {
            dx += this.speed;
        }
        
        // Çapraz hareket hızını normalize et
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx = dx / length * this.speed;
            dy = dy / length * this.speed;
        }
        
        // Pozisyonu güncelle
        this.x += dx;
        this.y += dy;
        
        // Ekran sınırlarını kontrol et
        if (this.game && this.game.width && this.game.height) {
            this.x = Math.max(this.radius, Math.min(this.game.width - this.radius, this.x));
            this.y = Math.max(this.radius, Math.min(this.game.height - this.radius, this.y));
        }
    }
    
    handleAiming() {
        // Fare pozisyonuna göre nişan al
        if (!this.game || !this.game.mousePosition) return;
        
        const dx = this.game.mousePosition.x - this.x;
        const dy = this.game.mousePosition.y - this.y;
        this.direction = Math.atan2(dy, dx);
    }
    
    handleShooting(deltaTime) {
        // Sol tıklama ile ateş et
        if (!this.game || !this.game.keys) return;
        
        if (this.game.keys['mouse0']) {
            const currentTime = performance.now();
            if (currentTime - this.lastFireTime >= this.fireRate) {
                this.shoot();
                this.lastFireTime = currentTime;
            }
        }
    }
    
    shoot() {
        if (!this.game) return;
        
        // Namlu ucundan mermi oluştur
        const projectileX = this.x + Math.cos(this.direction) * this.barrelLength;
        const projectileY = this.y + Math.sin(this.direction) * this.barrelLength;
        
        // Mermiyi oyuna ekle
        this.game.addProjectile(new Projectile(
            projectileX,
            projectileY,
            this.direction,
            this.damage,
            this.game
        ));
        
        // Ateş etme efekti
        this.game.addSpecialEffect(new SpecialEffect(
            projectileX,
            projectileY,
            10,
            '#f39c12',
            200,
            'flash'
        ));
    }
    
    draw(ctx) {
        // Gövde
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Namlu
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.direction);
        
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, -this.barrelWidth / 2, this.barrelLength, this.barrelWidth);
        
        ctx.restore();
        
        // Sağlık çubuğu
        this.drawHealthBar(ctx);
    }
    
    drawHealthBar(ctx) {
        const barWidth = this.radius * 2;
        const barHeight = 5;
        const barX = this.x - barWidth / 2;
        const barY = this.y + this.radius + 5;
        
        // Arka plan
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Sağlık
        const healthRatio = this.health / this.maxHealth;
        ctx.fillStyle = getHealthColor(this.health, this.maxHealth);
        ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Hasar efekti
        if (this.game) {
            this.game.addSpecialEffect(new SpecialEffect(
                this.x,
                this.y,
                this.radius,
                'rgba(231, 76, 60, 0.5)',
                300,
                'damage'
            ));
        }
        
        // Sağlık kontrolü
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }
    
    die() {
        // Ölüm efekti
        if (this.game) {
            this.game.addSpecialEffect(new SpecialEffect(
                this.x,
                this.y,
                this.radius * 2,
                '#e74c3c',
                1000,
                'explosion'
            ));
        }
    }
} 
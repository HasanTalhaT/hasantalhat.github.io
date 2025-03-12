/**
 * Oyundaki tüm varlıkların temel sınıfı
 */

class Entity {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = 0;
        this.angle = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.isAlive = true;
        this.isCollidable = true;
        this.type = 'entity';
        
        // 2.5D efektleri için yeni özellikler
        this.height = 0; // Yerden yükseklik
        this.maxHeight = 10; // Maksimum yükseklik
        this.shadowOpacity = 0.4; // Gölge opaklığı
        this.shadowRadius = this.radius * 0.8; // Gölge boyutu
        this.bounceEffect = 0; // Zıplama efekti için
        this.bounceSpeed = 0.05; // Zıplama hızı
    }
    
    update(deltaTime) {
        // Temel güncelleme işlemleri
        if (!this.isAlive) return;
        
        // Zıplama efekti güncelleme
        this.bounceEffect += this.bounceSpeed;
        this.height = Math.abs(Math.sin(this.bounceEffect)) * this.maxHeight;
    }
    
    draw(ctx) {
        // Temel çizim işlemleri
        if (!this.isAlive) return;
        
        // Gölge çiz
        this.drawShadow(ctx);
        
        // Varlığı çiz (yükseklik efektiyle)
        ctx.save();
        ctx.translate(this.x, this.y - this.height);
        ctx.rotate(this.angle);
        
        // Varlığı çiz
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // 3D efekti için üst kısım (highlight)
        const gradient = ctx.createRadialGradient(
            -this.radius * 0.3, -this.radius * 0.3, 0,
            0, 0, this.radius
        );
        gradient.addColorStop(0, this.getLighterColor(this.color, 30));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.closePath();
        
        ctx.restore();
    }
    
    drawShadow(ctx) {
        // Gölge çiz (yere)
        ctx.beginPath();
        ctx.ellipse(
            this.x, 
            this.y + 2, 
            this.shadowRadius, 
            this.shadowRadius * 0.5, 
            0, 
            0, 
            Math.PI * 2
        );
        
        // Yüksekliğe göre gölge opaklığını ayarla
        const shadowOpacity = this.shadowOpacity * (1 - this.height / (this.maxHeight * 2));
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
        ctx.fill();
        ctx.closePath();
    }
    
    // Rengi açmak için yardımcı fonksiyon
    getLighterColor(color, percent) {
        // HEX renk formatını kontrol et
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            let r = parseInt(hex.slice(0, 2), 16);
            let g = parseInt(hex.slice(2, 4), 16);
            let b = parseInt(hex.slice(4, 6), 16);
            
            r = Math.min(255, r + percent);
            g = Math.min(255, g + percent);
            b = Math.min(255, b + percent);
            
            return `rgb(${r}, ${g}, ${b})`;
        }
        
        // RGB formatını kontrol et
        if (color.startsWith('rgb')) {
            const rgbValues = color.match(/\d+/g);
            if (rgbValues && rgbValues.length >= 3) {
                const r = Math.min(255, parseInt(rgbValues[0]) + percent);
                const g = Math.min(255, parseInt(rgbValues[1]) + percent);
                const b = Math.min(255, parseInt(rgbValues[2]) + percent);
                return `rgb(${r}, ${g}, ${b})`;
            }
        }
        
        return color;
    }
    
    takeDamage(amount) {
        if (!this.isAlive) return;
        
        this.health -= amount;
        
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }
    
    die() {
        this.isAlive = false;
    }
    
    heal(amount) {
        if (!this.isAlive) return;
        
        this.health = Math.min(this.health + amount, this.maxHealth);
    }
    
    collidesWith(entity) {
        if (!this.isAlive || !entity.isAlive || !this.isCollidable || !entity.isCollidable) {
            return false;
        }
        
        return checkCollision(this, entity);
    }
    
    // Sağlık yüzdesini döndürür
    getHealthPercentage() {
        return this.health / this.maxHealth;
    }
    
    // Sağlık çubuğunu çizer
    drawHealthBar(ctx, offsetY = -20) {
        if (!this.isAlive) return;
        
        const barWidth = this.radius * 2;
        const barHeight = 5;
        const barX = this.x - barWidth / 2;
        const barY = this.y + offsetY - this.height; // Yüksekliğe göre ayarla
        
        // Arka plan
        ctx.fillStyle = '#444';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Sağlık
        const healthWidth = barWidth * this.getHealthPercentage();
        ctx.fillStyle = getHealthColor(this.health, this.maxHealth);
        ctx.fillRect(barX, barY, healthWidth, barHeight);
    }
} 
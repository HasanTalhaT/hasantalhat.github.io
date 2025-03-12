/**
 * Düşman tank sınıfı
 */

class Enemy {
    constructor(x, y, type, game) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.game = game;
        this.isAlive = true;
        
        // Düşman özellikleri
        this.radius = 15;
        this.speed = 1.5;
        this.direction = 0;
        
        // Düşman türüne göre özellikleri ayarla
        switch (type) {
            case 'basic':
                this.color = '#e74c3c';
                this.maxHealth = 50;
                this.damage = 10;
                this.scoreValue = 100;
                this.goldValue = 10;
                break;
            case 'fast':
                this.color = '#f39c12';
                this.maxHealth = 30;
                this.damage = 5;
                this.speed = 2.5;
                this.scoreValue = 150;
                this.goldValue = 15;
                break;
            case 'heavy':
                this.color = '#8e44ad';
                this.maxHealth = 100;
                this.damage = 20;
                this.speed = 0.8;
                this.radius = 20;
                this.scoreValue = 200;
                this.goldValue = 20;
                break;
            default:
                this.color = '#e74c3c';
                this.maxHealth = 50;
                this.damage = 10;
                this.scoreValue = 100;
                this.goldValue = 10;
        }
        
        // Sağlık
        this.health = this.maxHealth;
        
        // 2.5D özellikleri
        this.height = 0;
        this.maxHeight = this.type === 'heavy' ? 20 : 15;
        this.bounceSpeed = this.type === 'fast' ? 0.05 : 0.03;
        this.turretHeight = this.maxHeight * 0.6;
        this.bodyHeight = this.maxHeight * 0.8;
        this.trackWidth = this.radius * 0.6;
        this.trackHeight = this.radius * 0.3;
    }
    
    update(deltaTime) {
        // Oyuncuya doğru hareket et
        if (this.game.player) {
            // Oyuncuya doğru yönü hesapla
            const dx = this.game.player.x - this.x;
            const dy = this.game.player.y - this.y;
            this.direction = Math.atan2(dy, dx);
            
            // Hareket et
            this.x += Math.cos(this.direction) * this.speed;
            this.y += Math.sin(this.direction) * this.speed;
        }
        
        // Ekran sınırlarında tut
        this.keepInBounds();
    }
    
    keepInBounds() {
        // Ekran sınırlarında tut
        const margin = this.radius;
        
        if (this.x < margin) {
            this.x = margin;
        } else if (this.x > this.game.width - margin) {
            this.x = this.game.width - margin;
        }
        
        if (this.y < margin) {
            this.y = margin;
        } else if (this.y > this.game.height - margin) {
            this.y = this.game.height - margin;
        }
    }
    
    draw(ctx) {
        if (!this.isAlive) return;
        
        // Gölge çiz
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Düşman gövdesi
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Düşman türüne göre ekstra detaylar
        switch (this.type) {
            case 'basic':
                // Basit düşman için X işareti
                ctx.strokeStyle = '#c0392b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x - this.radius / 2, this.y - this.radius / 2);
                ctx.lineTo(this.x + this.radius / 2, this.y + this.radius / 2);
                ctx.moveTo(this.x + this.radius / 2, this.y - this.radius / 2);
                ctx.lineTo(this.x - this.radius / 2, this.y + this.radius / 2);
                ctx.stroke();
                break;
            case 'fast':
                // Hızlı düşman için ok işareti
                ctx.fillStyle = '#d35400';
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.direction);
                ctx.beginPath();
                ctx.moveTo(this.radius / 2, 0);
                ctx.lineTo(-this.radius / 2, -this.radius / 2);
                ctx.lineTo(-this.radius / 2, this.radius / 2);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                break;
            case 'heavy':
                // Ağır düşman için kalın kenar
                ctx.strokeStyle = '#6c3483';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.stroke();
                
                // İç daire
                ctx.fillStyle = '#9b59b6';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        // Sağlık çubuğu
        this.drawHealthBar(ctx);
    }
    
    drawHealthBar(ctx) {
        const barWidth = this.radius * 2;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.radius - 10;
        
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
        this.game.addSpecialEffect(new SpecialEffect(
            this.x,
            this.y,
            this.radius / 2,
            'rgba(255, 255, 255, 0.7)',
            200,
            'hit'
        ));
        
        // Sağlık kontrolü
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }
    
    die() {
        this.isAlive = false;
        
        // Ölüm efekti
        this.game.addSpecialEffect(new SpecialEffect(
            this.x,
            this.y,
            this.radius * 2.5,
            'rgba(231, 76, 60, 0.8)',
            1000,
            'explosion'
        ));
        
        // Skor ve altın ekle
        this.game.score += this.scoreValue;
        this.game.gold += this.goldValue;
    }
} 
/**
 * Mermi sınıfı
 */

class Projectile {
    constructor(x, y, direction, damage, game) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.damage = damage;
        this.game = game;
        this.isAlive = true;
        
        // Mermi özellikleri
        this.radius = 4;
        this.speed = 10;
        this.color = '#f1c40f';
    }
    
    update(deltaTime) {
        // Hareket
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;
    }
    
    draw(ctx) {
        // Mermi
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // İz efekti
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x - Math.cos(this.direction) * this.radius * 3,
            this.y - Math.sin(this.direction) * this.radius * 3
        );
        ctx.stroke();
    }
    
    checkCollision(entity) {
        if (!this.isAlive || !entity.isAlive) return false;
        
        // Mermi sahibi ile çarpışma kontrolü yapma
        if ((this.ownerType === 'player' && entity.type === 'player') || 
            (this.ownerType === 'enemy' && entity.type === 'enemy')) {
            return false;
        }
        
        return checkCollision(this, entity);
    }
    
    hit() {
        this.isAlive = false;
    }
} 
/**
 * Özel efekt sınıfı
 */

class SpecialEffect {
    constructor(x, y, radius, color, duration, type) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.duration = duration;
        this.type = type; // 'explosion', 'hit', 'flash', 'text'
        this.startTime = performance.now();
        this.text = '';
    }
    
    update(deltaTime) {
        // Süreyi azalt
        this.duration -= deltaTime;
    }
    
    draw(ctx) {
        // Efekt tipine göre çizim
        switch (this.type) {
            case 'explosion':
                this.drawExplosion(ctx);
                break;
            case 'hit':
                this.drawHit(ctx);
                break;
            case 'flash':
                this.drawFlash(ctx);
                break;
            case 'text':
                this.drawText(ctx);
                break;
            case 'damage':
                this.drawDamage(ctx);
                break;
            default:
                this.drawGenericEffect(ctx);
        }
    }
    
    drawExplosion(ctx) {
        // Patlama efekti
        const progress = 1 - this.duration / this.startTime;
        const currentRadius = this.radius * (1 + progress);
        const alpha = 1 - progress;
        
        // Dış daire
        ctx.fillStyle = `rgba(231, 76, 60, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // İç daire
        ctx.fillStyle = `rgba(241, 196, 15, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Merkez
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawHit(ctx) {
        // Çarpışma efekti
        const progress = 1 - this.duration / this.startTime;
        const currentRadius = this.radius * (1 + progress * 2);
        const alpha = 1 - progress;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawFlash(ctx) {
        // Parlama efekti
        const progress = 1 - this.duration / this.startTime;
        const alpha = 1 - progress;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawDamage(ctx) {
        // Hasar efekti
        const progress = 1 - this.duration / this.startTime;
        const alpha = 1 - progress;
        
        ctx.fillStyle = `rgba(231, 76, 60, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawText(ctx) {
        // Metin efekti
        const progress = 1 - this.duration / this.startTime;
        const alpha = 1 - progress;
        const offsetY = -progress * 30; // Yukarı doğru hareket
        
        ctx.fillStyle = `rgba(${this.getRGBFromColor(this.color)}, ${alpha})`;
        ctx.font = `${this.radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y + offsetY);
    }
    
    drawGenericEffect(ctx) {
        // Genel efekt
        const progress = 1 - this.duration / this.startTime;
        const alpha = 1 - progress;
        
        ctx.fillStyle = `rgba(${this.getRGBFromColor(this.color)}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    getRGBFromColor(color) {
        // Renk formatını RGB'ye dönüştür
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        } else if (color.startsWith('rgba')) {
            return color.slice(5, color.lastIndexOf(','));
        } else if (color.startsWith('rgb')) {
            return color.slice(4, -1);
        }
        return '255, 255, 255'; // Varsayılan beyaz
    }
} 
/**
 * Güç artırımı sınıfı
 */

class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'health', 'speed', 'damage', 'fireRate'
        this.radius = 15;
        this.isAlive = true;
        this.lifeTime = 10000; // 10 saniye
        this.creationTime = Date.now();
        this.pulseAmount = 0;
        this.pulseDirection = 1;
        this.pulseSpeed = 0.05;
        
        // 2.5D özellikleri
        this.height = 10;
        this.maxHeight = 10;
        this.bounceSpeed = 0.02;
        this.bounceTime = 0;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.02;
        this.shadow = {
            radius: this.radius * 0.8,
            opacity: 0.3
        };
        
        // Güç artırımı tipi özelliklerini ayarla
        this.setTypeProperties();
    }
    
    setTypeProperties() {
        switch (this.type) {
            case 'health':
                this.color = '#2ecc71'; // Yeşil
                this.icon = '+';
                break;
            case 'speed':
                this.color = '#3498db'; // Mavi
                this.icon = '→';
                break;
            case 'damage':
                this.color = '#e74c3c'; // Kırmızı
                this.icon = '↑';
                break;
            case 'fireRate':
                this.color = '#f39c12'; // Turuncu
                this.icon = '⚡';
                break;
            default:
                this.color = '#95a5a6'; // Gri
                this.icon = '?';
        }
    }
    
    update(deltaTime) {
        if (!this.isAlive) return;
        
        // Nabız efekti
        this.pulseAmount += this.pulseDirection * this.pulseSpeed;
        if (this.pulseAmount > 0.2 || this.pulseAmount < 0) {
            this.pulseDirection *= -1;
        }
        
        // 2.5D efektleri
        this.bounceTime += this.bounceSpeed * deltaTime;
        this.height = this.maxHeight * 0.5 + Math.sin(this.bounceTime) * this.maxHeight * 0.5;
        
        // Rotasyon
        this.rotationAngle += this.rotationSpeed * deltaTime;
        
        // Yaşam süresi kontrolü
        if (Date.now() - this.creationTime > this.lifeTime) {
            this.isAlive = false;
        }
    }
    
    draw(ctx) {
        if (!this.isAlive) return;
        
        // Gölge çiz
        this.drawShadow(ctx);
        
        // Güç artırımını çiz
        this.drawPowerup(ctx);
    }
    
    drawShadow(ctx) {
        // Gölge çiz (yere)
        ctx.beginPath();
        ctx.ellipse(
            this.x, 
            this.y + 2, 
            this.radius * 0.8, 
            this.radius * 0.4, 
            0, 
            0, 
            Math.PI * 2
        );
        
        // Yüksekliğe göre gölge opaklığını ayarla
        const shadowOpacity = this.shadow.opacity * (1 - this.height / (this.maxHeight * 2 + 1));
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
        ctx.fill();
        ctx.closePath();
    }
    
    drawPowerup(ctx) {
        const pulseRadius = this.radius * (1 + this.pulseAmount);
        const displayY = this.y - this.height;
        
        ctx.save();
        ctx.translate(this.x, displayY);
        ctx.rotate(this.rotationAngle);
        
        // 3D kutu çiz
        this.drawBox(ctx, pulseRadius);
        
        // İkon çiz
        this.drawIcon(ctx, pulseRadius);
        
        ctx.restore();
    }
    
    drawBox(ctx, pulseRadius) {
        const boxSize = pulseRadius * 1.5;
        const boxDepth = boxSize * 0.3;
        
        // Üst yüzey
        ctx.beginPath();
        ctx.rect(-boxSize/2, -boxSize/2, boxSize, boxSize);
        
        // Gradient ile 3D efekti
        const topGradient = ctx.createLinearGradient(
            -boxSize/2, -boxSize/2,
            boxSize/2, boxSize/2
        );
        
        // Renk tonlarını oluştur
        const baseColor = this.hexToRgb(this.color);
        const lighterColor = this.getLighterColor(baseColor, 40);
        const darkerColor = this.getDarkerColor(baseColor, 40);
        
        topGradient.addColorStop(0, lighterColor);
        topGradient.addColorStop(1, this.color);
        
        ctx.fillStyle = topGradient;
        ctx.fill();
        ctx.strokeStyle = darkerColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // Sağ kenar
        ctx.beginPath();
        ctx.moveTo(boxSize/2, -boxSize/2);
        ctx.lineTo(boxSize/2 + boxDepth, -boxSize/2 + boxDepth);
        ctx.lineTo(boxSize/2 + boxDepth, boxSize/2 + boxDepth);
        ctx.lineTo(boxSize/2, boxSize/2);
        ctx.closePath();
        
        const rightGradient = ctx.createLinearGradient(
            boxSize/2, 0,
            boxSize/2 + boxDepth, 0
        );
        rightGradient.addColorStop(0, this.color);
        rightGradient.addColorStop(1, darkerColor);
        
        ctx.fillStyle = rightGradient;
        ctx.fill();
        ctx.strokeStyle = darkerColor;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Alt kenar
        ctx.beginPath();
        ctx.moveTo(-boxSize/2, boxSize/2);
        ctx.lineTo(-boxSize/2 + boxDepth, boxSize/2 + boxDepth);
        ctx.lineTo(boxSize/2 + boxDepth, boxSize/2 + boxDepth);
        ctx.lineTo(boxSize/2, boxSize/2);
        ctx.closePath();
        
        const bottomGradient = ctx.createLinearGradient(
            0, boxSize/2,
            0, boxSize/2 + boxDepth
        );
        bottomGradient.addColorStop(0, this.color);
        bottomGradient.addColorStop(1, darkerColor);
        
        ctx.fillStyle = bottomGradient;
        ctx.fill();
        ctx.strokeStyle = darkerColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    drawIcon(ctx, pulseRadius) {
        const iconSize = pulseRadius * 0.8;
        
        ctx.font = `bold ${iconSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        
        // Parlama efekti
        ctx.beginPath();
        ctx.arc(-iconSize/4, -iconSize/4, iconSize/8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    }
    
    // Renk yardımcı fonksiyonları
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
    }
    
    getLighterColor(color, amount) {
        return `rgb(${Math.min(255, color.r + amount)}, ${Math.min(255, color.g + amount)}, ${Math.min(255, color.b + amount)})`;
    }
    
    getDarkerColor(color, amount) {
        return `rgb(${Math.max(0, color.r - amount)}, ${Math.max(0, color.g - amount)}, ${Math.max(0, color.b - amount)})`;
    }
    
    checkCollision(entity) {
        if (!this.isAlive) return false;
        
        return checkCollision(this, entity);
    }
    
    collect() {
        this.isAlive = false;
    }
} 
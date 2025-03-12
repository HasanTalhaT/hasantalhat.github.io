/**
 * Klavye kontrolleri sınıfı
 */

class KeyboardControls {
    constructor() {
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            fire: false,
            special: false,
            pause: false
        };
        
        // Tuş olaylarını dinle
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    handleKeyDown(event) {
        switch (event.key) {
            case 'w':
            case 'W':
            case 'ArrowUp':
                this.keys.up = true;
                break;
            case 's':
            case 'S':
            case 'ArrowDown':
                this.keys.down = true;
                break;
            case 'a':
            case 'A':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'd':
            case 'D':
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case ' ':
            case 'z':
            case 'Z':
                this.keys.fire = true;
                break;
            case 'x':
            case 'X':
            case 'Shift':
                this.keys.special = true;
                break;
            case 'Escape':
            case 'p':
            case 'P':
                this.keys.pause = true;
                // Tuşa bir kez basıldığında işlem yapılması için
                if (game) {
                    if (game.showMenu) {
                        game.startGame();
                    } else if (!game.gameOver) {
                        game.paused = !game.paused;
                    }
                }
                break;
            case 'm':
            case 'M':
                // Ana menüye dön
                if (game && !game.showMenu) {
                    game.showMenu = true;
                    game.paused = false;
                }
                break;
        }
    }
    
    handleKeyUp(event) {
        switch (event.key) {
            case 'w':
            case 'W':
            case 'ArrowUp':
                this.keys.up = false;
                break;
            case 's':
            case 'S':
            case 'ArrowDown':
                this.keys.down = false;
                break;
            case 'a':
            case 'A':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'd':
            case 'D':
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case ' ':
                this.keys.fire = false;
                break;
            case 'Shift':
            case 'e':
            case 'E':
                this.keys.special = false;
                break;
        }
    }
    
    getMovementDirection() {
        let dx = 0;
        let dy = 0;
        
        if (this.keys.up) dy -= 1;
        if (this.keys.down) dy += 1;
        if (this.keys.left) dx -= 1;
        if (this.keys.right) dx += 1;
        
        // Köşegen hareketi normalleştir
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }
        
        return { dx, dy };
    }
    
    isFirePressed() {
        return this.keys.fire;
    }
    
    isSpecialPressed() {
        return this.keys.special;
    }
}

/**
 * Dokunmatik kontroller sınıfı
 */

class TouchControls {
    constructor(canvas) {
        this.canvas = canvas;
        this.joystickRadius = 50;
        this.buttonRadius = 40;
        
        // Joystick konumu
        this.joystick = {
            baseX: 100,
            baseY: canvas.height - 100,
            knobX: 100,
            knobY: canvas.height - 100,
            isActive: false
        };
        
        // Ateş butonu
        this.fireButton = {
            x: canvas.width - 100,
            y: canvas.height - 100,
            isPressed: false
        };
        
        // Özel yetenek butonu
        this.specialButton = {
            x: canvas.width - 100,
            y: canvas.height - 200,
            isPressed: false
        };
        
        // Dokunmatik olayları dinle
        canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this));
    }
    
    handleTouchStart(event) {
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const touchX = touch.clientX - this.canvas.getBoundingClientRect().left;
            const touchY = touch.clientY - this.canvas.getBoundingClientRect().top;
            
            // Joystick kontrolü
            const distToJoystick = distance(touchX, touchY, this.joystick.baseX, this.joystick.baseY);
            if (distToJoystick < this.joystickRadius * 1.5) {
                this.joystick.isActive = true;
                this.joystick.knobX = touchX;
                this.joystick.knobY = touchY;
                this.joystick.touchId = touch.identifier;
                continue;
            }
            
            // Ateş butonu kontrolü
            const distToFireButton = distance(touchX, touchY, this.fireButton.x, this.fireButton.y);
            if (distToFireButton < this.buttonRadius) {
                this.fireButton.isPressed = true;
                this.fireButton.touchId = touch.identifier;
                continue;
            }
            
            // Özel yetenek butonu kontrolü
            const distToSpecialButton = distance(touchX, touchY, this.specialButton.x, this.specialButton.y);
            if (distToSpecialButton < this.buttonRadius) {
                this.specialButton.isPressed = true;
                this.specialButton.touchId = touch.identifier;
                continue;
            }
        }
    }
    
    handleTouchMove(event) {
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const touchX = touch.clientX - this.canvas.getBoundingClientRect().left;
            const touchY = touch.clientY - this.canvas.getBoundingClientRect().top;
            
            // Joystick kontrolü
            if (this.joystick.isActive && this.joystick.touchId === touch.identifier) {
                const dx = touchX - this.joystick.baseX;
                const dy = touchY - this.joystick.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > this.joystickRadius) {
                    // Joystick sınırlarını aşma
                    const angle = Math.atan2(dy, dx);
                    this.joystick.knobX = this.joystick.baseX + Math.cos(angle) * this.joystickRadius;
                    this.joystick.knobY = this.joystick.baseY + Math.sin(angle) * this.joystickRadius;
                } else {
                    this.joystick.knobX = touchX;
                    this.joystick.knobY = touchY;
                }
            }
        }
    }
    
    handleTouchEnd(event) {
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            
            // Joystick kontrolü
            if (this.joystick.isActive && this.joystick.touchId === touch.identifier) {
                this.joystick.isActive = false;
                this.joystick.knobX = this.joystick.baseX;
                this.joystick.knobY = this.joystick.baseY;
            }
            
            // Ateş butonu kontrolü
            if (this.fireButton.touchId === touch.identifier) {
                this.fireButton.isPressed = false;
            }
            
            // Özel yetenek butonu kontrolü
            if (this.specialButton.touchId === touch.identifier) {
                this.specialButton.isPressed = false;
            }
        }
    }
    
    getMovementDirection() {
        if (!this.joystick.isActive) {
            return { dx: 0, dy: 0 };
        }
        
        let dx = (this.joystick.knobX - this.joystick.baseX) / this.joystickRadius;
        let dy = (this.joystick.knobY - this.joystick.baseY) / this.joystickRadius;
        
        // Değerleri -1 ile 1 arasında sınırla
        dx = Math.max(-1, Math.min(1, dx));
        dy = Math.max(-1, Math.min(1, dy));
        
        return { dx, dy };
    }
    
    isFirePressed() {
        return this.fireButton.isPressed;
    }
    
    isSpecialPressed() {
        return this.specialButton.isPressed;
    }
    
    draw(ctx) {
        // Joystick çiz
        this.drawJoystick(ctx);
        
        // Ateş butonu çiz
        this.drawButton(ctx, this.fireButton, '#e74c3c', '🔥');
        
        // Özel yetenek butonu çiz
        this.drawButton(ctx, this.specialButton, '#3498db', '⚡');
    }
    
    drawJoystick(ctx) {
        // Joystick tabanı
        ctx.beginPath();
        ctx.arc(this.joystick.baseX, this.joystick.baseY, this.joystickRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(52, 73, 94, 0.5)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(52, 73, 94, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // Joystick topu
        ctx.beginPath();
        ctx.arc(this.joystick.knobX, this.joystick.knobY, this.joystickRadius / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.joystick.isActive ? 'rgba(52, 152, 219, 0.8)' : 'rgba(52, 152, 219, 0.5)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(41, 128, 185, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }
    
    drawButton(ctx, button, color, icon) {
        // Buton arka planı
        ctx.beginPath();
        ctx.arc(button.x, button.y, this.buttonRadius, 0, Math.PI * 2);
        ctx.fillStyle = button.isPressed ? color : color.replace(')', ', 0.7)').replace('rgb', 'rgba');
        ctx.fill();
        ctx.strokeStyle = color.replace(')', ', 0.9)').replace('rgb', 'rgba');
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // Buton ikonu
        ctx.font = `${this.buttonRadius}px Arial`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, button.x, button.y);
    }
} 
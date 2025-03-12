/**
 * Giriş kontrolleri
 */

class InputManager {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.touchStartPos = { x: 0, y: 0 };
        this.touchCurrentPos = { x: 0, y: 0 };
        this.isTouching = false;
        this.joystickActive = false;
        this.joystickCenter = { x: 0, y: 0 };
        this.joystickPosition = { x: 0, y: 0 };
        this.joystickRadius = 50;
        this.joystickElement = document.getElementById('joystick-area');
        this.specialAbilityButton = document.getElementById('special-ability');
        
        // Joystick görselini oluştur
        this.createJoystickVisual();
        
        // Kontrolleri başlat
        this.setupKeyboardControls();
        this.setupTouchControls();
        
        // Özel yetenek butonu
        this.specialAbilityButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.game.player.useSpecialAbility();
        });
    }
    
    createJoystickVisual() {
        // Joystick merkezi
        this.joystickCenterVisual = document.createElement('div');
        this.joystickCenterVisual.style.position = 'absolute';
        this.joystickCenterVisual.style.width = '40px';
        this.joystickCenterVisual.style.height = '40px';
        this.joystickCenterVisual.style.borderRadius = '50%';
        this.joystickCenterVisual.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        this.joystickCenterVisual.style.left = '50%';
        this.joystickCenterVisual.style.top = '50%';
        this.joystickCenterVisual.style.transform = 'translate(-50%, -50%)';
        this.joystickCenterVisual.style.display = 'none';
        this.joystickElement.appendChild(this.joystickCenterVisual);
        
        // Joystick kontrolü
        this.joystickControlVisual = document.createElement('div');
        this.joystickControlVisual.style.position = 'absolute';
        this.joystickControlVisual.style.width = '30px';
        this.joystickControlVisual.style.height = '30px';
        this.joystickControlVisual.style.borderRadius = '50%';
        this.joystickControlVisual.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        this.joystickControlVisual.style.left = '50%';
        this.joystickControlVisual.style.top = '50%';
        this.joystickControlVisual.style.transform = 'translate(-50%, -50%)';
        this.joystickControlVisual.style.display = 'none';
        this.joystickElement.appendChild(this.joystickControlVisual);
    }
    
    setupKeyboardControls() {
        // Klavye tuşlarını dinle
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    setupTouchControls() {
        // Joystick kontrolü
        this.joystickElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.joystickElement.getBoundingClientRect();
            
            this.joystickActive = true;
            this.joystickCenter.x = rect.left + rect.width / 2;
            this.joystickCenter.y = rect.top + rect.height / 2;
            this.joystickPosition.x = touch.clientX;
            this.joystickPosition.y = touch.clientY;
            
            // Joystick görselini göster
            this.joystickCenterVisual.style.display = 'block';
            this.joystickControlVisual.style.display = 'block';
            this.joystickControlVisual.style.left = (touch.clientX - rect.left) + 'px';
            this.joystickControlVisual.style.top = (touch.clientY - rect.top) + 'px';
        });
        
        window.addEventListener('touchmove', (e) => {
            if (this.joystickActive) {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = this.joystickElement.getBoundingClientRect();
                
                this.joystickPosition.x = touch.clientX;
                this.joystickPosition.y = touch.clientY;
                
                // Joystick kontrolünün pozisyonunu sınırla
                const dx = touch.clientX - this.joystickCenter.x;
                const dy = touch.clientY - this.joystickCenter.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = this.joystickRadius;
                
                if (distance > maxDistance) {
                    const angle = Math.atan2(dy, dx);
                    this.joystickPosition.x = this.joystickCenter.x + Math.cos(angle) * maxDistance;
                    this.joystickPosition.y = this.joystickCenter.y + Math.sin(angle) * maxDistance;
                }
                
                // Joystick görselini güncelle
                const relativeX = this.joystickPosition.x - rect.left;
                const relativeY = this.joystickPosition.y - rect.top;
                this.joystickControlVisual.style.left = clamp(relativeX, 0, rect.width) + 'px';
                this.joystickControlVisual.style.top = clamp(relativeY, 0, rect.height) + 'px';
            }
        });
        
        window.addEventListener('touchend', (e) => {
            if (this.joystickActive) {
                this.joystickActive = false;
                
                // Joystick görselini gizle
                this.joystickCenterVisual.style.display = 'none';
                this.joystickControlVisual.style.display = 'none';
            }
        });
    }
    
    update() {
        // Klavye kontrolleri
        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.game.player.moveForward();
        }
        
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.game.player.moveBackward();
        }
        
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.game.player.rotateLeft();
        }
        
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.game.player.rotateRight();
        }
        
        if (this.keys[' ']) {
            this.game.player.fire();
        }
        
        // Joystick kontrolleri
        if (this.joystickActive) {
            const dx = this.joystickPosition.x - this.joystickCenter.x;
            const dy = this.joystickPosition.y - this.joystickCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) {  // Küçük bir eşik değeri
                const angle = Math.atan2(dy, dx);
                const normalizedDistance = Math.min(distance, this.joystickRadius) / this.joystickRadius;
                
                // Tank hareketini ve dönüşünü güncelle
                this.game.player.moveWithJoystick(angle, normalizedDistance);
            }
        }
    }
} 
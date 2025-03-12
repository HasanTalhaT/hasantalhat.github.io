/**
 * Ana dosya - Oyunu başlatır
 */

// Ses efektleri
const sounds = {};

// Oyun nesnesi
let game;

// Sayfa yüklendiğinde oyunu başlat
window.addEventListener('load', () => {
    // Canvas'ı ayarla
    const canvas = document.getElementById('game-canvas');
    resizeCanvas(canvas);
    
    // Sesleri yükle
    preloadSounds();
    
    // Oyunu başlat
    game = new Game(canvas);
    
    // Pencere yeniden boyutlandırıldığında
    window.addEventListener('resize', () => {
        resizeCanvas(canvas);
        
        // Dokunmatik kontrolleri güncelle
        if (game && game.controls && game.controls.touch) {
            game.controls.touch.joystick.baseX = 100;
            game.controls.touch.joystick.baseY = canvas.height - 100;
            game.controls.touch.joystick.knobX = 100;
            game.controls.touch.joystick.knobY = canvas.height - 100;
            
            game.controls.touch.fireButton.x = canvas.width - 100;
            game.controls.touch.fireButton.y = canvas.height - 100;
            
            game.controls.touch.specialButton.x = canvas.width - 100;
            game.controls.touch.specialButton.y = canvas.height - 200;
        }
    });
    
    // Oyun sonu ekranında tıklama
    canvas.addEventListener('click', () => {
        if (game && game.gameOver) {
            game.restart();
        }
    });
    
    // Mobil cihazlarda dokunma
    canvas.addEventListener('touchstart', (event) => {
        if (game && game.gameOver) {
            event.preventDefault();
            game.restart();
        }
    });
    
    // Mobil cihaz kontrolü
    if (isMobile() || isTouchDevice()) {
        document.body.classList.add('mobile');
    }
    
    // Tarayıcı uyarısı
    checkBrowserSupport();
});

/**
 * Canvas'ı ekran boyutuna göre ayarla
 */
function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Ses efektlerini yükle
 */
function preloadSounds() {
    const soundFiles = [
        'fire.mp3',
        'hit.mp3',
        'explosion.mp3',
        'powerup.mp3',
        'gameover.mp3'
    ];
    
    soundFiles.forEach(file => {
        try {
            const sound = new Audio(`sounds/${file}`);
            sound.volume = 0.5;
            sounds[file] = sound;
            
            // Ses dosyası yüklenemediğinde hata vermemesi için
            sound.addEventListener('error', () => {
                console.warn(`Ses dosyası bulunamadı: ${file}, oyun sessiz modda devam edecek.`);
            });
        } catch (error) {
            console.warn(`Ses dosyası yüklenemedi: ${file}, oyun sessiz modda devam edecek.`);
        }
    });
}

/**
 * Ses efekti çal
 */
function playSound(soundPath, volume = 0.5) {
    try {
        const fileName = soundPath.split('/').pop();
        
        if (sounds[fileName]) {
            const soundClone = sounds[fileName].cloneNode();
            soundClone.volume = volume;
            soundClone.play().catch(error => {
                // Ses çalma hatası sessizce geçilsin
                console.warn(`Ses çalınamadı: ${fileName}`);
            });
        } else {
            // Ses bulunamadığında sessizce geçilsin
            console.warn(`Ses bulunamadı: ${fileName}`);
        }
    } catch (error) {
        // Ses çalma hatası sessizce geçilsin
        console.warn('Ses çalma hatası');
    }
}

/**
 * Mobil cihaz kontrolü
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Dokunmatik cihaz kontrolü
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

/**
 * İki nokta arasındaki mesafeyi hesaplayan yardımcı fonksiyon
 */
function distance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Ağırlıklı rastgele seçim yapan yardımcı fonksiyon
 */
function weightedRandom(items, weights) {
    // Toplam ağırlığı hesapla
    let total = 0;
    for (let i = 0; i < weights.length; i++) {
        total += weights[i];
    }
    
    // Rastgele bir değer seç
    const random = Math.random() * total;
    
    // Ağırlıklara göre öğeyi seç
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
        sum += weights[i];
        if (random < sum) {
            return items[i];
        }
    }
    
    // Varsayılan olarak ilk öğeyi döndür
    return items[0];
}

// Tarayıcı desteğini kontrol et
function checkBrowserSupport() {
    // Canvas desteği
    if (!document.createElement('canvas').getContext) {
        alert('Tarayıcınız HTML5 Canvas desteklemiyor. Lütfen modern bir tarayıcı kullanın.');
        return false;
    }
    
    return true;
}

/**
 * Sağlık durumuna göre renk döndüren yardımcı fonksiyon
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
 * İki nesne arasındaki çarpışmayı kontrol eden yardımcı fonksiyon
 */
function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < obj1.radius + obj2.radius;
}

/**
 * Belirtilen aralıkta rastgele tam sayı döndüren yardımcı fonksiyon
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 
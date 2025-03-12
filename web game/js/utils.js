/**
 * Yardımcı fonksiyonlar
 */

// İki nokta arasındaki mesafeyi hesaplar
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// İki nokta arasındaki açıyı radyan cinsinden hesaplar
function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

// Radyan değerini dereceye çevirir
function radToDeg(rad) {
    return rad * 180 / Math.PI;
}

// Derece değerini radyana çevirir
function degToRad(deg) {
    return deg * Math.PI / 180;
}

// İki nesne arasında çarpışma kontrolü yapar
function checkCollision(obj1, obj2) {
    return distance(obj1.x, obj1.y, obj2.x, obj2.y) < (obj1.radius + obj2.radius);
}

// Rastgele bir sayı üretir (min dahil, max dahil)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Rastgele bir konum üretir (sınırlar içinde)
function randomPosition(minX, maxX, minY, maxY) {
    return {
        x: randomInt(minX, maxX),
        y: randomInt(minY, maxY)
    };
}

// Bir değeri belirli bir aralıkta sınırlar
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Bir nesneyi belirli bir yöne doğru hareket ettirir
function moveInDirection(obj, angle, speed) {
    obj.x += Math.cos(angle) * speed;
    obj.y += Math.sin(angle) * speed;
}

// Bir nesnenin sınırlar içinde kalmasını sağlar
function keepInBounds(obj, minX, maxX, minY, maxY) {
    obj.x = clamp(obj.x, minX + obj.radius, maxX - obj.radius);
    obj.y = clamp(obj.y, minY + obj.radius, maxY - obj.radius);
}

// Bir nesnenin başka bir nesneye doğru dönmesini sağlar
function rotateTowards(obj, targetX, targetY) {
    return angle(obj.x, obj.y, targetX, targetY);
}

// Renk geçişi oluşturur (sağlık barı için)
function getHealthColor(health, maxHealth) {
    const ratio = health / maxHealth;
    const r = ratio < 0.5 ? 255 : Math.floor(255 - (ratio - 0.5) * 2 * 255);
    const g = ratio > 0.5 ? 255 : Math.floor(ratio * 2 * 255);
    return `rgb(${r}, ${g}, 0)`;
}

// Mobil cihaz kontrolü
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Dokunmatik ekran kontrolü
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Ekran boyutlarını alır
function getScreenDimensions() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

// Ses efekti çalar
function playSound(src, volume = 1.0) {
    try {
        const sound = new Audio(src);
        sound.volume = volume;
        sound.play().catch(e => {
            console.log('Ses dosyası çalınamadı:', e);
        });
    } catch (e) {
        console.log('Ses dosyası yüklenemedi:', e);
    }
}

// Yerel depolama işlemleri
const storage = {
    save: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    load: function(key, defaultValue = null) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    },
    remove: function(key) {
        localStorage.removeItem(key);
    }
}; 
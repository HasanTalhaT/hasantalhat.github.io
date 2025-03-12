/**
 * Seviye sınıfı
 */

class Level {
    constructor(game, levelNumber) {
        this.game = game;
        this.levelNumber = levelNumber;
        this.isCompleted = false;
        this.enemiesRemaining = 0;
        this.enemyWaves = [];
        this.currentWave = 0;
        this.waveDelay = 5000; // 5 saniye
        this.lastWaveTime = 0;
        this.obstacles = [];
        
        // Seviye özelliklerini ayarla
        this.setupLevel();
    }
    
    setupLevel() {
        // Seviye numarasına göre düşman dalgalarını oluştur
        const baseEnemyCount = 5 + (this.levelNumber - 1) * 2;
        const wavesCount = 2 + Math.min(Math.floor(this.levelNumber / 2), 3);
        
        for (let i = 0; i < wavesCount; i++) {
            const wave = {
                enemies: [],
                isSpawned: false
            };
            
            // Dalga başına düşman sayısı
            const enemyCount = baseEnemyCount + i * 2;
            
            // Düşman tiplerini belirle
            for (let j = 0; j < enemyCount; j++) {
                let enemyType = 'normal';
                
                // Seviye ilerledikçe daha güçlü düşmanlar ekle
                const rand = Math.random();
                
                if (this.levelNumber >= 3) {
                    if (rand < 0.1) {
                        enemyType = 'heavy';
                    } else if (rand < 0.3) {
                        enemyType = 'elite';
                    } else if (rand < 0.6) {
                        enemyType = 'fast';
                    }
                } else if (this.levelNumber >= 2) {
                    if (rand < 0.2) {
                        enemyType = 'fast';
                    } else if (rand < 0.3) {
                        enemyType = 'elite';
                    }
                }
                
                wave.enemies.push(enemyType);
            }
            
            this.enemyWaves.push(wave);
            this.enemiesRemaining += enemyCount;
        }
        
        // Engelleri oluştur
        this.createObstacles();
    }
    
    createObstacles() {
        // Seviye numarasına göre engel sayısını belirle
        const obstacleCount = Math.min(this.levelNumber * 2, 10);
        
        for (let i = 0; i < obstacleCount; i++) {
            // Rastgele konum
            const margin = 100;
            const x = randomInt(margin, this.game.canvas.width - margin);
            const y = randomInt(margin, this.game.canvas.height - margin);
            
            // Oyuncudan uzakta olduğundan emin ol
            if (distance(x, y, this.game.canvas.width / 2, this.game.canvas.height / 2) < 150) {
                i--; // Tekrar dene
                continue;
            }
            
            // Diğer engellerle çakışmadığından emin ol
            let overlaps = false;
            for (const obstacle of this.obstacles) {
                if (distance(x, y, obstacle.x, obstacle.y) < obstacle.radius * 2 + 50) {
                    overlaps = true;
                    break;
                }
            }
            
            if (overlaps) {
                i--; // Tekrar dene
                continue;
            }
            
            // Engel tipini belirle
            const obstacleType = Math.random() < 0.7 ? 'rock' : 'water';
            const radius = obstacleType === 'rock' ? randomInt(30, 50) : randomInt(40, 70);
            
            // 2.5D için yükseklik
            let obstacleHeight = 0;
            if (obstacleType === 'rock') {
                switch (radius) {
                    case 30: obstacleHeight = 15; break;
                    case 40: obstacleHeight = 25; break;
                    case 50: obstacleHeight = 40; break;
                    default: obstacleHeight = 20;
                }
            }
            
            // Engeli ekle
            this.obstacles.push({
                x,
                y,
                radius,
                type: obstacleType,
                size: 'mixed',
                height: obstacleHeight,
                color: obstacleType === 'rock' ? '#7f8c8d' : '#3498db'
            });
        }
    }
    
    update(deltaTime) {
        if (this.isCompleted) return;
        
        // Tüm düşmanlar öldürüldü mü?
        if (this.enemiesRemaining <= 0 && this.currentWave >= this.enemyWaves.length) {
            this.complete();
            return;
        }
        
        // Yeni dalga zamanı geldi mi?
        const currentTime = Date.now();
        if (this.currentWave < this.enemyWaves.length && 
            !this.enemyWaves[this.currentWave].isSpawned && 
            (this.currentWave === 0 || currentTime - this.lastWaveTime > this.waveDelay)) {
            
            this.spawnWave(this.currentWave);
            this.currentWave++;
            this.lastWaveTime = currentTime;
        }
    }
    
    spawnWave(waveIndex) {
        const wave = this.enemyWaves[waveIndex];
        wave.isSpawned = true;
        
        // Düşmanları oluştur
        for (const enemyType of wave.enemies) {
            // Rastgele konum (ekranın dışında)
            let x, y;
            const side = randomInt(0, 3); // 0: üst, 1: sağ, 2: alt, 3: sol
            
            switch (side) {
                case 0: // üst
                    x = randomInt(0, this.game.canvas.width);
                    y = -50;
                    break;
                case 1: // sağ
                    x = this.game.canvas.width + 50;
                    y = randomInt(0, this.game.canvas.height);
                    break;
                case 2: // alt
                    x = randomInt(0, this.game.canvas.width);
                    y = this.game.canvas.height + 50;
                    break;
                case 3: // sol
                    x = -50;
                    y = randomInt(0, this.game.canvas.height);
                    break;
            }
            
            // Düşmanı oluştur
            this.game.addEnemy(new Enemy(x, y, enemyType, this.game));
        }
        
        // Dalga başladı efekti
        this.game.showMessage(`DALGA ${waveIndex + 1}`, 2000);
    }
    
    draw(ctx) {
        // Engelleri çiz
        for (const obstacle of this.obstacles) {
            if (obstacle.type === 'rock') {
                // Kaya
                ctx.beginPath();
                ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#7f8c8d';
                ctx.fill();
                ctx.closePath();
                
                // Detaylar
                ctx.beginPath();
                ctx.arc(obstacle.x - obstacle.radius * 0.3, obstacle.y - obstacle.radius * 0.3, obstacle.radius * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = '#95a5a6';
                ctx.fill();
                ctx.closePath();
                
                ctx.beginPath();
                ctx.arc(obstacle.x + obstacle.radius * 0.4, obstacle.y + obstacle.radius * 0.2, obstacle.radius * 0.15, 0, Math.PI * 2);
                ctx.fillStyle = '#95a5a6';
                ctx.fill();
                ctx.closePath();
            } else if (obstacle.type === 'water') {
                // Su birikintisi
                ctx.beginPath();
                ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(41, 128, 185, 0.5)';
                ctx.fill();
                ctx.closePath();
                
                // Dalgalar
                ctx.beginPath();
                ctx.arc(obstacle.x, obstacle.y, obstacle.radius * 0.8, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(41, 128, 185, 0.7)';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
                
                ctx.beginPath();
                ctx.arc(obstacle.x, obstacle.y, obstacle.radius * 0.5, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(41, 128, 185, 0.9)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
    
    checkObstacleCollision(entity) {
        for (const obstacle of this.obstacles) {
            if (distance(entity.x, entity.y, obstacle.x, obstacle.y) < entity.radius + obstacle.radius) {
                // Engel tipine göre etki
                if (obstacle.type === 'rock') {
                    // Kaya: Hareket engeli
                    return {
                        collides: true,
                        type: 'rock',
                        x: obstacle.x,
                        y: obstacle.y,
                        radius: obstacle.radius
                    };
                } else if (obstacle.type === 'water') {
                    // Su: Yavaşlatma
                    return {
                        collides: true,
                        type: 'water',
                        x: obstacle.x,
                        y: obstacle.y,
                        radius: obstacle.radius
                    };
                }
            }
        }
        
        return { collides: false };
    }
    
    enemyDefeated() {
        this.enemiesRemaining--;
        
        // Tüm düşmanlar öldürüldü mü?
        if (this.enemiesRemaining <= 0 && this.currentWave >= this.enemyWaves.length) {
            this.complete();
        }
    }
    
    complete() {
        if (this.isCompleted) return;
        
        this.isCompleted = true;
        
        // Seviye tamamlandı mesajı
        this.game.showMessage(`SEVİYE ${this.levelNumber} TAMAMLANDI!`, 3000);
        
        // Bir sonraki seviyeye geç
        setTimeout(() => {
            this.game.nextLevel();
        }, 3000);
    }
}

/**
 * Seviye verilerini döndüren fonksiyon
 */

function getLevelData(level) {
    // Temel seviye ayarları
    const baseData = {
        enemySpawnInterval: 2000, // 2 saniye
        maxEnemies: 5,
        powerupSpawnInterval: 10000, // 10 saniye
        enemyTypes: {
            normal: 0.7,
            fast: 0.2,
            heavy: 0.1,
            elite: 0
        },
        obstacles: []
    };
    
    // Seviyeye göre zorluk ayarları
    switch (level) {
        case 1:
            // Başlangıç seviyesi - kolay
            return {
                ...baseData,
                enemySpawnInterval: 3000,
                maxEnemies: 3,
                powerupSpawnInterval: 8000,
                enemyTypes: {
                    normal: 1,
                    fast: 0,
                    heavy: 0,
                    elite: 0
                },
                obstacles: generateObstacles(5, 'rock', 'small')
            };
            
        case 2:
            return {
                ...baseData,
                enemySpawnInterval: 2500,
                maxEnemies: 4,
                powerupSpawnInterval: 9000,
                enemyTypes: {
                    normal: 0.8,
                    fast: 0.2,
                    heavy: 0,
                    elite: 0
                },
                obstacles: generateObstacles(8, 'mixed', 'small')
            };
            
        case 3:
            return {
                ...baseData,
                enemySpawnInterval: 2000,
                maxEnemies: 5,
                powerupSpawnInterval: 10000,
                enemyTypes: {
                    normal: 0.6,
                    fast: 0.3,
                    heavy: 0.1,
                    elite: 0
                },
                obstacles: generateObstacles(10, 'mixed', 'mixed')
            };
            
        case 4:
            return {
                ...baseData,
                enemySpawnInterval: 1800,
                maxEnemies: 6,
                powerupSpawnInterval: 12000,
                enemyTypes: {
                    normal: 0.5,
                    fast: 0.3,
                    heavy: 0.2,
                    elite: 0
                },
                obstacles: generateObstacles(12, 'mixed', 'mixed')
            };
            
        case 5:
            return {
                ...baseData,
                enemySpawnInterval: 1500,
                maxEnemies: 7,
                powerupSpawnInterval: 15000,
                enemyTypes: {
                    normal: 0.4,
                    fast: 0.3,
                    heavy: 0.25,
                    elite: 0.05
                },
                obstacles: generateObstacles(15, 'mixed', 'mixed')
            };
            
        default:
            // Seviye 5'ten sonra giderek zorlaşan sonsuz modlar
            const difficulty = level - 5;
            return {
                ...baseData,
                enemySpawnInterval: Math.max(1000, 1500 - difficulty * 100),
                maxEnemies: Math.min(15, 7 + difficulty),
                powerupSpawnInterval: Math.max(8000, 15000 + difficulty * 1000),
                enemyTypes: {
                    normal: Math.max(0.2, 0.4 - difficulty * 0.05),
                    fast: 0.3,
                    heavy: Math.min(0.4, 0.25 + difficulty * 0.03),
                    elite: Math.min(0.3, 0.05 + difficulty * 0.05)
                },
                obstacles: generateObstacles(15 + difficulty, 'mixed', 'mixed')
            };
    }
}

/**
 * Rastgele engeller oluşturan yardımcı fonksiyon
 */
function generateObstacles(count, type = 'mixed', size = 'mixed') {
    const obstacles = [];
    const canvas = document.getElementById('game-canvas');
    const width = canvas.width;
    const height = canvas.height;
    
    // Oyun alanının merkezinde engel olmasın
    const safeZoneRadius = 150;
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let i = 0; i < count; i++) {
        // Rastgele konum
        let x, y;
        let isSafe = false;
        
        // Güvenli bir konum bulana kadar dene
        while (!isSafe) {
            x = 50 + Math.random() * (width - 100);
            y = 50 + Math.random() * (height - 100);
            
            // Merkeze olan uzaklık
            const distToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            
            // Diğer engellere olan uzaklık
            let minDistToOther = Number.MAX_VALUE;
            for (const obs of obstacles) {
                const dist = Math.sqrt(Math.pow(x - obs.x, 2) + Math.pow(y - obs.y, 2));
                minDistToOther = Math.min(minDistToOther, dist);
            }
            
            // Merkeze ve diğer engellere yeterince uzaksa güvenli
            isSafe = distToCenter > safeZoneRadius && (obstacles.length === 0 || minDistToOther > 100);
        }
        
        // Engel tipi
        let obstacleType;
        if (type === 'mixed') {
            obstacleType = Math.random() < 0.7 ? 'rock' : 'water';
        } else {
            obstacleType = type;
        }
        
        // Engel boyutu
        let obstacleSize;
        if (size === 'mixed') {
            const rand = Math.random();
            if (rand < 0.5) obstacleSize = 'small';
            else if (rand < 0.8) obstacleSize = 'medium';
            else obstacleSize = 'large';
        } else {
            obstacleSize = size;
        }
        
        // Boyuta göre yarıçap
        let radius;
        switch (obstacleSize) {
            case 'small': radius = 20 + Math.random() * 10; break;
            case 'medium': radius = 30 + Math.random() * 15; break;
            case 'large': radius = 45 + Math.random() * 20; break;
            default: radius = 30;
        }
        
        // 2.5D için yükseklik
        let obstacleHeight = 0;
        if (obstacleType === 'rock') {
            switch (obstacleSize) {
                case 'small': obstacleHeight = 15; break;
                case 'medium': obstacleHeight = 25; break;
                case 'large': obstacleHeight = 40; break;
                default: obstacleHeight = 20;
            }
        }
        
        // Engeli ekle
        obstacles.push({
            x,
            y,
            radius,
            type: obstacleType,
            size: obstacleSize,
            height: obstacleHeight,
            color: obstacleType === 'rock' ? '#7f8c8d' : '#3498db'
        });
    }
    
    return obstacles;
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
 * İki nokta arasındaki mesafeyi hesaplayan yardımcı fonksiyon
 */
function distance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Mobil cihaz kontrolü yapan yardımcı fonksiyon
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
} 
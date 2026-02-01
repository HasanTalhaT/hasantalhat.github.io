// ===== SNOW EFFECT =====
function createSnowEffect() {
    const snowContainer = document.getElementById('snow-container');
    if (!snowContainer) return;

    const snowflakeCount = 50;

    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        
        const size = Math.random() * 10 + 5 + 'px';
        snowflake.style.width = size;
        snowflake.style.height = size;
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = Math.random() * 5 + 5 + 's';
        snowflake.style.animationDelay = Math.random() * 5 + 's';
        
        snowContainer.appendChild(snowflake);
    }
}

// ===== FIREWORKS EFFECT =====
function initFireworks() {
    const container = document.getElementById('fireworks-container');
    if (!container || typeof Fireworks === 'undefined') return;

    const fireworks = new Fireworks(container, {
        speed: 2,
        acceleration: 1.05,
        friction: 0.97,
        gravity: 1.5,
        particles: 50,
        trace: 3,
        explosion: 5,
        autoresize: true,
        brightness: { min: 50, max: 80 },
        boundaries: { 
            x: 50, 
            y: 50, 
            width: window.innerWidth - 100, 
            height: window.innerHeight - 100 
        },
    });

    fireworks.start();

    // Trigger fireworks every 5 seconds
    setInterval(() => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight / 2; // Upper half of screen
        fireworks.trigger(x, y);
    }, 5000);
}

// ===== VIDEO CONTROLS =====
function setupVideoControls() {
    const video = document.getElementById('video');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');

    if (video && playBtn) {
        playBtn.addEventListener('click', () => {
            video.play();
        });
    }

    if (video && pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            video.pause();
        });
    }
}

// ===== INTERACTIVE IMAGE WITH AUDIO =====
function setupInteractiveImage() {
    const hasoImage = document.getElementById('hasoImage');
    const hasoAudio = document.getElementById('hasoAudio');

    if (hasoImage && hasoAudio) {
        hasoImage.addEventListener('click', () => {
            hasoAudio.currentTime = 0;
            hasoAudio.play();
            
            // Add animation effect
            hasoImage.style.transform = 'scale(1.1) rotate(5deg)';
            setTimeout(() => {
                hasoImage.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
        });
    }
}

// ===== SMOOTH SCROLL =====
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== INITIALIZE ALL EFFECTS ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    createSnowEffect();
    initFireworks();
    setupVideoControls();
    setupInteractiveImage();
    setupSmoothScroll();

    // Add fade-in animation to elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    document.querySelectorAll('.file-card, .hero-content, .video-wrapper').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ===== MOBILE MENU TOGGLE (Optional Enhancement) =====
function setupMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const logo = document.querySelector('.logo');

    if (window.innerWidth <= 768 && navMenu) {
        // Add mobile menu toggle button if needed
        // This can be enhanced further for better mobile UX
    }
}

window.addEventListener('resize', setupMobileMenu);

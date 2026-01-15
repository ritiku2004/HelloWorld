const aboutCanvas = document.getElementById('about-canvas');
const aboutCtx = aboutCanvas.getContext('2d');

let aboutWidth, aboutHeight;
let aboutParticles = [];

const aboutConfig = {
    count: 40, /* Sufficient density for continuous stream */
    colors: ['rgba(99, 102, 241, 0.15)', 'rgba(236, 72, 153, 0.15)', 'rgba(45, 212, 191, 0.15)'],
    /* Strict Uniformity */
    minSpeed: 0.6,
    maxSpeed: 0.6, /* Fixed speed for perfect uniformity */
    minSize: 40,
    maxSize: 50 /* Consistent size */
};

class AntigravityParticle {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * aboutWidth;
        // Continuous: Spread vertically initially, otherwise spawn below
        this.y = initial ? Math.random() * (aboutHeight + 100) : aboutHeight + 50;
        this.size = Math.random() * (aboutConfig.maxSize - aboutConfig.minSize) + aboutConfig.minSize;
        this.color = aboutConfig.colors[Math.floor(Math.random() * aboutConfig.colors.length)];
        this.speed = Math.random() * (aboutConfig.maxSpeed - aboutConfig.minSpeed) + aboutConfig.minSpeed;
        this.vx = 0; // No drift, just straight up for "Uniform Production"
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = 0.01; /* Slow constant rotation */
    }

    update() {
        this.y -= this.speed;
        this.rotation += this.rotationSpeed;

        if (this.y < -100) {
            this.reset();
        }
    }

    draw() {
        aboutCtx.save();
        aboutCtx.translate(this.x, this.y);
        aboutCtx.rotate(this.rotation);

        // Edge Fading
        let alpha = 1;
        const fadeZone = 100;
        if (this.y < fadeZone) alpha = Math.max(0, this.y / fadeZone);
        else if (this.y > aboutHeight - fadeZone) alpha = Math.max(0, (aboutHeight - this.y) / fadeZone);
        aboutCtx.globalAlpha = alpha;

        // Rectangle Shape (User Request)
        aboutCtx.fillStyle = this.color;
        aboutCtx.beginPath();
        aboutCtx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
        aboutCtx.fill();

        aboutCtx.restore();
    }
}

function initAbout() {
    resizeAbout();
    aboutParticles = [];
    for (let i = 0; i < aboutConfig.count; i++) {
        aboutParticles.push(new AntigravityParticle());
    }
    animateAbout();
}

function resizeAbout() {
    if (aboutCanvas.parentElement) {
        aboutWidth = aboutCanvas.width = aboutCanvas.parentElement.offsetWidth;
        aboutHeight = aboutCanvas.height = aboutCanvas.parentElement.offsetHeight;
    }
}

function animateAbout() {
    if (!aboutCanvas) return;
    aboutCtx.clearRect(0, 0, aboutWidth, aboutHeight);

    aboutParticles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animateAbout);
}

window.addEventListener('resize', resizeAbout);
initAbout();

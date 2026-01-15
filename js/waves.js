const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let ripples = [];

// Configuration
const config = {
    particleCount: 150, /* Balanced density */
    connectionDistance: 100,
    mouseDistance: 100, /* Reduced interaction radius as requested */
    springForce: 0.05, /* Return to home speed */
    friction: 0.90, /* Strong friction to prevent overshooting */
    colors: ['#6366f1', '#ec4899', '#2dd4bf']
};

// Mouse State
const mouse = {
    x: undefined,
    y: undefined,
    active: false
};

class Particle {
    constructor() {
        this.originX = Math.random() * width;
        this.originY = Math.random() * height;
        this.x = this.originX;
        this.y = this.originY;
        this.vx = 0;
        this.vy = 0;
        this.size = Math.random() * 2 + 1;
        this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
    }

    update() {
        // Spring to Origin (Return to place)
        const dxHome = this.originX - this.x;
        const dyHome = this.originY - this.y;

        this.vx += dxHome * config.springForce;
        this.vy += dyHome * config.springForce;

        // Mouse Interaction (Repulsion)
        if (mouse.active) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.mouseDistance) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (config.mouseDistance - distance) / config.mouseDistance;

                // Gentle push away
                this.vx -= forceDirectionX * force * 2.0;
                this.vy -= forceDirectionY * force * 2.0;
            }
        }

        // Organic Drift (Slight random movement around home)
        // Only drift if not being pushed hard
        if (Math.abs(this.vx) < 0.5 && Math.abs(this.vy) < 0.5) {
            this.x += (Math.random() - 0.5) * 0.5;
            this.y += (Math.random() - 0.5) * 0.5;
        }

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Friction (Damping)
        this.vx *= config.friction;
        this.vy *= config.friction;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 300;
        this.speed = 5;
        this.opacity = 1;
        this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
    }

    update() {
        this.radius += this.speed;
        this.opacity -= 0.02;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color.replace(')', `, ${this.opacity})`).replace('rgb', 'rgba').replace('#', '');
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

function init() {
    resize();
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
    }
}

function resize() {
    if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);

    /* Enable additive blending for "Glowing" effect */
    ctx.globalCompositeOperation = 'screen';

    // Update and Draw Particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Draw Connections
    connectParticles();

    // Update and Draw Ripples
    ripples.forEach((ripple, index) => {
        ripple.update();
        ripple.draw();
        if (ripple.opacity <= 0) {
            ripples.splice(index, 1);
        }
    });
}

function connectParticles() {
    let opacityValue = 1;
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            const dx = particles[a].x - particles[b].x;
            const dy = particles[a].y - particles[b].y;
            const distance = dx * dx + dy * dy;

            if (distance < (config.connectionDistance * config.connectionDistance)) {
                opacityValue = 1 - (distance / (config.connectionDistance * config.connectionDistance));
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.5})`; /* Visbile connections */
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

// Event Listeners
window.addEventListener('resize', () => {
    resize();
    init(); // Revert to grid/new randoms on resize
});

window.addEventListener('mousemove', (e) => {
    // Need to map mouse coordinates relative to canvas if canvas is not full screen?
    // Since canvas is in Hero, and Hero is top, e.x/e.y generally work, but let's be safe.
    // Actually, e.x/e.y are client coordinates. 
    // If hero is at top (scrolled 0), it works.
    // If scrolled, we might want to offset.
    // But this effect is only for Hero which is at top. 
    // Assuming simple case for now.
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
});

window.addEventListener('mouseleave', () => {
    mouse.active = false;
});

window.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripples.push(new Ripple(x, y));

    // Blast particles
    particles.forEach(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
            const force = (200 - dist) / 200;
            p.vx += (dx / dist) * force * 15;
            p.vy += (dy / dist) * force * 15;
        }
    });
});

init();
animate();

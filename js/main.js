// ===== Three.js 3D Particle System =====
let scene, camera, renderer;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

init3D();
animate3D();
initMobileMenu();
initScrollAnimations();

function init3D() {
    const canvas = document.getElementById('canvas3d');
    
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0B0B0F, 0.0007);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1000;
    
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Create particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;
        vertices.push(x, y, z);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    // Orange/Amber themed particles
    const colors = [
        new THREE.Color(0xFF6A00), // Orange
        new THREE.Color(0xFFA500), // Amber
        new THREE.Color(0xFF8C00), // Dark Orange
        new THREE.Color(0xFFB347), // Light Orange
    ];
    
    window.particleSystems = [];
    
    colors.forEach((color, i) => {
        const material = new THREE.PointsMaterial({
            size: 1.5,
            color,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.rotation.x = Math.random() * Math.PI * 2;
        particles.rotation.y = Math.random() * Math.PI * 2;
        scene.add(particles);
        window.particleSystems.push(particles);
    });
    
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.2;
    mouseY = (event.clientY - windowHalfY) * 0.2;
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate3D() {
    requestAnimationFrame(animate3D);
    
    if (window.particleSystems) {
        window.particleSystems.forEach((system, i) => {
            system.rotation.x += 0.00015 * (i + 1);
            system.rotation.y += 0.0001 * (i + 1);
            
            // Smooth mouse follow
            system.rotation.x += 0.00002 * (mouseY - system.rotation.x * 30);
            system.rotation.y += 0.00002 * (mouseX - system.rotation.y * 30);
        });
    }
    
    renderer.render(scene, camera);
}

// ===== Mobile Menu =====
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }
}

// ===== Scroll Animations =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    document.querySelectorAll('.skill-card, .interest-card, .project-card, .timeline-item, .edu-card, .language-item').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.5s ease ${i * 0.03}s, transform 0.5s ease ${i * 0.03}s`;
        observer.observe(el);
    });
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

// ===== Navbar Effect =====
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        navbar.style.background = 'rgba(11, 11, 15, 0.95)';
        navbar.style.boxShadow = '0 4px 30px rgba(255, 106, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(11, 11, 15, 0.6)';
        navbar.style.boxShadow = 'none';
    }
});

// ===== Fade-in Style =====
const style = document.createElement('style');
style.textContent = `.fade-in { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// ===== Hero Parallax =====
const heroContent = document.querySelector('.hero-content');
if (heroContent) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.25}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });
}

console.log('Portfolio loaded successfully! 🚀');

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Mouse Position Tracking (for WebGL Parallax) ---
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // --- 2. Magnetic Buttons ---
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const position = btn.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
        });
        btn.addEventListener('mouseout', function() {
            btn.style.transform = `translate(0px, 0px)`;
        });
    });

    // --- 2.5 Menu Toggle Logic ---
    const menuBtn = document.querySelector('.nav-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    const menuCloseBtn = document.querySelector('.menu-close');
    const menuLinks = document.querySelectorAll('.menu-link');

    if (menuBtn && menuOverlay && menuCloseBtn) {
        menuBtn.addEventListener('click', () => {
            menuOverlay.classList.add('active');
        });

        menuCloseBtn.addEventListener('click', () => {
            menuOverlay.classList.remove('active');
        });

        // Close menu when a link is clicked
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                menuOverlay.classList.remove('active');
            });
        });
    }

    // --- 3. Three.js Background Mesh (Big Space Theme) ---
    const initBackgroundWebGL = () => {
        const container = document.getElementById('webgl-container');
        if (!container || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        // Add subtle fog to blend stars in the distance
        scene.fog = new THREE.FogExp2(0x050505, 0.001);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Create Star Particles
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        const posArray = new Float32Array(starCount * 3);
        const colorArray = new Float32Array(starCount * 3);

        for(let i = 0; i < starCount * 3; i+=3) {
            // Distribute stars spherically
            const r = 800 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            
            posArray[i] = r * Math.sin(phi) * Math.cos(theta);
            posArray[i+1] = r * Math.sin(phi) * Math.sin(theta);
            posArray[i+2] = r * Math.cos(phi);

            // Give stars different colors (mostly white/grey, very rare cyan/purple)
            const mix = Math.random();
            if (mix > 0.95) {
                // Rare Cyan stars
                colorArray[i] = 0.5; colorArray[i+1] = 0.94; colorArray[i+2] = 1.0;
            } else if (mix > 0.90) {
                // Rare Purple stars
                colorArray[i] = 0.6; colorArray[i+1] = 0.4; colorArray[i+2] = 1.0;
            } else {
                // White/Grey stars (subtle)
                const shade = 0.3 + Math.random() * 0.4;
                colorArray[i] = shade; colorArray[i+1] = shade; colorArray[i+2] = shade;
            }
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

        const starMaterial = new THREE.PointsMaterial({
            size: 0.7,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const starMesh = new THREE.Points(starGeometry, starMaterial);
        scene.add(starMesh);

        camera.position.z = 0;

        // Animation
        const clock = new THREE.Clock();

        const animate = () => {
            requestAnimationFrame(animate);
            const time = clock.getElapsedTime();
            
            // Slowly rotate the entire galaxy
            starMesh.rotation.y = time * 0.005;
            starMesh.rotation.x = time * 0.002;
            
            // Subtle camera parallax based on mouse
            camera.position.x += ((mouseX / window.innerWidth - 0.5) * 20 - camera.position.x) * 0.02;
            camera.position.y += (-(mouseY / window.innerHeight - 0.5) * 20 - camera.position.y) * 0.02;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };
    initBackgroundWebGL();

    // --- 4. WebGL Profile Image Displacement Shader ---
    const initProfileWebGL = () => {
        const targetContainer = document.getElementById('profile-webgl-target');
        const imgSource = document.getElementById('profile-source');
        if (!targetContainer || !imgSource || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        // Calculate aspect ratio of container
        const rect = targetContainer.getBoundingClientRect();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(rect.width, rect.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        targetContainer.appendChild(renderer.domElement);

        // Wait for image to load to create texture
        if (imgSource.complete) {
            setupShader();
        } else {
            imgSource.onload = setupShader;
        }

        let material, plane;

        function setupShader() {
            const texture = new THREE.TextureLoader().load(imgSource.src);
            
            // Simple Noise implementation for shader
            const vertexShader = `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `;

            const fragmentShader = `
                uniform sampler2D uTexture;
                uniform float uTime;
                uniform vec2 uMouse;
                varying vec2 vUv;

                void main() {
                    vec2 uv = vUv;
                    
                    // Distance from mouse
                    float dist = distance(uv, uMouse);
                    
                    // Displacement effect
                    float displacement = exp(-dist * 10.0) * 0.05 * sin(uTime * 5.0 + dist * 20.0);
                    
                    uv.x += displacement;
                    uv.y += displacement;

                    // RGB Shift
                    float r = texture2D(uTexture, uv + vec2(displacement * 0.5, 0.0)).r;
                    float g = texture2D(uTexture, uv).g;
                    float b = texture2D(uTexture, uv - vec2(displacement * 0.5, 0.0)).b;
                    
                    // Desaturate slightly for aesthetic
                    vec3 color = vec3(r, g, b);
                    float gray = dot(color, vec3(0.299, 0.587, 0.114));
                    color = mix(color, vec3(gray), 0.5);

                    gl_FragColor = vec4(color, 1.0);
                }
            `;

            material = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                uniforms: {
                    uTime: { value: 0 },
                    uTexture: { value: texture },
                    uMouse: { value: new THREE.Vector2(0.5, 0.5) }
                }
            });

            const geometry = new THREE.PlaneGeometry(2, 2);
            plane = new THREE.Mesh(geometry, material);
            scene.add(plane);

            // Local mouse tracking for the image
            targetContainer.addEventListener('mousemove', (e) => {
                const bRect = targetContainer.getBoundingClientRect();
                const x = (e.clientX - bRect.left) / bRect.width;
                const y = 1.0 - ((e.clientY - bRect.top) / bRect.height);
                gsap.to(material.uniforms.uMouse.value, { x: x, y: y, duration: 0.5 });
            });
            targetContainer.addEventListener('mouseleave', () => {
                gsap.to(material.uniforms.uMouse.value, { x: 0.5, y: 0.5, duration: 1 });
            });

            const clock = new THREE.Clock();
            const animateProfile = () => {
                requestAnimationFrame(animateProfile);
                material.uniforms.uTime.value = clock.getElapsedTime();
                renderer.render(scene, camera);
            };
            animateProfile();
        }

        window.addEventListener('resize', () => {
            const newRect = targetContainer.getBoundingClientRect();
            renderer.setSize(newRect.width, newRect.height);
        });
    };
    
    // --- 5. GSAP Animations ---
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Loading Screen
        const tlLoader = gsap.timeline();
        tlLoader.to('.loader-progress', { opacity: 0, duration: 0.5, delay: 2 })
                .to('.loader-text', { y: -20, opacity: 0, duration: 0.5 }, "-=0.3")
                .to('.loader', { yPercent: -100, duration: 1, ease: "power4.inOut" })
                .from('.nav', { y: -50, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.5")
                .from('.title-1', { y: 100, opacity: 0, duration: 1, ease: "power4.out" }, "-=0.8")
                .from('.title-2', { y: 100, opacity: 0, duration: 1, ease: "power4.out" }, "-=0.7")
                .from('.hero-bottom', { y: 50, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.5")
                .call(() => {
                    initProfileWebGL(); // Init after load to ensure layout is settled
                });

        // Split text for About section manually
        const textToSplit = document.querySelector('.split-text');
        if (textToSplit) {
            const text = textToSplit.innerText;
            textToSplit.innerHTML = text.split(' ').map(word => `<span style="display:inline-block; overflow:hidden;"><span class="word-inner" style="display:inline-block;">${word}</span></span>`).join(' ');
            
            gsap.from('.word-inner', {
                scrollTrigger: {
                    trigger: '.about',
                    start: 'top 60%',
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.02,
                ease: 'power3.out'
            });
        }

        // Project Text Reveals
        const projects = document.querySelectorAll('.project-row');
        projects.forEach(project => {
            const info = project.querySelector('.project-info');
            if (info) {
                gsap.from(info, {
                    scrollTrigger: {
                        trigger: project,
                        start: 'top 70%'
                    },
                    x: -50, opacity: 0, duration: 1, ease: "power3.out"
                });
            }
        });

        // Image Reveals & Parallax (works for both Projects and Concept Visuals)
        const imageWraps = document.querySelectorAll('.project-image-wrap');
        imageWraps.forEach(wrap => {
            const reveal = wrap.querySelector('.image-reveal');
            const img = wrap.querySelector('.parallax-img');
            
            if (reveal && img) {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: wrap,
                        start: 'top 80%'
                    }
                });

                tl.to(reveal, { scaleY: 0, duration: 1, ease: "power4.inOut" })
                  .from(img, { scale: 1.2, duration: 1.5, ease: "power3.out" }, "-=1");
                  
                // Parallax effect
                gsap.to(img, {
                    yPercent: 15,
                    ease: "none",
                    scrollTrigger: {
                        trigger: wrap,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });
            }
        });
    }

});

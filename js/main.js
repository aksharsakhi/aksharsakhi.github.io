/**
 * Akshar Sakhi Portfolio — Interactive Behaviors
 * Inspired by TD_Alexfolio Design System
 * 100% Client-side, Static, GitHub Pages compatible
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Dynamic Scroll Text Reveal (Framer Color Scrub Effect) ---
    const initScrollTextReveal = () => {
        const textElements = document.querySelectorAll(".scroll-reveal-text");
        if (!textElements.length) return;

        const allWords = [];

        textElements.forEach(container => {
            const childNodes = Array.from(container.childNodes);
            const fragment = document.createDocumentFragment();

            childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const words = text.split(/(\s+)/);
                    words.forEach(token => {
                        if (!token) return;
                        if (/^\s+$/.test(token)) {
                            fragment.appendChild(document.createTextNode(token));
                        } else {
                            const span = document.createElement("span");
                            span.className = "reveal-word";
                            span.textContent = token;
                            span.dataset.highlight = "false";
                            fragment.appendChild(span);
                            allWords.push(span);
                        }
                    });
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const isHighlight = node.classList.contains("highlight");
                    const words = node.textContent.split(/(\s+)/);
                    words.forEach(token => {
                        if (!token) return;
                        if (/^\s+$/.test(token)) {
                            fragment.appendChild(document.createTextNode(token));
                        } else {
                            const span = document.createElement("span");
                            span.className = "reveal-word";
                            span.textContent = token;
                            span.dataset.highlight = isHighlight ? "true" : "false";
                            fragment.appendChild(span);
                            allWords.push(span);
                        }
                    });
                }
            });

            container.innerHTML = "";
            container.appendChild(fragment);
        });

        // Continuous scrub calculation on scroll / resize
        let ticking = false;

        const updateWordColors = () => {
            const vh = window.innerHeight;
            // Scrub range: begins illuminating at 85% of screen height, completes at 32%
            const triggerTop = vh * 0.88;
            const triggerBottom = vh * 0.32;
            const range = triggerTop - triggerBottom;

            allWords.forEach(word => {
                const rect = word.getBoundingClientRect();
                
                // Calculate progress from 0 (unlit) to 1 (fully illuminated)
                let p = (triggerTop - rect.top) / range;
                if (p < 0) p = 0;
                if (p > 1) p = 1;

                const isHighlight = word.dataset.highlight === "true";

                if (isHighlight) {
                    // High-contrast emphasis on highlight terms
                    const alpha = 0.35 + (0.65 * p);
                    word.style.color = `rgba(18, 18, 20, ${alpha.toFixed(3)})`;
                    word.style.textShadow = "none";
                } else {
                    // Obsidian black interpolation from muted concrete gray to deep black
                    const alpha = 0.24 + (0.74 * p);
                    word.style.color = `rgba(18, 18, 20, ${alpha.toFixed(3)})`;
                    word.style.textShadow = "none";
                }
            });

            ticking = false;
        };

        window.addEventListener("scroll", () => {
            if (!ticking) {
                window.requestAnimationFrame(updateWordColors);
                ticking = true;
            }
        }, { passive: true });

        window.addEventListener("resize", () => {
            if (!ticking) {
                window.requestAnimationFrame(updateWordColors);
                ticking = true;
            }
        }, { passive: true });

        // Initial pass
        updateWordColors();
    };

    initScrollTextReveal();

    // --- 2. Sticky Navigation & Scroll Header ---
    const siteHeader = document.querySelector(".site-header");
    const backToTopBtn = document.querySelector(".back-to-top-btn");

    window.addEventListener("scroll", () => {
        const scrollPos = window.scrollY;
        
        if (siteHeader) {
            if (scrollPos > 40) {
                siteHeader.classList.add("scrolled");
            } else {
                siteHeader.classList.remove("scrolled");
            }
        }

        if (backToTopBtn) {
            if (scrollPos > 500) {
                backToTopBtn.classList.add("visible");
            } else {
                backToTopBtn.classList.remove("visible");
            }
        }
    }, { passive: true });

    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // --- 3. Mobile Drawer Navigation ---
    const mobileToggle = document.querySelector(".mobile-toggle");
    const mobileDrawer = document.querySelector(".mobile-drawer");
    const drawerBackdrop = document.querySelector(".drawer-backdrop");
    const drawerClose = document.querySelector(".drawer-close");
    const drawerLinks = document.querySelectorAll(".drawer-links a");

    const openDrawer = () => {
        if (mobileDrawer) mobileDrawer.classList.add("open");
        if (drawerBackdrop) drawerBackdrop.classList.add("open");
        document.body.style.overflow = "hidden";
    };

    const closeDrawer = () => {
        if (mobileDrawer) mobileDrawer.classList.remove("open");
        if (drawerBackdrop) drawerBackdrop.classList.remove("open");
        document.body.style.overflow = "";
    };

    if (mobileToggle) mobileToggle.addEventListener("click", openDrawer);
    if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);
    
    drawerLinks.forEach(link => {
        link.addEventListener("click", closeDrawer);
    });

    // --- 4. Active Nav Link Intersection Observer ---
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section[id], footer[id]");

    if ("IntersectionObserver" in window && sections.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: "-25% 0px -55% 0px",
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute("id");
                    navLinks.forEach(link => {
                        const href = link.getAttribute("href");
                        if (href === `#${currentId}`) {
                            link.classList.add("active");
                        } else {
                            link.classList.remove("active");
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => sectionObserver.observe(section));
    }


    // --- 6. Project Detail Interactive Modal ---
    const projectDetails = {
        "nutriscan": {
            title: "NutriScan — AI Nutrition & Fitness Platform",
            meta: "2025 • Python • Open Food Facts API • HTML/CSS/JS",
            content: `
                <h4>The Challenge</h4>
                <p>Navigating nutritional labels and assessing ultra-processed food components is tedious and opaque for consumers trying to adhere to personalized diet and medical restrictions.</p>
                <h4>The Solution</h4>
                <p>NutriScan integrates directly with the global Open Food Facts API to instantly extract macro & micronutrients, additives, and allergen markers. Developed algorithmic rule matching to recommend healthy substitutions tailored to individual dietary goals.</p>
                <h4>Key Highlights</h4>
                <ul>
                    <li>• Real-time ingredient parsing and health scoring</li>
                    <li>• Personalized food substitution recommendations</li>
                    <li>• Responsive, modern UI engineered for seamless mobile and desktop analysis</li>
                </ul>
            `,
            github: "https://github.com/aksharsakhi"
        },
        "v2x": {
            title: "Edge-Based V2X Emergency Response Protocol",
            meta: "2025 • Edge Computing • Smart Mobility • Python • IoT Architecture",
            content: `
                <h4>The Challenge</h4>
                <p>Emergency response vehicles frequently lose critical minutes trapped in urban traffic bottlenecks due to laggy, centralized cloud traffic management systems.</p>
                <h4>The Solution</h4>
                <p>Architected a decentralized edge-computing protocol where emergency vehicles communicate directly with local roadside units (RSUs) to dynamically prioritize traffic lights and create automated "green corridors" in real-time.</p>
                <h4>Key Highlights</h4>
                <ul>
                    <li>• 25% reduction in simulated emergency transit latency</li>
                    <li>• Route trajectory prediction and signal preemption algorithms</li>
                    <li>• Resilient against cellular packet loss via local edge peer-to-peer failover</li>
                </ul>
            `,
            github: "https://github.com/aksharsakhi"
        },
        "tatamotors": {
            title: "Tata Motors ECM AI Assistants & Workflow Automation",
            meta: "2026 • Enterprise AI • Astra, Rudra & Sara • Internal Operations",
            content: `
                <h4>The Challenge</h4>
                <p>Engineering Change Management (ECM) involves complex documentation, multi-department approvals, and manual tracking that created operational lag across teams.</p>
                <h4>The Solution</h4>
                <p>Engineered three specialized internal AI assistants: <strong>Astra</strong>, <strong>Rudra</strong>, and <strong>Sara</strong> to automate information retrieval, support engineers with rapid change order analysis, and boost cross-team productivity.</p>
                <h4>Key Highlights</h4>
                <ul>
                    <li>• Built team performance monitoring platform with live KPI visibility</li>
                    <li>• Created automated work allocation and task prioritization dashboard</li>
                    <li>• Substantially reduced manual lookup overhead and administrative bottlenecks</li>
                </ul>
            `,
            github: "https://github.com/aksharsakhi"
        },
        "packtrack": {
            title: "PackTrack — Gamified Habit Tracker",
            meta: "2023 • JavaScript • Google Calendar API • Gamification Mechanics",
            content: `
                <h4>The Challenge</h4>
                <p>Most productivity tools feel sterile and chore-like, leading to high abandonment rates within the first 14 days of building new habits.</p>
                <h4>The Solution</h4>
                <p>Engineered a retro Pac-Man inspired gamified habit engine where daily routines feed game loops, unlock achievement badges, and dynamically sync with Google Calendar.</p>
                <h4>Key Highlights</h4>
                <ul>
                    <li>• Two-way synchronization with Google Calendar events</li>
                    <li>• Dynamic streak counters, XP leveling, and retro visual animations</li>
                    <li>• Persistent local & cloud session state management</li>
                </ul>
            `,
            github: "https://github.com/aksharsakhi"
        }
    };

    const modalBackdrop = document.querySelector(".project-modal-backdrop");
    const modalTitle = document.querySelector(".modal-title");
    const modalMeta = document.querySelector(".modal-meta");
    const modalBody = document.querySelector(".modal-body");
    const modalClose = document.querySelector(".modal-close-btn");
    const modalGithub = document.getElementById("modal-github-link");

    const openModal = (projectId) => {
        const data = projectDetails[projectId];
        if (!data || !modalBackdrop) return;

        if (modalTitle) modalTitle.textContent = data.title;
        if (modalMeta) modalMeta.textContent = data.meta;
        if (modalBody) modalBody.innerHTML = data.content;
        if (modalGithub) modalGithub.href = data.github;

        modalBackdrop.classList.add("open");
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        if (!modalBackdrop) return;
        modalBackdrop.classList.remove("open");
        document.body.style.overflow = "";
    };

    document.querySelectorAll("[data-project]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const projectId = btn.getAttribute("data-project");
            openModal(projectId);
        });
    });

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalBackdrop) {
        modalBackdrop.addEventListener("click", (e) => {
            if (e.target === modalBackdrop) closeModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal();
            closeDrawer();
        }
    });

    // --- 7. Magnetic Micro-Interaction on Pill Buttons ---
    const magneticButtons = document.querySelectorAll(".magnetic-pill");
    magneticButtons.forEach(btn => {
        btn.addEventListener("mousemove", (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.25}px)`;
        });
        btn.addEventListener("mouseleave", () => {
            btn.style.transform = `translate(0px, 0px)`;
        });
    });

});

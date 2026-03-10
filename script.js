/* ========================================
   FENGYOU.ORG — Main Script
   Particles · GSAP Animations · Navigation
   ======================================== */

;(function () {
    'use strict';

    // ─── Tagline Randomizer ─────────────────────────
    const taglines = [
        'Making electrons do useless things \u2014 some more useless than others.',
        'I build things that fly, things that think, and things nobody asked for.'
    ];

    const taglineEl = document.getElementById('tagline');
    if (taglineEl) {
        taglineEl.textContent = taglines[Math.floor(Math.random() * taglines.length)];
    }

    // ─── Particle System (Canvas) ───────────────────
    const canvas = document.getElementById('particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let mouse = { x: -9999, y: -9999 };
        let particles = [];
        let animationId;

        const CONFIG = {
            count: 60,
            maxDist: 140,
            speed: 0.35,
            radius: 1.5,
            mouseRadius: 150,
            mouseRepel: 0.6,
            lineOpacity: 0.12,
            colors: {
                emerald: 'rgba(16, 185, 129,',
                amber: 'rgba(232, 160, 52,'
            },
            amberChance: 0.12  // 12% of particles are amber
        };

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        function createParticle() {
            const isAmber = Math.random() < CONFIG.amberChance;
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * CONFIG.speed,
                vy: (Math.random() - 0.5) * CONFIG.speed,
                r: CONFIG.radius + Math.random() * 0.8,
                color: isAmber ? CONFIG.colors.amber : CONFIG.colors.emerald,
                alpha: 0.3 + Math.random() * 0.5
            };
        }

        function initParticles() {
            particles = [];
            // Scale count to screen area
            const area = width * height;
            const count = Math.min(CONFIG.count, Math.floor(area / 18000));
            for (let i = 0; i < count; i++) {
                particles.push(createParticle());
            }
        }

        function drawParticle(p) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.fill();
        }

        function drawLine(a, b, dist) {
            const opacity = (1 - dist / CONFIG.maxDist) * CONFIG.lineOpacity;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(16, 185, 129,' + opacity + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        function update() {
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Mouse repulsion
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONFIG.mouseRadius && dist > 0) {
                    const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
                    p.vx += (dx / dist) * force * CONFIG.mouseRepel;
                    p.vy += (dy / dist) * force * CONFIG.mouseRepel;
                }

                // Damping
                p.vx *= 0.98;
                p.vy *= 0.98;

                // Minimum velocity (keep them moving)
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed < CONFIG.speed * 0.3) {
                    p.vx += (Math.random() - 0.5) * 0.05;
                    p.vy += (Math.random() - 0.5) * 0.05;
                }

                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;
                if (p.y < -10) p.y = height + 10;
                if (p.y > height + 10) p.y = -10;
            }
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);

            // Draw connecting lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONFIG.maxDist) {
                        drawLine(particles[i], particles[j], dist);
                    }
                }
            }

            // Draw particles
            for (let i = 0; i < particles.length; i++) {
                drawParticle(particles[i]);
            }
        }

        function animate() {
            update();
            draw();
            animationId = requestAnimationFrame(animate);
        }

        // Throttled mouse tracking
        let mouseThrottle = false;
        document.addEventListener('mousemove', function (e) {
            if (mouseThrottle) return;
            mouseThrottle = true;
            requestAnimationFrame(function () {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
                mouseThrottle = false;
            });
        });

        // Reset mouse when it leaves the window
        document.addEventListener('mouseleave', function () {
            mouse.x = -9999;
            mouse.y = -9999;
        });

        // Handle resize
        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                resize();
                initParticles();
            }, 200);
        });

        // Check reduced motion preference
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!prefersReduced.matches) {
            resize();
            initParticles();
            animate();
        }

        // Listen for changes in motion preference
        prefersReduced.addEventListener('change', function (e) {
            if (e.matches) {
                cancelAnimationFrame(animationId);
            } else {
                resize();
                initParticles();
                animate();
            }
        });
    }

    // ─── Navigation ─────────────────────────────────
    const nav = document.getElementById('nav');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const sections = document.querySelectorAll('section[id]');

    // Scroll → solid nav background
    let lastScroll = 0;
    function handleNavScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // Active section highlighting
    function updateActiveNav() {
        const scrollY = window.scrollY + window.innerHeight * 0.35;

        let current = '';
        sections.forEach(function (section) {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            if (scrollY >= top && scrollY < bottom) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // Hamburger menu toggle
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function () {
            const isOpen = hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen);
            mobileMenu.setAttribute('aria-hidden', !isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close on link click
        mobileLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            });
        });

        // Close on escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        });
    }

    // Smooth scroll for nav links (fallback for browsers without scroll-behavior)
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ─── GSAP Animations ────────────────────────────
    function initAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        // Respect reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // Just make everything visible immediately
            gsap.set('.hero-label, .hero-name, .hero-tagline, .hero-cta', { opacity: 1 });
            gsap.set('.reveal, .reveal-left, .reveal-right', { opacity: 1, x: 0, y: 0 });
            return;
        }

        // ── Hero entrance (timeline) ──
        const heroTl = gsap.timeline({ delay: 0.3 });

        heroTl
            .to('.hero-label', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out'
            })
            .to('.hero-name', {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out'
            }, '-=0.5')
            .to('.hero-tagline', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.5')
            .to('.hero-cta', {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power3.out'
            }, '-=0.4');

        // ── Section headers ──
        document.querySelectorAll('.section-label, .section-title').forEach(function (el) {
            el.classList.add('reveal');
        });

        // ── Work section ──
        gsap.utils.toArray('.project-card').forEach(function (card, i) {
            card.classList.add('reveal');
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    once: true
                },
                opacity: 1,
                y: 0,
                duration: 0.7,
                delay: i * 0.1,
                ease: 'power2.out'
            });
        });

        // ── About section ──
        const aboutPhoto = document.querySelector('.about-photo-wrapper');
        const aboutContent = document.querySelector('.about-content');

        if (aboutPhoto) {
            aboutPhoto.classList.add('reveal-left');
            gsap.to(aboutPhoto, {
                scrollTrigger: {
                    trigger: aboutPhoto,
                    start: 'top 80%',
                    once: true
                },
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: 'power2.out'
            });
        }

        if (aboutContent) {
            aboutContent.classList.add('reveal-right');
            gsap.to(aboutContent, {
                scrollTrigger: {
                    trigger: aboutContent,
                    start: 'top 80%',
                    once: true
                },
                opacity: 1,
                x: 0,
                duration: 0.8,
                delay: 0.15,
                ease: 'power2.out'
            });
        }

        // ── Contact section ──
        const contactContent = document.querySelector('.contact-content');
        if (contactContent) {
            contactContent.classList.add('reveal');
            gsap.to(contactContent, {
                scrollTrigger: {
                    trigger: contactContent,
                    start: 'top 85%',
                    once: true
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out'
            });
        }

        // ── Generic reveal elements (section labels, titles) ──
        gsap.utils.toArray('.reveal').forEach(function (el) {
            // Skip if already animated by specific animation above
            if (el.classList.contains('project-card') ||
                el === contactContent) return;

            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true
                },
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power2.out'
            });
        });
    }

    // ─── Vanilla Tilt Init ──────────────────────────
    function initTilt() {
        if (typeof VanillaTilt === 'undefined') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Only init on desktop (tilt doesn't make sense on touch)
        if (window.innerWidth < 768) return;

        const cards = document.querySelectorAll('[data-tilt]');
        VanillaTilt.init(Array.from(cards), {
            max: 8,
            speed: 400,
            glare: true,
            'max-glare': 0.1,
            perspective: 1000,
            gyroscope: false
        });
    }

    // ─── Initialize Everything ──────────────────────
    // Wait for DOM + deferred scripts to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            // Small delay to ensure GSAP/VanillaTilt are loaded (defer scripts)
            requestAnimationFrame(function () {
                initAnimations();
                initTilt();
            });
        });
    } else {
        // DOM already ready, but check if GSAP loaded
        // Give defer scripts a moment
        setTimeout(function () {
            initAnimations();
            initTilt();
        }, 100);
    }

    // Re-init tilt on resize (desktop ↔ mobile)
    let tiltResizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(tiltResizeTimer);
        tiltResizeTimer = setTimeout(function () {
            // Destroy existing tilt instances
            document.querySelectorAll('[data-tilt]').forEach(function (el) {
                if (el.vanillaTilt) {
                    el.vanillaTilt.destroy();
                }
            });
            initTilt();
        }, 300);
    });

})();

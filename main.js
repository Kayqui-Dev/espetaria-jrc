// Register GSAP ScrollTrigger Plugin
gsap.registerPlugin(ScrollTrigger);

// Configuration
const frameCount = 122;
// Returns the file path for a frame index (1-padded up to 122)
const currentFrame = index => `frames/frame_${index.toString().padStart(4, '0')}.png`;

const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');
const images = [];

// Object that GSAP will tween to scroll through frames
const scrollObj = { frame: 1 };
// Preload all PNG frames in background
function preloadImages() {
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        if (i === 1) {
            img.onload = () => {
                renderFrame(1);
            };
        }
        images.push(img);
    }
}

// Initialise Application
function initApp() {
    // Setup Canvas and initial frame render
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Pin the Hero section (#inicio) and control video frames during the pin
    ScrollTrigger.create({
        trigger: "#inicio",
        start: "top top",
        end: "+=300%", // 3 viewports of scroll height
        pin: true,
        scrub: true,
        onUpdate: (self) => {
            // self.progress goes from 0 to 1
            const frameIndex = Math.max(1, Math.min(frameCount, Math.ceil(self.progress * frameCount)));
            scrollObj.frame = frameIndex;
            renderFrame(frameIndex);
            
            // Premium fade out and translate effect for Hero content as video progresses
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                if (self.progress > 0.6) {
                    const progress = (self.progress - 0.6) / 0.35; // ranges from 0 to 1
                    heroContent.style.opacity = Math.max(0, 1 - progress);
                    heroContent.style.transform = `translateY(${-40 * progress}px)`;
                    heroContent.style.pointerEvents = "none";
                } else {
                    heroContent.style.opacity = 1;
                    heroContent.style.transform = "none";
                    heroContent.style.pointerEvents = "all";
                }
            }

            // Quick fade out for the scroll indicator icon at the start of scrolling
            const scrollIndicator = document.querySelector('.scroll-indicator');
            if (scrollIndicator) {
                if (self.progress > 0.05) {
                    const progress = (self.progress - 0.05) / 0.25; // fade out between 5% and 30% progress
                    scrollIndicator.style.opacity = Math.max(0, 1 - progress);
                    scrollIndicator.style.pointerEvents = "none";
                } else {
                    scrollIndicator.style.opacity = 0.8;
                    scrollIndicator.style.pointerEvents = "all";
                }
            }
        }
    });
    
    // Create background embers
    createEmbers();

    // Animate Hero text elements on entrance
    animateHeroEntrance();
    
    // Initialize 3D Book Page Flip Menu
    initMenuBook();
    
    // Initialize floating pill navbar scroll listener
    initNavbarScroll();
    
    // Initialize right side progress map guide
    initMapGuide();
    
    // Initialize reveal animations for sections
    initRevealAnimations();
}

// Resize Canvas maintaining cover scale
function resizeCanvas() {
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    renderFrame(Math.floor(scrollObj.frame));
}

// Render a specific frame on canvas with "background-size: cover" math
function renderFrame(frameIndex) {
    const img = images[frameIndex - 1];
    if (!img || !context) return;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    const imgWidth = img.naturalWidth || 960;
    const imgHeight = img.naturalHeight || 540;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (canvasRatio > imgRatio) {
        // Canvas is wider than image aspect ratio
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
    } else {
        // Canvas is taller than image aspect ratio
        drawWidth = canvasHeight * imgRatio;
        drawHeight = canvasHeight;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
    }
    
    context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Hero Entrance Animations
function animateHeroEntrance() {
    const tl = gsap.timeline();
    
    // Clear initial styles to avoid jumpiness
    gsap.set(".reveal-line", { y: "100%", opacity: 0 });
    gsap.set(".hero-subtitle", { opacity: 0, y: 30 });
    gsap.set(".hero-actions", { opacity: 0, y: 20 });
    gsap.set(".hero-tag", { opacity: 0, scale: 0.8 });
    
    tl.to(".reveal-line", {
        y: "0%",
        opacity: 1,
        duration: 1.4,
        ease: "power4.out",
        stagger: 0.15
    })
    .to(".hero-tag", {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "back.out(1.7)"
    }, "-=1.0")
    .to(".hero-subtitle", {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out"
    }, "-=0.8")
    .to(".hero-actions", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=0.8");
}

// Bento Grid Mouse Tracker glow position helper
function initBentoGlow() {
    const cards = document.querySelectorAll('.bento-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // cursor x inside card
            const y = e.clientY - rect.top;  // cursor y inside card
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// Dynamic Scroll Reveal animations for Content Sections
function initRevealAnimations() {
    // Reveal Book wrapper on scroll
    gsap.from(".book-wrapper", {
        scrollTrigger: {
            trigger: ".cardapio-section",
            start: "top 70%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: "power3.out"
    });
    
    // Reveal Event cards
    gsap.from(".evento-card", {
        scrollTrigger: {
            trigger: ".eventos-section",
            start: "top 70%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 60,
        duration: 1.2,
        stagger: 0.25,
        ease: "power3.out"
    });
    
    // Reveal Footer elements
    gsap.from(".footer-cta-block", {
        scrollTrigger: {
            trigger: ".main-footer",
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        scale: 0.95,
        y: 40,
        duration: 1.2,
        ease: "power3.out"
    });
    
    gsap.from(".footer-info-col", {
        scrollTrigger: {
            trigger: ".footer-info-grid",
            start: "top 85%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    });
}

// Floating Pill Navbar scroll handler
function initNavbarScroll() {
    const header = document.querySelector('.main-header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Side Map Guide progress line and active section tracking for nav & dots
function initMapGuide() {
    const fillEl = document.querySelector('.map-progress-fill');
    
    // Continuous progress line height fill bound to page scroll
    gsap.to(fillEl, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: true
        }
    });
    
    const sections = ['inicio', 'cardapio', 'eventos', 'reviews'];
    
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        
        ScrollTrigger.create({
            trigger: el,
            start: id === 'inicio' ? "top top" : "top 50%",
            end: id === 'inicio' ? "+=300%" : "bottom 50%",
            onToggle: (self) => {
                if (self.isActive) {
                    updateActiveSection(id);
                }
            },
            onEnter: () => updateActiveSection(id),
            onEnterBack: () => updateActiveSection(id)
        });
    });
}

function updateActiveSection(id) {
    // Update map dots
    const dots = document.querySelectorAll('.map-dot-wrapper');
    dots.forEach(dot => {
        if (dot.getAttribute('data-section') === id) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    // Update navbar links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${id}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 3D Menu Book Page Flip Logic
function initMenuBook() {
    const pages = document.querySelectorAll('.book-page');
    const prevBtn = document.getElementById('book-prev-btn');
    const nextBtn = document.getElementById('book-next-btn');
    
    let currentPage = 1;
    const totalPages = pages.length;
    
    function flipPage(pageIndex, direction) {
        const page = pages[pageIndex - 1];
        if (!page) return;
        
        if (direction === 'next') {
            page.classList.add('flipped');
            page.classList.remove('active');
            
            // Adjust z-index after flip completes
            setTimeout(() => {
                page.style.zIndex = pageIndex;
            }, 300);
            
            // Activate next sheet
            const nextSheet = pages[pageIndex];
            if (nextSheet) {
                nextSheet.classList.add('active');
                nextSheet.style.zIndex = 10;
            }
        } else if (direction === 'prev') {
            page.classList.remove('flipped');
            page.classList.add('active');
            page.style.zIndex = 10;
            
            // Deactivate next sheet
            const nextSheet = pages[pageIndex];
            if (nextSheet) {
                nextSheet.classList.remove('active');
                nextSheet.style.zIndex = 5;
            }
        }
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage <= totalPages) {
                flipPage(currentPage, 'next');
                currentPage++;
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                flipPage(currentPage, 'prev');
            }
        });
    }
    
    // Allow clicking the pages directly to flip them
    pages.forEach((page, index) => {
        page.addEventListener('click', (e) => {
            if (e.target.closest('a') || e.target.closest('button')) return;
            
            const pageNum = index + 1;
            if (page.classList.contains('flipped')) {
                if (pageNum === currentPage - 1) {
                    currentPage--;
                    flipPage(currentPage, 'prev');
                }
            } else {
                if (pageNum === currentPage) {
                    flipPage(currentPage, 'next');
                    currentPage++;
                }
            }
        });
    });
}

// Generate glowing ember particles rising from bottom
function createEmbers() {
    const container = document.getElementById('embers-container');
    if (!container) return;
    
    const count = 35; // Maximum number of embers on screen
    for (let i = 0; i < count; i++) {
        const ember = document.createElement('div');
        ember.classList.add('ember');
        
        // Random dimensions
        const size = Math.random() * 5 + 2; // 2px to 7px
        ember.style.width = `${size}px`;
        ember.style.height = `${size}px`;
        
        // Random positioning
        ember.style.left = `${Math.random() * 100}%`;
        
        // Random animations delay, duration, opacity and horizontal drift
        const duration = Math.random() * 6 + 6; // 6s to 12s
        const delay = Math.random() * 10; // 0s to 10s
        const opacity = Math.random() * 0.6 + 0.2; // 0.2 to 0.8
        const drift = Math.random() * 150 - 75; // -75px to 75px
        
        ember.style.setProperty('--duration', `${duration}s`);
        ember.style.setProperty('--delay', `${delay}s`);
        ember.style.setProperty('--opacity', opacity);
        ember.style.setProperty('--drift', `${drift}px`);
        
        container.appendChild(ember);
    }
}

// Start application immediately
initApp();
preloadImages();

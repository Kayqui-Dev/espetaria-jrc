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
    resizeBook();
    window.addEventListener('resize', resizeBook);
    
    // Initialize floating pill navbar scroll listener
    initNavbarScroll();
    
    // Initialize right side progress map guide
    initMapGuide();
    
    // Initialize reveal animations for sections
    initRevealAnimations();

    // Initialize clean URL smooth scrolling (removes # from URLs)
    initSmoothScroll();
}

// Resize Canvas maintaining cover scale
function resizeCanvas() {
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    renderFrame(Math.floor(scrollObj.frame));
}

// Resize and scale 3D book to fit viewport on tablet/mobile
function resizeBook() {
    const book = document.getElementById('menu-book');
    const wrapper = document.querySelector('.book-wrapper');
    const controls = document.querySelector('.book-controls');
    if (!book || !wrapper) return;

    const bookWidth = 900;
    const bookHeight = 580;

    let scale = 1;
    if (window.innerWidth < 950) {
        scale = (window.innerWidth * 0.92) / bookWidth;
    }

    // Transform and center the book absolutely
    book.style.transform = `translate(-50%, 0) scale(${scale})`;
    book.style.transformOrigin = 'center top';
    book.style.position = 'absolute';
    book.style.top = '0';
    book.style.left = '50%';

    // Position controls at bottom of the wrapper
    if (controls) {
        controls.style.position = 'absolute';
        controls.style.bottom = '0';
        controls.style.left = '50%';
        controls.style.transform = 'translateX(-50%)';
        controls.style.margin = '0';
        if (window.innerWidth < 768) {
            controls.style.display = 'flex';
        } else {
            controls.style.display = '';
        }
    }

    const controlsHeight = (controls && window.getComputedStyle(controls).display !== 'none') ? 60 : 0;
    const wrapperHeight = (bookHeight * scale) + controlsHeight + 20;
    wrapper.style.height = `${wrapperHeight}px`;
    
    // Refresh ScrollTrigger since layout sizes changed
    ScrollTrigger.refresh();
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
    
    if (window.innerWidth < 768) {
        // Mobile custom: scale the image to fit the width of the screen, and make it slightly larger (scale 1.6)
        // so it fills the screen horizontally, but doesn't crop the top/bottom too much, and center it vertically
        drawWidth = canvasWidth * 1.6;
        drawHeight = drawWidth / imgRatio;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = (canvasHeight - drawHeight) / 2 - 10;
    } else if (canvasRatio > imgRatio) {
        // Canvas is wider than image aspect ratio (Desktop landscape cover)
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
    
    // Reveal Event cards (rendered statically to prevent CSS transition and trigger conflicts)
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

// 3D Menu Book Draggable Page Flip Logic with Soft Bending Pages
function initMenuBook() {
    const book = document.getElementById('menu-book');
    if (!book) return;
    
    const pages = document.querySelectorAll('.book-page');
    const prevBtn = document.getElementById('book-prev-btn');
    const nextBtn = document.getElementById('book-next-btn');
    
    let currentPage = 1;
    const totalPages = pages.length;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let progress = 0;
    let activePageEl = null;
    let isFlippingNext = true;
    
    function flipPage(pageIndex, direction) {
        const page = pages[pageIndex - 1];
        if (!page) return;
        
        if (direction === 'next') {
            gsap.to(page, {
                rotateY: -180,
                duration: 0.8,
                ease: "power2.out",
                onStart: () => {
                    page.classList.add('flipped');
                    page.classList.remove('active');
                },
                onComplete: () => {
                    page.style.zIndex = pageIndex;
                    const nextSheet = pages[pageIndex];
                    if (nextSheet) {
                        nextSheet.classList.add('active');
                        nextSheet.style.zIndex = 10;
                    }
                    // Reset page faces transforms
                    const faces = page.querySelectorAll('.page-face');
                    faces.forEach(face => face.style.transform = '');
                }
            });
            // Apply soft page bend during animation
            gsap.to(page.querySelectorAll('.page-face'), {
                skewY: (i, el) => el.classList.contains('front') ? -5 : 5,
                scaleX: 0.95,
                duration: 0.4,
                yoyo: true,
                repeat: 1,
                ease: "sine.inOut"
            });
        } else if (direction === 'prev') {
            gsap.to(page, {
                rotateY: 0,
                duration: 0.8,
                ease: "power2.out",
                onStart: () => {
                    page.classList.remove('flipped');
                    page.classList.add('active');
                    page.style.zIndex = 10;
                    const nextSheet = pages[pageIndex];
                    if (nextSheet) {
                        nextSheet.classList.remove('active');
                        nextSheet.style.zIndex = 5;
                    }
                },
                onComplete: () => {
                    // Reset page faces transforms
                    const faces = page.querySelectorAll('.page-face');
                    faces.forEach(face => face.style.transform = '');
                }
            });
            // Apply soft page bend during animation
            gsap.to(page.querySelectorAll('.page-face'), {
                skewY: (i, el) => el.classList.contains('back') ? 5 : -5,
                scaleX: 0.95,
                duration: 0.4,
                yoyo: true,
                repeat: 1,
                ease: "sine.inOut"
            });
        }
    }
    
    // Drag/Swipe tracking
    book.addEventListener('pointerdown', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        book.style.cursor = 'grabbing';
        
        // Decide if we drag next page or prev page based on clientX position
        const rect = book.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        
        if (relativeX > rect.width / 2) {
            // Drag next page (current active page)
            if (currentPage <= totalPages) {
                isFlippingNext = true;
                activePageEl = pages[currentPage - 1];
            } else {
                activePageEl = null;
            }
        } else {
            // Drag prev page (the one that is flipped)
            if (currentPage > 1) {
                isFlippingNext = false;
                activePageEl = pages[currentPage - 2];
            } else {
                activePageEl = null;
            }
        }
        
        if (activePageEl) {
            activePageEl.style.transition = 'none';
        }
    });
    
    window.addEventListener('pointermove', (e) => {
        if (!isDragging || !activePageEl) return;
        
        currentX = e.clientX;
        const deltaX = currentX - startX;
        const bookWidth = book.getBoundingClientRect().width;
        
        if (isFlippingNext) {
            // Dragging right to left (deltaX is negative)
            progress = Math.max(0, Math.min(1, -deltaX / (bookWidth / 2)));
            const angle = -180 * progress;
            activePageEl.style.transform = `rotateY(${angle}deg)`;
            
            // Soft paper bending effect (skew and scale based on progress)
            const bend = Math.sin(progress * Math.PI) * 12; // bend peaks in the middle
            const scale = 1 - Math.sin(progress * Math.PI) * 0.08;
            
            const frontFace = activePageEl.querySelector('.page-face.front');
            if (frontFace) {
                frontFace.style.transform = `skewY(${-bend}deg) scaleX(${scale})`;
            }
        } else {
            // Dragging left to right (deltaX is positive)
            progress = Math.max(0, Math.min(1, deltaX / (bookWidth / 2)));
            const angle = -180 + (180 * progress);
            activePageEl.style.transform = `rotateY(${angle}deg)`;
            
            // Soft paper bending effect
            const bend = Math.sin(progress * Math.PI) * 12;
            const scale = 1 - Math.sin(progress * Math.PI) * 0.08;
            
            const backFace = activePageEl.querySelector('.page-face.back');
            if (backFace) {
                backFace.style.transform = `skewY(${bend}deg) scaleX(${scale})`;
            }
        }
    });
    
    window.addEventListener('pointerup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        book.style.cursor = 'grab';
        
        if (!activePageEl) return;
        
        if (isFlippingNext) {
            if (progress > 0.4) {
                // Complete flip next
                flipPage(currentPage, 'next');
                currentPage++;
            } else {
                // Cancel flip next (snap back)
                gsap.to(activePageEl, {
                    rotateY: 0,
                    duration: 0.4,
                    ease: "power2.out",
                    onComplete: () => {
                        const frontFace = activePageEl.querySelector('.page-face.front');
                        if (frontFace) frontFace.style.transform = '';
                    }
                });
            }
        } else {
            if (progress > 0.4) {
                // Complete flip prev
                currentPage--;
                flipPage(currentPage, 'prev');
            } else {
                // Cancel flip prev (snap back to flipped)
                gsap.to(activePageEl, {
                    rotateY: -180,
                    duration: 0.4,
                    ease: "power2.out",
                    onComplete: () => {
                        const backFace = activePageEl.querySelector('.page-face.back');
                        if (backFace) backFace.style.transform = '';
                    }
                });
            }
        }
        progress = 0;
        activePageEl = null;
    });
    
    // Control buttons fallback
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
    
    // Allow clicking the pages directly to flip them (only for pointer clicks, not drag releases)
    pages.forEach((page, index) => {
        page.addEventListener('click', (e) => {
            if (e.target.closest('a') || e.target.closest('button')) return;
            
            // Prevent auto flip if we just completed a drag
            if (progress > 0.05) return;
            
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

// Clean URL Smooth Scrolling tracking (removes hashes # from URLs)
function initSmoothScroll() {
    const links = document.querySelectorAll('.nav-link, .map-dot-wrapper, .hero-actions a, .logo');
    
    links.forEach(link => {
        link.addEventListener('click', e => {
            let href = link.getAttribute('href');
            if (!href) {
                // Check if it's the logo SVG container
                const parent = link.closest('a');
                if (parent) href = parent.getAttribute('href');
            }
            
            if (href && href.startsWith('#')) {
                e.preventDefault();
                
                const targetId = href.substring(1);
                // Special case for scrolling to top when logo or Conceito is clicked
                const targetEl = targetId === '' || targetId === 'inicio' 
                    ? document.body 
                    : document.getElementById(targetId);
                
                if (targetEl) {
                    gsap.to(window, {
                        scrollTo: {
                            y: targetEl,
                            offsetY: 80, // Offset for the fixed pill navbar
                            autoKill: false
                        },
                        duration: 1.2,
                        ease: "power3.out"
                    });
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

// Refresh ScrollTrigger after window is fully loaded to prevent offset bugs
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});

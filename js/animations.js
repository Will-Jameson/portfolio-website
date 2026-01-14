// Scroll Animations using Intersection Observer

// Animation configuration
const animationConfig = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    animateOnce: true
};

// ====================================
// Initialize Animations
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initCounterAnimations();
    initParallaxEffect();
});

// ====================================
// Scroll Animations with Intersection Observer
// ====================================

function initScrollAnimations() {
    // Check for Intersection Observer support
    if (!('IntersectionObserver' in window)) {
        // Fallback: show all elements immediately
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.add('animate-in');
        });
        return;
    }

    // Create observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation class
                entry.target.classList.add('animate-in');

                // Optionally unobserve after animation
                if (animationConfig.animateOnce) {
                    observer.unobserve(entry.target);
                }
            } else if (!animationConfig.animateOnce) {
                // Remove animation class if animating multiple times
                entry.target.classList.remove('animate-in');
            }
        });
    }, {
        threshold: animationConfig.threshold,
        rootMargin: animationConfig.rootMargin
    });

    // Observe all elements with animate-on-scroll class
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// ====================================
// Counter Animations for Stats
// ====================================

function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');

    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = element.textContent.trim();

    // Check if it's a number
    const numMatch = target.match(/\d+/);
    if (!numMatch) return;

    const endValue = parseInt(numMatch[0]);
    const duration = 2000; // 2 seconds
    const increment = endValue / (duration / 16); // 60fps
    let currentValue = 0;

    const suffix = target.replace(/\d+/, '').trim();
    const prefix = target.split(/\d+/)[0];

    const updateCounter = () => {
        currentValue += increment;

        if (currentValue < endValue) {
            element.textContent = prefix + Math.floor(currentValue) + suffix;
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
}

// ====================================
// Parallax Effect (Subtle)
// ====================================

function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.hero-shape');

    if (parallaxElements.length === 0) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const handleScroll = window.portfolioUtils
        ? window.portfolioUtils.throttle(updateParallax, 16)
        : updateParallax;

    window.addEventListener('scroll', handleScroll);

    function updateParallax() {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(element => {
            const speed = 0.5; // Parallax speed (lower = slower)
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }
}

// ====================================
// Stagger Animation for Lists
// ====================================

function animateListStagger(listSelector, itemSelector) {
    const lists = document.querySelectorAll(listSelector);

    lists.forEach(list => {
        const items = list.querySelectorAll(itemSelector);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('animate-in');
                        }, index * 100); // 100ms delay between each item
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });

        observer.observe(list);
    });
}

// ====================================
// Hover Animation Enhancements
// ====================================

function initHoverAnimations() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn, .project-link, .filter-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// ====================================
// Image Lazy Loading Observer
// ====================================

function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        return;
    }

    // Fallback for browsers that don't support lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ====================================
// Scroll-triggered Reveal Animations
// ====================================

function createRevealObserver(className = 'reveal', animationClass = 'revealed') {
    const elements = document.querySelectorAll(`.${className}`);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(animationClass);

                if (animationConfig.animateOnce) {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// ====================================
// Text Typing Effect
// ====================================

function initTypingEffect(selector, speed = 100) {
    const elements = document.querySelectorAll(selector);

    elements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.display = 'inline-block';

        let charIndex = 0;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeText();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(element);

        function typeText() {
            if (charIndex < text.length) {
                element.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(typeText, speed);
            }
        }
    });
}

// ====================================
// Progress Bar Animation
// ====================================

function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar, .skill-progress');

    if (progressBars.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const targetWidth = bar.dataset.progress || '100';

                bar.style.width = '0%';

                setTimeout(() => {
                    bar.style.transition = 'width 1.5s ease-out';
                    bar.style.width = targetWidth + '%';
                }, 100);

                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    progressBars.forEach(bar => observer.observe(bar));
}

// ====================================
// Card Flip Animation
// ====================================

function initCardFlip() {
    const flipCards = document.querySelectorAll('.flip-card');

    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
}

// ====================================
// Smooth Color Transitions
// ====================================

function animateColorChange(element, fromColor, toColor, duration = 1000) {
    const start = Date.now();

    function update() {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);

        // Simple easing function
        const eased = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

        // Interpolate color (assuming RGB format)
        const from = parseColor(fromColor);
        const to = parseColor(toColor);

        const r = Math.round(from.r + (to.r - from.r) * eased);
        const g = Math.round(from.g + (to.g - from.g) * eased);
        const b = Math.round(from.b + (to.b - from.b) * eased);

        element.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    update();
}

function parseColor(color) {
    // Simple RGB parser (expand as needed)
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        };
    }
    return { r: 0, g: 0, b: 0 };
}

// ====================================
// Performance Monitoring
// ====================================

function checkAnimationPerformance() {
    if (!window.performance || !window.performance.mark) return;

    window.performance.mark('animations-start');

    // Monitor frame rate
    let lastTime = performance.now();
    let frames = 0;

    function checkFPS() {
        frames++;
        const currentTime = performance.now();

        if (currentTime >= lastTime + 1000) {
            const fps = Math.round((frames * 1000) / (currentTime - lastTime));

            if (fps < 30) {
                console.warn('Low FPS detected:', fps);
                // Optionally disable some animations
                document.documentElement.classList.add('low-performance');
            }

            frames = 0;
            lastTime = currentTime;
        }

        requestAnimationFrame(checkFPS);
    }

    checkFPS();
}

// ====================================
// Export functions for external use
// ====================================

window.animationUtils = {
    animateCounter,
    animateListStagger,
    createRevealObserver,
    initTypingEffect,
    animateProgressBars,
    animateColorChange
};

// Optional: Enable performance monitoring in development
// checkAnimationPerformance();

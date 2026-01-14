// Navigation JavaScript

// Navigation state
const navState = {
    lastScrollTop: 0,
    scrollThreshold: 100,
    isMenuOpen: false
};

// ====================================
// Initialize Navigation
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initActiveSection();
    initNavbarScroll();
    initMobileMenu();
});

// ====================================
// Smooth Scrolling
// ====================================

function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Don't prevent default for empty hash
            if (href === '#' || href === '#!') return;

            e.preventDefault();

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Close mobile menu if open
                if (navState.isMenuOpen) {
                    closeMobileMenu();
                }

                // Calculate offset for fixed navbar
                const navbar = document.getElementById('navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - navbarHeight;

                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL without scrolling
                if (history.pushState) {
                    history.pushState(null, null, href);
                } else {
                    window.location.hash = href;
                }
            }
        });
    });
}

// ====================================
// Active Section Highlighting
// ====================================

function initActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    // Throttle scroll event for performance
    const handleScroll = window.portfolioUtils
        ? window.portfolioUtils.throttle(updateActiveSection, 100)
        : updateActiveSection;

    window.addEventListener('scroll', handleScroll);

    function updateActiveSection() {
        const scrollPosition = window.pageYOffset;
        const navbar = document.getElementById('navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 50;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                // Remove active class from all links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });

                // Add active class to current section link
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }
}

// ====================================
// Navbar Scroll Behavior
// ====================================

function initNavbarScroll() {
    const navbar = document.getElementById('navbar');

    if (!navbar) return;

    const handleScroll = window.portfolioUtils
        ? window.portfolioUtils.throttle(updateNavbar, 100)
        : updateNavbar;

    window.addEventListener('scroll', handleScroll);

    function updateNavbar() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add scrolled class for styling
        if (currentScrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/show navbar on scroll
        if (currentScrollTop > navState.scrollThreshold) {
            if (currentScrollTop > navState.lastScrollTop && !navState.isMenuOpen) {
                // Scrolling down - hide navbar
                navbar.classList.add('hidden');
            } else {
                // Scrolling up - show navbar
                navbar.classList.remove('hidden');
            }
        }

        navState.lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    }
}

// ====================================
// Mobile Menu
// ====================================

function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navToggle || !navMenu) return;

    // Toggle menu on button click
    navToggle.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navState.isMenuOpen &&
            !navToggle.contains(e.target) &&
            !navMenu.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navState.isMenuOpen) {
                closeMobileMenu();
            }
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navState.isMenuOpen) {
            closeMobileMenu();
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navState.isMenuOpen) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navState.isMenuOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    navMenu.classList.add('active');
    navToggle.classList.add('active');
    document.body.classList.add('menu-open');
    navState.isMenuOpen = true;

    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';

    // Set aria attributes
    navToggle.setAttribute('aria-expanded', 'true');
    navMenu.setAttribute('aria-hidden', 'false');
}

function closeMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.classList.remove('menu-open');
    navState.isMenuOpen = false;

    // Re-enable body scroll
    document.body.style.overflow = '';

    // Set aria attributes
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.setAttribute('aria-hidden', 'true');
}

// ====================================
// Keyboard Navigation
// ====================================

// Enhanced keyboard navigation for accessibility
document.addEventListener('keydown', (e) => {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentFocus = document.activeElement;

    // Handle tab navigation in mobile menu
    if (navState.isMenuOpen && e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
            '#nav-menu a, #nav-menu button, #nav-toggle'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            // Shift + Tab
            if (currentFocus === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            // Tab
            if (currentFocus === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    // Navigate sections with arrow keys when nav link is focused
    if (currentFocus && currentFocus.classList.contains('nav-link')) {
        const linksArray = Array.from(navLinks);
        const currentIndex = linksArray.indexOf(currentFocus);

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % linksArray.length;
            linksArray[nextIndex].focus();
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + linksArray.length) % linksArray.length;
            linksArray[prevIndex].focus();
        }

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            currentFocus.click();
        }
    }
});

// ====================================
// Scroll Progress Indicator (Optional)
// ====================================

function initScrollProgress() {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
        z-index: 9999;
        transition: width 0.1s ease;
    `;

    document.body.appendChild(progressBar);

    const handleScroll = window.portfolioUtils
        ? window.portfolioUtils.throttle(updateProgress, 50)
        : updateProgress;

    window.addEventListener('scroll', handleScroll);

    function updateProgress() {
        const percentage = window.portfolioUtils
            ? window.portfolioUtils.getScrollPercentage()
            : getScrollPercentage();

        progressBar.style.width = `${percentage}%`;
    }

    function getScrollPercentage() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        return (scrollTop / scrollHeight) * 100;
    }
}

// Uncomment to enable scroll progress indicator
// initScrollProgress();

// ====================================
// Export functions for external use
// ====================================

window.navigationUtils = {
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu
};

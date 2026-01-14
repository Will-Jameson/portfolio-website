// Main JavaScript File

// State management
const state = {
    projects: [],
    currentFilter: 'all',
    theme: localStorage.getItem('theme') || 'light' // 'light' = green, 'dark' = amber
};

// ====================================
// Initialize on DOM Load
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadProjects();
    loadBlogPreview();
    initContactForm();
    initScrollTop();
    initProjectFilters();
});

// ====================================
// Theme Management
// ====================================

function initTheme() {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();

    // Theme toggle handler
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = state.theme === 'light' ? '🌙' : '☀️';
    }
}

// ====================================
// Project Loading and Rendering
// ====================================

async function loadProjects() {
    const projectsGrid = document.getElementById('projects-grid');

    if (!projectsGrid) return;

    try {
        const response = await fetch('data/projects.json');

        if (!response.ok) {
            throw new Error('Failed to load projects');
        }

        const data = await response.json();
        state.projects = data.projects;

        renderProjects(state.projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsGrid.innerHTML = `
            <div class="loading-state">
                <p>Unable to load projects. Please try again later.</p>
            </div>
        `;
    }
}

function renderProjects(projects) {
    const projectsGrid = document.getElementById('projects-grid');

    if (!projectsGrid || projects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="loading-state">
                <p>No projects found.</p>
            </div>
        `;
        return;
    }

    projectsGrid.innerHTML = projects.map(project => createProjectCard(project)).join('');
}

function createProjectCard(project) {
    const techTags = project.technologies
        .map(tech => `<span class="tech-tag">${tech}</span>`)
        .join('');

    const githubLink = project.links.github
        ? `<a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="project-link">
            GitHub
           </a>`
        : '';

    const demoLink = project.links.demo
        ? `<a href="${project.links.demo}" target="_blank" rel="noopener noreferrer" class="project-link primary">
            Live Demo
           </a>`
        : '';

    const documentLink = project.links.document
        ? `<a href="${project.links.document}" target="_blank" rel="noopener noreferrer" class="project-link primary">
            View Document
           </a>`
        : '';

    return `
        <div class="project-card animate-on-scroll" data-category="${project.category}">
            <div class="project-card-image">
                <img src="${project.image}" alt="${project.title}" loading="lazy">
            </div>
            <div class="project-card-content">
                <h3 class="project-card-title">${project.title}</h3>
                <p class="project-card-description">${project.description}</p>
                <div class="project-card-tech">
                    ${techTags}
                </div>
                <div class="project-card-links">
                    ${githubLink}
                    ${demoLink}
                    ${documentLink}
                </div>
            </div>
        </div>
    `;
}

// ====================================
// Project Filtering
// ====================================

function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter projects
            state.currentFilter = filter;
            filterProjects(filter);
        });
    });
}

function filterProjects(category) {
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (category === 'all' || cardCategory === category) {
            card.style.display = 'flex';
            // Re-trigger animation
            setTimeout(() => {
                card.classList.add('animate-in');
            }, 10);
        } else {
            card.classList.remove('animate-in');
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// ====================================
// Contact Form
// ====================================

function initContactForm() {
    const contactForm = document.getElementById('contact-form');

    if (!contactForm) return;

    contactForm.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formStatus = document.getElementById('form-status');
    const submitButton = form.querySelector('button[type="submit"]');

    // Get form data
    const formData = {
        name: form.name.value,
        email: form.email.value,
        message: form.message.value
    };

    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
        // TODO: Replace with your actual form submission endpoint
        // For now, we'll simulate a successful submission
        await simulateFormSubmission(formData);

        // Show success message
        formStatus.textContent = 'Message sent successfully! I\'ll get back to you soon.';
        formStatus.className = 'form-status success';

        // Reset form
        form.reset();

        // Hide success message after 5 seconds
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    } catch (error) {
        console.error('Form submission error:', error);
        formStatus.textContent = 'Oops! Something went wrong. Please try again.';
        formStatus.className = 'form-status error';
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
    }
}

function simulateFormSubmission(data) {
    return new Promise((resolve) => {
        console.log('Form data:', data);
        // Simulate network delay
        setTimeout(() => resolve(), 1000);
    });
}

// ====================================
// Scroll to Top Button
// ====================================

function initScrollTop() {
    const scrollTopBtn = document.getElementById('scroll-top');

    if (!scrollTopBtn) return;

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    // Scroll to top on click
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ====================================
// Blog Preview Loading
// ====================================

async function loadBlogPreview() {
    const previewGrid = document.getElementById('blog-preview-grid');

    if (!previewGrid) return;

    try {
        // Check if BlogStorage is available
        if (typeof window.BlogStorage === 'undefined') {
            // Blog storage not loaded, keep placeholder cards
            return;
        }

        // Get latest 3 published posts
        const posts = window.BlogStorage.getPublishedPosts().slice(0, 3);

        if (posts.length === 0) {
            // No posts yet, keep placeholder cards
            return;
        }

        // Check if createBlogCard function is available
        if (typeof window.createBlogCard === 'undefined') {
            // Load blog.js dynamically
            const script = document.createElement('script');
            script.src = 'js/blog.js';
            await new Promise((resolve) => {
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }

        // Replace placeholder cards with real posts
        previewGrid.innerHTML = posts
            .map(post => window.createBlogCard(post))
            .join('');

    } catch (error) {
        console.error('Error loading blog preview:', error);
        // Keep placeholder cards on error
    }
}

// ====================================
// Utility Functions
// ====================================

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Get scroll percentage
function getScrollPercentage() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    return (scrollTop / scrollHeight) * 100;
}

// Smooth scroll to element
function smoothScrollTo(target, duration = 1000) {
    const targetElement = typeof target === 'string'
        ? document.querySelector(target)
        : target;

    if (!targetElement) return;

    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// Export functions for use in other scripts
window.portfolioUtils = {
    debounce,
    throttle,
    isInViewport,
    getScrollPercentage,
    smoothScrollTo
};

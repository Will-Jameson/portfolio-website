// Blog Listing Page - Load and display blog posts

class BlogListing {
    constructor() {
        this.posts = [];
        this.currentFilter = 'all';

        // DOM elements
        this.blogGrid = document.getElementById('blog-grid');
        this.emptyState = document.getElementById('blog-empty');
        this.filterButtons = document.querySelectorAll('.filter-btn');

        this.init();
    }

    // ====================================
    // Initialization
    // ====================================

    async init() {
        // Load posts
        await this.loadPosts();

        // Set up filter buttons
        this.setupFilters();

        // Render posts
        this.renderPosts();
    }

    // ====================================
    // Data Loading
    // ====================================

    async loadPosts() {
        try {
            // Get published posts from storage
            this.posts = window.BlogStorage.getPublishedPosts();

            // If no posts in localStorage, try fallback JSON
            if (this.posts.length === 0) {
                this.posts = await window.BlogStorage.loadFromFallback();
                // Filter only published posts from fallback
                this.posts = this.posts.filter(post => post.published === true);
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            this.posts = [];
        }
    }

    // ====================================
    // Rendering
    // ====================================

    renderPosts() {
        // Filter posts based on current filter
        const filteredPosts = this.filterPosts(this.posts, this.currentFilter);

        // Check if empty
        if (filteredPosts.length === 0) {
            this.showEmptyState();
            return;
        }

        // Hide empty state
        this.emptyState.style.display = 'none';

        // Render blog cards
        this.blogGrid.innerHTML = filteredPosts
            .map(post => this.createBlogCard(post))
            .join('');

        // Add scroll animations
        this.addScrollAnimations();
    }

    createBlogCard(post) {
        // Format date
        const date = new Date(post.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Use featured image or placeholder
        const imageUrl = post.featuredImage || 'assets/images/blog/placeholder.jpg';

        return `
            <article class="blog-card animate-on-scroll" data-category="${post.category}">
                <div class="blog-card-image">
                    <img src="${imageUrl}" alt="${post.title}" loading="lazy">
                    <span class="blog-category">${post.category}</span>
                </div>
                <div class="blog-card-content">
                    <time class="blog-date">${formattedDate}</time>
                    <h3 class="blog-title">${post.title}</h3>
                    <p class="blog-excerpt">${post.excerpt}</p>
                    <div class="blog-card-meta">
                        <span class="blog-read-time">${post.readTime} min read</span>
                    </div>
                    <a href="blog-post.html?id=${post.id}" class="blog-link">Read More →</a>
                </div>
            </article>
        `;
    }

    showEmptyState() {
        this.blogGrid.style.display = 'none';
        this.emptyState.style.display = 'flex';
    }

    // ====================================
    // Filtering
    // ====================================

    setupFilters() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                this.setActiveFilter(button);
                this.currentFilter = category;
                this.renderPosts();
            });
        });
    }

    setActiveFilter(activeButton) {
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    filterPosts(posts, category) {
        if (category === 'all') {
            return posts;
        }
        return posts.filter(post => post.category === category);
    }

    // ====================================
    // Animations
    // ====================================

    addScrollAnimations() {
        // Re-trigger scroll animations for newly added cards
        const cards = document.querySelectorAll('.blog-card');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, {
                threshold: 0.1
            });

            cards.forEach(card => observer.observe(card));
        } else {
            // Fallback: just add class immediately
            cards.forEach(card => card.classList.add('animate-in'));
        }
    }
}

// Initialize blog listing when DOM is ready
if (document.getElementById('blog-grid')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.blogListing = new BlogListing();
    });
}

// Export function for reuse in homepage
window.createBlogCard = function(post) {
    const date = new Date(post.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const imageUrl = post.featuredImage || 'assets/images/blog/placeholder.jpg';

    return `
        <article class="blog-card animate-on-scroll" data-category="${post.category}">
            <div class="blog-card-image">
                <img src="${imageUrl}" alt="${post.title}" loading="lazy">
                <span class="blog-category">${post.category}</span>
            </div>
            <div class="blog-card-content">
                <time class="blog-date">${formattedDate}</time>
                <h3 class="blog-title">${post.title}</h3>
                <p class="blog-excerpt">${post.excerpt}</p>
                <div class="blog-card-meta">
                    <span class="blog-read-time">${post.readTime} min read</span>
                </div>
                <a href="blog-post.html?id=${post.id}" class="blog-link">Read More →</a>
            </div>
        </article>
    `;
};

// Blog Post View - Display individual blog post

class BlogPost {
    constructor() {
        this.post = null;
        this.postContainer = document.getElementById('post-container');

        this.init();
    }

    // ====================================
    // Initialization
    // ====================================

    async init() {
        // Get post ID from URL
        const postId = this.getPostIdFromURL();

        if (!postId) {
            this.showNotFound();
            return;
        }

        // Load post
        await this.loadPost(postId);

        // Render post
        if (this.post) {
            this.renderPost();
            this.updateMetaTags();
        } else {
            this.showNotFound();
        }
    }

    // ====================================
    // Data Loading
    // ====================================

    getPostIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadPost(postId) {
        try {
            // Get post from storage
            this.post = window.BlogStorage.getPostById(postId);

            // If not found in localStorage, try fallback
            if (!this.post) {
                const fallbackPosts = await window.BlogStorage.loadFromFallback();
                this.post = fallbackPosts.find(p => p.id === postId || p.slug === postId);
            }

            // Check if post is published
            if (this.post && !this.post.published) {
                this.post = null; // Don't show unpublished posts
            }
        } catch (error) {
            console.error('Error loading post:', error);
            this.post = null;
        }
    }

    // ====================================
    // Rendering
    // ====================================

    renderPost() {
        // Format date
        const date = new Date(this.post.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Build HTML
        const html = `
            <section class="post-hero">
                <div class="container">
                    <div class="post-hero-content animate-on-scroll">
                        <span class="post-category">${this.post.category}</span>
                        <h1 class="post-title">${this.post.title}</h1>
                        <div class="post-meta">
                            <span>${this.post.author || 'Will Jameson'}</span>
                            <span><time datetime="${date.toISOString()}">${formattedDate}</time></span>
                            <span>${this.post.readTime} min read</span>
                        </div>
                    </div>
                </div>
            </section>

            <section class="post-content-section">
                <div class="container">
                    <article class="post-container">
                        ${this.post.featuredImage ? `
                            <img src="${this.post.featuredImage}"
                                 alt="${this.post.title}"
                                 class="post-featured-image animate-on-scroll"
                                 loading="eager">
                        ` : ''}

                        <div class="post-body animate-on-scroll">
                            ${this.post.content}
                        </div>

                        <div class="post-navigation animate-on-scroll">
                            <a href="blog.html" class="btn btn-secondary">← Back to Blog</a>
                        </div>
                    </article>
                </div>
            </section>
        `;

        this.postContainer.innerHTML = html;

        // Add scroll animations
        this.addScrollAnimations();
    }

    showNotFound() {
        const html = `
            <section class="post-hero">
                <div class="container">
                    <div class="post-not-found">
                        <h1>Post Not Found</h1>
                        <p>Sorry, the blog post you're looking for doesn't exist or has been removed.</p>
                        <a href="blog.html" class="btn btn-primary">Browse All Posts</a>
                    </div>
                </div>
            </section>
        `;

        this.postContainer.innerHTML = html;
        document.title = 'Post Not Found - Will Jameson';
    }

    // ====================================
    // Meta Tags & SEO
    // ====================================

    updateMetaTags() {
        if (!this.post) return;

        // Update page title
        document.title = `${this.post.title} - Will Jameson`;

        // Update meta description
        const metaDescription = document.getElementById('meta-description');
        if (metaDescription) {
            metaDescription.setAttribute('content', this.post.excerpt);
        }

        // Update Open Graph tags
        const ogTitle = document.getElementById('og-title');
        if (ogTitle) {
            ogTitle.setAttribute('content', this.post.title);
        }

        const ogDescription = document.getElementById('og-description');
        if (ogDescription) {
            ogDescription.setAttribute('content', this.post.excerpt);
        }

        const ogUrl = document.getElementById('og-url');
        if (ogUrl) {
            ogUrl.setAttribute('content', window.location.href);
        }

        const ogImage = document.getElementById('og-image');
        if (ogImage && this.post.featuredImage) {
            // Convert relative URL to absolute if needed
            const imageUrl = this.post.featuredImage.startsWith('http')
                ? this.post.featuredImage
                : `${window.location.origin}/${this.post.featuredImage}`;
            ogImage.setAttribute('content', imageUrl);
        }
    }

    // ====================================
    // Animations
    // ====================================

    addScrollAnimations() {
        const elements = document.querySelectorAll('.animate-on-scroll');

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

            elements.forEach(el => observer.observe(el));
        } else {
            // Fallback: just add class immediately
            elements.forEach(el => el.classList.add('animate-in'));
        }
    }
}

// Initialize blog post when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.blogPost = new BlogPost();
});

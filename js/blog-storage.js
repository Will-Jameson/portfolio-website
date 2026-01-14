// Blog Storage Manager - localStorage wrapper for blog posts

class BlogStorage {
    constructor() {
        this.STORAGE_KEY = 'blog_posts';
        this.DRAFTS_KEY = 'blog_drafts';
        this.SETTINGS_KEY = 'blog_settings';
    }

    // ====================================
    // Core Storage Methods
    // ====================================

    /**
     * Get all posts (published and drafts)
     * @returns {Array} Array of blog post objects
     */
    getAllPosts() {
        try {
            const posts = localStorage.getItem(this.STORAGE_KEY);

            if (posts) {
                return JSON.parse(posts);
            }

            // If localStorage is empty, return empty array
            // (loadFromFallback is async and should be called separately)
            return [];
        } catch (error) {
            console.error('Error loading posts:', error);
            return [];
        }
    }

    /**
     * Get only published posts, sorted by date (newest first)
     * @returns {Array} Array of published blog posts
     */
    getPublishedPosts() {
        const allPosts = this.getAllPosts();
        return allPosts
            .filter(post => post.published === true)
            .sort((a, b) => b.createdAt - a.createdAt);
    }

    /**
     * Get only draft posts
     * @returns {Array} Array of draft posts
     */
    getDrafts() {
        const allPosts = this.getAllPosts();
        return allPosts
            .filter(post => post.published === false)
            .sort((a, b) => b.updatedAt - a.updatedAt);
    }

    /**
     * Get a single post by ID
     * @param {string} id - Post ID or slug
     * @returns {Object|null} Post object or null if not found
     */
    getPostById(id) {
        const posts = this.getAllPosts();
        return posts.find(post => post.id === id || post.slug === id) || null;
    }

    /**
     * Get posts by category
     * @param {string} category - Category name
     * @returns {Array} Array of posts in the category
     */
    getPostsByCategory(category) {
        const published = this.getPublishedPosts();
        return published.filter(post => post.category === category);
    }

    /**
     * Save or update a post
     * @param {Object} postData - Post data object
     * @returns {Object} Saved post with generated ID and timestamps
     */
    savePost(postData) {
        try {
            const posts = this.getAllPosts();
            const now = Date.now();

            // Check if this is an update or new post
            const existingIndex = posts.findIndex(p => p.id === postData.id);

            let post;
            if (existingIndex >= 0) {
                // Update existing post
                post = {
                    ...posts[existingIndex],
                    ...postData,
                    updatedAt: now
                };
                posts[existingIndex] = post;
            } else {
                // Create new post
                post = {
                    ...postData,
                    id: this.generateId(postData.title, now),
                    slug: this.generateSlug(postData.title),
                    createdAt: now,
                    updatedAt: now,
                    readTime: this.calculateReadTime(postData.content || ''),
                    excerpt: postData.excerpt || this.generateExcerpt(postData.content || '')
                };
                posts.push(post);
            }

            // Save to localStorage
            this.savePosts(posts);
            return post;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded. Please delete old posts or use smaller images.');
            }
            throw error;
        }
    }

    /**
     * Delete a post by ID
     * @param {string} id - Post ID
     * @returns {boolean} True if deleted, false if not found
     */
    deletePost(id) {
        try {
            const posts = this.getAllPosts();
            const filteredPosts = posts.filter(post => post.id !== id);

            if (filteredPosts.length === posts.length) {
                return false; // Post not found
            }

            this.savePosts(filteredPosts);
            return true;
        } catch (error) {
            console.error('Error deleting post:', error);
            return false;
        }
    }

    /**
     * Save posts array to localStorage
     * @param {Array} posts - Array of post objects
     */
    savePosts(posts) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded. Try using external image URLs instead of base64.');
            }
            throw error;
        }
    }

    // ====================================
    // Utility Methods
    // ====================================

    /**
     * Generate unique ID from title and timestamp
     * @param {string} title - Post title
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Unique ID
     */
    generateId(title, timestamp) {
        const slug = this.generateSlug(title);
        const date = new Date(timestamp).toISOString().split('T')[0];
        return `${slug}-${date}`;
    }

    /**
     * Generate URL-friendly slug from title
     * @param {string} title - Post title
     * @returns {string} URL-safe slug
     */
    generateSlug(title) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')      // Replace spaces with hyphens
            .replace(/-+/g, '-')       // Replace multiple hyphens with single
            .substring(0, 60);         // Limit length
    }

    /**
     * Calculate estimated read time
     * @param {string} content - HTML content
     * @returns {number} Read time in minutes
     */
    calculateReadTime(content) {
        const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / 200); // Average reading speed
        return Math.max(1, minutes); // Minimum 1 minute
    }

    /**
     * Generate excerpt from content
     * @param {string} content - HTML content
     * @returns {string} Excerpt (first 150 characters)
     */
    generateExcerpt(content) {
        const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
        const excerpt = text.trim().substring(0, 150);
        return excerpt.length < text.trim().length ? excerpt + '...' : excerpt;
    }

    /**
     * Load posts from fallback JSON file
     * @returns {Array} Array of posts or empty array
     */
    async loadFromFallback() {
        try {
            const response = await fetch('data/blog-posts.json');
            if (!response.ok) return [];

            const data = await response.json();
            const posts = data.posts || [];

            // Save to localStorage for future use
            if (posts.length > 0) {
                this.savePosts(posts);
            }

            return posts;
        } catch (error) {
            console.log('No fallback data file found, starting with empty blog');
            return [];
        }
    }

    // ====================================
    // Export/Import Methods
    // ====================================

    /**
     * Export all posts to JSON
     * @returns {string} JSON string of all posts
     */
    exportToJSON() {
        const posts = this.getAllPosts();
        return JSON.stringify({ posts }, null, 2);
    }

    /**
     * Import posts from JSON string
     * @param {string} jsonString - JSON string containing posts
     * @returns {number} Number of posts imported
     */
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            const posts = data.posts || [];

            this.savePosts(posts);
            return posts.length;
        } catch (error) {
            console.error('Error importing posts:', error);
            throw new Error('Invalid JSON format');
        }
    }

    /**
     * Download posts as JSON file
     */
    downloadBackup() {
        const json = this.exportToJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `blog-backup-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ====================================
    // Settings Management
    // ====================================

    /**
     * Get blog settings
     * @returns {Object} Settings object
     */
    getSettings() {
        try {
            const settings = localStorage.getItem(this.SETTINGS_KEY);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (error) {
            return this.getDefaultSettings();
        }
    }

    /**
     * Save blog settings
     * @param {Object} settings - Settings object
     */
    saveSettings(settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    }

    /**
     * Get default settings
     * @returns {Object} Default settings
     */
    getDefaultSettings() {
        return {
            author: 'Will Jameson',
            postsPerPage: 9,
            categories: ['Tutorial', 'Engineering', 'Technology'],
            defaultCategory: 'Technology'
        };
    }

    // ====================================
    // Storage Stats
    // ====================================

    /**
     * Get storage usage statistics
     * @returns {Object} Storage stats
     */
    getStorageStats() {
        const posts = this.getAllPosts();
        const jsonString = JSON.stringify(posts);
        const sizeInBytes = new Blob([jsonString]).size;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

        return {
            totalPosts: posts.length,
            publishedPosts: posts.filter(p => p.published).length,
            draftPosts: posts.filter(p => !p.published).length,
            sizeInBytes,
            sizeInKB,
            sizeInMB,
            percentUsed: ((sizeInBytes / (5 * 1024 * 1024)) * 100).toFixed(2) // Assuming 5MB limit
        };
    }

    /**
     * Clear all blog data (use with caution!)
     */
    clearAll() {
        if (confirm('Are you sure you want to delete ALL blog posts? This cannot be undone!')) {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.DRAFTS_KEY);
            return true;
        }
        return false;
    }
}

// Create global instance
window.BlogStorage = new BlogStorage();

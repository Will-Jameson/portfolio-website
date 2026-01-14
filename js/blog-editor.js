// Blog Post Editor - WYSIWYG editor functionality

class BlogEditor {
    constructor() {
        this.currentPost = null;
        this.autoSaveInterval = null;
        this.hasUnsavedChanges = false;

        // DOM elements
        this.elements = {
            titleInput: document.getElementById('post-title'),
            slugInput: document.getElementById('post-slug'),
            categorySelect: document.getElementById('post-category'),
            featuredImageInput: document.getElementById('post-featured-image'),
            excerptInput: document.getElementById('post-excerpt'),
            publishedCheckbox: document.getElementById('post-published'),
            editorContent: document.getElementById('editor-content'),
            readTimeDisplay: document.getElementById('read-time'),
            saveStatus: document.getElementById('save-status'),
            saveDraftBtn: document.getElementById('save-draft-btn'),
            publishBtn: document.getElementById('publish-btn'),
            deleteBtn: document.getElementById('delete-btn'),
            previewBtn: document.getElementById('preview-btn'),
            exportGithubBtn: document.getElementById('export-github-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            pageTitle: document.getElementById('page-title')
        };

        this.init();
    }

    // ====================================
    // Initialization
    // ====================================

    init() {
        // Require authentication
        if (!window.BlogAuth.requireAuth('../admin/index.html')) {
            return;
        }

        // Check if editing existing post
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        if (postId) {
            this.loadPost(postId);
        } else {
            this.initNewPost();
        }

        // Set up event listeners
        this.setupEventListeners();

        // Start auto-save
        this.startAutoSave();

        // Prevent accidental navigation
        this.setupBeforeUnload();
    }

    initNewPost() {
        this.currentPost = null;
        this.elements.pageTitle.textContent = 'New Post';
        this.elements.deleteBtn.style.display = 'none';
    }

    loadPost(postId) {
        const post = window.BlogStorage.getPostById(postId);

        if (!post) {
            alert('Post not found!');
            window.location.href = 'posts.html';
            return;
        }

        this.currentPost = post;

        // Populate form
        this.elements.titleInput.value = post.title || '';
        this.elements.slugInput.value = post.slug || '';
        this.elements.categorySelect.value = post.category || 'Technology';
        this.elements.featuredImageInput.value = post.featuredImage || '';
        this.elements.excerptInput.value = post.excerpt || '';
        this.elements.publishedCheckbox.checked = post.published || false;
        this.elements.editorContent.innerHTML = post.content || '';

        // Update UI
        this.elements.pageTitle.textContent = 'Edit Post';
        this.elements.deleteBtn.style.display = 'block';
        this.updateReadTime();
    }

    // ====================================
    // Event Listeners
    // ====================================

    setupEventListeners() {
        // Title input - auto-generate slug
        this.elements.titleInput.addEventListener('input', () => {
            this.updateSlug();
            this.markUnsaved();
        });

        // Editor content - track changes and update read time
        this.elements.editorContent.addEventListener('input', () => {
            this.updateReadTime();
            this.markUnsaved();
        });

        // Metadata inputs
        [this.elements.categorySelect, this.elements.featuredImageInput,
         this.elements.excerptInput, this.elements.publishedCheckbox].forEach(el => {
            el.addEventListener('change', () => this.markUnsaved());
        });

        // Toolbar buttons
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                const value = btn.dataset.value;
                this.executeCommand(command, value);
            });
        });

        // Action buttons
        this.elements.saveDraftBtn.addEventListener('click', () => this.saveDraft());
        this.elements.publishBtn.addEventListener('click', () => this.publish());
        this.elements.deleteBtn.addEventListener('click', () => this.deletePost());
        this.elements.previewBtn.addEventListener('click', () => this.showPreview());
        this.elements.exportGithubBtn.addEventListener('click', () => this.exportToGitHub());
        this.elements.logoutBtn.addEventListener('click', () => this.logout());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // ====================================
    // Editor Commands
    // ====================================

    executeCommand(command, value = null) {
        this.elements.editorContent.focus();

        switch (command) {
            case 'heading':
                document.execCommand('formatBlock', false, value);
                break;
            case 'paragraph':
                document.execCommand('formatBlock', false, 'p');
                break;
            case 'createLink':
                this.insertLink();
                break;
            case 'insertImage':
                this.insertImage();
                break;
            default:
                document.execCommand(command, false, value);
        }

        this.markUnsaved();
    }

    insertLink() {
        const url = prompt('Enter URL:');
        if (url) {
            const selection = window.getSelection();
            if (selection.toString().length === 0) {
                const text = prompt('Enter link text:');
                if (text) {
                    document.execCommand('insertHTML', false,
                        `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`);
                }
            } else {
                document.execCommand('createLink', false, url);
                // Add target="_blank" to the created link
                const link = window.getSelection().anchorNode.parentElement;
                if (link.tagName === 'A') {
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                }
            }
        }
    }

    insertImage() {
        const url = prompt('Enter image URL:');
        if (url) {
            const altText = prompt('Enter alt text (optional):') || 'Image';
            document.execCommand('insertHTML', false,
                `<img src="${url}" alt="${altText}" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;">`);
        }
    }

    // ====================================
    // Auto-Save & Save Functions
    // ====================================

    startAutoSave() {
        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            if (this.hasUnsavedChanges) {
                this.autoSave();
            }
        }, 30000);
    }

    autoSave() {
        if (!this.validateForm(false)) return;

        try {
            const postData = this.getPostData();
            postData.published = false; // Auto-save as draft

            const savedPost = window.BlogStorage.savePost(postData);
            this.currentPost = savedPost;
            this.hasUnsavedChanges = false;
            this.updateSaveStatus('Auto-saved');

            // Update URL if this was a new post
            if (!new URLSearchParams(window.location.search).get('id')) {
                window.history.replaceState({}, '', `?id=${savedPost.id}`);
                this.elements.deleteBtn.style.display = 'block';
            }
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    saveDraft() {
        if (!this.validateForm(false)) {
            alert('Please enter a title for your post.');
            return;
        }

        try {
            const postData = this.getPostData();
            postData.published = false;

            const savedPost = window.BlogStorage.savePost(postData);
            this.currentPost = savedPost;
            this.hasUnsavedChanges = false;
            this.updateSaveStatus('Draft saved');

            alert('Draft saved successfully!');

            // Update URL if this was a new post
            if (!new URLSearchParams(window.location.search).get('id')) {
                window.history.replaceState({}, '', `?id=${savedPost.id}`);
                this.elements.deleteBtn.style.display = 'block';
                this.elements.pageTitle.textContent = 'Edit Post';
            }
        } catch (error) {
            alert('Error saving draft: ' + error.message);
        }
    }

    publish() {
        if (!this.validateForm(true)) {
            alert('Please fill in all required fields (Title and Content).');
            return;
        }

        const confirmMsg = this.currentPost && this.currentPost.published
            ? 'Update this published post?'
            : 'Publish this post? It will be visible on your blog.';

        if (!confirm(confirmMsg)) return;

        try {
            const postData = this.getPostData();
            postData.published = true;

            const savedPost = window.BlogStorage.savePost(postData);
            this.currentPost = savedPost;
            this.hasUnsavedChanges = false;
            this.updateSaveStatus('Published');

            alert('Post published successfully!');

            // Redirect to posts list
            setTimeout(() => {
                window.location.href = '../blog.html';
            }, 1000);
        } catch (error) {
            alert('Error publishing post: ' + error.message);
        }
    }

    deletePost() {
        if (!this.currentPost) return;

        if (!confirm('Delete this post permanently? This cannot be undone!')) return;

        try {
            window.BlogStorage.deletePost(this.currentPost.id);
            alert('Post deleted successfully.');
            window.location.href = '../blog.html';
        } catch (error) {
            alert('Error deleting post: ' + error.message);
        }
    }

    // ====================================
    // Data Management
    // ====================================

    getPostData() {
        const title = this.elements.titleInput.value.trim();
        const content = this.elements.editorContent.innerHTML;

        return {
            id: this.currentPost ? this.currentPost.id : undefined,
            title,
            slug: window.BlogStorage.generateSlug(title),
            content,
            category: this.elements.categorySelect.value,
            featuredImage: this.elements.featuredImageInput.value.trim() || '',
            excerpt: this.elements.excerptInput.value.trim() || window.BlogStorage.generateExcerpt(content),
            author: window.BlogStorage.getSettings().author,
            published: this.elements.publishedCheckbox.checked,
            readTime: window.BlogStorage.calculateReadTime(content)
        };
    }

    validateForm(requireContent = false) {
        const title = this.elements.titleInput.value.trim();

        if (!title) return false;

        if (requireContent) {
            const content = this.elements.editorContent.innerHTML.trim();
            if (!content || content === '<br>') return false;
        }

        return true;
    }

    // ====================================
    // UI Updates
    // ====================================

    updateSlug() {
        const title = this.elements.titleInput.value;
        if (title) {
            this.elements.slugInput.value = window.BlogStorage.generateSlug(title);
        }
    }

    updateReadTime() {
        const content = this.elements.editorContent.innerHTML;
        const readTime = window.BlogStorage.calculateReadTime(content);
        this.elements.readTimeDisplay.textContent = readTime;
    }

    updateSaveStatus(status) {
        this.elements.saveStatus.textContent = status;
        this.elements.saveStatus.classList.add('status-updated');

        setTimeout(() => {
            this.elements.saveStatus.classList.remove('status-updated');
        }, 2000);
    }

    markUnsaved() {
        this.hasUnsavedChanges = true;
        this.updateSaveStatus('Unsaved changes');
    }

    // ====================================
    // Preview
    // ====================================

    showPreview() {
        const modal = document.getElementById('preview-modal');
        const previewContent = document.getElementById('preview-content');
        const closeBtn = document.getElementById('close-preview');

        // Get current content
        const postData = this.getPostData();

        // Generate preview HTML
        const previewHTML = `
            <div class="post-preview">
                ${postData.featuredImage ? `
                    <img src="${postData.featuredImage}" alt="${postData.title}"
                         style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 1rem; margin-bottom: 2rem;">
                ` : ''}
                <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">${postData.title}</h1>
                <p style="color: var(--color-text-tertiary); margin-bottom: 2rem;">
                    ${postData.category} • ${postData.readTime} min read
                </p>
                <div class="post-content">
                    ${postData.content}
                </div>
            </div>
        `;

        previewContent.innerHTML = previewHTML;
        modal.style.display = 'flex';

        // Close modal
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

        // Close on outside click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    // ====================================
    // Keyboard Shortcuts
    // ====================================

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    this.saveDraft();
                    break;
                case 'b':
                    // Bold already handled by browser
                    this.markUnsaved();
                    break;
                case 'i':
                    // Italic already handled by browser
                    this.markUnsaved();
                    break;
                case 'u':
                    // Underline already handled by browser
                    this.markUnsaved();
                    break;
            }
        }
    }

    // ====================================
    // Utility Functions
    // ====================================

    setupBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        });
    }

    exportToGitHub() {
        // Get all posts as JSON
        const json = window.BlogStorage.exportToJSON();

        // Copy to clipboard
        navigator.clipboard.writeText(json).then(() => {
            alert('✅ Blog posts exported to clipboard!\n\nNext steps:\n1. Let your assistant know you\'ve clicked Export\n2. They will update the blog-posts.json file\n3. They will commit and push to GitHub\n4. Your posts will be live for everyone!');
        }).catch(err => {
            // Fallback: download as file
            console.error('Could not copy to clipboard:', err);
            window.BlogStorage.downloadBackup();
            alert('Blog posts downloaded as JSON file. Send this file to your assistant to sync to GitHub.');
        });
    }

    logout() {
        if (this.hasUnsavedChanges) {
            if (!confirm('You have unsaved changes. Are you sure you want to logout?')) {
                return;
            }
        }

        window.BlogAuth.logout();
        window.location.href = '../admin/index.html';
    }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new BlogEditor();
});

# Personal Portfolio Website

A modern, responsive portfolio website built with vanilla HTML, CSS, and JavaScript. Features smooth animations, dark mode, and a clean design perfect for showcasing engineering projects.

## Features

- **Modern Design** - Clean, professional layout with smooth animations
- **Fully Responsive** - Works beautifully on mobile, tablet, and desktop
- **Dark Mode** - Toggle between light and dark themes with localStorage persistence
- **Project Showcase** - Dynamic project loading from JSON with filtering
- **Blog-Ready** - Template for blog posts and articles
- **Performance Optimized** - Fast loading with lazy images and optimized animations
- **Accessible** - WCAG compliant with keyboard navigation support
- **SEO Friendly** - Proper meta tags and semantic HTML

## Quick Start

### Local Development

1. **Clone or download this repository**

2. **Start a local server**

   Using Python 3:
   ```bash
   python3 -m http.server 8000
   ```

   Using Node.js:
   ```bash
   npx serve
   ```

   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## Customization Guide

### 1. Update Personal Information

**Edit `index.html`:**
- Replace "Your Name" with your actual name
- Update the hero section text
- Modify the About section with your bio
- Add your contact information and social links
- Update meta tags (title, description, Open Graph tags)

### 2. Add Your Projects

**Edit `data/projects.json`:**

```json
{
  "projects": [
    {
      "id": "unique-project-id",
      "title": "Project Name",
      "description": "Brief one-line description",
      "longDescription": "Detailed project explanation",
      "technologies": ["JavaScript", "React", "Node.js"],
      "image": "assets/images/projects/your-project.jpg",
      "links": {
        "github": "https://github.com/yourusername/project",
        "demo": "https://demo.yoursite.com"
      },
      "category": "web",  // web, hardware, or software
      "featured": true,
      "date": "2024-01"
    }
  ]
}
```

**Add project images:**
- Place images in `assets/images/projects/`
- Recommended size: 800x600px
- Format: JPG or WebP for best performance

### 3. Customize Colors and Styling

**Edit `css/variables.css`:**

```css
:root {
    --color-primary: #3b82f6;      /* Main brand color */
    --color-secondary: #8b5cf6;     /* Accent color */
    --color-accent: #10b981;        /* Success/highlight color */
}
```

Change fonts in the same file:
```css
--font-family-primary: 'Your Font', sans-serif;
--font-family-heading: 'Your Heading Font', sans-serif;
```

### 4. Add Your Profile Picture

Replace the placeholder:
```
assets/images/profile/profile.jpg
```

Recommended: Square image, at least 400x400px

### 5. Update Skills

**Edit `index.html` in the About section:**

```html
<div class="skill-category">
    <h4>Your Category</h4>
    <ul class="skill-list">
        <li>Skill 1</li>
        <li>Skill 2</li>
        <li>Skill 3</li>
    </ul>
</div>
```

### 6. Configure Contact Form

The contact form currently logs to console. To make it functional:

**Option 1: Formspree (Easiest)**
1. Sign up at [formspree.io](https://formspree.io)
2. Get your form endpoint
3. Update `index.html`:
   ```html
   <form action="https://formspree.io/f/YOUR_ID" method="POST">
   ```

**Option 2: Netlify Forms**
Add to your form tag:
```html
<form name="contact" method="POST" data-netlify="true">
```

**Option 3: Custom Backend**
Update `js/main.js` in the `handleFormSubmit` function with your API endpoint.

## Adding Blog Posts

### 1. Create Post HTML

Create a new file in `blog/articles/`:
```
blog/articles/my-post-title.html
```

Use this template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Post Title | Your Name</title>
    <link rel="stylesheet" href="../../css/variables.css">
    <link rel="stylesheet" href="../../css/main.css">
    <link rel="stylesheet" href="../../css/components.css">
</head>
<body>
    <article class="blog-post">
        <header>
            <h1>Your Post Title</h1>
            <time>January 9, 2024</time>
        </header>

        <div class="post-content">
            <p>Your content here...</p>
        </div>
    </article>
</body>
</html>
```

### 2. Add to Blog Index

Create `blog/posts.json`:
```json
{
  "posts": [
    {
      "id": "my-post",
      "title": "Post Title",
      "date": "2024-01-09",
      "excerpt": "Brief description...",
      "tags": ["javascript", "tutorial"],
      "readTime": "5 min read",
      "image": "assets/images/blog/cover.jpg",
      "file": "blog/articles/my-post-title.html"
    }
  ]
}
```

## Project Structure

```
/
├── index.html              # Main page
├── blog.html              # Blog listing (optional)
├── css/
│   ├── variables.css      # Design tokens
│   ├── main.css          # Core styles
│   ├── components.css    # Component styles
│   ├── animations.css    # Animation definitions
│   └── responsive.css    # Media queries
├── js/
│   ├── main.js           # Core functionality
│   ├── navigation.js     # Navigation & scrolling
│   └── animations.js     # Scroll animations
├── data/
│   └── projects.json     # Project data
├── blog/
│   ├── posts.json        # Blog metadata
│   └── articles/         # Individual posts
├── assets/
│   ├── images/
│   │   ├── projects/     # Project images
│   │   ├── profile/      # Profile photo
│   │   └── blog/         # Blog images
│   └── icons/            # Favicons
└── README.md
```

## Deployment

### GitHub Pages

1. Create a new repository named `username.github.io`
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/username.github.io.git
   git push -u origin main
   ```
3. Access at: `https://username.github.io`

### Netlify

1. Drag and drop your folder to [Netlify](https://netlify.com)
2. Or connect your GitHub repository
3. Automatic deployments on every push
4. Free SSL and custom domain support

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts
4. Automatic deployments configured

## Performance Tips

1. **Optimize Images**
   - Use WebP format with JPG fallback
   - Compress images (use tools like TinyPNG)
   - Recommended dimensions:
     - Project images: 800x600px
     - Profile: 400x400px
     - Blog covers: 1200x630px

2. **Minimize HTTP Requests**
   - Keep CSS/JS files combined
   - Use CSS sprites for icons or inline SVGs

3. **Enable Caching**
   - Configure your hosting provider
   - Set appropriate cache headers

4. **Use a CDN**
   - For external libraries
   - For static assets in production

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

This portfolio follows WCAG 2.1 Level AA guidelines:
- Semantic HTML structure
- Keyboard navigation support
- ARIA labels where needed
- Sufficient color contrast
- Responsive text sizing
- Focus indicators
- Reduced motion support

## Customization Examples

### Change Primary Color

```css
/* css/variables.css */
:root {
    --color-primary: #10b981;  /* Green theme */
}
```

### Disable Dark Mode

Remove or comment out in `index.html`:
```html
<!-- Remove this button -->
<button class="theme-toggle" id="theme-toggle">
```

### Add More Sections

1. Add section to `index.html`
2. Add nav link
3. Style in `css/main.css`
4. Add to smooth scroll in `js/navigation.js`

### Change Animation Speed

```css
/* css/variables.css */
:root {
    --animation-duration-base: 200ms;  /* Faster */
    --animation-duration-slow: 400ms;  /* Faster */
}
```

## Troubleshooting

**Projects not loading?**
- Check browser console for errors
- Verify `data/projects.json` has valid JSON
- Ensure file paths are correct

**Images not showing?**
- Check file paths (case-sensitive on some servers)
- Verify images exist in `assets/images/`
- Check image file extensions match HTML

**Animations not working?**
- Check if browser supports Intersection Observer
- Verify `js/animations.js` is loaded
- Check browser console for errors

**Mobile menu not working?**
- Verify `js/navigation.js` is loaded
- Check browser console for errors
- Test in responsive mode (F12 → Toggle device toolbar)

## License

This project is open source and available for personal and commercial use. Feel free to modify and customize it for your needs.

## Credits

Built with vanilla HTML, CSS, and JavaScript. No frameworks, just modern web standards.

## Support

For issues or questions:
- Check existing issues in the repository
- Create a new issue with details
- Include browser version and error messages

## Future Enhancements

Ideas for extending this portfolio:
- Add CMS integration (Netlify CMS, Forestry)
- Implement blog search functionality
- Add project filtering by technology
- Create an admin panel for easy updates
- Add analytics integration
- Implement RSS feed for blog
- Add comments system (Disqus, utterances)
- Create multilingual support

---

**Happy coding! 🚀**

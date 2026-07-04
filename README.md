# WFM - Premium Glassmorphic Website

This project is a modern, responsive, and accessible landing page for a digital agency. It features a glassmorphic design aesthetic, fluid typography, and optimized performance.

## 📁 Project Structure

- `index.html` - Semantic HTML5 markup.
- `css/style.css` - Custom CSS properties, glassmorphism utilities, and responsive styles.
- `js/script.js` - Lightweight logic for mobile menu, animations, and form validation.

## ✨ Key Features

- **Glassmorphism**: `.glass-card` utility for frosted glass effects using `backdrop-filter`.
- **A11y First**: Keyboard navigation, ARIA attributes, and reduced-motion support.
- **Performance**: Zero external dependencies (only FontAwesome CDN and Google Fonts), optimized scroll handlers.
- **Responsive**: Mobile-first approach supporting devices from 320px to 4k.

## 🚀 How to Test

1. **Open locally**: Simply open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
2. **Performance Review**: Open DevTools (F12) -> Lighthouse -> "Analyze page load".
3. **Accessibility**: Use `Tab` to navigate through the site without a mouse.

## 🛠 Customization

Change the core colors in `css/style.css` under `:root`:

```css
:root {
    --color-primary: #6366f1; /* Brand Color */
    --color-accent: #2dd4bf;  /* Secondary Color */
}
```

## 📝 Performance Note

For production, consider converting existing images in `images/` to **WebP** format for faster load times.

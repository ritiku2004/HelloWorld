document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Logic
    const menuToggle = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('mobile-nav');
    const body = document.body;
    let isMenuOpen = false;

    // Trap focus inside menu when open
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else { // Tab
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        });
    }

    if (menuToggle && navLinks) {
        const toggleMenu = (open) => {
            isMenuOpen = open;
            navLinks.classList.toggle('active', open);
            menuToggle.setAttribute('aria-expanded', open);
            
            const icon = menuToggle.querySelector('i');
            if (open) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
                body.style.overflow = 'hidden'; 
                // Wait for transition then focus
                setTimeout(() => {
                    const firstLink = navLinks.querySelector('a');
                    if (firstLink) firstLink.focus();
                }, 100);
            } else {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-xmark');
                body.style.overflow = '';
                menuToggle.focus();
            }
        };

        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu(!navLinks.classList.contains('active'));
        });

        // Close on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                toggleMenu(false);
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (isMenuOpen && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                toggleMenu(false);
            }
        });

        trapFocus(navLinks);
    }

    // Scroll Effect for Navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        let ticked = false;
        window.addEventListener('scroll', () => {
            if (!ticked) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 20) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                    ticked = false;
                });
                ticked = true;
            }
        });
    }

    // FAQ Accordion (Single Open)
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const button = item.querySelector('.faq-button');
        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            
            // Close all
            faqItems.forEach(otherItem => {
                const otherBtn = otherItem.querySelector('.faq-button');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                otherBtn.setAttribute('aria-expanded', 'false');
                otherAnswer.style.maxHeight = null;
            });

            // Toggle current if it wasn't already open
            if (!isExpanded) {
                button.setAttribute('aria-expanded', 'true');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // Intersection Observer for Animations
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); 
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    } else {
        // If reduced motion, just show everything immediately
        document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
    }

    // Simple Contact Form Validation
    const contactForm = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Add native validation check
            if (!contactForm.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                // Browsers usually handle UI, but we can add custom logic here
                return;
            }

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            
            // Simulation of sending
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Sending...';
            btn.disabled = true;

            setTimeout(() => {
                feedback.className = 'feedback-msg success';
                feedback.innerHTML = `<i class="fa-solid fa-check"></i> Thanks ${name}! We'll be in touch at ${email} shortly.`;
                contactForm.reset();
                btn.innerText = originalText;
                btn.disabled = false;
                
                // Remove message after 5 seconds
                setTimeout(() => {
                    feedback.style.display = 'none';
                    feedback.className = 'feedback-msg'; 
                }, 5000);
            }, 1000);
        });
    }
});

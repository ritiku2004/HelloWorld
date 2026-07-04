document.addEventListener('DOMContentLoaded', () => {
    // Intro Overlay Logic
    const introOverlay = document.getElementById('intro-overlay');
    const enterBtn = document.getElementById('enter-site-btn');
    const bgMusic = document.getElementById('bg-music');
    const body = document.body;

    if (introOverlay && enterBtn) {
        // Lock scroll initially
        body.style.overflow = 'hidden';

        enterBtn.addEventListener('click', () => {
            // Scroll to top instantly
            window.scrollTo({ top: 0, behavior: 'instant' });

            // Fade out overlay
            introOverlay.classList.add('hidden');
            body.style.overflow = ''; // Unlock scroll

            // Play Music
            if (bgMusic) {
                bgMusic.volume = 0.5; // Set reasonable volume
                bgMusic.play().catch(e => console.log('Audio autoplay prevented:', e));
            }

            // Remove overlay from DOM after transition (1.5s) to free up resources
            setTimeout(() => {
                introOverlay.remove();
            }, 1600);
        });
    }

    // Mobile Menu Logic
    const menuToggle = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('mobile-nav');

    let isMenuOpen = false;

    // Trap focus inside menu when open
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function (e) {
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
                // Wait for animation to finish before restoring scroll
                setTimeout(() => {
                    if (!isMenuOpen) {
                        body.style.overflow = '';
                    }
                }, 400);
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
    const faqCards = document.querySelectorAll('.faq-card');
    faqCards.forEach(card => {
        const button = card.querySelector('.faq-button');
        if (!button) return;

        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            // Close all
            faqCards.forEach(otherCard => {
                const otherBtn = otherCard.querySelector('.faq-button');
                const otherAnswer = otherCard.querySelector('.faq-answer');
                if (otherBtn && otherAnswer) {
                    otherBtn.setAttribute('aria-expanded', 'false');
                    otherCard.setAttribute('data-expanded', 'false');
                    otherAnswer.style.maxHeight = null;
                }
            });

            // Toggle current if it wasn't already open
            if (!isExpanded) {
                button.setAttribute('aria-expanded', 'true');
                card.setAttribute('data-expanded', 'true');
                const answer = card.querySelector('.faq-answer');
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
            // Simulation of sending
            const btn = contactForm.querySelector('button[type="submit"]');
            const btnText = btn.querySelector('.btn-text');
            const originalText = btnText ? btnText.innerText : 'Send Message';

            if (btnText) btnText.innerText = 'Sending...';
            btn.disabled = true;

            setTimeout(() => {
                feedback.className = 'feedback-msg success';
                feedback.innerHTML = `<i class="fa-solid fa-check"></i> Thanks ${name}! We'll be in touch at ${email} shortly.`;
                contactForm.reset();
                if (btnText) btnText.innerText = originalText;
                btn.disabled = false;

                // Remove message after 5 seconds
                setTimeout(() => {
                    feedback.style.display = 'none';
                    feedback.className = 'feedback-msg';
                }, 5000);
            }, 1000);
        });
    }

    // Back to Top Logic
    const backTopBtn = document.getElementById('back-to-top');
    if (backTopBtn) {
        backTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Custom Right Click Toast Logic ---
    const contextToast = document.getElementById('context-toast');
    let toastTimeout;

    if (contextToast) {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Disable default menu

            // Clear existing timeout
            clearTimeout(toastTimeout);

            // Position toast at mouse coordinates
            let x = e.clientX;
            let y = e.clientY;

            // Simple overflow check (assuming approx toast size)
            // If near right edge, shift left
            if (x + 300 > window.innerWidth) {
                x = window.innerWidth - 320;
            }
            // If near bottom, shift up
            if (y + 100 > window.innerHeight) {
                y = window.innerHeight - 120;
            }

            contextToast.style.left = `${x}px`;
            contextToast.style.top = `${y}px`;
            contextToast.classList.add('active');

            // Auto hide after 3.5 seconds
            toastTimeout = setTimeout(() => {
                contextToast.classList.remove('active');
            }, 3500);
        });

        // Hide on any regular click
        document.addEventListener('click', () => {
            contextToast.classList.remove('active');
        });

        // Hide on scroll
        window.addEventListener('scroll', () => {
            contextToast.classList.remove('active');
        }, { passive: true });
    }

    // --- Projects Showcase Filter Logic ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length && projectCards.length) {
        const filterProjects = (filterValue) => {
            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');

                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.style.display = 'flex';
                    card.classList.remove('fade-out');
                    card.classList.add('fade-in');
                } else {
                    card.classList.remove('fade-in');
                    card.classList.add('fade-out');
                    setTimeout(() => {
                        if (card.classList.contains('fade-out')) {
                            card.style.display = 'none';
                        }
                    }, 300);
                }
            });
        };

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');
                filterProjects(filterValue);
            });
        });

        // Initialize active filter on page load
        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) {
            const initialFilter = activeBtn.getAttribute('data-filter');
            if (initialFilter !== 'all') {
                filterProjects(initialFilter);
            }
        }
    }

}); // End DOMContentLoaded

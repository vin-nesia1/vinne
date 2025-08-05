document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const header = document.getElementById('main-header');

    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Language Selector with Data Attributes
    const langButtons = document.querySelectorAll('.lang-button');
    
    // Function to set the language of the page
    function setLanguage(lang) {
        // Set the main document language attribute
        document.documentElement.lang = lang;
        
        // Update meta tags' content based on language
        document.querySelectorAll('meta[data-lang-en]').forEach(meta => {
            const translation = meta.getAttribute(`data-lang-${lang}`);
            if (translation) {
                meta.setAttribute('content', translation);
            }
        });

        // Update all other elements with data-lang attributes
        document.querySelectorAll('[data-lang-en]').forEach(el => {
            const translation = el.getAttribute(`data-lang-${lang}`);
            // Check if element has an alt or placeholder attribute to be translated
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else if (el.tagName === 'IMG') {
                el.alt = translation;
            } else if (el.tagName === 'A' || el.tagName === 'BUTTON') {
                el.textContent = translation;
            } else {
                el.innerHTML = translation;
            }
        });

        // Update active state for language buttons
        langButtons.forEach(btn => btn.classList.remove('active'));
        document.getElementById(`lang-${lang}`).classList.add('active');
        localStorage.setItem('lang', lang);
    }
    
    // Set initial language from local storage or default to 'id'
    const savedLang = localStorage.getItem('lang') || 'id';
    setLanguage(savedLang);

    // Add event listeners to language buttons
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.id.split('-')[1];
            setLanguage(lang);
        });
    });

    // Tool Card Loading & Scroll-Triggered Animations
    const toolCards = document.querySelectorAll('.tool-card');
    const statsSection = document.querySelector('.stats-section');
    const statsCards = document.querySelectorAll('.stats-section .stat-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Staggered loading for tool cards
                if (entry.target.classList.contains('tool-card')) {
                    setTimeout(() => {
                        entry.target.classList.add('loaded');
                        observer.unobserve(entry.target);
                    }, Math.random() * 500); 
                }
                // Staggered animation for stats cards
                if (entry.target === statsSection) {
                    statsCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('visible');
                        }, index * 200); 
                    });
                    
                    animateCounter(document.getElementById('user-counter'), 125432, 2000);
                    animateCounter(document.getElementById('tool-usage-stats'), 8765, 2000);
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.2 });

    toolCards.forEach(card => observer.observe(card));
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Animate Counter function
    function animateCounter(element, target, duration) {
        let start = 0;
        const step = (target / duration) * 10;
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                start = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(start).toLocaleString();
        }, 10);
    }

    // Ripple effect for buttons
    const rippleButtons = document.querySelectorAll('.ripple');
    rippleButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            const circle = document.createElement('span');
            const diameter = Math.max(this.clientWidth, this.clientHeight);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - this.offsetLeft - radius}px`;
            circle.style.top = `${e.clientY - this.offsetTop - radius}px`;
            circle.classList.add('ripple-effect');

            const ripple = this.getElementsByClassName('ripple-effect')[0];
            if (ripple) {
                ripple.remove();
            }
            this.appendChild(circle);
        });
    });

    // Cookie consent banner
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptButton = document.getElementById('accept-cookies');
    const hasAcceptedCookies = localStorage.getItem('cookiesAccepted');
    if (hasAcceptedCookies === 'true') {
        cookieBanner.style.display = 'none';
    }
    acceptButton.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.style.display = 'none';
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

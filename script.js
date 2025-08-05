// VIN NESIA - Main Javascript
// =============================

document.addEventListener('DOMContentLoaded', () => {
    // === Variables ===
    const body = document.body;
    const loadingScreen = document.getElementById('loading-screen');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const searchToggleBtn = document.getElementById('search-toggle');
    const searchOverlay = document.getElementById('search-overlay');
    const searchCloseBtn = document.getElementById('search-close');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const backToTopBtn = document.getElementById('back-to-top');
    const progressBar = document.querySelector('.progress-bar');
    const sections = document.querySelectorAll('.fade-in-section');
    const statItems = document.querySelectorAll('.stat-item');
    const toolCards = document.querySelectorAll('.tool-card');
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAcceptBtn = document.getElementById('cookie-accept');
    const cookieRejectBtn = document.getElementById('cookie-reject');

    // === Initial Setup ===
    function setInitialTheme() {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            body.setAttribute('data-theme', storedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            body.setAttribute('data-theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
        }
    }
    setInitialTheme();

    // Hide loading screen after 1 second
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 1000);

    // === Event Listeners ===

    // Theme Toggle
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Search Toggle
    if (searchToggleBtn && searchOverlay && searchCloseBtn) {
        searchToggleBtn.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            setTimeout(() => {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }, 300);
        });

        searchCloseBtn.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });

        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
            }
        });
    }

    // Mobile Menu Toggle
    if (mobileMenuBtn && mobileMenu && mobileMenuClose) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('mobile-menu')) {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }

    // Back to top button
    window.addEventListener('scroll', () => {
        if (backToTopBtn) {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Page progress bar
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / scrollHeight) * 100;
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }
    });

    // Intersection Observer for fade-in sections
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Intersection Observer for tool cards
    const cardObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, cardObserverOptions);

    toolCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        cardObserver.observe(card);
    });

    // Intersection Observer for stats counter
    const statObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const number = entry.target.querySelector('.stat-number');
                if (number) {
                    animateValue(number, 0, number.getAttribute('data-val'), 1500);
                }
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, statObserverOptions);

    statItems.forEach(item => {
        statObserver.observe(item);
    });

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerText = Math.floor(progress * (end - start) + start).toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Cookie Banner
    function showCookieBanner() {
        if (!localStorage.getItem('cookieConsent')) {
            setTimeout(() => {
                if (cookieBanner) {
                    cookieBanner.classList.add('show');
                }
            }, 2000);
        }
    }

    if (cookieAcceptBtn) {
        cookieAcceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieBanner.classList.remove('show');
        });
    }

    if (cookieRejectBtn) {
        cookieRejectBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'rejected');
            cookieBanner.classList.remove('show');
        });
    }

    showCookieBanner();

    // Smooth scroll for nav links (optional)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Theme toggle icon update based on initial theme (optional)
    const updateThemeIcon = () => {
        const currentTheme = body.getAttribute('data-theme');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    };
    updateThemeIcon();
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', updateThemeIcon);
    }

    // Attach ripple effect to buttons
    const buttons = document.querySelectorAll('.ripple');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const circle = document.createElement('span');
            const diameter = Math.max(this.clientWidth, this.clientHeight);
            const radius = diameter / 2;
            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - (this.offsetLeft + radius)}px`;
            circle.style.top = `${e.clientY - (this.offsetTop + radius)}px`;
            circle.classList.add('ripple-effect');
            this.appendChild(circle);
            setTimeout(() => circle.remove(), 600);
        });
    });

    // Language toggle functionality (optional, for demo)
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

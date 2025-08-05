// Analytics and Tracking
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXX');

    // Feather Icons
    feather.replace();

    // Utility Functions
    const get = (selector, parent = document) => parent.querySelector(selector);
    const getAll = (selector, parent = document) => parent.querySelectorAll(selector);

    // DOM Elements
    const body = get('body');
    const loadingScreen = get('.loading-screen');
    const progressBar = get('#progressBar');
    const cookieBanner = get('#cookie-banner');
    const cookieAcceptBtn = get('#cookie-accept');
    const cookieRejectBtn = get('#cookie-reject');
    const themeToggleBtn = get('#theme-toggle');
    const desktopNavLinks = getAll('.nav-desktop a');
    const langToggle = get('.lang-toggle');
    const langBtns = getAll('.lang-btn');
    const searchToggleBtn = get('#search-toggle');
    const searchOverlay = get('#search-overlay');
    const searchInput = get('#search-input');
    const searchCloseBtn = get('#search-close');
    const mobileMenuBtn = get('#mobile-menu-btn');
    const mobileMenu = get('#mobile-menu');
    const mobileOverlay = get('#mobile-overlay');
    const mobileMenuCloseBtn = get('#mobile-menu-close');
    const mobileNavLinks = getAll('.mobile-nav a');
    const mobileLogoText = get('.mobile-logo-text');
    const userInfo = get('#user-info');
    const userDropdown = get('#user-dropdown');
    const logoutBtn = get('#logout-btn');
    const newsletterForm = get('#newsletter-form');
    const revealElements = getAll('.reveal');

    // Initializations
    document.addEventListener('DOMContentLoaded', () => {
        body.classList.remove('overflow-hidden');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        checkCookieConsent();
        setInitialTheme();
        setInitialLanguage();
        setupEventListeners();
        animateRevealElements();
        updateProgressBar();
        startStatsAnimation();
    });

    function setupEventListeners() {
        if (cookieAcceptBtn) cookieAcceptBtn.addEventListener('click', acceptCookie);
        if (cookieRejectBtn) cookieRejectBtn.addEventListener('click', rejectCookie);
        if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
        if (langToggle) langToggle.addEventListener('click', handleLanguageChange);
        if (searchToggleBtn) searchToggleBtn.addEventListener('click', toggleSearchOverlay);
        if (searchCloseBtn) searchCloseBtn.addEventListener('click', toggleSearchOverlay);
        if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        if (mobileMenuCloseBtn) mobileMenuCloseBtn.addEventListener('click', toggleMobileMenu);
        if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMobileMenu);
        if (searchInput) searchInput.addEventListener('input', handleSearch);
        window.addEventListener('scroll', updateProgressBar);
        window.addEventListener('scroll', handleRevealElements);
        if (userInfo) userInfo.addEventListener('click', toggleUserDropdown);
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (newsletterForm) newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        document.addEventListener('click', handleGlobalClick);
    }

    // Theme Logic
    function setInitialTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = savedTheme === 'dark' ? '<span class="icon-sun"></span>' : '<span class="icon-moon"></span>';
            themeToggleBtn.setAttribute('aria-label', `Switch to ${savedTheme === 'dark' ? 'light' : 'dark'} theme`);
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = newTheme === 'dark' ? '<span class="icon-sun"></span>' : '<span class="icon-moon"></span>';
            themeToggleBtn.setAttribute('aria-label', `Switch to ${newTheme === 'dark' ? 'light' : 'dark'} theme`);
        }
    }

    // Language Logic
    function setInitialLanguage() {
        const savedLang = localStorage.getItem('lang') || 'id';
        const activeBtn = get(`.lang-btn[data-lang="${savedLang}"]`);
        if (activeBtn) {
            langBtns.forEach(btn => btn.classList.remove('active'));
            activeBtn.classList.add('active');
        }
    }

    function handleLanguageChange(event) {
        if (event.target.classList.contains('lang-btn')) {
            const newLang = event.target.dataset.lang;
            localStorage.setItem('lang', newLang);
            langBtns.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            alert(`Language changed to ${newLang.toUpperCase()}. This feature is a placeholder.`);
        }
    }

    // Search Logic
    function toggleSearchOverlay() {
        searchOverlay.classList.toggle('active');
        if (searchOverlay.classList.contains('active')) {
            setTimeout(() => searchInput.focus(), 300);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function handleSearch(event) {
        const query = event.target.value.toLowerCase();
        const resultsContainer = get('#search-results');
        resultsContainer.innerHTML = '';
        const allTools = [
            { name: 'Password Generator', url: '/password-generator', keywords: 'password, generate, security' },
            { name: 'QR Code Scanner', url: '/qr-code-scanner', keywords: 'qr, scanner, code, barcode' },
            { name: 'Image Converter', url: '/image-converter', keywords: 'image, convert, jpg, png, webp' },
            { name: 'Currency Calculator', url: '/currency-calculator', keywords: 'currency, calculator, rates, money' },
            { name: 'JSON Formatter', url: '/json-formatter', keywords: 'json, formatter, code, validate' },
            { name: 'Base64 Converter', url: '/base64-converter', keywords: 'base64, encode, decode' },
        ];

        const filteredTools = allTools.filter(tool => 
            tool.name.toLowerCase().includes(query) || tool.keywords.toLowerCase().includes(query)
        );

        if (filteredTools.length > 0) {
            filteredTools.forEach(tool => {
                const resultItem = document.createElement('a');
                resultItem.href = tool.url;
                resultItem.className = 'block p-4 border-b border-border hover:bg-bg-hover transition-colors';
                resultItem.innerHTML = `<h4 class="text-text-primary font-semibold">${tool.name}</h4><p class="text-text-secondary text-sm">${tool.description || ''}</p>`;
                resultsContainer.appendChild(resultItem);
            });
        } else {
            resultsContainer.innerHTML = '<p class="p-4 text-center text-text-muted">No results found.</p>';
        }
    }

    // Mobile Menu Logic
    function toggleMobileMenu() {
        mobileMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMobileMenu();
        });
    });

    // User Dropdown Logic
    function toggleUserDropdown() {
        userDropdown.classList.toggle('show');
    }

    function handleLogout() {
        alert('Logging out... (This is a placeholder)');
        userDropdown.classList.remove('show');
    }

    // Cookie Consent
    function checkCookieConsent() {
        const consent = Cookies.get('cookie_consent');
        if (consent === 'accepted' || consent === 'rejected') {
            cookieBanner.classList.remove('show');
        } else {
            cookieBanner.classList.add('show');
        }
    }

    function acceptCookie() {
        Cookies.set('cookie_consent', 'accepted', { expires: 365 });
        cookieBanner.classList.remove('show');
        alert('Cookies accepted!');
    }

    function rejectCookie() {
        Cookies.set('cookie_consent', 'rejected', { expires: 365 });
        cookieBanner.classList.remove('show');
        alert('Cookies rejected!');
    }

    // Progress Bar
    function updateProgressBar() {
        if (!progressBar) return;
        const scrollPercent = (document.documentElement.scrollTop + document.body.scrollTop) / 
                            (document.documentElement.scrollHeight - document.documentElement.clientHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    }

    // Animation on Scroll
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    function handleRevealElements() {
        revealElements.forEach(el => observer.observe(el));
    }

    // Stats Animation
    const statsObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startStatsAnimation();
                statsObserver.disconnect(); // Stop observing once animated
            }
        });
    }, { threshold: 0.5 });

    function startStatsAnimation() {
        const statItems = getAll('.stat-item');
        statItems.forEach(item => {
            const target = parseInt(item.dataset.target);
            const counter = get('.stat-number', item);
            let current = 0;
            const increment = target / 200; // Adjust speed here

            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.round(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            updateCounter();
        });
    }

    const statsSection = get('.stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
    
    // Global Click Handler for dropdowns
    function handleGlobalClick(event) {
        if (userDropdown && userInfo && !userInfo.contains(event.target) && !userDropdown.contains(event.target)) {
            userDropdown.classList.remove('show');
        }
    }

    // Newsletter Form
    function handleNewsletterSubmit(event) {
        event.preventDefault();
        const emailInput = get('.newsletter-input');
        const email = emailInput.value;
        if (email) {
            alert(`Subscribing ${email} to the newsletter... (This is a placeholder)`);
            emailInput.value = '';
        }
    }

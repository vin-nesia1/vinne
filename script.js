'use strict';

/**
 * VIN NESIA - Professional Online Tools
 * Main JavaScript File
 * ==============================================
 * Refactored for performance, accessibility, and maintainability.
 */

// --- CONFIGURATION ---
const CONFIG = {
    supabase: {
        url: 'https://your-project.supabase.co', // Ganti dengan URL Supabase Anda
        anonKey: 'your-anon-key' // Ganti dengan kunci anon Supabase Anda
    },
    analytics: {
        gtag: 'G-3PYZXZFNER' // ID Google Analytics Anda
    },
    ui: {
        animationDuration: 300,
        toastDuration: 5000,
        scrollThreshold: 200,
        lazyLoadOffset: '200px'
    },
    pwa: {
        enabled: true,
        serviceWorkerPath: '/sw.js'
    }
};

// --- APPLICATION STATE ---
const AppState = {
    user: null,
    isOnline: navigator.onLine,
    currentLanguage: 'en',
    currentTheme: 'dark',
    isMenuOpen: false,
    isSearchOpen: false,
    isModalOpen: false,
};

// --- DOM ELEMENT CACHE ---
const DOM = {};

/**
 * Caches frequently accessed DOM elements.
 */
function cacheDOMElements() {
    const elementSelectors = {
        loadingScreen: '#loading-screen',
        progressBar: '#progress-bar',
        cookieBanner: '#cookie-banner',
        cookieAcceptBtn: '#cookie-accept',
        cookieRejectBtn: '#cookie-reject',
        header: 'header',
        themeToggle: '#theme-toggle',
        langEnBtn: '#lang-en',
        langIdBtn: '#lang-id',
        searchToggle: '#search-toggle',
        searchOverlay: '#search-overlay',
        searchInput: '#search-input',
        searchClose: '#search-close',
        searchResults: '#search-results',
        mobileMenuBtn: '#mobile-menu-btn',
        mobileMenu: '#mobile-menu',
        mobileOverlay: '#mobile-overlay',
        mobileMenuClose: '#mobile-menu-close',
        authButtons: '#auth-buttons',
        loginBtn: '#login-btn',
        userInfo: '#user-info',
        userName: '#user-name',
        userAvatar: '#user-avatar',
        userMenuToggle: '#user-menu-toggle',
        userDropdown: '#user-dropdown',
        logoutBtn: '#logout-btn',
        notificationContainer: '#notification-container',
        backToTop: '#back-to-top',
        offlineIndicator: '#offline-indicator',
        dynamicContent: '#dynamic-content',
        footer: 'footer',
    };

    for (const key in elementSelectors) {
        DOM[key] = document.querySelector(elementSelectors[key]);
    }
}

// --- UTILITY FUNCTIONS ---

/**
 * Debounces a function to limit the rate at which it gets called.
 * @param {Function} func The function to debounce.
 * @param {number} delay The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, delay = 250) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Tracks an event with Google Analytics.
 * @param {string} action The event action.
 * @param {string} category The event category.
 * @param {string} label The event label.
 */
function trackEvent(action, category, label) {
    if (window.gtag) {
        window.gtag('event', action, {
            'event_category': category,
            'event_label': label,
        });
    }
}

// --- CORE MODULES ---

const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme, false);
        DOM.themeToggle?.addEventListener('click', () => this.toggleTheme());
    },
    setTheme(theme, track = true) {
        AppState.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateIcon();
        if (track) {
            trackEvent('toggle_theme', 'UI', theme);
        }
    },
    toggleTheme() {
        const newTheme = AppState.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },
    updateIcon() {
        if (!DOM.themeToggle) return;
        const icon = DOM.themeToggle.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = AppState.currentTheme === 'dark' ? '🌙' : '☀️';
        }
    }
};

const LanguageManager = {
    init() {
        const savedLang = localStorage.getItem('language') || 'en';
        this.setLanguage(savedLang, false);
        DOM.langEnBtn?.addEventListener('click', () => this.setLanguage('en'));
        DOM.langIdBtn?.addEventListener('click', () => this.setLanguage('id'));
    },
    setLanguage(lang, track = true) {
        AppState.currentLanguage = lang;
        document.documentElement.lang = lang;
        localStorage.setItem('language', lang);

        document.querySelectorAll('[data-lang]').forEach(el => {
            el.style.display = el.dataset.lang === lang ? '' : 'none';
        });

        DOM.langEnBtn?.classList.toggle('active', lang === 'en');
        DOM.langIdBtn?.classList.toggle('active', lang === 'id');
        DOM.langEnBtn?.setAttribute('aria-pressed', lang === 'en');
        DOM.langIdBtn?.setAttribute('aria-pressed', lang === 'id');

        if (track) {
            trackEvent('change_language', 'UI', lang);
        }
    }
};

const ScrollManager = {
    init() {
        window.addEventListener('scroll', this.handleScroll, { passive: true });
        DOM.backToTop?.addEventListener('click', this.scrollToTop);
    },
    handleScroll() {
        const scrollY = window.scrollY;
        
        // Progress Bar
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollY / docHeight) * 100;
        DOM.progressBar.style.width = `${progress}%`;

        // Back to Top Button
        DOM.backToTop?.toggleAttribute('hidden', scrollY < CONFIG.ui.scrollThreshold);
    },
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackEvent('click', 'Navigation', 'Back to Top');
    }
};

const LazyLoader = {
    init() {
        this.lazyLoadSections();
        this.lazyLoadImages();
    },
    createObserver(callback) {
        return new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: CONFIG.ui.lazyLoadOffset });
    },
    lazyLoadSections() {
        const observer = this.createObserver(this.loadSection);
        if (DOM.dynamicContent) {
            observer.observe(DOM.dynamicContent);
        }
    },
    async loadSection(target) {
        // In a real app, you would fetch this content. Here we'll just unhide it.
        // For demonstration, we'll create the content dynamically.
        const statsHTML = `
            <section class="stats" role="region" aria-label="Statistics">
                <div class="stats-container container">
                    <!-- Stat items will be added here -->
                </div>
            </section>`;
        const toolsHTML = `
            <section class="tools" id="tools" role="region" aria-label="Tools">
                <div class="tools-container container">
                    <div class="section-header">
                        <h2 class="section-title" data-lang="en">Popular Tools</h2>
                        <h2 class="section-title" data-lang="id" style="display: none;">Tools Populer</h2>
                        <p class="section-subtitle" data-lang="en">Discover our most loved tools.</p>
                        <p class="section-subtitle" data-lang="id" style="display: none;">Temukan tools yang paling kami sukai.</p>
                    </div>
                    <div class="tools-grid" role="list">
                        <!-- Tool cards will be added here -->
                    </div>
                </div>
            </section>`;
        
        target.innerHTML = statsHTML + toolsHTML;
        LanguageManager.setLanguage(AppState.currentLanguage, false); // Re-apply language
        AnimationManager.initStats();
        AnimationManager.initToolCards();
    },
    lazyLoadImages() {
        const observer = this.createObserver(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
        document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
    }
};

const AnimationManager = {
    init() {
        // Initial animations can be triggered here if needed
    },
    initStats() {
        const statsContainer = document.querySelector('.stats-container');
        if (!statsContainer) return;

        const statsData = [
            { count: 150000, labelEn: 'Happy Users', labelId: 'Pengguna Senang' },
            { count: 6, labelEn: 'Powerful Tools', labelId: 'Tools Canggih' },
            { count: 99, labelEn: '% Uptime', labelId: '% Waktu Aktif' },
            { count: 24, labelEn: '/ 7 Support', labelId: '/ 7 Dukungan' }
        ];

        statsData.forEach(stat => {
            const item = document.createElement('div');
            item.className = 'stat-item';
            item.innerHTML = `
                <span class="stat-number" data-count="${stat.count}">0</span>
                <span class="stat-label" data-lang="en">${stat.labelEn}</span>
                <span class="stat-label" data-lang="id" style="display: none;">${stat.labelId}</span>
            `;
            statsContainer.appendChild(item);
        });
        
        const observer = LazyLoader.createObserver(this.animateStat);
        document.querySelectorAll('.stat-item').forEach(item => observer.observe(item));
    },
    animateStat(item) {
        item.classList.add('visible');
        const numberEl = item.querySelector('.stat-number');
        const target = parseInt(numberEl.dataset.count, 10);
        let current = 0;
        const duration = 2000;
        const stepTime = 20;
        const increment = target / (duration / stepTime);

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                clearInterval(timer);
                numberEl.textContent = target.toLocaleString();
            } else {
                numberEl.textContent = Math.floor(current).toLocaleString();
            }
        }, stepTime);
    },
    initToolCards() {
        // This would be populated from an API in a real app
        const toolsData = [
            { titleEn: 'Password Generator', titleId: 'Generator Password', descEn: 'Generate strong, secure passwords.', descId: 'Buat password yang kuat dan aman.', features: ['Secure', 'Customizable'] },
            { titleEn: 'QR Code Scanner', titleId: 'Pemindai Kode QR', descEn: 'Scan QR codes instantly.', descId: 'Pindai kode QR secara instan.', features: ['Camera', 'Instant'] },
            { titleEn: 'Image Converter', titleId: 'Konverter Gambar', descEn: 'Convert images between formats.', descId: 'Konversi gambar antar format.', features: ['Multi-format', 'Batch'] },
        ];
        
        const grid = document.querySelector('.tools-grid');
        if(!grid) return;
        
        toolsData.forEach(tool => {
            const card = document.createElement('a');
            card.href = '#'; // Placeholder
            card.className = 'tool-card';
            card.setAttribute('role', 'listitem');
            card.innerHTML = `
                <div class="tool-icon" aria-hidden="true">🔐</div>
                <h3 class="tool-title"><span data-lang="en">${tool.titleEn}</span><span data-lang="id" style="display:none">${tool.titleId}</span></h3>
                <p class="tool-description"><span data-lang="en">${tool.descEn}</span><span data-lang="id" style="display:none">${tool.descId}</span></p>
                <div class="tool-features">${tool.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}</div>
            `;
            grid.appendChild(card);
        });

        const observer = LazyLoader.createObserver(card => card.classList.add('visible'));
        document.querySelectorAll('.tool-card').forEach(card => observer.observe(card));
    }
};


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    cacheDOMElements();
    
    // Hide loader immediately
    DOM.loadingScreen?.setAttribute('hidden', 'true');

    ThemeManager.init();
    LanguageManager.init();
    ScrollManager.init();
    LazyLoader.init();
    AnimationManager.init();

    // Event listeners
    DOM.searchToggle?.addEventListener('click', () => {
        DOM.searchOverlay?.toggleAttribute('hidden');
        DOM.searchInput?.focus();
    });
    DOM.searchClose?.addEventListener('click', () => DOM.searchOverlay?.setAttribute('hidden', 'true'));
    
    DOM.mobileMenuBtn?.addEventListener('click', () => {
        const isExpanded = DOM.mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        DOM.mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        DOM.mobileMenu?.toggleAttribute('hidden');
    });

    console.log('VIN NESIA Initialized');
});

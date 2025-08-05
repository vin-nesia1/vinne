/**
 * VIN NESIA - Professional Online Tools
 * Main JavaScript File
 * ==============================================
 */

'use strict';

// Configuration
const CONFIG = {
    supabase: {
        url: 'https://your-project.supabase.co', // Replace with your Supabase URL
        anonKey: 'your-anon-key' // Replace with your Supabase anon key
    },
    analytics: {
        gtag: 'G-3PYZXZFNER' // Your Google Analytics ID
    },
    features: {
        enablePWA: true,
        enableNotifications: true,
        enableOfflineMode: true,
        enableAnalytics: true
    },
    ui: {
        animationDuration: 300,
        toastDuration: 5000,
        scrollThreshold: 100
    }
};

// Global Variables
let supabaseClient = null;
let currentLanguage = 'en';
let currentTheme = 'dark';
let isOnline = navigator.onLine;
let statsAnimated = false;
let searchTimeout = null;
let userMenuTimeout = null;

// Application State
const AppState = {
    user: null,
    isLoading: false,
    modals: {
        login: false,
        donation: false,
        search: false
    },
    notifications: [],
    stats: {
        users: 150000,
        tools: 6,
        uptime: 99,
        support: 24
    }
};

// DOM Elements Cache
const DOM = {};

// Error Handler
class ErrorHandler {
    static log(error, context = '') {
        console.error(`[VIN NESIA Error] ${context}:`, error);
        
        if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                'description': error.message || error,
                'fatal': false,
                'custom_map': { 'context': context }
            });
        }
    }

    static handle(error, userMessage = 'An error occurred. Please try again.') {
        this.log(error);
        NotificationManager.show(userMessage, 'error');
    }

    static async handleAsync(asyncFn, errorMessage = 'Operation failed') {
        try {
            return await asyncFn();
        } catch (error) {
            this.handle(error, errorMessage);
            return null;
        }
    }
}

// Notification Manager
class NotificationManager {
    static show(message, type = 'info', duration = CONFIG.ui.toastDuration) {
        const container = DOM.notificationContainer;
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');

        container.appendChild(notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto remove
        setTimeout(() => {
            this.remove(notification);
        }, duration);

        // Store in state
        AppState.notifications.push({
            id: Date.now(),
            message,
            type,
            element: notification
        });

        return notification;
    }

    static remove(notification) {
        if (!notification || !notification.parentNode) return;

        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, CONFIG.ui.animationDuration);

        // Remove from state
        AppState.notifications = AppState.notifications.filter(
            n => n.element !== notification
        );
    }

    static clearAll() {
        AppState.notifications.forEach(notification => {
            this.remove(notification.element);
        });
    }
}

// Theme Manager
class ThemeManager {
    static init() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
        this.updateIcon();
    }

    static setTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateIcon();
        
        // Track theme change
        this.trackEvent('theme_change', theme);
    }

    static toggleTheme() {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    static updateIcon() {
        const themeToggle = DOM.themeToggle;
        if (themeToggle) {
            const icon = currentTheme === 'dark' ? '🌙' : '☀️';
            themeToggle.querySelector('.theme-icon').textContent = icon;
        }
    }

    static trackEvent(action, theme) {
        if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'Theme',
                'event_label': theme,
                'value': 1
            });
        }
    }
}

// Language Manager
class LanguageManager {
    static init() {
        const savedLanguage = localStorage.getItem('language') || 'en';
        this.setLanguage(savedLanguage);
    }

    static setLanguage(lang) {
        currentLanguage = lang;

        // Update button states
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === `lang-${lang}`);
            btn.setAttribute('aria-pressed', btn.id === `lang-${lang}` ? 'true' : 'false');
        });

        // Show/hide elements based on language
        document.querySelectorAll('[data-lang]').forEach(element => {
            element.style.display = element.getAttribute('data-lang') === lang ? '' : 'none';
        });

        // Update document language
        document.documentElement.lang = lang;

        // Update page title
        this.updatePageTitle(lang);

        // Save to localStorage
        localStorage.setItem('language', lang);

        // Track language change
        this.trackEvent('language_change', lang);

        console.log(`Language changed to: ${lang}`);
    }

    static updatePageTitle(lang) {
        const titles = {
            en: 'VIN NESIA - Professional Online Tools | Free Web Utilities',
            id: 'VIN NESIA - Alat Online Profesional | Utilitas Web Gratis'
        };
        document.title = titles[lang] || titles.en;
    }

    static trackEvent(action, language) {
        if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'Language',
                'event_label': language,
                'value': 1
            });
        }
    }
}

// Authentication Manager
class AuthManager {
    static async init() {
        if (!supabaseClient) return;

        try {
            // Check current session
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error) throw error;

            if (session?.user) {
                this.handleAuthSuccess(session.user);
            } else {
                this.showAuthButtons();
            }

            // Listen for auth changes
            supabaseClient.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event);
                
                if (event === 'SIGNED_IN' && session?.user) {
                    this.handleAuthSuccess(session.user);
                } else if (event === 'SIGNED_OUT') {
                    this.handleSignOut();
                }
            });

        } catch (error) {
            ErrorHandler.handle(error, 'Authentication check failed');
            this.showAuthButtons();
        }
    }

    static async signInWithProvider(provider) {
        if (!supabaseClient) {
            NotificationManager.show('Authentication not available', 'error');
            return;
        }

        const button = document.querySelector(`[data-provider="${provider}"]`);
        if (button) {
            button.classList.add('loading');
            button.querySelector('.btn-loading').style.display = 'block';
        }

        try {
            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider,
                options: { 
                    redirectTo: window.location.href,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            });

            if (error) throw error;

            // Track login attempt
            this.trackEvent('login_attempt', provider);

        } catch (error) {
            ErrorHandler.handle(error, `${provider} login failed. Please try again.`);
        } finally {
            if (button) {
                button.classList.remove('loading');
                button.querySelector('.btn-loading').style.display = 'none';
            }
        }
    }

    static async signInWithEmail(email, password) {
        if (!supabaseClient) {
            NotificationManager.show('Authentication not available', 'error');
            return;
        }

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.handleAuthSuccess(data.user);
            ModalManager.hide('login');
            NotificationManager.show('Welcome back!', 'success');

            // Track login
            this.trackEvent('login_success', 'email');

        } catch (error) {
            ErrorHandler.handle(error, 'Login failed. Please check your credentials.');
        }
    }

    static async signOut() {
        if (!supabaseClient) return;

        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;

            this.handleSignOut();
            NotificationManager.show('Signed out successfully', 'success');

            // Track logout
            this.trackEvent('logout', 'manual');

        } catch (error) {
            ErrorHandler.handle(error, 'Sign out failed');
        }
    }

    static handleAuthSuccess(user) {
        AppState.user = user;
        this.showUserInfo(user);
        console.log('User authenticated:', user.email);
    }

    static handleSignOut() {
        AppState.user = null;
        this.showAuthButtons();
        UserMenuManager.hide();
    }

    static showUserInfo(user) {
        const authButtons = DOM.authButtons;
        const userInfo = DOM.userInfo;
        const userName = DOM.userName;
        const userAvatar = DOM.userAvatar;

        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        
        if (userName) {
            userName.textContent = user.email || user.user_metadata?.full_name || 'User';
        }
        
        if (userAvatar) {
            if (user.user_metadata?.avatar_url) {
                userAvatar.style.backgroundImage = `url(${user.user_metadata.avatar_url})`;
                userAvatar.style.backgroundSize = 'cover';
                userAvatar.textContent = '';
            } else {
                const initials = (user.email || 'U').charAt(0).toUpperCase();
                userAvatar.textContent = initials;
            }
        }
    }

    static showAuthButtons() {
        const authButtons = DOM.authButtons;
        const userInfo = DOM.userInfo;

        if (authButtons) authButtons.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
    }

    static trackEvent(action, method) {
        if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'Authentication',
                'event_label': method,
                'value': 1
            });
        }
    }
}

// Modal Manager
class ModalManager {
    static show(modalId) {
        const modal = document.getElementById(`${modalId}-modal`);
        if (!modal) return;

        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            modal.classList.add('show');
        });

        AppState.modals[modalId] = true;

        // Focus management
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        // Track modal open
        this.trackEvent('modal_open', modalId);
    }

    static hide(modalId) {
        const modal = document.getElementById(`${modalId}-modal`);
        if (!modal) return;

        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');

        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, CONFIG.ui.animationDuration);

        AppState.modals[modalId] = false;

        // Track modal close
        this.trackEvent('modal_close', modalId);
    }

    static hideAll() {
        Object.keys(AppState.modals).forEach(modalId => {
            if (AppState.modals[modalId]) {
                this.hide(modalId);
            }
        });
    }

    static trackEvent(action, modalId) {
        if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'Modal',
                'event_label': modalId,
                'value': 1
            });
        }
    }
}

// User Menu Manager
class UserMenuManager {
    static init() {
        const userInfo = DOM.userInfo;
        const userDropdown = DOM.userDropdown;

        if (!userInfo || !userDropdown) return;

        userInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Close on outside click
        document.addEventListener('click', () => {
            this.hide();
        });

        userDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    static toggle() {
        const userDropdown = DOM.userDropdown;
        if (!userDropdown) return;

        const isVisible = userDropdown.classList.contains('show');
        if (isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    static show() {
        const userDropdown = DOM.userDropdown;
        if (!userDropdown) return;

        userDropdown.classList.add('show');
        userDropdown.setAttribute('aria-hidden', 'false');

        // Clear any existing timeout
        if (userMenuTimeout) {
            clearTimeout(userMenuTimeout);
        }
    }

    static hide() {
        const userDropdown = DOM.userDropdown;
        if (!userDropdown) return;

        userDropdown.classList.remove('show');
        userDropdown.setAttribute('aria-hidden', 'true');
    }
}

// Mobile Menu Manager
class MobileMenuManager {
    static init() {
        const mobileMenuBtn = DOM.mobileMenuBtn;
        const mobileMenu = DOM.mobileMenu;
        const mobileOverlay = mobileMenu?.querySelector('.mobile-overlay');
        const mobileClose = mobileMenu?.querySelector('.mobile-menu-close');

        if (!mobileMenuBtn || !mobileMenu) return;

        // Toggle button
        mobileMenuBtn.addEventListener('click', () => {
            this.toggle();
        });

        // Close on overlay click
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => {
                this.hide();
            });
        }

        // Close button
        if (mobileClose) {
            mobileClose.addEventListener('click', () => {
                this.hide();
            });
        }

        // Handle navigation clicks
        const navLinks = mobileMenu.querySelectorAll('a[href^="#"], a[href^="/"]');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Don't close for external links
                if (!link.target || link.target === '_self') {
                    setTimeout(() => this.hide(), 100);
                }
            });
        });
    }

    static toggle() {
        const mobileMenu = DOM.mobileMenu;
        const mobileMenuBtn = DOM.mobileMenuBtn;
        
        if (!mobileMenu || !mobileMenuBtn) return;

        const isActive = mobileMenu.classList.contains('active');
        
        if (isActive) {
            this.hide();
        } else {
            this.show();
        }
    }

    static show() {
        const mobileMenu = DOM.mobileMenu;
        const mobileMenuBtn = DOM.mobileMenuBtn;
        
        if (!mobileMenu || !mobileMenuBtn) return;

        mobileMenu.classList.add('active');
        mobileMenuBtn.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const firstFocusable = mobileMenu.querySelector('a, button');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
    }

    static hide() {
        const mobileMenu = DOM.mobileMenu;
        const mobileMenuBtn = DOM.mobileMenuBtn;
        
        if (!mobileMenu || !mobileMenuBtn) return;

        mobileMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
}

// Search Manager
class SearchManager {
    static init() {
        const searchToggle = DOM.searchToggle;
        const searchOverlay = DOM.searchOverlay;
        const searchInput = DOM.searchInput;
        const searchClose = DOM.searchClose;
        const searchResults = DOM.searchResults;

        if (!searchToggle || !searchOverlay) return;

        // Toggle search
        searchToggle.addEventListener('click', () => {
            this.toggle();
        });

        // Close search
        if (searchClose) {
            searchClose.addEventListener('click', () => {
                this.hide();
            });
        }

        // Close on overlay click
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                this.hide();
            }
        });

        // Search input handling
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hide();
                }
            });
        }
    }

    static toggle() {
        const searchOverlay = DOM.searchOverlay;
        if (!searchOverlay) return;

        const isActive = searchOverlay.classList.contains('active');
        
        if (isActive) {
            this.hide();
        } else {
            this.show();
        }
    }

    static show() {
        const searchOverlay = DOM.searchOverlay;
        const searchInput = DOM.searchInput;
        
        if (!searchOverlay) return;

        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        AppState.modals.search = true;

        // Focus search input
        if (searchInput) {
            setTimeout(() => {
                searchInput.focus();
                searchInput.select();
            }, 100);
        }

        // Track search open
        this.trackEvent('search_open');
    }

    static hide() {
        const searchOverlay = DOM.searchOverlay;
        const searchInput = DOM.searchInput;
        const searchResults = DOM.searchResults;
        
        if (!searchOverlay) return;

        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        AppState.modals.search = false;

        // Clear search
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.innerHTML = '';

        // Track search close
        this.trackEvent('search_close');
    }

    static handleSearch(query) {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }

    static performSearch(query) {
        const searchResults = DOM.searchResults;
        if (!searchResults) return;

        if (!query.trim()) {
            searchResults.innerHTML = '';
            return;
        }

        // Mock search data - replace with actual search implementation
        const tools = [
            { name: 'Password Generator', url: 'https://password.vinnesia.my.id', description: 'Generate secure passwords' },
            { name: 'QR Scanner', url: 'https://scan.vinnesia.my.id', description: 'Scan QR codes instantly' },
            { name: 'Image Converter', url: 'https://image.vinnesia.my.id', description: 'Convert image formats' },
            { name: 'Currency Calculator', url: 'https://currency.vinnesia.my.id', description: 'Real-time currency conversion' },
            { name: 'QR Generator', url: 'https://qr.vinnesia.my.id', description: 'Create custom QR codes' },
            { name: 'JSON Formatter', url: 'https://json.vinnesia.my.id', description: 'Format and validate JSON' }
        ];

        const filteredTools = tools.filter(tool =>
            tool.name.toLowerCase().includes(query.toLowerCase()) ||
            tool.description.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredTools.length === 0) {
            searchResults.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                    <p>No results found for "${query}"</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">Try different keywords or browse all tools</p>
                </div>
            `;
            return;
        }

        const resultsHTML = filteredTools.map(tool => `
            <a href="${tool.url}" target="_blank" rel="noopener" class="search-result-item" onclick="trackEvent('search_click', '${tool.name}')">
                <div class="search-result-title">${tool.name}</div>
                <div class="search-result-description">${tool.description}</div>
            </a>
        `).join('');

        searchResults.innerHTML = `
            <div style="padding: 1rem 0;">
                <div style="padding: 0 1rem 1rem; color: var(--text-secondary); font-size: 0.875rem;">
                    Found ${filteredTools.length} result${filteredTools.length !== 1 ? 's' : ''}
                </div>
                ${resultsHTML}
            </div>
        `;

        // Track search
        this.trackEvent('search_query', query);
    }

    static trackEvent(action, label = '') {
        if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'Search',
                'event_label': label,
                'value': 1
            });
        }
    }
}

// Animation Manager
class AnimationManager {
    static init() {
        this.initScrollAnimations();
        this.initStatsCounter();
        this.initToolCardAnimations();
        this.initScrollProgress();
        this.initBackToTop();
    }

    static initScrollAnimations() {
        if (!window.IntersectionObserver) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Special handling for stats section
                    if (entry.target.classList.contains('stats') && !statsAnimated) {
                        statsAnimated = true;
                        this.animateStats();
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements
        document.querySelectorAll('.tool-card, .stat-item, .feature-card').forEach(element => {
            observer.observe(element);
        });

        // Observe stats section
        const statsSection = document.querySelector('.stats');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    static initStatsCounter() {
        // Stats will be animated when visible (handled in initScrollAnimations)
    }

    static animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count')) || 0;
            let current = 0;
            const increment = target / 100;
            const duration = 2000; // 2 seconds
            const stepTime = duration / 100;

            const animate = () => {
                current += increment;
                stat.textContent = Math.round(current);
                
                if (current < target) {
                    setTimeout(animate, stepTime);
                } else {
                    stat.textContent = target + (stat.parentElement.dataset.stat === 'support' ? '' : '');
                }
            };

            setTimeout(animate, Math.random() * 500); // Stagger animations
        });
    }

    static initToolCardAnimations() {
        const cards = document.querySelectorAll('.tool-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 100);
        });
    }

    static initScrollProgress() {
        const progressBar = DOM.progressBar;
        if (!progressBar) return;

        const updateProgress = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
            progressBar.style.width = Math.min(progress, 100) + '%';
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress(); // Initial call
    }

    static initBackToTop() {
        const backToTop = DOM.backToTop;
        if (!backToTop) return;

        const toggleVisibility = () => {
            if (window.pageYOffset > CONFIG.ui.scrollThreshold) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        
        backToTop.addEventListener('click', () => {
            this.scrollToTop();
        });
    }

    static scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Track scroll to top
        if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
            gtag('event', 'scroll_to_top', {
                'event_category': 'Navigation',
                'value': 1
            });
        }
    }
}

// Cookie Manager
class CookieManager {
    static init() {
        if (!this.hasAccepted()) {
            this.showBanner();
        }
    }

    static hasAccepted() {
        return localStorage.getItem('cookieAccepted') === 'true';
    }

    static showBanner() {
        const banner = DOM.cookieBanner;
        if (!banner) return;

        setTimeout(() => {
            banner.classList.add('show');
        }, 1000);
    }

    static accept() {
        const banner = DOM.cookieBanner;
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.style.display = 'none';
            }, CONFIG.ui.animationDuration);
        }

        localStorage.setItem('cookieAccepted', 'true');
        
        // Track cookie acceptance
        if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
            gtag('event', 'cookie_accept', {
                'event_category': 'Cookie',
                'value': 1
            });
        }

        NotificationManager.show('Cookie preferences saved', 'success');
        console.log('Cookies accepted');
    }

    static reject() {
        const banner = DOM.cookieBanner;
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.style.display = 'none';
            }, CONFIG.ui.animationDuration);
        }

        localStorage.setItem('cookieAccepted', 'false');
        
        // Track cookie rejection
        if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
            gtag('event', 'cookie_reject', {
                'event_category': 'Cookie',
                'value': 1
            });
        }

        NotificationManager.show('Cookies rejected', 'info');
        console.log('Cookies rejected');
    }
}

// Offline Manager
class OfflineManager {
    static init() {
        if (!CONFIG.features.enableOfflineMode) return;

        this.updateOnlineStatus();

        window.addEventListener('online', () => {
            this.handleOnline();
        });

        window.addEventListener('offline', () => {
            this.handleOffline();
        });
    }

    static updateOnlineStatus() {
        isOnline = navigator.onLine;
    }

    static handleOnline() {
        isOnline = true;
        const indicator = DOM.offlineIndicator;
        
        if (indicator) {
            indicator.classList.remove('show');
        }

        NotificationManager.show('Connection restored', 'success');
        console.log('Back online');
    }

    static handleOffline() {
        isOnline = false;
        const indicator = DOM.offlineIndicator;
        
        if (indicator) {
            indicator.classList.add('show');
        }

        NotificationManager.show('You are offline. Some features may not work.', 'warning');
        console.log('Gone offline');
    }
}

// Performance Monitor
class PerformanceMonitor {
    static init() {
        if (!window.performance) return;

        // Monitor page load
        window.addEventListener('load', () => {
            this.trackPageLoad();
        });

        // Monitor Core Web Vitals
        this.trackWebVitals();
    }

    static trackPageLoad() {
        const loadTime = performance.now();
        console.log(`Page load time: ${loadTime.toFixed(2)}ms`);

        if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
            gtag('event', 'page_load_time', {
                'event_category': 'Performance',
                'value': Math.round(loadTime)
            });
        }
    }

    static trackWebVitals() {
        // Track First Contentful Paint
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    console.log(`FCP: ${entry.startTime.toFixed(2)}ms`);
                    
                    if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
                        gtag('event', 'first_contentful_paint', {
                            'event_category': 'Performance',
                            'value': Math.round(entry.startTime)
                        });
                    }
                }
            }
        });

        try {
            observer.observe({ entryTypes: ['paint'] });
        } catch (e) {
            // Observer not supported
        }
    }
}

// Newsletter Manager
class NewsletterManager {
    static init() {
        const form = document.querySelector('.newsletter-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            this.handleSubmit(e);
        });
    }

    static async handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.querySelector('input[type="email"]').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (!email) {
            NotificationManager.show('Please enter your email address', 'error');
            return;
        }

        // Validate email
        if (!this.isValidEmail(email)) {
            NotificationManager.show('Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        const originalText = submitBtn.textContent;
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';

        try {
            // Mock API call - replace with actual newsletter service
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            NotificationManager.show('Thank you for subscribing!', 'success');
            form.reset();
            
            // Track subscription
            this.trackEvent('newsletter_subscribe', email);
            
        } catch (error) {
            ErrorHandler.handle(error, 'Subscription failed. Please try again.');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static trackEvent(action, email) {
        if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'Newsletter',
                'event_label': 'subscription',
                'value': 1
            });
        }
    }
}

// Donation Manager
class DonationManager {
    static init() {
        // Initialize donation buttons
        document.querySelectorAll('.donation-btn[data-amount]').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = btn.dataset.amount;
                this.processDonation(amount);
            });
        });

        // Initialize custom donation
        const customBtn = document.querySelector('.donation-btn.custom');
        if (customBtn) {
            customBtn.addEventListener('click', () => {
                this.showCustomDonation();
            });
        }
    }

    static processDonation(amount) {
        console.log(`Processing donation: $${amount}`);
        
        // Mock payment processing - replace with actual payment gateway
        NotificationManager.show(`Thank you for your $${amount} donation!`, 'success');
        
        // Track donation
        this.trackEvent('donation_amount', amount);
        
        // Close modal
        ModalManager.hide('donation');
    }

    static showCustomDonation() {
        const customSection = document.getElementById('custom-donation');
        if (!customSection) return;

        customSection.style.display = 'flex';
        const input = customSection.querySelector('input');
        if (input) {
            input.focus();
        }
    }

    static processCustomDonation() {
        const input = document.querySelector('.custom-amount-input');
        if (!input) return;

        const amount = parseFloat(input.value);
        
        if (!amount || amount < 1) {
            NotificationManager.show('Please enter a valid amount', 'error');
            return;
        }

        this.processDonation(amount);
    }

    static trackEvent(action, amount) {
        if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'Donation',
                'value': parseFloat(amount) || 0
            });
        }
    }
}

// Utility Functions
function trackEvent(action, label = '', value = 1) {
    if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': 'Interaction',
            'event_label': label,
            'value': value
        });
    }
    console.log(`Event tracked: ${action} - ${label}`);
}

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Global Functions (called from HTML)
function setLanguage(lang) {
    LanguageManager.setLanguage(lang);
}

function toggleTheme() {
    ThemeManager.toggleTheme();
}

function toggleMobileMenu() {
    MobileMenuManager.toggle();
}

function toggleSearch() {
    SearchManager.toggle();
}

function toggleUserMenu() {
    UserMenuManager.toggle();
}

function showLoginModal() {
    ModalManager.show('login');
}

function hideLoginModal() {
    ModalManager.hide('login');
}

function showDonationModal() {
    ModalManager.show('donation');
}

function hideDonationModal() {
    ModalManager.hide('donation');
}

function showRegisterModal() {
    // Implement registration modal if needed
    NotificationManager.show('Registration coming soon!', 'info');
}

function acceptCookies() {
    CookieManager.accept();
}

function rejectCookies() {
    CookieManager.reject();
}

function scrollToTop() {
    AnimationManager.scrollToTop();
}

function navigateAndClose(href) {
    if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        window.location.href = href;
    }
    MobileMenuManager.hide();
}

function loadMoreTools() {
    // Mock function - implement actual tool loading
    NotificationManager.show('All tools loaded!', 'info');
    trackEvent('load_more_tools');
}

function processDonation(amount) {
    DonationManager.processDonation(amount);
}

function showCustomDonation() {
    DonationManager.showCustomDonation();
}

function processCustomDonation() {
    DonationManager.processCustomDonation();
}

async function handleEmailLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    const password = formData.get('password') || e.target.querySelector('input[type="password"]').value;
    
    await AuthManager.signInWithEmail(email, password);
}

async function subscribeNewsletter(e) {
    await NewsletterManager.handleSubmit(e);
}

async function logout() {
    await AuthManager.signOut();
}

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', async () => {
    console.log('VIN NESIA initializing...');

    try {
        // Cache DOM elements
        DOM.progressBar = document.getElementById('progress-bar');
        DOM.cookieBanner = document.getElementById('cookie-banner');
        DOM.themeToggle = document.querySelector('.theme-toggle');
        DOM.searchToggle = document.querySelector('.search-toggle');
        DOM.searchOverlay = document.getElementById('search-overlay');
        DOM.searchInput = document.getElementById('search-input');
        DOM.searchClose = document.querySelector('.search-close');
        DOM.searchResults = document.getElementById('search-results');
        DOM.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        DOM.mobileMenu = document.getElementById('mobile-menu');
        DOM.authButtons = document.getElementById('auth-buttons');
        DOM.userInfo = document.getElementById('user-info');
        DOM.userName = document.getElementById('user-name');
        DOM.userAvatar = document.getElementById('user-avatar');
        DOM.userDropdown = document.getElementById('user-dropdown');
        DOM.notificationContainer = document.getElementById('notification-container');
        DOM.backToTop = document.getElementById('back-to-top');
        DOM.offlineIndicator = document.getElementById('offline-indicator');
        DOM.loadingScreen = document.getElementById('loading-screen');

        // Initialize Supabase
        if (typeof supabase !== 'undefined' && CONFIG.supabase.url && CONFIG.supabase.anonKey) {
            try {
                supabaseClient = supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
                console.log('Supabase initialized');
            } catch (error) {
                console.warn('Failed to initialize Supabase:', error);
            }
        }

        // Initialize managers
        ThemeManager.init();
        LanguageManager.init();
        AuthManager.init();
        MobileMenuManager.init();
        SearchManager.init();
        UserMenuManager.init();
        AnimationManager.init();
        CookieManager.init();
        OfflineManager.init();
        PerformanceMonitor.init();
        NewsletterManager.init();
        DonationManager.init();

        // Initialize social login buttons
        document.querySelectorAll('.social-btn[data-provider]').forEach(btn => {
            btn.addEventListener('click', () => {
                const provider = btn.dataset.provider;
                AuthManager.signInWithProvider(provider);
            });
        });

        // Hide loading screen
        if (DOM.loadingScreen) {
            setTimeout(() => {
                DOM.loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    DOM.loadingScreen.style.display = 'none';
                }, 500);
            }, 1000);
        }

        // Initialize smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Handle modal clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                const modalId = e.target.id.replace('-modal', '');
                ModalManager.hide(modalId);
            }
        });

        console.log('VIN NESIA initialized successfully');

    } catch (error) {
        ErrorHandler.log(error, 'Initialization');
        console.error('Failed to initialize VIN NESIA:', error);
    }
});

// Window Load Event
window.addEventListener('load', () => {
    // Final setup after everything is loaded
    document.body.classList.add('loaded');
    
    // Track page load
    if (CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            'page_title': document.title,
            'page_location': window.location.href
        });
    }
});

// Before Unload Event
window.addEventListener('beforeunload', () => {
    // Cleanup before page unload
    if (searchTimeout) clearTimeout(searchTimeout);
    if (userMenuTimeout) clearTimeout(userMenuTimeout);
});

// Error Event Handler
window.addEventListener('error', (event) => {
    ErrorHandler.log(event.error, 'Global Error Handler');
});

// Unhandled Promise Rejection Handler
window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.log(event.reason, 'Unhandled Promise Rejection');
    event.preventDefault();
});

console.log('VIN NESIA script loaded successfully');

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        AppState,
        ErrorHandler,
        NotificationManager,
        ThemeManager,
        LanguageManager,
        AuthManager,
        ModalManager,
        SearchManager,
        AnimationManager,
        CookieManager,
        OfflineManager,
        trackEvent
    };
}

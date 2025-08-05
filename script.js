// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize all website functionality
function initializeWebsite() {
    initLoadingScreen();
    initCookieConsent();
    initSearch();
    initCategoryFiltering();
    initCounterAnimations();
    initThemeToggle();
    initRecentTools();
    initSmoothScrolling();
    initProgressBar();
    initKeyboardNavigation();
    initRippleEffects();
    initFadeInAnimations();
    initBackToTopButton();
    initToastNotifications();
    initLanguageSelector();
    initDonationButtons();
    initPerformanceMonitoring();
    initErrorHandling();
}

// Loading screen
function initLoadingScreen() {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 1000);
    });
}

// Cookie consent functionality
function initCookieConsent() {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const declineBtn = document.getElementById('decline-cookies');
    
    // Check if consent already given
    if (localStorage.getItem('cookieConsent')) {
        cookieBanner.style.display = 'none';
        return;
    }
    
    // Show cookie banner after 2 seconds
    setTimeout(() => {
        cookieBanner.classList.add('show');
    }, 2000);
    
    acceptBtn.addEventListener('click', () => {
        cookieBanner.classList.remove('show');
        localStorage.setItem('cookieConsent', 'accepted');
        gtag('event', 'cookie_consent', { consent_status: 'accepted' });
    });
    
    declineBtn.addEventListener('click', () => {
        cookieBanner.classList.remove('show');
        localStorage.setItem('cookieConsent', 'declined');
        gtag('event', 'cookie_consent', { consent_status: 'declined' });
    });
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('search-tools');
    const toolsGrid = document.getElementById('tools-grid');
    const toolCards = toolsGrid.querySelectorAll('.tool-card');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        toolCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.3s ease-out';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Track search events
        if (searchTerm.length > 2) {
            gtag('event', 'search', {
                search_term: searchTerm
            });
        }
    });
}

// Category filtering
function initCategoryFiltering() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            categoryBtns.forEach(b => {
                b.classList.remove('active', 'bg-primary-600');
                b.classList.add('bg-gray-800');
            });
            this.classList.add('active', 'bg-primary-600');
            this.classList.remove('bg-gray-800');
            
            const category = this.dataset.category;
            
            toolCards.forEach((card, index) => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    card.style.animation = `fadeInUp 0.3s ease-out ${index * 0.1}s`;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Track category filtering
            gtag('event', 'filter_category', {
                category: category
            });
        });
    });
}

// Counter animations
function initCounterAnimations() {
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 20);
    }
    
    const counters = document.querySelectorAll('[data-counter]');
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.counter);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeToggle.querySelector('i').className = 'fas fa-sun';
    }
    
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('light-mode');
        const icon = this.querySelector('i');
        
        if (body.classList.contains('light-mode')) {
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'light');
            gtag('event', 'theme_change', { theme: 'light' });
        } else {
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'dark');
            gtag('event', 'theme_change', { theme: 'dark' });
        }
    });
}

// Recently used tools functionality
function initRecentTools() {
    function addToRecentTools(toolName, toolUrl) {
        let recentTools = JSON.parse(localStorage.getItem('recentTools') || '[]');
        
        // Remove if already exists
        recentTools = recentTools.filter(tool => tool.url !== toolUrl);
        
        // Add to beginning
        recentTools.unshift({
            name: toolName,
            url: toolUrl,
            timestamp: Date.now()
        });
        
        // Keep only last 5
        recentTools = recentTools.slice(0, 5);
        
        localStorage.setItem('recentTools', JSON.stringify(recentTools));
        updateRecentToolsDisplay();
    }
    
    function updateRecentToolsDisplay() {
        const recentToolsContainer = document.getElementById('recent-tools');
        const recentTools = JSON.parse(localStorage.getItem('recentTools') || '[]');
        
        if (recentTools.length === 0) {
            recentToolsContainer.innerHTML = '<div class="text-gray-400 text-center py-4">No recently used tools</div>';
            return;
        }
        
        const toolsHTML = recentTools.map(tool => `
            <a href="${tool.url}" class="block p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors mb-2 last:mb-0">
                <div class="font-medium text-white">${tool.name}</div>
                <div class="text-sm text-gray-400">${new Date(tool.timestamp).toLocaleDateString()}</div>
            </a>
        `).join('');
        
        recentToolsContainer.innerHTML = toolsHTML;
    }
    
    // Track tool usage
    document.querySelectorAll('.tool-card a').forEach(link => {
        link.addEventListener('click', function(e) {
            const toolName = this.closest('.tool-card').querySelector('h3').textContent;
            const toolUrl = this.href;
            addToRecentTools(toolName, toolUrl);
            
            // Track tool usage
            gtag('event', 'tool_click', {
                tool_name: toolName,
                tool_url: toolUrl
            });
        });
    });
    
    // Initialize recent tools display
    updateRecentToolsDisplay();
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Progress indicator for page scroll
function initProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// Keyboard navigation
function initKeyboardNavigation() {
    const searchInput = document.getElementById('search-tools');
    
    document.addEventListener('keydown', function(e) {
        // Alt + S for search
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Escape to clear search
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
        }
    });
}

// Ripple effects for buttons
function initRippleEffects() {
    document.querySelectorAll('.ripple-effect').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    });
}

// Fade-in animations
function initFadeInAnimations() {
    const observerFade = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observerFade.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('section').forEach(section => {
        observerFade.observe(section);
    });
}

// Back to top button
function initBackToTopButton() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.onclick = () => {
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        });
        gtag('event', 'back_to_top_click');
    };
    document.body.appendChild(backToTopBtn);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
}

// Toast notifications
function initToastNotifications() {
    window.showToast = function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="${iconMap[type] || iconMap.info} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    };
}

// Language selector functionality
function initLanguageSelector() {
    const languageSelector = document.querySelector('select');
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
        languageSelector.value = savedLanguage;
    }
    
    languageSelector.addEventListener('change', function() {
        const selectedLang = this.value;
        localStorage.setItem('preferredLanguage', selectedLang);
        
        // Track language change
        gtag('event', 'language_change', {
            language: selectedLang
        });
        
        showToast(`Language changed to ${selectedLang === 'en' ? 'English' : 'Indonesian'}`, 'success');
    });
}

// Donation button functionality
function initDonationButtons() {
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Donate') || btn.textContent.includes('Make a Donation')) {
            btn.addEventListener('click', function() {
                showToast('Thank you for considering a donation! Feature coming soon.', 'success');
                gtag('event', 'donation_click', {
                    button_location: this.closest('section') ? 'main' : 'footer'
                });
            });
        }
    });
}

// Performance monitoring
function initPerformanceMonitoring() {
    window.addEventListener('load', function() {
        // Log performance metrics
        if (performance.getEntriesByType) {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                gtag('event', 'page_load_time', {
                    value: Math.round(perfData.loadEventEnd - perfData.loadEventStart)
                });
            }
        }
        
        // Log Core Web Vitals
        if ('web-vitals' in window) {
            // This would require the web-vitals library
            // For now, we'll just track basic metrics
            gtag('event', 'performance_metric', {
                metric_name: 'page_loaded',
                timestamp: Date.now()
            });
        }
    });
}

// Error handling
function initErrorHandling() {
    window.addEventListener('error', function(e) {
        gtag('event', 'javascript_error', {
            error_message: e.message,
            error_filename: e.filename,
            error_lineno: e.lineno
        });
        
        console.error('JavaScript Error:', e);
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        gtag('event', 'promise_rejection', {
            error_reason: e.reason
        });
        
        console.error('Unhandled Promise Rejection:', e);
    });
}

// Service Worker registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
                gtag('event', 'service_worker_registered');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
                gtag('event', 'service_worker_failed');
            });
    });
}

// Lazy loading for images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('loading-skeleton');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.classList.add('loading-skeleton');
            imageObserver.observe(img);
        });
    }
}

// Initialize lazy loading
initLazyLoading();

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Export functions for potential use in other scripts
window.VinNesiaUtils = {
    showToast,
    debounce,
    throttle
};

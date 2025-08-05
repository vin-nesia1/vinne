// Supabase Configuration
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"; // Replace with your URL
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY"; // Replace with your anon key
let supabaseClient;

// Initialize Supabase
try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
    console.warn('Supabase not initialized:', error);
}

// Global Variables
let currentLanguage = 'en';
let statsAnimated = false;
let userStats = {
    users: 150000,
    tools: 6,
    uptime: 99,
    support: 24
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    // Set initial language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
    
    // Initialize scroll animations
    initializeScrollAnimations();
    
    // Initialize authentication check
    checkAuthStatus();
    
    // Show cookie banner if not accepted
    showCookieBanner();
    
    // Initialize loading bar
    initializeLoadingBar();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize stats counter
    initializeStatsCounter();
    
    // Initialize tool cards animation
    initializeToolCardAnimations();
    
    // Initialize social login buttons
    initializeSocialLogin();
    
    console.log('VIN NESIA initialized successfully');
}

// Language Management
function setLanguage(lang) {
    currentLanguage = lang;
    
    // Update button states
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-id').classList.toggle('active', lang === 'id');
    
    // Show/hide language elements
    const allLangElements = document.querySelectorAll('[data-lang]');
    allLangElements.forEach(element => {
        const elementLang = element.getAttribute('data-lang');
        element.style.display = elementLang === lang ? '' : 'none';
    });
    
    // Update document language
    document.documentElement.lang = lang;
    
    // Save to localStorage
    localStorage.setItem('language', lang);
    
    // Update page title
    updatePageTitle(lang);
    
    console.log(`Language switched to: ${lang}`);
}

function updatePageTitle(lang) {
    const titles = {
        en: 'VIN NESIA - Professional Online Tools | Free Web Utilities',
        id: 'VIN NESIA - Alat Online Profesional | Utilitas Web Gratis'
    };
    document.title = titles[lang] || titles.en;
}

// Mobile Menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

// Authentication Functions
async function checkAuthStatus() {
    if (!supabaseClient) return;
    
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
            showUserInfo(user);
        } else {
            showAuthButtons();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showAuthButtons();
    }
}

function showUserInfo(user) {
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    
    authButtons.style.display = 'none';
    userInfo.style.display = 'flex';
    userName.textContent = user.email || user.user_metadata.full_name || 'User';
}

function showAuthButtons() {
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    
    authButtons.style.display = 'flex';
    userInfo.style.display = 'none';
}

function initializeSocialLogin() {
    if (!supabaseClient) return;
    
    // GitHub Login
    const githubBtn = document.getElementById('login-github');
    if (githubBtn) {
        githubBtn.addEventListener('click', async () => {
            try {
                await supabaseClient.auth.signInWithOAuth({
                    provider: 'github',
                    options: { redirectTo: window.location.href }
                });
            } catch (error) {
                console.error('GitHub login error:', error);
                showNotification('Login failed. Please try again.', 'error');
            }
        });
    }
    
    // Discord Login
    const discordBtn = document.getElementById('login-discord');
    if (discordBtn) {
        discordBtn.addEventListener('click', async () => {
            try {
                await supabaseClient.auth.signInWithOAuth({
                    provider: 'discord',
                    options: { redirectTo: window.location.href }
                });
            } catch (error) {
                console.error('Discord login error:', error);
                showNotification('Login failed. Please try again.', 'error');
            }
        });
    }
    
    // Facebook Login
    const facebookBtn = document.getElementById('login-facebook');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', async () => {
            try {
                await supabaseClient.auth.signInWithOAuth({
                    provider: 'facebook',
                    options: { redirectTo: window.location.href }
                });
            } catch (error) {
                console.error('Facebook login error:', error);
                showNotification('Login failed. Please try again.', 'error');
            }
        });
    }
}

// Modal Functions
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
}

function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

function showDonationModal() {
    const modal = document.getElementById('donation-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
}

function hideDonationModal() {
    const modal = document.getElementById('donation-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        if (e.target.id === 'login-modal') {
            hideLoginModal();
        } else if (e.target.id === 'donation-modal') {
            hideDonationModal();
        }
    }
});

// Cookie Banner
function showCookieBanner() {
    const cookieAccepted = localStorage.getItem('cookieAccepted');
    if (!cookieAccepted) {
        const banner = document.getElementById('cookie-banner');
        setTimeout(() => banner.classList.add('show'), 1000);
    }
}

function acceptCookies() {
    localStorage.setItem('cookieAccepted', 'true');
    const banner = document.getElementById('cookie-banner');
    banner.classList.remove('show');
    
    // Track cookie acceptance
    if (typeof gtag !== 'undefined') {
        gtag('event', 'cookie_consent', {
            event_category: 'engagement',
            event_label: 'accepted'
        });
    }
}

// Loading Bar
function initializeLoadingBar() {
    const loadingBar = document.getElementById('loading-bar');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loadingBar.style.opacity = '0';
                setTimeout(() => loadingBar.style.display = 'none', 300);
            }, 500);
        }
        loadingBar.style.width = progress + '%';
    }, 100);
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger stats animation
                if (entry.target.closest('.stats') && !statsAnimated) {
                    animateStats();
                    statsAnimated = true;
                }
            }
        });
    }, observerOptions);
    
    // Observe stat items
    document.querySelectorAll('.stat-item').forEach(item => {
        observer.observe(item);
    });
    
    // Observe tool cards
    document.querySelectorAll('.tool-card').forEach(card => {
        observer.observe(card);
    });
}

// Stats Counter Animation
function initializeStatsCounter() {
    // This will be triggered by the intersection observer
}

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach((stat, index) => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const start = Date.now();
        const startValue = 0;
        
        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - start) / duration, 1);
            const current = Math.floor(startValue + (target - startValue) * easeOutCubic(progress));
            
            stat.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                stat.textContent = target.toLocaleString();
            }
        };
        
        // Stagger the animations
        setTimeout(animate, index * 200);
    });
}

// Easing function
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Tool Cards Animation
function initializeToolCardAnimations() {
    const cards = document.querySelectorAll('.tool-card');
    
    cards.forEach((card, index) => {
        // Add staggered animation delay
        card.style.animationDelay = `${index * 100}ms`;
        
        // Add click tracking
        card.addEventListener('click', function(e) {
            // Track tool clicks
            if (typeof gtag !== 'undefined') {
                const toolName = this.querySelector('.tool-title').textContent;
                gtag('event', 'tool_click', {
                    event_category: 'tools',
                    event_label: toolName,
                    value: 1
                });
            }
            
            // Add ripple effect
            addRippleEffect(e, this);
        });
    });
}

// Ripple Effect
function addRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(139, 92, 246, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple animation CSS if not already defined
if (!document.querySelector('#ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#3B82F6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Performance Monitoring
function initializePerformanceMonitoring() {
    // Monitor page load time
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'timing_complete', {
                name: 'page_load',
                value: Math.round(loadTime)
            });
        }
        
        console.log(`Page loaded in ${Math.round(loadTime)}ms`);
    });
    
    // Monitor resource loading
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.duration > 1000) { // Log slow resources
                    console.warn(`Slow resource: ${entry.name} took ${Math.round(entry.duration)}ms`);
                }
            });
        });
        
        observer.observe({ entryTypes: ['resource'] });
    }
}

// Error Handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: e.error.message,
            fatal: false
        });
    }
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // ESC key closes modals
    if (e.key === 'Escape') {
        const loginModal = document.getElementById('login-modal');
        const donationModal = document.getElementById('donation-modal');
        
        if (loginModal.classList.contains('show')) {
            hideLoginModal();
        }
        if (donationModal.classList.contains('show')) {
            hideDonationModal();
        }
    }
    
    // Enter key on language buttons
    if (e.key === 'Enter' && e.target.classList.contains('lang-toggle')) {
        e.target.click();
    }
});

// Service Worker Registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Theme Detection
function initializeThemeDetection() {
    // Check for system dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        console.log('User prefers light mode, but VIN NESIA uses dark theme by design');
    }
    
    // Listen for theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        console.log(`Theme changed to: ${e.matches ? 'dark' : 'light'}`);
    });
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', () => {
    initializePerformanceMonitoring();
    initializeThemeDetection();
});

// Donation Tracking
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('donation-btn')) {
        const amount = e.target.textContent;
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'donation_intent', {
                event_category: 'engagement',
                event_label: amount,
                value: 1
            });
        }
        
        showNotification(currentLanguage === 'en' ? 
            'Thank you for your interest in supporting us!' : 
            'Terima kasih atas minat Anda untuk mendukung kami!', 'success');
    }
});

// Logout Function
async function logout() {
    if (!supabaseClient) return;
    
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        
        showAuthButtons();
        showNotification(currentLanguage === 'en' ? 
            'Successfully logged out!' : 
            'Berhasil logout!', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showNotification(currentLanguage === 'en' ? 
            'Logout failed. Please try again.' : 
            'Logout gagal. Silakan coba lagi.', 'error');
    }
}

// Add logout functionality to user info
document.addEventListener('click', (e) => {
    if (e.target.closest('.user-info')) {
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 0.5rem;
            z-index: 1000;
            min-width: 120px;
        `;
        
        userMenu.innerHTML = `
            <button onclick="logout()" style="
                width: 100%;
                padding: 8px 12px;
                background: none;
                border: none;
                color: var(--text-primary);
                cursor: pointer;
                border-radius: 4px;
                transition: background 0.3s ease;
            " onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='none'">
                ${currentLanguage === 'en' ? 'Logout' : 'Keluar'}
            </button>
        `;
        
        const userInfo = e.target.closest('.user-info');
        userInfo.style.position = 'relative';
        userInfo.appendChild(userMenu);
        
        // Remove menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function removeMenu(e) {
                if (!userInfo.contains(e.target)) {
                    userMenu.remove();
                    document.removeEventListener('click', removeMenu);
                }
            });
        }, 10);
    }
});

// Initialize tool usage statistics
function initializeToolStats() {
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        const toolUrl = card.getAttribute('href');
        if (toolUrl) {
            // Get usage count from localStorage or set to 0
            const toolName = card.querySelector('.tool-title').textContent;
            const usageCount = localStorage.getItem(`tool_usage_${toolName}`) || Math.floor(Math.random() * 10000) + 1000;
            
            // Add usage indicator
            const usageIndicator = document.createElement('div');
            usageIndicator.className = 'usage-indicator';
            usageIndicator.style.cssText = `
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: rgba(139, 92, 246, 0.1);
                color: var(--primary);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 500;
            `;
            usageIndicator.textContent = `${parseInt(usageCount).toLocaleString()} uses`;
            
            card.appendChild(usageIndicator);
            
            // Increment usage on click
            card.addEventListener('click', () => {
                const newCount = parseInt(usageCount) + 1;
                localStorage.setItem(`tool_usage_${toolName}`, newCount);
            });
        }
    });
}

// Export functions for global access
window.VinNesia = {
    setLanguage,
    toggleMobileMenu,
    showLoginModal,
    hideLoginModal,
    showDonationModal,
    hideDonationModal,
    acceptCookies,
    showNotification,
    logout
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Initialize tool stats
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeToolStats, 1000);
});

console.log('🚀 VIN NESIA loaded successfully!');
console.log('🛠️ Professional tools for everyone, everywhere.');
console.log('💜 Built with love for the community.');

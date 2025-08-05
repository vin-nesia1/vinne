// Supabase Configuration
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"; // Ganti dengan URL Supabase Anda
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY"; // Ganti dengan kunci anonim Supabase Anda
let supabaseClient;

// Inisialisasi Supabase
try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
    console.warn('Gagal menginisialisasi Supabase:', error);
}

// Variabel Global
let currentLanguage = 'en';
let statsAnimated = false;
let userStats = {
    users: 150000,
    tools: 6,
    uptime: 99,
    support: 24
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Inisialisasi Aplikasi
function initializeApp() {
    // Set bahasa awal dari localStorage atau default ke 'en'
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);

    // Inisialisasi animasi scroll
    initializeScrollAnimations();

    // Inisialisasi pemeriksaan status autentikasi
    checkAuthStatus();

    // Tampilkan cookie banner jika belum diterima
    showCookieBanner();

    // Inisialisasi loading bar
    initializeLoadingBar();

    // Inisialisasi smooth scrolling
    initializeSmoothScrolling();

    // Inisialisasi penghitung statistik
    initializeStatsCounter();

    // Inisialisasi animasi kartu alat
    initializeToolCardAnimations();

    // Inisialisasi tombol login sosial
    initializeSocialLogin();

    console.log('VIN NESIA berhasil diinisialisasi');
}

// Manajemen Bahasa
function setLanguage(lang) {
    currentLanguage = lang;

    // Perbarui status tombol bahasa
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-id').classList.toggle('active', lang === 'id');

    // Tampilkan/sembunyikan elemen berdasarkan bahasa
    document.querySelectorAll('[data-lang]').forEach(element => {
        element.style.display = element.getAttribute('data-lang') === lang ? '' : 'none';
    });

    // Perbarui bahasa dokumen
    document.documentElement.lang = lang;

    // Simpan ke localStorage
    localStorage.setItem('language', lang);

    // Perbarui judul halaman
    updatePageTitle(lang);

    console.log(`Bahasa diubah ke: ${lang}`);
}

function updatePageTitle(lang) {
    const titles = {
        en: 'VIN NESIA - Professional Online Tools | Free Web Utilities',
        id: 'VIN NESIA - Alat Online Profesional | Utilitas Web Gratis'
    };
    document.title = titles[lang] || titles.en;
}

// Menu Mobile
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

// Fungsi Autentikasi
async function checkAuthStatus() {
    if (!supabaseClient) return;

    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        user ? showUserInfo(user) : showAuthButtons();
    } catch (error) {
        console.error('Kesalahan pemeriksaan autentikasi:', error);
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

    const providers = [
        { id: 'login-github', provider: 'github', name: 'GitHub' },
        { id: 'login-discord', provider: 'discord', name: 'Discord' },
        { id: 'login-facebook', provider: 'facebook', name: 'Facebook' }
    ];

    providers.forEach(({ id, provider, name }) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', async () => {
                try {
                    await supabaseClient.auth.signInWithOAuth({
                        provider,
                        options: { redirectTo: window.location.href }
                    });
                } catch (error) {
                    console.error(`Kesalahan login ${name}:`, error);
                    showNotification('Login gagal. Silakan coba lagi.', 'error');
                }
            });
        }
    });
}

// Fungsi Modal
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

// Tutup modal saat klik di luar
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        if (e.target.id === 'login-modal') hideLoginModal();
        else if (e.target.id === 'donation-modal') hideDonationModal();
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
    const banner = document.getElementById('cookie-banner');
    banner.classList.remove('show');
    setTimeout(() => banner.style.display = 'none', 300);
    localStorage.setItem('cookieAccepted', 'true');
    console.log('Cookies diterima');
}

// Animasi Scroll
function initializeScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.tool-card, .stat-item').forEach(element => {
        observer.observe(element);
    });
}

// Loading Bar
function initializeLoadingBar() {
    const loadingBar = document.getElementById('loading-bar');
    window.addEventListener('load', () => {
        loadingBar.style.width = '100%';
        setTimeout(() => loadingBar.style.opacity = '0', 500);
    });
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Penghitung Statistik
function initializeStatsCounter() {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !statsAnimated) {
            statsAnimated = true;
            animateStats();
        }
    }, { threshold: 0.5 });

    observer.observe(document.querySelector('.stats'));
}

function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        let current = 0;
        const increment = target / 100;
        const animate = () => {
            current += increment;
            stat.textContent = Math.round(current);
            if (current < target) {
                requestAnimationFrame(animate);
            } else {
                stat.textContent = target;
            }
        };
        animate();
    });
}

// Animasi Kartu Alat
function initializeToolCardAnimations() {
    const cards = document.querySelectorAll('.tool-card');
    cards.forEach((card, index) => {
        setTimeout(() => card.classList.add('visible'), index * 100);
    });
}

// Notifikasi
function showNotification(message, type = 'info') {
    // Fungsi showNotification ditambahkan untuk memberikan umpan balik visual kepada pengguna
    // saat terjadi error atau aksi penting.
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'error' ? '#EF4444' : '#10B981'};
        color: white;
        border-radius: 8px;
        z-index: 2000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Performance Monitoring
function monitorPerformance() {
    // Fungsi monitorPerformance ditambahkan untuk melacak waktu pemuatan halaman,
    // berguna untuk debugging performa.
    if (window.performance) {
        const loadTime = performance.now();
        console.log(`Waktu pemuatan halaman: ${loadTime.toFixed(2)}ms`);
    }
}

window.addEventListener('load', monitorPerformance);

// Error Handling
window.addEventListener('error', (event) => {
    console.error('Kesalahan global:', event.error);
    showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
});

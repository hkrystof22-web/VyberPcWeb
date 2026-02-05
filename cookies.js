// cookies.js - Cookies management pro HerníPrůvodce.cz

// ===== HLAVNÍ FUNKCE =====

// Zobrazí cookie banner při načtení stránky
function initCookieBanner() {
    const decision = getCookieDecision();
    const banner = document.getElementById('cookieBanner');
    const settingsBtn = document.getElementById('cookieSettingsBtn');
    
    // Pokud uživatel ještě nerozhodl, zobraz banner
    if (!decision) {
        setTimeout(() => {
            banner.classList.add('show');
        }, 1500);
    } else {
        // Jinak zobraz tlačítko nastavení
        settingsBtn.style.display = 'flex';
        loadCookiesBasedOnDecision(decision);
    }
}

// Uloží preference cookies
function saveCookieDecision(preferences) {
    localStorage.setItem('cookieDecision', JSON.stringify(preferences));
    localStorage.setItem('cookieDecisionDate', new Date().toISOString());
    
    // Zobraz tlačítko nastavení
    document.getElementById('cookieSettingsBtn').style.display = 'flex';
    
    // Načti cookies podle rozhodnutí
    loadCookiesBasedOnDecision(preferences);
    
    // Skryj banner
    hideCookieBanner();
    
    // Zobraz potvrzení
    showNotification('Nastavení cookies uloženo.');
}

// Získá aktuální rozhodnutí
function getCookieDecision() {
    const decision = localStorage.getItem('cookieDecision');
    if (!decision) return null;
    
    try {
        return JSON.parse(decision);
    } catch {
        // Pro zpětnou kompatibilitu
        if (decision === 'all' || decision === 'necessary') {
            return decision;
        }
        return null;
    }
}

// ===== AKCE TLAČÍTEK =====

// Přijmout všechny cookies
function acceptAllCookies() {
    saveCookieDecision({
        necessary: true,
        analytics: true,
        marketing: true
    });
}

// Uložit vybrané preference
function saveCookiePreferences() {
    const preferences = {
        necessary: true,
        analytics: document.getElementById('cookieAnalytics').checked,
        marketing: document.getElementById('cookieMarketing').checked
    };
    
    saveCookieDecision(preferences);
}

// Odmítnout vše kromě nezbytných
function rejectAllCookies() {
    saveCookieDecision({
        necessary: true,
        analytics: false,
        marketing: false
    });
}

// ===== NAČÍTÁNÍ SKRIPTŮ =====

// Načte cookies podle rozhodnutí
function loadCookiesBasedOnDecision(decision) {
    if (!decision) return;
    
    // Pokud je decision string (stará verze)
    if (typeof decision === 'string') {
        if (decision === 'all') {
            loadAnalytics();
            loadMarketing();
        }
        return;
    }
    
    // Nová verze (object)
    if (decision.analytics) {
        loadAnalytics();
    }
    
    if (decision.marketing) {
        loadMarketing();
    }
}

// Načte analytické cookies (Google Analytics)
function loadAnalytics() {
    console.log('🔵 Načítám analytické cookies');
    
    // SEM PŘIJDE TVŮJ GOOGLE ANALYTICS KÓD
    // gtag('config', 'UA-XXXXX-Y');
    
    // Simulace pro testování
    if (window.location.href.includes('file://') || window.location.hostname === 'localhost') {
        console.log('📊 Simulace: Google Analytics by se nyní načetl');
        // Přidej testovací cookie
        document.cookie = "_ga_test=GA1.2.test.123; path=/; max-age=2592000; SameSite=Lax";
    }
}

// Načte marketingové cookies (AdSense)
function loadMarketing() {
    console.log('🟡 Načítám marketingové cookies');
    
    // SEM PŘIJDE TVŮJ ADSENSE KÓD
    // (adsbygoogle = window.adsbygoogle || []).push({});
    
    // Simulace pro testování
    if (window.location.href.includes('file://') || window.location.hostname === 'localhost') {
        console.log('💰 Simulace: AdSense reklamy by se nyní zobrazily');
        // Přidej testovací cookie
        document.cookie = "_gads_test=test_value; path=/; max-age=2592000; SameSite=Lax";
        
        // Přidej testovací reklamní blok
        const adContainers = document.querySelectorAll('.ad-banner');
        adContainers.forEach(container => {
            if (!container.querySelector('.test-ad')) {
                const adDiv = document.createElement('div');
                adDiv.className = 'test-ad';
                adDiv.innerHTML = `
                    <div style="background:#2c3e50;border:2px dashed #00b894;color:#ecf0f1;padding:15px;
                         border-radius:8px;margin:10px 0;text-align:center;">
                        <i class="fas fa-ad" style="color:#00b894;"></i><br>
                        <small>Testovací reklama - při zapnutém marketingu</small>
                    </div>
                `;
                container.appendChild(adDiv);
            }
        });
    }
}

// ===== POMOCNÉ FUNKCE =====

// Skryje cookie banner
function hideCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    banner.classList.remove('show');
    setTimeout(() => {
        banner.style.display = 'none';
    }, 400);
}

// Zobrazí cookie nastavení znovu
function showCookieSettings() {
    const banner = document.getElementById('cookieBanner');
    const decision = getCookieDecision();
    
    // Načti aktuální nastavení do checkboxů
    if (decision) {
        if (typeof decision === 'object') {
            document.getElementById('cookieAnalytics').checked = decision.analytics || false;
            document.getElementById('cookieMarketing').checked = decision.marketing || false;
        } else if (decision === 'all') {
            document.getElementById('cookieAnalytics').checked = true;
            document.getElementById('cookieMarketing').checked = true;
        } else {
            document.getElementById('cookieAnalytics').checked = false;
            document.getElementById('cookieMarketing').checked = false;
        }
    }
    
    // Zobraz banner
    banner.style.display = 'block';
    setTimeout(() => {
        banner.classList.add('show');
    }, 10);
}

// Zobrazí notifikaci
function showNotification(message) {
    // Vytvoř notifikační element
    const notification = document.createElement('div');
    notification.className = 'cookie-notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00b894;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: cookieSlideIn 0.3s ease;
        ">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Odstraň po 3 sekundách
    setTimeout(() => {
        notification.style.animation = 'cookieSlideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Přidá CSS pro animace
function addCookieStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cookieSlideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes cookieSlideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ===== INICIALIZACE =====

// Spusť při načtení stránky
document.addEventListener('DOMContentLoaded', function() {
    addCookieStyles();
    initCookieBanner();
});

// Přidej globální funkce
window.acceptAllCookies = acceptAllCookies;
window.saveCookiePreferences = saveCookiePreferences;
window.rejectAllCookies = rejectAllCookies;
window.showCookieSettings = showCookieSettings;
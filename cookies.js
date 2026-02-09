// cookies.js - Produkční cookies systém pro HerníPrůvodce.cz
// GDPR compliant, AdSense ready, Google Analytics 4 ready

// ===== KONFIGURACE =====
const COOKIE_CONFIG = {
    // Zde doplň své skutečné ID při nasazení
    GA_MEASUREMENT_ID: 'G-XXXXXXXXXX', // TODO: Nahraď skutečným Google Analytics ID
    ADSENSE_CLIENT_ID: 'ca-pub-XXXXXXXXXXXXXX', // TODO: Nahraď skutečným AdSense ID
    COOKIE_EXPIRY_DAYS: 365,
    BANNER_DELAY_MS: 1500
};

// ===== HLAVNÍ FUNKCE =====

// Inicializace cookie banneru
function initCookieBanner() {
    const decision = getCookieDecision();
    const banner = document.getElementById('cookieBanner');
    const settingsBtn = document.getElementById('cookieSettingsBtn');
    
    // Pokud uživatel ještě nerozhodl, zobraz banner s delay
    if (!decision) {
        setTimeout(() => {
            if (!getCookieDecision()) { // Double check
                banner.classList.add('show');
                document.body.classList.add('cookie-banner-visible');
            }
        }, COOKIE_CONFIG.BANNER_DELAY_MS);
    } else {
        // Už rozhodl - zobraz tlačítko nastavení
        settingsBtn.style.display = 'flex';
        loadCookiesBasedOnDecision(decision);
        banner.style.display = 'none';
    }
}

// Uložení rozhodnutí uživatele
function saveCookieDecision(preferences) {
    // Ulož do localStorage
    localStorage.setItem('cookieDecision', JSON.stringify(preferences));
    localStorage.setItem('cookieDecisionDate', new Date().toISOString());
    
    // Ulož do cookie pro server-side použití
    setCookie('cookie_consent', JSON.stringify(preferences), COOKIE_CONFIG.COOKIE_EXPIRY_DAYS);
    
    // Zobraz tlačítko nastavení
    document.getElementById('cookieSettingsBtn').style.display = 'flex';
    
    // Načti cookies podle rozhodnutí
    loadCookiesBasedOnDecision(preferences);
    
    // Skryj banner
    hideCookieBanner();
    
    // Zobraz potvrzení
    showNotification('Nastavení cookies uloženo.');
    
    // Odesli event do Google Analytics
    if (typeof gtag !== 'undefined' && preferences.analytics) {
        gtag('event', 'cookie_consent', {
            'event_category': 'cookies',
            'event_label': preferences.marketing ? 'all' : 'analytics_only'
        });
    }
}

// Získání aktuálního rozhodnutí
function getCookieDecision() {
    // Nejprve zkus cookie (pro server-side)
    const cookieConsent = getCookie('cookie_consent');
    if (cookieConsent) {
        try {
            return JSON.parse(cookieConsent);
        } catch (e) {
            // Fallback na localStorage
        }
    }
    
    // Pak localStorage (pro client-side)
    const localStorageDecision = localStorage.getItem('cookieDecision');
    if (!localStorageDecision) return null;
    
    try {
        return JSON.parse(localStorageDecision);
    } catch {
        return null;
    }
}

// ===== AKCE TLAČÍTEK =====

// Přijmout všechny cookies
function acceptAllCookies() {
    saveCookieDecision({
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true,
        version: '1.0'
    });
}

// Uložit vybrané preference
function saveCookiePreferences() {
    const preferences = {
        necessary: true,
        analytics: document.getElementById('cookieAnalytics').checked,
        marketing: document.getElementById('cookieMarketing').checked,
        preferences: document.getElementById('cookiePreferences').checked,
        version: '1.0'
    };
    
    saveCookieDecision(preferences);
}

// Odmítnout vše kromě nezbytných
function rejectAllCookies() {
    saveCookieDecision({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
        version: '1.0'
    });
}

// ===== NAČÍTÁNÍ SKRIPTŮ PODLE SOUHLASU =====

// Načte cookies podle rozhodnutí
function loadCookiesBasedOnDecision(decision) {
    if (!decision) return;
    
    // Stará verze pro zpětnou kompatibilitu
    if (typeof decision === 'string') {
        if (decision === 'all') {
            loadGoogleAnalytics();
            loadGoogleAdSense();
        }
        return;
    }
    
    // Nová verze (object)
    if (decision.analytics) {
        loadGoogleAnalytics();
    }
    
    if (decision.marketing) {
        loadGoogleAdSense();
        loadFacebookPixel(); // Pokud budeš používat
    }
    
    if (decision.preferences) {
        loadPreferenceCookies();
    }
}

// ===== GOOGLE ANALYTICS 4 =====
function loadGoogleAnalytics() {
    if (!COOKIE_CONFIG.GA_MEASUREMENT_ID || COOKIE_CONFIG.GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        console.warn('Google Analytics ID není nastaveno. Nastav COOKIE_CONFIG.GA_MEASUREMENT_ID');
        return;
    }
    
    // Načti Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${COOKIE_CONFIG.GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    
    // Inicializuj Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', COOKIE_CONFIG.GA_MEASUREMENT_ID, {
        'anonymize_ip': true,
        'allow_google_signals': false,
        'allow_ad_personalization': false
    });
    
    console.log('Google Analytics inicializováno');
}

// ===== GOOGLE ADSENSE =====
function loadGoogleAdSense() {
    if (!COOKIE_CONFIG.ADSENSE_CLIENT_ID || COOKIE_CONFIG.ADSENSE_CLIENT_ID === 'ca-pub-XXXXXXXXXXXXXX') {
        console.warn('AdSense Client ID není nastaveno. Nastav COOKIE_CONFIG.ADSENSE_CLIENT_ID');
        return;
    }
    
    // Načti AdSense script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${COOKIE_CONFIG.ADSENSE_CLIENT_ID}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
    
    // Inicializuj reklamní bloky
    setTimeout(() => {
        if (typeof (adsbygoogle = window.adsbygoogle || []) !== 'undefined') {
            try {
                adsbygoogle.push({});
                console.log('Google AdSense inicializováno');
            } catch (e) {
                console.error('Chyba při inicializaci AdSense:', e);
            }
        }
    }, 1000);
}

// ===== FACEBOOK PIXEL (volitelné) =====
function loadFacebookPixel() {
    // Pokud budeš používat Facebook Pixel, odkomentuj:
    /*
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'TVOJE_PIXEL_ID');
    fbq('track', 'PageView');
    */
}

// ===== PREFERENCE COOKIES =====
function loadPreferenceCookies() {
    // Načti preference uživatele (jazyk, téma, atd.)
    const preferences = getCookie('user_preferences');
    if (preferences) {
        try {
            const prefs = JSON.parse(preferences);
            // Aplikuj preference
            if (prefs.theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
            if (prefs.fontSize) {
                document.documentElement.style.fontSize = prefs.fontSize;
            }
        } catch (e) {
            // Ignore
        }
    }
}

// ===== POMOCNÉ FUNKCE =====

// Nastaví cookie
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/;SameSite=Lax" + (location.protocol === 'https:' ? ";Secure" : "");
}

// Získá cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

// Skryje cookie banner
function hideCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    banner.classList.remove('show');
    document.body.classList.remove('cookie-banner-visible');
    setTimeout(() => {
        banner.style.display = 'none';
    }, 400);
}

// Zobrazí cookie nastavení
function showCookieSettings() {
    const banner = document.getElementById('cookieBanner');
    const decision = getCookieDecision();
    
    // Načti aktuální nastavení
    if (decision && typeof decision === 'object') {
        document.getElementById('cookieAnalytics').checked = !!decision.analytics;
        document.getElementById('cookieMarketing').checked = !!decision.marketing;
        document.getElementById('cookiePreferences').checked = !!decision.preferences;
    } else {
        // Výchozí hodnoty
        document.getElementById('cookieAnalytics').checked = true;
        document.getElementById('cookieMarketing').checked = true;
        document.getElementById('cookiePreferences').checked = true;
    }
    
    // Zobraz banner
    banner.style.display = 'block';
    document.body.classList.add('cookie-banner-visible');
    setTimeout(() => {
        banner.classList.add('show');
    }, 10);
    
    // Scroll na banner
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Zobrazí notifikaci
function showNotification(message) {
    // Vytvoř notifikaci
    const notification = document.createElement('div');
    notification.className = 'cookie-notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00b894;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10001;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: cookieSlideIn 0.3s ease;
            max-width: 400px;
            border-left: 4px solid #00d1a9;
        ">
            <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Odstraň po 4 sekundách
    setTimeout(() => {
        notification.style.animation = 'cookieSlideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// ===== GDPR FUNKCE =====

// Export dat uživatele (pro GDPR právo na přenositelnost)
function exportUserData() {
    const data = {
        cookies: getAllCookies(),
        localStorage: getAllLocalStorage(),
        consent: getCookieDecision(),
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `hernipruvodce-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Smaž všechna data uživatele (pro GDPR právo být zapomenut)
function deleteAllUserData() {
    // Smaž všechny cookies
    document.cookie.split(";").forEach(c => {
        const cookieName = c.split("=")[0].trim();
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // Smaž localStorage
    localStorage.clear();
    
    // Smaž sessionStorage
    sessionStorage.clear();
    
    // Smaž indexedDB (pokud používáš)
    if (window.indexedDB) {
        indexedDB.databases().then(dbs => {
            dbs.forEach(db => {
                indexedDB.deleteDatabase(db.name);
            });
        });
    }
    
    // Refresh stránky
    setTimeout(() => {
        location.reload();
    }, 1000);
    
    return 'Všechna data byla smazána. Stránka se obnoví.';
}

// Pomocné funkce
function getAllCookies() {
    return document.cookie.split(';').reduce((cookies, cookie) => {
        const [name, value] = cookie.split('=').map(c => c.trim());
        if (name) cookies[name] = decodeURIComponent(value);
        return cookies;
    }, {});
}

function getAllLocalStorage() {
    return Object.keys(localStorage).reduce((obj, key) => {
        try {
            obj[key] = JSON.parse(localStorage.getItem(key));
        } catch {
            obj[key] = localStorage.getItem(key);
        }
        return obj;
    }, {});
}

// ===== INICIALIZACE =====

// Přidej CSS pro animace
function addCookieStyles() {
    if (document.querySelector('#cookie-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'cookie-styles';
    style.textContent = `
        @keyframes cookieSlideIn {
            from { transform: translateX(100%) translateY(-20px); opacity: 0; }
            to { transform: translateX(0) translateY(0); opacity: 1; }
        }
        @keyframes cookieSlideOut {
            from { transform: translateX(0) translateY(0); opacity: 1; }
            to { transform: translateX(100%) translateY(-20px); opacity: 0; }
        }
        body.cookie-banner-visible {
            padding-bottom: 180px;
        }
        @media (max-width: 768px) {
            body.cookie-banner-visible {
                padding-bottom: 240px;
            }
        }
    `;
    document.head.appendChild(style);
}

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
window.exportUserData = exportUserData;
window.deleteAllUserData = deleteAllUserData;

// Pro debugging v produkci
if (window.location.hostname !== 'localhost' && window.location.protocol !== 'file:') {
    console.log('Cookies systém inicializován. Verze 1.0');
}
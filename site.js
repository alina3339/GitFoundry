/* GitFoundry — shared site utilities
   Loaded with defer on every page. Defines loadGTM() and site() before
   Alpine initialises (defer scripts execute in document order). */

function loadGTM() {
  if (window.__gtmLoaded) return;
  window.__gtmLoaded = true;
  (function(w,d,s,l,i){
    w[l]=w[l]||[];
    w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),
        dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;
    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-P72JB657');
}

function site() {
  const safeGet    = (k,d) => { try { return localStorage.getItem(k)||d; } catch(e) { return d; } };
  const safeSet    = (k,v) => { try { localStorage.setItem(k,v); } catch(e) {} };
  const safeRemove = (k)   => { try { localStorage.removeItem(k); } catch(e) {} };

  const COOKIE_TTL_MS = 365 * 24 * 60 * 60 * 1000;

  function readCookieChoice() {
    const raw = safeGet('gf-cookies','');
    if (!raw) return null;
    try {
      const p = JSON.parse(raw);
      if (p && p.ts && (Date.now()-p.ts) < COOKIE_TTL_MS) return p.choice;
      return null;
    } catch(e) {
      // Legacy plain-string value — upgrade in place so the 365-day TTL starts now
      if (raw==='accepted'||raw==='declined') { writeCookieChoice(raw); return raw; }
      return null;
    }
  }

  function writeCookieChoice(choice) {
    safeSet('gf-cookies', JSON.stringify({ts:Date.now(), choice}));
  }

  return {
    theme:       safeGet('gf-theme','night'),
    drawerOpen:  false,
    cookieVisible: false,

    init() {
      document.documentElement.setAttribute('data-theme', this.theme);
      const choice = readCookieChoice();
      if (choice === 'accepted') { loadGTM(); return; }
      if (choice === 'declined') return;
      // No prior choice — defer the banner until the user has engaged
      const reveal = () => {
        this.cookieVisible = true;
        window.removeEventListener('scroll', onScroll);
        clearTimeout(fallback);
      };
      const onScroll = () => { if (window.scrollY > 200) reveal(); };
      window.addEventListener('scroll', onScroll, { passive: true });
      const fallback = setTimeout(reveal, 8000);
    },

    toggleTheme() {
      this.theme = this.theme === 'night' ? 'day' : 'night';
      safeSet('gf-theme', this.theme);
    },

    acceptCookies() {
      writeCookieChoice('accepted');
      this.cookieVisible = false;
      loadGTM();
    },

    declineCookies() {
      writeCookieChoice('declined');
      this.cookieVisible = false;
    },

    revokeCookies() {
      safeRemove('gf-cookies');
      this.cookieVisible = true;
    }
  };
}

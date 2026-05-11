/* GitFoundry — shared site utilities
   Loaded with defer on every page. Defines loadGTM() and site() before
   Alpine initialises (defer scripts execute in document order). */

/* ── Rabbithole keyboard trigger ────────────────────────────────────────────
   Typing the sequence  r  then  h  within 1500 ms on any page that loads
   this script navigates to rabbithole.html. The sequence is swallowed only
   when neither key is pressed inside an input, textarea, or contenteditable
   element, so it never interferes with form usage.
   ─────────────────────────────────────────────────────────────────────── */
(function () {
  var _seq = '';
  var _timer = null;
  var TARGET = 'rh';
  var WINDOW_MS = 1500;

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    var editable = e.target && e.target.isContentEditable;
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || editable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    _seq += e.key.toLowerCase();
    if (_seq.length > TARGET.length) _seq = _seq.slice(-TARGET.length);

    clearTimeout(_timer);
    _timer = setTimeout(function () { _seq = ''; }, WINDOW_MS);

    if (_seq === TARGET) {
      _seq = '';
      clearTimeout(_timer);
      var dest = window.location.href.replace(/[^/]*$/, '') + 'rabbithole.html';
      window.location.href = dest;
    }
  });
}());

(function () {
  function initPricingSpotlights() {
    document.querySelectorAll('.pricing-card').forEach(function (card) {
      var spot = document.createElement('div');
      spot.className = 'card-spotlight';
      card.appendChild(spot);
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        spot.style.left = (e.clientX - r.left) + 'px';
        spot.style.top  = (e.clientY - r.top)  + 'px';
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPricingSpotlights);
  } else {
    initPricingSpotlights();
  }
}());

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

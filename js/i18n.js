/* i18n.js - Lightweight client-side internationalization
   - Loads locale JSON files (locales/{lang}.json)
   - Replaces all elements with data-i18n="key" attribute
   - Supports: data-i18n, data-i18n-attr, data-i18n-html
   - Persists user choice in localStorage
*/
(function() {
  'use strict';
  const STORAGE_KEY = 'huanan_lang';
  const SUPPORTED = ['zh', 'en', 'th', 'ja'];
  const DEFAULT_LANG = 'zh';
  let currentLang = DEFAULT_LANG;
  let translations = {};

  function getInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.indexOf(saved) >= 0) return saved;
    const browser = (navigator.language || 'zh').slice(0, 2).toLowerCase();
    if (SUPPORTED.indexOf(browser) >= 0) return browser;
    return DEFAULT_LANG;
  }

  async function loadLocale(lang) {
    try {
      const r = await fetch('locales/' + lang + '.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      console.warn('[i18n] failed to load', lang, e);
      return null;
    }
  }

  function applyTranslations(dict) {
    if (!dict) return;
    document.documentElement.lang = currentLang;
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });
    // HTML content (for tags inside)
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
    // Attribute (e.g. placeholder, title, aria-label)
    document.querySelectorAll('[data-i18n-attr]').forEach(function(el) {
      const spec = el.getAttribute('data-i18n-attr'); // e.g. "placeholder:form_name;title:Foo"
      spec.split(';').forEach(function(pair) {
        const [attr, key] = pair.split(':').map(function(s) { return s.trim(); });
        if (attr && key && dict[key] !== undefined) el.setAttribute(attr, dict[key]);
      });
    });
    // Notify listeners (e.g. counter animation may need to re-run)
    document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang: currentLang } }));
  }

  async function setLanguage(lang) {
    if (SUPPORTED.indexOf(lang) < 0) lang = DEFAULT_LANG;
    if (lang === currentLang && Object.keys(translations).length > 0) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    // Update <html lang>
    document.documentElement.lang = lang;
    const dict = await loadLocale(lang);
    if (dict) {
      translations = dict;
      applyTranslations(dict);
    }
    // Update switcher UI
    const sw = document.getElementById('lang-switcher');
    if (sw && sw.value !== lang) sw.value = lang;
  }

  async function init() {
    currentLang = getInitialLang();
    const dict = await loadLocale(currentLang);
    if (dict) {
      translations = dict;
      applyTranslations(dict);
    } else {
      // Fallback: try default
      const fallback = await loadLocale(DEFAULT_LANG);
      if (fallback) { translations = fallback; applyTranslations(fallback); currentLang = DEFAULT_LANG; }
    }
    // Set up switcher
    const sw = document.getElementById('lang-switcher');
    if (sw) {
      sw.value = currentLang;
      sw.addEventListener('change', function(e) { setLanguage(e.target.value); });
    }
  }

  // Expose globally
  window.HuananI18n = { setLanguage, getLang: function() { return currentLang; }, t: function(k) { return translations[k] || k; } };

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

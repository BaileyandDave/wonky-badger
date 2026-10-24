/* Wonky Badger: consent-first Google Analytics 4 */
(function () {
  'use strict';
  const measurementId = 'G-MYYMP0NSX8';
  const key = 'wonky_badger_analytics_consent_v1';
  let enabled = false;
  let consent;
  try { consent = localStorage.getItem(key); } catch (_) { consent = null; }

  function startAnalytics() {
    if (enabled) return;
    enabled = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { anonymize_ip: true });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(tag);
  }

  function closeBanner() {
    const banner = document.getElementById('wb-cookie-banner');
    if (banner) banner.remove();
  }

  function saveConsent(choice) {
    try { localStorage.setItem(key, choice); } catch (_) { /* allow session-only choice */ }
    closeBanner();
    if (choice === 'accepted') startAnalytics();
    else if (enabled) window.location.reload(); // stop existing analytics after withdrawal
  }

  function showBanner() {
    if (document.getElementById('wb-cookie-banner')) return;
    const banner = document.createElement('section');
    banner.id = 'wb-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.innerHTML = '<div class="wb-cookie-copy"><strong>Cookies at the Sett</strong><p>We use optional Google Analytics cookies to understand website visits and music-link clicks. You can accept or reject them. The site works either way.</p></div><div class="wb-cookie-actions"><button type="button" id="wb-reject">Reject optional cookies</button><button type="button" id="wb-accept">Accept analytics</button></div>';
    document.body.appendChild(banner);
    document.getElementById('wb-reject').addEventListener('click', () => saveConsent('rejected'));
    document.getElementById('wb-accept').addEventListener('click', () => saveConsent('accepted'));
  }

  function init() {
    if (consent === 'accepted') startAnalytics();
    else if (consent !== 'rejected') showBanner();
    const footer = document.querySelector('footer');
    if (footer) {
      const preferences = document.createElement('button');
      preferences.type = 'button';
      preferences.className = 'wb-cookie-settings';
      preferences.textContent = 'Cookie settings';
      preferences.addEventListener('click', showBanner);
      footer.appendChild(preferences);
    }
    document.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', () => {
        if (!enabled || typeof window.gtag !== 'function') return;
        let url;
        try { url = new URL(link.href, window.location.href); } catch (_) { return; }
        if (url.origin === window.location.origin || !/^https?:$/.test(url.protocol)) return;
        window.gtag('event', 'outbound_music_link_click', {
          link_url: url.href,
          link_domain: url.hostname,
          link_text: (link.textContent || link.getAttribute('aria-label') || '').trim().slice(0, 100),
          transport_type: 'beacon'
        });
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

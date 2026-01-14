const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export const turnstile = {
  // Render Turnstile widget that auto-verifies (no user action needed)
  // containerOrId can be either a DOM element or an element ID string
  renderAutoVerify(containerOrId, onSuccess, onError) {
    // Skip Turnstile in local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Turnstile verification skipped in local development');
      setTimeout(() => onSuccess(null), 500);
      return;
    }

    if (!window.turnstile) {
      console.error('Turnstile not loaded');
      onError(new Error('Bot protection not loaded'));
      return;
    }

    // Accept either element or ID string
    const container = typeof containerOrId === 'string' 
      ? document.getElementById(containerOrId) 
      : containerOrId;
      
    if (!container) {
      console.error('Turnstile container not found');
      onError(new Error('Turnstile container not found'));
      return;
    }

    window.turnstile.render(container, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => {
        onSuccess(token);
      },
      'error-callback': () => {
        onError(new Error('Bot verification failed'));
      },
      'expired-callback': () => {
        onError(new Error('Verification expired'));
      },
      theme: 'light',
      size: 'normal', // Show Cloudflare widget with logo and loading
    });
  },

  // Legacy invisible verify (kept for backward compatibility)
  async verify() {
    // Skip Turnstile in local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Turnstile verification skipped in local development');
      return null;
    }

    return new Promise((resolve, reject) => {
      if (!window.turnstile) {
        console.error('Turnstile not loaded');
        reject(new Error('Bot protection not loaded'));
        return;
      }

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      document.body.appendChild(container);

      window.turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => {
          document.body.removeChild(container);
          resolve(token);
        },
        'error-callback': () => {
          document.body.removeChild(container);
          reject(new Error('Bot verification failed'));
        },
        theme: 'light',
        size: 'compact',
      });
    });
  },

  loadScript() {
    return new Promise((resolve, reject) => {
      if (window.turnstile) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
};

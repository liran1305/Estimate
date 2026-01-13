const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export const turnstile = {
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

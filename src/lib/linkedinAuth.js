const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
const LINKEDIN_REDIRECT_URI = import.meta.env.VITE_LINKEDIN_REDIRECT_URI;
const LINKEDIN_SCOPE = 'openid profile email';
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

export const linkedinAuth = {
  initiateLogin() {
    const state = this.generateState();
    sessionStorage.setItem('linkedin_oauth_state', state);
    
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', LINKEDIN_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', LINKEDIN_REDIRECT_URI);
    authUrl.searchParams.append('scope', LINKEDIN_SCOPE);
    authUrl.searchParams.append('state', state);
    
    window.location.href = authUrl.toString();
  },

  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  },

  async handleCallback(code, state) {
    const savedState = sessionStorage.getItem('linkedin_oauth_state');
    
    if (state !== savedState) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }
    
    sessionStorage.removeItem('linkedin_oauth_state');
    
    try {
      // Backend returns both token and profile in one response
      const authData = await this.exchangeCodeForToken(code);
      
      const user = {
        id: authData.profile.id,
        name: authData.profile.name,
        email: authData.profile.email,
        picture: authData.profile.picture,
        linkedinId: authData.profile.id,
        accessToken: authData.access_token,
        isOnboarded: false
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('access_token', authData.access_token);
      
      return user;
    } catch (error) {
      console.error('LinkedIn auth error:', error);
      throw error;
    }
  },

  async exchangeCodeForToken(code) {
    // Call secure backend API instead of exposing client secret
    const response = await fetch(`${BACKEND_API_URL}/api/auth/linkedin/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Token exchange failed');
    }

    return response.json();
  },

  isAuthenticated() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    return !!(user && token);
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('reviews');
  }
};

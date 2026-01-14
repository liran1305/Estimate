const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
const LINKEDIN_REDIRECT_URI = import.meta.env.VITE_LINKEDIN_REDIRECT_URI;
const LINKEDIN_SCOPE = 'openid profile email';
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

export const linkedinAuth = {
  initiateLogin(turnstileToken) {
    const state = this.generateState();
    const stateData = {
      state: state,
      timestamp: Date.now(),
      expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
    };
    localStorage.setItem('linkedin_oauth_state', JSON.stringify(stateData));
    
    if (turnstileToken) {
      localStorage.setItem('turnstile_token', turnstileToken);
    }
    
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
    const savedStateStr = localStorage.getItem('linkedin_oauth_state');
    
    if (!savedStateStr) {
      throw new Error('OAuth state not found - please try logging in again');
    }
    
    let savedStateData;
    try {
      savedStateData = JSON.parse(savedStateStr);
    } catch (e) {
      localStorage.removeItem('linkedin_oauth_state');
      throw new Error('Invalid OAuth state - please try logging in again');
    }
    
    // Check if state has expired
    if (Date.now() > savedStateData.expiresAt) {
      localStorage.removeItem('linkedin_oauth_state');
      throw new Error('OAuth session expired - please try logging in again');
    }
    
    if (state !== savedStateData.state) {
      localStorage.removeItem('linkedin_oauth_state');
      throw new Error('Invalid state parameter - possible CSRF attack');
    }
    
    localStorage.removeItem('linkedin_oauth_state');
    
    try {
      // Backend returns user object with matched LinkedIn profile
      const authData = await this.exchangeCodeForToken(code);
      
      const user = {
        id: authData.user.id, // User ID from our database
        linkedinProfileId: authData.user.linkedin_profile_id, // Matched Bright Data profile
        name: authData.user.name,
        email: authData.user.email,
        picture: authData.user.picture,
        accessToken: authData.access_token,
        canUsePlatform: authData.user.can_use_platform,
        matchMethod: authData.user.match_method,
        matchConfidence: authData.user.match_confidence,
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
    const turnstileToken = localStorage.getItem('turnstile_token');
    localStorage.removeItem('turnstile_token');
    
    // Call secure backend API instead of exposing client secret
    const response = await fetch(`${BACKEND_API_URL}/api/auth/linkedin/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        turnstile_token: turnstileToken,
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

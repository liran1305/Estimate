const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
const LINKEDIN_REDIRECT_URI = import.meta.env.VITE_LINKEDIN_REDIRECT_URI;
const LINKEDIN_SCOPE = 'openid profile email';

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
      const tokenResponse = await this.exchangeCodeForToken(code);
      const userProfile = await this.getUserProfile(tokenResponse.access_token);
      
      const user = {
        id: userProfile.sub,
        name: userProfile.name,
        email: userProfile.email,
        picture: userProfile.picture,
        linkedinId: userProfile.sub,
        accessToken: tokenResponse.access_token,
        isOnboarded: false
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('access_token', tokenResponse.access_token);
      
      return user;
    } catch (error) {
      console.error('LinkedIn auth error:', error);
      throw error;
    }
  },

  async exchangeCodeForToken(code) {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: import.meta.env.VITE_LINKEDIN_CLIENT_SECRET,
        redirect_uri: LINKEDIN_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    return response.json();
  },

  async getUserProfile(accessToken) {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch user profile: ${error}`);
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

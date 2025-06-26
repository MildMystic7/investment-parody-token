// Authentication service - handles all auth-related API calls
// This will connect to the backend API when ready

class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:3001/api'; // Backend API URL
  }

  // Development mode login (bypasses real auth)
  async loginDevelopmentMode() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data for development
    const mockUser = {
      id: 'dev-user-1',
      username: 'developer',
      email: 'dev@marketpulse.com',
      isAuthenticated: true,
      mode: 'development'
    };

    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'dev-token-123');
    
    return mockUser;
  }

  // Twitter OAuth login
  async loginWithTwitter() {
    // This will redirect the browser to our backend, which then redirects to Twitter
    window.location.href = `${this.baseURL}/auth/twitter`;
  }

  // Logout
  async logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // This will be called from our /auth/callback page after successful X login
  receiveTwitterAuth() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userString = params.get("user");

    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        return user;
      } catch (error) {
        console.error("Failed to parse user data from URL", error);
        return null;
      }
    }
    return null;
  }
}

export const authService = new AuthService(); 
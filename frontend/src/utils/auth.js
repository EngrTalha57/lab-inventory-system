// frontend/src/utils/auth.js
import { autoLogin, getCurrentUserInfo, logout as apiLogout } from './api';

class AuthManager {
  constructor() {
    this.isInitialized = false;
    this.user = null;
    this.authCheckComplete = false;
    this.listeners = new Set(); // For auth state change listeners
  }

  // Subscribe to auth state changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.user));
  }

  // Initialize auth on app startup
  async init() {
    if (this.isInitialized) return this.getAuthStatus();
    
    try {
      console.log('Starting auth initialization...');
      const token = localStorage.getItem('token');
      
      if (token) {
        // 1. Token exists? Verify it's still valid
        try {
          const userInfo = await getCurrentUserInfo();
          this.setUser(userInfo);
          console.log('User authenticated via token:', userInfo.username);
        } catch (tokenError) {
          // 2. Token invalid? Try auto-login (Remember Me)
          console.warn('Token invalid or expired, checking for remember cookie...');
          await this.tryAutoLogin();
        }
      } else {
        // 3. No token? Check for remember token directly
        await this.tryAutoLogin();
      }
      
      this.authCheckComplete = true;
      this.isInitialized = true;
      
      return this.getAuthStatus();
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.authCheckComplete = true;
      return this.getAuthStatus();
    }
  }

  // Try auto-login using remember token cookie
  async tryAutoLogin() {
    try {
      // API call carries the httpOnly cookie automatically
      const response = await autoLogin();
      
      if (response.user && response.access_token) {
        // Save the fresh token we just got
        localStorage.setItem('token', response.access_token);
        this.setUser(response.user);
        console.log('Auto-login successful for:', response.user.username);
        return true;
      }
    } catch (error) {
      // Expected error if no cookie exists or it's expired
      // console.log('Auto-login not available:', error.response?.data?.detail || error.message);
      this.clearUser();
    }
    return false;
  }

  // Check authentication status
  async checkAuthStatus() {
    if (!this.authCheckComplete) {
      await this.init();
    }
    return this.getAuthStatus();
  }

  // Get current auth status
  getAuthStatus() {
    return {
      isAuthenticated: !!this.user,
      user: this.user,
      isLoading: !this.authCheckComplete
    };
  }

  // Set user after login
  setUser(user) {
    this.user = user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.notifyListeners();
  }

  // Get current user
  getUser() {
    if (!this.user) {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          this.user = JSON.parse(stored);
        } catch (e) {
          console.error("Error parsing stored user data");
        }
      }
    }
    return this.user;
  }

  // Clear user data
  clearUser() {
    this.user = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    this.notifyListeners();
  }

  // Manual logout
  async logout() {
    try {
      await apiLogout(); // Call backend to delete cookie
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.clearUser();
      
      // Force clear all cookies to be safe
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
  }

  // Check if user is authenticated (quick check)
  isAuthenticated() {
    return !!this.user;
  }

  // Check if user has specific role/permission
  hasPermission(permission) {
    if (!this.user) return false;
    return true; // Implement role logic here later
  }
}

// Create a singleton instance
const authManager = new AuthManager();

// Export individual functions for backward compatibility
export const isAuthenticated = () => authManager.isAuthenticated();
export const getUserInfo = () => authManager.getUser();
export const clearAuth = () => authManager.clearUser();
export const logout = () => authManager.logout();

// Export the manager as default
export default authManager;
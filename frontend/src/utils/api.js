// frontend/src/utils/api.js
import axios from 'axios';

// Leave empty because Vite Proxy forwards requests to port 8000
const API_BASE_URL = '';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration and auto-login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const hasRememberToken = document.cookie.includes('remember_token');
      
      if (hasRememberToken) {
        try {
          const autoLoginResponse = await autoLogin();
          
          if (autoLoginResponse.access_token) {
            localStorage.setItem('token', autoLoginResponse.access_token);
            localStorage.setItem('user', JSON.stringify(autoLoginResponse.user));
            
            originalRequest.headers.Authorization = `Bearer ${autoLoginResponse.access_token}`;
            return api(originalRequest);
          }
        } catch (autoLoginError) {
          clearAuthData();
          return Promise.reject(autoLoginError);
        }
      } else {
        clearAuthData();
      }
    }
    return Promise.reject(error);
  }
);

const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
};

// =============== AUTH API FUNCTIONS ===============

export const login = async (username, password, rememberMe = false) => {
  const response = await api.post('/auth/login', { username, password, remember_me: rememberMe });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    if (rememberMe) localStorage.setItem('rememberMe', 'true');
    else localStorage.removeItem('rememberMe');
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const autoLogin = async () => {
  const response = await api.post('/auth/auto-login');
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthData();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }
};

export const getCurrentUserInfo = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) return await autoLogin();
    throw error;
  }
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const verifyRecoveryCode = async (email, recoveryCode) => {
  const response = await api.post('/auth/verify-recovery-code', { email, recovery_code: recoveryCode });
  return response.data;
};

export const resetPassword = async (resetData) => {
  const response = await api.post('/auth/reset-password', resetData);
  return response.data;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => !!localStorage.getItem('token');

export const initializeAuth = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const userInfo = await getCurrentUserInfo();
      return { authenticated: true, user: userInfo };
    } catch (error) {
      return { authenticated: false, error };
    }
  }
  return { authenticated: false };
};


// =============== DATA API FUNCTIONS (With Aliases) ===============
// This section fixes the "does not provide an export named..." errors
// by providing multiple names for the same function.

// --- EQUIPMENT ---
export const getEquipments = () => api.get('/equipments');
export const getEquipment = (id) => api.get(`/equipments/${id}`);
export const createEquipment = (data) => api.post('/equipments', data);
export const addEquipment = createEquipment; // Alias for compatibility
export const updateEquipment = (id, data) => api.put(`/equipments/${id}`, data);
export const deleteEquipment = (id) => api.delete(`/equipments/${id}`);

// --- ISSUES ---
export const getIssues = () => api.get('/issues');
export const createIssue = (data) => api.post('/issues', data);
export const addIssue = createIssue; // Alias
export const createIssueRecord = createIssue; // Alias
export const updateIssue = (id, data) => api.put(`/issues/${id}`, data); // ✅ Used by EditModal
export const updateIssueRecord = updateIssue; // Alias
export const deleteIssue = (id) => api.delete(`/issues/${id}`);
export const deleteIssueRecord = deleteIssue; // Alias

// --- MAINTENANCE ---
export const getMaintenance = () => api.get('/maintenance');
export const createMaintenance = (data) => api.post('/maintenance', data);
export const addMaintenance = createMaintenance; // Alias
export const updateMaintenance = (id, data) => api.put(`/maintenance/${id}`, data);
export const deleteMaintenance = (id) => api.delete(`/maintenance/${id}`);

export default api;



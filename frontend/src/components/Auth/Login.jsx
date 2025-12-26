// frontend/src/components/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../utils/api';
import Logo from '../../components/Logo';
import authManager from '../../utils/auth';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savePassword, setSavePassword] = useState(false);
  const [buttonGlow, setButtonGlow] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const status = await authManager.checkAuthStatus();
      if (status.isAuthenticated) {
        navigate('/', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    
    setError('');
    setLoading(true);
    setButtonGlow(true);

    try {
      const response = await login(formData.username, formData.password, savePassword);
      authManager.setUser(response.user);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 600);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.message || 
                           'Login failed. Please check your credentials.';
      setError(errorMessage);
      setButtonGlow(false);
    } finally {
      setLoading(false);
      setTimeout(() => setButtonGlow(false), 1000);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      display: "grid",
      gridTemplateColumns: "450px 1fr", // Left sidebar fixed width, right side flex
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden",
      backgroundColor: "var(--background)", // ✅ CHANGED: Uses Theme Variable
      color: "var(--text-main)"             // ✅ CHANGED: Uses Theme Variable
    }}>
      
      {/* LEFT PANEL - BRANDING (Centered Content) */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", // Deep Blue/Indigo
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", // Vertically Center
        alignItems: "center",     // Horizontally Center
        textAlign: "center",      // Center Text
        padding: "60px 40px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background Shapes */}
        <div style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-50px",
          left: "-100px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)",
        }} />

        {/* Content Centered */}
        <div style={{ position: "relative", zIndex: 10 }}>
          {/* Logo Centered */}
          <Logo size="large" showText={true} centered={true} variant="light" />
          
          <div style={{ marginTop: "40px" }}>
            <h1 style={{ fontSize: "36px", fontWeight: "800", lineHeight: "1.2", marginBottom: "20px" }}>
              Manage Your Lab <br />
              <span style={{ color: "#818cf8" }}>With Confidence.</span>
            </h1>
            <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#c7d2fe", maxWidth: "340px", margin: "0 auto" }}>
              Join the centralized platform for equipment tracking, maintenance scheduling, and issue reporting.
            </p>
          </div>
        </div>

        {/* Copyright Pinned to Bottom */}
        <div style={{ position: "absolute", bottom: "30px", zIndex: 10, width: "100%", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "#6366f1", opacity: 0.8 }}>
            © {new Date().getFullYear()} T&AS Group. All rights reserved.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN FORM (Centered) */}
      <div className="auth-container" style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        backgroundColor: "var(--background)", // ✅ CHANGED: Uses Theme Variable
        position: "relative"
      }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          
          {/* Header */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-main)", marginBottom: "12px" }}> {/* ✅ CHANGED */}
              Welcome Back
            </h2>
            <p style={{ fontSize: "15px", color: "var(--text-muted)" }}> {/* ✅ CHANGED */}
              Please enter your details to sign in.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#991b1b",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={labelStyle}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: "13px", color: "#4f46e5", fontWeight: "600", textDecoration: "none" }}>
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={inputStyle}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    color: "var(--text-muted)" // ✅ CHANGED
                  }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ marginBottom: "32px", display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                id="remember"
                checked={savePassword}
                onChange={(e) => setSavePassword(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "#4f46e5", marginRight: "8px", cursor: "pointer" }}
              />
              <label htmlFor="remember" style={{ fontSize: "14px", color: "var(--text-muted)", cursor: "pointer" }}> {/* ✅ CHANGED */}
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: buttonGlow ? "0 4px 20px rgba(79, 70, 229, 0.4)" : "none",
                transform: buttonGlow ? "translateY(-1px)" : "none",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer Link */}
          <div style={{ marginTop: "32px", textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}> {/* ✅ CHANGED */}
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#4f46e5", fontWeight: "600", textDecoration: "none" }}>
              Sign up
            </Link>
          </div>

        </div>
      </div>

      {/* Mobile Responsive Style */}
      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="background: linear-gradient"] {
            display: none !important; /* Hide left sidebar on mobile */
          }
        }
      `}</style>
    </div>
  );
}

// Reusable Styles with CSS Variables
const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: "600",
  color: "var(--text-muted)" // ✅ CHANGED from #374151
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "8px",
  border: "1px solid var(--border)", // ✅ CHANGED from #d1d5db
  fontSize: "15px",
  outline: "none",
  transition: "border-color 0.2s",
  color: "var(--text-main)",       // ✅ CHANGED from #1f2937
  backgroundColor: "var(--surface)" // ✅ CHANGED from #f9fafb
};

export default Login;
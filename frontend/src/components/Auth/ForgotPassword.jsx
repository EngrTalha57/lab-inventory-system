// frontend/src/components/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyRecoveryCode, resetPassword } from '../../utils/api';
import Logo from '../../components/Logo';

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    recovery_code: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await forgotPassword(formData.email);
      setMessage(`✅ Recovery code sent to ${formData.email}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send recovery code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyRecoveryCode(formData.email, formData.recovery_code);
      setMessage('✅ Code verified successfully!');
      setTimeout(() => {
        setMessage(''); // Clear message before next step
        setStep(3);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid recovery code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(formData);
      setMessage('✅ Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      display: "grid",
      gridTemplateColumns: "450px 1fr", // Matches Login/Signup Grid
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden",
      backgroundColor: "var(--background)", // ✅ CHANGED
      color: "var(--text-main)"             // ✅ CHANGED
    }}>
      
      {/* LEFT PANEL - BRANDING */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "40px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background Shapes */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-50px", left: "-100px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)" }} />

        <div style={{ position: "relative", zIndex: 10 }}>
          <Logo size="large" showText={true} centered={true} variant="light" />
          
          <div style={{ marginTop: "40px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "800", lineHeight: "1.2", marginBottom: "20px" }}>
              Secure Recovery <br /> <span style={{ color: "#818cf8" }}>Step by Step.</span>
            </h1>
            
            {/* Progress Steps Visual */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px', backdropFilter: 'blur(5px)', marginTop: '20px', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
                <StepItem number={1} label="Enter Email" active={step >= 1} />
                <StepItem number={2} label="Verify Code" active={step >= 2} />
                <StepItem number={3} label="New Password" active={step >= 3} />
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "30px", zIndex: 10, width: "100%", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "#6366f1", opacity: 0.8 }}>© {new Date().getFullYear()} T&AS Group. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="forgot-password-container" style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        backgroundColor: "var(--background)", // ✅ CHANGED
        position: "relative"
      }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          
          {/* Dynamic Header */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-main)", marginBottom: "12px" }}> {/* ✅ CHANGED */}
              {step === 1 && "Reset Password"}
              {step === 2 && "Enter Verification Code"}
              {step === 3 && "Set New Password"}
            </h2>
            <p style={{ fontSize: "15px", color: "var(--text-muted)" }}> {/* ✅ CHANGED */}
              {step === 1 && "Enter your email address to receive a 4-digit recovery code."}
              {step === 2 && `We sent a code to ${formData.email}. Please enter it below.`}
              {step === 3 && "Create a new strong password for your account."}
            </p>
          </div>

          {/* Messages */}
          {message && <div style={{ background: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", display: "flex", gap: "8px", alignItems: "center" }}><span>✅</span> {message}</div>}
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", display: "flex", gap: "8px", alignItems: "center" }}><span>⚠️</span> {error}</div>}

          {/* STEP 1: REQUEST CODE */}
          {step === 1 && (
            <form onSubmit={handleRequestCode}>
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@company.com"
                  style={inputStyle}
                  disabled={loading}
                />
              </div>
              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? "Sending Code..." : "Send Recovery Code"}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY CODE */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode}>
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>4-Digit Code</label>
                <input
                  type="text"
                  name="recovery_code"
                  value={formData.recovery_code}
                  onChange={handleChange}
                  required
                  placeholder="XXXX"
                  maxLength="4"
                  style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: 'bold' }}
                  disabled={loading}
                />
              </div>
              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button type="button" onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontSize: "14px", textDecoration: "underline" }}>
                  Wrong email? Go back
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  style={inputStyle}
                  disabled={loading}
                />
              </div>
              <div style={{ marginBottom: "32px" }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  name="confirm_new_password"
                  value={formData.confirm_new_password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  style={inputStyle}
                  disabled={loading}
                />
              </div>
              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {/* Footer Link */}
          <div style={{ marginTop: "32px", textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}> {/* ✅ CHANGED */}
            Remember your password? <Link to="/login" style={{ color: "#4f46e5", fontWeight: "600", textDecoration: "none" }}>Sign in</Link>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
          div[style*="background: linear-gradient"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// --- Styles & Sub-components ---

const labelStyle = { 
  display: 'block', 
  marginBottom: '8px', 
  fontSize: '14px', 
  fontWeight: '600', 
  color: 'var(--text-muted)' // ✅ CHANGED
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '8px',
  border: '1px solid var(--border)', // ✅ CHANGED
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: 'var(--surface)', // ✅ CHANGED
  color: 'var(--text-main)'          // ✅ CHANGED
};

const buttonStyle = {
  width: '100%',
  padding: '16px',
  background: '#4f46e5',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
};

const StepItem = ({ number, label, active }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: active ? 1 : 0.5, transition: 'opacity 0.3s' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: active ? '#4f46e5' : 'rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            {number}
        </div>
        <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>{label}</span>
    </div>
);

export default ForgotPassword;
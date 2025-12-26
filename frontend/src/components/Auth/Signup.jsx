// frontend/src/components/Auth/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../utils/api';
import Logo from '../../components/Logo';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirm_password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  // State to store the code after successful signup
  const [recoveryCode, setRecoveryCode] = useState(null); 
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await register(formData);
      
      // Capture the code from the backend response
      if (response.recovery_code) {
        setRecoveryCode(response.recovery_code);
      } else {
        // Fallback
        setRecoveryCode("CODE-SENT");
      }
      
    } catch (err) {
      console.error("Signup Error:", err);
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(err.response.data.detail.map(d => d.msg).join(', '));
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkRequirement = (type) => {
    const pwd = formData.password;
    switch(type) {
        case 'length': return pwd.length >= 8;
        case 'upper': return /[A-Z]/.test(pwd);
        case 'number': return /[0-9]/.test(pwd);
        case 'special': return /[^A-Za-z0-9]/.test(pwd);
        default: return false;
    }
  };

  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      display: "grid",
      gridTemplateColumns: "450px 1fr",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden",
      backgroundColor: "var(--background)", // ✅ CHANGED: Theme Variable
      color: "var(--text-main)"             // ✅ CHANGED: Theme Variable
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
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-50px", left: "-100px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)" }} />

        <div style={{ position: "relative", zIndex: 10 }}>
          <Logo size="large" showText={true} centered={true} variant="light" />
          <div style={{ marginTop: "30px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "800", lineHeight: "1.2", marginBottom: "16px" }}>
              Join Our Platform <br /> <span style={{ color: "#818cf8" }}>Get Started Today.</span>
            </h1>
            <p style={{ fontSize: "15px", lineHeight: "1.5", color: "#c7d2fe", maxWidth: "340px", margin: "0 auto" }}>
              Create your account to start tracking equipment, managing issues, and optimizing lab workflows.
            </p>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "20px", zIndex: 10, width: "100%", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "#6366f1", opacity: 0.8 }}>© {new Date().getFullYear()} T&AS Group. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="signup-container" style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "var(--background)", // ✅ CHANGED: Theme Variable
        position: "relative",
        overflowY: "auto"
      }}>
        <div style={{ width: "100%", maxWidth: "500px" }}>
          
          {/* ✅ CONDITIONALLY RENDER: If we have a code, show Success Screen. If not, show Form. */}
          {recoveryCode ? (
            // ================= SUCCESS VIEW =================
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ 
                width: '80px', height: '80px', background: '#ecfdf5', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                color: '#10b981', fontSize: '40px'
              }}>
                🎉
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)", marginBottom: "12px" }}> {/* ✅ CHANGED */}
                Account Created!
              </h2>
              <p style={{ fontSize: "15px", color: "var(--text-muted)", marginBottom: "30px" }}> {/* ✅ CHANGED */}
                Please save your recovery code below. You will need it if you ever forget your password.
              </p>

              {/* THE CODE BOX */}
              <div style={{ 
                background: 'var(--surface)',  // ✅ CHANGED
                border: '2px dashed var(--border)', // ✅ CHANGED
                borderRadius: '12px', 
                padding: '20px', 
                marginBottom: '30px' 
              }}>
                <span style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  textTransform: 'uppercase', 
                  color: 'var(--text-muted)', // ✅ CHANGED
                  fontWeight: '700', 
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  Your Recovery Code
                </span>
                <span style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  color: '#4f46e5', 
                  letterSpacing: '4px',
                  fontFamily: 'monospace'
                }}>
                  {recoveryCode}
                </span>
              </div>

              <button 
                onClick={() => navigate('/login')}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                }}
              >
                Continue to Login →
              </button>
            </div>
          ) : (
            // ================= FORM VIEW (Normal Signup) =================
            <>
              <div style={{ marginBottom: "24px", textAlign: "left" }}>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)", marginBottom: "8px" }}>Create Account</h2> {/* ✅ CHANGED */}
                <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Enter your details to register as a new user.</p> {/* ✅ CHANGED */}
              </div>

              {error && <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>⚠️ {error}</div>}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={labelStyle}>Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required style={inputStyle} placeholder="jdoe" />
                    </div>
                    <div>
                        <label style={labelStyle}>Full Name</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} style={inputStyle} placeholder="John Doe" />
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} placeholder="john@lab.edu" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={labelStyle}>Password</label>
                        <div style={{ position: "relative" }}>
                            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required style={inputStyle} placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeButtonStyle}>{showPassword ? "👁️" : "👁️‍🗨️"}</button>
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Confirm</label>
                        <div style={{ position: "relative" }}>
                            <input type={showConfirmPassword ? "text" : "password"} name="confirm_new_password" value={formData.confirm_password} onChange={handleChange} required style={{ ...inputStyle, borderColor: formData.confirm_password && formData.password !== formData.confirm_password ? '#ef4444' : 'var(--border)' }} placeholder="••••••••" Name="confirm_password" />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeButtonStyle}>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px', fontSize: '11px' }}>
                    <RequirementBadge fulfilled={checkRequirement('length')} label="8+ chars" />
                    <RequirementBadge fulfilled={checkRequirement('upper')} label="Uppercase" />
                    <RequirementBadge fulfilled={checkRequirement('number')} label="Number" />
                    <RequirementBadge fulfilled={checkRequirement('special')} label="Symbol" />
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#94a3b8' : '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)' }}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: "var(--text-muted)" }}> {/* ✅ CHANGED */}
                    Already have an account? <Link to="/login" style={{ color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 900px) {
          div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
          div[style*="background: linear-gradient"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// --- Styles using CSS Variables ---
const labelStyle = { 
  display: 'block', 
  marginBottom: '4px', 
  fontSize: '13px', 
  fontWeight: '600', 
  color: 'var(--text-muted)' // ✅ CHANGED from #374151
};

const inputStyle = { 
  width: '100%', 
  padding: '10px 14px', 
  borderRadius: '8px', 
  border: '1px solid var(--border)', // ✅ CHANGED from #d1d5db
  fontSize: '14px', 
  outline: 'none', 
  transition: 'border-color 0.2s', 
  backgroundColor: 'var(--surface)', // ✅ CHANGED from #f9fafb
  color: 'var(--text-main)'          // ✅ CHANGED from #1f2937
};

const eyeButtonStyle = { 
  position: "absolute", 
  right: "10px", 
  top: "50%", 
  transform: "translateY(-50%)", 
  background: "none", 
  border: "none", 
  cursor: "pointer", 
  fontSize: "14px", 
  color: "var(--text-muted)", // ✅ CHANGED from #9ca3af
  padding: "4px" 
};

const RequirementBadge = ({ fulfilled, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: fulfilled ? '#16a34a' : 'var(--text-muted)', fontWeight: fulfilled ? '600' : '400', transition: 'color 0.2s' }}>
        <span style={{ fontSize: '10px' }}>{fulfilled ? '●' : '○'}</span> {label}
    </div>
);

export default Signup;
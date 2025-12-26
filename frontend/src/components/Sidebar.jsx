// frontend/src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authManager from '../utils/auth';
import Logo from './Logo';

const Sidebar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    await authManager.logout();
    navigate('/login');
  };

  const isActive = (path) => currentPath === path;

  return (
    <div style={{
      width: '280px',
      height: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
      zIndex: 1000,
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* 1. BRANDING HEADER */}
      <div style={{ 
        padding: '30px 20px', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Logo size="large" centered={true} showText={false} />
      </div>

      <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 auto 20px' }}></div>

      {/* 2. USER PROFILE */}
      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}>
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username || 'User'}
            </div>
            <div style={{ fontSize: '10px', color: '#a5b4fc', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></span>
              Online
            </div>
          </div>
        </div>
      </div>

      {/* 3. MENU */}
      <div style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
        <div style={{ 
            fontSize: '12px', 
            fontWeight: '800', 
            color: '#FFFFFF', 
            marginBottom: '10px', 
            paddingLeft: '12px', 
            letterSpacing: '1px', 
            textTransform: 'uppercase',
            opacity: 0.9
        }}>
          Menu
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavItem to="/" icon="⚡" label="Dashboard" active={isActive('/')} />
          <NavItem to="/add-equipment" icon="🖥️" label="Add Equipment" active={isActive('/add-equipment')} />
          <NavItem to="/issue-record" icon="📝" label="Issue Records" active={isActive('/issue-record')} />
          <NavItem to="/maintenance" icon="⚙️" label="Maintenance" active={isActive('/maintenance')} />
        </nav>
      </div>

      {/* 4. LOGOUT (Updated Styles) */}
      <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            // ✅ CHANGED: White Background
            background: '#ffffff',
            // ✅ CHANGED: Dark Sidebar Text Color
            color: '#1e1b4b',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '700', // Bold text
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f1f5f9'; // Slightly grey on hover
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Logout
        </button>
      </div>

    </div>
  );
};

const NavItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 14px',
      textDecoration: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      background: active ? 'linear-gradient(90deg, rgba(79, 70, 229, 0.5) 0%, rgba(79, 70, 229, 0.1) 100%)' : 'transparent',
      color: active ? 'white' : '#cbd5e1',
      borderLeft: active ? '3px solid #818cf8' : '3px solid transparent',
    }}
    onMouseOver={(e) => {
      if (!active) {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.color = 'white';
      }
    }}
    onMouseOut={(e) => {
      if (!active) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#cbd5e1';
      }
    }}
  >
    <span style={{ fontSize: '16px', opacity: active ? 1 : 0.8 }}>{icon}</span>
    {label}
  </Link>
);

export default Sidebar;
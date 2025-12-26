// frontend/src/components/ThemeToggle.jsx
import React from 'react';

const ThemeToggle = ({ isDark, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: isDark ? 'rgba(255,255,255,0.1)' : 'white',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
        padding: '8px 16px',
        borderRadius: '30px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: isDark ? '#fbbf24' : '#64748b',
        boxShadow: isDark ? 'none' : '0 2px 5px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        outline: 'none'
      }}
      title="Toggle Dark Mode"
    >
      <div style={{ fontSize: '16px' }}>
        {isDark ? '🌙' : '☀️'}
      </div>
      <span style={{ 
        fontSize: '12px', 
        fontWeight: '600',
        color: isDark ? '#e2e8f0' : '#475569' 
      }}>
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

export default ThemeToggle;
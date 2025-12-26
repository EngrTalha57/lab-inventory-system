// frontend/src/components/ConfirmModal.jsx
import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div className="glass-panel" style={modalStyle}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ marginBottom: '12px', color: 'var(--text-main)' }}>{title || "Confirm Delete"}</h3>
        <p style={{ marginBottom: '24px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
          {message || "Are you sure you want to delete this record? This action cannot be undone."}
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onClose} style={cancelBtnStyle}>
            No, Keep it
          </button>
          <button onClick={onConfirm} style={confirmBtnStyle}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
};

const modalStyle = {
  width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '20px',
  textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-lg)'
};

const cancelBtnStyle = {
  padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600'
};

const confirmBtnStyle = {
  padding: '10px 20px', borderRadius: '8px', border: 'none',
  background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: '600',
  boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
};

export default ConfirmModal;
import React, { useState } from "react";
import axios from "axios";
import { createEquipment } from "../utils/api";

function AddEquipmentForm({ onSuccess }) {
  // --- Manual Form State (Internal React state) ---
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "",
    lab: "",
    total_quantity: "",     
    available_quantity: "", 
    status: "Available"
  });

  // --- Bulk Upload State ---
  const [file, setFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // --- General UI State ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- HANDLER: Manual Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setValidationErrors([]);

    try {
      // ✅ SYNCED WITH schemas.py: 
      // Changed keys to 'total_qty' and 'available_qty' to match backend
      const payload = {
        name: formData.name,
        code: formData.code,
        category: formData.category,
        lab: formData.lab,
        total_qty: parseInt(formData.total_quantity, 10),     
        available_qty: parseInt(formData.available_quantity, 10), 
        status: formData.status
      };

      await createEquipment(payload);
      
      setFormData({
        name: "", code: "", category: "", lab: "",
        total_quantity: "", available_quantity: "", status: "Available"
      });

      alert("Equipment added successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error adding equipment:", err);
      if (err.response?.data?.detail) {
        setError(Array.isArray(err.response.data.detail) ? err.response.data.detail[0].msg : err.response.data.detail);
      } else {
        setError("Failed to add equipment. Please ensure all fields are correct.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: Bulk CSV Upload ---
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a CSV file first.");

    setLoading(true);
    setError("");
    setValidationErrors([]);

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/equipment/bulk-upload", uploadData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });
      alert("Bulk inventory updated successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err.response?.status === 422) {
        setValidationErrors(err.response.data.detail.messages);
      } else {
        setError("Upload failed. Please check your network or file format.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      gap: '30px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      
      {/* 1. MANUAL REGISTRATION FORM */}
      <div style={panelStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}><span style={{ fontSize: '24px' }}>🖥️</span> Add Equipment</h2>
          <p style={subtitleStyle}>Enter laboratory equipment details one by one.</p>
        </div>

        {error && (
          <div style={errorNotifyStyle}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          <div style={gridStyle}>
            <div style={{ gridColumn: 'span 12' }}>
              <label style={labelStyle}>Equipment Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} placeholder="e.g. Tektronix Digital Oscilloscope" />
            </div>
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Asset Code *</label>
              <input type="text" name="code" value={formData.code} onChange={handleChange} required style={inputStyle} placeholder="DMM-001" />
            </div>
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Category *</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} required style={inputStyle} placeholder="Electronics" />
            </div>
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Lab Location *</label>
              <input type="text" name="lab" value={formData.lab} onChange={handleChange} required style={inputStyle} placeholder="Lab 1" />
            </div>
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Total Qty *</label>
              <input type="number" name="total_quantity" value={formData.total_quantity} onChange={handleChange} required min="1" style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Available Qty *</label>
              <input type="number" name="available_quantity" value={formData.available_quantity} onChange={handleChange} required min="0" style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} style={inputStyle}>
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Faulty">Faulty</option>
              </select>
            </div>
          </div>

          <div style={footerStyle}>
            <button type="button" onClick={() => onSuccess && onSuccess()} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={loading} style={submitBtnStyle}>
              {loading ? "Saving..." : "+ Add Equipment"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. BULK IMPORT SECTION */}
      <div style={{ ...panelStyle, border: '2px dashed var(--border)', padding: '32px' }}>
        <h3 style={bulkTitleStyle}>📥 Bulk Import via CSV</h3>
        <p style={bulkSubtitleStyle}>
          Headers must be: <b>name, code, category, lab, total_qty, status</b>
        </p>

        {validationErrors.length > 0 && (
          <div style={validationBoxStyle}>
            <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>Fix errors in CSV:</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        <div style={bulkActionRowStyle}>
          <input 
            type="file" 
            accept=".csv" 
            onChange={(e) => setFile(e.target.files[0])} 
            style={{ color: 'var(--text-main)', fontSize: '14px' }} 
          />
          <button 
            onClick={handleBulkUpload} 
            disabled={loading || !file} 
            style={bulkUploadBtnStyle}
          >
            {loading ? "Processing..." : "🚀 Upload CSV"}
          </button>
        </div>
      </div>
      
      <style>{`
        input:focus, select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
          outline: none;
        }
      `}</style>
    </div>
  );
}

// Internal Styles Object
const panelStyle = { width: '100%', maxWidth: '850px', background: 'var(--surface)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', overflow: 'hidden' };
const headerStyle = { background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', padding: '24px 32px', color: 'white' };
const titleStyle = { margin: 0, fontSize: '22px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' };
const subtitleStyle = { margin: '6px 0 0 0', opacity: 0.8, fontSize: '14px', paddingLeft: '38px' };
const errorNotifyStyle = { margin: '24px 32px 0', padding: '16px', background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', borderRadius: '6px', fontSize: '14px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' };
const labelStyle = { display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" };
const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px", color: "var(--text-main)", background: "var(--background)" };
const footerStyle = { marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' };
const cancelBtnStyle = { padding: '12px 24px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' };
const submitBtnStyle = { padding: '12px 32px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const bulkTitleStyle = { color: 'var(--text-main)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' };
const bulkSubtitleStyle = { color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' };
const bulkActionRowStyle = { display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' };
const bulkUploadBtnStyle = { padding: '10px 24px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const validationBoxStyle = { background: '#fff1f2', border: '1px solid #fda4af', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#9f1239' };

export default AddEquipmentForm;
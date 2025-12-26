// frontend/src/components/EditModal.jsx
import { useState, useEffect } from "react";
import { updateEquipment, updateIssue, updateMaintenance } from "../utils/api";

const EditModal = ({ isOpen, onClose, data, onSave, title }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      // Create a copy of the data to edit
      setFormData({ ...data });
    }
  }, [data]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. CLEAN THE DATA (Sanitization)
      // We create a new object 'payload' to send to the backend.
      // We remove 'id', 'created_at', and joined objects like 'equipment' 
      // because the backend usually doesn't want them in a PUT request.
      const payload = { ...formData };
      
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;
      delete payload.equipment; // Remove joined equipment details if present
      
      // Fix Empty Dates: Convert empty strings to null
      if (payload.return_date === "") payload.return_date = null;
      if (payload.sent_for_repair_date === "") payload.sent_for_repair_date = null;

      // 2. SEND TO BACKEND
      if (title.toLowerCase().includes("equipment")) {
        await updateEquipment(formData.id, payload);
      } else if (title.toLowerCase().includes("issue")) {
        await updateIssue(formData.id, payload);
      } else if (title.toLowerCase().includes("maintenance")) {
        await updateMaintenance(formData.id, payload);
      }

      // 3. SUCCESS
      onSave(formData); // Update UI
      onClose();        // Close Modal
    } catch (err) {
      console.error("Update failed", err);
      // Show more detailed error if available
      const errMsg = err.response?.data?.detail || "Failed to update record. Please check backend connection.";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // ... (Rest of your styles and helper functions remain the same) ...

  const getStatusOptions = () => {
    const t = title.toLowerCase();
    if (t.includes("equipment")) return ["Available", "Faulty", "Maintenance"];
    if (t.includes("issue")) return ["Issued", "Returned"];
    if (t.includes("maintenance")) return ["Pending", "In Progress", "Completed"];
    return ["Available", "Unavailable"];
  };

  const readOnlyFields = ["id", "created_at", "updated_at"];

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        
        {/* HEADER */}
        <div style={headerStyle}>
          <h3 style={titleStyle}>{title}</h3>
          <button onClick={onClose} style={closeIconStyle} title="Close Modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div className="custom-scrollbar" style={{ maxHeight: "450px", overflowY: "auto", paddingRight: "10px" }}>
            <style>
              {`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; borderRadius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; borderRadius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
              `}
            </style>
            {Object.keys(formData).map((key) => {
              if (readOnlyFields.includes(key)) return null;
              
              return (
                <div key={key} style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>
                    {key.replace(/_/g, " ")}
                  </label>

                  {key === 'status' ? (
                    <select
                      style={inputStyle}
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleChange}
                    >
                      {getStatusOptions().map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  ) : key.includes('date') ? (
                    <input
                      type="date"
                      style={inputStyle}
                      name={key}
                      // Safely handle date string splitting
                      value={formData[key] ? String(formData[key]).split('T')[0] : ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <input
                      style={inputStyle}
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleChange}
                      // Disable ID fields to prevent breaking references
                      disabled={key.includes('_id') || key === 'equipment_name'} 
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* FOOTER */}
          <div style={footerStyle}>
            <button type="button" onClick={onClose} style={cancelButtonStyle} onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={saveButtonStyle} onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'} onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- STYLES (Kept exactly as your professional design) ---
const modalOverlayStyle = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(8px)",
  display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100
};

const modalContentStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "20px",
  width: "95%", maxWidth: "550px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  fontFamily: "'Inter', sans-serif",
  overflow: "hidden",
  animation: "modalFadeIn 0.3s ease-out"
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: "20px 24px",
  borderBottom: "1px solid #e2e8f0",
  background: "#f8fafc"
};

const titleStyle = {
  margin: 0,
  fontSize: "18px",
  fontWeight: "700",
  color: "#1e293b",
  letterSpacing: "-0.025em"
};

const closeIconStyle = {
  border: 'none', background: 'transparent', cursor: 'pointer', color: "#94a3b8",
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '4px', borderRadius: '50%', transition: 'all 0.2s'
};

const labelStyle = {
  display: "block",
  textTransform: "uppercase",
  fontSize: "11px",
  fontWeight: "700",
  color: "#64748b",
  marginBottom: "8px",
  letterSpacing: "0.05em"
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  fontSize: '14px',
  color: "#1e293b",
  backgroundColor: "#f8fafc",
  boxSizing: 'border-box',
  transition: "all 0.2s ease",
  outline: "none"
};

const footerStyle = {
  display: "flex", justifyContent: "flex-end", gap: "12px",
  paddingTop: "20px",
  borderTop: "1px solid #e2e8f0",
  marginTop: "10px"
};

const saveButtonStyle = {
  padding: "12px 24px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  transition: "background 0.2s",
  boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
};

const cancelButtonStyle = {
  padding: "12px 24px",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  transition: "background 0.2s"
};

document.head.insertAdjacentHTML("beforeend", `<style>@keyframes modalFadeIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }</style>`);

export default EditModal;
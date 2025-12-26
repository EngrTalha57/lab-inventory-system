// frontend/src/components/AddIssueForm.jsx
import React, { useState, useEffect } from "react";
import { createIssueRecord, getEquipments } from "../utils/api";

function AddIssueForm({ onSuccess }) {
  // We store the list of available equipment here for the dropdown
  const [equipmentList, setEquipmentList] = useState([]);
  
  const [formData, setFormData] = useState({
    equipment_id: "",
    issued_to: "",
    issued_lab: "",
    quantity: "",
    issue_date: new Date().toISOString().split('T')[0], // Default to today
    return_date: "",
    status: "Issued"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load equipment list when component mounts
  useEffect(() => {
    const fetchEquip = async () => {
      try {
        const res = await getEquipments();
        // Only show equipment that has stock available
        const availableItems = (res.data || []).filter(item => item.available_qty > 0);
        setEquipmentList(availableItems);
      } catch (err) {
        console.error("Failed to load equipment list", err);
      }
    };
    fetchEquip();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Data validation
      if (!formData.equipment_id) {
        throw new Error("Please select an equipment item.");
      }

      const payload = {
        ...formData,
        equipment_id: parseInt(formData.equipment_id),
        quantity: parseInt(formData.quantity)
      };

      await createIssueRecord(payload);
      alert("Issue record created successfully!");
      
      // Reset form (keep date today)
      setFormData({
        equipment_id: "",
        issued_to: "",
        issued_lab: "",
        quantity: "",
        issue_date: new Date().toISOString().split('T')[0],
        return_date: "",
        status: "Issued"
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error creating issue:", err);
      // specific error handling
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to create issue record.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'start',
      padding: '20px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: '850px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', // Emerald Green Theme
          padding: '24px 32px',
          color: 'white',
          borderBottom: '1px solid #1e3a8a'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '22px', 
            fontWeight: '700', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            letterSpacing: '-0.5px'
          }}>
            <span style={{ fontSize: '24px' }}>📝</span> Issue Equipment
          </h2>
          <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '14px', paddingLeft: '38px' }}>
            Assign laboratory assets to students or staff members.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{
            margin: '24px 32px 0',
            padding: '16px',
            background: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            color: '#991b1b',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(12, 1fr)', 
            gap: '24px' 
          }}>
            
            {/* ROW 1: Equipment Selection (Full Width) */}
            <div style={{ gridColumn: 'span 12' }}>
              <label style={labelStyle}>Select Equipment <span style={{color: '#ef4444'}}>*</span></label>
              <div style={{ position: 'relative' }}>
                <select
                  name="equipment_id"
                  value={formData.equipment_id}
                  onChange={handleChange}
                  required
                  style={{...inputStyle, appearance: 'none', cursor: 'pointer'}}
                >
                  <option value="">-- Choose Item to Issue --</option>
                  {equipmentList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Code: {item.code}) — {item.available_qty} Available
                    </option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>▼</div>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Only items with available stock are shown.</p>
            </div>

            {/* ROW 2: Recipient Details */}
            <div style={{ gridColumn: 'span 6' }}>
              <label style={labelStyle}>Issued To (Name) <span style={{color: '#ef4444'}}>*</span></label>
              <input
                type="text"
                name="issued_to"
                value={formData.issued_to}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="e.g. John Doe (Student)"
              />
            </div>
            <div style={{ gridColumn: 'span 6' }}>
              <label style={labelStyle}>Department / Lab <span style={{color: '#ef4444'}}>*</span></label>
              <input
                type="text"
                name="issued_lab"
                value={formData.issued_lab}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="e.g. Computer Lab 01"
              />
            </div>

            {/* ROW 3: Quantity & Dates */}
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Quantity <span style={{color: '#ef4444'}}>*</span></label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Issue Date</label>
              <input
                type="date"
                name="issue_date"
                value={formData.issue_date}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Return Date (Expected)</label>
              <input
                type="date"
                name="return_date"
                value={formData.return_date}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

          </div>

          {/* Footer Actions */}
          <div style={{ 
            marginTop: '40px', 
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px' 
          }}>
            <button 
              type="button" 
              onClick={() => onSuccess && onSuccess()}
              style={{
                padding: '12px 24px',
                background: 'white',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '12px 32px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? "Processing..." : "Confirm Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Styles
const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "12px",
  fontWeight: "700",
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  fontSize: "14px",
  color: "#0f172a",
  fontWeight: "500",
  outline: "none",
  transition: "all 0.2s ease",
  background: "#f8fafc"
};

export default AddIssueForm;
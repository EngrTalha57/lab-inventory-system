// frontend/src/components/AddMaintenanceForm.jsx
import React, { useState, useEffect } from "react";
import { createMaintenance, getEquipments } from "../utils/api";

// ⚠️ IMPORTANT: Do NOT put 'async' here!
function AddMaintenanceForm({ onSuccess }) {
  const [equipmentList, setEquipmentList] = useState([]);
  
  const [formData, setFormData] = useState({
    equipment_id: "",
    fault_description: "",
    fault_date: new Date().toISOString().split('T')[0], // Today
    sent_for_repair_date: "",
    return_from_repair_date: "",
    cost: "",
    status: "Pending"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load equipment list for dropdown
  useEffect(() => {
    // We create an async function INSIDE useEffect
    const fetchEquip = async () => {
      try {
        const res = await getEquipments();
        setEquipmentList(res.data || []);
      } catch (err) {
        console.error("Failed to load equipment", err);
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
      if (!formData.equipment_id) throw new Error("Please select an equipment item.");

      const payload = {
        ...formData,
        equipment_id: parseInt(formData.equipment_id),
        // Convert cost to number if present, otherwise 0
        cost: formData.cost ? parseFloat(formData.cost) : 0
      };

      await createMaintenance(payload);
      alert("Maintenance record logged successfully!");
      
      // Reset form
      setFormData({
        equipment_id: "",
        fault_description: "",
        fault_date: new Date().toISOString().split('T')[0],
        sent_for_repair_date: "",
        return_from_repair_date: "",
        cost: "",
        status: "Pending"
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error creating maintenance record:", err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError(err.message || "Failed to create record.");
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
        {/* Header Section - Amber Theme for Maintenance */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
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
            <span style={{ fontSize: '24px' }}>⚙️</span> Log Maintenance
          </h2>
          <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '14px', paddingLeft: '38px' }}>
            Report faulty equipment or schedule repairs.
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
            
            {/* ROW 1: Equipment Selection */}
            <div style={{ gridColumn: 'span 12' }}>
              <label style={labelStyle}>Select Faulty Asset <span style={{color: '#ef4444'}}>*</span></label>
              <div style={{ position: 'relative' }}>
                <select
                  name="equipment_id"
                  value={formData.equipment_id}
                  onChange={handleChange}
                  required
                  style={{...inputStyle, appearance: 'none', cursor: 'pointer'}}
                >
                  <option value="">-- Choose Equipment --</option>
                  {equipmentList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Code: {item.code})
                    </option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>▼</div>
              </div>
            </div>

            {/* ROW 2: Description */}
            <div style={{ gridColumn: 'span 12' }}>
              <label style={labelStyle}>Fault Description <span style={{color: '#ef4444'}}>*</span></label>
              <textarea
                name="fault_description"
                value={formData.fault_description}
                onChange={handleChange}
                required
                rows="3"
                style={{...inputStyle, resize: 'vertical', minHeight: '80px'}}
                placeholder="Describe the issue (e.g., Screen flickering, won't turn on...)"
              />
            </div>

            {/* ROW 3: Dates & Status */}
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Date Reported <span style={{color: '#ef4444'}}>*</span></label>
              <input
                type="date"
                name="fault_date"
                value={formData.fault_date}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
            
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Sent for Repair</label>
              <input
                type="date"
                name="sent_for_repair_date"
                value={formData.sent_for_repair_date}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Current Status</label>
              <div style={{ position: 'relative' }}>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{...inputStyle, appearance: 'none', cursor: 'pointer'}}
                >
                  <option value="Pending">Pending Review</option>
                  <option value="In Repair">In Repair</option>
                  <option value="Completed">Completed / Fixed</option>
                  <option value="Scrapped">Unfixable (Scrapped)</option>
                </select>
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>▼</div>
              </div>
            </div>

            {/* ROW 4: Optional Cost/Return */}
            <div style={{ gridColumn: 'span 6' }}>
              <label style={labelStyle}>Repair Cost (Optional)</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                style={inputStyle}
              />
            </div>
            
             <div style={{ gridColumn: 'span 6' }}>
              <label style={labelStyle}>Return Date (If Fixed)</label>
              <input
                type="date"
                name="return_from_repair_date"
                value={formData.return_from_repair_date}
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
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? "Saving..." : "Log Maintenance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reuse styles from other forms for consistency
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

export default AddMaintenanceForm;
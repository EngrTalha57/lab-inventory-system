// frontend/src/components/EquipmentTable.jsx
import React, { useState } from "react";

const EquipmentTable = ({ data, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter logic: Checks ID, Name, Code, and Category
  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    const id = item.id ? item.id.toString() : "";
    const name = item.name ? item.name.toLowerCase() : "";
    const code = item.code ? item.code.toLowerCase() : "";
    const category = item.category ? item.category.toLowerCase() : "";

    return (
      id.includes(term) ||
      name.includes(term) ||
      code.includes(term) ||
      category.includes(term)
    );
  });

  return (
    <div>
      {/* 🔍 Search Bar Section */}
      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "16px",
              color: "#9ca3af",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by ID, Name, Code, or Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 10px 10px 40px", // Left padding for icon
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4f46e5";
              e.target.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        
        {/* Result Counter */}
        <div style={{ fontSize: "13px", color: "#6b7280" }}>
          Showing {filteredData.length} of {data.length} items
        </div>
      </div>

      {/* 📋 Table Section */}
      <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#ffffff",
            fontFamily: "sans-serif",
            fontSize: "14px",
          }}
        >
          <thead style={{ backgroundColor: "#f9fafb", color: "#374151" }}>
            <tr>
              <th style={headerStyle}>ID</th>
              <th style={headerStyle}>Name</th>
              <th style={headerStyle}>Code</th>
              <th style={headerStyle}>Category</th>
              <th style={headerStyle}>Lab</th>
              <th style={headerStyle}>Total Qty</th>
              <th style={headerStyle}>Available</th>
              <th style={headerStyle}>Status</th>
              <th style={{ ...headerStyle, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                  No matching equipment found.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb", transition: "background 0.1s" }}>
                  <td style={{ ...cellStyle, fontWeight: "600", color: "#6b7280" }}>#{item.id}</td>
                  <td style={{ ...cellStyle, fontWeight: "500", color: "#111827" }}>{item.name}</td>
                  <td style={cellStyle}>{item.code}</td>
                  <td style={cellStyle}>
                    <span style={{ 
                      padding: "2px 8px", 
                      borderRadius: "12px", 
                      background: "#eff6ff", 
                      color: "#1e40af", 
                      fontSize: "12px", 
                      fontWeight: "500" 
                    }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={cellStyle}>{item.lab}</td>
                  <td style={cellStyle}>{item.total_qty}</td>
                  <td style={{ ...cellStyle, color: item.available_qty > 0 ? "#059669" : "#dc2626", fontWeight: "600" }}>
                    {item.available_qty}
                  </td>
                  <td style={cellStyle}>
                     <span style={getStatusStyle(item.status)}>{item.status}</span>
                  </td>
                  <td style={{ ...cellStyle, textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button onClick={() => onEdit && onEdit(item)} style={editBtnStyle}>
                        Edit
                      </button>
                      <button onClick={() => onDelete && onDelete(item.id)} style={deleteBtnStyle}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Styles ---

const headerStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid #e5e7eb",
};

const cellStyle = {
  padding: "12px 16px",
  color: "#374151",
};

const editBtnStyle = {
  padding: "6px 12px",
  cursor: "pointer",
  backgroundColor: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "500",
  color: "#374151",
  transition: "all 0.2s",
};

const deleteBtnStyle = {
  padding: "6px 12px",
  cursor: "pointer",
  backgroundColor: "#ffffff", // Clean white look for delete too, until hovered
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "500",
  color: "#dc2626",
  transition: "all 0.2s",
};

const getStatusStyle = (status) => {
  const s = status ? status.toLowerCase() : "";
  const base = { padding: "2px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "500" };
  
  if (s === "available") return { ...base, background: "#d1fae5", color: "#065f46" };
  if (s === "maintenance") return { ...base, background: "#fef3c7", color: "#92400e" };
  if (s === "faulty") return { ...base, background: "#fee2e2", color: "#991b1b" };
  return { ...base, background: "#f3f4f6", color: "#374151" };
};

export default EquipmentTable;
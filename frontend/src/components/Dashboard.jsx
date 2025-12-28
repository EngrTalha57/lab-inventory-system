// frontend/src/components/Dashboard.jsx
import React, { useState } from "react";
import EquipmentTable from "./EquipmentTable"; 
import { getEquipments, getIssueRecords, getMaintenanceRecords } from "../utils/api";
// ... imports for components ...
// --- Stat Card Component ---
const StatCard = ({ title, value, icon }) => (
  <div style={{
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    color: 'white',
    padding: '24px',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.2s ease',
    cursor: 'default'
  }}
  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div>
      <div style={{ 
        fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', 
        fontWeight: '600', opacity: 0.8, marginBottom: '8px' 
      }}>
        {title}
      </div>
      <div style={{ fontSize: '36px', fontWeight: '800' }}>
        {value}
      </div>
    </div>
    <div style={{
      width: '50px', height: '50px', borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '24px', border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {icon}
    </div>
  </div>
);

// --- Helper: Status Badge ---
const getStatusBadge = (status) => {
  const s = status ? status.toLowerCase() : "";
  let bg = "#f3f4f6";
  let color = "#374151";
  
  if (s === "available" || s === "returned" || s === "completed") { bg = "#dcfce7"; color = "#166534"; }
  else if (s === "issued" || s === "pending") { bg = "#fef9c3"; color = "#854d0e"; }
  else if (s === "faulty" || s === "maintenance") { bg = "#fee2e2"; color = "#991b1b"; }
  else if (s === "in progress") { bg = "#dbeafe"; color = "#1e40af"; }

  return (
    <span style={{
      padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: "600",
      backgroundColor: bg, color: color, textTransform: "capitalize"
    }}>
      {status || "-"}
    </span>
  );
};

// --- Helper: Tab Button ---
const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    style={{
      padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer",
      fontWeight: "600", fontSize: "14px", transition: "all 0.2s",
      backgroundColor: active ? "var(--primary)" : "transparent",
      color: active ? "white" : "var(--text-muted)",
      boxShadow: active ? "0 4px 6px -1px rgba(79, 70, 229, 0.3)" : "none"
    }}
  >
    {label}
  </button>
);

const Dashboard = ({
  equipment = [],
  issues = [],
  maintenance = [],
  onEditEquipment,
  onDeleteEquipment,
  onEditIssue,
  onDeleteIssue,
  onEditMaintenance,
  onDeleteMaintenance,
}) => {
  const [activeTab, setActiveTab] = useState("equipment");
  const [searchTerm, setSearchTerm] = useState("");

  // Stats Logic
  const totalEquipment = equipment.length;
  const faultyCount = equipment.filter((e) => e.status === "Faulty").length;
  const activeIssues = issues.filter((i) => !i.return_date).length;
  const activeMaintenance = maintenance.filter((m) => m.status !== "Completed").length;

  // Search Match Helper
  const matches = (value) => {
    if (!value) return false;
    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
  };

  // Filtered Lists
  const filteredEquipment = equipment.filter(item => (
    matches(item.name) || matches(item.equipment_name) || matches(item.code) || 
    matches(item.asset_id) || matches(item.category) || matches(item.lab) || matches(item.status)
  ));

  const filteredIssues = issues.filter(item => {
    const equipName = item.equipment?.name || item.equipment?.equipment_name || "";
    return (
      matches(item.student_name) || matches(item.issued_to) || matches(item.registration_no) || 
      matches(item.equipment_id) || matches(equipName) || matches(item.status)
    );
  });

  const filteredMaintenance = maintenance.filter(item => {
    const equipName = item.equipment?.name || item.equipment?.equipment_name || "";
    return (
      matches(item.id) || matches(item.equipment_id) || matches(equipName) || 
      matches(item.fault_description) || matches(item.status)
    );
  });

  // --- CSV EXPORT FUNCTION ---
// --- Updated CSV EXPORT FUNCTION in Dashboard.jsx ---
const exportToCSV = () => {
  let dataToExport = [];
  let headers = [];
  let filename = "report.csv";

  if (activeTab === "equipment") {
    filename = "Equipment_Inventory.csv";
    headers = ["ID", "Name", "Code", "Category", "Lab", "Total Qty", "Available", "Status"];
    dataToExport = filteredEquipment.map(item => [
      item.id, 
      `"${item.name || item.equipment_name || ''}"`, 
      item.code || '', 
      item.category || '', 
      item.lab || '', 
      // ✅ FIX: Change item.total_quantity to item.total_qty
      item.total_qty || 0, 
      // ✅ FIX: Change item.available_quantity to item.available_qty
      item.available_qty || 0, 
      item.status || ''
    ]);
  // ... rest of the function remains same
    } else if (activeTab === "issues") {
      filename = "Issue_Records.csv";
      headers = ["ID", "Asset ID", "Issued To", "Lab", "Qty", "Date Issued", "Return Date", "Status"];
      dataToExport = filteredIssues.map(item => [
        item.id, item.equipment_id, `"${item.student_name || item.issued_to || ''}"`, 
        `"${item.lab_location || item.issued_lab || ''}"`, item.quantity, 
        item.issue_date, item.return_date || "Pending", item.status
      ]);
    } else if (activeTab === "maintenance") {
      filename = "Maintenance_Log.csv";
      headers = ["ID", "Asset ID", "Fault Description", "Reported Date", "Repaired Date", "Status"];
      dataToExport = filteredMaintenance.map(item => [
        item.id, item.equipment_id, `"${item.fault_description || ''}"`, 
        item.fault_date, item.sent_for_repair_date || "Pending", item.status
      ]);
    }

    const csvContent = [
      headers.join(","),
      ...dataToExport.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-container">
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard title="Total Equipments" value={totalEquipment} icon="⚡" />
        <StatCard title="Faulty Items" value={faultyCount} icon="⚠️" />
        <StatCard title="Active Issues" value={activeIssues} icon="📋" />
        <StatCard title="In Maintenance" value={activeMaintenance} icon="⚙️" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", gap: "8px", background: "var(--surface)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border)" }}>
          <TabButton active={activeTab === "equipment"} onClick={() => setActiveTab("equipment")} label="Equipment" />
          <TabButton active={activeTab === "issues"} onClick={() => setActiveTab("issues")} label="Issues" />
          <TabButton active={activeTab === "maintenance"} onClick={() => setActiveTab("maintenance")} label="Maintenance" />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: "relative", width: "250px" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", opacity: 0.5 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%", padding: "10px 10px 10px 40px", borderRadius: "8px",
                border: "1px solid var(--border)", fontSize: "14px",
                backgroundColor: "var(--surface)", color: "var(--text-main)",
                outline: "none"
              }}
            />
          </div>

          <button 
            onClick={exportToCSV} 
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', background: 'var(--primary)', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', transition: 'background 0.2s',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
            }}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      <div className="table-container">
        {activeTab === "equipment" && (
          <EquipmentTable data={filteredEquipment} onEdit={onEditEquipment} onDelete={onDeleteEquipment} />
        )}

        {activeTab === "issues" && (
           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
             <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
               <tr>
                 {['ID', 'Asset ID', 'Issued To', 'Lab', 'Qty', 'Date Issued', 'Return Date', 'Status', 'Actions'].map(h => (
                   <th key={h} style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                 ))}
               </tr>
             </thead>
             <tbody>
               {filteredIssues.map((x) => (
                 <tr key={x.id} style={{ borderBottom: '1px solid var(--border)' }}>
                   <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)' }}>#{x.id}</td>
                   <td style={{ padding: '16px' }}>{x.equipment_id}</td>
                   <td style={{ padding: '16px', fontWeight: '500' }}>{x.student_name || x.issued_to}</td>
                   <td style={{ padding: '16px' }}>{x.lab_location || x.issued_lab}</td>
                   <td style={{ padding: '16px' }}>{x.quantity}</td>
                   <td style={{ padding: '16px' }}>{x.issue_date}</td>
                   <td style={{ padding: '16px' }}>{x.return_date || <span style={{color: 'var(--text-muted)'}}>--</span>}</td>
                   <td style={{ padding: '16px' }}>{getStatusBadge(x.status)}</td>
                   <td style={{ padding: '16px' }}>
                     <div style={{ display: 'flex', gap: '8px' }}>
                       <button onClick={() => onEditIssue(x)} style={iconBtnStyle}>Edit</button>
                       <button onClick={() => onDeleteIssue(x.id)} style={{...iconBtnStyle, color: '#ef4444', borderColor: '#fca5a5'}}>Delete</button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}

        {activeTab === "maintenance" && (
           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
             <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
               <tr>
                 {['ID', 'Asset ID', 'Fault', 'Reported', 'Repaired', 'Status', 'Actions'].map(h => (
                   <th key={h} style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                 ))}
               </tr>
             </thead>
             <tbody>
               {filteredMaintenance.map((m) => (
                 <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                   <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)' }}>#{m.id}</td>
                   <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--primary)' }}>{m.equipment_id}</td>
                   <td style={{ padding: '16px' }}>{m.fault_description}</td>
                   <td style={{ padding: '16px' }}>{m.fault_date}</td>
                   <td style={{ padding: '16px' }}>{m.sent_for_repair_date || <span style={{color: 'var(--text-muted)'}}>Pending</span>}</td>
                   <td style={{ padding: '16px' }}>{getStatusBadge(m.status)}</td>
                   <td style={{ padding: '16px' }}>
                     <div style={{ display: 'flex', gap: '8px' }}>
                       <button onClick={() => onEditMaintenance(m)} style={iconBtnStyle}>Edit</button>
                       <button onClick={() => onDeleteMaintenance(m.id)} style={{...iconBtnStyle, color: '#ef4444', borderColor: '#fca5a5'}}>Delete</button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}
      </div>
    </div>
  );
};

const iconBtnStyle = { 
  background: 'transparent', 
  border: '1px solid var(--border)', 
  color: 'var(--text-muted)', 
  padding: '6px 12px', 
  borderRadius: '6px', 
  fontSize: '12px', 
  fontWeight: '600', 
  cursor: 'pointer',
  transition: 'all 0.2s'
};
// Example usage in Dashboard.jsx
const handleDeleteSelected = async () => {
  if (window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) {
    try {
      await bulkDeleteEquipment(selectedIds);
      alert("Items deleted successfully");
      setSelectedIds([]); // Clear selection
      fetchEquipments();  // Refresh your table data
    } catch (error) {
      alert("Failed to delete items");
    }
  }
};
export default Dashboard;

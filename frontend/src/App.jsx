// frontend/src/App.jsx
import { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

// Components
import Sidebar from './components/Sidebar'; 
import Dashboard from "./components/Dashboard";
import AddEquipmentForm from "./components/AddEquipmentForm";
import AddIssueForm from "./components/AddIssueForm";
import AddMaintenanceForm from "./components/AddMaintenanceForm";
import EditModal from "./components/EditModal";
import ThemeToggle from "./components/ThemeToggle"; 
import ConfirmModal from "./components/ConfirmModal"; // ✅ Import the new ConfirmModal

// Auth Components
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ForgotPassword from "./components/Auth/ForgotPassword";

// Utils
import { 
  getEquipments, getIssues, getMaintenance, 
  deleteEquipment, deleteIssue, deleteMaintenance 
} from "./utils/api"; // ✅ Ensure delete functions are imported
import authManager from "./utils/auth";
import './App.css';

// --- Loading Spinner ---
const LoadingSpinner = () => (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
  }}>
    <div style={{ textAlign: 'center', color: 'white' }}>
      <div style={{
        width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.3)',
        borderTopColor: '#ffffff', borderRadius: '50%',
        animation: 'spin 1s linear infinite', margin: '0 auto 20px'
      }} />
      <h3 style={{ fontWeight: 500, letterSpacing: '1px' }}>Loading System...</h3>
    </div>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState({ loading: true, isAuthenticated: false });
  useEffect(() => {
    const checkAuth = async () => {
      const status = await authManager.checkAuthStatus();
      setAuthStatus({ loading: false, isAuthenticated: status.isAuthenticated });
    };
    checkAuth();
  }, []);
  if (authStatus.loading) return <LoadingSpinner />;
  if (!authStatus.isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// --- Main Layout for Dashboard Pages ---
function AppContent({ isDarkMode }) {
  const [user, setUser] = useState(authManager.getUser());
  
  // Data State
  const [equipment, setEquipment] = useState([]);
  const [issues, setIssues] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  
  // Modal State (Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editType, setEditType] = useState("");

  // Modal State (Delete Confirmation) ✅
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    id: null,
    type: null // 'equipment', 'issue', or 'maintenance'
  });

  const navigate = useNavigate();
  const location = useLocation();

  const loadData = useCallback(async () => {
    try {
      const [eqRes, issRes, maintRes] = await Promise.all([
        getEquipments(), getIssues(), getMaintenance(),
      ]);
      setEquipment(eqRes.data || []);
      setIssues(issRes.data || []);
      setMaintenance(maintRes.data || []);
    } catch (err) {
      console.error("Error loading data", err);
      if (err.response && err.response.status === 401) authManager.logout(); 
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
    const unsubscribe = authManager.subscribe(setUser);
    return unsubscribe;
  }, [user, loadData]);

  // --- Handlers ---
  const handleEdit = (item, type) => {
    setCurrentEditItem(item);
    setEditType(type);
    setIsModalOpen(true);
  };

  // Trigger the confirmation popup ✅
  const openDeleteConfirm = (id, type) => {
    setConfirmDelete({ isOpen: true, id, type });
  };

  // Perform the actual deletion after user confirms ✅
  const handleFinalDelete = async () => {
    const { id, type } = confirmDelete;
    try {
      if (type === 'equipment') await deleteEquipment(id);
      if (type === 'issue') await deleteIssue(id);
      if (type === 'maintenance') await deleteMaintenance(id);
      
      setConfirmDelete({ isOpen: false, id: null, type: null });
      loadData(); // Refresh data after deletion
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete record. Please try again.");
    }
  };

  const handleFormSuccess = () => {
    loadData(); 
    navigate('/'); 
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      <Sidebar user={user} />

      <main style={{ 
        flex: 1, 
        marginLeft: "280px", 
        padding: "32px 40px", 
        position: "relative",
        width: "calc(100% - 280px)" 
      }}>
        
        {location.pathname === '/' && (
          <header style={{ marginBottom: "32px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: isDarkMode ? 'white' : '#1e293b', margin: 0 }}>
                Dashboard Overview
              </h1>
              <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: "4px", fontSize: "14px" }}>
                Welcome back, {user?.username || 'User'}
              </p>
            </div>
          </header>
        )}
        
        <Routes>
          <Route path="/" element={
            <Dashboard 
              equipment={equipment} 
              issues={issues} 
              maintenance={maintenance} 
              onEditEquipment={(item) => handleEdit(item, "equipment")}
              onDeleteEquipment={(id) => openDeleteConfirm(id, "equipment")}
              onEditIssue={(item) => handleEdit(item, "issue")}
              onDeleteIssue={(id) => openDeleteConfirm(id, "issue")}
              onEditMaintenance={(item) => handleEdit(item, "maintenance")}
              onDeleteMaintenance={(id) => openDeleteConfirm(id, "maintenance")}
            />
          } />
          <Route path="/add-equipment" element={<AddEquipmentForm onSuccess={handleFormSuccess} />} />
          <Route path="/issue-record" element={<AddIssueForm onSuccess={handleFormSuccess} />} />
          <Route path="/maintenance" element={<AddMaintenanceForm onSuccess={handleFormSuccess} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </main>

      {/* Edit Modal */}
      <EditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={currentEditItem} 
        title={`Edit ${editType}`} 
        onSave={(updated) => { setIsModalOpen(false); loadData(); }} 
      />

      {/* Delete Confirmation Modal ✅ */}
      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={handleFinalDelete}
        title={`Delete ${confirmDelete.type?.charAt(0).toUpperCase() + confirmDelete.type?.slice(1)}`}
        message={`Are you sure you want to delete this ${confirmDelete.type} record? This action cannot be undone.`}
      />
      
    </div>
  );
}

// --- Root App ---
function App() {
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  useEffect(() => { 
    authManager.init().then(() => setAuthInitialized(true)); 
  }, []);

  if (!authInitialized) return <LoadingSpinner />;

  return (
    <div 
      className={isDarkMode ? 'app-container dark-mode' : 'app-container'}
      style={{ 
        minHeight: "100vh",
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', 
        color: isDarkMode ? '#f1f5f9' : '#1e293b',
        transition: 'background-color 0.3s ease, color 0.3s ease',
        position: 'relative'
      }}
    >
      
      <div style={{ position: 'fixed', top: '24px', right: '40px', zIndex: 9999 }}>
        <ThemeToggle isDark={isDarkMode} toggleTheme={toggleTheme} />
      </div>

      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <AppContent isDarkMode={isDarkMode} />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>

    </div>
  );
}

export default App;
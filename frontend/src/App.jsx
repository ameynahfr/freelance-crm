import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";

// Pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";
import Clients from "./pages/Clients.jsx";
import Invoices from "./pages/Invoices.jsx";
import Profile from "./pages/Profile.jsx";
import Team from "./pages/Team.jsx";
import MyTasks from "./pages/MyTasks.jsx";
import AgentProfile from "./pages/AgentProfile.jsx";
import ClientDetails from "./pages/ClientDetails.jsx";

// Enhanced Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--os-canvas)]">
        <div className="bg-[var(--os-bg)] px-5 py-2.5 rounded-full text-[var(--os-text-main)] text-sm font-medium animate-pulse">
          Syncing Workspace...
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          // Use your OS variables here
          style: {
            background: 'var(--os-surface)',
            color: 'var(--os-text-main)',
            border: '1px solid var(--os-border)',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '12px 20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: 'var(--os-surface)' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: 'var(--os-surface)' },
          },
        }}
      />
      <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* --- Protected Routes --- */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
      
      {/* 🎯 SMART ROUTING: Both routes use MyTasks.jsx */}
      {/* 1. General Workload */}
      <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
      {/* 2. Project-Specific Kanban Board */}
      <Route path="/projects/:projectId/board" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />

      <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/clients/:id" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
      <Route path="/team/:memberId" element={<ProtectedRoute><AgentProfile /></ProtectedRoute>} />
      
      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  );
}
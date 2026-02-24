import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";

// Pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx"; // NEW IMPORT
import Tasks from "./pages/Tasks.jsx";
import Clients from "./pages/Clients.jsx";
import Invoices from "./pages/Invoices.jsx";
import Profile from "./pages/Profile.jsx";
import Team from "./pages/Team.jsx";
import MyTasks from "./pages/MyTasks.jsx";

// Enhanced Protected Route with Loading State
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#D2C9D8]">
        <div className="bg-[#35313F] px-5 py-2.5 rounded-full text-white text-sm font-medium animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* --- Protected Routes --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
      {/* NEW: Dedicated Project Details Page */}
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      {/* We can keep this route as a fallback or for direct linking to just tasks */}
      <Route
        path="/tasks/project/:projectId"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Invoices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <Team />
          </ProtectedRoute>
        }
      />
      <Route path="/my-tasks" element={<MyTasks />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; 
import {
  FaThLarge,
  FaProjectDiagram,
  FaTasks,
  FaUserFriends,
  FaFileInvoiceDollar,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUsers
} from "react-icons/fa";
import { useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth(); 
  const [isOpen, setIsOpen] = useState(false);

  // Base Menu (Accessible by all agents)
  const menuItems = [
    { path: "/dashboard", label: "Overview", icon: <FaThLarge /> },
    { path: "/team", label: "Agency Team", icon: <FaUsers /> },
    { path: "/projects", label: "Projects", icon: <FaProjectDiagram /> },
    { path: "/my-tasks", label: "My Workload", icon: <FaTasks /> },
  ];

  // 🔒 SECURITY: Restrict Invoices and Clients to Management only
  if (user?.role === "owner" || user?.role === "manager") {
    menuItems.push(
      { path: "/clients", label: "Clients", icon: <FaUserFriends /> },
      { path: "/invoices", label: "Invoices", icon: <FaFileInvoiceDollar /> }
    );
  }

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--os-bg)] text-[var(--os-text-main)] rounded-xl shadow-lg border border-white/10"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[var(--os-bg)] border-r border-[#5B5569]/30 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 flex flex-col justify-between shadow-2xl md:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-8">
            
            {/* 🚀 OMNI NODE SVG LOGO */}
            <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Outer Orbital Ring (Slow Spin) */}
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" className="text-[var(--os-text-muted)] opacity-60 animate-[spin_12s_linear_infinite]" />
                {/* Inner Structure Ring */}
                <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.5" className="text-[var(--os-text-main)] opacity-80" />
                {/* The "Node" (Pulsing Core) */}
                <circle cx="16" cy="16" r="4" fill="var(--os-accent)" className="drop-shadow-[0_0_8px_var(--os-accent)] animate-pulse" />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-[var(--os-text-main)] tracking-tight">
              Omni<span className="text-[var(--os-text-muted)] font-bold">Node</span>
            </h1>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-[var(--os-accent)]/50 via-[#5B5569]/30 to-transparent mb-2" />
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar py-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)} 
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group
                ${isActive(item.path) 
                  ? "bg-[var(--os-canvas)] text-[#35313F] shadow-lg shadow-[#D2C9D8]/20 translate-x-1" 
                  : "text-[var(--os-text-muted)] hover:bg-white/5 hover:text-[var(--os-text-main)] hover:translate-x-1"}
              `}
            >
              <span className={`text-lg transition-transform ${isActive(item.path) ? "scale-110" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-2 border-t border-[#5B5569]/30 pt-6">
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
              ${isActive("/profile") 
                ? "bg-[var(--os-surface)] text-[var(--os-text-main)] border border-white/10 shadow-md" 
                : "text-[var(--os-text-muted)] hover:bg-white/5 hover:text-[var(--os-text-main)]"}
            `}
          >
            <FaUser /> Profile
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
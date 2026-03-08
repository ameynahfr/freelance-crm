import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useNavigate } from "react-router-dom"; // 🚀 NEW: Import useNavigate
import { FaBell, FaSun, FaMoon, FaExclamationTriangle, FaTasks, FaInfoCircle } from "react-icons/fa";

// 🚀 API LAYER IMPORTS
import { getNotifications, markNotificationRead, clearAllNotifications } from "../api/notificationApi";

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate(); // 🚀 NEW: Initialize navigate
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  
  // 🚀 NOTIFICATION STATE
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Notifications
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to sync system alerts");
      }
    };
    if (user) fetchTelemetry();
  }, [user]);

  // Theme logic
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 🚀 UPDATED: Mark single as read AND Navigate
  const handleMarkRead = async (id, link) => {
    // 1. Close the dropdown so it's not open when they arrive at the new page
    setShowNotifs(false);

    // 2. Optimistic UI Update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    
    // 3. Teleport the user to the relevant page
    if (link) {
      navigate(link);
    }

    // 4. Update the database silently in the background
    try { await markNotificationRead(id); } catch (err) { /* silent fail */ }
  };

  // Clear all
  const handleClearAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try { await clearAllNotifications(); } catch (err) { /* silent fail */ }
  };

  // Helper icon rendering based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'deadline_warning': return <FaExclamationTriangle size={12} />;
      case 'task_assigned': return <FaTasks size={12} />;
      case 'system_update': 
      case 'project_alert': return <FaInfoCircle size={12} />;
      default: return <FaBell size={12} />;
    }
  };

  return (
    <header className="w-full bg-transparent flex-shrink-0 border-b border-[var(--os-border)] z-50 relative">
      <div className="max-w-[1600px] mx-auto w-full flex justify-between items-center pl-20 pr-5 md:px-8 py-4">
        
        <div>
          <h2 className="text-lg font-bold text-[var(--os-text-main)] tracking-tight">
            Hello, {user?.name?.split(" ")[0] || "Agent"}! 👋
          </h2>
          <p className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-[0.2em] mt-0.5">
            {today} • {theme === 'dark' ? 'Night Ops' : 'Day Mission'} Active
          </p>
        </div>

        <div className="flex items-center gap-3 md:gap-4 relative">
          
          <button onClick={toggleTheme} className="group relative p-2.5 bg-[var(--os-surface)] rounded-xl text-[var(--os-text-muted)] hover:text-[var(--os-accent)] transition-all border border-[var(--os-border)] shadow-sm active:scale-95 overflow-hidden">
            <div className={`transition-transform duration-500 ease-out ${theme === 'dark' ? 'rotate-0' : 'rotate-[360deg]'}`}>
              {theme === "dark" ? <FaSun size={15} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" /> : <FaMoon size={15} className="text-indigo-500" />}
            </div>
          </button>

          {/* 🚀 NOTIFICATION BELL & DROPDOWN */}
          <div ref={notifRef} className="relative">
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className={`relative p-2.5 rounded-xl transition-all border shadow-sm ${showNotifs ? 'bg-[var(--os-bg)] border-[var(--os-accent)] text-[var(--os-accent)]' : 'bg-[var(--os-surface)] border-[var(--os-border)] text-[var(--os-text-muted)] hover:text-[var(--os-text-main)]'}`}
            >
              <FaBell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--os-surface)] shadow-sm animate-pulse"></span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-3 w-80 bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-50">
                <div className="p-4 border-b border-[var(--os-border)] flex justify-between items-center bg-[var(--os-bg)]/50">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[var(--os-text-main)]">System Alerts</h3>
                  <span className="text-[9px] font-bold bg-[var(--os-bg)] px-2 py-1 rounded text-[var(--os-text-muted)]">{unreadCount} New</span>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-[var(--os-text-muted)] text-xs font-bold">No active alerts.</div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        // 🚀 PASS THE LINK TO THE HANDLER
                        onClick={() => handleMarkRead(notif._id, notif.link)}
                        className={`p-4 border-b border-[var(--os-border)] last:border-0 transition-colors cursor-pointer hover:bg-[var(--os-bg)] flex gap-3 ${notif.isRead ? 'opacity-60' : 'bg-[var(--os-surface)]'}`}
                      >
                        <div className={`mt-1 flex-shrink-0 ${notif.type === 'deadline_warning' ? 'text-rose-400' : 'text-[var(--os-accent)]'}`}>
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs ${notif.isRead ? 'font-medium' : 'font-bold'} text-[var(--os-text-main)] leading-relaxed`}>{notif.message}</p>
                        </div>
                        {!notif.isRead && <div className="w-2 h-2 rounded-full bg-[var(--os-accent)] mt-1.5 shadow-[0_0_8px_var(--os-accent)]"></div>}
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-3 border-t border-[var(--os-border)] bg-[var(--os-bg)]/50 text-center">
                  <button onClick={handleClearAll} className="text-[10px] font-black uppercase tracking-widest text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] transition-colors w-full py-1">
                    Clear All Telemetry
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[var(--os-accent)] to-white/20 p-0.5 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="h-full w-full rounded-[10px] bg-[var(--os-bg)] flex items-center justify-center overflow-hidden border border-[var(--os-border)]">
              <img src={user?.profilePic || "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_35.png"} alt="profile" className="w-full h-full object-cover" />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
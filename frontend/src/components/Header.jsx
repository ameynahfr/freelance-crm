import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { FaBell, FaSun, FaMoon } from "react-icons/fa";

export default function Header() {
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // 🚀 THEME ENGINE: Syncs the HTML attribute with local state
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="w-full bg-transparent flex-shrink-0 border-b border-[var(--os-border)] z-20 relative">
      <div className="max-w-[1600px] mx-auto w-full flex justify-between items-center pl-20 pr-5 md:px-8 py-4">
        
        {/* Left: Greeting - Now uses Dynamic Text Tokens */}
        <div>
          <h2 className="text-lg font-bold text-[var(--os-text-main)] tracking-tight">
            Hello, {user?.name?.split(" ")[0] || "Agent"}! 👋
          </h2>
          <p className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-[0.2em] mt-0.5">
            {today} • {theme === 'dark' ? 'Night Ops' : 'Day Mission'} Active
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* 🌓 THEME TOGGLE: Integrated with smooth rotation */}
          <button 
            onClick={toggleTheme}
            className="group relative p-2.5 bg-[var(--os-surface)] rounded-xl text-[var(--os-text-muted)] hover:text-[var(--os-accent)] transition-all border border-[var(--os-border)] shadow-sm active:scale-95 overflow-hidden"
          >
            <div className={`transition-transform duration-500 ease-out ${theme === 'dark' ? 'rotate-0' : 'rotate-[360deg]'}`}>
              {theme === "dark" ? (
                <FaSun size={15} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
              ) : (
                <FaMoon size={15} className="text-indigo-500" />
              )}
            </div>
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 bg-[var(--os-surface)] rounded-xl text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] transition-all border border-[var(--os-border)] shadow-sm">
            <FaBell size={16} />
            <span className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--os-surface)] shadow-sm"></span>
          </button>

          {/* User Identity Avatar - Adaptive Colors */}
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[var(--os-accent)] to-white/20 p-0.5 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="h-full w-full rounded-[10px] bg-[var(--os-bg)] flex items-center justify-center overflow-hidden border border-[var(--os-border)]">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-black text-[var(--os-text-main)]">{user?.name?.charAt(0) || "?"}</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
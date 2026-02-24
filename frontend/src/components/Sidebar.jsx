import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; 
import { logout } from "../redux/authSlice"; 
import { useAuth } from "../hooks/useAuth"; // Import useAuth to check role
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth(); // Get logged-in user details
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout()); 
    navigate("/login");
  };

  // Base Menu (For everyone)
  const menuItems = [
    { path: "/dashboard", label: "Overview", icon: <FaThLarge /> },
    { path: "/team", label: "Agency Team", icon: <FaUsers /> },
    { path: "/projects", label: "Projects", icon: <FaProjectDiagram /> },
    { path: "/my-tasks", label: "My Workload", icon: <FaTasks /> },
  ];

  // 🔒 RESTRICTED ITEMS: Only for Owners/Managers
  if (user?.role !== "member") {
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
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#35313F] text-white rounded-xl shadow-lg border border-white/10 hover:bg-[#464153] transition-colors"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#35313F] border-r border-[#5B5569]/30 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 flex flex-col justify-between shadow-2xl md:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-[#D2C9D8] rounded-lg flex items-center justify-center text-[#35313F] font-black text-xl shadow-inner">F</div>
            <h1 className="text-xl font-bold text-white tracking-tight">Freelance<span className="text-[#A29EAB]">OS</span></h1>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#5B5569]/50 to-transparent" />
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar py-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)} 
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative overflow-hidden
                ${isActive(item.path) 
                  ? "bg-[#D2C9D8] text-[#35313F] shadow-lg shadow-[#D2C9D8]/20 translate-x-1" 
                  : "text-[#A29EAB] hover:bg-white/5 hover:text-white hover:translate-x-1"}
              `}
            >
              <span className={`text-lg relative z-10 ${isActive(item.path) ? "scale-110" : "group-hover:scale-110"} transition-transform duration-200`}>
                {item.icon}
              </span>
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-2 border-t border-[#5B5569]/30 pt-6">
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200
              ${isActive("/profile") 
                ? "bg-[#464153] text-white border border-white/10 shadow-md" 
                : "text-[#A29EAB] hover:bg-white/5 hover:text-white"}
            `}
          >
            <FaUser /> Profile
          </Link>

          <button
            onClick={handleLogout}
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
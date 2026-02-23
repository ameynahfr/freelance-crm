import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // Assuming you use Redux for auth state
import { logout } from "../redux/authSlice"; // Adjust path to your auth slice
import {
  FaThLarge,
  FaProjectDiagram,
  FaTasks,
  FaUserFriends,
  FaFileInvoiceDollar,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  // If you aren't using Redux yet, you can replace this with a local storage clear function
  const handleLogout = () => {
    dispatch(logout()); // or localStorage.removeItem('token');
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", label: "Overview", icon: <FaThLarge /> },
    { path: "/projects", label: "Projects", icon: <FaProjectDiagram /> },
    { path: "/tasks", label: "My Tasks", icon: <FaTasks /> },
    { path: "/clients", label: "Clients", icon: <FaUserFriends /> },
    { path: "/invoices", label: "Invoices", icon: <FaFileInvoiceDollar /> },
  ];

  const isActive = (path) => {
    // Matches exact path or sub-paths (e.g., /projects/123 highlights Projects)
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button (Hamburger) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#35313F] text-white rounded-xl shadow-lg border border-white/10"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#35313F] border-r border-[#5B5569]/30 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 flex flex-col justify-between
          ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}
      >
        {/* Logo Area */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-[#D2C9D8] rounded-lg flex items-center justify-center text-[#35313F] font-black text-xl">
              F
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Freelance<span className="text-[#A29EAB]">OS</span></h1>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#5B5569]/50 to-transparent" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)} // Close mobile menu on click
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group
                ${isActive(item.path) 
                  ? "bg-[#D2C9D8] text-[#35313F] shadow-lg shadow-[#D2C9D8]/20" 
                  : "text-[#A29EAB] hover:bg-white/5 hover:text-white"}
              `}
            >
              <span className={`text-lg ${isActive(item.path) ? "scale-110" : "group-hover:scale-110"} transition-transform duration-200`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions (Profile & Logout) */}
        <div className="p-4 mt-auto space-y-2">
          <Link
            to="/profile"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200
              ${isActive("/profile") 
                ? "bg-[#464153] text-white border border-white/10" 
                : "text-[#A29EAB] hover:bg-white/5 hover:text-white"}
            `}
          >
            <FaUser /> Profile
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
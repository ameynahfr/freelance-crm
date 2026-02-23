import { NavLink, Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaProjectDiagram,
  FaTasks,
  FaFileInvoiceDollar,
  FaSignOutAlt,
  FaUserFriends,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Sidebar() {
  const { logout } = useAuth();

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
    { name: "Projects", path: "/projects", icon: <FaProjectDiagram /> },
    { name: "Tasks", path: "/tasks", icon: <FaTasks /> },
    { name: "Clients", path: "/clients", icon: <FaUserFriends /> },
    { name: "Invoices", path: "/invoices", icon: <FaFileInvoiceDollar /> },
  ];

  return (
    <aside className="w-16 lg:w-20 flex flex-col items-center py-5 lg:py-6 h-full bg-[#35313F] md:bg-transparent border-r border-white/5 z-20 flex-shrink-0">
      <div className="mb-8 lg:mb-10">
        <h1 className="text-lg lg:text-xl font-bold text-white tracking-tighter">
          CRM
        </h1>
      </div>

      <nav className="flex-1 flex flex-col gap-4 w-full items-center">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `relative group flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-white text-[#35313F] shadow-md scale-105"
                  : "text-[#A29EAB] hover:bg-[#464153] hover:text-white"
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span className="absolute left-14 lg:left-16 bg-[#464153] text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-50">
              {link.name}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-5">
        {/* Restored Dicebear Avatar */}
        <Link
          to="/profile"
          className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-[#464153] overflow-hidden cursor-pointer hover:border-white transition-colors block"
        >
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            alt="User avatar"
            className="w-full h-full object-cover bg-[#D2C9D8]"
          />
        </Link>

        <button
          onClick={logout}
          className="relative group flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-full text-[#A29EAB] hover:bg-[#464153] hover:text-rose-400 transition-all duration-300"
        >
          <span className="text-lg">
            <FaSignOutAlt />
          </span>
          <span className="absolute left-14 lg:left-16 bg-[#464153] text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-50">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}

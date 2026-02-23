import { useAuth } from "../hooks/useAuth.jsx";
import { FaBell } from "react-icons/fa";

export default function Header() {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="w-full bg-transparent flex-shrink-0 border-b border-white/5 z-20 relative">
      {/* FIX APPLIED:
        - pl-20: Adds 80px left padding on mobile so text clears the fixed hamburger button.
        - md:px-8: Resets to standard 32px padding on desktop screens (where hamburger is hidden).
      */}
      <div className="max-w-[1600px] mx-auto w-full flex justify-between items-center pl-20 pr-5 md:px-8 py-4">
        
        {/* Left: Personalized Greeting */}
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Hello, {user?.name?.split(" ")[0] || "Freelancer"}! 👋
          </h2>
          <p className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-widest mt-0.5">
            {today} • Let's get to work
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          
          {/* Notification Icon */}
          <button className="relative p-2.5 bg-[#464153] rounded-xl text-[#A29EAB] hover:text-white hover:bg-white/10 transition-all group">
            <FaBell size={16} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#464153] group-hover:border-[#5B5569]"></span>
          </button>

          {/* User Avatar Circle */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#D2C9D8] to-white p-0.5 shadow-lg">
            <div className="h-full w-full rounded-full bg-[#35313F] flex items-center justify-center text-xs font-bold text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : "F"}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
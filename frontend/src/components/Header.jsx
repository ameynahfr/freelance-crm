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
      <div className="max-w-[1600px] mx-auto w-full flex justify-between items-center pl-20 pr-5 md:px-8 py-4">
        
        {/* Left: Greeting */}
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
          <button className="relative p-2.5 bg-[#464153] rounded-xl text-[#A29EAB] hover:text-white transition-all">
            <FaBell size={16} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#464153]"></span>
          </button>

          {/* 🖼️ Updated User Avatar */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#D2C9D8] to-white p-0.5 shadow-lg">
            <div className="h-full w-full rounded-full bg-[#35313F] flex items-center justify-center overflow-hidden">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">{user?.name?.charAt(0) || "F"}</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
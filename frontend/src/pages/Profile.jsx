import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { updateProfile } from "../redux/authSlice";
import { FaUser, FaLock, FaSave, FaEdit, FaTimes, FaPalette } from "react-icons/fa";

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=James",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Luna",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Nala",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Bear",
];

export default function Profile() {
  const dispatch = useDispatch();
  const { user, loading: isSyncing } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setSelectedAvatar(user.profilePic || AVATAR_OPTIONS[0]);
    }
  }, [user]);

  // 🚀 THE FIX: This function is now explicitly called via onClick
  const handleUpdateProfile = async () => {
    console.log("🖱️ UPDATE BUTTON DETECTED CLICK"); // IF THIS SHOWS, THE BUTTON WORKS
    setMessage({ type: "", text: "" });

    if (password && password !== confirmPassword) {
      console.log("❌ Validation Error: Passwords mismatch");
      return setMessage({ type: "error", text: "Passwords do not match." });
    }

    try {
      console.log("📡 Dispatching updateProfile to Redux...");
      const result = await dispatch(updateProfile({ 
        name, 
        email, 
        password: password || undefined, 
        profilePic: selectedAvatar 
      })).unwrap();

      console.log("✅ REDUX SUCCESS:", result);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("❌ REDUX REJECTED:", err);
      setMessage({ type: "error", text: typeof err === 'string' ? err : "Failed to update" });
    }
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setSelectedAvatar(user.profilePic);
    }
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  return (
    <div className="h-screen w-full bg-[#D2C9D8] p-0 md:p-3 lg:p-4 font-sans text-white overflow-hidden flex">
      <div className="flex flex-1 bg-[#35313F] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-10 relative">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">OS Settings</h1>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="bg-white text-[#35313F] px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition shadow-sm flex items-center gap-2">
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                  {message.text}
                </div>
              )}

              {isEditing ? (
                /* --- EDIT MODE --- */
                <div className="bg-[#464153] rounded-[2rem] p-8 border border-white/5 shadow-inner space-y-10">
                  
                  {/* Avatar Select */}
                  <div>
                    <h3 className="text-xs font-bold text-[#A29EAB] uppercase tracking-widest mb-4"><FaPalette className="inline mr-2"/> Choice of Identity</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {AVATAR_OPTIONS.map((url, idx) => (
                        <button key={idx} type="button" onClick={() => setSelectedAvatar(url)} className={`relative rounded-2xl overflow-hidden border-4 transition-all h-20 w-20 ${selectedAvatar === url ? "border-white bg-[#35313F] scale-110 shadow-xl" : "border-transparent opacity-40 hover:opacity-100"}`}>
                          <img src={url} alt="option" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#A29EAB] uppercase ml-1">Full Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#35313F] border-none rounded-xl px-5 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-white outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#A29EAB] uppercase ml-1">Work Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#35313F] border-none rounded-xl px-5 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-white outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#A29EAB] uppercase ml-1">New Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#35313F] border-none rounded-xl px-5 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-white outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#A29EAB] uppercase ml-1">Confirm Password</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#35313F] border-none rounded-xl px-5 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-white outline-none" />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
                    <button type="button" onClick={handleCancel} className="px-8 py-4 rounded-2xl text-xs font-black uppercase text-[#A29EAB] hover:text-white transition">Cancel</button>
                    
                    {/* 🚀 THE CRITICAL BUTTON */}
                    <button 
                      type="button" 
                      onClick={handleUpdateProfile} 
                      disabled={isSyncing}
                      className="bg-white text-[#35313F] px-10 py-4 rounded-2xl text-xs font-black uppercase hover:bg-[#D2C9D8] transition shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isSyncing ? "Syncing..." : "Update Profile"}
                    </button>
                  </div>
                </div>
              ) : (
                /* --- VIEW MODE --- */
                <div className="bg-[#464153] rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl flex flex-col md:flex-row items-center gap-10">
                  <div className="w-40 h-40 rounded-[2.5rem] border-4 border-[#35313F] bg-[#D2C9D8] flex items-center justify-center shadow-xl overflow-hidden">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#35313F] animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-[10px] font-black text-[#A29EAB] uppercase tracking-[0.3em] mb-2">Authenticated OS Member</p>
                    <h2 className="text-4xl font-black text-white mb-2">{user?.name}</h2>
                    <p className="text-[#A29EAB] font-bold mb-6">{user?.email}</p>
                    <div className="inline-block bg-[#35313F] text-[#D2C9D8] text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest border border-white/5">
                      {user?.role}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { Link, useNavigate } from "react-router-dom";

// 🚀 Curated Cool Avatars
const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=James",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Luna",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Nala",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Bear",
];

export default function Register() {
  const { register, error, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register({ name, email, password, profilePic: selectedAvatar });
    if (result.meta.requestStatus === 'fulfilled') navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D2C9D8] p-4 font-sans text-white">
      <div className="flex w-full max-w-5xl bg-[#35313F] rounded-[2rem] shadow-2xl overflow-hidden min-h-[600px]">
        
        {/* LEFT: Branding */}
        <div className="hidden lg:flex lg:w-2/5 p-12 flex-col justify-between bg-gradient-to-b from-[#464153] to-[#35313F]">
          <div>
            <div className="w-10 h-10 bg-[#D2C9D8] rounded-xl flex items-center justify-center text-[#35313F] font-black text-2xl mb-8">F</div>
            <h1 className="text-4xl font-bold text-white mb-4">Start your Agency.</h1>
            <p className="text-[#A29EAB] leading-relaxed">The operating system for modern freelancers and small studios.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-white font-bold text-sm">Role: Agency Owner</p>
              <p className="text-[#A29EAB] text-xs">You'll have full control over projects and team.</p>
            </div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="flex-1 p-8 lg:p-12 bg-[#F2EAE3] text-[#35313F] m-3 rounded-[1.5rem] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <h2 className="text-3xl font-black mb-2">Create Account</h2>
            <p className="text-[#847F8D] mb-8 font-medium">Join the agency network in seconds.</p>

            {/* AVATAR PICKER */}
            <div className="mb-8">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#847F8D] block mb-4">Choose your Avatar</label>
              <div className="grid grid-cols-6 gap-3">
                {AVATAR_OPTIONS.map((url, idx) => (
                  <button
                    key={idx} type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all p-1 ${selectedAvatar === url ? "border-[#35313F] bg-white scale-110 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={url} alt="avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#847F8D] block mb-1.5 ml-2">Full Name</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-white text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#D2C9D8]" placeholder="e.g. Ali Khan" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#847F8D] block mb-1.5 ml-2">Work Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-white text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#D2C9D8]" placeholder="ali@agency.com" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#847F8D] block mb-1.5 ml-2">Password</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-white text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#D2C9D8]" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="w-full mt-8 py-4 bg-[#35313F] text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all transform active:scale-95">
              Launch my OS
            </button>

            <p className="text-center mt-6 text-xs font-bold text-[#847F8D]">
              Already a member? <Link to="/login" className="text-[#35313F] underline">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
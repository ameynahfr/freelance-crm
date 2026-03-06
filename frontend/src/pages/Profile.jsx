import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { updateProfile } from "../redux/authSlice.jsx";
import { 
  FaUser, FaLock, FaSave, FaEdit, FaPalette, FaShieldAlt, 
  FaEnvelope, FaCode, FaChartLine, FaHistory, FaProjectDiagram,
  FaCheckCircle, FaSatelliteDish, FaFingerprint, FaTimes
} from "react-icons/fa";

// 🚀 API LAYER IMPORTS
import { getProjects } from "../api/projectApi";
import { getMyTasks } from "../api/taskApi";

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
  const { user, loading: isSyncing, token } = useAuth();

  const [stats, setStats] = useState({ activeProjects: 0, completedTasks: 0, totalTasks: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", selectedAvatar: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Fetch Real Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([getProjects(), getMyTasks()]);
        setStats({
          activeProjects: projRes.data.filter(p => p.status === 'active').length,
          completedTasks: taskRes.data.filter(t => t.status === 'done').length,
          totalTasks: taskRes.data.length
        });
      } catch (err) { console.error("Stats Sync Failed"); }
    };
    if (token) fetchStats();
  }, [token]);

  const efficiency = useMemo(() => 
    stats.totalTasks === 0 ? 0 : Math.round((stats.completedTasks / stats.totalTasks) * 100)
  , [stats]);

  // 2. Sync form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        selectedAvatar: user.profilePic || AVATAR_OPTIONS[0]
      });
    }
  }, [user, isEditing]);

  const handleUpdateProfile = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      return setMessage({ type: "error", text: "Security keys do not match." });
    }
    try {
      await dispatch(updateProfile({ 
        name: formData.name, email: formData.email, 
        password: formData.password || undefined, profilePic: formData.selectedAvatar 
      })).unwrap();
      setMessage({ type: "success", text: "Identity synchronized." });
      setIsEditing(false);
    } catch (err) { setMessage({ type: "error", text: "Sync failed." }); }
  };

  return (
    <div className="h-screen w-full bg-[#D2C9D8] p-0 md:p-3 lg:p-4 font-sans text-white overflow-hidden flex">
      <div className="flex flex-1 bg-[#35313F] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative border border-white/5">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
              
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-black tracking-tighter uppercase">Agent Parameters</h1>
                  <p className="text-[10px] text-[#A29EAB] uppercase font-bold tracking-[0.3em] mt-1">System ID: {user?._id?.slice(-8).toUpperCase()}</p>
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="bg-white text-[#35313F] px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D2C9D8] transition shadow-lg flex items-center gap-2">
                    <FaEdit /> Modify Access
                  </button>
                )}
              </div>

              {/* Identity Card */}
              <div className="bg-[#464153] rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                <div className="w-40 h-40 rounded-[2.5rem] border-4 border-[#35313F] bg-[#D2C9D8] flex items-center justify-center shadow-2xl overflow-hidden">
                  <img src={user?.profilePic} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-5xl font-black tracking-tighter mb-2">{user?.name}</h2>
                  <p className="text-[#A29EAB] font-bold text-lg mb-6 flex items-center justify-center md:justify-start gap-2">
                    <FaEnvelope size={14} className="opacity-50"/> {user?.email}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <div className="bg-[#35313F] px-4 py-1.5 rounded-lg border border-white/5 text-[9px] font-black uppercase tracking-widest text-[#D2C9D8]">
                       {user?.role} ACCESS
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard icon={<FaProjectDiagram className="text-indigo-400" />} label="Active Projects" value={stats.activeProjects} />
                <MetricCard icon={<FaChartLine className="text-emerald-400" />} label="Efficiency Rate" value={`${efficiency}%`} />
                <MetricCard icon={<FaHistory className="text-amber-400" />} label="Tasks Done" value={stats.completedTasks} />
              </div>

              {/* Edit Modal Logic */}
              {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#35313F]/95 backdrop-blur-md">
                  <div className="bg-[#464153] w-full max-w-2xl rounded-[3rem] p-8 border border-white/10 shadow-2xl space-y-8 animate-in zoom-in duration-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-black uppercase tracking-widest">Update Identity</h2>
                      <button onClick={() => setIsEditing(false)} className="text-[#A29EAB] hover:text-white"><FaTimes /></button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-6 gap-2">
                        {AVATAR_OPTIONS.map((url, i) => (
                          <button key={i} onClick={() => setFormData({...formData, selectedAvatar: url})} className={`rounded-xl overflow-hidden border-2 transition-all ${formData.selectedAvatar === url ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40'}`}>
                            <img src={url} alt="nav" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputBox label="Alias" value={formData.name} onChange={(val) => setFormData({...formData, name: val})} />
                        <InputBox label="Secure Channel" value={formData.email} onChange={(val) => setFormData({...formData, email: val})} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <InputBox label="New Key" type="password" value={formData.password} onChange={(val) => setFormData({...formData, password: val})} />
                        <InputBox label="Confirm Key" type="password" value={formData.confirmPassword} onChange={(val) => setFormData({...formData, confirmPassword: val})} />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                      <button onClick={() => setIsEditing(false)} className="text-[10px] font-black uppercase tracking-widest text-[#A29EAB]">Abort</button>
                      <button onClick={handleUpdateProfile} disabled={isSyncing} className="bg-white text-[#35313F] px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl disabled:opacity-30">
                        {isSyncing ? "Syncing..." : "Commit Changes"}
                      </button>
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

// 🛠️ Sub-components
function MetricCard({ icon, label, value }) {
  return (
    <div className="bg-[#464153]/60 p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
      <div className="text-2xl mb-4">{icon}</div>
      <h4 className="text-4xl font-black mb-1">{value}</h4>
      <p className="text-[10px] font-black text-[#A29EAB] uppercase tracking-widest">{label}</p>
    </div>
  );
}

function InputBox({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-[#A29EAB] uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type} value={value} onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-[#35313F] border-none rounded-xl px-5 py-4 text-xs font-bold text-white focus:ring-1 focus:ring-[#D2C9D8] outline-none" 
      />
    </div>
  );
}
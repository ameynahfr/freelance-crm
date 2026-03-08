import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { updateProfile } from "../redux/authSlice.jsx";
import { 
  FaUser, FaLock, FaEdit, FaShieldAlt, FaEnvelope, 
  FaProjectDiagram, FaHistory, FaCheckCircle, FaTimes,
  FaMapMarkerAlt, FaBriefcase, FaCode, FaAlignLeft
} from "react-icons/fa";

// 🚀 API LAYER IMPORTS
import { getProjects } from "../api/projectApi";
import { getMyTasks } from "../api/taskApi";

const AVATAR_OPTIONS = [
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_1.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_2.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_3.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_4.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_5.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_6.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_7.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_8.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_9.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_10.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_11.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_12.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_13.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_14.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_15.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_16.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_17.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_18.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_19.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_20.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_21.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_22.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_23.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_24.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_25.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_26.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_27.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_28.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_29.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_30.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_31.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_32.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_33.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_34.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_35.png"
];

export default function Profile() {
  const dispatch = useDispatch();
  const { user, token, loading: isSyncing } = useAuth();

  const [stats, setStats] = useState({ activeProjects: 0, completedTasks: 0, totalTasks: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // 🚀 EXPANDED FORM DATA
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", selectedAvatar: "",
    title: "", location: "", bio: "", skills: ""
  });

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

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        selectedAvatar: user.profilePic || AVATAR_OPTIONS[0],
        title: user.title || "",
        location: user.location || "",
        bio: user.bio || "",
        skills: user.skills ? user.skills.join(", ") : "" // Convert array to string for input
      });
    }
  }, [user, isEditing]);

  const handleUpdateProfile = async () => {
    setMessage({ type: "", text: "" });

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setMessage({ type: "error", text: "Security keys do not match." });
    }

    try {
      // Clean up skills string back into an array before sending
      const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(s => s !== "");
      
      await dispatch(updateProfile({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password || undefined, 
        profilePic: formData.selectedAvatar,
        title: formData.title,
        location: formData.location,
        bio: formData.bio,
        skills: skillsArray
      })).unwrap();

      setMessage({ type: "success", text: "Parameters Updated." });
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: "error", text: "Sync failed." });
    }
  };

  return (
    <div className="h-screen w-full bg-[var(--os-canvas)] p-0 md:p-3 flex font-sans text-[var(--os-text-main)] overflow-hidden">
      <div className="flex flex-1 bg-[var(--os-bg)] rounded-none md:rounded-3xl shadow-2xl overflow-hidden relative border border-[var(--os-border)]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="flex justify-between items-center">
                <h1 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--os-text-muted)]">Agent Dossier</h1>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="text-[10px] font-black uppercase tracking-widest text-[#D2C9D8] hover:text-[var(--os-text-main)] transition flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-[var(--os-border)] shadow-sm hover:shadow-md"
                >
                  <FaEdit size={10} /> Edit Parameters
                </button>
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-4 ${
                  message.type === "success" 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  {message.text}
                </div>
              )}

              {/* --- SLEEK IDENTITY BAR --- */}
              <div className="bg-[var(--os-surface)]/40 rounded-2xl p-6 border border-[var(--os-border)] flex items-center gap-8 relative overflow-hidden shadow-xl">
                <div className="w-24 h-24 rounded-2xl border-2 border-[#35313F] bg-[var(--os-canvas)] flex-shrink-0 shadow-lg overflow-hidden">
                  <img src={user?.profilePic || formData.selectedAvatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black tracking-tight truncate">{user?.name}</h2>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest flex-shrink-0">Verified</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4 text-[var(--os-text-muted)]">
                    {user?.title && (
                      <p className="text-xs font-bold flex items-center gap-1.5"><FaBriefcase size={10} className="opacity-50"/> {user.title}</p>
                    )}
                    {user?.location && (
                      <p className="text-xs font-bold flex items-center gap-1.5"><FaMapMarkerAlt size={10} className="opacity-50"/> {user.location}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <span className="bg-[var(--os-bg)] text-[#D2C9D8] text-[9px] font-black px-3 py-1 rounded-md border border-[var(--os-border)] uppercase tracking-widest">
                       {user?.role} ACCESS
                    </span>
                    <span className="bg-[var(--os-bg)] text-[var(--os-text-muted)] text-[9px] font-black px-3 py-1 rounded-md border border-[var(--os-border)] uppercase tracking-widest">
                       ID: {user?._id?.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* --- BIO & SKILLS GRID --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[var(--os-surface)]/20 rounded-2xl p-6 border border-[var(--os-border)]">
                  <h3 className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2"><FaAlignLeft /> Background</h3>
                  <p className="text-xs text-[var(--os-text-main)]/80 leading-relaxed font-medium">
                    {user?.bio || "No background information provided. Edit parameters to update agent history."}
                  </p>
                </div>
                
                <div className="bg-[var(--os-surface)]/20 rounded-2xl p-6 border border-[var(--os-border)]">
                  <h3 className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2"><FaCode /> Technical Proficiencies</h3>
                  {user?.skills && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, i) => (
                        <span key={i} className="bg-[var(--os-bg)] text-[var(--os-text-main)]/90 px-3 py-1.5 rounded-lg text-[9px] font-bold border border-[var(--os-border)] shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--os-text-muted)] italic">No skills registered.</p>
                  )}
                </div>
              </div>

              {/* --- COMPACT METRICS --- */}
              <div className="grid grid-cols-3 gap-4">
                <MetricCard label="Projects" value={stats.activeProjects} />
                <MetricCard label="Tasks Done" value={stats.completedTasks} />
                <MetricCard label="Efficiency" value={`${Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%`} />
              </div>

              {/* --- SYSTEM LOGS --- */}
              <div className="bg-[var(--os-surface)]/20 rounded-2xl p-6 border border-[var(--os-border)] space-y-4">
                <h3 className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">System Metadata</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                  <MetadataRow label="Encrypted Email" value={user?.email} />
                  <MetadataRow label="Last Sync" value={new Date().toLocaleTimeString()} />
                  <MetadataRow label="Security Key" value="AES-256 Enabled" />
                  <MetadataRow label="Auth Method" value="JWT Token" />
                </div>
              </div>

              {/* --- EXPANDED EDIT MODAL --- */}
              {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--os-bg)]/98 backdrop-blur-sm">
                  <div className="bg-[var(--os-surface)] w-full max-w-2xl rounded-[2rem] p-8 border border-white/10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                    
                    <div className="flex justify-between items-center mb-4 border-b border-[var(--os-border)] pb-4">
                      <h2 className="text-xs font-black uppercase tracking-widest text-[#D2C9D8]">Update Agent Parameters</h2>
                      <button onClick={() => setIsEditing(false)} className="text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] p-2 rounded-lg hover:bg-white/5 transition"><FaTimes /></button>
                    </div>
                    
                    {/* Visuals */}
                    <div>
                      <label className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest block mb-2">Identity Visual</label>
                      <div className="grid grid-cols-6 gap-2 mb-2">
                        {AVATAR_OPTIONS.map((url, i) => (
                          <button key={i} onClick={() => setFormData({...formData, selectedAvatar: url})} className={`rounded-lg overflow-hidden border-2 transition-all aspect-square ${formData.selectedAvatar === url ? 'border-indigo-400 scale-105 shadow-md shadow-indigo-500/20' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                            <img src={url} alt="nav" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Core Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputBox label="Alias (Name)" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} icon={<FaUser />} />
                      <InputBox label="Communication Channel" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} icon={<FaEnvelope />} />
                    </div>

                    {/* Professional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputBox label="Designation (Title)" value={formData.title} onChange={(v) => setFormData({...formData, title: v})} placeholder="e.g. Lead Engineer" icon={<FaBriefcase />} />
                      <InputBox label="Base Coordinates (Location)" value={formData.location} onChange={(v) => setFormData({...formData, location: v})} placeholder="e.g. Remote, UK" icon={<FaMapMarkerAlt />} />
                    </div>

                    {/* Skills & Bio */}
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest ml-1 flex items-center gap-1.5"><FaCode size={10}/> Technical Proficiencies (Comma Separated)</label>
                        <input 
                          type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="e.g. React, Node.js, Network Admin"
                          className="w-full bg-[var(--os-bg)] border-none rounded-lg px-4 py-3 text-xs font-bold text-[var(--os-text-main)] focus:ring-1 focus:ring-[#D2C9D8] outline-none" 
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest ml-1 flex items-center gap-1.5"><FaAlignLeft size={10}/> Background Summary</label>
                        <textarea 
                          rows="3" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Brief history and objective..."
                          className="w-full bg-[var(--os-bg)] border-none rounded-lg px-4 py-3 text-xs font-bold text-[var(--os-text-main)] focus:ring-1 focus:ring-[#D2C9D8] outline-none resize-none custom-scrollbar" 
                        />
                      </div>
                    </div>

                    {/* Security */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--os-border)]">
                      <InputBox label="New Cryptographic Key" type="password" value={formData.password} onChange={(v) => setFormData({...formData, password: v})} placeholder="Leave blank to keep current" icon={<FaLock />} />
                      <InputBox label="Confirm Key" type="password" value={formData.confirmPassword} onChange={(v) => setFormData({...formData, confirmPassword: v})} placeholder="Re-enter to verify" icon={<FaShieldAlt />} />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-[var(--os-border)]">
                      <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] transition hover:bg-white/5">Abort</button>
                      <button 
                        onClick={handleUpdateProfile} 
                        disabled={isSyncing}
                        className="bg-white text-[#35313F] px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[var(--os-canvas)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSyncing ? "Committing..." : "Commit Data"}
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

// --- UTILITY COMPONENTS ---

function MetricCard({ label, value }) {
  return (
    <div className="bg-[var(--os-surface)]/30 p-5 rounded-2xl border border-[var(--os-border)] text-center transition hover:bg-[var(--os-surface)]/50">
      <h4 className="text-xl font-black mb-0.5">{value}</h4>
      <p className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">{label}</p>
    </div>
  );
}

function MetadataRow({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b border-[var(--os-border)] pb-1.5 text-[10px] font-bold">
      <span className="text-[var(--os-text-muted)] uppercase tracking-tighter">{label}</span>
      <span className="text-[var(--os-text-main)]/80 truncate max-w-[150px]" title={value}>{value}</span>
    </div>
  );
}

function InputBox({ label, value, onChange, type = "text", placeholder = "", icon = null }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]/50">
            {icon}
          </div>
        )}
        <input 
          type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full bg-[var(--os-bg)] border-none rounded-lg ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 text-xs font-bold text-[var(--os-text-main)] focus:ring-1 focus:ring-[#D2C9D8] outline-none transition placeholder:text-[var(--os-text-muted)]/30`} 
        />
      </div>
    </div>
  );
}
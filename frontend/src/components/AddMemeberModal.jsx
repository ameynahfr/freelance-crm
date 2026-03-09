import { useState } from "react";
import { FaTimes, FaUser, FaEnvelope, FaLock, FaBriefcase, FaCode, FaSave } from "react-icons/fa";

// 🚀 API LAYER IMPORT
import { addTeamMember } from "../api/teamApi";

export default function AddMemberModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
    title: "", 
    skills: "" 
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      // Data Transformation: String to Array for skills
      const payload = {
        ...formData,
        skills: formData.skills ? formData.skills.split(",").map(s => s.trim()) : []
      };

      // 🚀 Clean API Call - Interceptor adds the Bearer Token
      await addTeamMember(payload);
      
      onSuccess();
      onClose();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to recruit agent. Please check credentials." });
    } finally {
      setLoading(false);
    }
  };

  // Shared Input Styles
  const inputStyles = "w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--os-text-main)] outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all shadow-inner placeholder:text-[var(--os-text-muted)]/40";
  const iconInputStyles = "w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-[var(--os-text-main)] outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all shadow-inner placeholder:text-[var(--os-text-muted)]/40";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[var(--os-bg)] rounded-[2rem] border border-[var(--os-border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-[var(--os-border)] bg-[var(--os-surface)]/30">
          <div>
            <h2 className="text-xl font-black text-[var(--os-text-main)] tracking-tight">Recruit Agent</h2>
            <p className="text-[10px] text-[var(--os-text-muted)] uppercase font-bold tracking-widest mt-1">New Personnel Entry</p>
          </div>
          <button onClick={onClose} className="text-[var(--os-text-muted)] hover:text-rose-400 transition-colors p-2.5 bg-[var(--os-surface)] rounded-xl border border-[var(--os-border)] hover:bg-rose-500/10 shadow-sm">
            <FaTimes size={14} />
          </button>
        </div>

        {/* --- FORM BODY --- */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {message.text && (
            <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-widest text-center border ${message.type === 'error' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                <input 
                  type="text" required placeholder="e.g. Sarah Connor"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className={iconInputStyles}
                />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Clearance Level</label>
              <select 
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                className={`${inputStyles} cursor-pointer appearance-none`}
              >
                <option value="member">Member (Standard)</option>
                <option value="manager">Manager (Elevated)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Secure Comms (Email)</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
              <input 
                type="email" required placeholder="agent@omninode.com"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className={iconInputStyles}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Temporary Access Key</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
              <input 
                type="password" required placeholder="••••••••"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className={iconInputStyles}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Operational Title</label>
              <div className="relative">
                <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                <input 
                  type="text" placeholder="e.g. Lead Designer"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className={iconInputStyles}
                />
              </div>
            </div>
             <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Specializations</label>
              <div className="relative">
                <FaCode className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                <input 
                  type="text" placeholder="UI, UX, React"
                  value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})}
                  className={iconInputStyles}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--os-text-muted)] bg-[var(--os-surface)] border border-[var(--os-border)] hover:bg-[var(--os-bg)] hover:text-[var(--os-text-main)] transition-colors shadow-sm">
              Abort
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--os-btn-primary-text)] bg-[var(--os-btn-primary)] shadow-lg shadow-[var(--os-btn-primary)]/20 hover:scale-[1.02] hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
              {loading ? "Initializing..." : <><FaSave size={12} /> Confirm Recruitment</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
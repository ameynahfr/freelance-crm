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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      alert(err.response?.data?.message || "Failed to recruit agent. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#35313F]/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#35313F] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-8 py-6 bg-[#464153]/30 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg tracking-tight">Recruit Agent</h3>
            <p className="text-[10px] text-[#A29EAB] uppercase font-bold tracking-widest">New Personnel Entry</p>
          </div>
          <button onClick={onClose} className="text-[#A29EAB] hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
            <FaTimes size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1 block">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A29EAB] text-xs" />
                <input 
                  type="text" required placeholder="Agent Name"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#464153] text-white text-sm pl-9 pr-3 py-3 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#D2C9D8]"
                />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1 block">Clearance</label>
              <select 
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full bg-[#464153] text-white text-sm px-3 py-3 rounded-xl border-none outline-none cursor-pointer appearance-none focus:ring-1 focus:ring-[#D2C9D8]"
              >
                <option value="member">Member (Standard)</option>
                <option value="manager">Manager (Elevated)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1 block">Work Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A29EAB] text-xs" />
              <input 
                type="email" required placeholder="agent@agency.com"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-[#464153] text-white text-sm pl-9 pr-3 py-3 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#D2C9D8]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1 block">Temporary Access Key</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A29EAB] text-xs" />
              <input 
                type="password" required placeholder="••••••••"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-[#464153] text-white text-sm pl-9 pr-3 py-3 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#D2C9D8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1 block">Operational Title</label>
              <div className="relative">
                <FaBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A29EAB] text-xs" />
                <input 
                  type="text" placeholder="e.g. Lead Designer"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#464153] text-white text-sm pl-9 pr-3 py-3 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#D2C9D8]"
                />
              </div>
            </div>
             <div>
              <label className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1 block">Specializations</label>
              <div className="relative">
                <FaCode className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A29EAB] text-xs" />
                <input 
                  type="text" placeholder="UI, UX, React"
                  value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})}
                  className="w-full bg-[#464153] text-white text-sm pl-9 pr-3 py-3 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#D2C9D8]"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full mt-4 bg-white text-[#35313F] font-bold py-3.5 rounded-xl hover:bg-[#D2C9D8] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? "Initializing..." : <><FaSave /> Confirm Recruitment</>}
          </button>

        </form>
      </div>
    </div>
  );
}
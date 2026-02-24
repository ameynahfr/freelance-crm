import { useState } from "react";
import axios from "axios";
import { FaTimes, FaUser, FaEnvelope, FaLock, FaBriefcase, FaCode } from "react-icons/fa";

export default function AddMemberModal({ token, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // In a real app, you'd email them a setup link
    role: "member",
    title: "", // e.g. "Frontend Dev"
    skills: "" // comma separated
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Split skills string into array: "React, Node" -> ["React", "Node"]
      const payload = {
        ...formData,
        skills: formData.skills.split(",").map(s => s.trim())
      };

      await axios.post("http://localhost:5000/api/team", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#35313F]/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#35313F] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        <div className="px-8 py-6 bg-[#464153]/30 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Recruit Agent</h3>
          <button onClick={onClose} className="text-[#A29EAB] hover:text-white"><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          <div className="grid grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1 block">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A29EAB] text-xs" />
                <input 
                  type="text" required placeholder="John Doe"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#464153] text-white text-sm pl-9 pr-3 py-3 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#D2C9D8]"
                />
              </div>
            </div>
            
            {/* Role Dropdown */}
            <div>
              <label className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1 block">Clearance Level</label>
              <select 
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full bg-[#464153] text-white text-sm px-3 py-3 rounded-xl border-none outline-none cursor-pointer"
              >
                <option value="member">Member (Standard)</option>
                <option value="admin">Admin (Manager)</option>
              </select>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1 block">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A29EAB] text-xs" />
              <input 
                type="email" required placeholder="agent@agency.com"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-[#464153] text-white text-sm pl-9 pr-3 py-3 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#D2C9D8]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1 block">Temporary Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A29EAB] text-xs" />
              <input 
                type="password" required placeholder="••••••••"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-[#464153] text-white text-sm pl-9 pr-3 py-3 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#D2C9D8]"
              />
            </div>
          </div>

          {/* Title & Skills */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1 block">Job Title</label>
              <div className="relative">
                <FaBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A29EAB] text-xs" />
                <input 
                  type="text" placeholder="e.g. Senior Dev"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#464153] text-white text-sm pl-9 pr-3 py-3 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#D2C9D8]"
                />
              </div>
            </div>
             <div>
              <label className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1 block">Skills (comma sep)</label>
              <div className="relative">
                <FaCode className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A29EAB] text-xs" />
                <input 
                  type="text" placeholder="React, Node, UI"
                  value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})}
                  className="w-full bg-[#464153] text-white text-sm pl-9 pr-3 py-3 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#D2C9D8]"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full mt-4 bg-white text-[#35313F] font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            {loading ? "Adding Agent..." : "Confirm & Add to Team"}
          </button>

        </form>
      </div>
    </div>
  );
}
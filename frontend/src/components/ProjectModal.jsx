import { useState, useEffect } from "react";
import {
  FaTimes,
  FaUser,
  FaTasks,
  FaCalendarAlt,
  FaAlignLeft,
  FaFolder,
  FaSave,
  FaUsers
} from "react-icons/fa";

// 🚀 API LAYER IMPORTS
import { createProject, updateProject } from "../api/projectApi";
import { getClients } from "../api/clientApi";
import { getTeam } from "../api/teamApi";

export default function ProjectModal({ onClose, onUpdated, editData }) {
  const [title, setTitle] = useState(editData?.title || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [client, setClient] = useState(editData?.client?._id || "");
  const [status, setStatus] = useState(editData?.status || "pending");
  const [deadline, setDeadline] = useState(
    editData?.deadline ? editData.deadline.split("T")[0] : "",
  );
  
  // Team State
  const [selectedTeam, setSelectedTeam] = useState(
    editData?.team ? editData.team.map(m => typeof m === 'object' ? m._id : m) : []
  );
  const [teamMembers, setTeamMembers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🚀 Using Clean API calls with Promise.all
        const [clientsRes, teamRes] = await Promise.all([
          getClients(),
          getTeam()
        ]);

        setClients(clientsRes.data);
        setTeamMembers(teamRes.data);
      } catch (err) {
        console.error("Data fetch failure:", err);
        setMessage({ type: "error", text: "Registry sync failed." });
      }
    };
    fetchData();
  }, []);

  const handleTeamToggle = (memberId) => {
    setSelectedTeam(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      deadline: deadline || null,
      client: client || null,
      team: selectedTeam
    };

    try {
      if (editData) {
        // 🚀 API Update Call
        await updateProject(editData._id, payload);
      } else {
        // 🚀 API Create Call
        await createProject(payload);
      }
      onUpdated();
      onClose();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Operation failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--os-bg)]/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[var(--os-bg)] rounded-[2rem] shadow-2xl overflow-hidden border border-[var(--os-border)] flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--os-border)] bg-[var(--os-surface)]/30">
          <h2 className="text-lg font-bold text-[var(--os-text-main)] tracking-tight">
            {editData ? "Update Mandate" : "New Project"}
          </h2>
          <button onClick={onClose} className="text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
            <FaTimes size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-5">
          {message.text && (
            <div className={`p-3 rounded-xl text-xs font-bold ${message.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaFolder size={10} /> Title
              </label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[var(--os-surface)] border-none rounded-xl px-4 py-3 text-sm text-[var(--os-text-main)] outline-none focus:ring-1 focus:ring-[#D2C9D8]" placeholder="Project name..." />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaUser size={10} /> Client
              </label>
              <div className="relative">
                <select value={client} onChange={(e) => setClient(e.target.value)} className="w-full bg-[var(--os-surface)] border-none rounded-xl px-4 py-3 text-sm text-[var(--os-text-main)] outline-none cursor-pointer appearance-none focus:ring-1 focus:ring-[#D2C9D8]">
                  <option value="">Internal mandate</option>
                  {clients.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaTasks size={10} /> Status
              </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-[var(--os-surface)] border-none rounded-xl px-4 py-3 text-sm text-[var(--os-text-main)] outline-none cursor-pointer appearance-none focus:ring-1 focus:ring-[#D2C9D8]">
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaCalendarAlt size={10} /> Deadline
              </label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full bg-[var(--os-surface)] border-none rounded-xl px-4 py-3 text-sm text-[var(--os-text-main)] outline-none focus:ring-1 focus:ring-[#D2C9D8] [color-scheme:dark]" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
              <FaAlignLeft size={10} /> Overview
            </label>
            <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[var(--os-surface)] border-none rounded-xl px-4 py-3 text-sm text-[var(--os-text-main)] resize-none outline-none focus:ring-1 focus:ring-[#D2C9D8]" placeholder="Objective details..." />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
              <FaUsers size={12} /> Assign Agents
            </label>
            <div className="bg-[var(--os-surface)]/30 p-2 rounded-xl border border-[var(--os-border)] max-h-40 overflow-y-auto custom-scrollbar">
              {teamMembers.length === 0 ? (
                 <p className="text-center py-4 text-xs text-[var(--os-text-muted)]">No staff available.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {teamMembers.map(member => (
                    <div 
                      key={member._id}
                      onClick={() => handleTeamToggle(member._id)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${selectedTeam.includes(member._id) ? "bg-[var(--os-canvas)] border-[#D2C9D8]" : "bg-[var(--os-surface)] border-transparent hover:border-white/10"}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${selectedTeam.includes(member._id) ? "bg-[var(--os-bg)] text-[var(--os-text-main)]" : "bg-[var(--os-bg)] text-[#D2C9D8]"}`}>
                        {member.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${selectedTeam.includes(member._id) ? "text-[#35313F]" : "text-[var(--os-text-main)]"}`}>{member.name}</p>
                        <p className={`text-[9px] truncate ${selectedTeam.includes(member._id) ? "text-[#35313F]/70" : "text-[var(--os-text-muted)]"}`}>{member.title || member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[var(--os-text-muted)] bg-[var(--os-surface)] hover:bg-[var(--os-surface)]/80 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#35313F] bg-white shadow-lg hover:bg-gray-100 transition-all">
              {loading ? "Syncing..." : <><FaSave className="inline mr-1" /> Save Mandate</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
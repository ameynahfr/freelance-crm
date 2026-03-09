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
        await updateProject(editData._id, payload);
      } else {
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

  // Shared Input Styles for consistent Light/Dark mode transitions
  const inputStyles = "w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--os-text-main)] outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all shadow-inner placeholder:text-[var(--os-text-muted)]/40";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[var(--os-bg)] rounded-[2rem] shadow-2xl overflow-hidden border border-[var(--os-border)] flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-[var(--os-border)] bg-[var(--os-surface)]/30">
          <div>
            <h2 className="text-xl font-black text-[var(--os-text-main)] tracking-tight">
              {editData ? "Update Mandate" : "Deploy New Project"}
            </h2>
            <p className="text-[10px] text-[var(--os-text-muted)] uppercase font-bold tracking-widest mt-1">Mission Parameters</p>
          </div>
          <button onClick={onClose} className="text-[var(--os-text-muted)] hover:text-rose-400 transition-colors p-2.5 bg-[var(--os-surface)] rounded-xl border border-[var(--os-border)] hover:bg-rose-500/10 shadow-sm">
            <FaTimes size={14} />
          </button>
        </div>

        {/* --- FORM BODY --- */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6">
          {message.text && (
            <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-widest text-center border ${message.type === 'error' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                <FaFolder size={10} /> Title
              </label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyles} placeholder="e.g. Website Redesign" />
            </div>

            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                <FaUser size={10} /> Client Partner
              </label>
              <div className="relative">
                <select value={client} onChange={(e) => setClient(e.target.value)} className={`${inputStyles} cursor-pointer appearance-none`}>
                  <option value="">-- Internal Mandate --</option>
                  {clients.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                <FaTasks size={10} /> Operational Status
              </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputStyles} cursor-pointer appearance-none`}>
                <option value="pending">Pending Launch</option>
                <option value="active">Active/In Progress</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                <FaCalendarAlt size={10} /> Deadline
              </label>
              {/* Removed color-scheme:dark so it adapts to light mode properly */}
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputStyles} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
              <FaAlignLeft size={10} /> Mission Overview
            </label>
            <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputStyles} resize-none`} placeholder="Objective details and key deliverables..." />
          </div>

          <div>
            <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
              <FaUsers size={12} /> Assign Field Agents
            </label>
            <div className="bg-[var(--os-surface)]/50 p-3 rounded-2xl border border-[var(--os-border)] max-h-48 overflow-y-auto custom-scrollbar shadow-inner">
              {teamMembers.length === 0 ? (
                 <p className="text-center py-6 text-xs font-bold text-[var(--os-text-muted)]">No staff available in registry.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teamMembers.map(member => {
                    const isSelected = selectedTeam.includes(member._id);
                    return (
                      <div 
                        key={member._id}
                        onClick={() => handleTeamToggle(member._id)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border shadow-sm ${
                          isSelected 
                          ? "bg-[var(--os-accent)]/10 border-[var(--os-accent)] shadow-[0_0_8px_rgba(var(--os-accent-rgb),0.1)]" 
                          : "bg-[var(--os-bg)] border-[var(--os-border)] hover:border-[var(--os-text-muted)]/50"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${
                          isSelected 
                          ? "bg-[var(--os-accent)] text-white shadow-md" 
                          : "bg-[var(--os-surface)] text-[var(--os-text-muted)] border border-[var(--os-border)]"
                        }`}>
                          {member.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-black truncate transition-colors ${isSelected ? "text-[var(--os-text-main)]" : "text-[var(--os-text-main)]/80"}`}>
                            {member.name}
                          </p>
                          <p className={`text-[9px] font-bold uppercase tracking-widest truncate transition-colors ${isSelected ? "text-[var(--os-accent)]" : "text-[var(--os-text-muted)]"}`}>
                            {member.title || member.role}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--os-text-muted)] bg-[var(--os-surface)] border border-[var(--os-border)] hover:bg-[var(--os-bg)] hover:text-[var(--os-text-main)] transition-colors shadow-sm">
              Abort
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--os-btn-primary-text)] bg-[var(--os-btn-primary)] shadow-lg shadow-[var(--os-btn-primary)]/20 hover:scale-[1.02] hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
              {loading ? "Syncing..." : <><FaSave size={12} /> {editData ? "Save Parameters" : "Deploy Mandate"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
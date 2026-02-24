import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTimes,
  FaUser,
  FaTasks,
  FaCalendarAlt,
  FaAlignLeft,
  FaFolder,
  FaSave,
  FaUsers, // New Icon
  FaMoneyBillWave // Added just in case you want budget later
} from "react-icons/fa";

export default function ProjectModal({ token, onClose, onUpdated, editData }) {
  const [title, setTitle] = useState(editData?.title || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [client, setClient] = useState(editData?.client?._id || "");
  const [status, setStatus] = useState(editData?.status || "pending");
  const [deadline, setDeadline] = useState(
    editData?.deadline ? editData.deadline.split("T")[0] : "",
  );
  
  // --- NEW: Team State ---
  // If editData.team exists, we map it to get just the IDs (in case populated objects were sent)
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
        // Fetch Clients AND Team Members in parallel
        const [clientsRes, teamRes] = await Promise.all([
          axios.get("http://localhost:5000/api/clients", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/team", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setClients(clientsRes.data);
        setTeamMembers(teamRes.data);
      } catch (err) {
        console.error("Failed to load data:", err);
        setMessage({ type: "error", text: "Failed to load clients or team." });
      }
    };
    fetchData();
  }, [token]);

  // Handle clicking a team member
  const handleTeamToggle = (memberId) => {
    setSelectedTeam(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId); // Remove
      } else {
        return [...prev, memberId]; // Add
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const payload = {
      title,
      description,
      status,
      deadline: deadline || null,
      client: client || null,
      team: selectedTeam // Send the array of User IDs
    };

    const url = editData
      ? `http://localhost:5000/api/projects/${editData._id}`
      : "http://localhost:5000/api/projects";

    try {
      await axios({
        method: editData ? "put" : "post",
        url,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });
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
      <div
        className="absolute inset-0 bg-[#35313F]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#35313F] rounded-[2rem] shadow-2xl overflow-hidden border border-white/5 flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 bg-[#464153]/30">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {editData ? "Edit Project" : "Create New Project"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#A29EAB] hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
          >
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
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaFolder size={10} /> Title
              </label>
              <input
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#D2C9D8]"
                placeholder="e.g. Mobile App MVP"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaUser size={10} /> Client
              </label>
              <div className="relative">
                <select
                  value={client} onChange={(e) => setClient(e.target.value)}
                  className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-[#D2C9D8]"
                >
                  <option value="">Self Project (Default)</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#A29EAB]">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaTasks size={10} /> Status
              </label>
              <div className="relative">
                <select
                  value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-[#D2C9D8]"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#A29EAB]">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaCalendarAlt size={10} /> Deadline
              </label>
              <input
                type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#D2C9D8] [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
              <FaAlignLeft size={10} /> Description
            </label>
            <textarea
              rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:ring-2 focus:ring-[#D2C9D8]"
              placeholder="What is this project about?"
            />
          </div>

          {/* --- NEW: Assign Team Section --- */}
          <div>
            <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
              <FaUsers size={12} /> Assign Team
            </label>
            
            <div className="bg-[#464153]/30 p-2 rounded-xl border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
              {teamMembers.length === 0 ? (
                 <div className="text-center py-4">
                   <p className="text-xs text-[#A29EAB]">No team members found.</p>
                   <p className="text-[10px] text-[#A29EAB] opacity-70">Go to the Team page to add people.</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {teamMembers.map(member => (
                    <div 
                      key={member._id}
                      onClick={() => handleTeamToggle(member._id)}
                      className={`
                        flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border
                        ${selectedTeam.includes(member._id) 
                          ? "bg-[#D2C9D8] border-[#D2C9D8]" 
                          : "bg-[#464153] border-transparent hover:border-white/20"}
                      `}
                    >
                      {/* Initials Avatar */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                        selectedTeam.includes(member._id) ? "bg-[#35313F] text-white" : "bg-[#35313F] text-[#D2C9D8]"
                      }`}>
                        {member.name.charAt(0)}
                      </div>
                      
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${selectedTeam.includes(member._id) ? "text-[#35313F]" : "text-white"}`}>
                          {member.name}
                        </p>
                        <p className={`text-[10px] truncate ${selectedTeam.includes(member._id) ? "text-[#35313F]/70" : "text-[#A29EAB]"}`}>
                          {member.title || "Member"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#A29EAB] bg-[#464153] hover:bg-[#464153]/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#35313F] bg-white shadow-lg hover:bg-gray-100 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Saving..." : <><FaSave /> {editData ? "Update Project" : "Create Project"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
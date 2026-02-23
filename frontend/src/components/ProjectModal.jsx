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
} from "react-icons/fa";

export default function ProjectModal({ token, onClose, onUpdated, editData }) {
  const [title, setTitle] = useState(editData?.title || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [client, setClient] = useState(editData?.client?._id || "");
  const [status, setStatus] = useState(editData?.status || "pending");
  const [deadline, setDeadline] = useState(
    editData?.deadline ? editData.deadline.split("T")[0] : "",
  );

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/clients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(res.data);
      } catch (err) {
        console.error("Failed to load clients:", err);
      }
    };
    fetchClients();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const payload = {
      title,
      description,
      status,
      // Removed "progress" - calculated by backend now
      deadline: deadline || null,
      client: client || null,
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

          {/* Note regarding progress */}
          <div className="bg-[#464153]/50 p-4 rounded-xl border border-white/5">
            <p className="text-[10px] text-[#A29EAB]">
              <span className="font-bold text-white">Note:</span> Progress is calculated automatically based on completed tasks.
            </p>
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
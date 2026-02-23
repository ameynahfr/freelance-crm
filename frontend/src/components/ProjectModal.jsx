import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTimes,
  FaUser,
  FaTasks,
  FaCalendarAlt,
  FaAlignLeft,
  FaFolder,
} from "react-icons/fa";

export default function ProjectModal({ token, onClose, onUpdated, editData }) {
  // Initialize state with editData if it exists
  const [title, setTitle] = useState(editData?.title || "");
  const [description, setDescription] = useState(editData?.description || "");

  // IMPORTANT: Set to the client ID if editing, otherwise empty string for "Self Project"
  const [client, setClient] = useState(editData?.client?._id || "");

  const [status, setStatus] = useState(editData?.status || "pending");
  const [progress, setProgress] = useState(editData?.progress || 0);
  const [deadline, setDeadline] = useState(
    editData?.deadline ? editData.deadline.split("T")[0] : "",
  );

  const [clients, setClients] = useState([]); // List for the dropdown
  const [loading, setLoading] = useState(false);

  // Fetch all registered clients to populate the dropdown selection
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/clients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(res.data);
      } catch (err) {
        console.error("Failed to load clients for selection:", err);
      }
    };
    fetchClients();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // We send null if no client is selected to avoid the BSON Cast Error
    const payload = {
      title,
      description,
      status,
      progress,
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
      // Alert specific server-side validation messages
      alert(
        err.response?.data?.message ||
          "Operation failed. Check if data is valid.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#35313F]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#35313F] rounded-[2rem] shadow-2xl overflow-hidden border border-white/5 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 bg-[#464153]/30">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {editData ? "Edit Project" : "Create New Project"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#A29EAB] hover:text-white transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title Input */}
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaFolder size={10} /> Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-white/10"
              />
            </div>

            {/* Client Dropdown - Fixes the BSON Cast Error */}
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaUser size={10} /> Client
              </label>
              <div className="relative">
                <select
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-white/10"
                >
                  <option value="">Self Project (Default)</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {/* Custom arrow for the select dropdown */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#A29EAB]">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Selection */}
            {/* Status Selection with Custom Arrow */}
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaTasks size={10} /> Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-white/10"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>

                {/* Custom Arrow SVG */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#A29EAB]">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Deadline Selection */}
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaCalendarAlt size={10} /> Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
              <FaAlignLeft size={10} /> Description
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>

          {/* Progress Slider */}
          <div className="bg-[#464153]/50 p-4 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider">
                Progress
              </label>
              <span className="text-xs font-bold text-white bg-[#35313F] px-3 py-1 rounded-full">
                {progress}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full h-1.5 bg-[#35313F] rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#A29EAB] bg-[#464153] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#35313F] bg-white shadow-lg hover:bg-gray-100 disabled:opacity-50 transition-all"
            >
              {loading
                ? "Saving..."
                : editData
                  ? "Update Project"
                  : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

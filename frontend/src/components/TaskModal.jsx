import { useState, useEffect } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaAlignLeft,
  FaProjectDiagram,
  FaTasks,
  FaSave,
  FaCheckCircle,
  FaUser
} from "react-icons/fa";

// 🚀 API LAYER IMPORTS
import { getProjects, getProjectById } from "../api/projectApi";
import { createTask, updateTask } from "../api/taskApi";

export default function TaskModal({ projectId, onClose, onCreated, editData }) {
  const [title, setTitle] = useState(editData?.title || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [dueDate, setDueDate] = useState(editData?.dueDate ? editData.dueDate.split("T")[0] : "");
  const [status, setStatus] = useState(editData?.status || "todo");
  
  // Assignment State
  const [assignedTo, setAssignedTo] = useState(editData?.assignedTo?._id || editData?.assignedTo || "");
  const [projectTeam, setProjectTeam] = useState([]); 

  // Project selection logic
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || editData?.project?._id || editData?.project || "");
  const [projectsList, setProjectsList] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Fetch Global Projects List (Only if needed)
  useEffect(() => {
    if (!projectId && !editData) {
      const fetchProjects = async () => {
        try {
          const res = await getProjects();
          setProjectsList(res.data);
        } catch (err) {
          console.error("Failed to load project list");
        }
      };
      fetchProjects();
    }
  }, [projectId, editData]);

  // 2. Fetch Team Members when a Project is Selected
  useEffect(() => {
    const fetchProjectTeam = async () => {
      if (!selectedProjectId) {
        setProjectTeam([]);
        return;
      }
      try {
        const res = await getProjectById(selectedProjectId);
        // Backend populates 'team'. We also add the manager/owner just in case.
        const project = res.data;
        setProjectTeam(project.team || []);
      } catch (err) {
        console.error("Failed to load project team registry");
      }
    };
    fetchProjectTeam();
  }, [selectedProjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!selectedProjectId) {
      return setMessage({ type: "error", text: "Task must be linked to a project." });
    }

    setIsSubmitting(true);

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      status: status,
      project: selectedProjectId,
      assignedTo: assignedTo || null
    };
    if (dueDate) taskPayload.dueDate = dueDate;

    try {
      let res;
      if (editData) {
        // 🚀 Use update API
        res = await updateTask(editData._id, taskPayload);
      } else {
        // 🚀 Use create API
        res = await createTask(selectedProjectId, taskPayload);
      }

      onCreated(res.data);
      onClose();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Transmission failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--os-bg)]/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[var(--os-bg)] rounded-[2rem] shadow-2xl overflow-hidden border border-[var(--os-border)] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--os-border)] bg-[var(--os-surface)]/30">
          <h2 className="text-lg font-bold text-[var(--os-text-main)] tracking-tight">
            {editData ? "Update Task" : "New Mandate"}
          </h2>
          <button onClick={onClose} className="text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
            <FaTimes size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          {message.text && (
            <div className={`p-3 rounded-xl text-xs font-bold ${message.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {message.text}
            </div>
          )}

          {!projectId && !editData && (
            <div>
              <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaProjectDiagram size={10} /> Link to Project
              </label>
              <div className="relative">
                <select 
                  required 
                  value={selectedProjectId} 
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setAssignedTo(""); 
                  }} 
                  className="w-full bg-[var(--os-surface)] border-none rounded-xl px-4 py-3 text-sm text-[var(--os-text-main)] focus:ring-1 focus:ring-[#D2C9D8] outline-none cursor-pointer appearance-none"
                >
                  <option value="">-- Select Project --</option>
                  {projectsList.map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1">Objective Title</label>
            <div className="relative">
              <FaTasks className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[var(--os-surface)] border-none rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--os-text-main)] focus:ring-1 focus:ring-[#D2C9D8] outline-none" placeholder="Task summary..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1">Deadline</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-[var(--os-surface)] border-none rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--os-text-main)] focus:ring-1 focus:ring-[#D2C9D8] [color-scheme:dark] outline-none" />
              </div>
            </div>
            
            <div>
              <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1">Current State</label>
              <div className="relative">
                <FaCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-[var(--os-surface)] border-none rounded-xl pl-10 pr-8 py-3 text-sm text-[var(--os-text-main)] focus:ring-1 focus:ring-[#D2C9D8] outline-none appearance-none cursor-pointer">
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
              <FaUser size={10} /> Designated Agent
            </label>
            <div className="relative">
              <select 
                value={assignedTo} 
                onChange={(e) => setAssignedTo(e.target.value)} 
                disabled={!selectedProjectId}
                className="w-full bg-[var(--os-surface)] border-none rounded-xl px-4 py-3 text-sm text-[var(--os-text-main)] focus:ring-1 focus:ring-[#D2C9D8] outline-none cursor-pointer appearance-none disabled:opacity-30"
              >
                <option value="">Unassigned</option>
                {projectTeam.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
              <FaAlignLeft size={10} /> Specifications
            </label>
            <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[var(--os-surface)] border-none rounded-xl px-4 py-3 text-sm text-[var(--os-text-main)] resize-none outline-none focus:ring-1 focus:ring-[#D2C9D8]" placeholder="Detailed instructions..." />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[var(--os-text-muted)] bg-[var(--os-surface)] hover:bg-[var(--os-surface)]/80 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#35313F] bg-white shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
              {isSubmitting ? "Syncing..." : <><FaSave /> Save Task</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
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
        res = await updateTask(editData._id, taskPayload);
      } else {
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

  // Shared Input Styles for consistent Light/Dark mode transitions
  const inputStyles = "w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--os-text-main)] outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all shadow-inner placeholder:text-[var(--os-text-muted)]/40";
  // Icon Input variation (adds left padding so text doesn't overlap the absolute icon)
  const iconInputStyles = "w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-[var(--os-text-main)] outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all shadow-inner placeholder:text-[var(--os-text-muted)]/40";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[var(--os-bg)] rounded-[2rem] shadow-2xl overflow-hidden border border-[var(--os-border)] animate-in fade-in zoom-in-95 duration-200">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-[var(--os-border)] bg-[var(--os-surface)]/30">
          <div>
            <h2 className="text-xl font-black text-[var(--os-text-main)] tracking-tight">
              {editData ? "Update Task" : "Deploy Mandate"}
            </h2>
            <p className="text-[10px] text-[var(--os-text-muted)] uppercase font-bold tracking-widest mt-1">Task Parameters</p>
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

          {!projectId && !editData && (
            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
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
                  className={`${inputStyles} cursor-pointer appearance-none`}
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
            <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Objective Title</label>
            <div className="relative">
              <FaTasks className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={iconInputStyles} placeholder="Task summary..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Deadline</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={iconInputStyles} />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Current State</label>
              <div className="relative">
                <FaCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${iconInputStyles} appearance-none cursor-pointer pr-8`}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
              <FaUser size={10} /> Designated Agent
            </label>
            <div className="relative">
              <select 
                value={assignedTo} 
                onChange={(e) => setAssignedTo(e.target.value)} 
                disabled={!selectedProjectId}
                className={`${inputStyles} cursor-pointer appearance-none disabled:opacity-40`}
              >
                <option value="">-- Unassigned --</option>
                {projectTeam.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
              <FaAlignLeft size={10} /> Specifications
            </label>
            <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputStyles} resize-none`} placeholder="Detailed instructions..." />
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--os-text-muted)] bg-[var(--os-surface)] border border-[var(--os-border)] hover:bg-[var(--os-bg)] hover:text-[var(--os-text-main)] transition-colors shadow-sm">
              Abort
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--os-btn-primary-text)] bg-[var(--os-btn-primary)] shadow-lg shadow-[var(--os-btn-primary)]/20 hover:scale-[1.02] hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
              {isSubmitting ? "Syncing..." : <><FaSave size={12} /> {editData ? "Save Parameters" : "Deploy Task"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
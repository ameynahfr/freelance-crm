import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTimes,
  FaCalendarAlt,
  FaAlignLeft,
  FaProjectDiagram,
  FaTasks,
  FaSave,
  FaCheckCircle,
  FaUser // New Icon
} from "react-icons/fa";

export default function TaskModal({ projectId, token, onClose, onCreated, editData }) {
  const [title, setTitle] = useState(editData?.title || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [dueDate, setDueDate] = useState(editData?.dueDate ? editData.dueDate.split("T")[0] : "");
  const [status, setStatus] = useState(editData?.status || "todo");
  
  // --- NEW: Assignment State ---
  const [assignedTo, setAssignedTo] = useState(editData?.assignedTo?._id || editData?.assignedTo || "");
  const [projectTeam, setProjectTeam] = useState([]); // List of eligible members

  // Global project selection
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || editData?.project?._id || editData?.project || "");
  const [projectsList, setProjectsList] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Fetch Projects List (Only if not inside a specific project view)
  useEffect(() => {
    if (!projectId && !editData) {
      const fetchProjects = async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/projects", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProjectsList(res.data);
        } catch (err) {
          console.error("Failed to load projects");
        }
      };
      fetchProjects();
    }
  }, [projectId, editData, token]);

  // 2. Fetch Team Members when a Project is Selected
  useEffect(() => {
    const fetchProjectTeam = async () => {
      if (!selectedProjectId) {
        setProjectTeam([]);
        return;
      }

      try {
        // We fetch the single project details to get its team
        const res = await axios.get(`http://localhost:5000/api/projects/${selectedProjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Combine Manager + Team into one list for the dropdown
        const project = res.data;
        const manager = project.manager || project.user; // Handle both cases
        
        // Create a unique list of potential assignees
        // (The backend usually includes manager in team, but we play it safe)
        let team = project.team || [];
        
        // If team is populated (objects), use it. If IDs, we can't show names yet (unless we fetch users).
        // Assuming your getProjectById populates 'team' as discussed previously.
        setProjectTeam(team);

      } catch (err) {
        console.error("Failed to load project team", err);
      }
    };

    fetchProjectTeam();
  }, [selectedProjectId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!editData && !selectedProjectId) {
      return setMessage({ type: "error", text: "Please select a project for this task." });
    }

    setIsSubmitting(true);

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      status: status,
      project: selectedProjectId, // Ensure project ID is sent
      assignedTo: assignedTo || null // Send the selected user ID
    };
    if (dueDate) taskPayload.dueDate = dueDate;

    const url = editData
      ? `http://localhost:5000/api/tasks/${editData._id}`
      : `http://localhost:5000/api/tasks/project/${selectedProjectId}`;

    const method = editData ? "put" : "post";

    try {
      const res = await axios({
        method,
        url,
        data: taskPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      onCreated(res.data);
      onClose();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Operation failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#35313F]/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#35313F] rounded-[2rem] shadow-2xl overflow-hidden border border-white/5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 bg-[#464153]/30">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {editData ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="text-[#A29EAB] hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
            <FaTimes size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          {message.text && (
            <div className={`p-3 rounded-xl text-xs font-bold ${message.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {message.text}
            </div>
          )}

          {/* Project Selector */}
          {!projectId && !editData && (
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaProjectDiagram size={10} /> Assign to Project
              </label>
              <div className="relative">
                <select 
                  required 
                  value={selectedProjectId} 
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setAssignedTo(""); // Reset assignee when project changes
                  }} 
                  className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none cursor-pointer appearance-none"
                >
                  <option value="">-- Select a Project --</option>
                  {projectsList.map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#A29EAB]">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">Task Title</label>
            <div className="relative">
              <FaTasks className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A29EAB]" size={12} />
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#464153] border-none rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none" placeholder="What needs to be done?" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">Due Date</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A29EAB]" size={12} />
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-[#464153] border-none rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] [color-scheme:dark] outline-none" />
              </div>
            </div>
            
            {/* Status */}
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">Status</label>
              <div className="relative">
                <FaCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A29EAB]" size={12} />
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-[#464153] border-none rounded-xl pl-10 pr-8 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none appearance-none cursor-pointer">
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          </div>

          {/* --- NEW: Assign To Dropdown --- */}
          <div>
            <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
              <FaUser size={10} /> Assign Member
            </label>
            <div className="relative">
              <select 
                value={assignedTo} 
                onChange={(e) => setAssignedTo(e.target.value)} 
                disabled={!selectedProjectId}
                className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none cursor-pointer appearance-none disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {projectTeam.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.title || "Member"})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#A29EAB]">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
            {!selectedProjectId && (
              <p className="text-[10px] text-[#A29EAB] mt-1 ml-1">Select a project first to see team members.</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
              <FaAlignLeft size={10} /> Description
            </label>
            <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:ring-2 focus:ring-[#D2C9D8]" placeholder="Add extra details..." />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#A29EAB] bg-[#464153] hover:bg-[#464153]/80 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#35313F] bg-white shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              {isSubmitting ? "Saving..." : <><FaSave /> {editData ? "Update Task" : "Create Task"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
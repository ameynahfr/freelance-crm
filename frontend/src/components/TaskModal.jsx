import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTimes,
  FaCalendarAlt,
  FaAlignLeft,
  FaProjectDiagram,
} from "react-icons/fa";

export default function TaskModal({
  projectId,
  token,
  onClose,
  onCreated,
  editData,
}) {
  const [title, setTitle] = useState(editData?.title || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [dueDate, setDueDate] = useState(
    editData?.dueDate ? editData.dueDate.split("T")[0] : "",
  );
  const [status, setStatus] = useState(editData?.status || "todo");

  // State for global project selection
  const [selectedProjectId, setSelectedProjectId] = useState(
    projectId || editData?.project?._id || "",
  );
  const [projectsList, setProjectsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch projects ONLY if we are on the global "All Tasks" view
  useEffect(() => {
    if (!projectId && !editData) {
      const fetchProjects = async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/projects", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProjectsList(res.data);
        } catch (err) {
          console.error("Failed to load projects:", err);
        }
      };
      fetchProjects();
    }
  }, [projectId, editData, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent creating a global task without a project
    if (!editData && !selectedProjectId) {
      return alert("Please select a project for this task.");
    }

    setIsSubmitting(true);

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      status: status,
    };

    if (dueDate) taskPayload.dueDate = dueDate;

    // Use selectedProjectId for the route
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
      const serverMessage = err.response?.data?.message || "Operation failed";
      console.error("Task Error:", serverMessage);
      alert(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#35313F]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-[#35313F] rounded-[2rem] shadow-2xl overflow-hidden border border-white/5">
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 bg-[#464153]/30">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {editData ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#A29EAB] hover:text-white transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          {/* Global Project Selector - Only appears if NOT in a specific project */}
          {!projectId && !editData && (
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaProjectDiagram size={10} /> Assign to Project
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none cursor-pointer appearance-none"
                >
                  <option value="">-- Select a Project --</option>
                  {projectsList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
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
          )}

          <div>
            <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
              <FaAlignLeft size={10} /> Description
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:ring-2 focus:ring-[#D2C9D8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
                <FaCalendarAlt size={10} /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] [color-scheme:dark] outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none cursor-pointer appearance-none"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
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

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#A29EAB] bg-[#464153]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#35313F] bg-white shadow-lg"
            >
              {isSubmitting
                ? "Saving..."
                : editData
                  ? "Update Task"
                  : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

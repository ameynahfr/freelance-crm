import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import {
  FaTrash,
  FaCheckCircle,
  FaRegCircle,
  FaClock,
  FaPlus,
  FaEdit,
  FaArrowLeft,
  FaUser,
  FaMoneyBillWave,
  FaCalendarAlt
} from "react-icons/fa";
import TaskModal from "../components/TaskModal.jsx";
import ProjectModal from "../components/ProjectModal.jsx";

export default function ProjectDetails() {
  const { id } = useParams(); // Get project ID from URL
  const { token } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Fetch Project & Tasks
  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Parallel fetch for speed
      const [projRes, tasksRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/projects/${id}`, { headers }),
        axios.get(`http://localhost:5000/api/tasks/project/${id}`, { headers })
      ]);

      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
      // Optional: Navigate back if project not found
      // navigate("/projects"); 
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Actions ---

  const deleteProject = async () => {
    if (!window.confirm("Are you sure? This will delete the project and ALL its tasks.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/projects");
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  const toggleTaskStatus = async (task) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    // Optimistic Update
    const updatedTasks = tasks.map(t => t._id === task._id ? { ...t, status: nextStatus } : t);
    setTasks(updatedTasks);

    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${task._id}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Re-fetch project to update progress bar accurately
      fetchData(); 
    } catch (err) {
      console.error("Status update failed");
      setTasks(tasks); // Revert
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((t) => t._id !== taskId));
      // Re-fetch to update progress bar
      fetchData();
    } catch (err) {
      console.error("Delete failed");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#D2C9D8]">
      <div className="bg-[#35313F] px-6 py-3 rounded-full text-white text-sm font-medium animate-pulse">Loading Project...</div>
    </div>
  );

  if (!project) return null;

  return (
    <div className="h-screen w-full bg-[#D2C9D8] p-0 md:p-3 lg:p-4 font-sans text-white overflow-hidden flex">
      <div className="flex flex-1 bg-[#35313F] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto custom-scrollbar relative">
            
            {/* Header / Breadcrumb */}
            <div className="sticky top-0 z-30 bg-[#35313F]/95 backdrop-blur-sm border-b border-[#5B5569]/30">
              <div className="max-w-[1400px] mx-auto w-full px-5 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Link to="/projects" className="p-2 bg-[#464153] rounded-full text-[#A29EAB] hover:text-white transition">
                    <FaArrowLeft size={12} />
                  </Link>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                      {project.title}
                    </h1>
                    <p className="text-[10px] text-[#A29EAB] font-bold uppercase tracking-widest mt-0.5">
                      {project.status} Project
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setIsProjectModalOpen(true)} className="p-2.5 bg-[#464153] text-white rounded-xl hover:bg-[#5B5569] transition" title="Edit Project Details">
                    <FaEdit size={14} />
                  </button>
                  <button onClick={deleteProject} className="p-2.5 bg-[#464153] text-rose-400 rounded-xl hover:bg-rose-500/20 transition" title="Delete Project">
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-[1400px] mx-auto w-full px-5 md:px-8 py-6 space-y-6">
              
              {/* --- PROJECT OVERVIEW CARD --- */}
              <div className="bg-[#464153] rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D2C9D8]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {/* Left: Description & Client */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-[#A29EAB] uppercase tracking-wider mb-2">Description</h3>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {project.description || "No description provided for this project."}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="bg-[#35313F] px-4 py-2 rounded-xl flex items-center gap-3 border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-[#D2C9D8] flex items-center justify-center text-[#35313F] text-xs font-bold">
                          {project.client?.name ? project.client.name.charAt(0) : "S"}
                        </div>
                        <div>
                          <p className="text-[9px] text-[#A29EAB] font-bold uppercase">Client</p>
                          <p className="text-xs font-bold text-white">{project.client?.name || "Self Project"}</p>
                        </div>
                      </div>

                      <div className="bg-[#35313F] px-4 py-2 rounded-xl flex items-center gap-3 border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-[#D2C9D8]/20 text-[#D2C9D8] flex items-center justify-center text-xs font-bold">
                          <FaCalendarAlt />
                        </div>
                        <div>
                          <p className="text-[9px] text-[#A29EAB] font-bold uppercase">Deadline</p>
                          <p className="text-xs font-bold text-white">
                            {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No Date"}
                          </p>
                        </div>
                      </div>

                      {project.budget > 0 && (
                        <div className="bg-[#35313F] px-4 py-2 rounded-xl flex items-center gap-3 border border-white/5">
                          <div className="w-8 h-8 rounded-full bg-[#D2C9D8]/20 text-[#D2C9D8] flex items-center justify-center text-xs font-bold">
                            <FaMoneyBillWave />
                          </div>
                          <div>
                            <p className="text-[9px] text-[#A29EAB] font-bold uppercase">Budget</p>
                            <p className="text-xs font-bold text-white">${project.budget.toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Progress Circle or Bar */}
                  <div className="flex flex-col justify-center bg-[#35313F]/50 p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-[#A29EAB] uppercase">Completion</span>
                      <span className="text-2xl font-bold text-white">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-[#35313F] h-2 rounded-full overflow-hidden mb-2">
                      <div 
                        className="bg-[#D2C9D8] h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${project.progress}%` }} 
                      />
                    </div>
                    <p className="text-[10px] text-[#A29EAB] text-right">Based on {tasks.length} tasks</p>
                  </div>
                </div>
              </div>

              {/* --- TASKS SECTION --- */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-white">Tasks</h2>
                  <button 
                    onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
                    className="bg-white text-[#35313F] px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-gray-100 transition shadow-sm"
                  >
                    <FaPlus /> New Task
                  </button>
                </div>

                {tasks.length === 0 ? (
                  <div className="py-12 text-center bg-[#464153]/30 rounded-[2rem] border border-dashed border-white/10">
                    <p className="text-[#A29EAB] text-sm">No tasks created for this project yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div key={task._id} className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${task.status === "done" ? "bg-[#35313F]/50 border-white/5 opacity-60" : "bg-[#464153] border-transparent hover:border-white/10"}`}>
                        <div className="flex items-center gap-4 flex-1">
                          <button onClick={() => toggleTaskStatus(task)} className={`text-xl transition-transform active:scale-90 ${task.status === "done" ? "text-[#D2C9D8]" : "text-[#A29EAB] hover:text-white"}`}>
                            {task.status === "done" ? <FaCheckCircle /> : <FaRegCircle />}
                          </button>
                          <div>
                            <h3 className={`text-sm font-semibold ${task.status === "done" ? "line-through text-[#A29EAB]" : "text-white"}`}>{task.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-[#A29EAB]">
                              <FaClock size={10} />
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Due Date"}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }} className="p-2 bg-[#35313F] rounded-lg text-[#A29EAB] hover:text-white"><FaEdit size={12} /></button>
                          <button onClick={() => deleteTask(task._id)} className="p-2 bg-[#35313F] rounded-lg text-[#A29EAB] hover:text-rose-400"><FaTrash size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </main>
        </div>
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          projectId={id} // Pass current project ID so it auto-selects
          token={token}
          editData={editingTask}
          onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
          onCreated={() => fetchData()} // Refresh list on create
        />
      )}

      {/* Project Edit Modal */}
      {isProjectModalOpen && (
        <ProjectModal
          token={token}
          editData={project}
          onClose={() => setIsProjectModalOpen(false)}
          onCreated={() => fetchData()} // Refresh project details on update
        />
      )}
    </div>
  );
}
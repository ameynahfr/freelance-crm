import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  FaCalendarAlt,
  FaSpinner,
  FaUser,
  FaCircle
} from "react-icons/fa";
import TaskModal from "../components/TaskModal.jsx";
import ProjectModal from "../components/ProjectModal.jsx";

// 🚀 API LAYER IMPORTS
import { getProjectById, deleteProject as deleteProjectApi } from "../api/projectApi";
import { getProjectTasks, updateTask, deleteTask as deleteTaskApi } from "../api/taskApi";

export default function ProjectDetails() {
  const { id } = useParams(); 
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const isManagement = user?.role === "owner" || user?.role === "manager";

  const fetchProjectData = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        getProjectById(id),
        getProjectTasks(id)
      ]);

      setProject(projRes.data);
      const cleanTasks = tasksRes.data.map(t => ({
        ...t,
        _id: (t._id?.$oid || t._id || "").toString()
      }));
      setTasks(cleanTasks);
    } catch (err) {
      console.error("Master Sync Failure:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProjectData(); }, [fetchProjectData]);

  const handleToggleStatus = async (task) => {
    let nextStatus = task.status === "todo" ? "in-progress" : task.status === "in-progress" ? "done" : "todo";
    
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: nextStatus } : t));

    try {
      await updateTask(task._id, { status: nextStatus });
      fetchProjectData(); 
    } catch (err) {
      fetchProjectData(); 
    }
  };

  // 🚀 NEW: Handle Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to purge this task?")) return;
    try {
      await deleteTaskApi(taskId);
      fetchProjectData();
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete task.");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--os-canvas)]">
      <div className="bg-[var(--os-bg)] px-6 py-3 rounded-full text-[var(--os-text-main)] text-sm animate-pulse">Syncing Mandate Details...</div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[var(--os-canvas)] p-0 md:p-3 lg:p-4 font-sans text-[var(--os-text-main)] overflow-hidden flex">
      <div className="flex flex-1 bg-[var(--os-bg)] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative border border-[var(--os-border)]">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
              
              <div className="flex items-center justify-between">
                <Link to="/projects" className="flex items-center gap-2 text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] transition-colors text-xs font-bold uppercase tracking-widest">
                  <FaArrowLeft size={10} /> Back to Mandates
                </Link>
                {isManagement && (
                  <div className="flex gap-2">
                    <button onClick={() => setIsProjectModalOpen(true)} className="p-3 bg-[var(--os-surface)] rounded-xl text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] transition-colors">
                      <FaEdit size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-[var(--os-surface)] rounded-[2.5rem] p-8 border border-[var(--os-border)] relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <h1 className="text-4xl font-black tracking-tight mb-2">{project?.title}</h1>
                  <p className="text-[var(--os-text-muted)] text-sm leading-relaxed max-w-2xl mb-8">{project?.description}</p>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-[var(--os-bg)] px-4 py-2 rounded-xl border border-[var(--os-border)] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--os-canvas)] flex items-center justify-center text-[#35313F] text-xs font-bold shadow-lg">
                        {project?.client?.name?.charAt(0) || "S"}
                      </div>
                      <span className="text-xs font-bold">{project?.client?.name || "Self Project"}</span>
                    </div>
                    <div className="bg-[var(--os-bg)] px-4 py-2 rounded-xl border border-[var(--os-border)] flex items-center gap-3 text-[var(--os-text-muted)]">
                      <FaCalendarAlt size={12} className="text-indigo-400" />
                      <span className="text-xs font-bold">{project?.deadline ? new Date(project.deadline).toLocaleDateString() : "No Deadline"}</span>
                    </div>
                  </div>
                </div>
                
                {/* 🎨 ANIMATED PROGRESS: Added animate-pulse for a subtle 'breathing' effect */}
                <div className="absolute right-10 bottom-10 hidden lg:block text-right">
                   <p className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-1">Completion</p>
                   <p className="text-6xl font-black text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)] animate-[pulse_3s_ease-in-out_infinite]">
                     {project?.progress}%
                   </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Project Tasks <span className="text-[var(--os-text-muted)] text-sm font-normal ml-2">({tasks.length})</span></h2>
                  {isManagement && (
                    <button onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }} className="bg-white text-[#35313F] px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg hover:bg-[var(--os-canvas)] transition-all">
                      + Add Task
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {tasks.map(task => (
                    <div key={task._id} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--os-surface)]/50 border border-[var(--os-border)] group hover:bg-[var(--os-surface)] hover:border-[#D2C9D8]/20 transition-all">
                      
                      {/* 🎨 COLORED STATUS ICONS */}
                      <button onClick={() => handleToggleStatus(task)} className={`text-xl transition-all ${
                        task.status === 'done' ? 'text-emerald-400' : 
                        task.status === 'in-progress' ? 'text-blue-400' : 'text-[var(--os-text-muted)] hover:text-[var(--os-text-main)]' 
                      }`}>
                        {task.status === 'done' ? <FaCheckCircle className="drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" /> : 
                         task.status === 'in-progress' ? <FaSpinner className="animate-spin drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]" /> :
                         <FaRegCircle />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold truncate ${task.status === 'done' ? 'line-through text-[var(--os-text-muted)]' : 'text-[var(--os-text-main)]'}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-1.5">
                          
                          {/* 🎨 AGENT NAME POP: Colored badge for assigned members */}
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                            task.assignedTo ? 'bg-red-500/10 text-indigo-300 border-indigo-500/20' : 'text-[var(--os-text-muted)] border-transparent'
                          }`}>
                             <FaUser size={8} className={task.assignedTo ? 'text-indigo-400' : ''} /> 
                             {task.assignedTo?.name || "Unassigned"}
                          </div>

                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--os-text-muted)] uppercase tracking-widest text-red-300">
                             <FaClock size={8} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Pill */}
                        <div className="hidden sm:block">
                          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border flex items-center gap-1.5 tracking-widest ${
                            task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            task.status === 'todo' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-[var(--os-bg)] text-[var(--os-text-muted)] border-[var(--os-border)]'
                          }`}>
                            {task.status === 'in-progress' && <FaCircle className="text-[6px] animate-pulse" />}
                            {task.status}
                          </span>
                        </div>

                        {/* 🚀 NEW: Edit & Delete Actions (Revealed on hover) */}
                        {isManagement && (
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
                              className="p-2 bg-[var(--os-bg)] rounded-md border border-[var(--os-border)] text-[var(--os-text-muted)] hover:text-[var(--os-accent)] transition-all shadow-sm"
                              title="Edit Task"
                            >
                              <FaEdit size={10} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTask(task._id)}
                              className="p-2 bg-[var(--os-bg)] rounded-md border border-[var(--os-border)] text-[var(--os-text-muted)] hover:text-rose-400 transition-all shadow-sm"
                              title="Delete Task"
                            >
                              <FaTrash size={10} />
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      {isTaskModalOpen && <TaskModal projectId={id} editData={editingTask} onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }} onCreated={fetchProjectData} />}
      {isProjectModalOpen && <ProjectModal editData={project} onClose={() => setIsProjectModalOpen(false)} onUpdated={fetchProjectData} />}
    </div>
  );
}
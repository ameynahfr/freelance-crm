import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
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
  FaTasks,
  FaEdit,
  FaSearch,
  FaFolderOpen
} from "react-icons/fa";
import TaskModal from "../components/TaskModal.jsx";

export default function Tasks() {
  const { projectId } = useParams();
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState("all"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const taskUrl = projectId && projectId !== "undefined"
        ? `http://localhost:5000/api/tasks/project/${projectId}`
        : `http://localhost:5000/api/tasks/all`;

      const taskRes = await axios.get(taskUrl, { headers });
      setTasks(taskRes.data);

      if (projectId && projectId !== "undefined") {
        const projRes = await axios.get(`http://localhost:5000/api/projects/${projectId}`, { headers });
        setProject(projRes.data);
      } else {
        setProject(null);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !projectId) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/tasks/project/${projectId}`,
        { title: newTaskTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([res.data, ...tasks]);
      setNewTaskTitle("");
    } catch (err) {
      console.error("Quick add failed:", err);
    }
  };

  const toggleStatus = async (task) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    const updatedTasks = tasks.map(t => t._id === task._id ? { ...t, status: nextStatus } : t);
    setTasks(updatedTasks);

    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${task._id}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setTasks(tasks);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete failed");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesFilter = filter === "all" ? true : t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalTasks = filteredTasks.length;
  const doneTasks = filteredTasks.filter(t => t.status === 'done').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#D2C9D8]">
      <div className="bg-[#35313F] px-6 py-3 rounded-full text-white text-sm font-medium animate-pulse">Loading...</div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#D2C9D8] p-0 md:p-3 lg:p-4 font-sans text-white overflow-hidden flex">
      <div className="flex flex-1 bg-[#35313F] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="sticky top-0 z-30 bg-[#35313F]/95 backdrop-blur-sm border-b border-[#5B5569]/30">
              <div className="max-w-[1400px] mx-auto w-full px-5 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                
                <div className="w-full md:w-1/3">
                  <div className="flex items-center gap-2 text-[#A29EAB] text-xs mb-1">
                    <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
                    <span>/</span>
                    <span className="truncate max-w-[150px] font-medium text-white">{project ? project.title : "All Tasks"}</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    {project ? "Project Tasks" : "All Tasks"}
                    <span className="text-sm font-medium text-[#A29EAB] bg-[#464153] px-2 py-0.5 rounded-full">{tasks.length}</span>
                  </h1>
                </div>

                <div className="w-full md:w-auto flex items-center gap-3 bg-[#464153] p-1 rounded-xl">
                  {["all", "todo", "done"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all ${filter === t ? "bg-white text-[#35313F] shadow-sm" : "text-[#A29EAB] hover:text-white"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="w-full md:w-auto flex justify-end gap-3">
                   <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A29EAB]" size={10} />
                    <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#464153] text-white text-xs pl-8 pr-3 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#D2C9D8] w-32 md:w-48 transition-all" />
                  </div>
                  <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="bg-white text-[#35313F] px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-gray-100 transition shadow-sm">
                    <FaPlus /> <span className="hidden sm:inline">New Task</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-[1400px] mx-auto w-full px-5 md:px-8 py-6 space-y-6">
              
              {/* Progress Bar - NOW LAVENDER */}
              {tasks.length > 0 && (
                <div className="bg-[#464153]/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2">
                      <span>Task Completion</span>
                      <span className="text-white">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-[#35313F] h-1.5 rounded-full overflow-hidden">
                      {/* FIXED: Changed to Lavender hex code */}
                      <div className="bg-[#D2C9D8] h-full rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {projectId && (
                <div className="bg-[#464153] p-1.5 rounded-2xl border border-white/5 shadow-inner">
                  <form onSubmit={handleQuickAdd} className="flex gap-2">
                    <input type="text" placeholder="Quickly add a new task to this project..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="flex-1 bg-transparent border-none px-4 py-2 text-sm text-white placeholder-[#A29EAB]/50 outline-none" />
                    <button type="submit" className="bg-[#35313F] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#2A2732] transition">Add</button>
                  </form>
                </div>
              )}

              <div className="space-y-2">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <div key={task._id} className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${task.status === "done" ? "bg-[#35313F]/50 border-white/5 opacity-60" : "bg-[#464153] border-transparent hover:border-white/10 hover:translate-x-1"}`}>
                      <div className="flex items-center gap-4 flex-1 truncate">
                        
                        {/* Checkbox - NOW LAVENDER */}
                        <button
                          onClick={() => toggleStatus(task)}
                          className={`text-xl transition-transform active:scale-90 ${task.status === "done" ? "text-[#D2C9D8]" : "text-[#A29EAB] hover:text-white"}`}
                        >
                          {task.status === "done" ? <FaCheckCircle /> : <FaRegCircle />}
                        </button>
                        
                        <div className="truncate pr-4">
                          <h3 className={`text-sm font-semibold truncate ${task.status === "done" ? "line-through text-[#A29EAB]" : "text-white"}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-[#A29EAB] font-medium">
                            <span className="flex items-center gap-1.5">
                              <FaClock size={10} />
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No Date"}
                            </span>
                            {!projectId && task.project && (
                              <span className="flex items-center gap-1.5 bg-[#35313F] px-2 py-0.5 rounded-md text-white/80">
                                <FaFolderOpen size={10} /> {task.project.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingTask(task); setIsModalOpen(true); }} className="p-2 bg-[#35313F] rounded-lg text-[#A29EAB] hover:text-white hover:bg-white/10 transition-colors"><FaEdit size={12} /></button>
                        <button onClick={() => deleteTask(task._id)} className="p-2 bg-[#35313F] rounded-lg text-[#A29EAB] hover:text-rose-400 hover:bg-rose-400/10 transition-colors"><FaTrash size={12} /></button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center bg-[#464153]/20 rounded-[2rem] border border-dashed border-white/10">
                    <FaTasks className="mx-auto text-[#A29EAB]/20 text-3xl mb-4" />
                    <div className="text-[#A29EAB] text-sm font-medium">No tasks found</div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {isModalOpen && (
        <TaskModal
          projectId={projectId}
          token={token}
          editData={editingTask}
          onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
          onCreated={() => fetchData()}
        />
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { 
  FaCheckCircle, 
  FaRegCircle, 
  FaClock, 
  FaProjectDiagram,
  FaFilter
} from "react-icons/fa";

export default function MyTasks() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'todo', 'done'

  // Fetch My Tasks
  const fetchMyTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks/my-tasks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [token]);

  // Toggle Status
  const toggleStatus = async (task) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    
    // Optimistic UI Update
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: nextStatus } : t));

    try {
      await axios.put(`http://localhost:5000/api/tasks/${task._id}`, 
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      alert("Failed to update task");
      fetchMyTasks(); // Revert on error
    }
  };

  // Filter Logic
  const filteredTasks = tasks.filter(t => {
    if (filter === "done") return t.status === "done";
    if (filter === "todo") return t.status !== "done";
    return true;
  });

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#D2C9D8] text-[#35313F] font-bold animate-pulse">
      Loading your workload...
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#D2C9D8] p-0 md:p-3 lg:p-4 font-sans text-white overflow-hidden flex">
      <div className="flex flex-1 bg-[#35313F] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative">
        <Sidebar />
        
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">My Workload</h1>
                <p className="text-xs text-[#A29EAB] mt-1">
                  Welcome back, <span className="text-white font-bold">{user?.name}</span>. You have {tasks.filter(t => t.status !== 'done').length} pending tasks.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="bg-[#464153] p-1 rounded-xl flex">
                {["all", "todo", "done"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                      filter === f ? "bg-[#35313F] text-white shadow-sm" : "text-[#A29EAB] hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-[2rem] bg-[#464153]/20">
                <div className="w-12 h-12 rounded-full bg-[#464153] flex items-center justify-center text-[#A29EAB] mb-3">
                  <FaCheckCircle />
                </div>
                <p className="text-[#A29EAB] text-sm">No tasks found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredTasks.map((task) => (
                  <div 
                    key={task._id} 
                    className={`group flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all duration-200 
                      ${task.status === "done" 
                        ? "bg-[#35313F]/40 border-white/5 opacity-50" 
                        : "bg-[#464153] border-transparent hover:bg-[#464153]/80 hover:border-white/10 shadow-lg"
                      }`}
                  >
                    {/* Left: Checkbox & Info */}
                    <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                      
                      {/* Custom Checkbox */}
                      <button 
                        onClick={() => toggleStatus(task)}
                        className={`text-xl transition-all duration-300 active:scale-75 ${
                          task.status === "done" ? "text-[#D2C9D8]" : "text-[#A29EAB] hover:text-white"
                        }`}
                      >
                        {task.status === "done" ? <FaCheckCircle /> : <FaRegCircle />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm md:text-base font-bold truncate ${
                          task.status === "done" ? "line-through text-[#A29EAB]" : "text-white"
                        }`}>
                          {task.title}
                        </h3>
                        
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {/* Project Tag */}
                          <Link 
                            to={`/projects/${task.project?._id}`}
                            className="flex items-center gap-1.5 text-[10px] bg-[#35313F] px-2 py-1 rounded-md text-white hover:bg-black/40 transition"
                          >
                            <FaProjectDiagram size={8} />
                            <span className="truncate max-w-[100px]">{task.project?.title || "Unknown Project"}</span>
                          </Link>

                          {/* Due Date */}
                          <div className={`flex items-center gap-1.5 text-[10px] font-medium ${
                             task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"
                               ? "text-rose-400" 
                               : "text-[#A29EAB]"
                          }`}>
                            <FaClock size={8} />
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Deadline"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Assigned By (Manager) */}
                    <div className="hidden md:flex flex-col items-end pl-4 border-l border-white/5">
                      <span className="text-[9px] text-[#A29EAB] uppercase font-bold">Assigned By</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center text-[8px] font-bold text-white">
                          {task.user?.name?.charAt(0) || "A"}
                        </div>
                        <span className="text-xs text-white/80">{task.user?.name || "Admin"}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
            
          </main>
        </div>
      </div>
    </div>
  );
}
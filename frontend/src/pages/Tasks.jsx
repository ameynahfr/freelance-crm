import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import {
  FaTrash,
  FaCheckCircle,
  FaCircle,
  FaClock,
  FaPlus,
  FaTasks,
  FaEdit,
} from "react-icons/fa";
import TaskModal from "../components/TaskModal.jsx";

export default function Tasks() {
  const { projectId } = useParams();
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const taskUrl =
        projectId && projectId !== "undefined"
          ? `http://localhost:5000/api/tasks/project/${projectId}`
          : `http://localhost:5000/api/tasks/all`;

      const taskRes = await axios.get(taskUrl, { headers });
      setTasks(taskRes.data);

      if (projectId && projectId !== "undefined") {
        const projRes = await axios.get(
          `http://localhost:5000/api/projects/${projectId}`,
          { headers },
        );
        setProject(projRes.data);
      } else {
        setProject(null);
      }
    } catch (err) {
      console.error("Fetch error:", err.response?.data?.message || err.message);
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTasks([res.data, ...tasks]);
      setNewTaskTitle("");
    } catch (err) {
      console.error(
        "Quick add failed:",
        err.response?.data?.message || err.message,
      );
    }
  };

  const toggleStatus = async (task) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    try {
      const res = await axios.put(
        `http://localhost:5000/api/tasks/${task._id}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      console.error(
        "Status update failed:",
        err.response?.data?.message || err.message,
      );
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      console.error(
        "Delete failed:",
        err.response?.data?.message || err.message,
      );
    }
  };

  const filteredTasks = tasks.filter((t) =>
    filter === "all" ? true : t.status === filter,
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#D2C9D8]">
        <div className="bg-[#35313F] px-6 py-3 rounded-full text-white text-sm font-medium animate-pulse">
          Loading Tasks...
        </div>
      </div>
    );

  return (
    <div className="h-screen w-full bg-[#D2C9D8] p-0 md:p-3 lg:p-4 font-sans text-white overflow-hidden flex">
      <div className="flex flex-1 bg-[#35313F] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto custom-scrollbar relative">
            {/* NEW STICKY HEADER LAYOUT */}
            <div className="sticky top-0 z-30 bg-[#35313F]/95 backdrop-blur-sm border-b border-[#5B5569]/30">
              <div className="max-w-[1400px] mx-auto w-full px-5 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                {/* 1. LEFT: Breadcrumbs & Title */}
                <div className="w-full md:w-1/3 flex flex-col items-start">
                  <div className="flex items-center gap-2 text-[#A29EAB] text-xs mb-1">
                    <Link
                      to="/projects"
                      className="hover:text-white transition-colors"
                    >
                      Projects
                    </Link>
                    <span>/</span>
                    <span className="truncate max-w-[150px] font-medium">
                      {project ? project.title : "All Tasks"}
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    {project ? "Project Tasks" : "All Tasks"}
                  </h1>
                </div>

                {/* 2. CENTER: Filter Buttons */}
                <div className="w-full md:w-1/3 flex justify-start md:justify-center">
                  <div className="flex bg-[#464153] p-1 rounded-xl">
                    {["all", "todo", "done"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all ${filter === t ? "bg-white text-[#35313F] shadow-sm" : "text-[#A29EAB] hover:text-white"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. RIGHT: New Task Button */}
                <div className="w-full md:w-1/3 flex justify-start md:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(null);
                      setIsModalOpen(true);
                    }}
                    className="bg-white text-[#35313F] px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-gray-100 transition shadow-sm w-full md:w-auto"
                  >
                    <FaPlus /> <span>New Task</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-[1400px] mx-auto w-full px-5 md:px-8 py-6 space-y-6">
              {/* CONDITIONAL ACTION BAR: Only shows if inside a specific project */}
              {projectId && (
                <div className="bg-[#464153] p-4 rounded-2xl flex flex-col md:flex-row gap-3 border border-white/5 shadow-inner">
                  <form onSubmit={handleQuickAdd} className="flex-1 flex gap-3">
                    <input
                      type="text"
                      placeholder="Quick add a new task to this project..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-1 bg-[#35313F] border-none rounded-xl px-4 py-2 text-sm text-white placeholder-[#A29EAB]/50 outline-none focus:ring-2 focus:ring-[#D2C9D8]"
                    />
                    <button
                      type="submit"
                      className="bg-white/10 text-white px-5 py-2 rounded-xl text-[10px] md:text-xs font-bold hover:bg-white/20 transition"
                    >
                      Save Task
                    </button>
                  </form>
                </div>
              )}

              {/* TASK LIST */}
              <div className="space-y-3">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <div
                      key={task._id}
                      className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${task.status === "done" ? "bg-[#35313F]/50 border-white/5 opacity-60" : "bg-[#464153] border-transparent hover:border-white/10"}`}
                    >
                      <div className="flex items-center gap-4 flex-1 truncate">
                        <button
                          onClick={() => toggleStatus(task)}
                          className={`text-xl transition-colors ${task.status === "done" ? "text-white" : "text-[#A29EAB] hover:text-white"}`}
                        >
                          {task.status === "done" ? (
                            <FaCheckCircle />
                          ) : (
                            <FaCircle />
                          )}
                        </button>
                        <div className="truncate pr-4">
                          <h3
                            className={`text-sm md:text-base font-semibold truncate ${task.status === "done" ? "line-through text-[#A29EAB]" : "text-white"}`}
                          >
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-[#A29EAB] font-medium">
                            <span className="flex items-center gap-1.5">
                              <FaClock />
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString(
                                    "en-US",
                                    { month: "short", day: "numeric" },
                                  )
                                : new Date(task.createdAt).toLocaleDateString(
                                    "en-US",
                                    { month: "short", day: "numeric" },
                                  )}
                            </span>
                            {!projectId && (
                              <span className="bg-[#35313F] px-2 py-0.5 rounded-full text-white">
                                {task.project?.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setIsModalOpen(true);
                          }}
                          className="p-2.5 text-[#A29EAB] hover:text-white md:opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="p-2.5 text-[#A29EAB] hover:text-rose-400 md:opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center bg-[#464153]/30 rounded-[2rem] border border-dashed border-white/10">
                    <FaTasks className="mx-auto text-[#A29EAB] text-3xl mb-4 opacity-20" />
                    <div className="text-[#A29EAB] text-sm font-medium mb-1">
                      No tasks found
                    </div>
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
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onCreated={() => fetchData()}
        />
      )}
    </div>
  );
}

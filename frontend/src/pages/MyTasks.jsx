import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { 
  DndContext, 
  closestCorners, 
  MouseSensor, 
  TouchSensor, 
  useSensor, 
  useSensors, 
  DragOverlay 
} from "@dnd-kit/core";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { FaSearch } from "react-icons/fa";
import TaskModal from "../components/TaskModal.jsx";
import KanbanColumn from "../components/KanbanColumn.jsx";
import SortableTaskCard from "../components/SortableTaskCard.jsx";

// 🚀 API LAYER IMPORTS
import { getMyTasks, getProjectTasks, updateTask } from "../api/taskApi";
import { getProjectById } from "../api/projectApi";

export default function MyTasks() {
  const { projectId } = useParams(); // For when you view tasks within a specific project
  const { token, user, loading: authLoading } = useAuth(); 
  
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      // 🎯 Logic: If on a project page, show project tasks. Otherwise, show personal workload.
      const taskRes = projectId && projectId !== "undefined"
        ? await getProjectTasks(projectId)
        : await getMyTasks();
      
      const cleanTasks = taskRes.data.map(t => ({
        ...t,
        _id: (t._id?.$oid || t._id || "").toString()
      }));
      setTasks(cleanTasks);

      if (projectId && projectId !== "undefined") {
        const projRes = await getProjectById(projectId);
        setProject(projRes.data);
      }
    } catch (err) { 
      console.error("Board Sync Error:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [projectId, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDragStart = (event) => {
    const task = tasks.find(t => t._id === event.active.id.toString());
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id.toString();
    const overId = over.id.toString();

    let newStatus = overId; 
    const isOverACard = tasks.find(t => t._id === overId);
    if (isOverACard) {
      newStatus = isOverACard.status;
    }

    if (!["todo", "in-progress", "done"].includes(newStatus)) return;

    const taskToUpdate = tasks.find(t => t._id === taskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;

    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err) { 
      fetchData(); 
    }
  };

  const filtered = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (authLoading || loading || !user) return (
    <div className="h-screen flex items-center justify-center bg-[var(--os-canvas)]">
      <div className="bg-[var(--os-bg)] px-6 py-3 rounded-full text-[var(--os-text-main)] text-sm animate-pulse">Syncing Mandates...</div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[var(--os-canvas)] p-0 md:p-3 lg:p-4 font-sans text-[var(--os-text-main)] overflow-hidden flex">
      <div className="flex flex-1 bg-[var(--os-bg)] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative border border-[var(--os-border)]">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />
          <main className="flex-1 overflow-hidden flex flex-col">
            <div className="bg-[var(--os-bg)]/95 backdrop-blur-sm border-b border-[#5B5569]/30 px-8 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">{project ? project.title : "My Workload"}</h1>
                <p className="text-[10px] text-[var(--os-text-muted)] uppercase font-bold tracking-widest">Active Kanban Workspace</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={10} />
                  <input 
                    type="text" placeholder="Search..." value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="bg-[var(--os-surface)] text-[var(--os-text-main)] text-xs pl-8 pr-3 py-2.5 rounded-xl border-none outline-none w-48 focus:ring-1 focus:ring-[#D2C9D8]" 
                  />
                </div>
                {(user.role === 'owner' || user.role === 'manager') && (
                  <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="bg-white text-[#35313F] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[var(--os-canvas)] transition-colors">
                    + New Task
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-x-auto p-6 scrollbar-hide">
              <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex gap-6 h-full min-w-[900px]">
                  <KanbanColumn id="todo" title="To Do" tasks={filtered.filter(t => t.status === "todo")} currentUser={user} onEdit={setEditingTask} onDelete={fetchData} />
                  <KanbanColumn id="in-progress" title="In Progress" tasks={filtered.filter(t => t.status === "in-progress")} currentUser={user} onEdit={setEditingTask} onDelete={fetchData} />
                  <KanbanColumn id="done" title="Completed" tasks={filtered.filter(t => t.status === "done")} currentUser={user} onEdit={setEditingTask} onDelete={fetchData} />
                </div>
                <DragOverlay dropAnimation={null}>
                  {activeTask ? <SortableTaskCard task={activeTask} currentUser={user} isOverlay /> : null}
                </DragOverlay>
              </DndContext>
            </div>
          </main>
        </div>
      </div>
      {isModalOpen && (
        <TaskModal projectId={projectId} editData={editingTask} onClose={() => { setIsModalOpen(false); setEditingTask(null); }} onCreated={fetchData} />
      )}
    </div>
  );
}
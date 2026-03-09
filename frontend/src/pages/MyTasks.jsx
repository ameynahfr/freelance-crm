import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
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
import { FaSearch, FaExclamationTriangle } from "react-icons/fa";
import TaskModal from "../components/TaskModal.jsx";
import KanbanColumn from "../components/KanbanColumn.jsx";
import SortableTaskCard from "../components/SortableTaskCard.jsx";
import TaskDossierModal from "../components/TaskDossierModal.jsx";

// 🚀 API LAYER IMPORTS
import { getMyTasks, getProjectTasks, updateTask, deleteTask as deleteTaskApi } from "../api/taskApi";
import { getProjectById } from "../api/projectApi";

export default function MyTasks() {
  const { projectId } = useParams();
  const { token, user, loading: authLoading } = useAuth(); 
  
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [dossierTask, setDossierTask] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
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
      toast.error("Telemetry sync failed.");
    } finally { 
      setLoading(false); 
    }
  }, [projectId, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // 🚀 TACTICAL REFACTOR: Replaced window.confirm with Custom Toast
  const handleDeleteTask = (taskId) => {
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[200px]">
        <div className="flex items-center gap-2 text-rose-400">
          <FaExclamationTriangle size={12} />
          <p className="text-[10px] font-black uppercase tracking-widest">Confirm Purge</p>
        </div>
        <p className="text-[11px] font-bold text-[var(--os-text-main)]">
          Discard this task from the active ledger?
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              toast.promise(deleteTaskApi(taskId), {
                loading: 'Purging...',
                success: () => {
                  fetchData();
                  return 'Task Expunged';
                },
                error: 'Purge Failed',
              });
            }}
            className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
          >
            Execute
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-[var(--os-bg)] text-[var(--os-text-muted)] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border border-[var(--os-border)] hover:text-[var(--os-text-main)]"
          >
            Abort
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'bottom-center' });
  };

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

    // Optimistic UI Update
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    // 🚀 TACTICAL REFACTOR: Added Promise Toast for status synchronization
    toast.promise(
      updateTask(taskId, { status: newStatus }),
      {
        loading: 'Syncing status...',
        success: 'Mandate Updated',
        error: () => {
          fetchData(); // Rollback
          return 'Sync Failed';
        },
      },
      { success: { duration: 1000 } } // Quick dismiss for success
    );
  };

  const filtered = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (authLoading || loading || !user) return (
    <div className="h-screen flex items-center justify-center bg-[var(--os-canvas)]">
      <div className="bg-[var(--os-bg)] px-8 py-4 rounded-2xl text-[var(--os-text-main)] text-xs font-black uppercase tracking-widest animate-pulse border border-[var(--os-border)] shadow-2xl">
        Syncing Mandates...
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[var(--os-canvas)] p-0 md:p-3 lg:p-4 font-sans text-[var(--os-text-main)] overflow-hidden flex">
      <div className="flex flex-1 bg-[var(--os-bg)] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative border border-[var(--os-border)]">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />
          <main className="flex-1 overflow-hidden flex flex-col">
            
            <div className="bg-[var(--os-bg)]/95 backdrop-blur-sm border-b border-[var(--os-border)] px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl font-black tracking-tight">{project ? project.title : "My Workload"}</h1>
                <p className="text-[10px] text-[var(--os-text-muted)] uppercase font-bold tracking-widest mt-0.5">Active Kanban Workspace</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-auto">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)] opacity-50" size={10} />
                  <input 
                    type="text" placeholder="Search parameters..." value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full sm:w-56 bg-[var(--os-surface)] text-[var(--os-text-main)] text-xs font-bold pl-10 pr-4 py-2.5 rounded-xl border border-[var(--os-border)] outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all shadow-inner placeholder:text-[var(--os-text-muted)]/40" 
                  />
                </div>
                {(user.role === 'owner' || user.role === 'manager') && (
                  <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="bg-[var(--os-btn-primary)] text-[var(--os-btn-primary-text)] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--os-btn-primary)]/20 whitespace-nowrap">
                    + New Task
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-x-auto p-6 lg:p-8 scrollbar-hide bg-[var(--os-surface)]/20">
              <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex gap-6 h-full min-w-[950px]">
                  <KanbanColumn 
                    id="todo" 
                    title="TO DO" 
                    tasks={filtered.filter(t => t.status === "todo")} 
                    currentUser={user} 
                    onEdit={handleEditTask} 
                    onDelete={handleDeleteTask} 
                    onTaskClick={setDossierTask} 
                  />
                  <KanbanColumn 
                    id="in-progress" 
                    title="In Progress" 
                    tasks={filtered.filter(t => t.status === "in-progress")} 
                    currentUser={user} 
                    onEdit={handleEditTask} 
                    onDelete={handleDeleteTask} 
                    onTaskClick={setDossierTask} 
                  />
                  <KanbanColumn 
                    id="done" 
                    title="DONE" 
                    tasks={filtered.filter(t => t.status === "done")} 
                    currentUser={user} 
                    onEdit={handleEditTask} 
                    onDelete={handleDeleteTask} 
                    onTaskClick={setDossierTask} 
                  />
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
        <TaskModal 
          projectId={projectId} 
          editData={editingTask} 
          onClose={() => { setIsModalOpen(false); setEditingTask(null); }} 
          onCreated={fetchData} 
        />
      )}
      
      {dossierTask && (
        <TaskDossierModal 
          task={dossierTask} 
          currentUser={user} 
          onClose={() => setDossierTask(null)} 
          onUpdated={() => { fetchData(); setDossierTask(null); }} 
        />
      )}
    </div>
  );
}
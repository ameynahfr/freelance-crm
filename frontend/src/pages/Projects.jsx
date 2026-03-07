import { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import ProjectModal from "../components/ProjectModal.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { Link } from "react-router-dom";
import { 
  FaPlus, FaTrash, FaSearch, FaFolderOpen, 
  FaCheckCircle, FaRocket, FaClock, FaChartPie 
} from "react-icons/fa";

// 🚀 API LAYER IMPORTS
import { getProjects, deleteProject as deleteProjectApi } from "../api/projectApi";

export default function Projects() {
  const { user, isAuthenticated } = useAuth(); 
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const canManage = user && (user.role === "owner" || user.role === "manager");

  const fetchProjects = useCallback(async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    if (isAuthenticated) fetchProjects(); 
  }, [fetchProjects, isAuthenticated]);

  const resolveStatus = (project) => {
    if (project.progress === 100) return "completed";
    return project.status;
  };

  const filteredProjects = projects.filter((project) => {
    const currentStatus = resolveStatus(project);
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (project.client?.name && project.client.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" ? true : currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats for the top bar
  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => resolveStatus(p) === 'active').length,
    completed: projects.filter(p => resolveStatus(p) === 'completed').length,
  }), [projects]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will permanently delete the project.")) return;
    try {
      await deleteProjectApi(id);
      setProjects(projects.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "completed": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "pending": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-[var(--os-bg)] text-[var(--os-text-muted)] border-[var(--os-border)]";
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--os-canvas)]">
      <div className="bg-[var(--os-bg)] px-8 py-4 rounded-2xl text-[var(--os-text-main)] text-sm font-bold animate-pulse border border-[var(--os-border)]">
        Initializing Intelligence...
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[var(--os-canvas)] p-0 md:p-3 flex font-sans text-[var(--os-text-main)] overflow-hidden">
      <div className="flex flex-1 bg-[var(--os-bg)] rounded-none md:rounded-3xl shadow-2xl overflow-hidden relative border border-[var(--os-border)]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto space-y-8">
              
              {/* --- TOP STATS & ACTIONS --- */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="grid grid-cols-3 gap-4 md:gap-8 bg-[var(--os-surface)] p-4 rounded-2xl border border-[var(--os-border)] shadow-sm">
                  <StatItem label="Total" value={stats.total} icon={<FaChartPie size={12}/>} />
                  <StatItem label="Active" value={stats.active} icon={<FaRocket size={12} className="text-emerald-400"/>} />
                  <StatItem label="Done" value={stats.completed} icon={<FaCheckCircle size={12} className="text-indigo-400"/>} />
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-64">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)] opacity-50" size={10} />
                    <input 
                      type="text" placeholder="Search mandates..." value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-[var(--os-accent)] outline-none" 
                    />
                  </div>
                  {canManage && (
                    <button 
                      onClick={() => { setEditingProject(null); setShowModal(true); }} 
                      className="bg-[var(--os-text-main)] text-[var(--os-bg)] text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl hover:opacity-80 transition flex items-center gap-2"
                    >
                      <FaPlus /> New
                    </button>
                  )}
                </div>
              </div>

              {/* --- DYNAMIC STATUS FILTER --- */}
              <div className="flex gap-2 p-1 bg-[var(--os-surface)] rounded-xl border border-[var(--os-border)] w-fit">
                {['all', 'active', 'pending', 'completed'].map((s) => (
                  <button 
                    key={s} onClick={() => setStatusFilter(s)}
                    className={`px-5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      statusFilter === s ? "bg-[var(--os-bg)] text-[var(--os-text-main)] shadow-sm" : "text-[var(--os-text-muted)] hover:text-[var(--os-text-main)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* --- MANDATE GRID --- */}
              {filteredProjects.length === 0 ? (
                <div className="py-32 text-center bg-[var(--os-surface)]/10 rounded-[2.5rem] border border-dashed border-[var(--os-border)]">
                  <FaFolderOpen className="mx-auto text-[var(--os-text-muted)] opacity-20 text-5xl mb-4" />
                  <p className="text-[var(--os-text-muted)] text-[10px] font-black uppercase tracking-widest">No matching records</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard 
                      key={project._id} 
                      project={project} 
                      resolveStatus={resolveStatus} 
                      getStatusStyle={getStatusStyle} 
                      canManage={canManage}
                      onEdit={() => { setEditingProject(project); setShowModal(true); }}
                      onDelete={() => handleDelete(project._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {showModal && (
        <ProjectModal 
          editData={editingProject} 
          onClose={() => { setShowModal(false); setEditingProject(null); }} 
          onUpdated={fetchProjects} onCreated={fetchProjects} 
        />
      )}
    </div>
  );
}

/* --- REUSABLE SUB-COMPONENTS --- */

function StatItem({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="p-2 rounded-lg bg-[var(--os-bg)] border border-[var(--os-border)] text-[var(--os-text-muted)]">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-black leading-none">{value}</h4>
        <p className="text-[8px] font-bold text-[var(--os-text-muted)] uppercase tracking-tighter mt-1">{label}</p>
      </div>
    </div>
  );
}

function ProjectCard({ project, resolveStatus, getStatusStyle, canManage, onEdit, onDelete }) {
  const status = resolveStatus(project);
  
  return (
    <div className="bg-[var(--os-surface)] rounded-[2rem] p-6 border border-[var(--os-border)] hover:border-[var(--os-text-muted)]/20 transition-all group flex flex-col relative shadow-sm hover:shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black truncate pr-2 group-hover:text-[var(--os-accent)] transition-colors">{project.title}</h3>
          <p className="text-[10px] font-bold text-[var(--os-text-muted)] truncate mt-0.5">{project.client?.name || "Internal Mission"}</p>
        </div>
        <span className={`text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${getStatusStyle(status)}`}>
          {status}
        </span>
      </div>

      <p className="text-[11px] text-[var(--os-text-muted)] leading-relaxed mb-8 line-clamp-2 min-h-[32px]">
        {project.description || "Mission briefing restricted or pending."}
      </p>

      {/* Progress Section */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between items-end text-[9px] font-black uppercase tracking-widest">
          <span className="text-[var(--os-text-muted)] flex items-center gap-1.5"><FaClock size={10}/> Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</span>
          <span className={project.progress === 100 ? 'text-blue-300' : ''}>{project.progress}%</span>
        </div>
        <div className="w-full bg-[var(--os-bg)] h-1.5 rounded-full overflow-hidden border border-[var(--os-border)]">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${project.progress === 100 ? 'bg-blue-400' :
                                                                            project.progress >= 1 && project.progress <= 99 ? 'bg-yellow-400' :
                                                                              'bg-[var(--os-accent)]'}`} 
            style={{ width: `${project.progress}%` }} 
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-[var(--os-border)] mt-auto">
        <div className="flex gap-4">
          {canManage && (
            <button onClick={onEdit} className="text-[9px] font-black uppercase text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] tracking-widest transition">Edit</button>
          )}
          {canManage && (
            <button onClick={onDelete} className="text-[9px] font-black uppercase text-rose-400/50 hover:text-rose-400 tracking-widest transition">Purge</button>
          )}
        </div>
        <Link 
          to={`/projects/${project._id}`} 
          className="text-[9px] font-black uppercase tracking-widest bg-[var(--os-bg)] px-4 py-2 rounded-lg border border-[var(--os-border)] hover:bg-[var(--os-surface)] transition shadow-sm"
        >
          View Mandate
        </Link>
      </div>
    </div>
  );
}
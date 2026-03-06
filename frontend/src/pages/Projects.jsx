import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import ProjectModal from "../components/ProjectModal.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { Link } from "react-router-dom";
import { 
  FaPlus, 
  FaTrash, 
  FaExternalLinkAlt, 
  FaSearch, 
  FaEdit, 
  FaFolderOpen 
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

  // 🎯 AUTO-STATUS RESOLVER: Links label to progress
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will permanently delete the project.")) return;
    try {
      await deleteProjectApi(id);
      setProjects(projects.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "completed": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "pending": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default: return "bg-[#35313F] text-[#A29EAB]";
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#D2C9D8]">
      <div className="bg-[#35313F] px-6 py-3 rounded-full text-white text-sm font-medium animate-pulse">
        Syncing Projects...
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#D2C9D8] p-0 md:p-3 lg:p-4 font-sans text-white overflow-hidden flex">
      <div className="flex flex-1 bg-[#35313F] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative border border-white/5">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="sticky top-0 z-30 bg-[#35313F]/95 backdrop-blur-sm border-b border-[#5B5569]/30 px-8 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Mandates</h1>
                <p className="text-[#A29EAB] text-[10px] font-bold uppercase tracking-widest mt-1">
                  {filteredProjects.length} Records Active
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative min-w-[200px] md:min-w-[300px]">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A29EAB]" size={10} />
                  <input 
                    type="text" 
                    placeholder="Search mandates..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full bg-[#464153] border-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-[#D2C9D8]" 
                  />
                </div>
                {canManage && (
                  <button 
                    onClick={() => { setEditingProject(null); setShowModal(true); }} 
                    className="bg-white text-[#35313F] text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-[#D2C9D8] transition shadow-2xl"
                  >
                    + New Mandate
                  </button>
                )}
              </div>
            </div>

            <div className="max-w-[1600px] mx-auto w-full px-5 md:px-8 py-6">
              {filteredProjects.length === 0 ? (
                <div className="py-24 text-center bg-[#464153]/20 rounded-[2.5rem] border border-dashed border-white/10">
                  <FaFolderOpen className="mx-auto text-[#A29EAB]/20 text-5xl mb-4" />
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs">No active records found</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => {
                    // 🚀 Apply the Auto-Status Logic
                    const displayStatus = resolveStatus(project);
                    
                    return (
                      <div key={project._id} className="bg-[#464153] rounded-[2rem] p-7 border border-white/5 hover:border-[#D2C9D8]/20 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden">
                        {/* Status Label (Auto-Linked to Progress) */}
                        <div className="flex justify-between items-start mb-5">
                          <h3 className="text-base font-black text-white tracking-tight truncate pr-2">{project.title}</h3>
                          <span className={`text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.2em] transition-colors ${getStatusColor(displayStatus)}`}>
                            {displayStatus}
                          </span>
                        </div>

                        {/* Client Info */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-xl bg-[#D2C9D8] flex items-center justify-center text-[#35313F] text-[10px] font-black shadow-lg">
                            {project.client?.name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-[#A29EAB] uppercase tracking-widest">Client</p>
                            <p className="text-xs font-bold text-white truncate max-w-[150px]">{project.client?.name || "Internal OS"}</p>
                          </div>
                        </div>

                        <p className="text-xs text-[#A29EAB] font-bold mb-8 line-clamp-2 leading-relaxed opacity-80">
                          {project.description || "Project briefing pending."}
                        </p>

                        {/* Progress Integration */}
                        <div>
                          <div className="mb-8">
                            <div className="flex justify-between text-[10px] font-black text-[#A29EAB] uppercase tracking-widest mb-2">
                              <span>Health Check</span>
                              <span className={project.progress === 100 ? "text-blue-400" : "text-white"}>
                                {project.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-[#35313F] h-2 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.1)] ${project.progress === 100 ? "bg-blue-400" : "bg-[#D2C9D8]"}`} 
                                style={{ width: `${project.progress}%` }} 
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-5 border-t border-white/5">
                            <div className="text-[9px] font-black text-[#A29EAB] uppercase tracking-widest">
                              Due: <span className="text-white ml-1">{project.deadline ? new Date(project.deadline).toLocaleDateString() : "Open"}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              {canManage && (
                                <button 
                                  onClick={() => { setEditingProject(project); setShowModal(true); }} 
                                  className="text-[10px] font-black uppercase text-[#A29EAB] hover:text-white transition tracking-widest"
                                >
                                  Edit
                                </button>
                              )}
                              <Link to={`/projects/${project._id}`} className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white/10 transition tracking-widest border border-white/5 shadow-lg">
                                Open Mandate
                              </Link>
                              {canManage && (
                                <button 
                                  onClick={() => handleDelete(project._id)} 
                                  className="text-rose-400/40 hover:text-rose-400 transition ml-1"
                                >
                                  <FaTrash size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
          onUpdated={fetchProjects} 
          onCreated={fetchProjects} 
        />
      )}
    </div>
  );
}
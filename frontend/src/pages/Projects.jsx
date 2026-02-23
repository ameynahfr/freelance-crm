import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import ProjectModal from "../components/ProjectModal.jsx";
import axios from "axios";
import { useAuth } from "../hooks/useAuth.jsx";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaExternalLinkAlt,
  FaSearch,
  FaFilter,
  FaEdit,
  FaFolderOpen,
} from "react-icons/fa";

export default function Projects() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // Tracks project for editing
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Combined Search and Status filtering logic
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.client &&
        project.client.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ? true : project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(projects.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "canceled":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-[#35313F] text-[#A29EAB]";
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#D2C9D8]">
        <div className="bg-[#35313F] px-6 py-3 rounded-full text-white text-sm font-medium animate-pulse">
          Loading Projects...
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
            {/* STICKY SEARCH & FILTER BAR */}
            <div className="sticky top-0 z-30 bg-[#35313F]/95 backdrop-blur-sm border-b border-[#5B5569]/30">
              <div className="max-w-[1600px] mx-auto w-full px-5 md:px-8 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                      Projects
                    </h1>
                    <p className="text-[#A29EAB] text-[10px] md:text-xs font-medium mt-0.5">
                      {filteredProjects.length} Projects found
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[180px] md:min-w-[280px]">
                      <FaSearch
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A29EAB]"
                        size={12}
                      />
                      <input
                        type="text"
                        placeholder="Search projects or clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#464153] border-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#A29EAB]/50 focus:ring-2 focus:ring-white/20 outline-none transition-all"
                      />
                    </div>

                    {/* Status Filter Dropdown */}
                    <div className="relative">
                      <FaFilter
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A29EAB]"
                        size={10}
                      />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#464153] border-none rounded-xl pl-8 pr-8 py-2.5 text-[11px] font-bold text-white outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-white/20"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setEditingProject(null);
                        setShowModal(true);
                      }}
                      className="bg-white text-[#35313F] text-xs font-bold px-5 py-2.5 rounded-full hover:bg-gray-100 transition shadow-sm flex items-center gap-2"
                    >
                      <FaPlus /> <span>New Project</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="max-w-[1600px] mx-auto w-full px-5 md:px-8 py-6">
              {filteredProjects.length === 0 ? (
                <div className="py-24 text-center bg-[#464153]/20 rounded-[2.5rem] border border-dashed border-white/10">
                  <FaFolderOpen className="mx-auto text-[#A29EAB]/20 text-5xl mb-4" />
                  <h3 className="text-white font-bold">No results found</h3>
                  <p className="text-[#A29EAB] text-xs mt-1">
                    Try adjusting your filters or search terms.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                  {filteredProjects.map((project) => (
                    <div
                      key={project._id}
                      className="bg-[#464153] rounded-[1.8rem] p-6 border border-transparent hover:border-white/10 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-base md:text-lg font-bold text-white tracking-tight truncate pr-2">
                            {project.title}
                          </h3>
                          <span
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${getStatusColor(project.status)}`}
                          >
                            {project.status}
                          </span>
                        </div>

                        {/* Updated Client Avatar and Name Logic */}
                        <div className="text-xs font-semibold text-[#A29EAB] mb-4 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#D2C9D8] flex items-center justify-center text-[#35313F] text-[9px] font-bold">
                            {/* Fix: Access the name property before calling charAt */}
                            {project.client?.name
                              ? project.client.name.charAt(0).toUpperCase()
                              : "S"}
                          </div>
                          <span className="truncate">
                            {/* Fix: Display client name or "Self Project" if null */}
                            {project.client?.name || "Self Project"}
                          </span>
                        </div>

                        <p className="text-xs md:text-sm text-[#A29EAB] font-medium mb-6 line-clamp-2 leading-relaxed">
                          {project.description || "No description provided."}
                        </p>
                      </div>

                      <div>
                        {/* Progress Bar */}
                        <div className="mb-6">
                          <div className="flex justify-between text-[10px] font-bold text-[#A29EAB] mb-2">
                            <span>Progress</span>
                            <span className="text-white">
                              {project.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-[#35313F] h-1.5 rounded-full overflow-hidden shadow-inner">
                            <div
                              className="bg-[#D2C9D8] h-full rounded-full transition-all duration-700"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="flex justify-between items-center pt-4 border-t border-[#5B5569]/50">
                          <div className="text-[10px] font-bold text-[#A29EAB]">
                            {project.deadline ? (
                              <>
                                Due:{" "}
                                <span className="text-white">
                                  {new Date(
                                    project.deadline,
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            ) : (
                              "No deadline"
                            )}
                          </div>

                          <div className="flex gap-4">
                            {/* Edit Action */}
                            <button
                              onClick={() => {
                                setEditingProject(project);
                                setShowModal(true);
                              }}
                              className="text-[11px] font-bold text-white/70 hover:text-white transition flex items-center gap-1.5"
                            >
                              <FaEdit size={11} /> Edit
                            </button>

                            {/* View Action */}
                            <Link
                              to={`/tasks/project/${project._id}`}
                              className="text-[11px] font-bold text-white hover:text-[#D2C9D8] transition flex items-center gap-1.5"
                            >
                              <FaExternalLinkAlt size={10} /> View
                            </Link>

                            {/* Delete Action (Optional: icon only to save space) */}
                            <button
                              onClick={() => deleteProject(project._id)}
                              className="text-[11px] font-bold text-rose-400/60 hover:text-rose-400 transition"
                            >
                              <FaTrash size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Combined Create/Edit Modal */}
        {showModal && (
          <ProjectModal
            token={token}
            editData={editingProject}
            onClose={() => {
              setShowModal(false);
              setEditingProject(null);
            }}
            onUpdated={fetchProjects}
          />
        )}
      </div>
    </div>
  );
}

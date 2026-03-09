import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import toast from "react-hot-toast"; // 🚀 TOAST IMPORT
import { 
  FaArrowLeft, FaEnvelope, FaPhone, FaStickyNote, 
  FaProjectDiagram, FaBuilding, FaCheckCircle, FaClock
} from "react-icons/fa";

// 🚀 API LAYER IMPORTS
import { getClientById } from "../api/clientApi";

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClientData = useCallback(async () => {
    try {
      const res = await getClientById(id);
      // Ensure your backend returns the data in this structure
      setClient(res.data.client);
      setProjects(res.data.projects);
    } catch (err) {
      toast.error("Access denied. Dossier decryption failed.");
      console.error("Failed to sync client dossier:", err);
      navigate("/clients"); // Kick them back to directory if it fails
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[var(--os-canvas)]">
      <div className="bg-[var(--os-bg)] px-8 py-4 rounded-2xl text-[var(--os-text-main)] text-xs font-black uppercase tracking-widest animate-pulse border border-[var(--os-border)] shadow-2xl">
        Decrypting Dossier...
      </div>
    </div>
  );

  if (!client) return null;

  return (
    <div className="h-screen w-full bg-[var(--os-canvas)] p-0 md:p-3 flex font-sans text-[var(--os-text-main)] overflow-hidden">
      <div className="flex flex-1 bg-[var(--os-bg)] rounded-none md:rounded-3xl shadow-2xl overflow-hidden relative border border-[var(--os-border)]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
            <div className="max-w-[1200px] mx-auto space-y-8">
              
              <div className="flex items-center justify-between">
                <Link to="/clients" className="flex items-center gap-2 text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] transition-colors text-xs font-bold uppercase tracking-widest">
                  <FaArrowLeft size={10} /> Back to Directory
                </Link>
                <h1 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--os-text-muted)]">Partner Dossier</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT: Identity */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-[var(--os-surface)] p-8 rounded-[2.5rem] border border-[var(--os-border)] shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[var(--os-accent)]/10 to-transparent" />
                    
                    <div className="w-24 h-24 rounded-[2rem] border-4 border-[var(--os-bg)] bg-[var(--os-canvas)] flex items-center justify-center text-4xl font-black text-[var(--os-text-main)] shadow-2xl z-10 mb-4">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <h2 className="text-2xl font-black tracking-tighter mb-1">{client.name}</h2>
                    <p className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-[0.3em] mb-6 flex items-center gap-2 justify-center">
                      <FaBuilding /> External Partner
                    </p>

                    <div className="w-full space-y-3 bg-[var(--os-bg)] p-4 rounded-2xl border border-[var(--os-border)] shadow-inner text-left">
                      <div className="flex items-center gap-3 text-xs text-[var(--os-text-muted)] font-bold">
                        <FaEnvelope className="text-[var(--os-accent)]" /> {client.email || "No Email"}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--os-text-muted)] font-bold">
                        <FaPhone className="text-emerald-400" /> {client.phone || "No Phone"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--os-surface)] p-8 rounded-[2.5rem] border border-[var(--os-border)] shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--os-text-muted)] mb-4 flex items-center gap-2">
                      <FaStickyNote /> Intelligence Notes
                    </h3>
                    <p className="text-xs text-[var(--os-text-main)]/80 leading-relaxed font-medium whitespace-pre-wrap">
                      {client.notes || "No intelligence logged for this partner."}
                    </p>
                  </div>
                </div>

                {/* RIGHT: Mandates */}
                <div className="lg:col-span-2 bg-[var(--os-surface)] p-8 rounded-[2.5rem] border border-[var(--os-border)] shadow-xl">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--os-text-muted)] flex items-center gap-2">
                      <FaProjectDiagram /> Active Mandates
                    </h3>
                    <span className="bg-[var(--os-bg)] text-[10px] font-black px-3 py-1 rounded-lg border border-[var(--os-border)] text-[var(--os-text-muted)]">
                      {projects.length} Total
                    </span>
                  </div>

                  {projects.length === 0 ? (
                    <div className="py-20 text-center bg-[var(--os-bg)]/50 rounded-3xl border border-dashed border-[var(--os-border)]">
                      <p className="text-xs font-bold text-[var(--os-text-muted)]">No mandates deployed for this partner.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.map(project => {
                        const isDone = project.progress === 100;
                        return (
                          <div 
                            key={project._id}
                            onClick={() => navigate(`/projects/${project._id}`)}
                            className="bg-[var(--os-bg)] p-5 rounded-2xl border border-[var(--os-border)] hover:border-[var(--os-accent)]/50 transition-all cursor-pointer group shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="flex-1">
                              <h4 className="text-sm font-black mb-1 group-hover:text-[var(--os-accent)] transition-colors">{project.title}</h4>
                              <p className="text-[10px] font-bold text-[var(--os-text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                                <FaClock size={10} /> Due: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Open"}
                              </p>
                            </div>
                            
                            <div className="w-full md:w-1/3 space-y-2">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                <span className="text-[var(--os-text-muted)]">Health</span>
                                <span className={isDone ? 'text-blue-400' : 'text-[var(--os-text-main)]'}>{project.progress}%</span>
                              </div>
                              <div className="w-full bg-[var(--os-surface)] h-1.5 rounded-full overflow-hidden border border-[var(--os-border)] shadow-inner">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${isDone ? 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.3)]' : 'bg-[var(--os-accent)] shadow-[0_0_12px_rgba(16,185,129,0.2)]'}`} 
                                  style={{ width: `${project.progress}%` }} 
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
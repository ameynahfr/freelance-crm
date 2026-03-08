import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { 
  FaUser, FaEnvelope, FaMapMarkerAlt, FaBriefcase, 
  FaCode, FaAlignLeft, FaArrowLeft, FaShieldAlt
} from "react-icons/fa";

// 🚀 API LAYER IMPORTS
import { getTeamMemberById } from "../api/teamApi";

export default function AgentProfile() {
  const { memberId } = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await getTeamMemberById(memberId);
        setAgent(res.data);
      } catch (err) {
        console.error("Failed to fetch agent profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [memberId]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--os-canvas)]">
      <div className="bg-[var(--os-bg)] px-6 py-3 rounded-full text-[var(--os-text-main)] text-sm animate-pulse border border-[var(--os-border)]">
        Accessing Agent Dossier...
      </div>
    </div>
  );

  if (!agent) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[var(--os-canvas)] text-[var(--os-text-main)]">
      <FaShieldAlt className="text-rose-500 text-4xl mb-4" />
      <h2 className="text-xl font-black">Access Denied or Agent Not Found</h2>
      <Link to="/team" className="mt-4 text-[var(--os-accent)] hover:underline text-sm font-bold">Return to Roster</Link>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[var(--os-canvas)] p-0 md:p-3 flex font-sans text-[var(--os-text-main)] overflow-hidden">
      <div className="flex flex-1 bg-[var(--os-bg)] rounded-none md:rounded-3xl shadow-2xl overflow-hidden relative border border-[var(--os-border)]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="flex justify-between items-center">
                <Link to="/team" className="flex items-center gap-2 text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] transition-colors text-xs font-bold uppercase tracking-widest">
                  <FaArrowLeft size={10} /> Back to Roster
                </Link>
                <h1 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--os-text-muted)]">Public Dossier</h1>
              </div>

              {/* --- SLEEK IDENTITY BAR --- */}
              <div className="bg-[var(--os-surface)]/40 rounded-2xl p-6 border border-[var(--os-border)] flex items-center gap-8 relative overflow-hidden shadow-xl">
                <div className="w-24 h-24 rounded-2xl border-2 border-[#35313F] bg-[var(--os-canvas)] flex-shrink-0 shadow-lg overflow-hidden">
                  <img src={agent.profilePic || "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_1.png"} alt="avatar" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black tracking-tight truncate">{agent.name}</h2>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex-shrink-0 border ${
                      agent.role === 'owner' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      agent.role === 'manager' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {agent.role}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4 text-[var(--os-text-muted)]">
                    <p className="text-xs font-bold flex items-center gap-1.5"><FaBriefcase size={10} className="opacity-50"/> {agent.title || "Agency Staff"}</p>
                    {agent.location && (
                      <p className="text-xs font-bold flex items-center gap-1.5"><FaMapMarkerAlt size={10} className="opacity-50"/> {agent.location}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <span className="bg-[var(--os-bg)] text-[var(--os-text-muted)] text-[9px] font-black px-3 py-1 rounded-md border border-[var(--os-border)] uppercase tracking-widest flex items-center gap-1.5">
                       <FaEnvelope size={10} /> {agent.email}
                    </span>
                    <span className="bg-[var(--os-bg)] text-[var(--os-text-muted)] text-[9px] font-black px-3 py-1 rounded-md border border-[var(--os-border)] uppercase tracking-widest">
                       ID: {agent._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* --- BIO & SKILLS GRID --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[var(--os-surface)]/20 rounded-2xl p-6 border border-[var(--os-border)]">
                  <h3 className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2"><FaAlignLeft /> Background</h3>
                  <p className="text-xs text-[var(--os-text-main)]/80 leading-relaxed font-medium">
                    {agent.bio || "No background information provided."}
                  </p>
                </div>
                
                <div className="bg-[var(--os-surface)]/20 rounded-2xl p-6 border border-[var(--os-border)]">
                  <h3 className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2"><FaCode /> Technical Proficiencies</h3>
                  {agent.skills && agent.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {agent.skills.map((skill, i) => (
                        <span key={i} className="bg-[var(--os-bg)] text-[var(--os-text-main)]/90 px-3 py-1.5 rounded-lg text-[9px] font-bold border border-[var(--os-border)] shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--os-text-muted)] italic">No skills registered.</p>
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
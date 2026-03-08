import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash, FaEnvelope, FaShieldAlt, FaUsersCog } from "react-icons/fa";

// 🚀 API LAYER IMPORTS (Make sure updateTeamMember is in your teamApi.js!)
import { getTeam, removeTeamMember, updateTeamMember } from "../api/teamApi";
import AddMemberModal from "../components/AddMemeberModal.jsx"; 

export default function Team() {
  const { token, user: currentUser } = useAuth();
  const [team, setTeam] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTeamData = useCallback(async () => {
    try {
      const res = await getTeam();
      setTeam(res.data);
    } catch (err) {
      console.error("Failed to sync team registry:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const canDelete = (targetMember) => {
    if (!currentUser) return false;
    if (targetMember.role === 'owner') return false; 
    if (currentUser.role === 'owner') return true; 
    if (currentUser.role === 'manager' && targetMember.role === 'member') return true;
    return false;
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Offboard this agent from the agency?")) return;
    try {
      await removeTeamMember(id);
      setTeam(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Offboarding failed");
    }
  };

  // 🚀 NEW: Handle Promoting/Demoting Agents
  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === 'manager' ? 'member' : 'manager';
    const actionText = newRole === 'manager' ? 'Upgrade to Manager status?' : 'Revoke Manager clearance?';
    
    if (!window.confirm(actionText)) return;

    try {
      await updateTeamMember(id, { role: newRole });
      fetchTeamData(); // Refresh the registry
    } catch (err) {
      alert(err.response?.data?.message || "Failed to alter clearance.");
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[var(--os-canvas)]">
      <div className="bg-[var(--os-bg)] px-6 py-3 rounded-full text-[var(--os-text-main)] text-sm font-medium animate-pulse">
        Syncing Registry...
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[var(--os-canvas)] p-0 md:p-3 lg:p-4 font-sans text-[var(--os-text-main)] overflow-hidden flex">
      <div className="flex flex-1 bg-[var(--os-bg)] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold">Agency Team</h1>
                <p className="text-[10px] text-[var(--os-text-muted)] uppercase font-bold tracking-widest mt-1">Staff Registry</p>
              </div>
              
              {(currentUser?.role === 'owner' || currentUser?.role === 'manager') && (
                <button 
                  onClick={() => setShowModal(true)} 
                  className="bg-white text-[#35313F] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[var(--os-canvas)] transition shadow-lg"
                >
                  <FaPlus /> Recruit Agent
                </button>
              )}
            </div>

            {team.length === 0 ? (
              <div className="py-24 text-center bg-[var(--os-surface)]/20 rounded-[2.5rem] border border-dashed border-white/10">
                <FaUsersCog className="mx-auto text-[var(--os-text-muted)]/20 text-5xl mb-4" />
                <h3 className="text-[var(--os-text-main)] font-bold">Registry Empty</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {team.map(member => (
                  <div 
                    key={member._id} 
                    onClick={() => navigate(`/team/${member._id}`)} 
                    className="bg-[var(--os-surface)] p-6 rounded-[2rem] border border-[var(--os-border)] flex flex-col items-center text-center group relative overflow-hidden transition-all hover:border-[var(--os-accent)]/50 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-2xl bg-[var(--os-bg)] border-2 border-white/10 overflow-hidden shadow-xl">
                        {member.profilePic ? (
                          <img src={member.profilePic} alt="agent" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xl bg-gradient-to-br from-[#35313F] to-[#464153]">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      {(member.role === 'manager' || member.role === 'owner') && (
                        <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-lg border-2 border-[#464153] ${member.role === 'owner' ? 'bg-indigo-500' : 'bg-amber-400'} text-[#35313F] shadow-lg`}>
                          <FaShieldAlt size={10} />
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-lg group-hover:text-[var(--os-accent)] transition-colors">{member.name}</h3>
                    <p className="text-[10px] font-black uppercase text-[#D2C9D8] tracking-widest mb-4">
                      {member.title || member.role}
                    </p>
                    
                    <div className="w-full h-px bg-white/5 mb-4 group-hover:bg-[var(--os-accent)]/20 transition-colors" />
                    
                    <p className="text-[11px] text-[var(--os-text-muted)] flex items-center gap-2 mb-6">
                      <FaEnvelope size={10} /> {member.email}
                    </p>

                    {/* 🚀 QUICK ACTIONS LAYER */}
                    <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {/* Shield Button for Owner to Promote/Demote */}
                      {currentUser?.role === 'owner' && member.role !== 'owner' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handleRoleChange(member._id, member.role);
                          }} 
                          className="text-[var(--os-text-muted)] hover:text-amber-400 p-2 bg-[var(--os-bg)]/80 backdrop-blur-md border border-[var(--os-border)] rounded-lg hover:bg-amber-400/10 transition-all shadow-sm"
                          title={member.role === 'manager' ? 'Revoke Manager Clearance' : 'Upgrade to Manager'}
                        >
                          <FaShieldAlt size={12} />
                        </button>
                      )}

                      {/* Delete Button */}
                      {canDelete(member) && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handleRemove(member._id);
                          }} 
                          className="text-rose-400/50 hover:text-rose-400 p-2 bg-[var(--os-bg)]/80 backdrop-blur-md border border-[var(--os-border)] rounded-lg hover:bg-rose-500/10 transition-all shadow-sm"
                          title="Purge Agent"
                        >
                          <FaTrash size={12} />
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {showModal && (
        <AddMemberModal 
          token={token} 
          onClose={() => setShowModal(false)} 
          onSuccess={fetchTeamData} 
        />
      )}
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { FaPlus, FaTrash, FaEnvelope, FaShieldAlt, FaUsersCog } from "react-icons/fa";

// 🚀 API LAYER IMPORTS
import { getTeam, removeTeamMember } from "../api/teamApi";
import AddMemberModal from "../components/AddMemeberModal.jsx"; // Ensuring we use the recruit modal

export default function Team() {
  const { token, user: currentUser } = useAuth();
  const [team, setTeam] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTeamData = useCallback(async () => {
    try {
      // 🚀 Clean API Call - Header added by interceptor
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

  // 🔒 Security Logic: Hierarchy enforcement
  const canDelete = (targetMember) => {
    if (!currentUser) return false;
    if (targetMember.role === 'owner') return false; // Owners are immortal
    if (currentUser.role === 'owner') return true; // Owners can remove anyone else
    if (currentUser.role === 'manager' && targetMember.role === 'member') return true;
    return false;
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Offboard this agent from the agency?")) return;
    try {
      // 🚀 API Layer removal
      await removeTeamMember(id);
      setTeam(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Offboarding failed");
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#D2C9D8]">
      <div className="bg-[#35313F] px-6 py-3 rounded-full text-white text-sm font-medium animate-pulse">
        Syncing Registry...
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#D2C9D8] p-0 md:p-3 lg:p-4 font-sans text-white overflow-hidden flex">
      <div className="flex flex-1 bg-[#35313F] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold">Agency Team</h1>
                <p className="text-[10px] text-[#A29EAB] uppercase font-bold tracking-widest mt-1">Staff Registry</p>
              </div>
              
              {(currentUser?.role === 'owner' || currentUser?.role === 'manager') && (
                <button 
                  onClick={() => setShowModal(true)} 
                  className="bg-white text-[#35313F] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#D2C9D8] transition shadow-lg"
                >
                  <FaPlus /> Recruit Agent
                </button>
              )}
            </div>

            {team.length === 0 ? (
              <div className="py-24 text-center bg-[#464153]/20 rounded-[2.5rem] border border-dashed border-white/10">
                <FaUsersCog className="mx-auto text-[#A29EAB]/20 text-5xl mb-4" />
                <h3 className="text-white font-bold">Registry Empty</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {team.map(member => (
                  <div key={member._id} className="bg-[#464153] p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center group relative overflow-hidden transition-all hover:border-[#D2C9D8]/30">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-2xl bg-[#35313F] border-2 border-white/10 overflow-hidden shadow-xl">
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

                    <h3 className="font-bold text-lg">{member.name}</h3>
                    <p className="text-[10px] font-black uppercase text-[#D2C9D8] tracking-widest mb-4">
                      {member.title || member.role}
                    </p>
                    
                    <div className="w-full h-px bg-white/5 mb-4" />
                    
                    <p className="text-[11px] text-[#A29EAB] flex items-center gap-2 mb-6">
                      <FaEnvelope size={10} /> {member.email}
                    </p>

                    {canDelete(member) && (
                      <button 
                        onClick={() => handleRemove(member._id)} 
                        className="text-rose-400/30 hover:text-rose-400 transition-all absolute top-4 right-4 p-2 bg-[#35313F]/50 rounded-lg"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
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
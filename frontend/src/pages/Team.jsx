import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { FaPlus, FaTrash, FaEnvelope, FaShieldAlt } from "react-icons/fa";

export default function Team() {
  const { token, user: currentUser } = useAuth(); // Get logged-in user details
  const [team, setTeam] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", title: "", role: "member"
  });

  const fetchTeam = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/team", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeam(res.data);
    } catch (err) {
      console.error("Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeam(); }, []);

  // 🔒 Security Logic: Determine if the current user can delete a specific member
  const canDelete = (targetMember) => {
    if (!currentUser) return false;
    
    // 1. Nobody can delete an Owner
    if (targetMember.role === 'owner') return false;

    // 2. Owners can delete anyone else (Managers/Members)
    if (currentUser.role === 'owner') return true;

    // 3. Managers can only delete Members
    if (currentUser.role === 'manager' && targetMember.role === 'member') return true;

    // 4. Members cannot delete anyone
    return false;
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/team", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({ name: "", email: "", password: "", title: "", role: "member" });
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    }
  };

  const removeMember = async (id) => {
    if(!window.confirm("Remove this person from your agency?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/team/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeam(team.filter(m => m._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className="h-screen w-full bg-[#D2C9D8] p-0 md:p-3 lg:p-4 font-sans text-white overflow-hidden flex">
      <div className="flex flex-1 bg-[#35313F] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Agency Team</h1>
              {/* Only Owners/Managers should see the Add button */}
              {(currentUser?.role === 'owner' || currentUser?.role === 'manager') && (
                <button onClick={() => setShowModal(true)} className="bg-white text-[#35313F] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition shadow-lg">
                  <FaPlus /> Add Member
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {team.map(member => (
                <div key={member._id} className="bg-[#464153] p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center group relative overflow-hidden">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-[#35313F] border-2 border-white/10 overflow-hidden shadow-xl">
                      {member.profilePic ? (
                        <img src={member.profilePic} alt="member" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xl">{member.name.charAt(0)}</div>
                      )}
                    </div>
                    {(member.role === 'manager' || member.role === 'owner') && (
                      <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-lg border-2 border-[#464153] ${member.role === 'owner' ? 'bg-indigo-500' : 'bg-amber-400'} text-[#35313F]`}>
                        <FaShieldAlt size={10} />
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-[10px] font-black uppercase text-[#A29EAB] tracking-widest mb-4">
                    {member.title || member.role}
                  </p>
                  
                  <div className="w-full h-px bg-white/5 mb-4" />
                  
                  <p className="text-[11px] text-[#A29EAB] flex items-center gap-2 mb-6">
                    <FaEnvelope size={10} /> {member.email}
                  </p>

                  {/* 🔒 Conditional Delete Button */}
                  {canDelete(member) && (
                    <button onClick={() => removeMember(member._id)} className="text-rose-400/50 hover:text-rose-400 transition absolute top-4 right-4">
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <form onSubmit={handleAddMember} className="relative bg-[#35313F] w-full max-w-md rounded-[2rem] p-8 border border-white/10 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold mb-4">Add Team Member</h2>
            <input required type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#464153] px-4 py-3 rounded-xl outline-none" />
            <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#464153] px-4 py-3 rounded-xl outline-none" />
            <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#464153] px-4 py-3 rounded-xl outline-none" />
            <select className="w-full bg-[#464153] px-4 py-3 rounded-xl outline-none appearance-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="member">Member</option>
                {currentUser?.role === 'owner' && <option value="manager">Manager</option>}
            </select>
            <button type="submit" className="w-full bg-white text-[#35313F] font-bold py-3.5 rounded-xl">Create Account</button>
          </form>
        </div>
      )}
    </div>
  );
}
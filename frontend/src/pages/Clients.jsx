import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import {
  FaPlus,
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaTrash,
  FaUserFriends,
  FaCalendarAlt
} from "react-icons/fa";
import ClientModal from "../components/ClientModal.jsx";

// 🚀 API LAYER IMPORTS
import { getClients, deleteClient as deleteClientApi } from "../api/clientApi";

export default function Clients() {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    try {
      // 🚀 Clean API Call - Headers handled by interceptor
      const res = await getClients();
      setClients(res.data);
    } catch (err) {
      console.error("Directory sync error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete client? This will fail if they have active mandates.")) return;
    try {
      // 🚀 Centralized Delete API
      await deleteClientApi(id);
      setClients(clients.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Internal removal failed");
    }
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#D2C9D8]">
        <div className="bg-[#35313F] px-6 py-3 rounded-full text-white text-sm font-medium animate-pulse">
          Indexing Directory...
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
            
            <div className="sticky top-0 z-30 bg-[#35313F]/95 backdrop-blur-sm border-b border-[#5B5569]/30">
              <div className="max-w-[1600px] mx-auto w-full px-5 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Clients</h1>
                  <p className="text-[10px] text-[#A29EAB] uppercase font-bold tracking-widest mt-0.5">Global Directory</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64 bg-[#464153] rounded-full focus-within:ring-1 focus-within:ring-[#D2C9D8] transition-all">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A29EAB]" size={10} />
                    <input
                      type="text"
                      placeholder="Filter directory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent border-none rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#A29EAB] outline-none"
                    />
                  </div>
                  
                  <button
                    onClick={() => { setEditingClient(null); setShowModal(true); }}
                    className="bg-white text-[#35313F] px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-gray-100 transition shadow-sm"
                  >
                    <FaPlus /> <span className="hidden sm:inline">Add Client</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-[1600px] mx-auto w-full px-5 md:px-8 py-6">
              {filtered.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-[#464153]/30 rounded-[2rem] border-2 border-dashed border-white/5">
                  <FaUserFriends className="text-[#A29EAB]/20 text-4xl mb-4" />
                  <h3 className="text-white font-bold mb-1">No matches found</h3>
                  <p className="text-[#A29EAB] text-[10px] uppercase font-bold tracking-widest">Expansion Required</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((client) => (
                    <div
                      key={client._id}
                      className="bg-[#464153] p-6 rounded-[1.8rem] border border-white/5 hover:border-[#D2C9D8]/30 transition-all group flex flex-col justify-between shadow-md relative overflow-hidden"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-5 relative z-10">
                          <div className="w-12 h-12 bg-[#35313F] rounded-2xl flex items-center justify-center text-xl font-bold text-[#D2C9D8] border border-white/5">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#35313F] p-1 rounded-lg border border-white/5 shadow-sm">
                            <button
                              onClick={() => { setEditingClient(client); setShowModal(true); }}
                              className="p-2 text-[#A29EAB] hover:text-white transition-colors"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(client._id)}
                              className="p-2 text-[#A29EAB] hover:text-rose-400 transition-colors"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-4 tracking-tight">
                          {client.name}
                        </h3>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-xs text-[#A29EAB] font-medium">
                            <div className="w-6 flex justify-center"><FaEnvelope size={10} /></div>
                            <span className="truncate">{client.email || "Offline Account"}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#A29EAB] font-medium">
                            <div className="w-6 flex justify-center"><FaPhone size={10} /></div>
                            <span>{client.phone || "No Direct Line"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="flex items-center gap-2 text-[9px] uppercase font-bold text-[#A29EAB] tracking-[0.2em]">
                          <FaCalendarAlt size={10} /> Verified: {new Date(client.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      
      {showModal && (
        <ClientModal
          token={token}
          editData={editingClient}
          onClose={() => { setShowModal(false); setEditingClient(null); }}
          onUpdated={fetchClients}
        />
      )}
    </div>
  );
}
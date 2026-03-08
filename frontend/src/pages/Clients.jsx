import { useState, useEffect, useCallback, useMemo } from "react";
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
  FaCalendarAlt,
  FaBuilding,
  FaNetworkWired,
  FaShieldAlt
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
    if (!window.confirm("Purge this external partner? This action will fail if they are tied to active mandates.")) return;
    try {
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

  // 🚀 CRM METRICS CALCULATION
  const metrics = useMemo(() => {
    const total = clients.length;
    const verifiedComms = clients.filter(c => c.email && c.phone).length;
    
    // Calculate clients added in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newClients = clients.filter(c => new Date(c.createdAt) > thirtyDaysAgo).length;

    return { total, verifiedComms, newClients };
  }, [clients]);

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--os-canvas)]">
        <div className="bg-[var(--os-bg)] px-8 py-4 rounded-2xl text-[var(--os-text-main)] text-xs font-black uppercase tracking-widest animate-pulse border border-[var(--os-border)] shadow-2xl">
          Indexing Directory...
        </div>
      </div>
    );

  return (
    <div className="h-screen w-full bg-[var(--os-canvas)] p-0 md:p-3 lg:p-4 font-sans text-[var(--os-text-main)] overflow-hidden flex">
      <div className="flex flex-1 bg-[var(--os-bg)] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative border border-[var(--os-border)]">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto custom-scrollbar relative">
            
            <div className="max-w-[1600px] mx-auto w-full px-5 md:px-8 py-8 space-y-8">
              
              {/* --- HEADER & ACTIONS --- */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-[var(--os-text-main)]">External Partners</h1>
                  <p className="text-[10px] text-[var(--os-text-muted)] uppercase font-bold tracking-widest mt-1">Client CRM Directory</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64 bg-[var(--os-surface)] rounded-xl border border-[var(--os-border)] focus-within:border-[var(--os-accent)] transition-all shadow-inner">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)] opacity-50" size={10} />
                    <input
                      type="text"
                      placeholder="Search directory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-[var(--os-text-main)] placeholder:text-[var(--os-text-muted)]/40 outline-none"
                    />
                  </div>
                  
                  <button
                    onClick={() => { setEditingClient(null); setShowModal(true); }}
                    className="bg-[var(--os-btn-primary)] text-[var(--os-btn-primary-text)] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--os-btn-primary)]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <FaPlus /> <span className="hidden sm:inline">Add Partner</span>
                  </button>
                </div>
              </div>

              {/* --- CRM TELEMETRY METRICS --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--os-surface)] p-5 rounded-2xl border border-[var(--os-border)] shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-[var(--os-bg)] rounded-xl border border-[var(--os-border)] text-[var(--os-text-muted)]"><FaBuilding /></div>
                  <div>
                    <p className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-0.5">Total Partners</p>
                    <p className="text-xl font-black">{metrics.total}</p>
                  </div>
                </div>
                <div className="bg-[var(--os-surface)] p-5 rounded-2xl border border-[var(--os-border)] shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-[var(--os-bg)] rounded-xl border border-[var(--os-border)] text-emerald-400"><FaNetworkWired /></div>
                  <div>
                    <p className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-0.5">Verified Comms</p>
                    <p className="text-xl font-black">{metrics.verifiedComms}</p>
                  </div>
                </div>
                <div className="bg-[var(--os-surface)] p-5 rounded-2xl border border-[var(--os-border)] shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-[var(--os-bg)] rounded-xl border border-[var(--os-border)] text-[var(--os-accent)]"><FaShieldAlt /></div>
                  <div>
                    <p className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-0.5">New (30 Days)</p>
                    <p className="text-xl font-black">+{metrics.newClients}</p>
                  </div>
                </div>
              </div>

              {/* --- CLIENT GRID --- */}
              {filtered.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center bg-[var(--os-surface)]/30 rounded-[2.5rem] border border-dashed border-[var(--os-border)]">
                  <FaUserFriends className="text-[var(--os-text-muted)] opacity-20 text-5xl mb-4" />
                  <h3 className="text-[var(--os-text-main)] text-sm font-black mb-1">No matches found</h3>
                  <p className="text-[var(--os-text-muted)] text-[10px] uppercase font-bold tracking-widest">Expansion Required</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.map((client) => {
                    
                    const isSecure = client.email && client.phone;

                    return (
                      <div
                        key={client._id}
                        className="bg-[var(--os-surface)] p-6 rounded-[2rem] border border-[var(--os-border)] hover:border-[var(--os-accent)]/30 hover:-translate-y-1 transition-all group flex flex-col justify-between shadow-sm hover:shadow-xl relative overflow-hidden"
                      >
                        {/* Glow Effect */}
                        <div className="absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-[var(--os-accent)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div>
                          <div className="flex justify-between items-start mb-5 relative z-10">
                            <div className="w-12 h-12 bg-[var(--os-bg)] rounded-2xl flex items-center justify-center text-xl font-black text-[var(--os-text-main)] border border-[var(--os-border)] shadow-inner">
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex gap-2">
                              {/* Status Badge */}
                              <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                isSecure ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                {isSecure ? 'Active Node' : 'Partial Data'}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-lg font-black text-[var(--os-text-main)] mb-5 tracking-tight group-hover:text-[var(--os-accent)] transition-colors">
                            {client.name}
                          </h3>

                          <div className="space-y-3 mb-8 bg-[var(--os-bg)] p-4 rounded-2xl border border-[var(--os-border)] shadow-inner">
                            <div className="flex items-center gap-3 text-xs text-[var(--os-text-muted)] font-bold">
                              <div className="w-5 flex justify-center text-[var(--os-text-main)]/50"><FaEnvelope size={10} /></div>
                              <span className="truncate">{client.email || "Offline Account"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[var(--os-text-muted)] font-bold">
                              <div className="w-5 flex justify-center text-[var(--os-text-main)]/50"><FaPhone size={10} /></div>
                              <span>{client.phone || "No Direct Line"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[var(--os-border)] flex justify-between items-center mt-auto">
                          <span className="flex items-center gap-1.5 text-[9px] uppercase font-black text-[var(--os-text-muted)] tracking-widest">
                            <FaCalendarAlt size={10} /> {new Date(client.createdAt).toLocaleDateString()}
                          </span>
                          
                          {/* Hover Actions */}
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => { setEditingClient(client); setShowModal(true); }}
                              className="p-2 bg-[var(--os-bg)] text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] border border-[var(--os-border)] rounded-lg transition-colors shadow-sm"
                              title="Update Parameters"
                            >
                              <FaEdit size={10} />
                            </button>
                            <button
                              onClick={() => handleDelete(client._id)}
                              className="p-2 bg-[var(--os-bg)] text-[var(--os-text-muted)] hover:text-rose-400 border border-[var(--os-border)] rounded-lg transition-colors shadow-sm"
                              title="Purge Client"
                            >
                              <FaTrash size={10} />
                            </button>
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
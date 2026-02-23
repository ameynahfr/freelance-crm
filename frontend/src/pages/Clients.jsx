import { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
} from "react-icons/fa";
import ClientModal from "../components/ClientModal.jsx";

export default function Clients() {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data);
    } catch (err) {
      console.error(
        "Fetch clients failed:",
        err.response?.data?.message || err.message,
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const deleteClient = async (id) => {
    if (
      !window.confirm(
        "Delete client? This will fail if they have active projects.",
      )
    )
      return;
    try {
      await axios.delete(`http://localhost:5000/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(clients.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#D2C9D8]">
        <div className="bg-[#35313F] px-6 py-3 rounded-full text-white animate-pulse">
          Loading Directory...
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
            {/* Sticky Action Bar */}
            <div className="sticky top-0 z-30 bg-[#35313F]/95 backdrop-blur-sm border-b border-[#5B5569]/30">
              <div className="max-w-[1600px] mx-auto w-full px-5 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  Clients
                </h1>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <FaSearch
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A29EAB]"
                      size={12}
                    />
                    <input
                      type="text"
                      placeholder="Search directory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#464153] border-none rounded-xl pl-10 py-2 text-xs text-white focus:ring-2 focus:ring-white/20 outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEditingClient(null);
                      setShowModal(true);
                    }}
                    className="bg-white text-[#35313F] px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <FaPlus /> <span>Add Client</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Client Cards Grid */}
            <div className="max-w-[1600px] mx-auto w-full px-5 md:px-8 py-6">
              {filtered.length === 0 ? (
                <div className="py-20 text-center bg-[#464153]/20 rounded-[2rem] border border-dashed border-white/10">
                  <FaUserFriends className="mx-auto text-[#A29EAB]/20 text-5xl mb-4" />
                  <p className="text-[#A29EAB] text-sm">No clients found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((client) => (
                    <div
                      key={client._id}
                      className="bg-[#464153] p-6 rounded-[1.8rem] border border-transparent hover:border-white/10 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-[#35313F] rounded-2xl flex items-center justify-center text-xl font-bold text-[#D2C9D8] shadow-inner">
                            {client.name.charAt(0)}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingClient(client);
                                setShowModal(true);
                              }}
                              className="p-2 text-[#A29EAB] hover:text-white"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => deleteClient(client._id)}
                              className="p-2 text-[#A29EAB] hover:text-rose-400"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-4 tracking-tight">
                          {client.name}
                        </h3>
                        <div className="space-y-2.5 mb-6">
                          <div className="flex items-center gap-3 text-xs text-[#A29EAB] font-medium">
                            <FaEnvelope size={11} />{" "}
                            {client.email || "No email added"}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#A29EAB] font-medium">
                            <FaPhone size={11} />{" "}
                            {client.phone || "No phone added"}
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-[#A29EAB] tracking-widest">
                          Joined{" "}
                          {new Date(client.createdAt).toLocaleDateString()}
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
          onClose={() => setShowModal(false)}
          onUpdated={fetchClients}
        />
      )}
    </div>
  );
}

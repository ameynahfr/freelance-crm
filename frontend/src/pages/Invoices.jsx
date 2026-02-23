import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import {
  FaPlus,
  FaSearch,
  FaFilePdf,
  FaCheck,
  FaReceipt
} from "react-icons/fa";
import InvoiceModal from "../components/InvoiceModal.jsx";

export default function Invoices() {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/invoices/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setInvoices(invoices.map((inv) => (inv._id === id ? res.data.invoice : inv)));
    } catch (err) {
      alert("Status update failed");
    }
  };

  const downloadPDF = async (id, invoiceNumber) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/invoices/${id}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Failed to download PDF");
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.project?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()); // Added Client Search
    const matchesStatus = filter === "all" ? true : inv.status === filter;
    return matchesSearch && matchesStatus;
  });

  // Updated Status Colors (Lavender for Paid)
  const getStatusBadge = (status) => {
    switch (status) {
      case "paid": 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#D2C9D8]/10 text-[#D2C9D8] border border-[#D2C9D8]/20"><FaCheck size={8} /> Paid</span>;
      case "unpaid": 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">Unpaid</span>;
      case "partial": 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
      default: return null;
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#D2C9D8]">
      <div className="bg-[#35313F] px-6 py-3 rounded-full text-white text-sm font-medium animate-pulse">Loading Invoices...</div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#D2C9D8] p-0 md:p-3 lg:p-4 font-sans text-white overflow-hidden flex">
      <div className="flex flex-1 bg-[#35313F] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto custom-scrollbar relative">
            
            {/* Header Area */}
            <div className="sticky top-0 z-30 bg-[#35313F]/95 backdrop-blur-sm border-b border-[#5B5569]/30">
              <div className="max-w-[1400px] mx-auto w-full px-5 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Invoices</h1>
                  <p className="text-[#A29EAB] text-[10px] md:text-xs font-medium mt-0.5">{filtered.length} records found</p>
                </div>

                <div className="w-full md:w-1/3 flex justify-start md:justify-center">
                  <div className="flex bg-[#464153] p-1 rounded-xl">
                    {["all", "unpaid", "paid"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter === t ? "bg-white text-[#35313F] shadow-sm" : "text-[#A29EAB] hover:text-white"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-1/3 flex justify-end gap-3">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A29EAB]" size={10} />
                    <input 
                      type="text" 
                      placeholder="Search invoices..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="bg-[#464153] text-white text-xs pl-8 pr-3 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#D2C9D8] w-32 md:w-48 transition-all"
                    />
                  </div>
                  <button onClick={() => setIsModalOpen(true)} className="bg-white text-[#35313F] px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-gray-100 transition shadow-sm">
                    <FaPlus /> <span className="hidden sm:inline">New</span>
                  </button>
                </div>
              </div>
            </div>

            {/* DATA TABLE LAYOUT */}
            <div className="max-w-[1400px] mx-auto w-full px-5 md:px-8 py-6">
              {filtered.length > 0 ? (
                <div className="bg-[#464153] rounded-[1.5rem] border border-white/5 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#35313F]/50 border-b border-white/5">
                          <th className="px-6 py-4 text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider">Invoice ID</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider">Client / Project</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider">Date Due</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filtered.map((inv) => (
                          <tr key={inv._id} className="hover:bg-[#35313F]/30 transition-colors group">
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-white font-mono">{inv.invoiceNumber}</span>
                              <div className="text-[10px] text-[#A29EAB]">{inv.title}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-bold text-white">{inv.project?.client?.name || "Unknown Client"}</div>
                              <div className="text-[10px] text-[#A29EAB]">{inv.project?.title}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-medium text-white">{new Date(inv.dueDate).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-bold text-white">${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(inv.status)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {inv.status !== "paid" && (
                                  <button 
                                    onClick={() => updateStatus(inv._id, "paid")} 
                                    className="p-2 bg-[#35313F] text-[#D2C9D8] rounded-lg hover:bg-[#D2C9D8]/20 transition"
                                    title="Mark as Paid"
                                  >
                                    <FaCheck size={12} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => downloadPDF(inv._id, inv.invoiceNumber)} 
                                  className="p-2 bg-[#35313F] text-[#A29EAB] rounded-lg hover:text-white hover:bg-white/10 transition"
                                  title="Download PDF"
                                >
                                  <FaFilePdf size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center bg-[#464153]/20 rounded-[2.5rem] border border-dashed border-white/10">
                  <FaReceipt className="mx-auto text-[#A29EAB] text-3xl mb-4 opacity-20" />
                  <h3 className="text-white font-bold">No invoices found</h3>
                  <p className="text-[#A29EAB] text-xs mt-1">Create a new invoice to get started.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {isModalOpen && (
        <InvoiceModal
          token={token}
          onClose={() => setIsModalOpen(false)}
          onCreated={fetchInvoices}
        />
      )}
    </div>
  );
}
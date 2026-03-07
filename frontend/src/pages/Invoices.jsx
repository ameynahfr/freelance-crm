import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import {
  FaPlus,
  FaSearch,
  FaFilePdf,
  FaCheck,
  FaReceipt,
  FaEnvelope,
  FaSpinner
} from "react-icons/fa";
import InvoiceModal from "../components/InvoiceModal.jsx";

// 🚀 API LAYER IMPORTS
import { 
  getInvoices, 
  updateInvoiceStatus, 
  downloadInvoicePDF, 
  sendInvoiceEmail as sendEmailApi 
} from "../api/invoiceApi";

export default function Invoices() {
  const { token } = useAuth(); // Still passed to modal if needed, but not used for API calls here
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      // 🚀 Clean API Call - Header added automatically by interceptor
      const res = await getInvoices();
      setInvoices(res.data);
    } catch (err) {
      console.error("Invoicing Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const updateStatus = async (id, newStatus) => {
    try {
      // 🚀 Using centralized API
      const res = await updateInvoiceStatus(id, newStatus);
      setInvoices(invoices.map((inv) => (inv._id === id ? res.data.invoice : inv)));
    } catch (err) {
      alert("Status update failed");
    }
  };

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      // 🚀 API call already configured with responseType: "blob"
      const res = await downloadInvoicePDF(id);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to download PDF");
    }
  };

  const handleSendEmail = async (id) => {
    setSendingEmailId(id);
    try {
      // 🚀 Centralized Email API
      await sendEmailApi(id);
      alert("Invoice sent successfully to the client!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send email. Check client email details.");
    } finally {
      setSendingEmailId(null);
    }
  };

  const filtered = invoices.filter((inv) => {
    const searchLower = searchTerm.toLowerCase();
    const clientName = inv.client?.name || inv.project?.client?.name || "";

    const matchesSearch =
      (inv.title && inv.title.toLowerCase().includes(searchLower)) ||
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(searchLower)) ||
      clientName.toLowerCase().includes(searchLower);

    const matchesStatus = filter === "all" ? true : inv.status === filter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid": 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--os-canvas)]/10 text-[#D2C9D8] border border-[#D2C9D8]/20"><FaCheck size={8} /> Paid</span>;
      case "unpaid": 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">Unpaid</span>;
      case "partial": 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
      default: return null;
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--os-canvas)]">
      <div className="bg-[var(--os-bg)] px-6 py-3 rounded-full text-[var(--os-text-main)] text-sm font-medium animate-pulse">Loading Invoices...</div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[var(--os-canvas)] p-0 md:p-3 lg:p-4 font-sans text-[var(--os-text-main)] overflow-hidden flex">
      <div className="flex flex-1 bg-[var(--os-bg)] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="sticky top-0 z-30 bg-[var(--os-bg)]/95 backdrop-blur-sm border-b border-[#5B5569]/30">
              <div className="max-w-[1400px] mx-auto w-full px-5 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                  <h1 className="text-xl md:text-2xl font-bold text-[var(--os-text-main)] tracking-tight">Invoices</h1>
                  <p className="text-[var(--os-text-muted)] text-[10px] md:text-xs font-medium mt-0.5">{filtered.length} records found</p>
                </div>

                <div className="w-full md:w-1/3 flex justify-start md:justify-center">
                  <div className="flex bg-[var(--os-surface)] p-1 rounded-xl">
                    {["all", "unpaid", "paid"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter === t ? "bg-white text-[#35313F] shadow-sm" : "text-[var(--os-text-muted)] hover:text-[var(--os-text-main)]"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-1/3 flex justify-end gap-3">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={10} />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="bg-[var(--os-surface)] text-[var(--os-text-main)] text-xs pl-8 pr-3 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#D2C9D8] w-32 md:w-48 transition-all"
                    />
                  </div>
                  <button onClick={() => setIsModalOpen(true)} className="bg-white text-[#35313F] px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-gray-100 transition shadow-sm">
                    <FaPlus /> <span className="hidden sm:inline">New</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-[1400px] mx-auto w-full px-5 md:px-8 py-6">
              {filtered.length > 0 ? (
                <div className="bg-[var(--os-surface)] rounded-[1.5rem] border border-[var(--os-border)] overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[var(--os-bg)]/50 border-b border-[var(--os-border)]">
                          <th className="px-6 py-4 text-[10px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider">Invoice ID</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider">Client / Project</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider">Date Due</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filtered.map((inv) => {
                          const clientName = inv.client?.name || inv.project?.client?.name;
                          const displayName = clientName ? clientName : "Internal Project";

                          return (
                            <tr key={inv._id} className="hover:bg-[var(--os-bg)]/30 transition-colors group">
                              <td className="px-6 py-4">
                                <span className="text-xs font-bold text-[var(--os-text-main)] font-mono">{inv.invoiceNumber}</span>
                                <div className="text-[10px] text-[var(--os-text-muted)]">{inv.title}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className={`text-xs font-bold ${clientName ? 'text-[var(--os-text-main)]' : 'text-[#847F8D] italic'}`}>
                                  {displayName}
                                </div>
                                <div className="text-[10px] text-[var(--os-text-muted)]">{inv.project?.title || "No Project Linked"}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-xs font-medium text-[var(--os-text-main)]">{new Date(inv.dueDate).toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-xs font-bold text-[var(--os-text-main)]">${(inv.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                              </td>
                              <td className="px-6 py-4">
                                {getStatusBadge(inv.status)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {inv.status !== "paid" && (
                                    <button 
                                      onClick={() => updateStatus(inv._id, "paid")} 
                                      className="p-2 bg-[var(--os-bg)] text-[#D2C9D8] rounded-lg hover:bg-[var(--os-canvas)]/20 transition"
                                      title="Mark as Paid"
                                    >
                                      <FaCheck size={12} />
                                    </button>
                                  )}
                                  
                                  <button 
                                    onClick={() => handleSendEmail(inv._id)} 
                                    disabled={sendingEmailId === inv._id}
                                    className="p-2 bg-[var(--os-bg)] text-blue-400 rounded-lg hover:bg-blue-500/10 transition disabled:opacity-50"
                                    title="Send Email"
                                  >
                                    {sendingEmailId === inv._id ? <FaSpinner className="animate-spin" size={12} /> : <FaEnvelope size={12} />}
                                  </button>

                                  <button 
                                    onClick={() => handleDownloadPDF(inv._id, inv.invoiceNumber)} 
                                    className="p-2 bg-[var(--os-bg)] text-[var(--os-text-muted)] rounded-lg hover:text-[var(--os-text-main)] hover:bg-white/10 transition"
                                    title="Download PDF"
                                  >
                                    <FaFilePdf size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center bg-[var(--os-surface)]/20 rounded-[2.5rem] border border-dashed border-white/10">
                  <FaReceipt className="mx-auto text-[var(--os-text-muted)] text-3xl mb-4 opacity-20" />
                  <h3 className="text-[var(--os-text-main)] font-bold">No invoices found</h3>
                  <p className="text-[var(--os-text-muted)] text-xs mt-1">Create a new invoice to get started.</p>
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
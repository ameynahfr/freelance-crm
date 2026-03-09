import { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import toast from "react-hot-toast"; // 🚀 TOAST IMPORT
import {
  FaPlus,
  FaSearch,
  FaFilePdf,
  FaCheck,
  FaReceipt,
  FaEnvelope,
  FaSpinner,
  FaWallet,
  FaChartLine,
  FaExclamationTriangle,
  FaProjectDiagram
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
  const { token } = useAuth(); 
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await getInvoices();
      setInvoices(res.data);
    } catch (err) {
      toast.error("Ledger synchronization failed.");
      console.error("Invoicing Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // 🚀 TACTICAL REFACTOR: Promise Toast for status updates
  const updateStatus = async (id, newStatus) => {
    toast.promise(
      updateInvoiceStatus(id, newStatus),
      {
        loading: `Updating ledger to ${newStatus}...`,
        success: (res) => {
          setInvoices(invoices.map((inv) => (inv._id === id ? res.data.invoice : inv)));
          return `Ledger marked as ${newStatus}`;
        },
        error: "Status synchronization failed.",
      }
    );
  };

  // 🚀 TACTICAL REFACTOR: Toast for PDF generation
  const handleDownloadPDF = async (id, invoiceNumber) => {
    const downloadPromise = async () => {
      const res = await downloadInvoicePDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    toast.promise(downloadPromise(), {
      loading: 'Generating encrypted PDF...',
      success: 'PDF extracted successfully.',
      error: 'PDF generation failed.',
    });
  };

  // 🚀 TACTICAL REFACTOR: Promise Toast for Email dispatch
  const handleSendEmail = async (id) => {
    setSendingEmailId(id);
    toast.promise(
      sendEmailApi(id),
      {
        loading: 'Transmitting invoice to client...',
        success: () => {
          setSendingEmailId(null);
          return 'Dispatch confirmed. Client notified.';
        },
        error: (err) => {
          setSendingEmailId(null);
          return err.response?.data?.message || 'Transmission failed. Verify client details.';
        },
      },
      {
        style: { minWidth: '250px' }
      }
    );
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

  const metrics = useMemo(() => {
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0);
    const outstanding = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.amount || 0), 0);
    const overdueCount = invoices.filter(i => {
      if (i.status === 'paid' || !i.dueDate) return false;
      const due = new Date(i.dueDate);
      due.setHours(23, 59, 59, 999);
      return due < new Date();
    }).length;

    return { totalRevenue, outstanding, overdueCount };
  }, [invoices]);

  const getStatusBadge = (status, dueDate) => {
    let isOverdue = false;
    if (status !== 'paid' && dueDate) {
      const due = new Date(dueDate);
      due.setHours(23, 59, 59, 999);
      isOverdue = due < new Date();
    }

    if (isOverdue) {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.2)]">Overdue</span>;
    }

    switch (status) {
      case "paid": 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><FaCheck size={8} /> Cleared</span>;
      case "unpaid": 
      case "partial":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
      default: return null;
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--os-canvas)]">
      <div className="bg-[var(--os-bg)] px-8 py-4 rounded-2xl text-[var(--os-text-main)] text-xs font-black uppercase tracking-widest animate-pulse border border-[var(--os-border)] shadow-2xl">
        Syncing Financial Ledgers...
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
            <div className="max-w-[1500px] mx-auto w-full px-5 md:px-8 py-8 space-y-8">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h1 className="text-2xl font-black text-[var(--os-text-main)] tracking-tight">Financial Ledger</h1>
                  <p className="text-[10px] text-[var(--os-text-muted)] uppercase font-bold tracking-widest mt-1">Agency Billing & Revenue</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64 bg-[var(--os-surface)] rounded-xl border border-[var(--os-border)] focus-within:border-[var(--os-accent)] transition-all shadow-inner">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)] opacity-50" size={10} />
                    <input 
                      type="text" 
                      placeholder="Search ledgers..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="w-full bg-transparent border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-[var(--os-text-main)] placeholder:text-[var(--os-text-muted)]/40 outline-none"
                    />
                  </div>
                  <button onClick={() => setIsModalOpen(true)} className="bg-[var(--os-btn-primary)] text-[var(--os-btn-primary-text)] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--os-btn-primary)]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <FaPlus /> <span className="hidden sm:inline">Issue Invoice</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--os-surface)] p-5 rounded-2xl border border-[var(--os-border)] shadow-sm flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="p-3 bg-[var(--os-bg)] rounded-xl border border-[var(--os-border)] text-emerald-400 z-10"><FaChartLine /></div>
                  <div className="z-10">
                    <p className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-0.5">Total Cleared Revenue</p>
                    <p className="text-xl font-black text-[var(--os-text-main)] tracking-tight">${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="bg-[var(--os-surface)] p-5 rounded-2xl border border-[var(--os-border)] shadow-sm flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="p-3 bg-[var(--os-bg)] rounded-xl border border-[var(--os-border)] text-amber-400 z-10"><FaWallet /></div>
                  <div className="z-10">
                    <p className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-0.5">Outstanding Capital</p>
                    <p className="text-xl font-black text-[var(--os-text-main)] tracking-tight">${metrics.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors ${metrics.overdueCount > 0 ? 'bg-rose-500/5 border-rose-500/20' : 'bg-[var(--os-surface)] border-[var(--os-border)]'}`}>
                  <div className={`p-3 rounded-xl border z-10 ${metrics.overdueCount > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse' : 'bg-[var(--os-bg)] border-[var(--os-border)] text-[var(--os-text-muted)]'}`}>
                    <FaExclamationTriangle />
                  </div>
                  <div className="z-10">
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${metrics.overdueCount > 0 ? 'text-rose-400' : 'text-[var(--os-text-muted)]'}`}>Overdue Mandates</p>
                    <p className="text-xl font-black text-[var(--os-text-main)] tracking-tight">{metrics.overdueCount}</p>
                  </div>
                </div>
              </div>

              <div className="flex bg-[var(--os-surface)] p-1 rounded-xl w-fit border border-[var(--os-border)] shadow-inner">
                {["all", "unpaid", "paid"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      filter === t 
                      ? "bg-[var(--os-bg)] text-[var(--os-text-main)] shadow-sm border border-[var(--os-border)]" 
                      : "text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] border border-transparent"
                    }`}
                  >
                    {t === 'all' ? 'All Ledgers' : t === 'unpaid' ? 'Pending' : 'Cleared'}
                  </button>
                ))}
              </div>

              {filtered.length > 0 ? (
                <div className="bg-[var(--os-surface)] rounded-[1.5rem] border border-[var(--os-border)] overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-[var(--os-bg)]/50 border-b border-[var(--os-border)]">
                          <th className="px-6 py-4 text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">Identifier</th>
                          <th className="px-6 py-4 text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">Client & Target Mandate</th>
                          <th className="px-6 py-4 text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">Deadline</th>
                          <th className="px-6 py-4 text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">Capital</th>
                          <th className="px-6 py-4 text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest text-right">Directives</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--os-border)]">
                        {filtered.map((inv) => {
                          const clientName = inv.client?.name || inv.project?.client?.name;
                          const displayName = clientName ? clientName : "Internal Operations";

                          return (
                            <tr key={inv._id} className="hover:bg-[var(--os-bg)] transition-colors group">
                              <td className="px-6 py-5">
                                <span className="text-xs font-black text-[var(--os-text-main)] font-mono tracking-tight">{inv.invoiceNumber}</span>
                                <div className="text-[9px] font-bold text-[var(--os-text-muted)] uppercase tracking-widest mt-1">{inv.title}</div>
                              </td>
                              <td className="px-6 py-5">
                                <div className={`text-xs font-black mb-1 ${clientName ? 'text-[var(--os-text-main)]' : 'text-[var(--os-text-muted)] italic'}`}>
                                  {displayName}
                                </div>
                                <div className="text-[10px] font-bold text-[var(--os-text-muted)] flex items-center gap-1.5">
                                  <FaProjectDiagram size={8} className="opacity-50" /> {inv.project?.title || "Unlinked"}
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="text-xs font-bold text-[var(--os-text-main)]">{new Date(inv.dueDate).toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="text-xs font-black text-[var(--os-text-main)] tracking-tight">
                                  <span className="text-[var(--os-accent)] mr-0.5">$</span>
                                  {(inv.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                {getStatusBadge(inv.status, inv.dueDate)}
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {inv.status !== "paid" && (
                                    <button 
                                      onClick={() => updateStatus(inv._id, "paid")} 
                                      className="p-2 bg-[var(--os-surface)] border border-[var(--os-border)] text-[var(--os-text-muted)] rounded-lg hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400 transition-all shadow-sm"
                                      title="Verify Capital Received"
                                    >
                                      <FaCheck size={10} />
                                    </button>
                                  )}
                                  
                                  <button 
                                    onClick={() => handleSendEmail(inv._id)} 
                                    disabled={sendingEmailId === inv._id}
                                    className="p-2 bg-[var(--os-surface)] border border-[var(--os-border)] text-[var(--os-text-muted)] rounded-lg hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-400 transition-all shadow-sm disabled:opacity-50"
                                    title="Dispatch Comms"
                                  >
                                    {sendingEmailId === inv._id ? <FaSpinner className="animate-spin" size={10} /> : <FaEnvelope size={10} />}
                                  </button>

                                  <button 
                                    onClick={() => handleDownloadPDF(inv._id, inv.invoiceNumber)} 
                                    className="p-2 bg-[var(--os-surface)] border border-[var(--os-border)] text-[var(--os-text-muted)] rounded-lg hover:bg-[var(--os-bg)] hover:text-[var(--os-text-main)] transition-all shadow-sm"
                                    title="Extract PDF"
                                  >
                                    <FaFilePdf size={10} />
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
                <div className="py-24 flex flex-col items-center justify-center text-center bg-[var(--os-surface)]/30 rounded-[2.5rem] border border-dashed border-[var(--os-border)]">
                  <FaReceipt className="mx-auto text-[var(--os-text-muted)] text-5xl mb-4 opacity-20" />
                  <h3 className="text-[var(--os-text-main)] text-sm font-black mb-1">No ledgers found</h3>
                  <p className="text-[var(--os-text-muted)] text-[10px] uppercase font-bold tracking-widest">Generate invoice to begin tracking capital.</p>
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
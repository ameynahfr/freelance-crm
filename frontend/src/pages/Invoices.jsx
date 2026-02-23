import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import {
  FaPlus,
  FaSearch,
  FaFilePdf,
  FaDollarSign,
  FaFileInvoiceDollar,
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
      setInvoices(
        invoices.map((inv) => (inv._id === id ? res.data.invoice : inv)),
      );
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
          responseType: "blob", // Crucial for downloading files
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
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filter === "all" ? true : inv.status === filter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "unpaid":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "partial":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-[#35313F] text-[#A29EAB]";
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#D2C9D8]">
        <div className="bg-[#35313F] px-6 py-3 rounded-full text-white text-sm font-medium animate-pulse">
          Loading Invoices...
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
              <div className="max-w-[1400px] mx-auto w-full px-5 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    Invoices
                  </h1>
                  <p className="text-[#A29EAB] text-[10px] md:text-xs font-medium mt-0.5">
                    {filtered.length} Invoices found
                  </p>
                </div>

                <div className="w-full md:w-1/3 flex justify-start md:justify-center">
                  <div className="flex bg-[#464153] p-1 rounded-xl">
                    {["all", "unpaid", "partial", "paid"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all ${filter === t ? "bg-white text-[#35313F] shadow-sm" : "text-[#A29EAB] hover:text-white"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-1/3 flex justify-start md:justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white text-[#35313F] px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-gray-100 transition shadow-sm w-full md:w-auto"
                  >
                    <FaPlus /> <span>New Invoice</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-[1400px] mx-auto w-full px-5 md:px-8 py-6">
              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((inv) => (
                    <div
                      key={inv._id}
                      className="bg-[#464153] p-6 rounded-[1.8rem] border border-transparent hover:border-white/10 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-bold text-[#A29EAB] tracking-widest">
                            {inv.invoiceNumber}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${getStatusColor(inv.status)}`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1 truncate">
                          {inv.title}
                        </h3>
                        <p className="text-xs text-[#A29EAB] mb-6 truncate">
                          {inv.project?.title || "Unknown Project"}
                        </p>

                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-full bg-[#35313F] flex items-center justify-center text-emerald-400">
                            <FaDollarSign size={16} />
                          </div>
                          <div>
                            <div className="text-[10px] text-[#A29EAB] uppercase font-bold tracking-wider mb-0.5">
                              Amount Due
                            </div>
                            <div className="text-xl font-bold text-white">
                              ${inv.amount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#5B5569]/50 flex justify-between items-center">
                        <div className="text-[10px] font-bold text-[#A29EAB]">
                          Due:{" "}
                          <span className="text-white">
                            {new Date(inv.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {inv.status !== "paid" && (
                            <button
                              onClick={() => updateStatus(inv._id, "paid")}
                              className="text-[10px] bg-[#35313F] text-emerald-400 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-500/20 transition"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() =>
                              downloadPDF(inv._id, inv.invoiceNumber)
                            }
                            className="text-[10px] bg-white text-[#35313F] px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition flex items-center gap-1.5"
                          >
                            <FaFilePdf size={12} /> PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-[#464153]/30 rounded-[2rem] border border-dashed border-white/10">
                  <FaFileInvoiceDollar className="mx-auto text-[#A29EAB] text-3xl mb-4 opacity-20" />
                  <div className="text-[#A29EAB] text-sm font-medium">
                    No invoices found
                  </div>
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

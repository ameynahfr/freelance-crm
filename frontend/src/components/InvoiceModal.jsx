import { useState, useEffect } from "react";
import {
  FaTimes,
  FaProjectDiagram,
  FaCalendarAlt,
  FaFileInvoice,
  FaSave,
  FaPlus,
  FaTrash
} from "react-icons/fa";

// 🚀 API LAYER IMPORTS
import { getProjects } from "../api/projectApi";
import { createInvoice } from "../api/invoiceApi";

export default function InvoiceModal({ onClose, onCreated }) {
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  
  // UI State for dynamic line items
  const [items, setItems] = useState([
    { id: 1, description: "", price: "" }
  ]);

  const [projects, setProjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 🧮 Auto-calculate Total
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        // 🔍 Only mandates linked to external clients can be invoiced
        const billableProjects = res.data.filter((p) => p.client !== null);
        setProjects(billableProjects);
      } catch (err) {
        console.error("Failed to load billable mandates");
      }
    };
    fetchProjects();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), description: "", price: "" }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!projectId) return setMessage({ type: "error", text: "Target mandate required." });
    if (totalAmount <= 0) return setMessage({ type: "error", text: "Invoice value must exceed zero." });

    setIsSubmitting(true);

    // 🔄 Data Transformation: Flattening items into a readable string for the PDF
    const formattedDescription = items
      .filter(i => i.description.trim() !== "")
      .map(i => `• ${i.description}: $${Number(i.price).toFixed(2)}`)
      .join('\n');

    try {
      // 🚀 Clean API Call
      await createInvoice(projectId, { 
        title: title.trim() || `Invoice for Mandate`, 
        amount: totalAmount, 
        dueDate, 
        description: formattedDescription 
      });

      onCreated();
      onClose();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Generation failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared Input Styles
  const inputStyles = "w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--os-text-main)] outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all shadow-inner placeholder:text-[var(--os-text-muted)]/40";
  const iconInputStyles = "w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-[var(--os-text-main)] outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all shadow-inner placeholder:text-[var(--os-text-muted)]/40";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[var(--os-bg)] rounded-[2rem] shadow-2xl overflow-hidden border border-[var(--os-border)] animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-[var(--os-border)] bg-[var(--os-surface)]/30 flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-[var(--os-text-main)] tracking-tight">Generate Invoice</h2>
            <p className="text-[10px] text-[var(--os-text-muted)] uppercase font-bold tracking-widest mt-1">Financial Mandate</p>
          </div>
          <button onClick={onClose} className="text-[var(--os-text-muted)] hover:text-rose-400 transition-colors p-2.5 bg-[var(--os-surface)] rounded-xl border border-[var(--os-border)] hover:bg-rose-500/10 shadow-sm">
            <FaTimes size={14} />
          </button>
        </div>

        {/* --- FORM BODY --- */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6">
            
            {message.text && (
              <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-widest text-center border ${message.type === 'error' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Mandate Link</label>
                <div className="relative">
                  <select required value={projectId} onChange={(e) => setProjectId(e.target.value)} className={`${inputStyles} cursor-pointer appearance-none`}>
                    <option value="">-- Select Active Mandate --</option>
                    {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--os-text-muted)]">
                    <FaProjectDiagram size={10} />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Invoice Label</label>
                <div className="relative">
                  <FaFileInvoice className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                  <input type="text" required placeholder="e.g. Monthly Retainer" value={title} onChange={(e) => setTitle(e.target.value)} className={iconInputStyles} />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Payment Deadline</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={iconInputStyles} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Service Breakdown</label>
              <div className="bg-[var(--os-surface)]/50 rounded-2xl p-4 border border-[var(--os-border)] space-y-3 shadow-inner">
                {items.map((item, index) => (
                  <div key={item.id} className="flex gap-3 items-center animate-in fade-in slide-in-from-left-4 duration-300">
                    <span className="text-xs font-black text-[var(--os-text-muted)] w-4">{index + 1}.</span>
                    <input 
                      type="text" 
                      placeholder="Description" 
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      required
                      className="flex-1 bg-[var(--os-bg)] border border-[var(--os-border)] rounded-lg px-4 py-2.5 text-sm font-bold text-[var(--os-text-main)] focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] outline-none shadow-inner placeholder:text-[var(--os-text-muted)]/40 transition-all" 
                    />
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={item.price}
                      onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      className="w-24 bg-[var(--os-bg)] border border-[var(--os-border)] rounded-lg px-3 py-2.5 text-sm font-bold text-[var(--os-text-main)] text-right focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] outline-none shadow-inner placeholder:text-[var(--os-text-muted)]/40 transition-all" 
                    />
                    <button 
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length === 1}
                      className="text-[var(--os-text-muted)] hover:text-rose-400 p-2 disabled:opacity-20 transition-colors bg-[var(--os-bg)] border border-[var(--os-border)] rounded-lg hover:bg-rose-500/10 shadow-sm"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                ))}

                <button 
                  type="button"
                  onClick={handleAddItem}
                  className="mt-4 text-[9px] font-black uppercase tracking-widest text-[var(--os-text-muted)] hover:text-[var(--os-accent)] flex items-center gap-1.5 transition-colors ml-7"
                >
                  <FaPlus size={10} /> Add Line Item
                </button>
              </div>
            </div>

            <div className="flex justify-end items-end gap-4 pt-4 pr-2">
              <span className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-1.5">Total Value</span>
              <span className="text-3xl font-black text-[var(--os-text-main)] tracking-tighter">
                <span className="text-[var(--os-accent)] mr-1">$</span>
                {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

          </div>

          <div className="p-6 md:p-8 border-t border-[var(--os-border)] bg-[var(--os-surface)]/30 flex-shrink-0 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--os-text-muted)] bg-[var(--os-surface)] border border-[var(--os-border)] hover:bg-[var(--os-bg)] hover:text-[var(--os-text-main)] transition-colors shadow-sm">
              Abort
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--os-btn-primary-text)] bg-[var(--os-btn-primary)] shadow-lg shadow-[var(--os-btn-primary)]/20 hover:scale-[1.02] hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
              {isSubmitting ? "Generating..." : <><FaSave size={12} /> Issue Invoice</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
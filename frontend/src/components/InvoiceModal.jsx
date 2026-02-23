import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTimes,
  FaProjectDiagram,
  FaCalendarAlt,
  FaFileInvoice,
  FaSave,
  FaPlus,
  FaTrash
} from "react-icons/fa";

export default function InvoiceModal({ token, onClose, onCreated }) {
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  
  // Frontend-only state for better UX
  const [items, setItems] = useState([
    { id: 1, description: "", price: "" }
  ]);

  const [projects, setProjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Auto-calculate Total Amount based on rows
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter: Only projects with clients can be invoiced
        const billableProjects = res.data.filter((p) => p.client !== null);
        setProjects(billableProjects);
      } catch (err) {
        console.error("Failed to load projects");
      }
    };
    fetchProjects();
  }, [token]);

  // --- Line Item Handlers ---
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

    if (!projectId) return setMessage({ type: "error", text: "Please select a project." });
    if (totalAmount <= 0) return setMessage({ type: "error", text: "Invoice amount cannot be zero." });

    setIsSubmitting(true);

    // --- DATA TRANSFORMATION ---
    // Convert array of objects into a single string for your backend
    const formattedDescription = items
      .filter(i => i.description.trim() !== "") // Remove empty rows
      .map(i => `• ${i.description}: $${Number(i.price).toFixed(2)}`)
      .join('\n');

    try {
      await axios.post(
        `http://localhost:5000/api/invoices/project/${projectId}`,
        { 
          title, 
          amount: totalAmount, // Send the calculated total
          dueDate, 
          description: formattedDescription // Send the formatted string
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onCreated();
      onClose();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Creation failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#35313F]/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#35313F] rounded-[2rem] shadow-2xl overflow-hidden border border-white/5 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 bg-[#464153]/30 flex-shrink-0">
          <h2 className="text-lg font-bold text-white tracking-tight">Create Invoice</h2>
          <button onClick={onClose} className="text-[#A29EAB] hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
            <FaTimes size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6">
            
            {message.text && (
              <div className={`p-3 rounded-xl text-xs font-bold ${message.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {message.text}
              </div>
            )}

            {/* Top Row: Project & Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">Project</label>
                <div className="relative">
                  <select required value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none cursor-pointer appearance-none">
                    <option value="">-- Select Project --</option>
                    {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#A29EAB]">
                    <FaProjectDiagram size={10} />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">Title</label>
                <div className="relative">
                  <FaFileInvoice className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A29EAB]" size={12} />
                  <input type="text" required placeholder="e.g. Oct Retainer" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#464153] border-none rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none" />
                </div>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">Due Date</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A29EAB]" size={12} />
                <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-[#464153] border-none rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] [color-scheme:dark] outline-none" />
              </div>
            </div>

            {/* --- LINE ITEMS GENERATOR --- */}
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">Invoice Items</label>
              <div className="bg-[#464153]/50 rounded-2xl p-4 border border-white/5 space-y-3">
                
                {items.map((item, index) => (
                  <div key={item.id} className="flex gap-3 items-center animate-in fade-in slide-in-from-left-4 duration-300">
                    <span className="text-xs font-bold text-[#A29EAB] w-4">{index + 1}.</span>
                    <input 
                      type="text" 
                      placeholder="Description (e.g. Logo Design)" 
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      required
                      className="flex-1 bg-[#35313F] border-none rounded-lg px-3 py-2 text-sm text-white placeholder-[#A29EAB]/50 focus:ring-1 focus:ring-[#D2C9D8] outline-none" 
                    />
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={item.price}
                      onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      className="w-24 bg-[#35313F] border-none rounded-lg px-3 py-2 text-sm text-white text-right placeholder-[#A29EAB]/50 focus:ring-1 focus:ring-[#D2C9D8] outline-none" 
                    />
                    <button 
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length === 1}
                      className="text-[#A29EAB] hover:text-rose-400 p-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}

                <button 
                  type="button"
                  onClick={handleAddItem}
                  className="mt-2 text-xs font-bold text-[#D2C9D8] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <FaPlus size={10} /> Add Item
                </button>
              </div>
            </div>

            {/* Total Display */}
            <div className="flex justify-end items-center gap-4 pt-2">
              <span className="text-xs font-bold text-[#A29EAB] uppercase tracking-wider">Total Amount</span>
              <span className="text-2xl font-bold text-white">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-[#35313F] flex-shrink-0 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#A29EAB] bg-[#464153] hover:bg-[#464153]/80 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#35313F] bg-white shadow-lg hover:bg-gray-100 flex items-center justify-center gap-2 transition-all">
              {isSubmitting ? "Generating..." : <><FaSave /> Save Invoice</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useState } from "react";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaStickyNote,
  FaSave
} from "react-icons/fa";

// 🚀 API LAYER IMPORTS
import { createClient, updateClient } from "../api/clientApi";

export default function ClientModal({ onClose, onUpdated, editData }) {
  const [name, setName] = useState(editData?.name || "");
  const [email, setEmail] = useState(editData?.email || "");
  const [phone, setPhone] = useState(editData?.phone || "");
  const [notes, setNotes] = useState(editData?.notes || "");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    const clientPayload = { name, email, phone, notes };

    try {
      if (editData) {
        // 🚀 Clean API Update Call
        await updateClient(editData._id, clientPayload);
      } else {
        // 🚀 Clean API Create Call
        await createClient(clientPayload);
      }
      
      onUpdated();
      onClose();
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Operation failed" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared Input Styles for consistent Light/Dark mode transitions
  const inputStyles = "w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--os-text-main)] outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all shadow-inner placeholder:text-[var(--os-text-muted)]/40";
  const iconInputStyles = "w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-[var(--os-text-main)] outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all shadow-inner placeholder:text-[var(--os-text-muted)]/40";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-[var(--os-bg)] rounded-[2rem] shadow-2xl overflow-hidden border border-[var(--os-border)] animate-in fade-in zoom-in-95 duration-200">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-[var(--os-border)] bg-[var(--os-surface)]/30">
          <div>
            <h2 className="text-xl font-black text-[var(--os-text-main)] tracking-tight">
              {editData ? "Update Account" : "Register Partner"}
            </h2>
            <p className="text-[10px] text-[var(--os-text-muted)] uppercase font-bold tracking-widest mt-1">Client Dossier</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--os-text-muted)] hover:text-rose-400 transition-colors p-2.5 bg-[var(--os-surface)] rounded-xl border border-[var(--os-border)] hover:bg-rose-500/10 shadow-sm"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* --- FORM BODY --- */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {message.text && (
            <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-widest text-center border ${
              message.type === 'error' 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">
              Legal / Trading Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className={iconInputStyles}
                placeholder="Company Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Work Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={iconInputStyles}
                  placeholder="contact@agency.com"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Direct Line</label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                <input
                  type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className={iconInputStyles}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
              <FaStickyNote size={10} /> Internal Briefing
            </label>
            <textarea
              rows="3" value={notes} onChange={(e) => setNotes(e.target.value)}
              className={`${inputStyles} resize-none`}
              placeholder="Background context and strategic notes on this account..."
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--os-text-muted)] bg-[var(--os-surface)] border border-[var(--os-border)] hover:bg-[var(--os-bg)] hover:text-[var(--os-text-main)] transition-colors shadow-sm"
            >
              Abort
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--os-btn-primary-text)] bg-[var(--os-btn-primary)] shadow-lg shadow-[var(--os-btn-primary)]/20 hover:scale-[1.02] hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSubmitting ? "Syncing..." : <><FaSave size={12} /> {editData ? "Update Parameters" : "Register Partner"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--os-bg)]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-[var(--os-bg)] rounded-[2rem] shadow-2xl overflow-hidden border border-[var(--os-border)] animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--os-border)] bg-[var(--os-surface)]/30">
          <h2 className="text-lg font-bold text-[var(--os-text-main)] tracking-tight">
            {editData ? "Update Account" : "New Client"}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          
          {message.text && (
            <div className={`p-3 rounded-xl text-xs font-bold ${
              message.type === 'error' 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1">
              Legal / Trading Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--os-surface)] border-none rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--os-text-main)] focus:ring-1 focus:ring-[#D2C9D8] outline-none"
                placeholder="Company Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1">Work Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--os-surface)] border-none rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--os-text-main)] focus:ring-1 focus:ring-[#D2C9D8] outline-none"
                  placeholder="contact@email.com"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1">Direct Line</label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                <input
                  type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[var(--os-surface)] border-none rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--os-text-main)] focus:ring-1 focus:ring-[#D2C9D8] outline-none"
                  placeholder="+1..."
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
              <FaStickyNote size={10} /> Internal Briefing
            </label>
            <textarea
              rows="3" value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[var(--os-surface)] border-none rounded-xl px-4 py-3 text-sm text-[var(--os-text-main)] focus:ring-1 focus:ring-[#D2C9D8] outline-none resize-none"
              placeholder="Background on this account..."
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[var(--os-text-muted)] bg-[var(--os-surface)] hover:bg-[var(--os-surface)]/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#35313F] bg-white shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Syncing..." : <><FaSave /> {editData ? "Update Client" : "Add Client"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
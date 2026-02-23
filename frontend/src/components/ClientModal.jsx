import { useState } from "react";
import axios from "axios";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaStickyNote,
} from "react-icons/fa";

export default function ClientModal({ token, onClose, onUpdated, editData }) {
  const [name, setName] = useState(editData?.name || "");
  const [email, setEmail] = useState(editData?.email || "");
  const [phone, setPhone] = useState(editData?.phone || "");
  const [notes, setNotes] = useState(editData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const url = editData
      ? `http://localhost:5000/api/clients/${editData._id}`
      : "http://localhost:5000/api/clients";

    try {
      await axios({
        method: editData ? "put" : "post",
        url,
        data: { name, email, phone, notes },
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#35313F]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-[#35313F] rounded-[2rem] shadow-2xl overflow-hidden border border-white/5">
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 bg-[#464153]/30">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {editData ? "Edit Client" : "New Client"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#A29EAB] hover:text-white transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          <div>
            <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">
              Full Name
            </label>
            <div className="relative">
              <FaUser
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A29EAB]"
                size={12}
              />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#464153] border-none rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">
                Email
              </label>
              <div className="relative">
                <FaEnvelope
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A29EAB]"
                  size={12}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#464153] border-none rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">
                Phone
              </label>
              <div className="relative">
                <FaPhone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A29EAB]"
                  size={12}
                />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#464153] border-none rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1 flex items-center gap-2">
              <FaStickyNote size={10} /> Internal Notes
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#464153] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#A29EAB] bg-[#464153]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-[#35313F] bg-white shadow-lg"
            >
              {isSubmitting
                ? "Saving..."
                : editData
                  ? "Update Client"
                  : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

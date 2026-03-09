import { useState } from "react";
import { FaTimes, FaLink, FaStickyNote, FaCheckCircle, FaPaperPlane } from "react-icons/fa";
import toast from "react-hot-toast";

// 🚀 We use your existing update API to save the deliverables
import { updateTask } from "../api/taskApi";

export default function TaskDossierModal({ task, onClose, onUpdated, currentUser }) {
  // State for the deliverables
  const [deliverableLink, setDeliverableLink] = useState(task?.deliverableLink || "");
  const [deliverableNotes, setDeliverableNotes] = useState(task?.deliverableNotes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAssignee = task?.assignedTo?._id === currentUser?._id;
  const isManager = currentUser?.role === "owner" || currentUser?.role === "manager";
  
  // They can only edit the deliverable if they are the assignee or a manager, AND it's not already done
  const canSubmitWork = (isAssignee || isManager) && task?.status !== "done";

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Save the link and notes, and automatically move the status to 'done'
      await updateTask(task._id, { 
        deliverableLink, 
        deliverableNotes,
        status: "done" 
      });

      toast.success("Mission Accomplished. Transmitted to Manager.");
      
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Transmission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared Input Styles
  const inputStyles = "w-full bg-[var(--os-bg)] border border-[var(--os-border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--os-text-main)] outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all shadow-inner placeholder:text-[var(--os-text-muted)]/40";
  const iconInputStyles = "w-full bg-[var(--os-bg)] border border-[var(--os-border)] rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-[var(--os-text-main)] outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all shadow-inner placeholder:text-[var(--os-text-muted)]/40";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[var(--os-bg)] rounded-[2rem] shadow-2xl overflow-hidden border border-[var(--os-border)] flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-start px-8 py-6 border-b border-[var(--os-border)] bg-[var(--os-surface)]/50">
          <div className="pr-4">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                'bg-[var(--os-bg)] text-[var(--os-text-muted)] border-[var(--os-border)]'
              }`}>
                {task.status}
              </span>
              <span className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">
                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "TBD"}
              </span>
            </div>
            <h2 className="text-2xl font-black text-[var(--os-text-main)] tracking-tight leading-tight">
              {task.title}
            </h2>
          </div>
          <button onClick={onClose} className="text-[var(--os-text-muted)] hover:text-rose-400 transition-colors p-2.5 bg-[var(--os-bg)] rounded-xl border border-[var(--os-border)] hover:bg-rose-500/10 shadow-sm flex-shrink-0">
            <FaTimes size={14} />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 flex flex-col">
          
          {/* --- MISSION BRIEFING (Read Only) --- */}
          <div className="p-8 border-b border-[var(--os-border)] bg-[var(--os-bg)]">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--os-text-muted)] mb-3">Mission Briefing</h3>
            <div className="bg-[var(--os-surface)]/50 p-5 rounded-2xl border border-[var(--os-border)] shadow-inner">
              <p className="text-sm font-medium text-[var(--os-text-main)]/90 leading-relaxed whitespace-pre-wrap">
                {task.description || "No specific parameters provided for this task."}
              </p>
            </div>
          </div>

          {/* --- EXECUTION & DELIVERABLES (Input/View) --- */}
          <div className="p-8 bg-[var(--os-surface)]/30 flex-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--os-text-muted)] mb-4 flex items-center gap-2">
               Execution & Deliverables
            </h3>

            {task.status === 'done' && !canSubmitWork ? (
              // View State: When task is done and user is just looking at it
              <div className="space-y-4">
                {task.deliverableLink ? (
                  <a href={task.deliverableLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-[var(--os-bg)] border border-[var(--os-accent)]/50 rounded-xl hover:bg-[var(--os-accent)]/10 transition-colors group">
                    <div className="p-2 bg-[var(--os-accent)] text-white rounded-lg group-hover:scale-110 transition-transform"><FaLink size={12} /></div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[var(--os-text-main)] truncate">View Deliverable Asset</p>
                      <p className="text-[10px] text-[var(--os-text-muted)] truncate">{task.deliverableLink}</p>
                    </div>
                  </a>
                ) : (
                  <div className="p-4 bg-[var(--os-bg)] border border-[var(--os-border)] rounded-xl text-xs font-bold text-[var(--os-text-muted)] italic">No link provided.</div>
                )}

                {task.deliverableNotes && (
                  <div className="p-4 bg-[var(--os-bg)] border border-[var(--os-border)] rounded-xl">
                    <p className="text-xs font-medium text-[var(--os-text-main)] whitespace-pre-wrap">{task.deliverableNotes}</p>
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <FaCheckCircle /> Mission Accomplished
                </div>
              </div>
            ) : (
              // Edit State: When agent needs to submit work
              <form id="deliverableForm" onSubmit={handleSubmitWork} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Asset URL (Figma, GitHub, Drive)</label>
                  <div className="relative">
                    <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" size={12} />
                    <input 
                      type="url" 
                      placeholder="https://..." 
                      value={deliverableLink} 
                      onChange={(e) => setDeliverableLink(e.target.value)} 
                      className={iconInputStyles} 
                      disabled={!canSubmitWork}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-2 ml-1 block">Agent Notes / Handoff Message</label>
                  <div className="relative">
                    <FaStickyNote className="absolute left-4 top-4 text-[var(--os-text-muted)]" size={12} />
                    <textarea 
                      rows="3" 
                      placeholder="Any context the reviewer needs to know..." 
                      value={deliverableNotes} 
                      onChange={(e) => setDeliverableNotes(e.target.value)} 
                      className={`${iconInputStyles} resize-none`}
                      disabled={!canSubmitWork}
                    />
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="p-6 md:p-8 border-t border-[var(--os-border)] bg-[var(--os-surface)] flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--os-text-muted)] bg-[var(--os-bg)] border border-[var(--os-border)] hover:text-[var(--os-text-main)] transition-colors shadow-sm">
            Close Dossier
          </button>
          
          {canSubmitWork && (
            <button 
              type="submit" 
              form="deliverableForm" 
              disabled={isSubmitting} 
              className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-emerald-950 bg-emerald-400 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSubmitting ? "Transmitting..." : <><FaPaperPlane size={12} /> Submit & Finalize</>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
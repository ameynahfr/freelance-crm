import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaClock, FaEdit, FaTrash, FaLock, FaExclamationTriangle } from "react-icons/fa";

export default function SortableTaskCard({ task, currentUser, onEdit, onDelete, isOverlay = false, onTaskClick }) {
  const role = (currentUser?.role || "").toLowerCase();
  const myId = (currentUser?._id || currentUser?.id || "").toString();
  
  const rawAssignee = task.assignedTo?.$oid || task.assignedTo?._id || task.assignedTo?.id || task.assignedTo;
  const taskAssigneeId = (rawAssignee || "").toString();

  const isBoss = role === "owner" || role === "manager";
  const isMine = myId !== "" && myId === taskAssigneeId;
  const canDrag = isBoss || isMine;

  const isOverdue = task.dueDate && 
                    new Date(task.dueDate).setHours(23, 59, 59, 999) < new Date() && 
                    task.status !== 'done';

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task._id.toString(),
    disabled: isOverlay || !canDrag 
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : (canDrag ? 1 : 0.5),
    cursor: !canDrag ? 'not-allowed' : (isOverlay ? 'grabbing' : 'grab'),
    zIndex: isOverlay ? 999 : 1,
    touchAction: 'none' 
  };

  return (
    <div 
      ref={setNodeRef} style={style} 
      {...(canDrag ? attributes : {})} 
      {...(canDrag ? listeners : {})}
      onClick={() => onTaskClick && onTaskClick(task)}
      className={`bg-[var(--os-surface)] p-5 rounded-2xl border group transition-all duration-300 cursor-pointer
        ${!canDrag ? 'border-transparent opacity-50' : 
          isOverdue 
            ? 'border-rose-500/40 bg-rose-500/5 shadow-lg shadow-rose-500/5' 
            : 'border-[var(--os-border)] hover:border-[var(--os-accent)]/40 shadow-sm'}
        ${isOverlay ? 'rotate-2 scale-105 z-[1000] !shadow-2xl border-[var(--os-accent)]' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h4 className={`text-[13px] font-black leading-tight group-hover:text-[var(--os-accent)] transition-colors truncate pr-2 ${
            isOverdue ? 'text-rose-400' : 'text-[var(--os-text-main)]'
          }`}>
            {task.title}
          </h4>
          <p className="text-[9px] font-bold text-[var(--os-text-muted)] uppercase tracking-wider mt-1 flex items-center gap-1">
             {isOverdue && <FaExclamationTriangle size={8} className="text-rose-400" />}
             {!canDrag && <FaLock size={8} className="opacity-40" />}
             {task.project?.title || "Operational Task"}
          </p>
        </div>
      </div>
      
      <div className={`flex items-center justify-between mt-6 pt-3 border-t ${isOverdue ? 'border-rose-500/20' : 'border-[var(--os-border)]/50'}`}>
        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${
            task.status === 'done' ? 'text-emerald-500' : 
            isOverdue ? 'text-rose-400' : 'text-[var(--os-text-muted)]'
        }`}>
          <FaClock size={10} />
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
        </div>
        
        {isBoss && !isOverlay && (
          <div className="flex gap-1">
            <button 
              // 🚀 FIX: Added e.stopPropagation() and onClick handlers
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={(e) => { 
                e.stopPropagation(); 
                onEdit(task); 
              }} 
              className="p-1.5 hover:bg-[var(--os-bg)] rounded-lg text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] transition-all"
              title="Edit Task"
            >
              <FaEdit size={11} />
            </button>
            <button 
              // 🚀 FIX: Added e.stopPropagation() and onClick handlers
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={(e) => { 
                e.stopPropagation(); 
                onDelete(task._id); 
              }} 
              className="p-1.5 hover:bg-rose-500/10 rounded-lg text-[var(--os-text-muted)] hover:text-rose-400 transition-all"
              title="Purge Task"
            >
              <FaTrash size={11} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
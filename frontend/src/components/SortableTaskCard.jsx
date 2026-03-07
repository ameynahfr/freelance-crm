import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaClock, FaEdit, FaTrash, FaLock } from "react-icons/fa";

export default function SortableTaskCard({ task, currentUser, onEdit, onDelete, isOverlay = false }) {
  const role = (currentUser?.role || "").toLowerCase();
  const myId = (currentUser?._id || currentUser?.id || "").toString();
  
  const rawAssignee = task.assignedTo?.$oid || task.assignedTo?._id || task.assignedTo?.id || task.assignedTo;
  const taskAssigneeId = (rawAssignee || "").toString();

  const isBoss = role === "owner" || role === "manager";
  const isMine = myId !== "" && myId === taskAssigneeId;
  const canDrag = isBoss || isMine;

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
      className={`bg-[var(--os-surface)] p-4 rounded-2xl border transition-all 
        ${!canDrag ? 'border-transparent opacity-50' : 'border-white/10 shadow-lg hover:border-[#D2C9D8]/30'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-bold text-[var(--os-text-main)] flex items-center gap-2">
          {task.title}
          {!canDrag && <FaLock className="text-[var(--os-text-main)]/20" size={10} />}
        </h4>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--os-text-muted)]">
          <FaClock size={10} />
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
        </div>
        
        {isBoss && !isOverlay && (
          <div className="flex gap-2">
            <button onPointerDown={(e) => { e.stopPropagation(); onEdit(task); }} className="text-[var(--os-text-muted)] hover:text-[var(--os-text-main)] p-1">
              <FaEdit size={12} />
            </button>
            <button onPointerDown={(e) => { e.stopPropagation(); onDelete(task._id); }} className="text-[var(--os-text-muted)] hover:text-rose-400 p-1">
              <FaTrash size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
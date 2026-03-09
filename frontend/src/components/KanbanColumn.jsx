import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableTaskCard from "./SortableTaskCard";
import { FaCircle } from "react-icons/fa";

export default function KanbanColumn({ id, title, tasks, currentUser, onEdit, onDelete, onTaskClick }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // 🎨 Status-specific indicator colors for the tactical dots
  const getStatusDotColor = () => {
    if (id === "todo") return "text-amber-500";
    if (id === "in-progress") return "text-blue-500 animate-pulse";
    if (id === "done") return "text-emerald-500";
    return "text-[var(--os-text-muted)]";
  };

  return (
    <div 
      ref={setNodeRef} 
      className={`flex-1 min-w-[300px] bg-[var(--os-surface)]/30 rounded-[2rem] border transition-all flex flex-col overflow-hidden shadow-sm
        ${isOver ? 'border-[var(--os-accent)] bg-[var(--os-surface)]/50 ring-2 ring-[var(--os-accent)]/10 scale-[1.01]' : 'border-[var(--os-border)]'}`}
    >
      {/* --- COLUMN HEADER --- */}
      <div className="p-6 flex justify-between items-center bg-[var(--os-surface)]/50 border-b border-[var(--os-border)]">
        
        <div className="flex items-center gap-2.5">
          {/* Tactical Status Dot */}
          <FaCircle className={`text-[8px] ${getStatusDotColor()}`} />
          
          {/* 🚀 FIX: Changed hardcoded #35313F to var(--os-text-main) so it turns white in dark mode */}
          <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[var(--os-text-main)]">
            {title}
          </h3>
        </div>
        
        {/* 🚀 FIX: Counter badge now uses theme-aware colors */}
        <span className="bg-[var(--os-text-main)] text-[var(--os-bg)] text-[9px] font-black px-2.5 py-1 rounded-lg shadow-inner">
          {tasks.length}
        </span>
      </div>
      
      {/* --- TASK LIST CONTAINER --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-[250px]">
        <SortableContext 
          items={tasks.map(t => t._id.toString())} 
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard 
              key={task._id.toString()} 
              task={task} 
              currentUser={currentUser} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onTaskClick={onTaskClick}
            />
          ))}
        </SortableContext>

        {/* Empty State Shadow */}
        {tasks.length === 0 && (
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-[var(--os-border)] rounded-2xl opacity-20">
             {/* 🚀 FIX: Text adapts to theme */}
             <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--os-text-main)]">Vacuum</p>
          </div>
        )}
      </div>
    </div>
  );
}
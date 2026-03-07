import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableTaskCard from "./SortableTaskCard";

export default function KanbanColumn({ id, title, tasks, currentUser, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className={`flex-1 min-w-[300px] bg-[var(--os-surface)]/30 rounded-[2rem] border transition-all flex flex-col overflow-hidden 
        ${isOver ? 'border-[#D2C9D8] bg-[var(--os-surface)]/50 ring-2 ring-[#D2C9D8]/10' : 'border-[var(--os-border)]'}`}
    >
      <div className="p-5 flex justify-between items-center bg-[var(--os-surface)]/50 border-b border-[var(--os-border)]">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#D2C9D8]">{title}</h3>
        <span className="bg-[var(--os-bg)] text-[10px] font-bold px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[200px]">
        <SortableContext items={tasks.map(t => t._id.toString())} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard 
              key={task._id.toString()} 
              task={task} 
              currentUser={currentUser} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
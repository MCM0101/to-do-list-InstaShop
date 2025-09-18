import { useState } from 'react';
import { Todo } from '@/types/todo';
import TodoItem from './TodoItem';
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

interface DraggableTaskProps {
  todo: Todo;
  index: number;
  totalTasks: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onUpdatePriority: (priority: 'low' | 'medium' | 'high' | 'none') => void;
  onEdit: (title: string, description: string, priority: 'low' | 'medium' | 'high' | 'none') => void;
}

export default function DraggableTask({
  todo,
  index,
  totalTasks,
  onMoveUp,
  onMoveDown,
  onToggle,
  onDelete,
  onUpdatePriority,
  onEdit,
}: DraggableTaskProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="flex items-start gap-2">
        {/* Reorder Controls */}
        <div className={`flex flex-col gap-1 mt-4 transition-opacity duration-200 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move up"
          >
            <ChevronUp size={14} />
          </button>
          <div className="text-gray-400">
            <GripVertical size={14} />
          </div>
          <button
            onClick={onMoveDown}
            disabled={index === totalTasks - 1}
            className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move down"
          >
            <ChevronDown size={14} />
          </button>
        </div>
        
        {/* Todo Item */}
        <div className="flex-1">
          <TodoItem
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdatePriority={onUpdatePriority}
            onEdit={onEdit}
          />
        </div>
      </div>
    </div>
  );
}

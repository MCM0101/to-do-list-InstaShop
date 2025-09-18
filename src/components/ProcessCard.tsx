import { useNavigate } from 'react-router-dom';
import { WorkProcess } from '@/types/todo';
import { useTodos } from '@/hooks/use-todos';
import { Briefcase, Users, Settings, BarChart3, UserPlus, Edit3, Trash2 } from 'lucide-react';

interface ProcessCardProps {
  process: WorkProcess;
  onEdit?: (process: WorkProcess) => void;
  onDelete?: (process: WorkProcess) => void;
}

const iconMap = {
  Briefcase,
  Users,
  Settings,
  BarChart3,
  UserPlus,
} as const;

export default function ProcessCard({ process, onEdit, onDelete }: ProcessCardProps) {
  const navigate = useNavigate();
  const { getCompletionStats } = useTodos();
  const stats = getCompletionStats(process.id);
  
  const IconComponent = iconMap[process.icon as keyof typeof iconMap];
  const isEmojiIcon = !IconComponent && process.icon;

  const handlePress = () => {
    navigate(`/process/${process.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(process);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(process);
  };

  return (
    <div 
      className="h-40 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
      onClick={handlePress}
      data-testid={`process-card-${process.id}`}
    >
      <div 
        className="h-full rounded-2xl p-4 flex flex-col justify-between"
        style={{
          background: `linear-gradient(135deg, ${process.gradient[0]}, ${process.gradient[1]})`
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {IconComponent ? (
              <IconComponent size={28} color="white" />
            ) : isEmojiIcon ? (
              <span className="text-2xl">{process.icon}</span>
            ) : null}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <button
                onClick={handleEdit}
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                title="Edit Process"
              >
                <Edit3 size={12} />
              </button>
              <button
                onClick={handleDelete}
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-red-500/30 transition-colors"
                title="Delete Process"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="bg-white bg-opacity-20 px-2 py-1 rounded-xl">
              <span className="text-white text-xs font-semibold">{stats.percentage}%</span>
            </div>
          </div>
        </div>
        
        <h3 className="text-white text-base font-bold mt-2">{process.title}</h3>
        
        <div className="mt-2">
          <p className="text-white text-opacity-90 text-xs mb-1.5">
            {stats.completed}/{stats.total} tasks
          </p>
          <div className="h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

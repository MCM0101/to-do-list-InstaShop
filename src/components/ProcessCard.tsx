import { useNavigate } from 'react-router-dom';
import { WorkProcess } from '@/types/todo';
import { useTodos } from '@/hooks/use-todos';
import { Briefcase, Users, Settings, BarChart3, UserPlus } from 'lucide-react';

interface ProcessCardProps {
  process: WorkProcess;
}

const iconMap = {
  Briefcase,
  Users,
  Settings,
  BarChart3,
  UserPlus,
} as const;

export default function ProcessCard({ process }: ProcessCardProps) {
  const navigate = useNavigate();
  const { getCompletionStats } = useTodos();
  const stats = getCompletionStats(process.id);
  
  const IconComponent = iconMap[process.icon as keyof typeof iconMap];

  const handlePress = () => {
    navigate(`/process/${process.id}`);
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
          {IconComponent && <IconComponent size={28} color="white" />}
          <div className="bg-white bg-opacity-20 px-2 py-1 rounded-xl">
            <span className="text-white text-xs font-semibold">{stats.percentage}%</span>
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

import { useMemo, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import ProcessCard from '@/components/ProcessCard';
import { WORK_PROCESSES } from '@/constants/work-processes';
import { useSelectedDate } from '@/hooks/use-selected-date';
import { useTodos } from '@/hooks/use-todos';
import { useFirestore } from '@/hooks/useFirestore';
import { WorkProcess } from '@/types/todo';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { selectedDate, goPrevDay, goNextDay, goTo } = useSelectedDate();
  const { initializeDateForAllProcesses } = useTodos();
  const { logout } = useAuth();
  
  // Use Firestore to persist all work processes
  const [allProcesses, setAllProcesses] = useFirestore<WorkProcess[]>("allProcesses", WORK_PROCESSES);

  // Initialize todos for the current date when component mounts or date changes
  useEffect(() => {
    if (selectedDate) {
      console.log('HomePage: Initializing todos for date:', selectedDate);
      initializeDateForAllProcesses(selectedDate);
    }
  }, [selectedDate, initializeDateForAllProcesses]);

  const formattedDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(n => parseInt(n, 10));
    const dt = new Date(Date.UTC(y, (m - 1), d));
    return dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, [selectedDate]);

  const handleDeleteProcess = (process: WorkProcess) => {
    console.log('🗑️ Delete button clicked for:', process.title, process.id);
    
    if (confirm(`Are you sure you want to delete "${process.title}"? This will also delete all associated tasks.`)) {
      console.log('🗑️ User confirmed deletion');
      
      // Remove process from allProcesses
      setAllProcesses((prev: WorkProcess[]) => prev.filter(p => p.id !== process.id));
      
      console.log('🗑️ Deleted process:', process.title);
    }
  };

  const goToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    goTo(today);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 pb-2">
        {/* Header */}
        <div className="mb-6 p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: '#ed037c' }}>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-white">
              Mazen InstaShop to-do list
            </h1>
          </div>
          <button
            onClick={logout}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
        
        <div className="flex items-center justify-center mb-3">
          <div className="bg-white rounded-lg border border-gray-200 p-2 flex items-center gap-1 shadow-sm">
            <button 
              onClick={goPrevDay} 
              className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
              data-testid="date-prev"
            >
              <ChevronLeft size={14} color="#6B7280" />
            </button>
            <div 
              className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded hover:bg-gray-50 transition-colors"
              onClick={goNextDay}
              onContextMenu={(e) => {
                e.preventDefault();
                goPrevDay();
              }}
              data-testid="date-center"
            >
              <Calendar size={16} color="#6B7280" />
              <span className="text-sm text-gray-700 font-medium">{formattedDate}</span>
            </div>
            <button 
              onClick={goNextDay} 
              className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
              data-testid="date-next"
            >
              <ChevronRight size={14} color="#6B7280" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button 
              onClick={goToToday}
              className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              Today
            </button>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Work Processes</h2>
      </div>

      <div className="px-6 space-y-6 pb-20">

        {/* All Processes */}
        {allProcesses.map((process) => (
          <ProcessCard 
            key={process.id} 
            process={process} 
            onDelete={handleDeleteProcess}
          />
        ))}
      </div>
    </div>
  );
}

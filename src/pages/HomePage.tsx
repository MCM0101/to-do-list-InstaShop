import { useMemo, useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import ProcessCard from '@/components/ProcessCard';
import { WORK_PROCESSES } from '@/constants/work-processes';
import { useSelectedDate } from '@/hooks/use-selected-date';
import { useTodos } from '@/hooks/use-todos';

export default function HomePage() {
  const { selectedDate, goPrevDay, goNextDay, goTo } = useSelectedDate();
  const { initializeDateForAllProcesses } = useTodos();
  const [showAddProcessForm, setShowAddProcessForm] = useState(false);
  const [newProcessTitle, setNewProcessTitle] = useState('');
  const [newProcessDescription, setNewProcessDescription] = useState('');

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

  const handleAddProcess = () => {
    // For now, just show an alert. In a real app, this would add to the processes list
    if (newProcessTitle.trim()) {
      alert(`New process "${newProcessTitle}" would be added here!`);
      setNewProcessTitle('');
      setNewProcessDescription('');
      setShowAddProcessForm(false);
    }
  };

  const handleCancelAddProcess = () => {
    setNewProcessTitle('');
    setNewProcessDescription('');
    setShowAddProcessForm(false);
  };

  const goToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    goTo(today);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 pb-2">
        {/* Header */}
        <div className="text-center mb-6 p-4 rounded-xl" style={{ backgroundColor: '#ed037c' }}>
          <h1 className="text-2xl font-bold text-white">
            Mazen InstaShop to-do list
          </h1>
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
        {/* Add New Process Form */}
        {showAddProcessForm && (
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Add New Work Process</h3>
              <button
                onClick={handleCancelAddProcess}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                value={newProcessTitle}
                onChange={(e) => setNewProcessTitle(e.target.value)}
                placeholder="Process title"
                className="w-full h-11 bg-gray-50 rounded-lg px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                autoFocus
              />
              
              <input
                type="text"
                value={newProcessDescription}
                onChange={(e) => setNewProcessDescription(e.target.value)}
                placeholder="Process description (optional)"
                className="w-full h-11 bg-gray-50 rounded-lg px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              
              <div className="flex gap-2">
                <button 
                  onClick={handleAddProcess} 
                  className="flex-1 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add Process
                </button>
                <button 
                  onClick={handleCancelAddProcess} 
                  className="px-4 h-10 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add New Process Button */}
        {!showAddProcessForm && (
          <button
            onClick={() => setShowAddProcessForm(true)}
            className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            <Plus size={32} className="mb-2" />
            <span className="text-lg font-medium">Add New Work Process</span>
            <span className="text-sm">Create a new process to manage</span>
          </button>
        )}

        {/* Existing Processes */}
        {WORK_PROCESSES.map((process) => (
          <ProcessCard key={process.id} process={process} />
        ))}
      </div>
    </div>
  );
}

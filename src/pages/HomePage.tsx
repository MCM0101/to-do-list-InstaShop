import { useMemo, useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, LogOut } from 'lucide-react';
import ProcessCard from '@/components/ProcessCard';
import { WORK_PROCESSES } from '@/constants/work-processes';
import { useSelectedDate } from '@/hooks/use-selected-date';
import { useTodos } from '@/hooks/use-todos';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { WorkProcess } from '@/types/todo';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { selectedDate, goPrevDay, goNextDay, goTo } = useSelectedDate();
  const { initializeDateForAllProcesses } = useTodos();
  const { logout } = useAuth();
  const [showAddProcessForm, setShowAddProcessForm] = useState(false);
  const [newProcessTitle, setNewProcessTitle] = useState('');
  const [newProcessDescription, setNewProcessDescription] = useState('');
  const [showDuplicateOptions, setShowDuplicateOptions] = useState(false);
  const [editingProcess, setEditingProcess] = useState<WorkProcess | null>(null);
  
  // Use localStorage to persist custom work processes and hidden processes
  const [customProcesses, setCustomProcesses] = useLocalStorage<WorkProcess[]>("is-todo/custom-processes", []);
  const [hiddenProcesses, setHiddenProcesses] = useLocalStorage<string[]>("is-todo/hidden-processes", []);
  
  // Combine default and custom processes, excluding hidden ones
  const allProcesses = useMemo(() => {
    const defaultProcesses = WORK_PROCESSES.filter(p => !hiddenProcesses.includes(p.id));
    return [...defaultProcesses, ...customProcesses];
  }, [customProcesses, hiddenProcesses]);

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
    if (newProcessTitle.trim()) {
      if (editingProcess) {
        if (editingProcess.id.startsWith('custom-')) {
          // Update existing custom process
          const updatedProcess = {
            ...editingProcess,
            title: newProcessTitle.trim(),
            description: newProcessDescription.trim() || editingProcess.description
          };
          
          setCustomProcesses(prev => 
            prev.map(p => p.id === editingProcess.id ? updatedProcess : p)
          );
        } else {
          // Editing a default process - create a custom copy and hide the original
          const newId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const customCopy = {
            ...editingProcess,
            id: newId,
            title: newProcessTitle.trim(),
            description: newProcessDescription.trim() || editingProcess.description
          };
          
          // Add the custom copy
          setCustomProcesses(prev => [...prev, customCopy]);
          
          // Hide the original default process
          setHiddenProcesses(prev => [...prev, editingProcess.id]);
        }
      } else {
        // Generate a unique ID for the new process
        const newId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create the new process object
        const newProcess: WorkProcess = {
          id: newId,
          title: newProcessTitle.trim(),
          description: newProcessDescription.trim() || 'Custom work process',
          color: '#6366f1', // Default indigo color
          icon: '📋', // Default clipboard icon
          gradient: ['#6366f1', '#8b5cf6'] // Default indigo to purple gradient
        };
        
        // Add to custom processes
        setCustomProcesses(prev => [...prev, newProcess]);
      }
      
      // Reset form
      setNewProcessTitle('');
      setNewProcessDescription('');
      setShowAddProcessForm(false);
      setEditingProcess(null);
    }
  };

  const handleDuplicateProcess = (templateProcess: WorkProcess) => {
    if (newProcessTitle.trim()) {
      // Generate a unique ID for the new process
      const newId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the new process by copying the template
      const newProcess: WorkProcess = {
        ...templateProcess,
        id: newId,
        title: newProcessTitle.trim(),
        description: newProcessDescription.trim() || templateProcess.description,
      };
      
      // Add to custom processes
      setCustomProcesses(prev => [...prev, newProcess]);
      
      // Reset form
      setNewProcessTitle('');
      setNewProcessDescription('');
      setShowAddProcessForm(false);
      setShowDuplicateOptions(false);
    }
  };

  const handleCancelAddProcess = () => {
    setNewProcessTitle('');
    setNewProcessDescription('');
    setShowAddProcessForm(false);
    setShowDuplicateOptions(false);
    setEditingProcess(null);
  };

  const handleEditProcess = (process: WorkProcess) => {
    // If it's a default process, we'll create a custom copy when saving
    setNewProcessTitle(process.title);
    setNewProcessDescription(process.description);
    setEditingProcess(process);
    setShowAddProcessForm(true);
  };

  const handleDeleteProcess = (process: WorkProcess) => {
    console.log('🗑️ Delete button clicked for:', process.title, process.id);
    
    if (confirm(`Are you sure you want to delete "${process.title}"? This will also delete all associated tasks.`)) {
      console.log('🗑️ User confirmed deletion');
      
      if (process.id.startsWith('custom-')) {
        // Delete custom process
        const currentCustomProcesses = JSON.parse(localStorage.getItem('is-todo/custom-processes') || '[]');
        const filteredCustomProcesses = currentCustomProcesses.filter((p: any) => p.id !== process.id);
        localStorage.setItem('is-todo/custom-processes', JSON.stringify(filteredCustomProcesses));
        setCustomProcesses(filteredCustomProcesses);
      } else {
        // Hide default process
        const currentHiddenProcesses = JSON.parse(localStorage.getItem('is-todo/hidden-processes') || '[]');
        const updatedHiddenProcesses = [...currentHiddenProcesses, process.id];
        localStorage.setItem('is-todo/hidden-processes', JSON.stringify(updatedHiddenProcesses));
        setHiddenProcesses(updatedHiddenProcesses);
      }
      
      // Remove all associated todos for this process
      const currentTodos = JSON.parse(localStorage.getItem('is-todo/tasks') || '[]');
      const filteredTodos = currentTodos.filter((todo: any) => todo.processId !== process.id);
      localStorage.setItem('is-todo/tasks', JSON.stringify(filteredTodos));
      
      console.log('🗑️ Deleted/hidden process and associated todos:', process.title);
      
      // Force a page reload to ensure UI updates
      setTimeout(() => {
        window.location.reload();
      }, 100);
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
        {/* Add New Process Form */}
        {showAddProcessForm && (
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProcess ? 'Edit Work Process' : 'Add New Work Process'}
              </h3>
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
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button 
                    onClick={handleAddProcess} 
                    className="flex-1 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingProcess ? 'Save Changes' : 'Create New Process'}
                  </button>
                  {!editingProcess && (
                    <button 
                      onClick={() => setShowDuplicateOptions(!showDuplicateOptions)} 
                      className="px-4 h-10 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Duplicate Existing
                    </button>
                  )}
                </div>
                
                {showDuplicateOptions && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-600 mb-2">Choose a process to duplicate:</p>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {WORK_PROCESSES.map((process) => (
                        <button
                          key={process.id}
                          onClick={() => handleDuplicateProcess(process)}
                          className="p-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{process.icon}</span>
                            <span className="truncate">{process.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handleCancelAddProcess} 
                  className="w-full h-10 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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

        {/* All Processes (Default + Custom) */}
        {allProcesses.map((process) => (
          <ProcessCard 
            key={process.id} 
            process={process} 
            onEdit={handleEditProcess}
            onDelete={handleDeleteProcess}
          />
        ))}
      </div>
    </div>
  );
}

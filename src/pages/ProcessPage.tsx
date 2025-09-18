import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, X, Copy, Pin, ListChecks, Edit3, Trash2 } from 'lucide-react';
import { useTodos } from '@/hooks/use-todos';
import { WORK_PROCESSES } from '@/constants/work-processes';
import { useSelectedDate } from '@/hooks/use-selected-date';
import DraggableTask from '@/components/DraggableTask';
import { Todo, WorkProcess } from '@/types/todo';
import { useFirestore } from '@/hooks/useFirestore';

type Priority = 'low' | 'medium' | 'high' | 'none';

export default function ProcessPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getDailyTasks,
    getFixedTasks,
    toggleTodo, 
    addTodo, 
    deleteTodo, 
    updateTodo, 
    updateTodoPriority, 
    copyFromPreviousDay, 
    initializeDateForAllProcesses,
    reorderTasks
  } = useTodos();
  
  const { selectedDate, goPrevDay, goNextDay, goTo } = useSelectedDate();
  const [newTask, setNewTask] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>('none');
  const [isFixedTask, setIsFixedTask] = useState(false);
  const [dailyTasks, setDailyTasks] = useState<Todo[]>([]);
  const [fixedTasks, setFixedTasks] = useState<Todo[]>([]);
  const [stats] = useState({ completed: 0, total: 0, percentage: 0 });
  
  // Edit process states
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Firestore functionality - get all processes
  const [allProcesses, setAllProcesses, { isLoading: allProcessesLoading }] = useFirestore<WorkProcess[]>("allProcesses", WORK_PROCESSES);
  
  console.log('🔍 ProcessPage allProcesses:', allProcesses.map(p => ({ id: p.id, title: p.title })));

  const process = allProcesses.find(p => p.id === id);
  
  console.log('🔍 ProcessPage looking for ID:', id);
  console.log('🔍 ProcessPage found process:', process ? { id: process.id, title: process.title } : 'NOT FOUND');
  console.log('🔍 ProcessPage allProcessesLoading:', allProcessesLoading);

  // Temporarily disable loading state to debug
  // if (allProcessesLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading process...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Temporarily disable process not found to debug
  // if (!process) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-gray-900 mb-2">Process Not Found</h1>
  //         <p className="text-gray-600 mb-4">The process you're looking for doesn't exist.</p>
  //         <button 
  //           onClick={() => navigate('/')}
  //           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
  //         >
  //           Back to Home
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  // Debug: Show process page even if process not found
  if (!process) {
    console.log('⚠️ Process not found, but showing page for debugging');
  }

  // Initialize todos for the current date when component mounts or date changes
  useEffect(() => {
    if (selectedDate) {
      initializeDateForAllProcesses(selectedDate);
    }
  }, [selectedDate, initializeDateForAllProcesses]);

  // Update tasks and stats when the process or date changes
  useEffect(() => {
    if (process?.id) {
      console.log('ProcessPage: Loading tasks for process:', process.id);
      const daily = getDailyTasks(process.id);
      const fixed = getFixedTasks(process.id);
      console.log('ProcessPage: Loaded tasks:', { daily, fixed });
      setDailyTasks(daily);
      setFixedTasks(fixed);
    }
  }, [process?.id, getDailyTasks, getFixedTasks, selectedDate]);


  const formattedDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(n => parseInt(n, 10));
    const dt = new Date(Date.UTC(y, (m - 1), d));
    return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, [selectedDate]);

  if (!process) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Process not found</h1>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const handleAdd = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    
    const value = newTask.trim();
    if (!value || !process?.id) {
      return;
    }
    
    try {
      addTodo(process.id, value, newTaskDescription, selectedPriority, isFixedTask);
      
      setNewTask('');
      setNewTaskDescription('');
      setSelectedPriority('none');
      setIsFixedTask(false);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }, [newTask, newTaskDescription, selectedPriority, isFixedTask, process?.id, addTodo]);

  const moveTaskUp = useCallback((taskIndex: number, isFixed: boolean) => {
    if (!process?.id || taskIndex === 0) return;
    
    console.log('Moving task up:', { taskIndex, isFixed });
    reorderTasks(process.id, taskIndex, taskIndex - 1, isFixed);
  }, [process?.id, reorderTasks]);

  const moveTaskDown = useCallback((taskIndex: number, isFixed: boolean, totalTasks: number) => {
    if (!process?.id || taskIndex === totalTasks - 1) return;
    
    console.log('Moving task down:', { taskIndex, isFixed });
    reorderTasks(process.id, taskIndex, taskIndex + 1, isFixed);
  }, [process?.id, reorderTasks]);

  const handleCancelAddTask = useCallback(() => {
    setNewTask('');
    setNewTaskDescription('');
    setSelectedPriority('none');
    setIsFixedTask(false);
    setShowAddForm(false);
  }, []);

  const handleEditProcess = useCallback(() => {
    if (process) {
      setEditTitle(process.title);
      setEditDescription(process.description);
      setShowEditForm(true);
    }
  }, [process]);

  const handleSaveEdit = useCallback(() => {
    if (process && editTitle.trim()) {
      const updatedProcess = {
        ...process,
        title: editTitle.trim(),
        description: editDescription.trim() || process.description
      };
      
      setAllProcesses((prev: WorkProcess[]) => 
        prev.map(p => p.id === process.id ? updatedProcess : p)
      );
      
      setShowEditForm(false);
      setEditTitle('');
      setEditDescription('');
    }
  }, [process, editTitle, editDescription, setAllProcesses]);

  const handleCancelEdit = useCallback(() => {
    setShowEditForm(false);
    setEditTitle('');
    setEditDescription('');
  }, []);

  const handleDeleteProcess = useCallback(() => {
    if (process && confirm(`Are you sure you want to delete "${process.title}"? This will also delete all associated tasks.`)) {
      
      console.log('🗑️ Deleting process:', process.id);
      
      // Remove process from allProcesses
      setAllProcesses((prev: WorkProcess[]) => prev.filter(p => p.id !== process.id));
      
      console.log('🗑️ Deleted process');
      
      // Navigate back to home
      setTimeout(() => {
        navigate('/');
      }, 100);
    }
  }, [process, navigate, setAllProcesses]);

  useEffect(() => {
    if (process) {
      console.log('🔍 Process debug:', {
        id: process.id,
        startsWithCustom: process.id.startsWith('custom-')
      });
    }
  }, [process]);

  const handleCopyFromPreviousDay = useCallback(() => {
    if (!process?.id) return;
    copyFromPreviousDay(process.id);
  }, [process?.id, copyFromPreviousDay]);

  const goToToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    goTo(today);
  }, [goTo]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd(e);
    }
  }, [handleAdd]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="p-6 pt-4"
        style={{
          background: process ? `linear-gradient(135deg, ${process.gradient[0]}, ${process.gradient[1]})` : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
        }}
      >
        <div className="flex items-center justify-between p-4" style={{ backgroundColor: process?.color || '#6366f1' }}>
          <button 
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">
            {process ? process.title : `DEBUG: ID=${id}, Loading=${allProcessesLoading}, ProcessCount=${allProcesses.length}`}
          </h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleEditProcess}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              title="Edit Process"
            >
              <Edit3 size={16} />
            </button>
            <button 
              onClick={handleDeleteProcess}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-red-500/30 transition-colors"
              title="Delete Process"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={goPrevDay}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-center">
            <div className="text-white font-medium">{formattedDate}</div>
            <button 
              onClick={goToToday}
              className="text-xs text-white/80 hover:text-white transition-colors"
            >
              Today
            </button>
          </div>
          
          <button 
            onClick={goNextDay}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-medium text-white">Progress</div>
            <span className="text-xs text-white/80">{stats.completed} of {stats.total} tasks</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-xs text-white/80">{stats.percentage}%</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pb-32">
        {/* Fixed Tasks Section */}
        {fixedTasks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Pin size={18} className="text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">Fixed Tasks</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {fixedTasks.length} tasks
              </span>
            </div>
            
            <div className="space-y-3 mb-6 min-h-[60px] p-3 rounded-lg border-2 border-dashed border-purple-200 bg-purple-50/30">
              {fixedTasks.length === 0 ? (
                <div className="text-center py-4 text-purple-400">
                  <div className="text-sm">No fixed tasks yet</div>
                  <div className="text-xs mt-1">Fixed tasks appear every day</div>
                </div>
              ) : (
                fixedTasks.map((todo, index) => (
                  <DraggableTask
                    key={todo.id}
                    todo={todo}
                    index={index}
                    totalTasks={fixedTasks.length}
                    onMoveUp={() => moveTaskUp(index, true)}
                    onMoveDown={() => moveTaskDown(index, true, fixedTasks.length)}
                    onToggle={() => toggleTodo(process.id, todo.id)}
                    onDelete={() => deleteTodo(process.id, todo.id)}
                    onUpdatePriority={(priority: 'low' | 'medium' | 'high' | 'none') => updateTodoPriority(process.id, todo.id, priority)}
                    onEdit={(title: string, description: string, priority: 'low' | 'medium' | 'high' | 'none') => updateTodo(process.id, todo.id, title, description, priority)}
                  />
                ))
              )}
            </div>
          </div>
        )}
        
        {/* Daily Tasks Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ListChecks size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedDate === new Date().toISOString().split('T')[0] 
                ? "Today's Tasks" 
                : 'Daily Tasks'}
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {dailyTasks.length} tasks
            </span>
          </div>
          
          <div className="space-y-3 min-h-[120px] p-3 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/30">
            {dailyTasks.length === 0 ? (
              <div className="text-center py-8 text-blue-400">
                <div className="text-sm">No tasks for this day</div>
                <div className="text-xs mt-1">Add a task to get started!</div>
              </div>
            ) : (
              dailyTasks.map((todo, index) => (
                <DraggableTask
                  key={todo.id}
                  todo={todo}
                  index={index}
                  totalTasks={dailyTasks.length}
                  onMoveUp={() => moveTaskUp(index, false)}
                  onMoveDown={() => moveTaskDown(index, false, dailyTasks.length)}
                  onToggle={() => toggleTodo(process.id, todo.id)}
                  onDelete={() => deleteTodo(process.id, todo.id)}
                  onUpdatePriority={(priority: 'low' | 'medium' | 'high' | 'none') => updateTodoPriority(process.id, todo.id, priority)}
                  onEdit={(title: string, description: string, priority: 'low' | 'medium' | 'high' | 'none') => updateTodo(process.id, todo.id, title, description, priority)}
                />
              ))
            )}
          </div>
        </div>

        {/* Add Task Form Modal */}
        {showAddForm && (
          <div 
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center p-4"
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={handleCancelAddTask}
          >
            <div 
              className="bg-white rounded-xl w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                backgroundColor: 'white',
                minHeight: '400px',
                maxWidth: '500px',
                width: '90%'
              }}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Add New Task</h3>
                <button 
                  type="button"
                  onClick={handleCancelAddTask}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAdd}>
                <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter task title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Enter task description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="none">No Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    id="fixed-task"
                    type="checkbox"
                    checked={isFixedTask}
                    onChange={(e) => setIsFixedTask(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="fixed-task" className="text-sm">
                    <div className="font-medium text-gray-700">Fixed Task</div>
                    <p className="text-gray-500">This task will appear every day</p>
                  </label>
                </div>
              </div>
              
                <div className="p-4 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelAddTask}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newTask.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Copy from Previous Day Button */}
        <div className="mt-6">
          <button
            onClick={handleCopyFromPreviousDay}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Copy size={16} />
            Copy tasks from previous day
          </button>
        </div>

        {/* Add Task Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-40"
          >
            <Plus size={24} />
          </button>
        )}

        {/* Edit Process Modal */}
        {showEditForm && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleCancelEdit}
          >
            <div 
              className="bg-white rounded-xl w-full max-w-md shadow-2xl m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Edit Process</h3>
                <button 
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Process Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-11 bg-gray-50 rounded-lg px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Enter process title"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full h-11 bg-gray-50 rounded-lg px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Enter process description"
                  />
                </div>
              </div>
              
              <div className="p-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!editTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

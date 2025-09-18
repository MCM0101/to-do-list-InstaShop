import createContextHook from '@/utils/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { DailyTodos, Todo } from '@/types/todo';
import { getTodaysTodos } from '@/mocks/daily-todos';
import { useSelectedDate } from '@/hooks/use-selected-date';

export const [TodoProvider, useTodos] = createContextHook(() => {
  const [dailyTodos, setDailyTodos] = useState<DailyTodos[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();
  const { selectedDate } = useSelectedDate();

  const todosQuery = useQuery({
    queryKey: ['daily-todos'],
    queryFn: async () => {
      try {
        console.log('🔄 Loading todos from localStorage...');
        
        // Check if localStorage is available
        if (typeof Storage === 'undefined') {
          console.warn('⚠️ localStorage not available');
          return getTodaysTodos();
        }
        
        const stored = localStorage.getItem('daily-todos');
        console.log('📦 Raw stored data:', stored ? `${stored.length} characters` : 'null');
        
        if (stored && stored !== 'undefined' && stored !== 'null') {
          try {
            const parsedTodos = JSON.parse(stored);
            console.log('✅ Successfully parsed todos:', parsedTodos.length, 'entries');
            
            // Validate the data structure
            if (Array.isArray(parsedTodos)) {
              return parsedTodos;
            } else {
              console.warn('⚠️ Invalid data structure, using defaults');
              return getTodaysTodos();
            }
          } catch (parseError) {
            console.error('❌ Failed to parse stored data:', parseError);
            return getTodaysTodos();
          }
        }
        
        console.log('📝 No valid stored data, using default todos');
        const defaultTodos = getTodaysTodos();
        console.log('🏗️ Created default todos:', defaultTodos.length, 'entries');
        
        // Immediately save the default todos
        localStorage.setItem('daily-todos', JSON.stringify(defaultTodos));
        console.log('💾 Saved default todos to localStorage');
        
        return defaultTodos;
      } catch (error) {
        console.error('❌ Error in todosQuery:', error);
        return getTodaysTodos();
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: false, // Disable to prevent constant refetching
  });

  const saveMutation = useMutation({
    mutationFn: async (todos: DailyTodos[]) => {
      if (!Array.isArray(todos)) {
        console.warn('⚠️ Invalid todos data for saving:', todos);
        return [] as DailyTodos[];
      }
      
      console.log('💾 Saving to localStorage:', todos.length, 'entries');
      
      try {
        const dataToSave = JSON.stringify(todos);
        localStorage.setItem('daily-todos', dataToSave);
        console.log('✅ Saved to localStorage successfully');
        
        // Verify the save worked
        const verification = localStorage.getItem('daily-todos');
        if (verification) {
          const parsed = JSON.parse(verification);
          console.log('🔍 Verification successful:', parsed.length, 'entries');
        } else {
          console.error('❌ Verification failed: no data found');
        }
        
        return todos;
      } catch (error) {
        console.error('❌ Failed to save to localStorage:', error);
        return todos;
      }
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(['daily-todos'], data);
        console.log('🔄 Updated query cache with:', data.length, 'entries');
      }
    },
    onError: (error) => {
      console.error('❌ Save mutation error:', error);
    }
  });

  const { mutate: saveTodos } = saveMutation;

  // Initialize data directly from localStorage on mount
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 Initializing todos directly from localStorage...');
      
      try {
        const stored = localStorage.getItem('daily-todos');
        if (stored && stored !== 'null' && stored !== 'undefined') {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('✅ Found existing data:', parsed.length, 'entries');
            setDailyTodos(parsed);
            setIsInitialized(true);
            return;
          }
        }
        
        console.log('📝 No existing data, creating defaults');
        const defaultData = getTodaysTodos();
        setDailyTodos(defaultData);
        localStorage.setItem('daily-todos', JSON.stringify(defaultData));
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Error initializing:', error);
        const defaultData = getTodaysTodos();
        setDailyTodos(defaultData);
        setIsInitialized(true);
      }
    }
  }, [isInitialized]);

  useEffect(() => {
    if (todosQuery.data && !isInitialized) {
      console.log('🔄 Setting dailyTodos from query data:', todosQuery.data);
      setDailyTodos(todosQuery.data);
      setIsInitialized(true);
    }
  }, [todosQuery.data, isInitialized]);

  // Force save on every change to dailyTodos - but only after initialization
  useEffect(() => {
    if (isInitialized && dailyTodos.length > 0) {
      console.log('🔄 dailyTodos changed, auto-saving:', dailyTodos.length, 'entries');
      
      // Direct localStorage save for immediate persistence
      try {
        localStorage.setItem('daily-todos', JSON.stringify(dailyTodos));
        console.log('✅ Direct save successful');
      } catch (error) {
        console.error('❌ Direct save failed:', error);
      }
      
      saveTodos(dailyTodos);
    } else if (isInitialized && dailyTodos.length === 0) {
      console.log('⚠️ dailyTodos is empty after initialization - NOT saving to prevent data loss');
    }
  }, [dailyTodos, saveTodos, isInitialized]);

  const ensureEntry = useCallback((processId: string, date: string) => {
    const exists = dailyTodos.some(dt => dt.processId === processId && dt.date === date);
    console.log('ensureEntry called:', { processId, date, exists, dailyTodosLength: dailyTodos.length });
    if (!exists) {
      const newEntry = { processId, date, todos: [] as Todo[] };
      const updated = [
        ...dailyTodos,
        newEntry,
      ];
      console.log('Creating new entry:', newEntry);
      setDailyTodos(updated);
      saveTodos(updated);
    }
  }, [dailyTodos, saveTodos]);

  const addTodo = useCallback((processId: string, title: string, description: string = '', priority: 'low' | 'medium' | 'high' | 'none' = 'none', isFixed: boolean = false) => {
    const date = isFixed ? 'fixed' : selectedDate;
    console.log('addTodo called:', { processId, title, description, priority, date, isFixed, dailyTodosLength: dailyTodos.length });
    if (!processId?.trim() || !title?.trim()) {
      console.log('addTodo early return:', { hasProcessId: !!processId?.trim(), hasTitle: !!title?.trim() });
      return;
    }
    
    ensureEntry(processId, date);
    
    const newTodo: Todo = {
      id: `${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      completed: false,
      priority: priority,
      fixed: isFixed,
      order: 0 // Will be set based on the current count
    };
    
    const updated = dailyTodos.map(dt => {
      if (dt.processId === processId && dt.date === date) {
        // Set order based on current count
        newTodo.order = dt.todos.length * 10;
        return { ...dt, todos: [newTodo, ...dt.todos] };
      }
      return dt;
    });
    
    console.log('Updated todos:', updated);
    setDailyTodos(updated);
    saveTodos(updated);
  }, [dailyTodos, ensureEntry, saveTodos, selectedDate]);

  const toggleTodo = useCallback((processId: string, todoId: string) => {
    const date = selectedDate;
    if (!processId?.trim() || !todoId?.trim()) return;
    const updated = dailyTodos.map(dailyTodo => {
      if (dailyTodo.processId === processId && dailyTodo.date === date) {
        return {
          ...dailyTodo,
          todos: dailyTodo.todos.map(todo =>
            todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
          )
        };
      }
      return dailyTodo;
    });
    setDailyTodos(updated);
    saveTodos(updated);
  }, [dailyTodos, saveTodos, selectedDate]);

  const getTodosForProcess = useCallback((processId: string): Todo[] => {
    if (!processId?.trim()) return [];
    
    // Get both daily and fixed tasks
    const dailyTasks = dailyTodos.find(dt => dt.processId === processId && dt.date === selectedDate)?.todos || [];
    const fixedTasks = dailyTodos.find(dt => dt.processId === processId && dt.date === 'fixed')?.todos || [];
    
    // Sort tasks by order
    const sortedDailyTasks = [...dailyTasks].sort((a, b) => (a.order || 0) - (b.order || 0));
    const sortedFixedTasks = [...fixedTasks].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Combine and return all tasks
    return [...sortedFixedTasks, ...sortedDailyTasks];
  }, [dailyTodos, selectedDate]);
  
  const getDailyTasks = useCallback((processId: string): Todo[] => {
    if (!processId?.trim()) return [];
    const tasks = dailyTodos.find(dt => dt.processId === processId && dt.date === selectedDate)?.todos || [];
    return [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [dailyTodos, selectedDate]);
  
  const getFixedTasks = useCallback((processId: string): Todo[] => {
    if (!processId?.trim()) return [];
    const tasks = dailyTodos.find(dt => dt.processId === processId && dt.date === 'fixed')?.todos || [];
    return [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [dailyTodos]);
  
  const reorderTasks = useCallback((processId: string, sourceIndex: number, destinationIndex: number, isFixed: boolean) => {
    const date = isFixed ? 'fixed' : selectedDate;
    console.log('reorderTasks called:', { processId, sourceIndex, destinationIndex, isFixed, date });
    
    if (!processId?.trim()) return;
    
    const updated = dailyTodos.map(dt => {
      if (dt.processId === processId && dt.date === date) {
        const newTodos = [...dt.todos];
        
        // Remove the item from source index
        const [movedItem] = newTodos.splice(sourceIndex, 1);
        
        // Insert it at destination index
        newTodos.splice(destinationIndex, 0, movedItem);
        
        // Update all orders to maintain sequence
        const updatedTodos = newTodos.map((todo, index) => ({
          ...todo,
          order: (index + 1) * 10
        }));
        
        console.log('Reordered todos:', updatedTodos);
        return { ...dt, todos: updatedTodos };
      }
      return dt;
    });
    
    console.log('Final reordered data:', updated);
    setDailyTodos(updated);
    saveTodos(updated);
  }, [dailyTodos, saveTodos, selectedDate]);

  const updateTaskOrder = useCallback((processId: string, todoId: string, newOrder: number, isFixed: boolean) => {
    const date = isFixed ? 'fixed' : selectedDate;
    console.log('updateTaskOrder called:', { processId, todoId, newOrder, isFixed, date });
    
    if (!processId?.trim() || !todoId?.trim()) return;
    
    const updated = dailyTodos.map(dt => {
      if (dt.processId === processId && dt.date === date) {
        console.log('Found matching entry:', dt);
        
        // Simply update the order of the specific task
        const updatedTodos = dt.todos.map(todo => 
          todo.id === todoId 
            ? { ...todo, order: newOrder }
            : todo
        );
        
        console.log('Updated todos:', updatedTodos);
        return { ...dt, todos: updatedTodos };
      }
      return dt;
    });
    
    console.log('Final updated data:', updated);
    setDailyTodos(updated);
    saveTodos(updated);
  }, [dailyTodos, saveTodos, selectedDate]);

  const deleteTodo = useCallback((processId: string, todoId: string) => {
    const date = selectedDate;
    if (!processId?.trim() || !todoId?.trim()) return;
    const updated = dailyTodos.map(dailyTodo => {
      if (dailyTodo.processId === processId && dailyTodo.date === date) {
        return {
          ...dailyTodo,
          todos: dailyTodo.todos.filter(todo => todo.id !== todoId)
        };
      }
      return dailyTodo;
    });
    setDailyTodos(updated);
    saveTodos(updated);
  }, [dailyTodos, saveTodos, selectedDate]);

  const updateTodoPriority = useCallback((processId: string, todoId: string, priority: 'low' | 'medium' | 'high' | 'none') => {
    const date = selectedDate;
    if (!processId?.trim() || !todoId?.trim()) return;
    const updated = dailyTodos.map(dailyTodo => {
      if (dailyTodo.processId === processId && dailyTodo.date === date) {
        return {
          ...dailyTodo,
          todos: dailyTodo.todos.map(todo =>
            todo.id === todoId ? { ...todo, priority } : todo
          )
        };
      }
      return dailyTodo;
    });
    
    setDailyTodos(updated);
    saveTodos(updated);
  }, [dailyTodos, saveTodos, selectedDate]);

  const updateTodo = useCallback((processId: string, todoId: string, title: string, description: string, priority: 'low' | 'medium' | 'high' | 'none') => {
    const date = selectedDate;
    if (!processId?.trim() || !todoId?.trim()) return;
    
    const updated = dailyTodos.map(dailyTodo => {
      if (dailyTodo.processId === processId && dailyTodo.date === date) {
        return {
          ...dailyTodo,
          todos: dailyTodo.todos.map(todo =>
            todo.id === todoId ? { ...todo, title, description, priority } : todo
          )
        };
      }
      return dailyTodo;
    });
    
    setDailyTodos(updated);
    saveTodos(updated);
  }, [dailyTodos, saveTodos, selectedDate]);

  const copyFromPreviousDay = useCallback((processId: string) => {
    const [y, m, d] = selectedDate.split('-').map(n => parseInt(n, 10));
    const currentDate = new Date(Date.UTC(y, (m - 1), d));
    const previousDate = new Date(currentDate);
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);
    const previousDateStr = previousDate.toISOString().split('T')[0];
    
    console.log('copyFromPreviousDay called:', { 
      processId, 
      selectedDate, 
      previousDateStr, 
      dailyTodosLength: dailyTodos.length 
    });
    
    const previousDayTodos = dailyTodos.find(dt => dt.processId === processId && dt.date === previousDateStr);
    console.log('Previous day todos found:', previousDayTodos);
    
    if (!previousDayTodos || previousDayTodos.todos.length === 0) {
      console.log('No previous day todos to copy');
      return;
    }
    
    ensureEntry(processId, selectedDate);
    const updated = dailyTodos.map(dt => {
      if (dt.processId === processId && dt.date === selectedDate) {
        const copiedTodos = previousDayTodos.todos.map(todo => ({
          ...todo,
          id: `${Date.now()}-${Math.random()}`,
          completed: false
        }));
        console.log('Copied todos:', copiedTodos);
        return { ...dt, todos: [...copiedTodos, ...dt.todos] };
      }
      return dt;
    });
    console.log('Updated daily todos after copy:', updated);
    setDailyTodos(updated);
    saveTodos(updated);
  }, [dailyTodos, ensureEntry, saveTodos, selectedDate]);

  const initializeDateForAllProcesses = useCallback((date: string) => {
    console.log('initializeDateForAllProcesses called for date:', date);
    const processIds = ['onboarding', 'accounts']; // Add more process IDs as needed
    let needsUpdate = false;
    const updated = [...dailyTodos];
    
    processIds.forEach(processId => {
      const exists = updated.some(dt => dt.processId === processId && dt.date === date);
      if (!exists) {
        updated.push({ processId, date, todos: [] as Todo[] });
        needsUpdate = true;
        console.log('Initialized date for process:', processId, date);
      }
    });
    
    if (needsUpdate) {
      setDailyTodos(updated);
      saveTodos(updated);
    }
  }, [dailyTodos, saveTodos]);

  const getCompletionStats = useCallback((processId: string) => {
    if (!processId?.trim()) return { completed: 0, total: 0, percentage: 0 };
    const todos = getTodosForProcess(processId);
    const completed = todos.filter(t => t.completed).length;
    const total = todos.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, [getTodosForProcess]);

  return useMemo(() => ({
    dailyTodos,
    addTodo,
    toggleTodo,
    getTodosForProcess,
    getDailyTasks,
    getFixedTasks,
    deleteTodo,
    updateTodoPriority,
    updateTodo,
    copyFromPreviousDay,
    getCompletionStats,
    initializeDateForAllProcesses,
    updateTaskOrder,
    reorderTasks,
  }), [dailyTodos, addTodo, toggleTodo, getTodosForProcess, getDailyTasks, getFixedTasks, deleteTodo, updateTodoPriority, updateTodo, copyFromPreviousDay, getCompletionStats, initializeDateForAllProcesses, updateTaskOrder, reorderTasks]);
});

import createContextHook from '@/utils/create-context-hook';
import { useMemo, useCallback } from 'react';
import { DailyTodos, Todo } from '@/types/todo';
import { getTodaysTodos } from '@/mocks/daily-todos';
import { useSelectedDate } from '@/hooks/use-selected-date';
import { useFirestore } from '@/hooks/useFirestore';

type Priority = 'low' | 'medium' | 'high' | 'none';

export const [TodoProvider, useTodos] = createContextHook(() => {
  const { selectedDate } = useSelectedDate();
  const [dailyTodos, setDailyTodos] = useFirestore<DailyTodos[]>("dailyTodos", getTodaysTodos());


  const getTodosForProcess = useCallback((processId: string): Todo[] => {
    if (!processId?.trim()) return [];
    const entry = dailyTodos.find(dt => dt.processId === processId && dt.date === selectedDate);
    return entry?.todos || [];
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

  const addTodo = useCallback((processId: string, title: string, description: string, priority: Priority, isFixed: boolean) => {
    const date = isFixed ? 'fixed' : selectedDate;
    if (!processId?.trim() || !title?.trim()) return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      description,
      priority,
      completed: false,
      order: Date.now(),
    };
    
    setDailyTodos(prev => {
      const updated = prev.map(dailyTodo => {
        if (dailyTodo.processId === processId && dailyTodo.date === date) {
          return {
            ...dailyTodo,
            todos: [...dailyTodo.todos, newTodo]
          };
        }
        return dailyTodo;
      });
      
      // If no entry exists for this process/date, create one
      const entryExists = prev.some(dt => dt.processId === processId && dt.date === date);
      if (!entryExists) {
        updated.push({
          processId,
          date,
          todos: [newTodo]
        });
      }
      
      return updated;
    });
  }, [selectedDate, setDailyTodos]);

  const toggleTodo = useCallback((processId: string, todoId: string) => {
    if (!processId?.trim() || !todoId?.trim()) return;
    
    setDailyTodos(prev => prev.map(dt => {
      if (dt.processId === processId && (dt.date === selectedDate || dt.date === 'fixed')) {
        return {
          ...dt,
          todos: dt.todos.map(todo =>
            todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
          )
        };
      }
      return dt;
    }));
  }, [selectedDate, setDailyTodos]);

  const deleteTodo = useCallback((processId: string, todoId: string) => {
    if (!processId?.trim() || !todoId?.trim()) return;
    
    setDailyTodos(prev => prev.map(dt => {
      if (dt.processId === processId && (dt.date === selectedDate || dt.date === 'fixed')) {
        return {
          ...dt,
          todos: dt.todos.filter(todo => todo.id !== todoId)
        };
      }
      return dt;
    }));
  }, [selectedDate, setDailyTodos]);

  const updateTodoPriority = useCallback((processId: string, todoId: string, priority: Priority) => {
    const date = selectedDate;
    if (!processId?.trim() || !todoId?.trim()) return;
    
    setDailyTodos(prev => prev.map(dailyTodo => {
      if (dailyTodo.processId === processId && dailyTodo.date === date) {
        return {
          ...dailyTodo,
          todos: dailyTodo.todos.map(todo =>
            todo.id === todoId ? { ...todo, priority } : todo
          )
        };
      }
      return dailyTodo;
    }));
  }, [selectedDate, setDailyTodos]);

  const updateTodo = useCallback((processId: string, todoId: string, title: string, description: string, priority: Priority) => {
    const date = selectedDate;
    if (!processId?.trim() || !todoId?.trim()) return;
    
    setDailyTodos(prev => prev.map(dailyTodo => {
      if (dailyTodo.processId === processId && dailyTodo.date === date) {
        return {
          ...dailyTodo,
          todos: dailyTodo.todos.map(todo =>
            todo.id === todoId ? { ...todo, title, description, priority } : todo
          )
        };
      }
      return dailyTodo;
    }));
  }, [selectedDate, setDailyTodos]);

  const reorderTasks = useCallback((processId: string, sourceIndex: number, destinationIndex: number, isFixed: boolean) => {
    const date = isFixed ? 'fixed' : selectedDate;
    if (!processId?.trim()) return;
    
    setDailyTodos(prev => prev.map(dt => {
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
        
        return { ...dt, todos: updatedTodos };
      }
      return dt;
    }));
  }, [selectedDate, setDailyTodos]);

  const copyFromPreviousDay = useCallback((processId: string) => {
    const [y, m, d] = selectedDate.split('-').map(n => parseInt(n, 10));
    const currentDate = new Date(Date.UTC(y, (m - 1), d));
    const previousDate = new Date(currentDate);
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);
    const previousDateStr = previousDate.toISOString().split('T')[0];
    
    const previousTasks = dailyTodos.find(dt => dt.processId === processId && dt.date === previousDateStr)?.todos || [];
    
    if (previousTasks.length > 0) {
      const newTasks = previousTasks.map(task => ({
        ...task,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        completed: false,
      }));
      
      setDailyTodos(prev => {
        const updated = prev.map(dt => {
          if (dt.processId === processId && dt.date === selectedDate) {
            return {
              ...dt,
              todos: [...dt.todos, ...newTasks]
            };
          }
          return dt;
        });
        
        // If no entry exists for current date, create one
        const entryExists = prev.some(dt => dt.processId === processId && dt.date === selectedDate);
        if (!entryExists) {
          updated.push({
            processId,
            date: selectedDate,
            todos: newTasks
          });
        }
        
        return updated;
      });
    }
  }, [dailyTodos, selectedDate, setDailyTodos]);

  const getCompletionStats = useCallback((processId: string) => {
    const dailyTasks = getDailyTasks(processId);
    const fixedTasks = getFixedTasks(processId);
    const allTasks = [...dailyTasks, ...fixedTasks];
    
    const completed = allTasks.filter(task => task.completed).length;
    const total = allTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  }, [getDailyTasks, getFixedTasks]);

  const initializeDateForAllProcesses = useCallback((_date: string) => {
    // This function can be used to ensure all processes have entries for a given date
    // For now, it's a no-op since we create entries on-demand
  }, []);

  const updateTaskOrder = useCallback((processId: string, todoId: string, newOrder: number, isFixed: boolean) => {
    const date = isFixed ? 'fixed' : selectedDate;
    if (!processId?.trim() || !todoId?.trim()) return;
    
    setDailyTodos(prev => prev.map(dt => {
      if (dt.processId === processId && dt.date === date) {
        return {
          ...dt,
          todos: dt.todos.map(todo => 
            todo.id === todoId 
              ? { ...todo, order: newOrder }
              : todo
          )
        };
      }
      return dt;
    }));
  }, [selectedDate, setDailyTodos]);

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

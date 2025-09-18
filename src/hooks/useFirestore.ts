import { useState, useEffect, useCallback } from 'react';
import { FirestoreService } from '@/services/firestoreService';

export function useFirestore<T>(
  key: 'dailyTodos' | 'customProcesses' | 'hiddenProcesses' | 'allProcesses',
  initialValue: T
) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from Firestore on mount
  useEffect(() => {
    loadFromFirestore();
  }, []);

  const loadFromFirestore = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let data: T;
      switch (key) {
        case 'dailyTodos':
          data = await FirestoreService.getDailyTodos() as T;
          break;
        case 'customProcesses':
          data = await FirestoreService.getCustomProcesses() as T;
          break;
        case 'hiddenProcesses':
          data = await FirestoreService.getHiddenProcesses() as T;
          break;
        case 'allProcesses':
          const processes = await FirestoreService.getAllProcesses() as any[];
          // If no processes in Firestore, initialize with default and save them
          if (processes.length === 0) {
            console.log('🔄 Initializing Firestore with default processes');
            await FirestoreService.saveAllProcesses(initialValue as any);
            data = initialValue;
          } else {
            data = processes as T;
          }
          break;
        default:
          data = initialValue;
      }
      
      setValue(data);
    } catch (err) {
      console.error(`Error loading ${key}:`, err);
      setError(`Failed to load ${key}`);
      setValue(initialValue);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToFirestore = useCallback(async (newValue: T) => {
    try {
      setError(null);
      
      switch (key) {
        case 'dailyTodos':
          await FirestoreService.saveDailyTodos(newValue as any);
          break;
        case 'customProcesses':
          await FirestoreService.saveCustomProcesses(newValue as any);
          break;
        case 'hiddenProcesses':
          await FirestoreService.saveHiddenProcesses(newValue as any);
          break;
        case 'allProcesses':
          await FirestoreService.saveAllProcesses(newValue as any);
          break;
      }
      
      setValue(newValue);
    } catch (err) {
      console.error(`Error saving ${key}:`, err);
      setError(`Failed to save ${key}`);
      throw err;
    }
  }, [key]);

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const updatedValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value)
      : newValue;
    
    // Update local state immediately for better UX
    setValue(updatedValue);
    
    // Save to Firestore in background
    saveToFirestore(updatedValue).catch(err => {
      console.error('Background save failed:', err);
      // Optionally revert local state on error
      // setValue(value);
    });
  }, [value, saveToFirestore]);

  return [value, updateValue, { isLoading, error, reload: loadFromFirestore }] as const;
}

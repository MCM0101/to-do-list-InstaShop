import React, { createContext, useContext, ReactNode } from 'react';

export default function createContextHook<T>(
  useValue: () => T
): [React.FC<{ children: ReactNode }>, () => T] {
  const Context = createContext<T | null>(null);

  const Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const value = useValue();
    return React.createElement(Context.Provider, { value }, children);
  };

  const useHook = (): T => {
    const context = useContext(Context);
    if (context === null) {
      throw new Error('useHook must be used within a Provider');
    }
    return context;
  };

  return [Provider, useHook];
}

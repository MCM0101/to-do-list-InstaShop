import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const authStatus = localStorage.getItem('is-todo-authenticated');
      const authTimestamp = localStorage.getItem('is-todo-auth-timestamp');
      
      if (authStatus === 'true' && authTimestamp) {
        const timestamp = parseInt(authTimestamp);
        const now = Date.now();
        const hoursSinceAuth = (now - timestamp) / (1000 * 60 * 60);
        
        // Session expires after 24 hours
        if (hoursSinceAuth < 24) {
          setIsAuthenticated(true);
        } else {
          // Session expired, clear auth
          logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('is-todo-authenticated');
    localStorage.removeItem('is-todo-auth-timestamp');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}

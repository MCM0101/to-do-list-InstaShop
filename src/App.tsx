import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TodoProvider } from '@/hooks/use-todos';
import { SelectedDateProvider } from '@/hooks/use-selected-date';
import { useAuth } from '@/hooks/useAuth';
import HomePage from '@/pages/HomePage';
import ProcessPage from '@/pages/ProcessPage';
import NotFoundPage from '@/pages/NotFoundPage';
import LoginPage from '@/pages/LoginPage';

function App() {
  const { isAuthenticated, isLoading, login } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  // Show main app if authenticated
  return (
    <SelectedDateProvider>
      <TodoProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/process/:id" element={<ProcessPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </TodoProvider>
    </SelectedDateProvider>
  );
}

export default App;


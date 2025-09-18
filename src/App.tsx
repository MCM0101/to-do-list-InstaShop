import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TodoProvider } from '@/hooks/use-todos';
import { SelectedDateProvider } from '@/hooks/use-selected-date';
import HomePage from '@/pages/HomePage';
import ProcessPage from '@/pages/ProcessPage';
import NotFoundPage from '@/pages/NotFoundPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TodoProvider } from '@/hooks/use-todos';
import { SelectedDateProvider } from '@/hooks/use-selected-date';
import HomePage from '@/pages/HomePage';
import ProcessPage from '@/pages/ProcessPage';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
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


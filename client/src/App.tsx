import { BrowserRouter, Route, Routes } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';
import CreateMonitor from './pages/CreateMonitor';
import Dashboard from './pages/Dashboard';
import EditMonitor from './pages/EditMonitor';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/monitors/new"
          element={
            <ProtectedRoute>
              <CreateMonitor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monitors/:id/edit"
          element={
            <ProtectedRoute>
              <EditMonitor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

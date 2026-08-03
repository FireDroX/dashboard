import { BrowserRouter, Route, Routes } from 'react-router';
import CreateMonitor from './pages/CreateMonitor';
import Dashboard from './pages/Dashboard';
import EditMonitor from './pages/EditMonitor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/monitors/new" element={<CreateMonitor />} />
        <Route path="/monitors/:id/edit" element={<EditMonitor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

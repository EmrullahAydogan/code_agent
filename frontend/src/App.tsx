import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AgentsPage } from './pages/AgentsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AgentDetailPage } from './pages/AgentDetailPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { WebSocketProvider } from './providers/WebSocketProvider';

function App() {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/agents" replace />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="agents/:id" element={<AgentDetailPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AgentsPage } from './pages/AgentsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AgentDetailPage } from './pages/AgentDetailPage';
import { AgentChatPage } from './pages/AgentChatPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { CodeReviewsPage } from './pages/CodeReviewsPage';
import { TestingPage } from './pages/TestingPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { PluginsPage } from './pages/PluginsPage';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { ToastProvider } from './providers/ToastProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <WebSocketProvider>
            <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/agents" replace />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="agents/:id" element={<AgentDetailPage />} />
            <Route path="agents/:id/chat" element={<AgentChatPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="workflows" element={<WorkflowsPage />} />
            <Route path="code-reviews" element={<CodeReviewsPage />} />
            <Route path="testing" element={<TestingPage />} />
            <Route path="knowledge" element={<KnowledgeBasePage />} />
            <Route path="plugins" element={<PluginsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
          </BrowserRouter>
        </WebSocketProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

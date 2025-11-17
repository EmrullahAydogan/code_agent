import axios from 'axios';
import {
  Agent,
  CreateAgentRequest,
  UpdateAgentRequest,
  Task,
  ExecuteTaskRequest,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ApiResponse,
  Conversation,
  CreateConversationRequest,
  Message,
  AgentTemplate,
  CreateAgentFromTemplate,
  AgentMetrics,
  TokenUsage,
  Workflow,
  WorkflowStep,
  CodeReview,
  TestSuite,
  TestCase,
  KnowledgeBase,
  SearchResult,
  Plugin,
} from '@local-code-agent/shared';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agents
export const agentsApi = {
  getAll: () => api.get<ApiResponse<Agent[]>>('/agents'),
  getById: (id: string) => api.get<ApiResponse<Agent>>(`/agents/${id}`),
  create: (data: CreateAgentRequest) => api.post<ApiResponse<Agent>>('/agents', data),
  update: (id: string, data: UpdateAgentRequest) =>
    api.put<ApiResponse<Agent>>(`/agents/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/agents/${id}`),
};

// Tasks
export const tasksApi = {
  getAll: (params?: { agentId?: string; projectId?: string; status?: string }) =>
    api.get<ApiResponse<Task[]>>('/tasks', { params }),
  getById: (id: string) => api.get<ApiResponse<Task>>(`/tasks/${id}`),
  execute: (agentId: string, data: ExecuteTaskRequest) =>
    api.post<ApiResponse<Task>>('/tasks/execute', { agentId, ...data }),
  cancel: (id: string) => api.post<ApiResponse<Task>>(`/tasks/${id}/cancel`),
};

// Projects
export const projectsApi = {
  getAll: () => api.get<ApiResponse<Project[]>>('/projects'),
  getById: (id: string) => api.get<ApiResponse<Project>>(`/projects/${id}`),
  create: (data: CreateProjectRequest) => api.post<ApiResponse<Project>>('/projects', data),
  update: (id: string, data: UpdateProjectRequest) =>
    api.put<ApiResponse<Project>>(`/projects/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/projects/${id}`),
  getFiles: (id: string) => api.get<ApiResponse<any[]>>(`/projects/${id}/files`),
};

// Settings
export const settingsApi = {
  getAll: () => api.get<ApiResponse<any>>('/settings'),
  getByKey: (key: string) => api.get<ApiResponse<{ key: string; value: any }>>(`/settings/${key}`),
  update: (key: string, value: any) => api.put<ApiResponse<{ key: string; value: any }>>(`/settings/${key}`, { value }),
  updateBulk: (settings: Record<string, any>) => api.post<ApiResponse<any>>('/settings/bulk', settings),
};

// Conversations
export const conversationsApi = {
  getAll: (params?: { agentId?: string; projectId?: string }) =>
    api.get<ApiResponse<Conversation[]>>('/conversations', { params }),
  getById: (id: string) => api.get<ApiResponse<Conversation>>(`/conversations/${id}`),
  create: (data: CreateConversationRequest) =>
    api.post<ApiResponse<Conversation>>('/conversations', data),
  update: (id: string, data: { title: string }) =>
    api.put<ApiResponse<Conversation>>(`/conversations/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/conversations/${id}`),
  addMessage: (conversationId: string, message: Partial<Message>) =>
    api.post<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, message),
};

// Templates
export const templatesApi = {
  getAll: (params?: { category?: string; search?: string }) =>
    api.get<ApiResponse<AgentTemplate[]>>('/templates', { params }),
  getById: (id: string) => api.get<ApiResponse<AgentTemplate>>(`/templates/${id}`),
  createAgent: (templateId: string, data: CreateAgentFromTemplate) =>
    api.post<ApiResponse<Agent>>(`/templates/${templateId}/create-agent`, data),
  getCategories: () => api.get<ApiResponse<string[]>>('/templates/meta/categories'),
};

// Analytics
export const analyticsApi = {
  getAgentMetrics: (agentId: string) =>
    api.get<ApiResponse<AgentMetrics>>(`/analytics/agents/${agentId}`),
  getTokenUsage: (params?: {
    agentId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => api.get<ApiResponse<TokenUsage[]>>('/analytics/token-usage', { params }),
  getPlatformStats: () => api.get<ApiResponse<any>>('/analytics/platform/stats'),
  getAgentTimeline: (agentId: string, days?: number) =>
    api.get<ApiResponse<any[]>>(`/analytics/agents/${agentId}/timeline`, {
      params: { days },
    }),
  getCostBreakdown: (params?: {
    agentId?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get<ApiResponse<any[]>>('/analytics/cost-breakdown', { params }),
};

// Workflows
export const workflowsApi = {
  getAll: (params?: { projectId?: string; status?: string }) =>
    api.get<ApiResponse<Workflow[]>>('/workflows', { params }),
  getById: (id: string) => api.get<ApiResponse<Workflow>>(`/workflows/${id}`),
  create: (data: {
    name: string;
    description?: string;
    type: string;
    steps: WorkflowStep[];
    projectId?: string;
  }) => api.post<ApiResponse<Workflow>>('/workflows', data),
  execute: (id: string) => api.post<ApiResponse<Workflow>>(`/workflows/${id}/execute`),
  cancel: (id: string) => api.post<ApiResponse<Workflow>>(`/workflows/${id}/cancel`),
};

// Code Reviews
export const codeReviewsApi = {
  getAll: (params?: { projectId?: string; agentId?: string }) =>
    api.get<ApiResponse<CodeReview[]>>('/code-reviews', { params }),
  getById: (id: string) => api.get<ApiResponse<CodeReview>>(`/code-reviews/${id}`),
  create: (data: {
    agentId: string;
    projectId: string;
    files?: string[];
    focus?: string[];
  }) => api.post<ApiResponse<CodeReview>>('/code-reviews', data),
  getStats: (projectId: string) =>
    api.get<ApiResponse<any>>(`/code-reviews/stats/${projectId}`),
};

// Testing
export const testingApi = {
  getAll: (params?: { projectId?: string; status?: string }) =>
    api.get<ApiResponse<TestSuite[]>>('/testing', { params }),
  getById: (id: string) => api.get<ApiResponse<TestSuite>>(`/testing/${id}`),
  create: (data: {
    agentId: string;
    projectId: string;
    name: string;
    description?: string;
    filePath?: string;
    testCases?: TestCase[];
    autoGenerate?: boolean;
  }) => api.post<ApiResponse<TestSuite>>('/testing', data),
  run: (id: string) => api.post<ApiResponse<TestSuite>>(`/testing/${id}/run`),
};

// Knowledge Bases
export const knowledgeBasesApi = {
  getAll: (params?: { projectId?: string }) =>
    api.get<ApiResponse<KnowledgeBase[]>>('/knowledge-bases', { params }),
  getById: (id: string) => api.get<ApiResponse<KnowledgeBase>>(`/knowledge-bases/${id}`),
  create: (data: {
    name: string;
    description?: string;
    projectId?: string;
  }) => api.post<ApiResponse<KnowledgeBase>>('/knowledge-bases', data),
  index: (id: string, data: { files?: string[] }) =>
    api.post<ApiResponse<KnowledgeBase>>(`/knowledge-bases/${id}/index`, data),
  search: (id: string, data: { query: string; limit?: number }) =>
    api.post<ApiResponse<SearchResult[]>>(`/knowledge-bases/${id}/search`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/knowledge-bases/${id}`),
};

// Plugins
export const pluginsApi = {
  getAll: (params?: { enabled?: boolean; type?: string }) =>
    api.get<ApiResponse<Plugin[]>>('/plugins', { params }),
  getById: (id: string) => api.get<ApiResponse<Plugin>>(`/plugins/${id}`),
  install: (data: {
    name: string;
    description?: string;
    version: string;
    type: string;
    author?: string;
    config?: any;
    permissions?: string[];
  }) => api.post<ApiResponse<Plugin>>('/plugins', data),
  toggle: (id: string) => api.post<ApiResponse<Plugin>>(`/plugins/${id}/toggle`),
  delete: (id: string) => api.delete<ApiResponse>(`/plugins/${id}`),
};

export default api;

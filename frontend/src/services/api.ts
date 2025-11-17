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

export default api;

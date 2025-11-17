// AI Provider Types
export enum AIProvider {
  CLAUDE = 'claude',
  OPENAI = 'openai',
  GEMINI = 'gemini',
  DEEPSEEK = 'deepseek',
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

// Agent Types
export enum AgentStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  ERROR = 'error',
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  providerConfig: AIProviderConfig;
  systemPrompt?: string;
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  providerConfig: AIProviderConfig;
  systemPrompt?: string;
  projectId?: string;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  providerConfig?: Partial<AIProviderConfig>;
  systemPrompt?: string;
  status?: AgentStatus;
  projectId?: string;
}

// Task Types
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface Task {
  id: string;
  agentId: string;
  projectId?: string;
  prompt: string;
  status: TaskStatus;
  result?: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface ExecuteTaskRequest {
  prompt: string;
  projectId?: string;
  context?: Record<string, any>;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  path: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  path?: string;
}

// Message Types for WebSocket
export enum WebSocketEventType {
  AGENT_CREATED = 'agent:created',
  AGENT_UPDATED = 'agent:updated',
  AGENT_DELETED = 'agent:deleted',
  AGENT_STATUS_CHANGED = 'agent:status_changed',
  TASK_STARTED = 'task:started',
  TASK_PROGRESS = 'task:progress',
  TASK_COMPLETED = 'task:completed',
  TASK_FAILED = 'task:failed',
  TASK_CANCELLED = 'task:cancelled',
}

export interface WebSocketEvent<T = any> {
  type: WebSocketEventType;
  payload: T;
  timestamp: Date;
}

// Settings Types
export interface SystemSettings {
  defaultProvider: AIProvider;
  defaultModel: string;
  maxConcurrentTasks: number;
  autoSaveInterval: number;
  theme: 'light' | 'dark' | 'system';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// AI Provider Message Types
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  model: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

// Tool Types (for agents to use tools like file operations, etc.)
export enum ToolType {
  READ_FILE = 'read_file',
  WRITE_FILE = 'write_file',
  LIST_FILES = 'list_files',
  EXECUTE_COMMAND = 'execute_command',
  SEARCH_CODE = 'search_code',
}

export interface Tool {
  type: ToolType;
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface ToolCall {
  id: string;
  type: ToolType;
  arguments: Record<string, any>;
}

export interface ToolResult {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
}

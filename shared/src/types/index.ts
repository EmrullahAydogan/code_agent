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
  EDIT_FILE = 'edit_file',
  DELETE_FILE = 'delete_file',
  LIST_FILES = 'list_files',
  SEARCH_FILES = 'search_files',
  SEARCH_CODE = 'search_code',
  EXECUTE_COMMAND = 'execute_command',
  GIT_STATUS = 'git_status',
  GIT_DIFF = 'git_diff',
  GIT_COMMIT = 'git_commit',
  GIT_PUSH = 'git_push',
  GIT_PULL = 'git_pull',
  CREATE_DIRECTORY = 'create_directory',
  MOVE_FILE = 'move_file',
  COPY_FILE = 'copy_file',
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

// Conversation Types
export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  createdAt: Date;
}

export interface Conversation {
  id: string;
  agentId: string;
  projectId?: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConversationRequest {
  agentId: string;
  projectId?: string;
  title?: string;
}

// Enhanced Task with Conversation
export interface TaskWithConversation extends Task {
  conversationId?: string;
  toolCallsUsed?: number;
  filesModified?: string[];
}

// File Operation Types
export interface FileContent {
  path: string;
  content: string;
  language?: string;
  size: number;
  lastModified: Date;
}

export interface FileSearchResult {
  path: string;
  line: number;
  column: number;
  match: string;
  context: string;
}

export interface DirectoryListing {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
  children?: DirectoryListing[];
}

// Git Types
export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: string[];
  unstaged: string[];
  untracked: string[];
}

export interface GitCommit {
  hash: string;
  author: string;
  date: Date;
  message: string;
}

export interface GitDiff {
  file: string;
  additions: number;
  deletions: number;
  changes: string;
}

// Terminal Types
export interface CommandExecution {
  id: string;
  command: string;
  workingDirectory: string;
  status: 'running' | 'completed' | 'failed';
  output: string;
  error?: string;
  exitCode?: number;
  startedAt: Date;
  completedAt?: Date;
}

// Analytics Types
export interface AgentMetrics {
  agentId: string;
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  lastActive: Date;
}

export interface TokenUsage {
  id: string;
  agentId: string;
  taskId: string;
  provider: AIProvider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  createdAt: Date;
}

// Agent Template Types
export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  providerConfig: Omit<AIProviderConfig, 'apiKey'>;
  systemPrompt: string;
  tags: string[];
  author?: string;
  downloads: number;
  rating: number;
  createdAt: Date;
}

export interface CreateAgentFromTemplate {
  templateId: string;
  name: string;
  apiKey: string;
  projectId?: string;
}

// Multi-Agent Collaboration Types
export enum WorkflowType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  CONDITIONAL = 'conditional',
  LOOP = 'loop',
}

export enum WorkflowStepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  name: string;
  prompt: string;
  status: WorkflowStepStatus;
  result?: string;
  error?: string;
  dependsOn?: string[]; // Step IDs that must complete first
  condition?: string; // JavaScript expression for conditional execution
  startedAt?: Date;
  completedAt?: Date;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  type: WorkflowType;
  steps: WorkflowStep[];
  projectId?: string;
  createdBy: string; // Agent ID that created the workflow
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStepIndex?: number;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  type: WorkflowType;
  steps: Omit<WorkflowStep, 'id' | 'status' | 'startedAt' | 'completedAt'>[];
  projectId?: string;
}

export interface AgentCommunication {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  message: string;
  context?: Record<string, any>;
  replyTo?: string; // Message ID this is replying to
  createdAt: Date;
  readAt?: Date;
}

export interface AgentDelegation {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  taskId: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  result?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Plugin System Types
export enum PluginType {
  TOOL = 'tool',
  PROVIDER = 'provider',
  INTEGRATION = 'integration',
  UI = 'ui',
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  type: PluginType;
  author: string;
  enabled: boolean;
  config?: Record<string, any>;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  type: PluginType;
  main: string; // Entry point file
  permissions: string[];
  dependencies?: Record<string, string>;
  config?: {
    schema: Record<string, any>;
    defaults: Record<string, any>;
  };
}

// Code Review Types
export enum ReviewSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface CodeReviewIssue {
  id: string;
  file: string;
  line: number;
  column?: number;
  severity: ReviewSeverity;
  category: string; // 'security', 'performance', 'bug', 'style', etc.
  message: string;
  suggestion?: string;
  code?: string; // The problematic code snippet
}

export interface CodeReview {
  id: string;
  agentId: string;
  projectId: string;
  files: string[];
  issues: CodeReviewIssue[];
  summary: string;
  score: number; // 0-100
  createdAt: Date;
}

export interface CreateCodeReviewRequest {
  agentId: string;
  projectId: string;
  files?: string[]; // If not specified, review all files
  focus?: string[]; // Focus areas: ['security', 'performance', 'bugs']
}

// Testing Types
export interface TestCase {
  id: string;
  name: string;
  description?: string;
  code: string;
  expectedOutput?: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  error?: string;
  duration?: number;
  createdAt: Date;
  runAt?: Date;
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  agentId: string;
  testCases: TestCase[];
  coverage?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface CreateTestSuiteRequest {
  name: string;
  description?: string;
  projectId: string;
  agentId: string;
  filePath?: string; // Generate tests for specific file
  autoGenerate?: boolean; // Auto-generate tests
}

// RAG (Retrieval Augmented Generation) Types
export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    file: string;
    startLine: number;
    endLine: number;
    language?: string;
    [key: string]: any;
  };
  embedding?: number[];
  createdAt: Date;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  documents: number;
  chunks: number;
  indexed: boolean;
  indexedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchQuery {
  query: string;
  limit?: number;
  filter?: Record<string, any>;
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
  distance?: number;
}

export interface CreateKnowledgeBaseRequest {
  name: string;
  description?: string;
  projectId: string;
  files?: string[]; // Specific files to index
  autoIndex?: boolean;
}

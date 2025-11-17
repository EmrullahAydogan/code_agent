import { useState } from 'react';
import { Book, ChevronDown, ChevronRight, Copy, Check, Search } from 'lucide-react';
import clsx from 'clsx';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    location: 'path' | 'query' | 'body';
  }>;
  requestBody?: {
    type: string;
    example: any;
  };
  responses: Array<{
    status: number;
    description: string;
    example: any;
  }>;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // Health
  {
    method: 'GET',
    path: '/api/health',
    description: 'Get system health status',
    category: 'System',
    responses: [
      {
        status: 200,
        description: 'Health check successful',
        example: {
          status: 'healthy',
          database: { status: 'connected', agents: 5, projects: 3, tasks: 12 },
          providers: { configured: 4, gemini: true, deepseek: true, claude: true, openai: true },
          system: { nodeVersion: 'v18.0.0', platform: 'linux', memory: 1024 }
        }
      }
    ]
  },
  // Agents
  {
    method: 'GET',
    path: '/api/agents',
    description: 'List all agents',
    category: 'Agents',
    responses: [
      {
        status: 200,
        description: 'List of agents',
        example: {
          success: true,
          data: [
            { id: '1', name: 'Code Assistant', provider: 'gemini', status: 'active' }
          ]
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/api/agents',
    description: 'Create a new agent',
    category: 'Agents',
    requestBody: {
      type: 'CreateAgentRequest',
      example: {
        name: 'Code Assistant',
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        systemPrompt: 'You are a helpful coding assistant',
        temperature: 0.7
      }
    },
    responses: [
      {
        status: 201,
        description: 'Agent created successfully',
        example: {
          success: true,
          data: { id: '1', name: 'Code Assistant', provider: 'gemini' }
        }
      }
    ]
  },
  {
    method: 'GET',
    path: '/api/agents/:id',
    description: 'Get agent by ID',
    category: 'Agents',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Agent ID', location: 'path' }
    ],
    responses: [
      {
        status: 200,
        description: 'Agent details',
        example: {
          success: true,
          data: { id: '1', name: 'Code Assistant', provider: 'gemini' }
        }
      }
    ]
  },
  {
    method: 'PUT',
    path: '/api/agents/:id',
    description: 'Update agent',
    category: 'Agents',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Agent ID', location: 'path' }
    ],
    requestBody: {
      type: 'UpdateAgentRequest',
      example: {
        name: 'Updated Agent',
        systemPrompt: 'New system prompt',
        temperature: 0.8
      }
    },
    responses: [
      {
        status: 200,
        description: 'Agent updated',
        example: { success: true, data: { id: '1', name: 'Updated Agent' } }
      }
    ]
  },
  {
    method: 'DELETE',
    path: '/api/agents/:id',
    description: 'Delete agent',
    category: 'Agents',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Agent ID', location: 'path' }
    ],
    responses: [
      {
        status: 200,
        description: 'Agent deleted',
        example: { success: true }
      }
    ]
  },
  // Projects
  {
    method: 'GET',
    path: '/api/projects',
    description: 'List all projects',
    category: 'Projects',
    responses: [
      {
        status: 200,
        description: 'List of projects',
        example: {
          success: true,
          data: [
            { id: '1', name: 'My Project', path: '/path/to/project', language: 'typescript' }
          ]
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/api/projects',
    description: 'Create a new project',
    category: 'Projects',
    requestBody: {
      type: 'CreateProjectRequest',
      example: {
        name: 'My Project',
        path: '/path/to/project',
        language: 'typescript',
        description: 'A TypeScript project'
      }
    },
    responses: [
      {
        status: 201,
        description: 'Project created',
        example: { success: true, data: { id: '1', name: 'My Project' } }
      }
    ]
  },
  // Tasks
  {
    method: 'GET',
    path: '/api/tasks',
    description: 'List all tasks',
    category: 'Tasks',
    parameters: [
      { name: 'agentId', type: 'string', required: false, description: 'Filter by agent', location: 'query' },
      { name: 'status', type: 'string', required: false, description: 'Filter by status', location: 'query' }
    ],
    responses: [
      {
        status: 200,
        description: 'List of tasks',
        example: {
          success: true,
          data: [
            { id: '1', title: 'Generate tests', status: 'completed', agentId: '1' }
          ]
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/api/tasks',
    description: 'Create a new task',
    category: 'Tasks',
    requestBody: {
      type: 'CreateTaskRequest',
      example: {
        agentId: '1',
        title: 'Generate unit tests',
        description: 'Generate tests for utils module',
        type: 'code_generation',
        context: { files: ['utils.ts'] }
      }
    },
    responses: [
      {
        status: 201,
        description: 'Task created',
        example: { success: true, data: { id: '1', title: 'Generate unit tests', status: 'pending' } }
      }
    ]
  },
];

export const ApiDocsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({});
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleEndpoint = (path: string) => {
    setExpandedEndpoints(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'POST': return 'bg-green-100 text-green-700 border-green-200';
      case 'PUT': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'PATCH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredEndpoints = API_ENDPOINTS.filter(endpoint =>
    endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedEndpoints = filteredEndpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = [];
    }
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {} as Record<string, ApiEndpoint[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Book className="w-8 h-8 text-blue-600" />
          API Documentation
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Complete REST API reference for Local Code Agent
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search endpoints..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Endpoints by Category */}
      <div className="space-y-4">
        {Object.entries(groupedEndpoints).map(([category, endpoints]) => (
          <div key={category} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedCategories[category] ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {category}
                </h2>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                  {endpoints.length} endpoints
                </span>
              </div>
            </button>

            {/* Endpoints List */}
            {expandedCategories[category] && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    {/* Endpoint Header */}
                    <button
                      onClick={() => toggleEndpoint(endpoint.path)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={clsx(
                          'px-2 py-1 text-xs font-mono font-semibold rounded border',
                          getMethodColor(endpoint.method)
                        )}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                          {endpoint.path}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyPath(endpoint.path);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          {copiedPath === endpoint.path ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {endpoint.description}
                      </p>
                    </button>

                    {/* Endpoint Details */}
                    {expandedEndpoints[endpoint.path] && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 space-y-4">
                        {/* Parameters */}
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Parameters
                            </h4>
                            <div className="space-y-2">
                              {endpoint.parameters.map((param, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm">
                                  <code className="text-blue-600 dark:text-blue-400 font-mono">
                                    {param.name}
                                  </code>
                                  <span className="text-gray-500">({param.type})</span>
                                  {param.required && (
                                    <span className="text-red-500 text-xs">required</span>
                                  )}
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {param.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Request Body */}
                        {endpoint.requestBody && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Request Body
                            </h4>
                            <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                              <code>{JSON.stringify(endpoint.requestBody.example, null, 2)}</code>
                            </pre>
                          </div>
                        )}

                        {/* Responses */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Responses
                          </h4>
                          {endpoint.responses.map((response, i) => (
                            <div key={i} className="mb-3 last:mb-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={clsx(
                                  'px-2 py-1 text-xs font-semibold rounded',
                                  response.status < 300 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                )}>
                                  {response.status}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {response.description}
                                </span>
                              </div>
                              <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                                <code>{JSON.stringify(response.example, null, 2)}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

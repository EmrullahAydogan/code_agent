import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Loader } from 'lucide-react';
import { agentsApi, tasksApi } from '../services/api';
import { Task, TaskStatus, WebSocketEventType } from '@local-code-agent/shared';
import { useWebSocket } from '../providers/WebSocketProvider';
import clsx from 'clsx';

export const AgentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();
  const [prompt, setPrompt] = useState('');

  const { data: agentResponse } = useQuery({
    queryKey: ['agents', id],
    queryFn: async () => {
      const response = await agentsApi.getById(id!);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: tasksResponse, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const response = await tasksApi.getAll({ agentId: id });
      return response.data;
    },
    enabled: !!id,
  });

  const executeMutation = useMutation({
    mutationFn: (prompt: string) => tasksApi.execute(id!, { prompt }),
    onSuccess: () => {
      setPrompt('');
      refetchTasks();
    },
  });

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribers = [
      subscribe(WebSocketEventType.TASK_STARTED, () => refetchTasks()),
      subscribe(WebSocketEventType.TASK_PROGRESS, () => refetchTasks()),
      subscribe(WebSocketEventType.TASK_COMPLETED, () => refetchTasks()),
      subscribe(WebSocketEventType.TASK_FAILED, () => refetchTasks()),
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [subscribe, refetchTasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      executeMutation.mutate(prompt);
    }
  };

  const agent = agentResponse?.data;
  const tasks = tasksResponse?.data || [];

  if (!agent) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <button
          onClick={() => navigate('/agents')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
          {agent.description && (
            <p className="text-sm text-gray-500 mt-1">{agent.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="font-medium">{agent.providerConfig.provider}</span>
            <span>•</span>
            <span>{agent.providerConfig.model}</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-4">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No tasks yet. Send a prompt to get started.</p>
          </div>
        ) : (
          tasks.map((task: Task) => (
            <div key={task.id} className="space-y-2">
              {/* User prompt */}
              <div className="flex justify-end">
                <div className="max-w-3xl bg-blue-600 text-white rounded-lg px-4 py-3">
                  <p className="text-sm">{task.prompt}</p>
                </div>
              </div>

              {/* Assistant response */}
              {task.status === TaskStatus.RUNNING ? (
                <div className="flex items-start gap-3">
                  <div className="flex-1 max-w-3xl bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                    {task.result && (
                      <p className="text-sm text-gray-900 mt-2 whitespace-pre-wrap">
                        {typeof task.result === 'string' ? task.result : JSON.stringify(task.result, null, 2)}
                      </p>
                    )}
                  </div>
                </div>
              ) : task.status === TaskStatus.COMPLETED ? (
                <div className="flex items-start gap-3">
                  <div className="flex-1 max-w-3xl bg-gray-100 rounded-lg px-4 py-3">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {typeof task.result === 'string' ? task.result : JSON.stringify(task.result, null, 2)}
                    </p>
                  </div>
                </div>
              ) : task.status === TaskStatus.FAILED ? (
                <div className="flex items-start gap-3">
                  <div className="flex-1 max-w-3xl bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-red-700">
                      Error: {task.error}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask the agent to do something..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={executeMutation.isPending}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || executeMutation.isPending}
              className={clsx(
                'px-6 py-3 rounded-lg transition-colors flex items-center gap-2',
                !prompt.trim() || executeMutation.isPending
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              {executeMutation.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

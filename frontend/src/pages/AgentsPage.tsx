import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Play, Square } from 'lucide-react';
import { agentsApi } from '../services/api';
import { Agent, AgentStatus, AIProvider } from '@local-code-agent/shared';
import { CreateAgentModal } from '../components/CreateAgentModal';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export const AgentsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: agentsResponse, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await agentsApi.getAll();
      return response.data;
    },
  });

  const deleteAgent = useMutation({
    mutationFn: (id: string) => agentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const agents = agentsResponse?.data || [];

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.RUNNING:
        return 'text-green-700 bg-green-50 border-green-200';
      case AgentStatus.IDLE:
        return 'text-gray-700 bg-gray-50 border-gray-200';
      case AgentStatus.ERROR:
        return 'text-red-700 bg-red-50 border-red-200';
      case AgentStatus.PAUSED:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your AI agents and their configurations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Agent
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading agents...</div>
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
          <Bot className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first agent to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent: Agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/agents/${agent.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {agent.name}
                  </h3>
                  {agent.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {agent.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this agent?')) {
                      deleteAgent.mutate(agent.id);
                    }
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className={clsx(
                  'inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium border',
                  getStatusColor(agent.status)
                )}>
                  {agent.status === AgentStatus.RUNNING ? (
                    <Square className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  {agent.status}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{agent.providerConfig.provider}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{agent.providerConfig.model}</span>
                </div>

                <div className="text-xs text-gray-400">
                  Created {new Date(agent.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ['agents'] });
          }}
        />
      )}
    </div>
  );
};

const Bot = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    />
  </svg>
);

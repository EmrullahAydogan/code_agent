import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GitBranch,
  Play,
  StopCircle,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Workflow as WorkflowIcon
} from 'lucide-react';
import clsx from 'clsx';
import { workflowsApi } from '../services/api';
import { Workflow, WorkflowStatus, WorkflowType } from '@local-code-agent/shared';

export const WorkflowsPage = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const response = await workflowsApi.getAll();
      return response.data.data;
    },
  });

  const executeMutation = useMutation({
    mutationFn: (workflowId: string) => workflowsApi.execute(workflowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (workflowId: string) => workflowsApi.cancel(workflowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.PENDING:
        return <Clock className="w-4 h-4 text-gray-400" />;
      case WorkflowStatus.RUNNING:
        return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
      case WorkflowStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case WorkflowStatus.FAILED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case WorkflowStatus.CANCELLED:
        return <StopCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.PENDING:
        return 'bg-gray-100 text-gray-700';
      case WorkflowStatus.RUNNING:
        return 'bg-blue-100 text-blue-700';
      case WorkflowStatus.COMPLETED:
        return 'bg-green-100 text-green-700';
      case WorkflowStatus.FAILED:
        return 'bg-red-100 text-red-700';
      case WorkflowStatus.CANCELLED:
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: WorkflowType) => {
    switch (type) {
      case WorkflowType.SEQUENTIAL:
        return '→';
      case WorkflowType.PARALLEL:
        return '⫸';
      case WorkflowType.CONDITIONAL:
        return '⑂';
      case WorkflowType.LOOP:
        return '↻';
      default:
        return '→';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
            <p className="mt-2 text-gray-600">
              Orchestrate multi-agent workflows with dependencies
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Workflow
          </button>
        </div>
      </div>

      {/* Workflows Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading workflows...</p>
        </div>
      ) : workflows && workflows.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedWorkflow(workflow)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <WorkflowIcon className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {workflow.name}
                    </h3>
                    <span className="text-2xl" title={workflow.type}>
                      {getTypeIcon(workflow.type)}
                    </span>
                    <div className={clsx(
                      'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
                      getStatusColor(workflow.status)
                    )}>
                      {getStatusIcon(workflow.status)}
                      {workflow.status}
                    </div>
                  </div>

                  {workflow.description && (
                    <p className="mt-2 text-gray-600">{workflow.description}</p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-4 h-4" />
                      {workflow.steps.length} steps
                    </div>
                    {workflow.currentStep !== undefined && (
                      <div>
                        Current: Step {workflow.currentStep + 1}
                      </div>
                    )}
                    <div>
                      Created: {new Date(workflow.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Steps Preview */}
                  <div className="mt-4 flex gap-2 overflow-x-auto">
                    {workflow.steps.slice(0, 5).map((step, idx) => (
                      <div
                        key={idx}
                        className={clsx(
                          'px-3 py-1 rounded text-xs font-medium whitespace-nowrap',
                          idx === workflow.currentStep
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : step.status === 'completed'
                            ? 'bg-green-50 text-green-700'
                            : step.status === 'failed'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-50 text-gray-700'
                        )}
                      >
                        {step.name}
                      </div>
                    ))}
                    {workflow.steps.length > 5 && (
                      <div className="px-3 py-1 text-xs text-gray-500">
                        +{workflow.steps.length - 5} more
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {workflow.status === WorkflowStatus.PENDING && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        executeMutation.mutate(workflow.id);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Execute Workflow"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  )}
                  {workflow.status === WorkflowStatus.RUNNING && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelMutation.mutate(workflow.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel Workflow"
                    >
                      <StopCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {workflow.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{workflow.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <WorkflowIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first multi-agent workflow to get started
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Workflow
          </button>
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Workflow</h2>
            <p className="text-gray-600 mb-4">
              Workflow creation form will be implemented here
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

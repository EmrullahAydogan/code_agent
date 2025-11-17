import { useState } from 'react';
import { useMutation, useNavigate } from '@tanstack/react-query';
import { X, Sparkles } from 'lucide-react';
import { templatesApi } from '../services/api';
import { AgentTemplate } from '@local-code-agent/shared';

interface Props {
  template: AgentTemplate;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAgentFromTemplateModal: React.FC<Props> = ({
  template,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(template.name);
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');

  const createMutation = useMutation({
    mutationFn: () =>
      templatesApi.createAgent(template.id, {
        templateId: template.id,
        name,
        apiKey,
        projectId: projectId || undefined,
      }),
    onSuccess: (response) => {
      onSuccess();
      // Navigate to the new agent
      if (response.data.data) {
        window.location.href = `/agents/${response.data.data.id}`;
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Create from Template: {template.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Template Info */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-900 mb-2">{template.description}</p>
            <div className="flex gap-2 flex-wrap">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-white text-purple-700 rounded text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Agent Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={template.name}
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key for {template.providerConfig.provider} *
              </label>
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="sk-..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Your API key will be stored securely and only used by this agent
              </p>
            </div>

            {/* Template Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Template Configuration</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Provider:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {template.providerConfig.provider}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Model:</span>
                  <span className="ml-2 font-medium text-gray-900 text-xs">
                    {template.providerConfig.model}
                  </span>
                </div>
              </div>
            </div>

            {/* System Prompt Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Prompt
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
                <p className="text-xs text-gray-600 whitespace-pre-wrap">
                  {template.systemPrompt}
                </p>
              </div>
            </div>

            {/* Error */}
            {createMutation.isError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                Failed to create agent. Please check your API key and try again.
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {createMutation.isPending ? 'Creating...' : 'Create Agent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

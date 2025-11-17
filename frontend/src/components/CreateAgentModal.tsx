import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { agentsApi } from '../services/api';
import { AIProvider, CreateAgentRequest } from '@local-code-agent/shared';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const MODELS = {
  [AIProvider.CLAUDE]: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
  ],
  [AIProvider.OPENAI]: [
    'gpt-4-turbo-preview',
    'gpt-4',
    'gpt-3.5-turbo',
  ],
  [AIProvider.GEMINI]: [
    'gemini-pro',
    'gemini-pro-vision',
  ],
  [AIProvider.DEEPSEEK]: [
    'deepseek-chat',
    'deepseek-coder',
  ],
};

export const CreateAgentModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateAgentRequest>({
    name: '',
    description: '',
    providerConfig: {
      provider: AIProvider.CLAUDE,
      apiKey: '',
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4096,
      temperature: 0.7,
    },
    systemPrompt: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAgentRequest) => agentsApi.create(data),
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const updateProviderConfig = (updates: Partial<typeof formData.providerConfig>) => {
    setFormData(prev => ({
      ...prev,
      providerConfig: { ...prev.providerConfig, ...updates }
    }));
  };

  const handleProviderChange = (provider: AIProvider) => {
    const defaultModel = MODELS[provider][0];
    updateProviderConfig({ provider, model: defaultModel });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Agent</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Code Agent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="A helpful agent for coding tasks"
              rows={2}
            />
          </div>

          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Provider *
            </label>
            <select
              required
              value={formData.providerConfig.provider}
              onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={AIProvider.CLAUDE}>Claude (Anthropic)</option>
              <option value={AIProvider.OPENAI}>ChatGPT (OpenAI)</option>
              <option value={AIProvider.GEMINI}>Gemini (Google)</option>
              <option value={AIProvider.DEEPSEEK}>DeepSeek</option>
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <select
              required
              value={formData.providerConfig.model}
              onChange={(e) => updateProviderConfig({ model: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {MODELS[formData.providerConfig.provider].map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key *
            </label>
            <input
              type="password"
              required
              value={formData.providerConfig.apiKey}
              onChange={(e) => updateProviderConfig({ apiKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="sk-..."
            />
          </div>

          {/* Advanced Settings */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
              Advanced Settings
            </summary>
            <div className="p-4 space-y-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={formData.providerConfig.maxTokens}
                  onChange={(e) => updateProviderConfig({ maxTokens: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature ({formData.providerConfig.temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.providerConfig.temperature}
                  onChange={(e) => updateProviderConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Prompt
                </label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="You are a helpful coding assistant..."
                  rows={4}
                />
              </div>
            </div>
          </details>

          {/* Error */}
          {createMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              Failed to create agent. Please try again.
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

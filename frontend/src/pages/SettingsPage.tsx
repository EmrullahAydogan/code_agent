import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { settingsApi } from '../services/api';
import { AIProvider } from '@local-code-agent/shared';
import { useState, useEffect } from 'react';

export const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    defaultProvider: AIProvider.CLAUDE,
    defaultModel: 'claude-3-5-sonnet-20241022',
    maxConcurrentTasks: 5,
    autoSaveInterval: 30000,
    theme: 'system',
  });

  const { data: settingsResponse } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await settingsApi.getAll();
      return response.data;
    },
  });

  useEffect(() => {
    if (settingsResponse?.data) {
      setSettings(settingsResponse.data);
    }
  }, [settingsResponse]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof settings) => settingsApi.updateBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(settings);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure default settings and preferences
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Default Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default AI Provider
            </label>
            <select
              value={settings.defaultProvider}
              onChange={(e) => setSettings({ ...settings, defaultProvider: e.target.value as AIProvider })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={AIProvider.CLAUDE}>Claude (Anthropic)</option>
              <option value={AIProvider.OPENAI}>ChatGPT (OpenAI)</option>
              <option value={AIProvider.GEMINI}>Gemini (Google)</option>
              <option value={AIProvider.DEEPSEEK}>DeepSeek</option>
            </select>
          </div>

          {/* Default Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Model
            </label>
            <input
              type="text"
              value={settings.defaultModel}
              onChange={(e) => setSettings({ ...settings, defaultModel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Max Concurrent Tasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Concurrent Tasks
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.maxConcurrentTasks}
              onChange={(e) => setSettings({ ...settings, maxConcurrentTasks: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of tasks that can run simultaneously
            </p>
          </div>

          {/* Auto Save Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto Save Interval (ms)
            </label>
            <input
              type="number"
              min="1000"
              step="1000"
              value={settings.autoSaveInterval}
              onChange={(e) => setSettings({ ...settings, autoSaveInterval: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              How often to auto-save changes (in milliseconds)
            </p>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          {updateMutation.isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Settings saved successfully!
            </div>
          )}

          {updateMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              Failed to save settings. Please try again.
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

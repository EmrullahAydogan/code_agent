import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Puzzle,
  Plus,
  Power,
  PowerOff,
  Trash2,
  Shield,
  Code,
  Cloud,
  Layout
} from 'lucide-react';
import clsx from 'clsx';
import { pluginsApi } from '../services/api';
import { Plugin, PluginType } from '@local-code-agent/shared';

export const PluginsPage = () => {
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: plugins, isLoading } = useQuery({
    queryKey: ['plugins'],
    queryFn: async () => {
      const response = await pluginsApi.getAll();
      return response.data.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (pluginId: string) => pluginsApi.toggle(pluginId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (pluginId: string) => pluginsApi.delete(pluginId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      setSelectedPlugin(null);
    },
  });

  const getTypeIcon = (type: PluginType) => {
    switch (type) {
      case PluginType.TOOL:
        return <Code className="w-5 h-5" />;
      case PluginType.PROVIDER:
        return <Cloud className="w-5 h-5" />;
      case PluginType.INTEGRATION:
        return <Puzzle className="w-5 h-5" />;
      case PluginType.UI:
        return <Layout className="w-5 h-5" />;
      default:
        return <Puzzle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: PluginType) => {
    switch (type) {
      case PluginType.TOOL:
        return 'bg-blue-100 text-blue-700';
      case PluginType.PROVIDER:
        return 'bg-purple-100 text-purple-700';
      case PluginType.INTEGRATION:
        return 'bg-green-100 text-green-700';
      case PluginType.UI:
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const enabledPlugins = plugins?.filter(p => p.enabled) || [];
  const disabledPlugins = plugins?.filter(p => !p.enabled) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plugins</h1>
            <p className="mt-2 text-gray-600">
              Extend your code agent platform with custom plugins
            </p>
          </div>
          <button
            onClick={() => setShowInstallModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Install Plugin
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{plugins?.length || 0}</div>
          <div className="text-sm text-gray-600">Total Plugins</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{enabledPlugins.length}</div>
          <div className="text-sm text-gray-600">Enabled</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{disabledPlugins.length}</div>
          <div className="text-sm text-gray-600">Disabled</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {plugins?.filter(p => p.type === PluginType.PROVIDER).length || 0}
          </div>
          <div className="text-sm text-gray-600">Providers</div>
        </div>
      </div>

      {/* Plugins List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading plugins...</p>
        </div>
      ) : plugins && plugins.length > 0 ? (
        <div className="space-y-6">
          {/* Enabled Plugins */}
          {enabledPlugins.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Enabled Plugins</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enabledPlugins.map((plugin) => (
                  <div
                    key={plugin.id}
                    className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={clsx('p-2 rounded', getTypeColor(plugin.type))}>
                            {getTypeIcon(plugin.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={clsx(
                                'px-2 py-0.5 rounded text-xs font-medium',
                                getTypeColor(plugin.type)
                              )}>
                                {plugin.type}
                              </span>
                              <span className="text-xs text-gray-500">v{plugin.version}</span>
                            </div>
                          </div>
                        </div>

                        {plugin.description && (
                          <p className="mt-3 text-sm text-gray-600">{plugin.description}</p>
                        )}

                        {plugin.author && (
                          <div className="mt-2 text-xs text-gray-500">
                            By {plugin.author}
                          </div>
                        )}

                        {/* Permissions */}
                        {plugin.permissions && plugin.permissions.length > 0 && (
                          <div className="mt-3 flex items-center gap-1 flex-wrap">
                            <Shield className="w-3 h-3 text-gray-400" />
                            <div className="flex gap-1 flex-wrap">
                              {plugin.permissions.slice(0, 3).map((perm, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {perm}
                                </span>
                              ))}
                              {plugin.permissions.length > 3 && (
                                <span className="px-2 py-0.5 text-gray-500 text-xs">
                                  +{plugin.permissions.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => toggleMutation.mutate(plugin.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Disable Plugin"
                        >
                          <Power className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this plugin?')) {
                              deleteMutation.mutate(plugin.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Plugin"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disabled Plugins */}
          {disabledPlugins.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Disabled Plugins</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {disabledPlugins.map((plugin) => (
                  <div
                    key={plugin.id}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-5 opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-gray-200">
                            {getTypeIcon(plugin.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-700">{plugin.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                                {plugin.type}
                              </span>
                              <span className="text-xs text-gray-500">v{plugin.version}</span>
                            </div>
                          </div>
                        </div>

                        {plugin.description && (
                          <p className="mt-3 text-sm text-gray-600">{plugin.description}</p>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => toggleMutation.mutate(plugin.id)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Enable Plugin"
                        >
                          <PowerOff className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this plugin?')) {
                              deleteMutation.mutate(plugin.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Plugin"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Puzzle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plugins installed</h3>
          <p className="text-gray-600 mb-4">
            Install your first plugin to extend the platform capabilities
          </p>
          <button
            onClick={() => setShowInstallModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Install Plugin
          </button>
        </div>
      )}

      {/* Install Modal Placeholder */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Install Plugin</h2>
            <p className="text-gray-600 mb-4">
              Plugin installation form will be implemented here
            </p>
            <button
              onClick={() => setShowInstallModal(false)}
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

import { useState, useRef } from 'react';
import { Download, Upload, FileJson, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { agentsApi, projectsApi, tasksApi } from '../services/api';
import { useToast } from '../providers/ToastProvider';
import clsx from 'clsx';

interface ExportData {
  version: string;
  timestamp: string;
  agents?: any[];
  projects?: any[];
  tasks?: any[];
  settings?: any;
}

interface ExportImportProps {
  onImportComplete?: () => void;
}

export const ExportImport = ({ onImportComplete }: ExportImportProps) => {
  const [exportOptions, setExportOptions] = useState({
    agents: true,
    projects: true,
    tasks: true,
    settings: false,
  });
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error: showError } = useToast();

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await agentsApi.getAll();
      return response.data.data;
    },
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll();
      return response.data.data;
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await tasksApi.getAll({});
      return response.data.data;
    },
  });

  const handleExport = async () => {
    setExporting(true);

    try {
      const exportData: ExportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      };

      if (exportOptions.agents && agents) {
        exportData.agents = agents;
      }

      if (exportOptions.projects && projects) {
        exportData.projects = projects;
      }

      if (exportOptions.tasks && tasks) {
        exportData.tasks = tasks;
      }

      if (exportOptions.settings) {
        // Get settings from localStorage
        const settings = {
          theme: localStorage.getItem('theme'),
          // Add other settings as needed
        };
        exportData.settings = settings;
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `local-code-agent-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      success('Data exported successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const text = await file.text();
      const importData: ExportData = JSON.parse(text);

      // Validate data structure
      if (!importData.version || !importData.timestamp) {
        throw new Error('Invalid backup file format');
      }

      let importedCount = 0;

      // Import agents
      if (importData.agents && exportOptions.agents) {
        for (const agent of importData.agents) {
          try {
            await agentsApi.create(agent);
            importedCount++;
          } catch (err) {
            console.error('Failed to import agent:', agent.name, err);
          }
        }
      }

      // Import projects
      if (importData.projects && exportOptions.projects) {
        for (const project of importData.projects) {
          try {
            await projectsApi.create(project);
            importedCount++;
          } catch (err) {
            console.error('Failed to import project:', project.name, err);
          }
        }
      }

      // Import tasks
      if (importData.tasks && exportOptions.tasks) {
        for (const task of importData.tasks) {
          try {
            await tasksApi.create(task);
            importedCount++;
          } catch (err) {
            console.error('Failed to import task:', task.title, err);
          }
        }
      }

      // Import settings
      if (importData.settings && exportOptions.settings) {
        Object.entries(importData.settings).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            localStorage.setItem(key, String(value));
          }
        });
      }

      success(`Successfully imported ${importedCount} items`);
      onImportComplete?.();
    } catch (err: any) {
      showError(err.message || 'Failed to import data');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleOption = (option: keyof typeof exportOptions) => {
    setExportOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const hasSelectedOptions = Object.values(exportOptions).some(v => v);

  const getItemCount = () => {
    let count = 0;
    if (exportOptions.agents && agents) count += agents.length;
    if (exportOptions.projects && projects) count += projects.length;
    if (exportOptions.tasks && tasks) count += tasks.length;
    if (exportOptions.settings) count += 1;
    return count;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Export & Import
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Backup and restore your agents, projects, and settings
        </p>
      </div>

      {/* Export Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Select Data to Export/Import
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={exportOptions.agents}
                onChange={() => toggleOption('agents')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Agents</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Agent configurations and settings
                </div>
              </div>
            </div>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
              {agents?.length || 0} items
            </span>
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={exportOptions.projects}
                onChange={() => toggleOption('projects')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Projects</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Project configurations and metadata
                </div>
              </div>
            </div>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
              {projects?.length || 0} items
            </span>
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={exportOptions.tasks}
                onChange={() => toggleOption('tasks')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Tasks</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Task history and results
                </div>
              </div>
            </div>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
              {tasks?.length || 0} items
            </span>
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={exportOptions.settings}
                onChange={() => toggleOption('settings')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Settings</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Application preferences
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        {/* Export */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Export</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Download backup file</p>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={!hasSelectedOptions || exporting}
            className={clsx(
              'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {exporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export {getItemCount()} items
              </>
            )}
          </button>
        </div>

        {/* Import */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Import</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Restore from backup</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!hasSelectedOptions || importing}
            className={clsx(
              'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'bg-green-600 text-white hover:bg-green-700'
            )}
          >
            {importing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Import from file
              </>
            )}
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong className="font-semibold">Important:</strong> Importing will add new items to your existing data.
            Duplicate items may be created. Consider backing up your current data before importing.
          </div>
        </div>
      </div>
    </div>
  );
};

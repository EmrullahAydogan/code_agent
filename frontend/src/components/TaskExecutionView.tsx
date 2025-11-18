import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Terminal,
  AlertCircle
} from 'lucide-react';
import { Task, TaskStatus } from '@local-code-agent/shared';
import { tasksApi } from '../services/api';
import { useWebSocket } from '../providers/WebSocketProvider';
import clsx from 'clsx';

interface TaskExecutionViewProps {
  taskId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export const TaskExecutionView = ({ taskId, onComplete, onError }: TaskExecutionViewProps) => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const { socket } = useWebSocket();

  const { data: task, refetch } = useQuery<Task>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await tasksApi.getById(taskId);
      return response.data.data as Task;
    },
    refetchInterval: (query) => query.state.data?.status === 'running' ? 1000 : false,
  });

  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdate = (data: any) => {
      if (data.taskId === taskId) {
        refetch();

        if (data.log) {
          setLogs(prev => [...prev, {
            timestamp: new Date(),
            level: data.log.level || 'info',
            message: data.log.message,
          }]);
        }

        if (data.status === 'completed') {
          onComplete?.();
        } else if (data.status === 'failed') {
          onError?.(data.error || 'Task failed');
        }
      }
    };

    socket.on('task:update', handleTaskUpdate);
    socket.on('task:log', handleTaskUpdate);

    return () => {
      socket.off('task:update', handleTaskUpdate);
      socket.off('task:log', handleTaskUpdate);
    };
  }, [socket, taskId, refetch, onComplete, onError]);

  useEffect(() => {
    if (task?.status === 'running' && !startTime) {
      setStartTime(new Date());
    }

    if (task?.status === 'running') {
      const interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [task?.status, startTime]);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <Square className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getLogIcon = (level: ExecutionLog['level']) => {
    switch (level) {
      case 'info':
        return <Terminal className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancel = async () => {
    try {
      await tasksApi.cancel(taskId);
      refetch();
    } catch (err) {
      console.error('Failed to cancel task:', err);
    }
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(task.status)}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {task.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {task.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {task.status === 'running' && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {formatElapsedTime(elapsed)}
              </div>
            )}

            <span className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium border',
              getStatusColor(task.status)
            )}>
              {task.status.toUpperCase()}
            </span>

            {task.status === 'running' && (
              <button
                onClick={handleCancel}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Cancel Task"
              >
                <Square className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {task.status === 'running' && task.progress !== undefined && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(task.progress * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.progress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Execution Logs */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          Execution Logs
        </h4>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No logs yet...</p>
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {logs.map((log, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              >
                {getLogIcon(log.level)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={clsx(
                      'font-semibold',
                      log.level === 'error' && 'text-red-600 dark:text-red-400',
                      log.level === 'warning' && 'text-yellow-600 dark:text-yellow-400',
                      log.level === 'success' && 'text-green-600 dark:text-green-400',
                      log.level === 'info' && 'text-blue-600 dark:text-blue-400'
                    )}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {log.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result Section */}
      {(task.status === 'completed' || task.status === 'failed') && task.result && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Result
          </h4>
          <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 text-xs overflow-x-auto">
            <code className="text-gray-700 dark:text-gray-300">
              {typeof task.result === 'string' ? task.result : JSON.stringify(task.result, null, 2)}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Terminal,
  X,
  Trash2,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug
} from 'lucide-react';
import clsx from 'clsx';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  args: any[];
  stack?: string;
}

interface DebugConsoleProps {
  enabled?: boolean;
  maxEntries?: number;
  position?: 'bottom' | 'right';
}

export const DebugConsole = ({
  enabled = true,
  maxEntries = 1000,
  position = 'bottom',
}: DebugConsoleProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const consoleRef = useRef<HTMLDivElement>(null);

  // Intercept console methods
  useEffect(() => {
    if (!enabled) return;

    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    const createLogEntry = (level: LogLevel, args: any[]): LogEntry => {
      const message = args
        .map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(' ');

      return {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        level,
        message,
        args,
        stack: level === 'error' ? new Error().stack : undefined,
      };
    };

    console.log = (...args: any[]) => {
      originalConsole.log(...args);
      setLogs(prev => [...prev.slice(-(maxEntries - 1)), createLogEntry('log', args)]);
    };

    console.info = (...args: any[]) => {
      originalConsole.info(...args);
      setLogs(prev => [...prev.slice(-(maxEntries - 1)), createLogEntry('info', args)]);
    };

    console.warn = (...args: any[]) => {
      originalConsole.warn(...args);
      setLogs(prev => [...prev.slice(-(maxEntries - 1)), createLogEntry('warn', args)]);
    };

    console.error = (...args: any[]) => {
      originalConsole.error(...args);
      setLogs(prev => [...prev.slice(-(maxEntries - 1)), createLogEntry('error', args)]);
    };

    console.debug = (...args: any[]) => {
      originalConsole.debug(...args);
      setLogs(prev => [...prev.slice(-(maxEntries - 1)), createLogEntry('debug', args)]);
    };

    // Restore on cleanup
    return () => {
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.debug = originalConsole.debug;
    };
  }, [enabled, maxEntries]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleLog = useCallback((id: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setExpandedLogs(new Set());
  }, []);

  const exportLogs = useCallback(() => {
    const content = logs
      .map(log => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-console-${Date.now()}.txt`;
    a.click();
  }, [logs]);

  const getIcon = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'debug':
        return <Bug className="w-4 h-4 text-purple-500" />;
      default:
        return <Terminal className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLogStyle = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
      case 'warn':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
      case 'debug':
        return 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-300';
    }
  };

  const filteredLogs = logs.filter(log => {
    const levelMatch = selectedLevel === 'all' || log.level === selectedLevel;
    const searchMatch = !searchQuery || log.message.toLowerCase().includes(searchQuery.toLowerCase());
    return levelMatch && searchMatch;
  });

  const levelCounts = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {} as Record<LogLevel, number>);

  if (!enabled) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-40 p-3 bg-gray-900 dark:bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
        title="Toggle Debug Console"
      >
        <Terminal className="w-5 h-5" />
        {logs.filter(l => l.level === 'error').length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {logs.filter(l => l.level === 'error').length}
          </span>
        )}
      </button>

      {/* Console Panel */}
      {isOpen && (
        <div
          className={clsx(
            'fixed z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl',
            position === 'bottom'
              ? 'bottom-0 left-0 right-0 h-96'
              : 'right-0 top-0 bottom-0 w-96'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Debug Console</h3>
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                {filteredLogs.length} logs
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportLogs}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Export Logs"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={clearLogs}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Clear Logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 space-y-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Level Filter */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedLevel('all')}
                className={clsx(
                  'px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap',
                  selectedLevel === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                )}
              >
                All ({logs.length})
              </button>
              {(['log', 'info', 'warn', 'error', 'debug'] as LogLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={clsx(
                    'px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap',
                    selectedLevel === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  {level} ({levelCounts[level] || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Logs */}
          <div
            ref={consoleRef}
            className="overflow-y-auto p-2 space-y-1 font-mono text-xs"
            style={{ height: position === 'bottom' ? 'calc(100% - 140px)' : 'calc(100% - 140px)' }}
          >
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Terminal className="w-8 h-8 mb-2 opacity-50" />
                <p>No logs to display</p>
              </div>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} className={clsx('rounded p-2', getLogStyle(log.level))}>
                  <div
                    className="flex items-start gap-2 cursor-pointer"
                    onClick={() => toggleLog(log.id)}
                  >
                    {expandedLogs.has(log.id) ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    )}
                    {getIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span className={clsx(
                          'font-semibold uppercase text-xs',
                          log.level === 'error' && 'text-red-600 dark:text-red-400',
                          log.level === 'warn' && 'text-yellow-600 dark:text-yellow-400',
                          log.level === 'info' && 'text-blue-600 dark:text-blue-400',
                          log.level === 'debug' && 'text-purple-600 dark:text-purple-400',
                          log.level === 'log' && 'text-gray-600 dark:text-gray-400'
                        )}>
                          {log.level}
                        </span>
                      </div>
                      <div className="text-gray-900 dark:text-gray-100 break-words">
                        {expandedLogs.has(log.id) ? (
                          <pre className="whitespace-pre-wrap">{log.message}</pre>
                        ) : (
                          <span className="line-clamp-1">{log.message}</span>
                        )}
                      </div>
                      {expandedLogs.has(log.id) && log.stack && (
                        <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {log.stack}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

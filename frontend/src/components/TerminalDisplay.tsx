import React from 'react';
import { Terminal, X } from 'lucide-react';
import clsx from 'clsx';

interface TerminalDisplayProps {
  output: string;
  error?: string;
  command?: string;
  exitCode?: number;
  onClose?: () => void;
  title?: string;
}

export const TerminalDisplay: React.FC<TerminalDisplayProps> = ({
  output,
  error,
  command,
  exitCode,
  onClose,
  title = 'Terminal Output',
}) => {
  const hasError = exitCode !== undefined && exitCode !== 0;

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-300 font-medium">{title}</span>
          {exitCode !== undefined && (
            <span
              className={clsx(
                'px-2 py-0.5 rounded text-xs font-mono',
                hasError
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-green-500/20 text-green-400'
              )}
            >
              exit {exitCode}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Command */}
      {command && (
        <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-mono text-sm">$</span>
            <span className="text-gray-300 font-mono text-sm">{command}</span>
          </div>
        </div>
      )}

      {/* Output */}
      <div className="p-4 font-mono text-sm max-h-96 overflow-y-auto">
        {output && (
          <pre className="text-gray-300 whitespace-pre-wrap break-words">
            {output}
          </pre>
        )}

        {error && (
          <pre className="text-red-400 whitespace-pre-wrap break-words mt-2">
            {error}
          </pre>
        )}

        {!output && !error && (
          <div className="text-gray-500 italic">No output</div>
        )}
      </div>
    </div>
  );
};

// Inline terminal for chat messages
interface InlineTerminalProps {
  command: string;
  output?: string;
  error?: string;
  exitCode?: number;
}

export const InlineTerminal: React.FC<InlineTerminalProps> = ({
  command,
  output,
  error,
  exitCode,
}) => {
  const hasError = exitCode !== undefined && exitCode !== 0;

  return (
    <div className="my-2 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      {/* Command */}
      <div className="px-3 py-2 bg-gray-800 flex items-center gap-2">
        <Terminal className="w-3 h-3 text-green-400" />
        <span className="text-green-400 font-mono text-xs">$</span>
        <span className="text-gray-300 font-mono text-xs">{command}</span>
        {exitCode !== undefined && (
          <span
            className={clsx(
              'ml-auto px-2 py-0.5 rounded text-xs font-mono',
              hasError
                ? 'bg-red-500/20 text-red-400'
                : 'bg-green-500/20 text-green-400'
            )}
          >
            {exitCode}
          </span>
        )}
      </div>

      {/* Output */}
      {(output || error) && (
        <div className="px-3 py-2 font-mono text-xs max-h-48 overflow-y-auto">
          {output && (
            <pre className="text-gray-300 whitespace-pre-wrap break-words">
              {output}
            </pre>
          )}

          {error && (
            <pre className="text-red-400 whitespace-pre-wrap break-words mt-1">
              {error}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

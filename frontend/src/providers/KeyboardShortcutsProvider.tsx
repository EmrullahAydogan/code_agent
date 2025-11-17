import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { X, Keyboard } from 'lucide-react';
import { KeyboardShortcut, useKeyboardShortcuts, formatShortcut } from '../hooks/useKeyboardShortcuts';
import clsx from 'clsx';

interface KeyboardShortcutsContextType {
  registerShortcuts: (shortcuts: KeyboardShortcut[]) => void;
  unregisterShortcuts: () => void;
  showHelp: () => void;
  hideHelp: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

export const useKeyboardShortcutsContext = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider');
  }
  return context;
};

interface Props {
  children: ReactNode;
}

export const KeyboardShortcutsProvider = ({ children }: Props) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  const registerShortcuts = useCallback((newShortcuts: KeyboardShortcut[]) => {
    setShortcuts(prev => [...prev, ...newShortcuts]);
  }, []);

  const unregisterShortcuts = useCallback(() => {
    setShortcuts([]);
  }, []);

  const showHelp = useCallback(() => {
    setShowHelpDialog(true);
  }, []);

  const hideHelp = useCallback(() => {
    setShowHelpDialog(false);
  }, []);

  // Global shortcuts
  const globalShortcuts: KeyboardShortcut[] = [
    {
      key: '?',
      shiftKey: true,
      description: 'Show keyboard shortcuts',
      handler: () => setShowHelpDialog(true),
    },
    {
      key: 'Escape',
      description: 'Close dialog/modal',
      handler: () => setShowHelpDialog(false),
    },
    {
      key: 'k',
      ctrlKey: true,
      description: 'Quick search',
      handler: () => {
        // TODO: Implement quick search
        console.log('Quick search');
      },
    },
  ];

  useKeyboardShortcuts({
    shortcuts: [...globalShortcuts, ...shortcuts],
    enabled: true,
  });

  // Group shortcuts by category
  const groupedShortcuts = [...globalShortcuts, ...shortcuts].reduce((acc, shortcut) => {
    const category = (shortcut as any).category || 'Global';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <KeyboardShortcutsContext.Provider
      value={{ registerShortcuts, unregisterShortcuts, showHelp, hideHelp }}
    >
      {children}

      {/* Help Dialog */}
      {showHelpDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Keyboard className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={() => setShowHelpDialog(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {shortcut.description}
                        </span>
                        <kbd className="px-3 py-1.5 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                          {formatShortcut(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">?</kbd> to toggle this help
              </p>
            </div>
          </div>
        </div>
      )}
    </KeyboardShortcutsContext.Provider>
  );
};

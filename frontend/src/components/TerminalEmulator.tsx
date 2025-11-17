import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Maximize2, Minimize2, Trash2, Download } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

interface TerminalEmulatorProps {
  onCommand?: (command: string) => void;
  initialCommands?: string[];
  readOnly?: boolean;
  theme?: 'light' | 'dark';
}

export const TerminalEmulator = ({
  onCommand,
  initialCommands = [],
  readOnly = false,
  theme = 'dark',
}: TerminalEmulatorProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const currentLineRef = useRef('');

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create terminal instance
    const terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: theme === 'dark' ? {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      } : {
        background: '#ffffff',
        foreground: '#333333',
        cursor: '#333333',
      },
      rows: 24,
      cols: 80,
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    // Open terminal in DOM
    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Welcome message
    terminal.writeln('Welcome to Local Code Agent Terminal');
    terminal.writeln('Type "help" for available commands');
    terminal.writeln('');

    // Run initial commands
    initialCommands.forEach(cmd => {
      terminal.writeln(`$ ${cmd}`);
      onCommand?.(cmd);
    });

    if (!readOnly) {
      writePrompt(terminal);

      // Handle input
      terminal.onData((data) => {
        const code = data.charCodeAt(0);

        // Handle Enter
        if (code === 13) {
          terminal.writeln('');
          const command = currentLineRef.current.trim();

          if (command) {
            setCommandHistory(prev => [...prev, command]);
            setHistoryIndex(-1);
            onCommand?.(command);
          }

          currentLineRef.current = '';
          writePrompt(terminal);
          return;
        }

        // Handle Backspace
        if (code === 127) {
          if (currentLineRef.current.length > 0) {
            currentLineRef.current = currentLineRef.current.slice(0, -1);
            terminal.write('\b \b');
          }
          return;
        }

        // Handle Ctrl+C
        if (code === 3) {
          terminal.writeln('^C');
          currentLineRef.current = '';
          writePrompt(terminal);
          return;
        }

        // Handle Ctrl+L (clear screen)
        if (code === 12) {
          terminal.clear();
          writePrompt(terminal);
          return;
        }

        // Handle arrow up (history)
        if (data === '\x1b[A') {
          if (commandHistory.length > 0) {
            const newIndex = historyIndex === -1
              ? commandHistory.length - 1
              : Math.max(0, historyIndex - 1);

            const cmd = commandHistory[newIndex];
            if (cmd) {
              // Clear current line
              terminal.write('\r\x1b[K');
              writePrompt(terminal, false);
              terminal.write(cmd);
              currentLineRef.current = cmd;
              setHistoryIndex(newIndex);
            }
          }
          return;
        }

        // Handle arrow down (history)
        if (data === '\x1b[B') {
          if (historyIndex !== -1) {
            const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
            const cmd = historyIndex === commandHistory.length - 1 ? '' : commandHistory[newIndex];

            terminal.write('\r\x1b[K');
            writePrompt(terminal, false);
            if (cmd) {
              terminal.write(cmd);
            }
            currentLineRef.current = cmd;
            setHistoryIndex(newIndex);
          }
          return;
        }

        // Regular character input
        if (code >= 32 && code < 127) {
          currentLineRef.current += data;
          terminal.write(data);
        }
      });
    }

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
    };
  }, [theme, readOnly, onCommand, initialCommands]);

  const writePrompt = (terminal: Terminal, newLine = true) => {
    if (newLine) terminal.write('\r\n');
    terminal.write('\x1b[32m$\x1b[0m ');
  };

  const writeLine = (text: string, style?: 'error' | 'success' | 'warning' | 'info') => {
    if (!xtermRef.current) return;

    const terminal = xtermRef.current;

    switch (style) {
      case 'error':
        terminal.writeln(`\x1b[31m${text}\x1b[0m`);
        break;
      case 'success':
        terminal.writeln(`\x1b[32m${text}\x1b[0m`);
        break;
      case 'warning':
        terminal.writeln(`\x1b[33m${text}\x1b[0m`);
        break;
      case 'info':
        terminal.writeln(`\x1b[36m${text}\x1b[0m`);
        break;
      default:
        terminal.writeln(text);
    }
  };

  const clear = () => {
    if (!xtermRef.current) return;
    xtermRef.current.clear();
    if (!readOnly) {
      writePrompt(xtermRef.current);
    }
  };

  const exportHistory = () => {
    const content = commandHistory.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-history-${Date.now()}.txt`;
    a.click();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      fitAddonRef.current?.fit();
    }, 100);
  };

  // Expose methods for parent components
  useEffect(() => {
    (window as any).terminalEmulator = {
      writeLine,
      clear,
    };
    return () => {
      delete (window as any).terminalEmulator;
    };
  }, []);

  return (
    <div
      className={`bg-gray-900 rounded-lg overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50' : 'relative'
      }`}
    >
      {/* Toolbar */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>

        <div className="text-xs text-gray-400 font-mono">
          Terminal
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportHistory}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Export History"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={clear}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Clear Terminal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div
        ref={terminalRef}
        className="p-2"
        style={{ height: isFullscreen ? 'calc(100% - 40px)' : '400px' }}
      />
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Trash2, Play, GitBranch, Terminal as TerminalTab, Maximize2 } from 'lucide-react';
import ResizeObserver from 'resize-observer-polyfill';

interface ConsoleProps {
  code: string;
  language: string;
}

type LogType = 'output' | 'error' | 'info' | 'git' | 'command';

interface Log {
  type: LogType;
  content: string;
  timestamp: number;
}

function Console({ code, language }: ConsoleProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'console' | 'terminal'>('console');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasErrors, setHasErrors] = useState(false);
  
  const consoleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const addLog = (content: string, type: LogType) => {
    setLogs(prev => [...prev, {
      type,
      content,
      timestamp: Date.now()
    }]);

    if (type === 'error') {
      setHasErrors(true);
    }
  };

  const clearConsole = () => {
    setLogs([]);
    setHasErrors(false);
  };

  const executeGitCommand = (command: string) => {
    const gitCommands: Record<string, string> = {
      'git init': 'Initialized empty Git repository',
      'git status': 'On branch main\nNothing to commit, working tree clean',
      'git add': 'Added files to staging area',
      'git commit': 'Created commit',
      'git branch': '* main',
      'git checkout': 'Switched to branch',
      'git log': 'commit abc123\nAuthor: User\nDate: Now\n\n    Initial commit',
      'git remote': 'origin',
      'git push': 'Everything up-to-date',
      'git pull': 'Already up to date.'
    };

    const matchedCommand = Object.keys(gitCommands).find(cmd => command.startsWith(cmd));
    
    addLog(`$ ${command}`, 'command');
    if (matchedCommand) {
      addLog(gitCommands[matchedCommand], 'git');
    } else {
      addLog('Git command not recognized', 'error');
    }
  };

  const executeTerminalCommand = (command: string) => {
    const commands: Record<string, (args: string[]) => string> = {
      help: () => 'Available commands:\n  help - Show this help message\n  clear - Clear terminal\n  echo [text] - Print text\n  ls - List files\n  pwd - Print working directory',
      clear: () => {
        clearConsole();
        return '';
      },
      echo: (args) => args.join(' '),
      ls: () => 'src/\npackage.json\nREADME.md',
      pwd: () => '/home/project'
    };

    const args = command.split(' ');
    const cmd = args[0];

    addLog(`$ ${command}`, 'command');
    
    if (cmd in commands) {
      const output = commands[cmd](args.slice(1));
      if (output) {
        addLog(output, 'output');
      }
    } else if (cmd.startsWith('git')) {
      executeGitCommand(command);
    } else {
      addLog(`Command not found: ${cmd}`, 'error');
    }
  };

  const executeCode = () => {
    if (!code.trim()) {
      addLog('No code to execute', 'info');
      return;
    }

    clearConsole();
    
    if (language !== 'javascript' && language !== 'typescript') {
      addLog(`Execution of ${language} code is not supported in the browser. Use JavaScript/TypeScript for real-time execution.`, 'info');
      return;
    }

    const consoleLog = (...args: any[]) => {
      addLog(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '), 'output');
    };

    const consoleError = (...args: any[]) => {
      addLog(args.map(arg => 
        arg instanceof Error ? arg.message : String(arg)
      ).join(' '), 'error');
    };

    const consoleInfo = (...args: any[]) => {
      addLog(args.map(arg => String(arg)).join(' '), 'info');
    };

    try {
      const sandbox = {
        console: {
          log: consoleLog,
          error: consoleError,
          info: consoleInfo,
          warn: consoleLog,
          debug: consoleLog
        }
      };

      const executor = new Function('sandbox', `
        with (sandbox) {
          try {
            ${code}
          } catch (error) {
            console.error(error);
          }
        }
      `);

      executor(sandbox);

      if (!hasErrors) {
        addLog('Code executed successfully', 'info');
      }
    } catch (error) {
      consoleError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleScroll = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    }, 50);
  };

  useEffect(() => {
    const handleExecuteCode = (event: CustomEvent) => {
      if (event.detail?.code) {
        executeCode();
      }
    };

    window.addEventListener('execute-code', handleExecuteCode as EventListener);
    return () => {
      window.removeEventListener('execute-code', handleExecuteCode as EventListener);
    };
  }, [code]);

  useEffect(() => {
    if (consoleRef.current) {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      resizeObserverRef.current = new ResizeObserver(() => {
        requestAnimationFrame(handleScroll);
      });

      resizeObserverRef.current.observe(consoleRef.current);

      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, []);

  useEffect(() => {
    handleScroll();
  }, [logs]);

  useEffect(() => {
    if (activeTab === 'terminal') {
      addLog('Terminal v1.0.0', 'info');
      addLog('Type "help" for available commands', 'info');
    }
  }, [activeTab]);

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      const command = input.trim();
      executeTerminalCommand(command);
      
      setCommandHistory(prev => [command, ...prev].slice(0, 50));
      setHistoryIndex(-1);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > -1) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(newIndex === -1 ? '' : commandHistory[newIndex]);
      }
    }
  };

  return (
    <div className={`h-full bg-gray-900 text-white flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex justify-between items-center p-2 bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('console')}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                activeTab === 'console' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <TerminalIcon size={16} />
              <span>Console</span>
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                activeTab === 'terminal' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <TerminalTab size={16} />
              <span>Terminal</span>
            </button>
          </div>
          {activeTab === 'console' && (
            <>
              <GitBranch size={18} />
              <span className="text-sm text-gray-400">Git enabled</span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {activeTab === 'console' && (
            <button
              onClick={executeCode}
              className="p-1 hover:bg-gray-600 rounded flex items-center gap-1 text-green-400"
              title="Execute code"
            >
              <Play size={18} />
              <span className="text-sm">Execute</span>
            </button>
          )}
          <button
            onClick={clearConsole}
            className="p-1 hover:bg-gray-600 rounded"
            title="Clear"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-gray-600 rounded"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      <div 
        ref={consoleRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 bg-gray-900"
      >
        {logs.map((log, index) => (
          <div
            key={`${log.timestamp}-${index}`}
            className={`py-1 whitespace-pre-wrap ${
              log.type === 'error' ? 'text-red-400' :
              log.type === 'info' ? 'text-blue-400' :
              log.type === 'git' ? 'text-purple-400' :
              log.type === 'command' ? 'text-gray-400' :
              'text-green-400'
            }`}
          >
            {log.type === 'error' && '❌ '}
            {log.type === 'info' && 'ℹ️ '}
            {log.type === 'git' && '🔄 '}
            {log.type === 'output' && '✅ '}
            {log.content}
          </div>
        ))}
      </div>

      <div className="p-2 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-green-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyPress}
            placeholder={activeTab === 'terminal' ? "Type a command (e.g., help)" : "Type a git command (e.g., git status)"}
            className="flex-1 bg-gray-900 text-white px-3 py-1 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

export default Console;
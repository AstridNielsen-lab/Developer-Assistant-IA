import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, Play, GitBranch } from 'lucide-react';

interface ConsoleProps {
  code: string;
  language: string;
}

export default function Console({ code, language }: ConsoleProps) {
  const [logs, setLogs] = useState<Array<{ type: 'output' | 'error' | 'info' | 'git'; content: string }>>([]);
  const [input, setInput] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearConsole = () => setLogs([]);

  const executeGitCommand = async (command: string) => {
    const gitCommands = {
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
    if (matchedCommand) {
      setLogs(prev => [...prev, { type: 'git', content: `$ ${command}` }]);
      setLogs(prev => [...prev, { type: 'output', content: gitCommands[matchedCommand] }]);
    } else {
      setLogs(prev => [...prev, { type: 'error', content: 'Git command not recognized' }]);
    }
  };

  const executeCode = () => {
    clearConsole();
    
    const consoleLog = (...args: any[]) => {
      setLogs(prev => [...prev, { type: 'output', content: args.join(' ') }]);
    };

    const consoleError = (...args: any[]) => {
      setLogs(prev => [...prev, { type: 'error', content: args.join(' ') }]);
    };

    const consoleInfo = (...args: any[]) => {
      setLogs(prev => [...prev, { type: 'info', content: args.join(' ') }]);
    };

    try {
      const preparedCode = `
        try {
          const console = {
            log: ${consoleLog.toString()},
            error: ${consoleError.toString()},
            info: ${consoleInfo.toString()},
            warn: ${consoleLog.toString()},
            debug: ${consoleLog.toString()}
          };
          ${code}
        } catch (error) {
          console.error(error.message);
        }
      `;

      if (language === 'javascript' || language === 'typescript') {
        new Function(preparedCode)();
      } else {
        setLogs(prev => [...prev, { 
          type: 'info', 
          content: `Execução de código ${language} não suportada no navegador. Use JavaScript/TypeScript para execução em tempo real.` 
        }]);
      }
    } catch (error) {
      setLogs(prev => [...prev, { type: 'error', content: error.message }]);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const command = input.trim();
      if (command.startsWith('git ')) {
        executeGitCommand(command);
      } else {
        setLogs(prev => [...prev, { type: 'output', content: `$ ${command}` }]);
        setLogs(prev => [...prev, { type: 'error', content: 'Command not found' }]);
      }
      setInput('');
    }
  };

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      <div className="flex justify-between items-center p-2 bg-gray-800">
        <div className="flex items-center gap-2">
          <Terminal size={18} />
          <span>Console</span>
          <GitBranch size={18} className="ml-2" />
          <span className="text-sm text-gray-400">Git enabled</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={executeCode}
            className="p-1 hover:bg-gray-600 rounded flex items-center gap-1 text-green-400"
            title="Executar código"
          >
            <Play size={18} />
            <span className="text-sm">Executar</span>
          </button>
          <button
            onClick={clearConsole}
            className="p-1 hover:bg-gray-600 rounded"
            title="Limpar console"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div 
        ref={consoleRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1"
      >
        {logs.map((log, index) => (
          <div
            key={index}
            className={`py-1 ${
              log.type === 'error' ? 'text-red-400' :
              log.type === 'info' ? 'text-blue-400' :
              log.type === 'git' ? 'text-purple-400' :
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
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleInputKeyPress}
          placeholder="Digite um comando git (ex: git status)"
          className="w-full bg-gray-900 text-white px-3 py-1 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}
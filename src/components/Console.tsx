import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, Play } from 'lucide-react';

interface ConsoleProps {
  code: string;
  language: string;
}

export default function Console({ code, language }: ConsoleProps) {
  const [logs, setLogs] = useState<Array<{ type: 'output' | 'error' | 'info'; content: string }>>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const clearConsole = () => setLogs([]);

  const executeCode = () => {
    clearConsole();
    
    // Criar um ambiente seguro para execução
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
      // Preparar o código para execução segura
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

      // Executar o código em um contexto isolado
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

  // Auto-scroll para o último log
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
              'text-green-400'
            }`}
          >
            {log.type === 'error' && '❌ '}
            {log.type === 'info' && 'ℹ️ '}
            {log.type === 'output' && '✅ '}
            {log.content}
          </div>
        ))}
      </div>
    </div>
  );
}
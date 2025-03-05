import React, { useState } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export default function Console() {
  const [logs, setLogs] = useState<string[]>([]);

  const clearConsole = () => setLogs([]);

  return (
    <div className="h-full bg-gray-900 text-white p-4 font-mono">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Terminal size={18} />
          <span>Console</span>
        </div>
        <button
          onClick={clearConsole}
          className="p-1 hover:bg-gray-700 rounded"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div className="overflow-y-auto h-[calc(100%-2rem)]">
        {logs.map((log, index) => (
          <div key={index} className="py-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
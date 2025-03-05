import React, { useState } from 'react';
import { Send, Save, Plus, AlertCircle } from 'lucide-react';
import { Message } from '../types';
import { API_URL, API_KEY } from '../config';

interface ChatProps {
  onSaveCode: (code: string) => void;
  onAddToProject: (file: { name: string, content: string }) => void;
}

export default function Chat({ onSaveCode, onAddToProject }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: input }] }]
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant' as const,
        content: data.candidates[0].content.parts[0].text
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-8'
                : 'bg-white mr-8 shadow'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.role === 'assistant' && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onSaveCode(message.content)}
                  className="p-2 text-sm bg-green-500 text-white rounded-md flex items-center gap-1"
                >
                  <Save size={16} /> Save
                </button>
                <button
                  onClick={() => onAddToProject({
                    name: 'new-file.txt',
                    content: message.content
                  })}
                  className="p-2 text-sm bg-blue-500 text-white rounded-md flex items-center gap-1"
                >
                  <Plus size={16} /> Add to Project
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask for code generation or help..."
            className="flex-1 p-2 border rounded-md"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
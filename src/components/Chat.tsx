import React, { useState, useEffect, useRef } from 'react';
import { Send, Save, Plus, Code2, User, Volume2, VolumeX, HelpCircle, MessageSquare, Folder, Upload, Download } from 'lucide-react';
import { Message, UserData } from '../types';
import { API_URL, API_KEY } from '../config';
import HelpModal from './HelpModal';
import ProjectFiles from './ProjectFiles';
import { useLocalStorage } from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';

interface ChatProps {
  onSaveCode: (code: string) => void;
  onAddToProject: (file: { name: string, content: string }) => void;
  userName: string;
}

type ChatMode = 'conversation' | 'code';

interface ProjectFile {
  name: string;
  content: string;
  lastModified: number;
}

export default function Chat({ onSaveCode, onAddToProject, userName }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: `Olá ${userName}! Que bom te ver por aqui! 😊 Como posso te ajudar hoje?`,
    timestamp: Date.now()
  }]);
  
  const [userData, setUserData] = useLocalStorage<UserData>('userData', {
    name: userName,
    conversations: [],
    savedCodes: []
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('conversation');
  const [showProjectFiles, setShowProjectFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSpeechEnabled('speechSynthesis' in window);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onSaveCode(content);
      toast.success(`Arquivo ${file.name} carregado com sucesso!`);
      
      // Salvar no histórico
      setUserData(prev => ({
        ...prev,
        savedCodes: [
          ...prev.savedCodes,
          {
            id: Date.now().toString(),
            language: file.name.split('.').pop() || 'text',
            code: content,
            timestamp: Date.now()
          }
        ]
      }));
    };
    reader.readAsText(file);
  };

  const handleFileSave = (code: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveConversation = () => {
    setUserData(prev => ({
      ...prev,
      conversations: [
        ...prev.conversations,
        {
          id: Date.now().toString(),
          messages: messages,
          timestamp: Date.now()
        }
      ]
    }));
  };

  // Resto do código do componente Chat permanece o mesmo...
  // (mantendo todas as funções existentes)

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-full">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Olá, {userName}!</h2>
              <p className="text-sm text-gray-600">Como posso te ajudar?</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".js,.ts,.py,.java,.cpp,.go,.rust,.php,.txt"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Carregar arquivo"
            >
              <Upload className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => handleFileSave(messages[messages.length - 1]?.content || '')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Salvar conversa"
            >
              <Download className="w-6 h-6 text-gray-600" />
            </button>
            {/* Restante dos botões existentes */}
          </div>
        </div>
        
        {/* Mode Selection Buttons (mantido como está) */}
      </div>

      {/* Chat messages area (mantido como está) */}
      
      {/* Input area (mantido como está) */}
      
      {/* Modals (mantidos como estão) */}
    </div>
  );
}
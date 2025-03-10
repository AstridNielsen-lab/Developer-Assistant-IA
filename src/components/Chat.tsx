import React, { useState, useEffect, useRef } from 'react';
import { Send, Save, Plus, Code2, User, Volume2, VolumeX, HelpCircle, MessageSquare, Folder, Upload, Download, X } from 'lucide-react';
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
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSpeechEnabled('speechSynthesis' in window);
    const savedFiles = localStorage.getItem('projectFiles');
    if (savedFiles) {
      setProjectFiles(JSON.parse(savedFiles));
    }
  }, []);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speakMessage = (text: string) => {
    if (!speechEnabled) return;

    stopSpeaking();

    const cleanText = text.replace(/```[\s\S]*?```/g, 'código exemplo')
                         .replace(/`.*?`/g, '')
                         .replace(/\*\*/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const portugueseVoice = voices.find(voice => voice.lang.includes('pt-BR'));
    if (portugueseVoice) {
      utterance.voice = portugueseVoice;
    }

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onSaveCode(content);
      toast.success(`Arquivo ${file.name} carregado com sucesso!`);
      
      const newFile = {
        name: file.name,
        content: content,
        lastModified: Date.now()
      };

      setProjectFiles(prev => [...prev, newFile]);
      localStorage.setItem('projectFiles', JSON.stringify([...projectFiles, newFile]));
      
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

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      role: 'user' as const, 
      content: input,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const conversationHistory = messages
        .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      
      let fullPrompt = `${conversationHistory}\nHuman: ${input}`;
      
      if (mode === 'code') {
        fullPrompt = `${fullPrompt}\n\nPor favor, forneça apenas o código com explicações mínimas. Use blocos de código markdown (\`\`\`) para o código.`;
      }

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      const assistantMessage = {
        role: 'assistant' as const,
        content: data.candidates[0].content.parts[0].text,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      saveConversation();
      speakMessage(assistantMessage.content);

      // Extract and execute code if present
      if (mode === 'code' && assistantMessage.content.includes('```')) {
        const codeMatch = assistantMessage.content.match(/```(?:\w+)?\n([\s\S]+?)\n```/);
        if (codeMatch) {
          const extractedCode = codeMatch[1];
          onSaveCode(extractedCode);
          toast.success('Código gerado e copiado para o editor!');
          
          // Automatically trigger code execution after a short delay
          setTimeout(() => {
            const executeEvent = new CustomEvent('execute-code', { 
              detail: { code: extractedCode } 
            });
            window.dispatchEvent(executeEvent);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Putz, deu um erro aqui! Vamo tentar de novo? Se o problema persistir, verifique sua conexão com a internet ou tente mais tarde. 🤔',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
      speakMessage(errorMessage.content);
    }

    setLoading(false);
  };

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
            {speechEnabled && (
              <button
                onClick={() => speaking ? stopSpeaking() : speakMessage(messages[messages.length - 1].content)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title={speaking ? "Parar de falar" : "Falar mensagem"}
              >
                {speaking ? (
                  <VolumeX className="w-6 h-6 text-gray-600" />
                ) : (
                  <Volume2 className="w-6 h-6 text-gray-600" />
                )}
              </button>
            )}
            <button
              onClick={() => setShowProjectFiles(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Abrir Projeto"
            >
              <Folder className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Ajuda"
            >
              <HelpCircle className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setMode('conversation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              mode === 'conversation'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MessageSquare size={20} />
            Conversar
          </button>
          <button
            onClick={() => setMode('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              mode === 'code'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Code2 size={20} />
            Gerar Código
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' ? 'bg-blue-100' : 'bg-blue-500'
            }`}>
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-blue-500" />
              ) : (
                <Code2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={`p-4 rounded-lg max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-100'
                  : 'bg-white shadow'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.role === 'assistant' && message.content.includes('```') && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      const codeMatch = message.content.match(/```(?:\w+)?\n([\s\S]+?)\n```/);
                      if (codeMatch) {
                        onSaveCode(codeMatch[1]);
                        toast.success('Código copiado para o editor!');
                        
                        // Trigger code execution
                        const executeEvent = new CustomEvent('execute-code', { 
                          detail: { code: codeMatch[1] } 
                        });
                        window.dispatchEvent(executeEvent);
                      }
                    }}
                    className="p-2 text-sm bg-green-500 text-white rounded-md flex items-center gap-1 hover:bg-green-600 transition-colors"
                  >
                    <Save size={16} /> Salvar no Editor
                  </button>
                  <button
                    onClick={() => {
                      const fileName = prompt('Nome do arquivo:', 'novo-arquivo.js');
                      if (fileName) {
                        const codeMatch = message.content.match(/```(?:\w+)?\n([\s\S]+?)\n```/);
                        if (codeMatch) {
                          const newFile = {
                            name: fileName,
                            content: codeMatch[1],
                            lastModified: Date.now()
                          };
                          setProjectFiles(prev => [...prev, newFile]);
                          localStorage.setItem('projectFiles', JSON.stringify([...projectFiles, newFile]));
                          onAddToProject({
                            name: fileName,
                            content: codeMatch[1]
                          });
                          toast.success(`Arquivo ${fileName} adicionado ao projeto!`);
                        }
                      }
                    }}
                    className="p-2 text-sm bg-blue-500 text-white rounded-md flex items-center gap-1 hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={16} /> Adicionar ao Projeto
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={mode === 'code' ? "Descreva o código que você precisa..." : "Fala dev! Como posso te ajudar hoje?"}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {showProjectFiles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <button
              onClick={() => setShowProjectFiles(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <ProjectFiles
              files={projectFiles}
              onFileClick={(file) => {
                onSaveCode(file.content);
                setShowProjectFiles(false);
                toast.success(`Arquivo ${file.name} carregado no editor!`);
                
                // Trigger code execution
                const executeEvent = new CustomEvent('execute-code', { 
                  detail: { code: file.content } 
                });
                window.dispatchEvent(executeEvent);
              }}
            />
          </div>
        </div>
      )}

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
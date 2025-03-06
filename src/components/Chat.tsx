import React, { useState, useEffect } from 'react';
import { Send, Save, Plus, Code2, User, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { Message } from '../types';
import { API_URL, API_KEY } from '../config';
import HelpModal from './HelpModal';

interface ChatProps {
  onSaveCode: (code: string) => void;
  onAddToProject: (file: { name: string, content: string }) => void;
}

export default function Chat({ onSaveCode, onAddToProject }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Fala dev! Beleza? Eu sou o Julio, seu assistente de programação! 😎 Tô aqui pra te ajudar com qualquer problema de código, não importa a linguagem. Pode mandar ver nas perguntas que a gente resolve junto! O que você precisa?"
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    setSpeechEnabled('speechSynthesis' in window);
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
          contents: [{
            role: 'user',
            parts: [{
              text: input
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
        content: data.candidates[0].content.parts[0].text
      };

      setMessages(prev => [...prev, assistantMessage]);
      speakMessage(assistantMessage.content);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Putz, deu um erro aqui! Vamo tentar de novo? Se o problema persistir, verifique sua conexão com a internet ou tente mais tarde. 🤔'
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
              <h2 className="font-bold text-lg">Julio - Dev Assistant</h2>
              <p className="text-sm text-gray-600">Desenvolvedor Full Stack de São Paulo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
              onClick={() => setIsHelpOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Ajuda"
            >
              <HelpCircle className="w-6 h-6 text-gray-600" />
            </button>
          </div>
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
                    onClick={() => onSaveCode(message.content)}
                    className="p-2 text-sm bg-green-500 text-white rounded-md flex items-center gap-1 hover:bg-green-600 transition-colors"
                  >
                    <Save size={16} /> Salvar Código
                  </button>
                  <button
                    onClick={() => onAddToProject({
                      name: 'new-file.txt',
                      content: message.content
                    })}
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
            placeholder="Fala dev! Como posso te ajudar hoje?"
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

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
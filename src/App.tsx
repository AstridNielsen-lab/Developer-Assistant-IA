import React, { useState, useEffect, useRef } from 'react';
import Split from 'react-split';
import { Toaster, toast } from 'react-hot-toast';
import { Code2, Eye, FolderTree, Files } from 'lucide-react';
import Chat from './components/Chat';
import CodeEditor from './components/Editor';
import Console from './components/Console';
import SplashScreen from './components/SplashScreen';
import UserSetup from './components/UserSetup';
import Footer from './components/Footer';
import { SUPPORTED_LANGUAGES, DEFAULT_PROJECT_STRUCTURE } from './config';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useLocalStorage('userName', '');
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'files'>('code');
  const splitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSaveCode = (newCode: string) => {
    setCode(newCode);
    toast.success('Código atualizado no editor');
  };

  const handleAddToProject = (file: { name: string; content: string }) => {
    toast.success(`Arquivo ${file.name} adicionado ao projeto`);
  };

  const renderProjectStructure = () => {
    const structure = DEFAULT_PROJECT_STRUCTURE[language];
    return (
      <div className="p-4 bg-gray-800 text-white">
        <div className="flex items-center gap-2 mb-4">
          <FolderTree className="w-5 h-5" />
          <h3 className="font-medium">Estrutura do Projeto</h3>
        </div>
        <div className="space-y-1 font-mono text-sm">
          {structure.map((path, index) => (
            <div key={index} className="flex items-center gap-2">
              {path.endsWith('/') ? (
                <FolderTree className="w-4 h-4 text-yellow-400" />
              ) : (
                <Files className="w-4 h-4 text-blue-400" />
              )}
              <span>{path}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!userName) {
    return <UserSetup onComplete={setUserName} />;
  }

  return (
    <div className="h-screen flex flex-col">
      <Toaster position="top-right" />
      
      <div className="flex-1 flex">
        <div className="w-1/3 border-r">
          <Chat 
            onSaveCode={handleSaveCode} 
            onAddToProject={handleAddToProject}
            userName={userName}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="h-12 bg-gray-800 flex items-center px-4 gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1 px-3 py-1 rounded ${
                  activeTab === 'code' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Code2 size={16} />
                <span>Código</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-3 py-1 rounded ${
                  activeTab === 'preview' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Eye size={16} />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-1 px-3 py-1 rounded ${
                  activeTab === 'files' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Files size={16} />
                <span>Arquivos</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex">
            <div className="w-3/4 flex flex-col">
              {mounted && (
                <Split
                  ref={splitRef}
                  direction="vertical"
                  sizes={[70, 30]}
                  minSize={100}
                  gutterSize={8}
                  className="h-full flex flex-col"
                  style={{ height: '100%' }}
                  snapOffset={30}
                  dragInterval={1}
                >
                  <div className="overflow-hidden flex flex-col">
                    {activeTab === 'code' && (
                      <CodeEditor
                        code={code}
                        language={language}
                        onChange={(value) => setCode(value || '')}
                      />
                    )}
                    {activeTab === 'preview' && (
                      <div className="h-full bg-white">
                        <iframe
                          srcDoc={`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <style>
                                  body { margin: 0; padding: 16px; }
                                </style>
                              </head>
                              <body>
                                <script>${code}</script>
                              </body>
                            </html>
                          `}
                          className="w-full h-full border-none"
                          sandbox="allow-scripts"
                        />
                      </div>
                    )}
                    {activeTab === 'files' && (
                      <div className="h-full bg-gray-900 overflow-auto">
                        {renderProjectStructure()}
                      </div>
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <Console code={code} language={language} />
                  </div>
                </Split>
              )}
            </div>
            <div className="w-1/4 border-l border-gray-700 bg-gray-900">
              {renderProjectStructure()}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
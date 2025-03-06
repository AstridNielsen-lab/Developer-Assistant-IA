import React, { useState, useEffect, useRef } from 'react';
import Split from 'react-split';
import { Toaster, toast } from 'react-hot-toast';
import Chat from './components/Chat';
import CodeEditor from './components/Editor';
import Console from './components/Console';
import SplashScreen from './components/SplashScreen';
import UserSetup from './components/UserSetup';
import Footer from './components/Footer';
import { SUPPORTED_LANGUAGES } from './config';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useLocalStorage('userName', '');
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

        <div className="flex-1">
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
                <div className="h-12 bg-gray-800 flex items-center px-4">
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
                </div>
                <div className="flex-1">
                  <CodeEditor
                    code={code}
                    language={language}
                    onChange={(value) => setCode(value || '')}
                  />
                </div>
              </div>

              <div className="overflow-hidden">
                <Console code={code} language={language} />
              </div>
            </Split>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
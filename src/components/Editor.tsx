import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string | undefined) => void;
}

export default function CodeEditor({ code, language, onChange }: CodeEditorProps) {
  const [editor, setEditor] = useState<any>(null);
  const [monaco, setMonaco] = useState<any>(null);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    setEditor(editor);
    setMonaco(monaco);

    // Configurar sugestões personalizadas
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model: any, position: any) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Analisar o contexto do código
        const suggestions = generateContextualSuggestions(textUntilPosition, language);

        return {
          suggestions: suggestions.map((suggestion: string, index: number) => ({
            label: suggestion,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: suggestion,
            detail: 'Sugestão de código',
            sortText: String.fromCharCode(index),
          })),
        };
      },
    });

    // Adicionar decorações para indicar possíveis erros ou sugestões
    editor.onDidChangeModelContent(() => {
      if (typingTimer) {
        clearTimeout(typingTimer);
      }

      const newTimer = setTimeout(() => {
        analyzeCode(editor.getValue());
      }, 1000);

      setTypingTimer(newTimer);
    });
  };

  const generateContextualSuggestions = (text: string, lang: string): string[] => {
    // Aqui você pode implementar lógica mais avançada baseada no contexto
    const suggestions: string[] = [];

    if (lang === 'javascript' || lang === 'typescript') {
      if (text.includes('function') && !text.includes('return')) {
        suggestions.push('return result;');
      }
      if (text.includes('if') && !text.includes('else')) {
        suggestions.push('else {\n  // código aqui\n}');
      }
      if (text.includes('try') && !text.includes('catch')) {
        suggestions.push('catch (error) {\n  console.error(error);\n}');
      }
    }

    return suggestions;
  };

  const analyzeCode = (currentCode: string) => {
    if (!editor || !monaco) return;

    const model = editor.getModel();
    const decorations: any[] = [];

    // Exemplo de análise simples
    const lines = currentCode.split('\n');
    lines.forEach((line, index) => {
      // Verificar parênteses não fechados
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      
      if (openParens !== closeParens) {
        decorations.push({
          range: new monaco.Range(index + 1, 1, index + 1, line.length + 1),
          options: {
            isWholeLine: true,
            className: 'myContentClass',
            glyphMarginClassName: 'myGlyphMarginClass',
            inlineClassName: 'myInlineDecoration',
            hoverMessage: { value: 'Possível erro: parênteses não fechados' },
            glyphMarginHoverMessage: { value: 'Verifique os parênteses nesta linha' },
            overviewRuler: {
              color: 'red',
              position: monaco.editor.OverviewRulerLane.Right,
            },
          },
        });
      }

      // Verificar funções sem return
      if (line.includes('function') && !currentCode.includes('return')) {
        decorations.push({
          range: new monaco.Range(index + 1, 1, index + 1, line.length + 1),
          options: {
            isWholeLine: true,
            className: 'myContentClass',
            glyphMarginClassName: 'myGlyphMarginClass',
            hoverMessage: { value: 'Sugestão: Adicione um return à função' },
          },
        });
      }
    });

    // Aplicar decorações
    editor.deltaDecorations([], decorations);
  };

  return (
    <div className="relative h-full">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={code}
        onChange={onChange}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          snippetSuggestions: 'inline',
          parameterHints: {
            enabled: true,
          },
          suggest: {
            showIcons: true,
            showStatusBar: true,
            showInlineDetails: true,
            preview: true,
          },
          hover: {
            enabled: true,
            delay: 300,
          },
        }}
      />
      <style>{`
        .myContentClass {
          background-color: rgba(255, 0, 0, 0.1);
        }
        .myGlyphMarginClass {
          background-color: red;
        }
        .myInlineDecoration {
          text-decoration: wavy underline red;
        }
      `}</style>
    </div>
  );
}
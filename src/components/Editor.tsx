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

  const handleEditorDidMount = (editor: any, monaco: any) => {
    setEditor(editor);
    setMonaco(monaco);

    // Configurar auto-complete e snippets
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = [
          {
            label: 'console.log',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'console.log(${1:value});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Log to console',
            range: range
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'function ${1:name}(${2:params}) {',
              '\t${3}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Function declaration',
            range: range
          },
          {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'if (${1:condition}) {',
              '\t${2}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'If statement',
            range: range
          },
          {
            label: 'try',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'try {',
              '\t${1}',
              '} catch (error) {',
              '\t${2}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Try-catch block',
            range: range
          }
        ];

        // Adicionar sugestões específicas para cada linguagem
        if (language === 'javascript' || language === 'typescript') {
          suggestions.push(
            {
              label: 'async',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: [
                'async function ${1:name}(${2:params}) {',
                '\t${3}',
                '}'
              ].join('\n'),
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Async function declaration',
              range: range
            },
            {
              label: 'promise',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: [
                'return new Promise((resolve, reject) => {',
                '\t${1}',
                '});'
              ].join('\n'),
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Create new Promise',
              range: range
            }
          );
        }

        return { suggestions };
      }
    });

    // Configurar hover provider
    monaco.languages.registerHoverProvider(language, {
      provideHover: (model: any, position: any) => {
        const word = model.getWordAtPosition(position);
        if (!word) return;

        const documentation = getDocumentation(word.word);
        if (documentation) {
          return {
            contents: [
              { value: '**' + word.word + '**' },
              { value: documentation }
            ]
          };
        }
      }
    });
  };

  const getDocumentation = (word: string): string | null => {
    const docs: Record<string, string> = {
      'console.log': 'Outputs a message to the web console',
      'function': 'Declares a function with the specified parameters',
      'if': 'Executes a statement if a specified condition is truthy',
      'try': 'Marks a block of statements to try and specifies a response should an exception be thrown',
      'async': 'Declares an async function that returns a Promise',
      'Promise': 'Represents the eventual completion (or failure) of an asynchronous operation'
    };

    return docs[word] || null;
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
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true
          },
          parameterHints: {
            enabled: true
          },
          snippetSuggestions: 'inline',
          suggest: {
            localityBonus: true,
            showIcons: true,
            showStatusBar: true,
            preview: true,
            shareSuggestSelections: true,
            showInlineDetails: true,
            maxVisibleSuggestions: 12,
            filterGraceful: true,
            insertMode: 'insert'
          },
          hover: {
            enabled: true,
            delay: 300
          },
          inlineSuggest: {
            enabled: true
          },
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on'
        }}
      />
    </div>
  );
}
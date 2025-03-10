import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { AlertCircle, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL, API_KEY } from '../config';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string | undefined) => void;
}

function CodeEditor({ code, language, onChange }: CodeEditorProps) {
  const [editor, setEditor] = useState<any>(null);
  const [monaco, setMonaco] = useState<any>(null);
  const [isFixing, setIsFixing] = useState(false);

  const fixCodeWithGemini = async (errorMessage: string, codeToFix: string): Promise<string | null> => {
    try {
      const prompt = `Fix the following code error. Only respond with the corrected code, no explanations:
Error: ${errorMessage}

Code:
${codeToFix}`;

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get fix suggestion');
      }

      const data = await response.json();
      const fixedCode = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      // Remove any markdown code blocks if present
      return fixedCode?.replace(/```[\w]*\n?|\n```/g, '').trim() || null;
    } catch (error) {
      console.error('Error getting fix:', error);
      return null;
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    setEditor(editor);
    setMonaco(monaco);

    // Add custom hover provider for errors
    monaco.languages.registerHoverProvider(language, {
      provideHover: async (model: any, position: any) => {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        const lineNumber = position.lineNumber;
        const column = position.column;
        
        // Find if there's an error at the current position
        const errorAtPosition = markers.find((marker: any) => {
          return marker.severity === monaco.MarkerSeverity.Error &&
                 marker.startLineNumber <= lineNumber &&
                 marker.endLineNumber >= lineNumber &&
                 marker.startColumn <= column &&
                 marker.endColumn >= column;
        });

        if (errorAtPosition) {
          const errorRange = new monaco.Range(
            errorAtPosition.startLineNumber,
            errorAtPosition.startColumn,
            errorAtPosition.endLineNumber,
            errorAtPosition.endColumn
          );

          const codeAtError = model.getValueInRange(errorRange);

          return {
            range: errorRange,
            contents: [
              { value: '**Error:** ' + errorAtPosition.message },
              {
                value: `[Fix with Gemini AI](command:fixError)`,
                isTrusted: true
              }
            ]
          };
        }
      }
    });

    // Add custom command for fixing errors
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Period, async () => {
      const position = editor.getPosition();
      const markers = monaco.editor.getModelMarkers({ resource: model.uri });
      const errorAtPosition = markers.find((marker: any) => {
        return marker.severity === monaco.MarkerSeverity.Error &&
               marker.startLineNumber === position.lineNumber;
      });

      if (errorAtPosition) {
        await handleErrorFix(errorAtPosition);
      }
    });

    // Add context menu action
    editor.addAction({
      id: 'fix-error-gemini',
      label: 'Fix with Gemini AI',
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: async (ed: any) => {
        const position = ed.getPosition();
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        const errorAtPosition = markers.find((marker: any) => {
          return marker.severity === monaco.MarkerSeverity.Error &&
                 marker.startLineNumber === position.lineNumber;
        });

        if (errorAtPosition) {
          await handleErrorFix(errorAtPosition);
        }
      }
    });
  };

  const handleErrorFix = async (error: any) => {
    if (isFixing) return;
    
    setIsFixing(true);
    const loadingToast = toast.loading('Analyzing code and generating fix...');

    try {
      const model = editor.getModel();
      const errorRange = new monaco.Range(
        error.startLineNumber,
        error.startColumn,
        error.endLineNumber,
        error.endColumn
      );
      
      const codeAtError = model.getValueInRange(errorRange);
      const fixedCode = await fixCodeWithGemini(error.message, codeAtError);

      if (fixedCode) {
        // Create edit operation
        const edit = {
          range: errorRange,
          text: fixedCode,
          forceMoveMarkers: true
        };

        // Apply the edit
        editor.executeEdits('fix-error', [edit]);
        toast.success('Code fixed successfully!', { id: loadingToast });
      } else {
        toast.error('Could not generate a fix', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error fixing code:', error);
      toast.error('Failed to fix code', { id: loadingToast });
    } finally {
      setIsFixing(false);
    }
  };

  // Add custom decorations for error markers
  useEffect(() => {
    if (editor && monaco) {
      const decorations = editor.getModel().getAllDecorations();
      const errorDecorations = decorations.filter((d: any) => 
        d.options.className === 'squiggly-error'
      );

      const newDecorations = errorDecorations.map((d: any) => ({
        range: d.range,
        options: {
          ...d.options,
          glyphMarginClassName: 'error-glyph',
          glyphMarginHoverMessage: { value: 'Click to fix with Gemini AI' }
        }
      }));

      editor.getModel().deltaDecorations([], newDecorations);
    }
  }, [editor, monaco, code]);

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
          glyphMargin: true,
          lightbulb: {
            enabled: true
          },
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on'
        }}
      />
      {isFixing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-500 animate-spin" />
            <span>Fixing code with Gemini AI...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodeEditor;
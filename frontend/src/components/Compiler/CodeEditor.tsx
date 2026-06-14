import React, { useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

interface Props {
  code: string;
  setCode: (code: string) => void;
  fontSize: number;
  language: string;
  errorLine: number | null;
}

const CodeEditor: React.FC<Props> = ({ code, setCode, fontSize, language, errorLine }) => {
  const monaco = useMonaco();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  // Map backend language keys to monaco supported languages
  const getMonacoLanguage = (lang: string) => {
    const map: Record<string, string> = {
      c: "c", cpp: "cpp", java: "java", python: "python",
      javascript: "javascript", csharp: "csharp",
      go: "go", rust: "rust", php: "php", ruby: "ruby"
    };
    return map[lang] || "plaintext";
  };

  const monacoLanguage = getMonacoLanguage(language);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const shortcuts = ["{", "}", "(", ")", ";", "#", ",", "<", ">", '"', "=", "/", ".", ":", "+", "-", "*", "_"];

  const handleShortcut = (char: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      editorRef.current.trigger('keyboard', 'type', { text: char });
    } else {
      setCode(code + char);
    }
  };

  useEffect(() => {
    if (editorRef.current && monaco) {
      if (errorLine && errorLine > 0) {
        decorationsRef.current = editorRef.current.deltaDecorations(
          decorationsRef.current,
          [
            {
              range: new monaco.Range(errorLine, 1, errorLine, 1),
              options: {
                isWholeLine: true,
                className: 'bg-red-500/20 border-l-4 border-red-500',
              }
            }
          ]
        );
      } else {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
    }
  }, [errorLine, monaco]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-[#1e1e1e]">
      {/* Mobile/Quick Shortcut Bar */}
      <div className="flex gap-2 overflow-x-auto p-2 bg-[#111114] border-b border-white/5 flex-shrink-0 custom-scrollbar">
        {shortcuts.map((char, index) => (
          <button
            key={index}
            onClick={() => handleShortcut(char)}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white/5 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-lg text-sm font-mono transition-colors"
          >
            {char}
          </button>
        ))}
      </div>

      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={monacoLanguage}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          options={{
            fontSize: fontSize,
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            fontFamily: '"Fira code", "Fira Mono", monospace',
            padding: { top: 16 }
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
import React, { useEffect } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import LineNumbers from "./LineNumbers"; 

import "prismjs/themes/prism-tomorrow.css"; 
import "prismjs/components/prism-c";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";

interface Props {
  code: string;
  setCode: (code: string) => void;
  fontSize: number;
  language: string;
  errorLine: number | null;
}

const CodeEditor: React.FC<Props> = ({ code, setCode, fontSize, language, errorLine }) => {
  const shortcuts = ["{", "}", "(", ")", ";", "#", "," ,"<", ">", '"', "=", "/", ".", ":", "+", "-", "*", "_"];

  const handleShortcut = (char: string) => {
    const textarea = document.querySelector(".custom-editor textarea") as HTMLTextAreaElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + char + code.substring(end);
      
      setCode(newCode);

      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + char.length;
      }, 0);
    } else {
      setCode(code + char);
    }
  };

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  
  const calculatedLineHeight = fontSize * 1.5;
  const editorPadding = 20;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0b]">
      
      <div className="flex gap-2 overflow-x-auto p-2 bg-[#111114] border-b border-white/5 no-scrollbar flex-shrink-0">
        {shortcuts.map((char) => (
          <button 
            key={char}
            onClick={() => handleShortcut(char)}
            className="flex-shrink-0 bg-white/10 px-4 py-2 rounded-lg text-sm font-bold active:bg-indigo-600 transition-all text-indigo-300 border border-white/10"
          >
            {char}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        <LineNumbers 
          lines={code.split("\n").length} 
          fontSize={fontSize} 
          errorLine={errorLine} 
        />

        <div className="flex-1 overflow-auto relative custom-editor">
          
          {errorLine && errorLine > 0 && (
            <div 
              style={{
                position: "absolute",
                top: `${editorPadding + (errorLine - 1) * calculatedLineHeight}px`,
                height: `${calculatedLineHeight}px`,
                left: 0,
                right: 0,
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                borderLeft: "4px solid #ef4444",
                pointerEvents: "none",
                zIndex: 0
              }}
            />
          )}
          <Editor
            value={code}
            onValueChange={(code) => setCode(code)}
            highlight={(code) => Prism.highlight(code, Prism.languages[language] || Prism.languages.c, language)}
            padding={editorPadding}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: `${fontSize}px`,
              lineHeight: `${calculatedLineHeight}px`, 
              minHeight: "100%",
              backgroundColor: "transparent",
              color: "#fff",
              position: "relative",
              zIndex: 1
            }}
            className="outline-none"
          />
        </div>
      </div>

    </div>
  );
};

export default CodeEditor;
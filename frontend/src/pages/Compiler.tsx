import React, { useState } from "react";
import axios from "axios";
import { Play, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";


import LanguageSelector from "../components/Compiler/LanguageSelector";
import CodeEditor from "../components/Compiler/CodeEditor";
import Console from "../components/Compiler/Console";

const codeTemplates: { [key: string]: string } = {
  c: '#include <stdio.h>\n\nint main() {\n    printf("welcome to BaseByte C!");\n    return 0;\n}',
  python: 'print("Hello Students, Python is easy!")',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Java World!");\n    }\n}'
};

export default function Compiler() {
  const [language, setLanguage] = useState("c");
  const [code, setCode] = useState(codeTemplates.c);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState(""); 
  const [fontSize, setFontSize] = useState(16);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [input, setInput] = useState(""); 
  const [hint, setHint] = useState("");

  
  const handleRun = async () => {
  setStatus("loading");
  setErrorLine(null);
  setHint(""); 
  setOutput("Compiling your code... ⚙️");

  try {
    const response = await axios.post("http://localhost:5000/run", { 
      code, 
      language, 
      input  
    });

    const { output: resOutput, stderr, hint: resHint } = response.data;

    if (stderr) {
      setStatus("error");

      const lineMatch = stderr.match(/:(?:\s+)?(\d+)(?::\d+)?/);
      const lineNo = lineMatch ? parseInt(lineMatch[1]) : "X";
      setErrorLine(lineMatch ? lineNo : null); 

      const manualHint = resHint || "Bhai, code check kar le!";

      setOutput(`${stderr}---${manualHint}---${lineNo}`);
      setHint(manualHint); 
    } else {
      setOutput(resOutput);
      setStatus("success");
      setHint("");
    }
    
    console.log("Execution successful:", response.data); 
  } catch (error) {
    setStatus("error");
    setOutput("Connection Error! Is the backend server running?---Check backend connection.---X");
    setHint("Check backend connection.");
  }
};

  return (
    <div className="flex flex-col lg:flex-row h-screen pt-6 bg-[#050505] text-white overflow-hidden ">
      
      
      <div className="w-full lg:w-[60%] h-[75vh] lg:h-full border-r border-white/5 flex flex-col overflow-hidden focus-within:outline-none">
        
        {/* Toolbar with Language Selector and Controls */}
        <div className="bg-[#111114] p-3 flex flex-shrink-0 justify-between items-center px-4 md:px-6 border-b border-white/5 z-10 focus-within:outline-none focus:outline-none">
          <div className="flex items-center gap-2">
            <LanguageSelector 
              language={language} 
              setLanguage={setLanguage} 
              onLanguageChange={(lang) => {
                setCode(codeTemplates[lang]);
                setErrorLine(null);
                setOutput("");
                setInput(""); 
              }}
            />
            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
              <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-1"><ZoomOut size={14}/></button>
              <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className="p-1"><ZoomIn size={14}/></button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setCode(""); setErrorLine(null); setOutput(""); setInput(""); }} 
              className="p-2 text-gray-500 hover:text-white"
            >
              <RotateCcw size={16} />
            </button>
            <button 
              onClick={handleRun}
              disabled={status === "loading"}
              className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Play size={12} fill="currentColor" /> {status === "loading" ? "..." : "RUN"}
            </button>
          </div>
        </div>
        
        <CodeEditor 
          code={code} 
          setCode={(newCode) => {
            setCode(newCode);
            if (errorLine) setErrorLine(null); 
          }}
          fontSize={fontSize}
          language={language}
          errorLine={errorLine}
        />
      </div>

      {/* Console Section with Input/Output Tabs */}
      <div className="w-full lg:w-[40%] h-[45vh] lg:h-full bg-[#050505] flex flex-col">
        <Console 
           output={output} 
           status={status} 
           input={input} 
           setInput={setInput} 
        />
      </div>

    </div>
  );
}
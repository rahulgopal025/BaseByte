import { useState } from "react";
import { Play, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

import LanguageSelector from "../../components/Compiler/LanguageSelector";
import CodeEditor from "../../components/Compiler/CodeEditor";
import Console from "../../components/Compiler/Console";
import { codeTemplates, judge0LanguageIds } from "../../utils/compilerUtils";

export default function Compiler() {
  const [compilerMode, setCompilerMode] = useState<"onecompiler" | "basebyte">("onecompiler");
  const [language, setLanguage] = useState("c");
  const [code, setCode] = useState(codeTemplates.c);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [input, setInput] = useState("");

  const handleRun = async () => {
    setStatus("loading");
    setErrorLine(null);
    setOutput("Compiling your code... ⚙️");

    try {
      const encodeBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));
      const decodeBase64 = (str: string) => str ? decodeURIComponent(escape(atob(str))) : "";

      const judge0ApiKey = import.meta.env.VITE_JUDGE0_API_KEY;
      const useRapidApi = judge0ApiKey && judge0ApiKey !== "your_judge0_key_here";

      const judge0Url = useRapidApi
        ? "https://judge0-ce.p.rapidapi.com/submissions?wait=true&base64_encoded=true"
        : "https://ce.judge0.com/submissions?wait=true&base64_encoded=true";

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (useRapidApi) {
        headers["X-RapidAPI-Key"] = judge0ApiKey;
        headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
      }

      const response = await fetch(judge0Url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          source_code: encodeBase64(code),
          language_id: judge0LanguageIds[language] || 71,
          stdin: encodeBase64(input || "")
        })
      });

      const data = await response.json();
      const stdout = decodeBase64(data.stdout);
      const stderr = decodeBase64(data.stderr);
      const compileOutput = decodeBase64(data.compile_output);
      const statusDescription = data.status?.description || "Unknown Status";

      if (data.status?.id !== 3) {
        setStatus("error");
        const errorDetails = compileOutput || stderr || "An unknown error occurred";
        const lineMatch = errorDetails.match(/:(?:\s+)?(\d+)(?::\d+)?/);
        const lineNo = lineMatch ? parseInt(lineMatch[1]) : null;
        setErrorLine(lineNo);
        setOutput(`[${statusDescription}]\n\n${errorDetails}`);
      } else {
        setOutput(`[${statusDescription}]\n\n${stdout}`);
        setStatus("success");
      }
    } catch {
      setStatus("error");
      setOutput("Compiler Service Unavailable. Please check your network connection.");
    }
  };

  return (
    <div className="flex flex-col h-screen pt-4 bg-[#050505] text-white overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-white/5 bg-[#08080A] flex-shrink-0">
        <button
          onClick={() => setCompilerMode('onecompiler')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${compilerMode === 'onecompiler' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 border border-white/5'}`}
        >
          OneCompiler
        </button>
        <button
          onClick={() => setCompilerMode('basebyte')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${compilerMode === 'basebyte' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 border border-white/5'}`}
        >
          BaseByte Compiler
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {compilerMode === "onecompiler" ? (
          <div className="w-full h-full relative">
            <iframe
              src="https://onecompiler.com/c"
              className="absolute inset-0 w-full h-full border-none"
              title="OneCompiler"
              allow="clipboard-read; clipboard-write"
            />
          </div>
        ) : (
          <>
            <div className="w-full lg:w-[60%] h-[75vh] lg:h-full border-r border-white/5 flex flex-col overflow-hidden focus-within:outline-none">
              <div className="bg-[#111114] p-3 flex flex-shrink-0 justify-between items-center px-4 md:px-6 border-b border-white/5 z-10 focus-within:outline-none focus:outline-none">
                <div className="flex items-center gap-2">
                  <LanguageSelector
                    language={language}
                    setLanguage={setLanguage}
                    onLanguageChange={(lang) => {
                      setCode(codeTemplates[lang] || "");
                      setErrorLine(null);
                      setOutput("");
                      setInput("");
                    }}
                  />
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                    <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-1"><ZoomOut size={14} /></button>
                    <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className="p-1"><ZoomIn size={14} /></button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setCode(codeTemplates[language] || ""); setErrorLine(null); setOutput(""); setInput(""); }}
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

            <div className="w-full lg:w-[40%] h-[45vh] lg:h-full bg-[#050505] flex flex-col">
              <Console
                output={output}
                status={status}
                input={input}
                setInput={setInput}
                errorLine={errorLine}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

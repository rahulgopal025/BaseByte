import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProblemById } from "../../api/problem.api";
import type { Problem } from "../../types/problem.types";
import { ChevronLeft, Info, Terminal, Play, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import LanguageSelector from "../../components/Compiler/LanguageSelector";
import CodeEditor from "../../components/Compiler/CodeEditor";
import Console from "../../components/Compiler/Console";
import axiosInstance from "../../api/axios.instance";
import { API_ENDPOINTS } from "../../constants/api.constants";
import { useToastContext } from "../../context/ToastContext";

import { codeTemplates, judge0LanguageIds } from "../../utils/compilerUtils";

export default function ProblemSolve() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToastContext();

  // Compiler state
  const [language, setLanguage] = useState("c");
  const [code, setCode] = useState(codeTemplates.c);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState(""); 
  const [fontSize, setFontSize] = useState(14);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [input, setInput] = useState(""); 
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await getProblemById(id!);
        setProblem(res.data.data || res.data);
        if (res.data.data?.language) {
           const lang = res.data.data.language.toLowerCase();
           setLanguage(lang);
           setCode(codeTemplates[lang] || "");
        }
      } catch (err) {
        console.error("Failed to fetch problem:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const handleRun = async () => {
    setStatus("loading");
    setErrorLine(null);
    setOutput("Compiling your code... ⚙️");

    try {
      const encodeBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));
      const decodeBase64 = (str: string) => str ? decodeURIComponent(escape(atob(str))) : "";

      const response = await fetch("https://ce.judge0.com/submissions?wait=true&base64_encoded=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        const outNorm = stdout.trim();
        const expNorm = problem?.sampleOutput?.trim() || "";
        
        if (!expNorm || outNorm === expNorm) {
          setOutput(`[${statusDescription}]\n\n${stdout}`);
          setStatus("success");
        } else {
          setOutput(`[Wrong Answer]\n\nExpected:\n${expNorm}\n\nGot:\n${outNorm}`);
          setStatus("error");
        }
      }
    } catch {
      setStatus("error");
      setOutput("Compiler Service Unavailable. Please check your network connection.");
    }
  };

  const handleSubmit = async () => {
    if (!output || output === "Compiling your code... ⚙️") {
      showToast("Please run your code first before submitting.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.post("/api/submissions", {
        problemId: id,
        code,
        language,
        status: status === "success" ? "Accepted" : "Wrong Answer",
        testResults: []
      });
      showToast("Solution submitted successfully!", "success");
    } catch {
      showToast("Failed to submit. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-600 font-black uppercase tracking-[0.2em] text-[10px]">Initializing Editor...</div>;

  return (
    <div className="h-screen bg-[#050505] flex flex-col overflow-hidden font-['Public_Sans',_sans-serif]">
      
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0d0e] shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="h-6 w-[1px] bg-white/10"></div>
          <h2 className="font-black text-sm tracking-tight text-white uppercase">{problem?.title}</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-lg">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Challenge</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        <div className="w-1/3 border-r border-white/5 flex flex-col bg-[#0d0d0e]">
          <div className="flex items-center gap-2 p-4 border-b border-white/5 bg-white/[0.02]">
            <Info size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Description</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <h1 className="text-2xl font-black text-white mb-6 leading-tight">{problem?.title}</h1>
            <div className="prose prose-invert max-w-none">
              <p className="text-zinc-400 leading-relaxed text-sm mb-8">{problem?.description}</p>
              
              <div className="space-y-6">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                    <Terminal size={12} /> Expected Input
                  </h4>
                  <pre className="text-indigo-400 font-mono text-xs">{problem?.sampleInput || "No specific input required."}</pre>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                    <Terminal size={12} /> Expected Output
                  </h4>
                  <pre className="text-emerald-400 font-mono text-xs">{problem?.sampleOutput}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="w-full flex-1 border-b border-white/5 flex flex-col overflow-hidden focus-within:outline-none">
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
                  className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all text-white"
                >
                  <Play size={12} fill="currentColor" /> {status === "loading" ? "..." : "RUN"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit"}
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

          <div className="w-full h-1/3 bg-[#050505] flex flex-col">
            <Console 
               output={output} 
               status={status} 
               input={input} 
               setInput={setInput} 
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}
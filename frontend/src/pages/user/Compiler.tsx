import { useState, useCallback } from "react";
import { Play, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import Groq from "groq-sdk";

import LanguageSelector from "../../components/Compiler/LanguageSelector";
import CodeEditor from "../../components/Compiler/CodeEditor";
import Console from "../../components/Compiler/Console";
import { ChatMessage } from "../../components/Compiler/AIAgent";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

// AI hint for the BaseByte Hint box (short, funny, 1-liner)
const getAIHint = async (errorText: string, language: string): Promise<string> => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      max_tokens: 100,
      messages: [
        {
          role: "system",
          content: `Tu ek funny coding teacher hai jo Hinglish mein bolta hai (Hindi + English mix). 
Student ka code mein error aaya hai. 
Ek single funny helpful hint de — max 1-2 lines, emoji use kar, lovingly roast karo!
Sirf hint do, kuch aur mat likho.`
        },
        {
          role: "user",
          content: `Language: ${language}
Error: ${errorText}
Ek funny Hinglish hint do is error ke liye!`
        }
      ]
    });
    return response.choices[0]?.message?.content || "Code dobara dekho bhai! 😅";
  } catch (err) {
    return "Kuch toh gadbad hai Daya! 🔍";
  }
};

// Full AI response for the chat agent (detailed, with code fixes)
const getAIResponse = async (
  userMessage: string,
  code: string,
  language: string,
  error: string,
  chatHistory: ChatMessage[]
): Promise<string> => {
  try {
    // Build conversation history for context
    const historyMessages = chatHistory
      .filter(m => !m.loading)
      .slice(-10) // Keep last 10 messages for context
      .map(m => ({
        role: m.role === "ai" ? "assistant" as const : "user" as const,
        content: m.content
      }));

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: `Tu BaseByte ka AI coding assistant hai. 
Tu Hinglish mein baat karta hai (Hindi + English mix).
Tu funny aur helpful hai — student ko lovingly roast karta hai but solution bhi deta hai.
Hamesha current code aur error ko context mein rakh.
Error hone par:
1. Pehle ek funny Hinglish hint do (1 line, emoji ke saath)
2. Phir error ka simple Hindi explanation do
3. Phir exact fixed code snippet do
Code complete karne ke liye pucha toh pura code do.
Short aur clear raho — novel mat likho!`
        },
        ...historyMessages,
        {
          role: "user",
          content: `Language: ${language}
          
Current Code:
${code}

Error (if any):
${error || "No error"}

User ka sawaal: ${userMessage}`
        }
      ]
    });
    return response.choices[0]?.message?.content || "Kuch toh gadbad hai Daya! 🔍";
  } catch (err) {
    return "AI abhi thoda busy hai, thodi der baad try karo! 😅";
  }
};

const codeTemplates: { [key: string]: string } = {
  c: '#include <stdio.h>\n\nint main() {\n    printf("welcome to BaseByte C!");\n    return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Welcome to BaseByte C++!" << endl;\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Java World!");\n    }\n}',
  python: 'print("Hello Students, Python is easy!")',
  javascript: 'console.log("Welcome to JavaScript!");',
  csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Welcome to C#!");\n    }\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Welcome to Go!")\n}',
  rust: 'fn main() {\n    println!("Welcome to Rust!");\n}',
  php: '<?php\n\necho "Welcome to PHP!";\n?>',
  ruby: 'puts "Welcome to Ruby!"'
};

const judge0LanguageIds: Record<string, number> = {
  python: 71, javascript: 63, c: 50, cpp: 54, java: 62, csharp: 51, php: 68, ruby: 72, go: 60, rust: 73
};

export default function Compiler() {
  const [compilerMode, setCompilerMode] = useState<"onecompiler" | "basebyte">("onecompiler");
  const [language, setLanguage] = useState("c");
  const [code, setCode] = useState(codeTemplates.c);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [hint, setHint] = useState("");

  // AI Agent state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"output" | "input" | "ai-agent">("output");
  const [lastError, setLastError] = useState("");

  const handleSendChatMessage = useCallback(async (userMessage: string) => {
    if (isChatLoading) return;

    // Add user message
    const userMsg: ChatMessage = { role: "user", content: userMessage };
    const loadingMsg: ChatMessage = { role: "ai", content: "", loading: true };
    setChatMessages(prev => [...prev, userMsg, loadingMsg]);
    setIsChatLoading(true);

    try {
      const aiResponse = await getAIResponse(userMessage, code, language, lastError, chatMessages);
      setChatMessages(prev =>
        prev.map((msg, i) =>
          i === prev.length - 1
            ? { role: "ai", content: aiResponse, loading: false }
            : msg
        )
      );
    } catch {
      setChatMessages(prev =>
        prev.map((msg, i) =>
          i === prev.length - 1
            ? { role: "ai", content: "AI abhi thoda busy hai, thodi der baad try karo! 😅", loading: false }
            : msg
        )
      );
    } finally {
      setIsChatLoading(false);
    }
  }, [code, language, lastError, chatMessages, isChatLoading]);

  const handleRun = async () => {
    setStatus("loading");
    setErrorLine(null);
    setHint("");
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
        const lineNo = lineMatch ? parseInt(lineMatch[1]) : "X";
        setErrorLine(lineMatch ? lineNo : null);

        setOutput(`[${statusDescription}]\n\n${errorDetails}`);
        setLastError(errorDetails);

        // BaseByte Hint (short, 1-liner)
        setHint("AI soch raha hai... 🤔");
        getAIHint(errorDetails, language).then((aiHint) => setHint(aiHint));

        // Auto-trigger AI Agent chat with detailed error analysis
        setActiveConsoleTab("ai-agent");
        const autoMsg: ChatMessage = { role: "ai", content: "", loading: true };
        setChatMessages(prev => [...prev, autoMsg]);
        setIsChatLoading(true);

        getAIResponse(
          "Is error ko explain karo aur fix batao",
          code,
          language,
          errorDetails,
          chatMessages
        ).then((aiResponse) => {
          setChatMessages(prev =>
            prev.map((msg, i) =>
              i === prev.length - 1
                ? { role: "ai", content: aiResponse, loading: false }
                : msg
            )
          );
          setIsChatLoading(false);
        }).catch(() => {
          setChatMessages(prev =>
            prev.map((msg, i) =>
              i === prev.length - 1
                ? { role: "ai", content: "AI abhi thoda busy hai, thodi der baad try karo! 😅", loading: false }
                : msg
            )
          );
          setIsChatLoading(false);
        });
      } else {
        setOutput(`[${statusDescription}]\n\n${stdout}`);
        setStatus("success");
        setHint("Wah bhai wah! Code chal gaya! 🎉");
        setLastError("");
      }
    } catch (error: any) {
      setStatus("error");
      setOutput("Compiler Service Unavailable. Please check your network connection.");
      setHint("Check network connection.");
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

            <div className="w-full lg:w-[40%] h-[45vh] lg:h-full bg-[#050505] flex flex-col">
              <Console
                output={output}
                status={status}
                input={input}
                setInput={setInput}
                hint={hint}
                errorLine={errorLine}
                chatMessages={chatMessages}
                onSendChatMessage={handleSendChatMessage}
                isChatLoading={isChatLoading}
                activeTab={activeConsoleTab}
                setActiveTab={setActiveConsoleTab}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
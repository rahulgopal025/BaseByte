import React, { useState } from "react";
import { Terminal, Keyboard, AlertCircle, Lightbulb, Bot } from "lucide-react";
import AIAgent, { ChatMessage } from "./AIAgent";

interface ConsoleProps {
  output: string;
  status: string;
  input: string;
  setInput: (val: string) => void;
  hint?: string;
  errorLine?: number | string | null;
  chatMessages?: ChatMessage[];
  onSendChatMessage?: (message: string) => void;
  isChatLoading?: boolean;
  activeTab?: "output" | "input" | "ai-agent";
  setActiveTab?: (tab: "output" | "input" | "ai-agent") => void;
}

const Console: React.FC<ConsoleProps> = ({
  output, status, input, setInput, hint, errorLine,
  chatMessages = [], onSendChatMessage, isChatLoading = false,
  activeTab: controlledTab, setActiveTab: controlledSetActiveTab
}) => {
  const [internalTab, setInternalTab] = useState<"output" | "input" | "ai-agent">("output");
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = controlledSetActiveTab ?? setInternalTab;
  const showAIAgent = !!onSendChatMessage;
  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">

      <div className="flex border-b border-white/5 bg-[#0a0a0b]">
        <button
          onClick={() => setActiveTab("output")}
          className={`flex items-center gap-2 px-6 py-3 text-[10px] font-bold tracking-widest uppercase transition-all ${
            activeTab === "output" ? "text-white border-b-2 border-indigo-500 bg-white/5" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Terminal size={14} /> Output
        </button>
        <button
          onClick={() => setActiveTab("input")}
          className={`flex items-center gap-2 px-6 py-3 text-[10px] font-bold tracking-widest uppercase transition-all ${
            activeTab === "input" ? "text-white border-b-2 border-indigo-500 bg-white/5" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Keyboard size={14} /> Custom Input
        </button>
        {showAIAgent && (
        <button
          onClick={() => setActiveTab("ai-agent")}
          className={`flex items-center gap-2 px-6 py-3 text-[10px] font-bold tracking-widest uppercase transition-all relative ${
            activeTab === "ai-agent" ? "text-white border-b-2 border-indigo-500 bg-white/5" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Bot size={14} /> AI Agent
          {isChatLoading && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
          )}
        </button>
        )}
      </div>

      {activeTab === "ai-agent" && showAIAgent ? (
        <AIAgent
          messages={chatMessages}
          onSendMessage={onSendChatMessage!}
          isLoading={isChatLoading}
        />
      ) : (
        <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed">
          {activeTab === "input" ? (
            <div className="h-full flex flex-col">
              <p className="text-[10px] text-gray-500 mb-3 uppercase tracking-tighter">Enter values for scanf/input():</p>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ex: 10 20"
                className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-4 text-indigo-300 outline-none focus:border-indigo-500/30 transition-all resize-none"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {status === "error" ? (
                <div className="space-y-4">

                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase mb-2">
                      <AlertCircle size={14} /> Technical Error {errorLine ? `(Line ${errorLine})` : ""}
                    </div>
                    <pre className="text-red-400/80 whitespace-pre-wrap break-all">{output}</pre>
                  </div>

                  {hint && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden group">
                    <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-bold uppercase mb-3">
                      <Lightbulb size={14} className="animate-pulse" /> BaseByte Hint
                    </div>
                    <p className="text-indigo-100 italic relative z-10">"{hint}"</p>
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                      <Lightbulb size={80} />
                    </div>
                  </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <pre className={`${status === "success" ? "text-green-400" : "text-gray-400"}`}>
                    {output || "Code run karo, result yahan dikhega... 🚀"}
                  </pre>
                  {hint && status === "success" && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 relative overflow-hidden group">
                      <div className="flex items-center gap-2 text-green-400 text-[10px] font-bold uppercase mb-3">
                        <Lightbulb size={14} className="animate-pulse" /> BaseByte Says
                      </div>
                      <p className="text-green-100 italic relative z-10">"{hint}"</p>
                      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Lightbulb size={80} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Console;
import React, { useRef, useEffect, useState } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  loading?: boolean;
}

interface AIAgentProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const AIAgent: React.FC<AIAgentProps> = ({ messages, onSendMessage, isLoading }) => {
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setChatInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderContent = (content: string) => {
    // Split by code blocks (```...```)
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).split("\n");
        const lang = lines[0]?.trim() || "";
        const code = lang ? lines.slice(1).join("\n") : lines.join("\n");
        return (
          <div key={i} className="my-3 rounded-xl overflow-hidden border border-white/10">
            {lang && (
              <div className="bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-400 border-b border-white/5">
                {lang}
              </div>
            )}
            <pre className="bg-[#0d0d0f] p-4 overflow-x-auto text-[13px] leading-relaxed">
              <code className="text-emerald-300">{code}</code>
            </pre>
          </div>
        );
      }
      // Render inline formatting: **bold**, `code`
      const formatted = part.split(/(\*\*.*?\*\*|`[^`]+`)/g).map((seg, j) => {
        if (seg.startsWith("**") && seg.endsWith("**")) {
          return <strong key={j} className="text-white font-semibold">{seg.slice(2, -2)}</strong>;
        }
        if (seg.startsWith("`") && seg.endsWith("`")) {
          return <code key={j} className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 text-[13px]">{seg.slice(1, -1)}</code>;
        }
        return <span key={j}>{seg}</span>;
      });
      return <span key={i}>{formatted}</span>;
    });
  };

  const quickActions = [
    "Ye error kyu aaya? 🤔",
    "Code complete karo ✍️",
    "Code optimize karo ⚡",
    "Explain karo ye code 📖",
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles size={28} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">BaseByte AI Agent</h3>
              <p className="text-gray-500 text-xs max-w-[240px]">
                Koi bhi sawaal pucho apne code ke baare mein — main Hinglish mein jawab dunga! 🚀
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-[320px]">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(action)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-[11px] bg-white/5 hover:bg-indigo-500/15 text-gray-400 hover:text-indigo-300 rounded-lg border border-white/5 hover:border-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
              msg.role === "ai"
                ? "bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/20"
                : "bg-white/10 border border-white/10"
            }`}>
              {msg.role === "ai" ? <Bot size={14} className="text-indigo-400" /> : <User size={14} className="text-gray-400" />}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-[85%] rounded-xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
              msg.role === "ai"
                ? "bg-[#0f0f14] border border-indigo-500/10 text-gray-300"
                : "bg-indigo-600/20 border border-indigo-500/20 text-indigo-100"
            }`}>
              {msg.loading ? (
                <div className="flex items-center gap-2 text-indigo-400">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="animate-pulse">AI soch raha hai... 🤔</span>
                </div>
              ) : (
                renderContent(msg.content)
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/5 bg-[#0a0a0b] p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Koi bhi sawaal pucho... 💬"
            disabled={isLoading}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/40 transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !chatInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/30 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:cursor-not-allowed"
          >
            <Send size={12} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;

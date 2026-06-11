import React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = "Something went wrong.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-[#0A0A0C] border border-rose-500/10 rounded-[2rem]">
      <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-6">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Error Occurred</h3>
      <p className="text-zinc-500 max-w-md mx-auto mb-8 text-sm">
        {message}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all text-sm"
        >
          <RefreshCcw size={16} /> Try Again
        </button>
      )}
    </div>
  );
}

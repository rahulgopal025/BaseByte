import { BookOpen, Lock, Zap } from "lucide-react";
export default function Feedback() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white p-8">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-8">
          <Zap size={12} fill="currentColor" /> Coming Soon
        </div>
        <div className="w-24 h-24 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <BookOpen size={40} className="text-indigo-400" />
        </div>
        <h1 className="text-5xl font-black mb-4 tracking-tight">Feedback</h1>
        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          Course reviews and platform feedback system will be available here.
        </p>
        <div className="flex items-center justify-center gap-3 text-zinc-600 text-sm font-bold">
          <Lock size={14} /> Available in Phase 2
        </div>
      </div>
    </div>
  );
}

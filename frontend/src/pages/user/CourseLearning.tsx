import { BookOpen, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function CourseLearning() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white p-8">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-8">
          <Zap size={12} fill="currentColor" /> Coming Soon
        </div>
        <div className="w-24 h-24 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <BookOpen size={40} className="text-indigo-400" />
        </div>
        <h1 className="text-5xl font-black mb-4 tracking-tight">Course Player</h1>
        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          Video lectures and live sessions will be available here after enrollment.
        </p>
        <button onClick={() => navigate('/courses')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all active:scale-95">
          Back to Courses
        </button>
      </div>
    </div>
  );
}

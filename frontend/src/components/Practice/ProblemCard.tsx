import { useNavigate } from "react-router-dom";
import { ChevronRight, Terminal } from "lucide-react";

export default function ProblemCard({ problem }: any) {
  const navigate = useNavigate();

  // Simple logic to handle difficulty colors
  const getDifficultyStyles = (diff: string) => {
    if (diff === "Easy") return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (diff === "Medium") return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all font-['Public_Sans',_sans-serif]">
      <div className="flex justify-between items-start mb-4">
        
        <div className="p-2 bg-slate-50 rounded-lg">
          <Terminal className="h-5 w-5 text-slate-500" />
        </div>
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getDifficultyStyles(problem.difficulty)}`}>
          {problem.difficulty}
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2">{problem.title}</h3>
      <p className="text-slate-500 text-sm line-clamp-2 mb-6">{problem.description}</p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex gap-2">
          {problem.tags?.slice(0, 2).map((tag: string) => (
            <span key={tag} className="text-[10px] font-bold text-slate-400 uppercase">#{tag}</span>
          ))}
        </div>
        
        
        <button 
          onClick={() => navigate(`/practice/${problem._id}`)}
          className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 transition-colors"
        >
          Solve <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
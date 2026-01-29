import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronRight, Terminal, Clock, Award, Play } from "lucide-react";

export default function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`https://basebyte-sl12.onrender.com/api/problems/${id}`);
        setProblem(res.data.data || res.data);
      } catch (err) {
        console.error("Error");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500 font-black uppercase tracking-[0.3em] text-xs">Loading Problem...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-['Public_Sans',_sans-serif]">
      <div className="max-w-5xl mx-auto">
        
        <nav className="flex items-center text-[12px] text-zinc-600 mb-10 font-black tracking-widest uppercase">
          <span onClick={() => navigate('/practice')} className="hover:text-indigo-400 cursor-pointer transition-colors">PRACTICE</span>
          <ChevronRight className="h-3 w-3 mx-4" />
          <span className="text-zinc-400">CHALLENGE DETAILS</span>
        </nav>

        <div className="bg-[#0d0d0e] border border-white/5 rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none"></div>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              {problem?.language || "Multi-Language"}
            </span>
            <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
              problem?.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 
              problem?.difficulty === 'Medium' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 
              'text-rose-400 bg-rose-400/10 border-rose-400/20'
            }`}>
              {problem?.difficulty}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-tight">
            {problem?.title}
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-3xl">
            {problem?.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
              <Clock className="h-5 w-5 text-zinc-500 mb-3" />
              <p className="text-zinc-500 text-[10px] font-black uppercase mb-1">Time Limit</p>
              <p className="text-white font-bold">1.0 Seconds</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
              <Terminal className="h-5 w-5 text-zinc-500 mb-3" />
              <p className="text-zinc-500 text-[10px] font-black uppercase mb-1">Memory Limit</p>
              <p className="text-white font-bold">256 MB</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
              <Award className="h-5 w-5 text-zinc-500 mb-3" />
              <p className="text-zinc-500 text-[10px] font-black uppercase mb-1">Total Points</p>
              <p className="text-white font-bold">100 Points</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-white/5">
            <button 
              onClick={() => navigate(`/solve/${id}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Play className="h-4 w-4" fill="currentColor" /> Start Solving
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
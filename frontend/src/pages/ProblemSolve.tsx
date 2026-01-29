import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, Info, Terminal, Settings } from "lucide-react";
import Compiler from "./Compiler";

export default function ProblemSolve() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/problems/${id}`);
        setProblem(res.data.data || res.data);
      } catch (err) {
        console.error("Error");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

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

        <div className="flex-1 relative">
          <Compiler 
            problemId={problem?._id} 
            initialLanguage={problem?.language?.toLowerCase()} 
          />
        </div>
        
      </div>
    </div>
  );
}
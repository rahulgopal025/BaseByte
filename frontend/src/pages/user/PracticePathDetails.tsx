import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Code2, CheckCircle2, Circle, Trophy, Activity } from "lucide-react";
import { getPracticePathById } from "../../api/practice.api";
import { getAllMySubmissions } from "../../api/submission.api";

export default function PracticePathDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pathData, setPathData] = useState<any>(null);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getPracticePathById(id),
      getAllMySubmissions().catch(() => ({ data: { data: [] } }))
    ])
      .then(([pathRes, subsRes]) => {
        setPathData(pathRes.data.data);
        const subs = subsRes.data.data || [];
        const smap: Record<string, boolean> = {};
        subs.forEach((s: any) => {
          if (s.status === "Accepted") {
            smap[s.problemId] = true;
          }
        });
        setSubmissionsMap(smap);
      })
      .catch((err) => {
        console.error(err);
        navigate("/practice");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-8 px-6 md:px-16 flex flex-col gap-6">
        <div className="h-8 w-48 bg-zinc-900 rounded-xl animate-pulse" />
        <div className="h-48 w-full max-w-5xl mx-auto bg-zinc-900/50 rounded-[40px] animate-pulse" />
        <div className="space-y-4 max-w-5xl mx-auto w-full">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 w-full bg-zinc-900/50 rounded-[24px] animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!pathData) return null;

  const totalProblems = pathData.problems?.length || 0;
  const solvedCount = pathData.problems?.filter((p: any) => submissionsMap[p._id]).length || 0;
  const completionPercentage = totalProblems === 0 ? 0 : Math.round((solvedCount / totalProblems) * 100);

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-6 md:px-12 md:py-8 lg:px-20 lg:pt-4 lg:pb-20 overflow-hidden relative">
      
      {/* Animated Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[10000ms]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-[11px] md:text-xs text-zinc-500 mb-10 font-bold mt-2">
          <span onClick={() => navigate('/')} className="hover:text-indigo-400 cursor-pointer transition-colors uppercase tracking-[0.2em]">Home</span>
          <ChevronRight className="h-3 w-3 mx-3 text-zinc-700" />
          <span onClick={() => navigate('/practice')} className="hover:text-indigo-400 cursor-pointer transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
             <Activity size={12} className="text-indigo-400" /> Practice Arena
          </span>
          <ChevronRight className="h-3 w-3 mx-3 text-zinc-700" />
          <span className="text-zinc-300 uppercase tracking-[0.2em]">{pathData.title}</span>
        </nav>

        {/* Header Section */}
        <div className="mb-12 relative flex flex-col md:flex-row items-start gap-8 bg-[#0d0d0e]/80 backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-[40px] overflow-hidden shadow-2xl animate-fade-in-up">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/20 blur-[100px] pointer-events-none"></div>
          
          <div className="hidden md:flex w-28 h-28 bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 rounded-[32px] items-center justify-center border border-indigo-500/20 shrink-0 relative z-10 shadow-inner">
            <Code2 size={48} className="text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          </div>
          
          <div className="relative z-10 flex-1 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> {pathData.language} Path
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tighter mb-4">
              {pathData.title}
            </h1>
            <p className="text-zinc-400 text-lg font-medium max-w-2xl leading-relaxed mb-8">
              {pathData.description}
            </p>

            {/* Progress Bar */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                  <Trophy size={14} className={completionPercentage === 100 ? "text-yellow-400" : "text-zinc-500"} />
                  Path Progress
                </div>
                <div className="text-sm font-black text-white flex items-baseline gap-1">
                  <span className="text-indigo-400 text-lg">{completionPercentage}%</span> completed
                </div>
              </div>
              <div className="h-2 w-full bg-[#050505] rounded-full overflow-hidden border border-white/5 relative">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out relative" 
                  style={{ width: `${completionPercentage}%` }} 
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="mt-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">
                {solvedCount} of {totalProblems} challenges solved
              </div>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-black text-white">Challenges <span className="text-zinc-600">({totalProblems})</span></h2>
          </div>
          
          {pathData.problems && pathData.problems.length > 0 ? (
            pathData.problems.map((problem: any, index: number) => {
              const isSolved = submissionsMap[problem._id] || false; 

              return (
                <div 
                  key={problem._id}
                  onClick={() => navigate(`/solve/${problem._id}`)}
                  className="group bg-[#0d0d0e]/80 backdrop-blur-md border border-white/5 hover:border-indigo-500/30 rounded-[24px] p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.15)] animate-fade-in-up"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <div className="flex items-start md:items-center gap-6">
                    <div className="flex-shrink-0 mt-1 md:mt-0">
                      {isSolved ? (
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="text-emerald-500 w-5 h-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-colors duration-500">
                          <Circle className="text-zinc-600 w-5 h-5 group-hover:text-indigo-400 transition-colors duration-500" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-zinc-600 text-xs font-black tracking-[0.2em] uppercase">#{String(index + 1).padStart(2, '0')}</span>
                        <h3 className="text-xl font-black text-zinc-100 group-hover:text-indigo-300 transition-colors duration-300">{problem.title}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                          problem.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                          problem.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                          'text-rose-400 bg-rose-500/10 border-rose-500/20'
                        }`}>
                          {problem.difficulty}
                        </span>
                        {problem.tags?.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-3 mt-4 md:mt-0">
                     <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-indigo-400 transition-colors">
                       {isSolved ? "Solved" : "Attempt"}
                     </div>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isSolved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-zinc-500 group-hover:bg-indigo-500 group-hover:text-white'}`}>
                       <ChevronRight size={14} className="font-bold" />
                     </div>
                  </div>
                </div>
              );
            })
          ) : (
             <div className="text-center py-24 bg-[#0A0A0C]/80 backdrop-blur-md rounded-[40px] border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="relative z-10">
                  <Code2 className="w-16 h-16 text-zinc-700 mx-auto mb-6 group-hover:text-indigo-500/50 transition-colors duration-500" />
                  <h3 className="text-2xl font-black text-white mb-3">No challenges assigned yet</h3>
                  <p className="text-zinc-500 font-medium">Check back later for new coding challenges.</p>
                </div>
             </div>
          )}
        </div>

      </div>
      
      {/* Global CSS for custom animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}} />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Code2, Terminal, Coffee, Map, Sparkles, ArrowRight, Activity } from "lucide-react";
import { getAllPracticePaths } from "../../api/practice.api";

export default function Practice() {
  const navigate = useNavigate();
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPracticePaths()
      .then(res => setPaths(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const languages = [
    {
      id: "c",
      name: "C Programming",
      description: "Master Pointers, Memory, and core logic.",
      icon: <Terminal className="h-7 w-7 text-blue-400 group-hover:text-white transition-colors duration-300" />,
      theme: "from-blue-500/20 to-cyan-500/5 hover:from-blue-500/40 hover:to-cyan-500/20",
      accent: "bg-blue-500",
      border: "border-blue-500/20 hover:border-blue-400/50"
    },
    {
      id: "python",
      name: "Python",
      description: "Solve challenges using Lists, Dicts, and Scripts.",
      icon: <Code2 className="h-7 w-7 text-amber-400 group-hover:text-white transition-colors duration-300" />,
      theme: "from-amber-500/20 to-orange-500/5 hover:from-amber-500/40 hover:to-orange-500/20",
      accent: "bg-amber-500",
      border: "border-amber-500/20 hover:border-amber-400/50"
    },
    {
      id: "java",
      name: "Java",
      description: "Object-Oriented Logic and Class-based challenges.",
      icon: <Coffee className="h-7 w-7 text-rose-400 group-hover:text-white transition-colors duration-300" />,
      theme: "from-rose-500/20 to-pink-500/5 hover:from-rose-500/40 hover:to-pink-500/20",
      accent: "bg-rose-500",
      border: "border-rose-500/20 hover:border-rose-400/50"
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-6 md:px-12 md:py-8 lg:px-20 lg:pt-4 lg:pb-20 overflow-hidden relative">
      
      {/* Background Animated Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[10000ms]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-[11px] md:text-xs text-zinc-500 mb-10 font-bold mt-2">
          <span onClick={() => navigate('/')} className="hover:text-indigo-400 cursor-pointer transition-colors uppercase tracking-[0.2em]">Home</span>
          <ChevronRight className="h-3 w-3 mx-3 text-zinc-700" />
          <span className="text-zinc-300 uppercase tracking-[0.2em] flex items-center gap-2">
            <Activity size={12} className="text-indigo-400" />
            Practice Arena
          </span>
        </nav>

        {/* Hero Section */}
        <div className="mb-20 text-center md:text-left relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-6 animate-fade-in-up">
            <Sparkles size={14} /> Master Your Craft
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 tracking-tighter mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Programming <span className="text-indigo-500 bg-none">Quizzes</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Strengthen your core logic with interactive challenges. Choose a language and dive into highly curated topic-wise questions.
          </p>
        </div>

        {/* MCQs Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-32">
          {languages.map((lang, idx) => (
            <div
              key={lang.id}
              onClick={() => navigate(`/topics/${lang.id}`)}
              className={`group relative p-8 rounded-[32px] border ${lang.border} bg-gradient-to-br ${lang.theme} backdrop-blur-sm cursor-pointer transition-all duration-500 hover:-translate-y-3 shadow-lg hover:shadow-2xl overflow-hidden animate-fade-in-up`}
              style={{ animationDelay: `${300 + idx * 100}ms` }}
            >
              {/* Decorative background circle */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="mb-8 inline-flex p-4 rounded-2xl bg-[#0a0a0c] border border-white/5 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  {lang.icon}
                </div>
                <h3 className="text-2xl font-black mb-3 tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-400 transition-all">
                  {lang.name}
                </h3>
                <p className="text-zinc-400 font-medium text-sm leading-relaxed mb-8">
                  {lang.description}
                </p>
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">
                  <span className={`w-8 h-px ${lang.accent} transition-all duration-500 group-hover:w-12`}></span>
                  Start Quiz
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coding Paths Section */}
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 animate-fade-in-up">
                Coding <span className="text-cyan-500">Paths</span>
              </h2>
              <p className="text-zinc-400 text-lg font-medium max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                Step-by-step curated journeys to help you master algorithms, data structures, and advanced concepts.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[280px] w-full bg-zinc-900/50 backdrop-blur-md rounded-[32px] animate-pulse border border-white/5" />
              ))}
            </div>
          ) : paths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paths.map((path, idx) => (
                <div 
                  key={path._id}
                  onClick={() => navigate(`/practice/${path._id}`)}
                  className="group relative bg-[#0d0d0e]/80 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 rounded-[32px] p-8 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.15)] overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${200 + idx * 100}ms` }}
                >
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-black transition-all duration-500 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]">
                      <Map size={24} />
                    </div>

                    <h3 className="text-2xl font-black mb-3 text-white group-hover:text-cyan-400 transition-colors duration-300">{path.title}</h3>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-10 flex-grow">
                      {path.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(3, path.problems?.length || 0))].map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-[#1a1a1c] border-2 border-[#0d0d0e] flex items-center justify-center">
                              <Code2 size={12} className="text-cyan-500" />
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] font-black tracking-widest uppercase text-zinc-400">
                          {path.problems?.length || 0} Challenges
                        </span>
                      </div>
                      
                      <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all duration-500 -rotate-45 group-hover:rotate-0">
                         <ArrowRight size={18} className="font-bold" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-[#0A0A0C]/80 backdrop-blur-md rounded-[40px] border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative z-10">
                <Map className="w-16 h-16 text-zinc-700 mx-auto mb-6 group-hover:text-cyan-500/50 transition-colors duration-500" />
                <h3 className="text-2xl font-black text-white mb-3">No Practice Paths Found</h3>
                <p className="text-zinc-500 font-medium">Admins haven't added any coding paths yet. Check back later!</p>
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
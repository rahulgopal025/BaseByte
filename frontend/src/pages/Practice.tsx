import { useNavigate } from "react-router-dom";
import { ChevronRight, Code2, Terminal, Coffee } from "lucide-react";

export default function Practice() {
  const navigate = useNavigate();

  // Configuration for language selection cards
  const languages = [
    {
      id: "c",
      name: "C Programming",
      description: "Master Pointers, Logic, and basic coding syntax.",
      icon: <Terminal className="h-8 w-8 text-blue-400" />,
      color: "border-blue-500/20 hover:border-blue-500/50",
      bg: "bg-blue-500/5",
    },
    {
      id: "python",
      name: "Python",
      description: "Solve MCQs based on Lists, Dictionaries, and Scripts.",
      icon: <Code2 className="h-8 w-8 text-yellow-400" />,
      color: "border-yellow-500/20 hover:border-yellow-500/50",
      bg: "bg-yellow-500/5",
    },
    {
      id: "java",
      name: "Java",
      description: "Object-Oriented Logic and Class-based MCQ challenges.",
      icon: <Coffee className="h-8 w-8 text-red-400" />,
      color: "border-red-500/20 hover:border-red-500/50",
      bg: "bg-red-500/5",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-16 font-['Public_Sans',_sans-serif]">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-[13px] text-zinc-600 mb-10 font-bold">
          <span onClick={() => navigate('/')} className="hover:text-indigo-400 cursor-pointer transition-colors text-xs uppercase tracking-widest">HOME</span>
          <ChevronRight className="h-3 w-3 mx-3" />
          <span className="text-zinc-500 text-xs uppercase tracking-widest">PRACTICE ARENA</span>
        </nav>

        
        <div className="mb-12 relative">
          <div className="absolute -left-20 -top-10 w-64 h-64 bg-indigo-600/5 blur-[100px]"></div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Pick Your <span className="text-indigo-500">Domain</span>
          </h1>
          <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed">
            Strengthen your programming logic with interactive MCQs instead of complex compilers. Master every topic through language-specific practice sessions.
          </p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {languages.map((lang) => (
            <div
              key={lang.id}
              onClick={() => navigate(`/topics/${lang.id}`)}
              className={`group relative p-8 rounded-[32px] border ${lang.color} ${lang.bg} cursor-pointer transition-all duration-500 hover:-translate-y-2`}
            >
              
              <div className="mb-6 inline-flex p-4 rounded-2xl bg-zinc-900/50 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                {lang.icon}
              </div>
              
              <h3 className="text-2xl font-black mb-3 tracking-tight">{lang.name}</h3>
              <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-6">
                {lang.description}
              </p>

             
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400 group-hover:gap-4 transition-all">
                Start Quiz <ChevronRight className="h-4 w-4" />
              </div>

              
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-500/5 blur-[40px] rounded-full group-hover:bg-indigo-500/10 transition-colors"></div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
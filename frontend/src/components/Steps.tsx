import React from "react";
import { BookOpen, Terminal, Rocket, ChevronRight, Zap } from "lucide-react";

export default function Steps() {
  
  const journey = [
    {
      id: "01",
      title: "Learn Basic Logic",
      desc: "Master the fundamentals of variables and loops with clear, beginner-friendly explanations.",
      icon: <BookOpen className="text-white" size={28} />,
      color: "from-indigo-600 to-blue-500",
      glow: "shadow-indigo-500/20",
    },
    {
      id: "02",
      title: "Live Practice",
      desc: "Write and run your code instantly on our high-speed integrated online compiler.",
      icon: <Terminal className="text-white" size={28} />,
      color: "from-purple-600 to-pink-500",
      glow: "shadow-purple-500/20",
    },
    {
      id: "03",
      title: "Engineering Ready",
      desc: "Step into your engineering journey with solid fundamentals and 100% confidence.",
      icon: <Rocket className="text-white" size={28} />,
      color: "from-pink-600 to-rose-500",
      glow: "shadow-pink-500/20",
    },
  ];

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
    
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] -z-0"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] -z-0"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-6">
            <Zap size={14} fill="currentColor" /> Process
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Your 3-Step Journey to <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Mastery</span>
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
          
          <div className="hidden md:block absolute top-[25%] left-0 w-full h-0.5 border-t border-dashed border-white/10 -z-0"></div>

          {journey.map((step, index) => (
            <div key={step.id} className="group relative z-10">
              <div className="flex flex-col items-center text-center">
                
                
                <div className="relative mb-12">
                  <div className="text-9xl font-black text-white/[0.03] group-hover:text-white/[0.07] transition-colors duration-500 select-none">
                    {step.id}
                  </div>
                  
                  {/* Floating Icon Card with dynamic gradient backgrounds */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${step.color} rounded-3xl shadow-2xl ${step.glow} border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {step.icon}
                  </div>
                </div>

                
                <div className="bg-[#0A0A0C] p-8 rounded-[2.5rem] border border-white/5 group-hover:border-white/20 transition-all duration-500 shadow-2xl">
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Mobile Flow Indicator */}
                {index < journey.length - 1 && (
                  <div className="md:hidden mt-10 text-indigo-500/50 animate-pulse">
                    <ChevronRight size={32} className="rotate-90" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        
        <div className="mt-24 text-center">
          <div className="inline-flex items-center gap-3 bg-white/5 px-8 py-4 rounded-full border border-white/10 backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <p className="text-white font-bold text-sm tracking-wide uppercase">
              Over 500+ students have joined the BaseByte tribe!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
import React from "react";
import { Terminal, Brain, GraduationCap, Zap, ArrowRight } from "lucide-react";

export default function Features() {
  // Array containing feature details for clean management
  const featureData = [
    {
      icon: <Terminal size={26} />,
      title: "Online Compiler",
      desc: "Practice C and Python code instantly without any installations. Built for speed.",
      color: "from-indigo-500 to-blue-600",
      shadow: "shadow-indigo-500/20",
    },
    {
      icon: <Brain size={26} />,
      title: "Logic Building",
      desc: "Special puzzles to improve your programming logic effectively. Think like a coder.",
      color: "from-purple-500 to-pink-600",
      shadow: "shadow-purple-500/20",
    },
    {
      icon: <GraduationCap size={26} />,
      title: "Engineering Prep",
      desc: "Learn first-year coding basics to stay ahead of the crowd. Foundation for your future.",
      color: "from-pink-500 to-rose-600",
      shadow: "shadow-pink-500/20",
    },
  ];

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Background Glows to match the Hero Section aesthetic */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header with Gradient Typography */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-6">
            <Zap size={14} fill="currentColor" /> Features
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            Why Choose <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">BaseByte?</span>
          </h2>
          <p className="text-gray-400 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
            We focus on building strong foundations for 11th and 12th students, preparing you for the engineering world.
          </p>
        </div>

        {/* Features Grid with Dark Cards and Neon Borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featureData.map((item, index) => (
            <div 
              key={index}
              className={`group relative p-10 rounded-[2.5rem] bg-[#0A0A0C] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden hover:-translate-y-2`}
            >
              {/* Subtle gradient overlay visible on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

              {/* Styled Icon Container with dynamic shadows */}
              <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg ${item.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                {item.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-indigo-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-400 text-base leading-relaxed font-medium mb-6">
                {item.desc}
              </p>

              {/* Interactive call-to-action link */}
              <div className="flex items-center gap-2 text-white/40 group-hover:text-white text-sm font-bold transition-all duration-300 cursor-pointer">
                Learn More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
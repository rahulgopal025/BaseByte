import React from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, Sparkles, Code, ArrowRight } from "lucide-react";

export default function Hero(){
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#0a0a0b] text-white">
      
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center text-left">
        
       
        <div className="space-y-8">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-sm font-semibold tracking-wide">
            <Sparkles size={16} />
            The Ultimate Coding Launchpad for 11th & 12th
          </div>

          
          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
            Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Logic</span>, <br /> 
            Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Future.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed">
            Don't just memorize code. Understand the fundamentals of C, Python, and Logic Building before you even start Engineering.
          </p>

          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/compiler")}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg shadow-indigo-500/20 hover:-translate-y-1"
            >
              Try Compiler <ArrowRight size={20} />
            </button>

            <button
              onClick={() => navigate("/practice")}
              className="flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all"
            >
              Explore Practice
            </button>
          </div>

          
          <div className="flex items-center gap-6 pt-4 text-gray-500 text-sm font-medium">
            <div className="flex items-center gap-2"><Code size={18}/> Logic Building</div>
            <div className="flex items-center gap-2"><Terminal size={18}/> Live Compiler</div>
          </div>
        </div>

        
        <div className="hidden lg:block relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          
          
          <div className="relative bg-[#16161a] border border-white/10 rounded-3xl p-6 shadow-2xl">
            
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            
            
            <div className="font-mono text-sm space-y-2 text-indigo-300">
              <p><span className="text-purple-400">void</span> <span className="text-yellow-400">main</span>() &#123;</p>
              <p className="pl-4 text-gray-500">// Your coding journey starts here</p>
              <p className="pl-4">
                <span className="text-blue-400">printf</span>(
                <span className="text-green-400">"Welcome to BaseByte!"</span>
                );
              </p>
              <p className="pl-4"><span className="text-purple-400">if</span> (passion == <span className="text-orange-400">true</span>) &#123;</p>
              <p className="pl-8 text-blue-400">startLearning();</p>
              <p className="pl-4">&#125;</p>
              <p>&#125;</p>
            </div>
          </div>

          
          <div className="absolute -bottom-6 -left-6 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-xl">🚀</div>
              <div>
                <p className="text-xs text-gray-400">Daily Challenge</p>
                <p className="text-sm font-bold">Solved by 500+ Students</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
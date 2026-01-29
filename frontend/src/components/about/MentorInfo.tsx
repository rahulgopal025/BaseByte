import React from "react";

import RahulGopal from "../../assets/rahul-gopal.jpg";

import { 
  Code2, Award, Github, Linkedin, Mail, Instagram, 
  Terminal, Trophy, Star, GraduationCap, Zap, Cpu, Globe, 
  CheckCircle2, Binary, Sparkles 
} from "lucide-react";

export default function MentorInfo() {
  // Categorized Skills for Maximum Impact
  const skillCategories = [
    {
      title: "Programming Languages",
      skills: ["C", "C++", "Java", "Advance Java", "Python", "JavaScript", "TypeScript"], //
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "Frontend & UI Design",
      skills: ["React.js", "Next.js", "Tailwind CSS", "Bootstrap", "HTML", "CSS"], //
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Backend & Databases",
      skills: ["Node.js", "Express.js", "MySQL", "MongoDB"], //
      color: "from-orange-500 to-yellow-500"
    }
  ];

  return (
    <div className="space-y-24">
      
      {/* FOUNDER IDENTITY HERO */}
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="w-full lg:w-1/3 group relative">
          <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative aspect-square rounded-[3.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 shadow-2xl">
            <div className="w-full h-full rounded-[3.2rem] bg-[#0A0A0C] flex items-center justify-center overflow-hidden border-4 border-[#050505]">
               {/* Replace with your professional photo link */}
               
              <img
                src={RahulGopal}
                alt="Rahul Gopal"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/3 text-center lg:text-left">
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
            <span className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={14} fill="currentColor" /> Founder @ BaseByte
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <Zap size={14} fill="currentColor" /> GDG Technical Member {/* */}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-2xl font-black mb-6 tracking-tighter text-white ">
           <span className="bg-gradient-to-br from-indigo-700 to-purple-300 bg-clip-text text-transparent">
            Rahul Eknath Gopal
          </span>
          </h2>
          
          <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-2xl mb-10">
            I build systems that combine clean logic with high performance.
          </p>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
             <a href="https://github.com/rahulgopal025" target="_blank" className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"><Github size={20}/></a>
             <a href="https://www.linkedin.com/in/rahul-gopal-ba32a5339/" target="_blank" className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-[#0077b5] transition-all"><Linkedin size={20}/></a>
             <a href="https://www.instagram.com/rahulll.__09._/" target="_blank" className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-pink-600 transition-all"><Instagram size={20}/></a>
             <a href="mailto:rahulgopal025@gmail.com" className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-indigo-600 transition-all"><Mail size={20}/></a>
          </div>
        </div>
      </div>

      {/* 2. SKILLS MASTERLIST (THE "WOW" SECTION) */}
      <div className="space-y-12">
        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
           <Cpu className="text-indigo-500" size={32} /> Technical <span className="text-indigo-500">Arsenal</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skillCategories.map((cat, i) => (
            <div key={i} className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all group">
              <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-50`}>{cat.title}</h4>
              <div className="grid grid-cols-1 gap-3">
                {cat.skills.map((skill) => (
                  <div key={skill} className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                    <CheckCircle2 size={16} className="text-indigo-500" />
                    <span className="text-xs font-bold text-gray-300">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/*  ACHIEVEMENTS & EDUCATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CodeChef Card */}
        <div className="p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Binary className="text-indigo-400" size={32} />
            </div>
            <div>
                <h4 className="text-white font-black text-2xl mb-1">700+ Problems Solved</h4> {/* */}
                <p className="text-gray-500 text-sm mb-3">Competitive Programming Mastery on CodeChef.</p>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-indigo-400">100+ HIGH DIFFICULTY</span> {/* */}
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-indigo-400">CERTIFIED</span> {/* */}
                </div>
            </div>
        </div>

        {/* SIH Card */}
        <div className="p-10 rounded-[3.5rem] bg-indigo-600 shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
            <Trophy className="absolute -right-6 -bottom-6 text-white/10 w-40 h-40" />
            <div className="relative z-10">
                <h4 className="text-white font-black text-2xl mb-2">SIH 2024 Qualifier</h4> {/* */}
                <p className="text-indigo-100 text-sm font-medium">Qualified for Zonal Registration at Smart India Hackathon.</p>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase text-white/50">
                    <Star size={12} fill="currentColor" /> National Level Recognition
                </div>
            </div>
        </div>

        {/* Education History */}
        <div className="p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5">
            <h4 className="text-white font-black text-xl mb-8 flex items-center gap-3">
                <GraduationCap className="text-purple-500" /> Academic Path
            </h4>
            <div className="space-y-8">
                <div className="border-l-2 border-indigo-500/30 pl-6">
                    <p className="text-white font-bold">B.Tech in Computer Engineering</p>
                    <p className="text-indigo-400 text-[10px] font-black uppercase">RCPIT, Shirpur • 2nd Year</p> {/* */}
                </div>
                <div className="border-l-2 border-white/10 pl-6 opacity-50">
                    <p className="text-white font-bold">Secondary Education</p>
                    <p className="text-gray-500 text-[10px] font-black uppercase">A.G.R. GARUD Jr. College, Shendurni</p> {/* */}
                </div>
            </div>
        </div>

         {/* Community Work  */}
        <div className="p-10 rounded-[3.5rem] bg-blue-600/10 border border-blue-500/20">
            <h4 className="text-white font-black text-xl mb-6 flex items-center gap-3">
                <Globe className="text-blue-400" /> GDG Technical Member
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
                Actively contributing to the technical team of <span className="text-blue-400">GDG on Campus @ RCPIT</span>, fostering a culture of innovation and Google-led technology workshops.
            </p>
        </div>
      </div>
    </div>
  );
}
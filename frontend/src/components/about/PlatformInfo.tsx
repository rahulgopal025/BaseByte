import React from "react";
import { Target, Cpu, Rocket, Code2, Users, BookOpen, Mail, ArrowRight, Instagram, MessageCircle } from "lucide-react";
import ContactForm from "./ContactForm";

export default function PlatformInfo() {
  const features = [
    {
      icon: <Code2 className="text-indigo-400" size={24} />,
      title: "Interactive Compiler",
      desc: "Execute code in multiple languages with sub-second compilation speeds."
    },
    {
      icon: <BookOpen className="text-purple-400" size={24} />,
      title: "Premium Courses",
      desc: "Structured learning paths from absolute basics to advanced algorithms."
    },
    {
      icon: <Users className="text-pink-400" size={24} />,
      title: "Thriving Community",
      desc: "Join thousands of developers leveling up their logic together."
    }
  ];

  return (
    <div className="space-y-20">

      {/* Hero Section */}
      <div className="text-center space-y-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/20 blur-[100px] rounded-full -z-10"></div>
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black tracking-widest uppercase shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <Rocket size={14} className="animate-bounce" /> The Coding Ecosystem
        </div>
       <h2 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-[#5B7FFF] via-[#8B5CF6] to-[#FF4DA6] bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent tracking-tighter drop-shadow-[0_0_40px_rgba(139,92,246,0.7)]">About BaseByte</h2>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
          BaseByte is a high-performance platform designed for the next generation of developers.
          We provide a seamless interface to practice, compile, and master programming logic, bridging the gap between theory and real-world engineering.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div key={idx} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] backdrop-blur-xl shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
            <div className="w-16 h-16 bg-white/[0.05] rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/10 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-500">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Mission & Vision */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="p-12 rounded-[3rem] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20 relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-500 hover:shadow-[0_0_50px_rgba(99,102,241,0.1)]">
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
            <Target size={240} className="text-indigo-400" />
          </div>
          <Target className="text-indigo-400 mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" size={48} />
          <h3 className="text-3xl font-black mb-4 text-white">Our Mission</h3>
          <p className="text-gray-300 leading-relaxed text-lg">
            To democratize high-level coding education by building interactive, lightning-fast tools that empower students to focus on logic and problem solving, rather than configuration.
          </p>
        </div>

        <div className="p-12 rounded-[3rem] bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-500 hover:shadow-[0_0_50px_rgba(168,85,247,0.1)]">
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
            <Cpu size={240} className="text-purple-400" />
          </div>
          <Cpu className="text-purple-400 mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" size={48} />
          <h3 className="text-3xl font-black mb-4 text-white">Our Vision</h3>
          <p className="text-gray-300 leading-relaxed text-lg">
            To become the central hub where aspiring engineers write their first line of code, build complex algorithms, and transition smoothly into top-tier tech careers.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="relative pt-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="text-center mb-12">
          <h3 className="text-4xl font-black mb-8 text-white tracking-tight">Connect With Us</h3>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <a href="mailto:basebyte.in@gmail.com" className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 hover:-translate-y-1 text-indigo-400 font-bold transition-all duration-300 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              <Mail size={20} />
              basebyte.in@gmail.com
            </a>
            <a href="https://www.instagram.com/basebyte_coding/?hl=en" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 hover:-translate-y-1 text-pink-400 font-bold transition-all duration-300 border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.1)] hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]">
              <Instagram size={20} />
              Instagram
            </a>
            <a href="https://chat.whatsapp.com/Gh3bRmmJq432ReV0thRdjT" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 hover:-translate-y-1 text-emerald-400 font-bold transition-all duration-300 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <MessageCircle size={20} />
              WhatsApp Group
            </a>
          </div>

          <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
            Have questions, feedback, or want to collaborate? We would love to hear from you. Drop us a message below.
          </p>
        </div>

        <ContactForm />
      </div>

    </div>
  );
}
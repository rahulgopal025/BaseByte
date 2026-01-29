import React from "react";
import { Target, Cpu, Rocket } from "lucide-react";

export default function PlatformInfo() {
  return (
    <div className="space-y-16">
      <div className="text-center">
        <h2 className="text-4xl font-black mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          About BaseByte
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed max-w-3xl mx-auto">
          BaseByte is a high-performance coding ecosystem designed for the next generation of developers. 
          We provide a seamless interface to practice, compile, and master programming logic.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all">
          <Target className="text-indigo-400 mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2">Our Mission</h3>
          <p className="text-sm text-gray-500">To democratize high-level coding education through interactive tools.</p>
        </div>
        <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-all">
          <Cpu className="text-purple-400 mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2">The Tech</h3>
          <p className="text-sm text-gray-500">Leveraging cloud-based execution engines for sub-second code compilation.</p>
        </div>
        <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-pink-500/20 transition-all">
          <Rocket className="text-pink-400 mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2">The Scale</h3>
          <p className="text-sm text-gray-500">Building a community of 10,000+ coders driven by logic and innovation.</p>
        </div>
      </div>
    </div>
  );
}
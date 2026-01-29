import React, { useState } from "react";
import PlatformInfo from "../components/about/PlatformInfo";
import MentorInfo from "../components/about/MentorInfo";
import { Info, User } from "lucide-react";

export default function About() {
  const [activeTab, setActiveTab] = useState<"platform" | "mentor">("platform");

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-10 pb-20 px-4 md:px-0 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        
        <div className="flex justify-center mb-15 ">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-[2rem] flex items-center gap-2 shadow-2xl">
            <button 
              onClick={() => setActiveTab("platform")}
              className={`flex items-center gap-2 px-8 py-3 rounded-[1.8rem] text-sm font-black uppercase tracking-widest transition-all duration-500 ${
                activeTab === "platform" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Info size={18} /> About BaseByte
            </button>
            <button 
              onClick={() => setActiveTab("mentor")}
              className={`flex items-center gap-2 px-8 py-3 rounded-[1.8rem] text-sm font-black uppercase tracking-widest transition-all duration-500 ${
                activeTab === "mentor" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <User size={18} /> About Mentor
            </button>
          </div>
        </div>

        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === "platform" ? <PlatformInfo /> : <MentorInfo />}
        </div>

      </div>
    </div>
  );
}
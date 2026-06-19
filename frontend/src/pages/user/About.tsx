import React, { useState } from "react";
import PlatformInfo from "../../components/about/PlatformInfo";
import MentorInfo from "../../components/about/MentorInfo";
import { Info, User as UserIcon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function About() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"platform" | "mentor">("platform");

  React.useEffect(() => {
    if (!user) setActiveTab("platform");
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground pt-10 pb-20 px-4 md:px-0 relative overflow-hidden transition-colors duration-300">
      
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {user && (
          <div className="flex justify-center mb-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-50 rounded-full"></div>
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-2 rounded-full flex items-center gap-2 shadow-2xl relative">
              <button 
                onClick={() => setActiveTab("platform")}
                className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-500 ${
                  activeTab === "platform" 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Info size={18} /> About BaseByte
              </button>
              <button 
                onClick={() => setActiveTab("mentor")}
                className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-500 ${
                  activeTab === "mentor" 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <UserIcon size={18} /> About Mentor
              </button>
            </div>
          </div>
        )}

        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === "platform" ? <PlatformInfo /> : <MentorInfo />}
        </div>

      </div>
    </div>
  );
}
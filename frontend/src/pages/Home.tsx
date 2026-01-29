import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Steps from "../components/Steps";
import { Zap } from "lucide-react";

export default function Home() {
  const [userName, setUserName] = useState("Student");

  // Load user data from localStorage and extract the first name
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.name) {
          setUserName(user.name.split(" ")[0]);
        }
      } catch (error) {
        console.error("Auth Data Error:", error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      
      {/* Personalized Welcome Section - Optimized for both Desktop Hover and Mobile Touch */}
      {localStorage.getItem("user") && (
        <section className="max-w-8xl mx-auto px-6 pt-6 pb-4 relative overflow-hidden">
          
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-indigo-600/5 blur-[80px] pointer-events-none"></div>
          
          <div className="relative bg-[#0A0A0C] border border-white/5 p-6 md:p-8 rounded-[2rem] shadow-2xl group 
                          hover:border-white/10 active:border-white/10 active:scale-[0.98] 
                          transition-all duration-500 touch-manipulation">
            
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-600/10 rounded-md text-indigo-400">
                <Zap size={16} fill="currentColor" />
              </div>
              <span className="text-indigo-400 text-[10px] font-bold tracking-widest uppercase">Quick Access</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">{userName}!</span> 👋
            </h2>
            <p className="text-gray-400 mt-2 text-base font-medium max-w-xl leading-relaxed">
              Ready to sharpen your programming logic and tackle today's challenges?
            </p>

           
            <div className="absolute bottom-6 right-8 opacity-5 group-hover:opacity-10 group-active:opacity-10 transition-opacity">
               <Zap size={60} className="text-white" />
            </div>
          </div>
        </section>
      )}

      {/* Main Page Sections */}
      <Hero />
      <Features />
      <Steps />
    </div>
  );
}
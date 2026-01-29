import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, ChevronDown, Settings, Bell, BookOpen } from "lucide-react";
import profileBoy from "../assets/profile-boy.png";

export default function UserMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer p-1.5 rounded-full hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
      >
        <div className="relative">
          <img 
            src={profileBoy} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-indigo-600 p-0.5 object-cover shadow-lg shadow-indigo-500/20"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#050505] rounded-full"></div>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      
      {isOpen && (
        <div className="fixed right-4 md:right-8 top-20 w-72 bg-[#0A0A0C]/90 bg-gray-900 text-white backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] py-6 z-[100] animate-in fade-in slide-in-from-right-5 duration-300">
          
          
          <div className="px-7 pb-5 border-b border-white/5 mb-4">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-[0.15em] mb-3">
              BaseByte Student
            </div>
            <p className="text-lg font-black text-white truncate leading-tight">
              {user?.name || "Coding Enthusiast"}
            </p>
            <p className="text-xs text-gray-500 font-medium truncate mt-1">
              {user?.email || "No email associated"}
            </p>
          </div>

          
          <div className="px-3 space-y-1.5">
            <button 
              onClick={() => { navigate("/profile"); setIsOpen(false); }}
              className="w-full flex items-center gap-4 px-5 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
            >
              <div className="p-2 bg-white/5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <User size={18} />
              </div>
              My Profile
            </button>
            
            <button 
              onClick={() => { navigate("/settings"); setIsOpen(false); }}
              className="w-full flex items-center gap-4 px-5 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
            >
              <div className="p-2 bg-white/5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Settings size={18} />
              </div>
              Settings
            </button>

            <button 
              className="w-full flex items-center gap-4 px-5 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
            >
              <div className="p-2 bg-white/5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Bell size={18} />
              </div>
              Notifications
            </button>

            <button className="w-full flex items-center gap-4 px-5 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all group">
              <div className="p-2 bg-white/5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <BookOpen size={18} />
              </div>
              My Course
            </button>

            
            <div className="h-px bg-white/5 mx-6 my-4"></div>

            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-5 py-3 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all group"
            >
              <div className="p-2 bg-rose-500/10 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-all">
                <LogOut size={18} />
              </div>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
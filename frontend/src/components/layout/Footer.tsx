import React from "react";
import { useNavigate } from "react-router-dom";
import { Code2, Github, Instagram, Linkedin, Mail, Heart } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0b] text-white pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Code2 className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                BaseByte
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering students to build strong logic before engineering. Founded with a vision to make coding accessible.
            </p>
          </div>

          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-200 mb-5">Platform</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li onClick={() => navigate("/compiler")} className="hover:text-indigo-400 cursor-pointer">Online Compiler</li>
              <li onClick={() => navigate("/practice")} className="hover:text-indigo-400 cursor-pointer">Practice Zone</li>
              <li className="hover:text-indigo-400 cursor-pointer">Learning Roadmap</li>
            </ul>
          </div>

          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-200 mb-5">Support</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li onClick={() => navigate("/about")} className="hover:text-indigo-400 cursor-pointer">About Us</li>
              <li className="hover:text-indigo-400 cursor-pointer">Privacy Policy</li>
              <li className="hover:text-indigo-400 cursor-pointer">Contact</li>
            </ul>
          </div>

         
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-200 mb-5">Connect</h3>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-indigo-600 transition-all cursor-pointer">
                <Github size={18} />
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-pink-600 transition-all cursor-pointer">
                <Instagram size={18} />
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all cursor-pointer">
                <Linkedin size={18} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold pt-2">
              <Mail size={14} /> basebyte@gmail.com
            </div>
          </div>

        </div>

        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <p>© {year} BaseByte India | Designed & Developed by Rahul Gopal</p>
          <div className="flex items-center gap-1">
            Created with <Heart size={10} className="text-red-500 fill-red-500" /> for Future Developers
          </div>
        </div>

      </div>
    </footer>
  );
}
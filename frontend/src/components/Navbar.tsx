import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Code2, Zap } from "lucide-react";
import UserMenu from "./UserMenu";
import { useAuth } from "../context/AuthContext"; 

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  
  const { user, logout } = useAuth(); 

  
  const handleLogout = () => {
    logout();
    navigate("/auth");
    
  };

  
  const isActive = (path: string) => location.pathname === path ? "text-indigo-400" : "text-gray-400";

  return (
    
    <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center py-4">
          
          
          <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer group">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/20">
              <Code2 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
              BaseByte
            </h1>
          </div>

          
          {user && (
            <ul className="hidden md:flex gap-10 items-center font-bold text-sm tracking-widest uppercase">
              {["/", "/practice", "/compiler", "/about"].map((path) => (
                <li 
                  key={path}
                  onClick={() => navigate(path)} 
                  className={`cursor-pointer hover:text-white transition-all duration-300 relative group ${isActive(path)}`}
                >
                  {path === "/" ? "Home" : path.replace("/", "")}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full ${location.pathname === path ? "w-full" : ""}`}></span>
                </li>
              ))}
            </ul>
          )}

          
          <div className="flex items-center gap-6">
            {user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <div className="hidden md:flex items-center gap-6">
                <button 
                  onClick={() => navigate("/auth", { state: { showSignup: false } })} 
                  className="text-xs font-black text-gray-400 hover:text-white tracking-widest uppercase transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate("/auth", { state: { showSignup: true } })} 
                  className="px-8 py-3 text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all active:scale-95 flex items-center gap-2"
                >
                  SIGN UP <Zap size={14} fill="currentColor" />
                </button>
              </div>
            )}

            
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-400 hover:text-white">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

       {/* Mobile Menu Dropdown  */}
      {isOpen && (
        <div className="md:hidden bg-[#0A0A0C]/95 backdrop-blur-2xl border-b border-white/5 p-6 space-y-6 shadow-2xl animate-in slide-in-from-top duration-300">
            {user ? (
                <div className="flex flex-col gap-6 font-bold text-gray-400 text-lg">
                  {["Home", "Practice", "Compiler", "About"].map((item) => (
                    <p key={item} onClick={() => {navigate(item === "Home" ? "/" : `/${item.toLowerCase()}`); setIsOpen(false)}} className="hover:text-indigo-400 transition-colors cursor-pointer capitalize">
                      {item}
                    </p>
                  ))}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                  <button onClick={() => {navigate("/auth", { state: { showSignup: false } }); setIsOpen(false)}} className="w-full py-4 font-black text-gray-400 border border-white/5 rounded-2xl active:bg-white/5">
                    LOGIN
                  </button>
                  <button onClick={() => {navigate("/auth", { state: { showSignup: true } }); setIsOpen(false)}} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20">
                    SIGN UP
                  </button>
                </div>
            )}
        </div>
      )}
    </nav>
  );
}
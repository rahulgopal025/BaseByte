import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, ArrowLeft, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import profileImage from "../../assets/profile-boy.png";

export default function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };
  
  return (
    <header className="flex items-center gap-4 px-8 py-5 flex-shrink-0 z-10 w-full relative bg-transparent">
      <button 
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
      >
        <Menu size={20} />
      </button>

      {location.pathname !== "/admin" && (
        <button
          onClick={() => navigate("/admin")}
          className="hidden md:flex p-2 -ml-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </button>
      )}

      <div className="flex items-center gap-2 text-sm font-bold text-zinc-500">
        {pathParts.map((part, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-zinc-700">/</span>}
            <span className={i === pathParts.length - 1 ? "text-white" : ""}>
              {part.charAt(0).toUpperCase() + part.slice(1)}
            </span>
          </span>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all active:scale-95"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-10 h-10 rounded-full bg-[#121216] flex items-center justify-center border-2 border-[#050505] shadow-lg overflow-hidden relative cursor-pointer hover:border-indigo-500 transition-all"
          >
            <img src={user?.avatar || profileImage} alt="Profile" className="w-full h-full object-cover" />
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-50">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-500 hover:bg-white/5 transition-colors text-sm font-bold"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

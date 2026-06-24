import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Menu, ArrowLeft, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import profileImage from "../../assets/profile-boy.png";
import { useBreadcrumbs } from "../../context/BreadcrumbContext";

export default function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { customBreadcrumbs } = useBreadcrumbs();
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
        className="md:hidden p-2 -ml-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-foreground transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Logo */}
      <div className="md:hidden flex items-center gap-2 cursor-pointer" onClick={() => navigate("/admin")}>
        <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
        <h1 className="text-lg font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight leading-none">
          BaseByte
        </h1>
      </div>

      <div className="flex items-center gap-2 text-sm font-bold text-zinc-500">
        {pathParts.map((part, i) => {
          const isLast = i === pathParts.length - 1;
          const href = "/" + pathParts.slice(0, i + 1).join("/");
          let displayName = customBreadcrumbs[part] || (part.charAt(0).toUpperCase() + part.slice(1));
          
          // Fallback for raw MongoDB IDs if custom name not yet loaded
          if (!customBreadcrumbs[part] && /^[a-fA-F0-9]{24}$/.test(part)) {
            displayName = "Details";
          }

          return (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-zinc-700">/</span>}
              {isLast ? (
                <span className="text-foreground">{displayName}</span>
              ) : (
                <Link to={href} className="hover:text-foreground transition-colors">
                  {displayName}
                </Link>
              )}
            </span>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-foreground transition-all active:scale-95"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center border-2 border-border shadow-lg overflow-hidden relative cursor-pointer hover:border-indigo-500 transition-all"
          >
            <img src={user?.avatar || profileImage} alt="Profile" className="w-full h-full object-cover" />
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden py-2 z-50">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm font-bold"
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

import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

export default function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-[#08080A]">
      <button 
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
      >
        <Menu size={20} />
      </button>
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
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-['Public_Sans',_sans-serif]">
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        <div className="relative">
          <h1 className="text-[200px] font-black text-white/[0.03] leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-2 text-center">
              <p className="text-6xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Oops!
              </p>
              <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Page Not Found</p>
            </div>
          </div>
        </div>

        <p className="text-zinc-400 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
          >
            <Home size={16} /> Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/5"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { FileText, Search, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios.instance";

export default function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/api/notes")
      .then(res => setNotes(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 px-6 py-16 md:px-16 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center md:text-left mb-12 md:mb-16 flex flex-col items-center md:items-start pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Premium Study Material</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-tight">
            Notes <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">Marketplace</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl text-center md:text-left leading-relaxed">
            Accelerate your learning. Browse, preview, and download high-quality study notes from top students.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-12 max-w-2xl mx-auto md:mx-0 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search notes by title or subject..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#0a0a0b]/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white text-base outline-none focus:border-indigo-500 transition-all shadow-2xl"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-[400px] bg-white/5 rounded-3xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10">
            <BookOpen size={48} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 font-bold text-lg">No notes found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filtered.map(note => (
              <div
                key={note._id}
                onClick={() => navigate(`/notes/${note._id}`)}
                className="group relative bg-[#0d0d0e]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:-translate-y-2 hover:scale-[1.01] transition-all duration-500 cursor-pointer hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] hover:border-indigo-500/50 flex flex-col h-[400px]"
              >
                {/* Thumbnail Header Area */}
                <div className="h-[180px] relative overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/40 border-b border-white/10 flex items-center justify-center">
                  {note.thumbnailUrl ? (
                    <img src={note.thumbnailUrl} alt={note.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <FileText size={56} className="text-indigo-400/40 group-hover:text-indigo-400 transition-all duration-500 relative z-10" />
                    </>
                  )}
                  {/* Floating Badges inside thumbnail area */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                      {note.subject || "General"}
                    </span>
                    {note.isFree && (
                      <span className="px-3 py-1 bg-emerald-500/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                        Free
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 relative z-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500 pointer-events-none" />

                  <h3 className="font-bold text-xl md:text-2xl tracking-tight leading-snug text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-fuchsia-400 transition-all line-clamp-2 drop-shadow-md mb-2">
                    {note.title}
                  </h3>

                  <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium mb-auto">
                    <FileText size={16} className="text-indigo-400/70" /> 
                    <span>{note.totalPages > 0 ? `${note.totalPages} Pages` : "Preview available"}</span>
                  </div>

                  {/* Footer (Price & Button) */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-end gap-2">
                      {!note.isFree && (
                        <div className="flex flex-col">
                          {note.offerPrice > 0 ? (
                            <>
                              <span className="text-xs font-bold text-zinc-500 line-through">₹{note.price}</span>
                              <span className="text-2xl font-black text-white leading-none tracking-tight">₹{note.offerPrice}</span>
                            </>
                          ) : (
                            <span className="text-2xl font-black text-white leading-none tracking-tight">₹{note.price}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-sm group-hover:bg-indigo-600 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                      View <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


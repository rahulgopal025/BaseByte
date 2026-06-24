import { useEffect, useState } from "react";
import { FileText, Plus, Check, Download, Search } from "lucide-react";
import { getAdminNotes, approveNotes } from "../../api/admin.api";
import { useNavigate } from "react-router-dom";

export default function AdminNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const load = () => {
    getAdminNotes()
      .then((notesRes) => {
        setNotes(notesRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    await approveNotes(id);
    setNotes((prev) => prev.map((n) => n._id === id ? { ...n, isApproved: true } : n));
  };



  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-xl">
              <FileText size={18} className="text-pink-400" />
            </div>
            <span className="text-pink-400 text-xs font-black uppercase tracking-widest">Content</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">Notes</h1>
          <p className="text-zinc-500 font-medium">{notes.length} total notes</p>
        </div>
        <button onClick={() => navigate('/admin/notes/create')} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Upload Notes
        </button>
      </div>

      <div className="relative mb-8 max-w-md">
        <input 
          type="text" 
          placeholder="Search notes by title or subject..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-500 shadow-sm"
        />
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3].map((i) => <div key={i} className="h-40 bg-zinc-900 rounded-[24px] animate-pulse border border-white/5" />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <FileText size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No notes uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.filter(note => 
            note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            note.subject?.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((note) => (
            <div 
              key={note._id} 
              onClick={() => navigate(`/admin/notes/${note._id}`)}
              className="group cursor-pointer bg-card border border-border rounded-[24px] p-6 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] transition-all flex flex-col justify-between min-h-[260px]"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${note.isApproved ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"}`}>
                    {note.isApproved ? "Approved" : "Pending"}
                  </span>
                  <span className="text-indigo-400 font-black flex items-center gap-1 text-sm bg-indigo-500/10 px-3 py-1 rounded-full">
                    {note.isFree ? "Free" : <>₹{note.price}</>}
                  </span>
                </div>
                
                <h3 className="font-black text-lg mb-1 text-foreground group-hover:text-indigo-400 transition-colors line-clamp-2">{note.title}</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">{note.subject || "General"}</p>
              </div>

              {!note.isApproved ? (
                <div className="pt-4 border-t border-border flex justify-end">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleApprove(note._id); }} 
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all"
                  >
                    <Check size={12} /> Approve Now
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Download size={14} className="text-pink-400" /> {note.downloads || 0} DLs</span>
                    <span className="flex items-center gap-1"><FileText size={14} className="text-indigo-400" /> {note.totalPages > 0 ? note.totalPages : "N/A"} PGs</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:underline">Manage →</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

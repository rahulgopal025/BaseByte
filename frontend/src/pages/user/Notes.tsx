import { useEffect, useState } from "react";
import { FileText, Search, Download, IndianRupee, Plus, X } from "lucide-react";
import axiosInstance from "../../api/axios.instance";
import { useAuth } from "../../hooks/useAuth";
import { useToastContext } from "../../context/ToastContext";

export default function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: "", fileUrl: "", subject: "", price: 0, isFree: true });
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToastContext();

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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { showToast("Please login to upload notes.", "error"); return; }
    setUploading(true);
    try {
      await axiosInstance.post("/api/notes/upload", form);
      showToast("Notes uploaded! Pending admin approval.", "success");
      setShowUpload(false);
      setForm({ title: "", fileUrl: "", subject: "", price: 0, isFree: true });
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Upload failed.", "error");
    } finally { setUploading(false); }
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-16 md:px-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">Notes <span className="text-indigo-500">Marketplace</span></h1>
            <p className="text-zinc-400">Browse and download study notes from fellow students.</p>
          </div>
          {user && (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95"
            >
              <Plus size={16} /> Upload Notes
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search notes by title or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md pl-10 pr-4 py-3 bg-[#0d0d0e] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0d0d0e] border border-white/10 rounded-[32px] p-8 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">Upload Notes</h2>
                <button onClick={() => setShowUpload(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <input required placeholder="Notes Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputClass} />
                <input required placeholder="File URL (Google Drive / Cloudinary)" value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} className={inputClass} />
                <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className={inputClass} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Price (₹)" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className={inputClass} disabled={form.isFree} />
                  <div onClick={() => setForm({...form, isFree: !form.isFree})} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer ${form.isFree ? "bg-green-500/10 border-green-500/20" : "bg-white/[0.03] border-white/5"}`}>
                    <div className={`w-4 h-4 rounded-full border-2 ${form.isFree ? "bg-green-400 border-green-400" : "border-zinc-600"}`} />
                    <span className={`text-sm font-bold ${form.isFree ? "text-green-400" : "text-zinc-400"}`}>Free</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowUpload(false)} className="flex-1 py-3 bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400">Cancel</button>
                  <button type="submit" disabled={uploading} className="flex-1 py-3 bg-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest text-white disabled:opacity-60">{uploading ? "Uploading..." : "Submit"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-zinc-900 rounded-[24px] animate-pulse border border-white/5" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <FileText size={40} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold">No notes available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(note => (
              <div key={note._id} className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-2xl">
                    <FileText size={20} className="text-pink-400" />
                  </div>
                  <span className="text-lg font-black">{note.isFree ? <span className="text-green-400">Free</span> : <span className="flex items-center gap-0.5 text-indigo-400"><IndianRupee size={14} />{note.price}</span>}</span>
                </div>
                <h3 className="font-black mb-1">{note.title}</h3>
                <p className="text-zinc-500 text-sm mb-1">{note.subject}</p>
                <p className="text-zinc-600 text-xs mb-6">{note.uploaderEmail}</p>
                <a href={note.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-black uppercase text-xs tracking-widest text-zinc-400 hover:text-white transition-all">
                  <Download size={14} /> {note.isFree ? "Download Free" : "Buy & Download"}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { FileText, Plus, Trash2, Check, X } from "lucide-react";
import { getAdminNotes, uploadAdminNotes, approveNotes, deleteNotes } from "../../api/admin.api";

const emptyForm = { title: "", fileUrl: "", subject: "", price: 0, isFree: true };

export default function AdminNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    getAdminNotes()
      .then((res) => setNotes(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await uploadAdminNotes(form); setShowForm(false); setForm(emptyForm); load(); }
    catch { alert("Failed to upload."); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id: string) => {
    await approveNotes(id);
    setNotes((prev) => prev.map((n) => n._id === id ? { ...n, isApproved: true } : n));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete these notes?")) return;
    await deleteNotes(id);
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";

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
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Upload Notes
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0e] border border-white/10 rounded-[32px] p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Upload Notes</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Notes Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              <input required placeholder="File URL (Google Drive / Cloudinary)" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} className={inputClass} />
              <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} />
                <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl">
                  <input type="checkbox" id="notesFree" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
                  <label htmlFor="notesFree" className="text-sm text-zinc-400 font-bold">Free</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white disabled:opacity-60">
                  {saving ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div key={note._id} className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${note.isApproved ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"}`}>
                  {note.isApproved ? "Approved" : "Pending"}
                </span>
                <span className="text-indigo-400 font-black">{note.isFree ? "Free" : `₹${note.price}`}</span>
              </div>
              <h3 className="font-black mb-1">{note.title}</h3>
              <p className="text-zinc-500 text-sm mb-1">{note.subject}</p>
              <p className="text-zinc-600 text-xs mb-6">{note.uploaderEmail}</p>
              <div className="flex gap-2">
                {!note.isApproved && (
                  <button onClick={() => handleApprove(note._id)} className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                    <Check size={12} /> Approve
                  </button>
                )}
                <a href={note.fileUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center py-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">View</a>
                <button onClick={() => handleDelete(note._id)} className="p-2.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

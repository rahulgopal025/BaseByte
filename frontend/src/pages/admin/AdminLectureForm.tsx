import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { createLecture, updateLecture, getAdminLectures } from "../../api/admin.api";

export default function AdminLectureForm() {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", description: "", videoUrl: "", order: 1,
    duration: "", isPreview: false, isLive: false
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!lectureId);

  useEffect(() => {
    if (lectureId) {
      getAdminLectures().then(res => {
        const found = (res.data.data || []).find((l: any) => l._id === lectureId);
        if (found) {
          setForm({
            title: found.title || "",
            description: found.description || "",
            videoUrl: found.videoUrl || "",
            order: found.order || 1,
            duration: found.duration || "",
            isPreview: found.isPreview || false,
            isLive: found.isLive || false
          });
        }
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [lectureId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, courseId };
      if (lectureId) {
        await updateLecture(lectureId, payload);
      } else {
        await createLecture(payload);
      }
      navigate(`/admin/courses/${courseId}`, { state: { tab: 'lectures' } });
    } catch {
      alert("Failed to save lecture.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-black/5 dark:bg-white/[0.03] border border-border rounded-2xl text-foreground text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600";

  if (loading) {
    return <div className="p-8 text-zinc-500 animate-pulse">Loading lecture details...</div>;
  }

  return (
    <div className="p-8 text-foreground max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(`/admin/courses/${courseId}`, { state: { tab: 'lectures' } })} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black">{lectureId ? "Edit Lecture" : "New Lecture"}</h1>
          <p className="text-zinc-500 font-medium">Manage lecture content and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Order</label>
            <input required type="number" placeholder="1" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className={inputClass} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Lecture Title</label>
            <input required placeholder="Introduction to React" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </div>
        </div>
        
        <div>
          <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Description</label>
          <textarea placeholder="What will students learn?" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass + " resize-none"} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Video URL</label>
            <input required placeholder="YouTube or Vimeo URL" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Duration</label>
            <input placeholder="e.g. 15m 30s" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-4 bg-black/5 dark:bg-white/[0.03] border border-border rounded-2xl cursor-pointer" onClick={() => setForm({ ...form, isPreview: !form.isPreview })}>
            <input type="checkbox" checked={form.isPreview} readOnly className="w-5 h-5 accent-indigo-500 pointer-events-none" />
            <div>
              <label className="text-sm text-foreground font-bold block">Free Preview</label>
              <p className="text-xs text-zinc-500">Allow non-enrolled students to watch</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-4 bg-black/5 dark:bg-white/[0.03] border border-border rounded-2xl cursor-pointer" onClick={() => setForm({ ...form, isLive: !form.isLive })}>
            <input type="checkbox" checked={form.isLive} readOnly className="w-5 h-5 accent-indigo-500 pointer-events-none" />
            <div>
              <label className="text-sm text-foreground font-bold block">Live Session</label>
              <p className="text-xs text-zinc-500">Mark this lecture as a live stream</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(`/admin/courses/${courseId}`, { state: { tab: 'lectures' } })} className="px-6 py-3 bg-black/5 dark:bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-500 hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-all">Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all disabled:opacity-60 shadow-lg shadow-indigo-600/20 active:scale-95">
            <Save size={16} /> {saving ? "Saving..." : "Save Lecture"}
          </button>
        </div>
      </form>
    </div>
  );
}

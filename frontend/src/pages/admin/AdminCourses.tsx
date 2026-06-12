import { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2, Edit, Eye, EyeOff, X } from "lucide-react";
import { getAdminCourses, createCourse, updateCourse, deleteCourse } from "../../api/admin.api";

const emptyForm = {
  title: "", description: "", thumbnail: "", price: 0,
  isFree: false, instructor: "", category: "", tags: "", isPublished: false
};

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    getAdminCourses()
      .then((res) => setCourses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      if (editId) {
        await updateCourse(editId, payload);
      } else {
        await createCourse(payload);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      load();
    } catch { alert("Failed to save course."); }
    finally { setSaving(false); }
  };

  const handleEdit = (course: any) => {
    setForm({ ...course, tags: course.tags?.join(", ") || "" });
    setEditId(course._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    await deleteCourse(id);
    setCourses((prev) => prev.filter((c) => c._id !== id));
  };

  const togglePublish = async (course: any) => {
    const updated = await updateCourse(course._id, { isPublished: !course.isPublished });
    setCourses((prev) => prev.map((c) => c._id === course._id ? updated.data.data : c));
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <BookOpen size={18} className="text-purple-400" />
            </div>
            <span className="text-purple-400 text-xs font-black uppercase tracking-widest">Content</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">Courses</h1>
          <p className="text-zinc-500 font-medium">{courses.length} total courses</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> New Course
        </button>
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0e] border border-white/10 rounded-[32px] p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">{editId ? "Edit Course" : "New Course"}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Course Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              <textarea required placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass + " resize-none"} />
              <input placeholder="Thumbnail URL" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Instructor Name" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} className={inputClass} />
                <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
              </div>
              <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} />
                <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl">
                  <input type="checkbox" id="isFree" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
                  <label htmlFor="isFree" className="text-sm text-zinc-400 font-bold">Free Course</label>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl">
                <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
                <label htmlFor="isPublished" className="text-sm text-zinc-400 font-bold">Publish immediately</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400 hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all disabled:opacity-60">
                  {saving ? "Saving..." : editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3].map((i) => <div key={i} className="h-48 bg-zinc-900 rounded-[24px] animate-pulse border border-white/5" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <BookOpen size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No courses yet. Create your first course.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${course.isPublished ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-800 text-zinc-500 border-white/5"}`}>
                  {course.isPublished ? "Published" : "Draft"}
                </span>
                <span className="text-indigo-400 font-black text-lg">
                  {course.isFree ? "Free" : `₹${course.price}`}
                </span>
              </div>
              <h3 className="font-black text-lg mb-1 leading-tight">{course.title}</h3>
              <p className="text-zinc-500 text-sm mb-1">{course.instructor}</p>
              <p className="text-zinc-600 text-sm line-clamp-2 mb-6">{course.description}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(course)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                  <Edit size={12} /> Edit
                </button>
                <button onClick={() => togglePublish(course)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                  {course.isPublished ? <><EyeOff size={12} /> Unpublish</> : <><Eye size={12} /> Publish</>}
                </button>
                <button onClick={() => handleDelete(course._id)} className="p-2.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

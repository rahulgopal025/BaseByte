import { useEffect, useState } from "react";
import { Video, Plus, Trash2, Edit, X, Wifi, WifiOff } from "lucide-react";
import { getAdminLectures, createLecture, updateLecture, deleteLecture } from "../../api/admin.api";
import { getAdminCourses } from "../../api/admin.api";

interface LectureForm {
  courseId: string;
  title: string;
  videoUrl: string;
  notes: string;
  order: number;
  duration: string;
  isLive: boolean;
  liveLink: string;
}

const emptyForm: LectureForm = {
  courseId: "", title: "", videoUrl: "", notes: "",
  order: 1, duration: "", isLive: false, liveLink: ""
};

export default function AdminLectures() {
  const [lectures, setLectures] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<LectureForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterCourse, setFilterCourse] = useState("all");

  const load = async () => {
    try {
      const [lectRes, courseRes] = await Promise.all([
        getAdminLectures(),
        getAdminCourses()
      ]);
      setLectures(lectRes.data.data || []);
      setCourses(courseRes.data.data || []);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseId) { alert("Please select a course."); return; }
    setSaving(true);
    try {
      if (editId) {
        await updateLecture(editId, form);
      } else {
        await createLecture(form);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      load();
    } catch { alert("Failed to save lecture."); }
    finally { setSaving(false); }
  };

  const handleEdit = (lecture: any) => {
    setForm({
      courseId: lecture.courseId?._id || lecture.courseId || "",
      title: lecture.title || "",
      videoUrl: lecture.videoUrl || "",
      notes: lecture.notes || "",
      order: lecture.order || 1,
      duration: lecture.duration || "",
      isLive: lecture.isLive || false,
      liveLink: lecture.liveLink || ""
    });
    setEditId(lecture._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lecture?")) return;
    await deleteLecture(id);
    setLectures(prev => prev.filter(l => l._id !== id));
  };

  const filtered = filterCourse === "all"
    ? lectures
    : lectures.filter(l => (l.courseId?._id || l.courseId) === filterCourse);

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";
  const selectClass = inputClass + " cursor-pointer";

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <Video size={18} className="text-violet-400" />
            </div>
            <span className="text-violet-400 text-xs font-black uppercase tracking-widest">Content</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">Lectures</h1>
          <p className="text-zinc-500 font-medium">{lectures.length} total lectures</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Add Lecture
        </button>
      </div>

      {/* Course Filter */}
      {courses.length > 0 && (
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setFilterCourse("all")}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterCourse === "all" ? "bg-indigo-600 text-white" : "bg-white/5 text-zinc-500 hover:text-white"}`}
          >
            All Courses
          </button>
          {courses.map(c => (
            <button
              key={c._id}
              onClick={() => setFilterCourse(c._id)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterCourse === c._id ? "bg-indigo-600 text-white" : "bg-white/5 text-zinc-500 hover:text-white"}`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0e] border border-white/10 rounded-[32px] p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">{editId ? "Edit Lecture" : "New Lecture"}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Course Selector */}
              <div>
                <label className="text-zinc-500 text-xs font-black uppercase tracking-widest block mb-2">Select Course *</label>
                <select
                  required
                  value={form.courseId}
                  onChange={e => setForm({ ...form, courseId: e.target.value })}
                  className={selectClass}
                >
                  <option value="">-- Select a Course --</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <input
                required
                placeholder="Lecture Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Order (1, 2, 3...)"
                  min={1}
                  value={form.order}
                  onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                  className={inputClass}
                />
                <input
                  placeholder="Duration (e.g. 45 mins)"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                  className={inputClass}
                />
              </div>

              {/* Live toggle */}
              <div
                onClick={() => setForm({ ...form, isLive: !form.isLive })}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all ${form.isLive ? "bg-green-500/10 border-green-500/20" : "bg-white/[0.03] border-white/5"}`}
              >
                {form.isLive ? <Wifi size={16} className="text-green-400" /> : <WifiOff size={16} className="text-zinc-500" />}
                <span className={`text-sm font-bold ${form.isLive ? "text-green-400" : "text-zinc-400"}`}>
                  {form.isLive ? "Live Lecture" : "Recorded Lecture"}
                </span>
              </div>

              {form.isLive ? (
                <input
                  placeholder="Live Link (Zoom / Google Meet URL)"
                  value={form.liveLink}
                  onChange={e => setForm({ ...form, liveLink: e.target.value })}
                  className={inputClass}
                />
              ) : (
                <>
                  <input
                    placeholder="Video URL (Cloudinary / YouTube embed)"
                    value={form.videoUrl}
                    onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    placeholder="Notes PDF URL (Google Drive / Cloudinary)"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className={inputClass}
                  />
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all disabled:opacity-60"
                >
                  {saving ? "Saving..." : editId ? "Update" : "Add Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lectures List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <Video size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">
            {lectures.length === 0 ? "No lectures yet. Add your first lecture." : "No lectures for this course."}
          </p>
        </div>
      ) : (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Title</div>
            <div className="col-span-3">Course</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Actions</div>
          </div>
          {filtered.map((lecture, i) => (
            <div
              key={lecture._id}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors ${i !== filtered.length - 1 ? "border-b border-white/5" : ""}`}
            >
              <div className="col-span-1 text-zinc-600 font-black text-sm">{lecture.order}</div>
              <div className="col-span-4">
                <p className="font-bold text-sm truncate">{lecture.title}</p>
                <p className="text-zinc-600 text-xs">{lecture.duration}</p>
              </div>
              <div className="col-span-3 text-zinc-400 text-sm truncate">
                {lecture.courseId?.title || "—"}
              </div>
              <div className="col-span-2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${lecture.isLive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-violet-500/10 text-violet-400 border-violet-500/20"}`}>
                  {lecture.isLive ? "Live" : "Recorded"}
                </span>
              </div>
              <div className="col-span-2 flex gap-2">
                <button
                  onClick={() => handleEdit(lecture)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Edit size={11} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(lecture._id)}
                  className="p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                >
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

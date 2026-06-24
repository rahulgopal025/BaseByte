import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react";
import { getAdminCourses, createCourse, updateCourse, uploadImage, getAdminNotes } from "../../api/admin.api";

const emptyForm = {
  title: "", description: "", thumbnail: "", price: 0, originalPrice: 0,
  isFree: false, instructor: "", category: "", tags: "", isPublished: false,
  discountPercentage: "", level: "", duration: "", lessonsCount: "", isFeatured: false,
  courseType: "Recorded", validity: "Lifetime Access", freeNotes: [] as string[]
};

export default function AdminCourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [isUploading, setIsUploading] = useState(false);
  const [allNotes, setAllNotes] = useState<any[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await uploadImage(formData);
      setForm({ ...form, thumbnail: res.data.data.url });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    getAdminNotes().then(res => setAllNotes(res.data.data || [])).catch(console.error);
    if (id) {
      getAdminCourses().then(res => {
        const found = (res.data.data || []).find((c: any) => c._id === id);
        if (found) {
          setForm({ ...found, tags: found.tags?.join(", ") || "", freeNotes: found.freeNotes || [] });
        }
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) };
      if (id) {
        await updateCourse(id, payload);
      } else {
        await createCourse(payload);
      }
      navigate(id ? `/admin/courses/${id}` : "/admin/courses");
    } catch {
      alert("Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-black/5 dark:bg-white/[0.03] border border-border rounded-2xl text-foreground text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600";

  if (loading) {
    return <div className="p-8 text-zinc-500 animate-pulse">Loading course details...</div>;
  }

  return (
    <div className="p-8 text-foreground max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(id ? `/admin/courses/${id}` : "/admin/courses")} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black">{id ? "Edit Course" : "New Course"}</h1>
          <p className="text-zinc-500 font-medium">Manage course details and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Course Title</label>
            <input required placeholder="E.g., Complete Web Development Bootcamp" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Description</label>
          <textarea required placeholder="What is this course about?" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass + " resize-none"} />
        </div>

        <div>
          <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Thumbnail URL or Upload Image</label>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 w-full space-y-4">
              <input placeholder="Or enter image URL directly: https://..." value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className={inputClass} />
              
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isUploading}
                />
                <div className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${isUploading ? 'bg-black/5 dark:bg-white/5 border-border' : 'bg-black/5 dark:bg-white/[0.02] border-border hover:border-indigo-500 hover:bg-indigo-500/5'}`}>
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3 text-indigo-500">
                      <Loader2 className="animate-spin" size={32} />
                      <span className="text-sm font-bold">Uploading to Cloudinary...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-zinc-500 group-hover:text-indigo-500 transition-colors">
                      <Upload size={32} />
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs">PNG, JPG or WEBP (Max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {form.thumbnail && (
              <div className="w-full md:w-64 aspect-video shrink-0 rounded-2xl overflow-hidden bg-black/5 border border-border relative group">
                <img src={form.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setForm({ ...form, thumbnail: "" })}
                  className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-rose-500 text-white rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove Image"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Instructor Name</label>
            <input placeholder="John Doe" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Category</label>
            <input placeholder="Programming, Design, etc." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Level</label>
            <input placeholder="Beginner, Intermediate..." value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Duration</label>
            <input placeholder="e.g. 33h 35m" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Lessons Count</label>
            <input placeholder="e.g. 203 lessons" value={form.lessonsCount} onChange={(e) => setForm({ ...form, lessonsCount: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Course Type</label>
            <select value={form.courseType} onChange={(e) => setForm({ ...form, courseType: e.target.value })} className={inputClass}>
              <option value="Recorded">Recorded</option>
              <option value="Live + Recorded">Live + Recorded</option>
              <option value="Live Only">Live Only</option>
            </select>
          </div>
          <div>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Validity</label>
            <select value={form.validity} onChange={(e) => setForm({ ...form, validity: e.target.value })} className={inputClass}>
              <option value="Lifetime Access">Lifetime Access</option>
              <option value="1 Year Validity">1 Year Validity</option>
              <option value="6 Months Validity">6 Months Validity</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Tags</label>
          <input placeholder="React, Node.js, Typescript (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} />
        </div>

        <div>
          <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Free Notes Included</label>
          <div className="max-h-48 overflow-y-auto bg-black/5 dark:bg-white/[0.03] border border-border rounded-2xl p-4 space-y-2">
            {allNotes.map(note => (
              <label key={note._id} className="flex items-center gap-3 cursor-pointer p-1">
                <input 
                  type="checkbox" 
                  checked={form.freeNotes.includes(note._id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm(prev => ({
                      ...prev,
                      freeNotes: checked 
                        ? [...prev.freeNotes, note._id]
                        : prev.freeNotes.filter((id: string) => id !== note._id)
                    }));
                  }}
                  className="w-4 h-4 accent-indigo-500 rounded"
                />
                <span className="text-sm font-bold text-foreground">{note.title} <span className="text-xs text-zinc-500 font-normal">({note.subject || "General"})</span></span>
              </label>
            ))}
            {allNotes.length === 0 && <p className="text-xs text-zinc-500">No notes available.</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Current Price (₹)</label>
            <input type="number" placeholder="499" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} />
          </div>
          <div>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Original Price (₹)</label>
            <input type="number" placeholder="999" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} className={inputClass} />
          </div>
          <div>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Discount Badge</label>
            <input placeholder="e.g. 50% OFF" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-4 bg-black/5 dark:bg-white/[0.03] border border-border rounded-2xl cursor-pointer" onClick={() => setForm({ ...form, isFree: !form.isFree })}>
            <input type="checkbox" checked={form.isFree} readOnly className="w-5 h-5 accent-indigo-500 pointer-events-none" />
            <div>
              <label className="text-sm text-foreground font-bold block">Free Course</label>
              <p className="text-xs text-zinc-500">Available to everyone</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-4 bg-black/5 dark:bg-white/[0.03] border border-border rounded-2xl cursor-pointer" onClick={() => setForm({ ...form, isPublished: !form.isPublished })}>
            <input type="checkbox" checked={form.isPublished} readOnly className="w-5 h-5 accent-indigo-500 pointer-events-none" />
            <div>
              <label className="text-sm text-foreground font-bold block">Publish</label>
              <p className="text-xs text-zinc-500">Make course visible</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-4 bg-black/5 dark:bg-white/[0.03] border border-border rounded-2xl cursor-pointer" onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}>
            <input type="checkbox" checked={form.isFeatured} readOnly className="w-5 h-5 accent-indigo-500 pointer-events-none" />
            <div>
              <label className="text-sm text-foreground font-bold block">Featured</label>
              <p className="text-xs text-zinc-500">Highlight on home page</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(id ? `/admin/courses/${id}` : "/admin/courses")} className="px-6 py-3 bg-black/5 dark:bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-500 hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-all">Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all disabled:opacity-60 shadow-lg shadow-indigo-600/20 active:scale-95">
            <Save size={16} /> {saving ? "Saving..." : "Save Course"}
          </button>
        </div>
      </form>
    </div>
  );
}

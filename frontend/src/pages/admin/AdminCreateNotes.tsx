import { useEffect, useState } from "react";
import { ArrowLeft, Save, Loader2, FileText, UploadCloud, ImageIcon, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { uploadAdminNotes, uploadPdf, uploadImage } from "../../api/admin.api";
import { getAllCourses } from "../../api/course.api";
import { useBreadcrumbs } from "../../context/BreadcrumbContext";

const emptyForm = { title: "", notesPdfUrl: "", subject: "", price: 0, offerPrice: 0, isFree: true, courses: [] as string[], description: "", thumbnailUrl: "", totalPages: 0, previewStartPage: 1, previewEndPage: 5 };

export default function AdminCreateNotes() {
  const navigate = useNavigate();
  const { setCustomBreadcrumb } = useBreadcrumbs();
  
  const [form, setForm] = useState(emptyForm);
  const [courses, setCourses] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    setCustomBreadcrumb("create", "Upload Notes");
    getAllCourses().then(res => setCourses(res.data.data || [])).catch(console.error);
  }, [setCustomBreadcrumb]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!form.isFree) {
      if (form.previewStartPage < 1) return alert("Preview Start Page must be greater than 0");
      if (form.previewEndPage < form.previewStartPage) return alert("Preview End Page must be greater than or equal to Preview Start Page");
      if (form.totalPages > 0 && form.previewEndPage > form.totalPages) return alert(`Preview End Page cannot exceed Total PDF Pages (${form.totalPages})`);
    }

    setSaving(true);
    const payload: any = { ...form, isPremium: !form.isFree };
    
    try { 
      await uploadAdminNotes(payload); 
      navigate("/admin/notes");
    } catch (err: any) { 
      alert(err.response?.data?.message || "Failed to upload notes."); 
    } finally { 
      setSaving(false); 
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await uploadPdf(formData);
      setForm({ ...form, notesPdfUrl: res.data.data.url, totalPages: res.data.data.totalPages || 0 });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to upload PDF");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploadingImg(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadImage(formData);
      setForm({ ...form, thumbnailUrl: res.data.data.url });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to upload thumbnail");
    } finally {
      setUploadingImg(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 bg-black/5 dark:bg-white/[0.03] border border-border rounded-xl text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-500";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/notes')}
          className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Upload Notes</h1>
          <p className="text-zinc-500 font-medium">Add new study material for your students</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Notes Title</label>
              <input required placeholder="e.g. React.js Complete Cheatsheet" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Subject</label>
              <input placeholder="e.g. Frontend Development" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
             <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Description</label>
             <textarea rows={3} placeholder="Enter a detailed description about the notes..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-black/5 dark:bg-white/[0.02] border border-border rounded-2xl">
              <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1"><FileText size={12}/> File (PDF or URL)</label>
              <div className="flex flex-col gap-3">
                <input required placeholder="Google Drive / Dropbox link OR upload" value={form.notesPdfUrl} onChange={(e) => setForm({ ...form, notesPdfUrl: e.target.value })} className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-500" />
                <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-border" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">OR</span>
                  <div className="h-[1px] flex-1 bg-border" />
                </div>
                <label className={`flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-xl font-bold text-sm cursor-pointer transition-all ${uploadingPdf ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" disabled={uploadingPdf} />
                  {uploadingPdf ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                  {uploadingPdf ? "Uploading..." : "Upload PDF (Max 50MB)"}
                </label>
              </div>
            </div>

            <div className="p-4 bg-black/5 dark:bg-white/[0.02] border border-border rounded-2xl">
              <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1"><ImageIcon size={12}/> Thumbnail (Image or URL)</label>
              <div className="flex flex-col gap-3">
                <input placeholder="Image URL OR upload below" value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-500" />
                <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-border" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">OR</span>
                  <div className="h-[1px] flex-1 bg-border" />
                </div>
                <label className={`flex items-center justify-center gap-2 px-6 py-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 rounded-xl font-bold text-sm cursor-pointer transition-all ${uploadingImg ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input type="file" accept="image/*" onChange={handleImgUpload} className="hidden" disabled={uploadingImg} />
                  {uploadingImg ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                  {uploadingImg ? "Uploading..." : "Upload Thumbnail"}
                </label>
              </div>
            </div>
          </div>

          <div>
             <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Related Courses (Optional)</label>
             <div className="max-h-48 overflow-y-auto border border-border rounded-xl p-4 bg-black/5 dark:bg-white/[0.03] grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courses.length === 0 && <span className="text-zinc-500 text-sm">No courses available.</span>}
                {courses.map(c => (
                   <label key={c._id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
                      <input type="checkbox" checked={form.courses.includes(c._id)} 
                             onChange={(e) => {
                               if (e.target.checked) setForm({...form, courses: [...form.courses, c._id]});
                               else setForm({...form, courses: form.courses.filter(id => id !== c._id)});
                             }} 
                             className="w-4 h-4 accent-indigo-500" />
                      <span className="text-sm font-medium">{c.title}</span>
                   </label>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Original Price (₹)</label>
              <input type="number" placeholder="499" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} disabled={form.isFree} className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`} />
            </div>
            <div>
              <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Offer Price (₹)</label>
              <input type="number" placeholder="199" value={form.offerPrice} onChange={(e) => setForm({ ...form, offerPrice: Number(e.target.value) })} disabled={form.isFree} className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`} />
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-3 px-4 py-3.5 bg-black/5 dark:bg-white/[0.03] border border-border rounded-xl mb-1 cursor-pointer" onClick={() => setForm({ ...form, isFree: !form.isFree })}>
                <input type="checkbox" id="notesFree" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} className="w-5 h-5 accent-indigo-500 rounded cursor-pointer" onClick={e => e.stopPropagation()} />
                <label htmlFor="notesFree" className="text-sm font-bold cursor-pointer select-none">Mark as Free</label>
              </div>
            </div>
          </div>

          {!form.isFree && (
            <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
              <h3 className="text-indigo-400 font-bold mb-4 flex items-center gap-2"><Lock size={16}/> Premium Content Settings</h3>
              <p className="text-xs text-zinc-500 mb-4">Total Pages detected: <span className="font-bold text-white">{form.totalPages || "Upload PDF first"}</span></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Preview Start Page</label>
                  <input type="number" min="1" placeholder="1" value={form.previewStartPage} onChange={(e) => setForm({ ...form, previewStartPage: Number(e.target.value) })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Preview End Page</label>
                  <input type="number" min="1" placeholder="10" value={form.previewEndPage} onChange={(e) => setForm({ ...form, previewEndPage: Number(e.target.value) })} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-border">
            <button type="button" onClick={() => navigate('/admin/notes')} className="px-6 py-3 rounded-xl font-bold text-sm bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Change"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

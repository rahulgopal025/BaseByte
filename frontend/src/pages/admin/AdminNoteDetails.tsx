import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Edit, ArrowLeft, Trash2, Download, Save, Link as LinkIcon, Loader2, UploadCloud, ImageIcon, Users, Lock } from "lucide-react";
import { getAdminNotes, updateNotes, deleteNotes, uploadPdf, uploadImage } from "../../api/admin.api";
import { getAllCourses } from "../../api/course.api";
import { useBreadcrumbs } from "../../context/BreadcrumbContext";

export default function AdminNoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", subject: "", price: 0, offerPrice: 0, isFree: true, notesPdfUrl: "", description: "", thumbnailUrl: "", courses: [] as string[], previewStartPage: 1, previewEndPage: 5, totalPages: 0 });

  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const load = async () => {
    try {
      const [notesRes, coursesRes] = await Promise.all([getAdminNotes(), getAllCourses()]);
      setCourses(coursesRes.data.data || []);
      const foundNote = (notesRes.data.data || []).find((n: any) => n._id === id);
      setNote(foundNote);
      if (foundNote) {
        setEditForm({
          title: foundNote.title || "",
          subject: foundNote.subject || "",
          price: foundNote.price || 0,
          offerPrice: foundNote.offerPrice || 0,
          isFree: foundNote.isFree || false,
          notesPdfUrl: foundNote.notesPdfUrl || "",
          description: foundNote.description || "",
          thumbnailUrl: foundNote.thumbnailUrl || "",
          courses: foundNote.courses?.map((c: any) => c._id ? c._id : c) || [],
          previewStartPage: foundNote.previewStartPage || 1,
          previewEndPage: foundNote.previewEndPage || 5,
          totalPages: foundNote.totalPages || 0
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const { setCustomBreadcrumb } = useBreadcrumbs();
  useEffect(() => {
    if (note && id) {
      setCustomBreadcrumb(id, note.title);
    }
  }, [note, id, setCustomBreadcrumb]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.isFree) {
      if (editForm.previewStartPage < 1) return alert("Preview Start Page must be greater than 0");
      if (editForm.previewEndPage < editForm.previewStartPage) return alert("Preview End Page must be greater than or equal to Preview Start Page");
      if (editForm.totalPages > 0 && editForm.previewEndPage > editForm.totalPages) return alert(`Preview End Page cannot exceed Total PDF Pages (${editForm.totalPages})`);
    }

    try {
      const payload: any = { ...editForm, isPremium: !editForm.isFree };
      const res = await updateNotes(id!, payload);
      setNote(res.data.data);
      setIsEditing(false);
      // Reload fully to get populated courses
      load();
    } catch (error) {
      console.error(error);
      alert("Failed to update notes");
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") return alert("Please upload a valid PDF file.");
    if (file.size > 50 * 1024 * 1024) return alert("File size must be less than 50MB");

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append("pdf", file);
    try {
      const res = await uploadPdf(formData);
      setEditForm({ ...editForm, notesPdfUrl: res.data.data.url });
    } catch (err) { alert("Failed to upload PDF"); }
    finally { setUploadingPdf(false); }
  };

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Please upload a valid image file.");
    if (file.size > 10 * 1024 * 1024) return alert("File size must be less than 10MB");

    setUploadingImg(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await uploadImage(formData);
      setEditForm({ ...editForm, thumbnailUrl: res.data.data.url });
    } catch (err) { alert("Failed to upload thumbnail"); }
    finally { setUploadingImg(false); }
  };

  const confirmDelete = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete" || !id) return;
    await deleteNotes(id);
    navigate("/admin/notes");
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";

  if (loading) return <div className="p-8 text-zinc-500 animate-pulse">Loading note details...</div>;
  if (!note) return <div className="p-8 text-rose-500">Note not found.</div>;

  return (
    <div className="p-8 text-foreground max-w-5xl mx-auto flex flex-col min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/admin/notes")} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black">{note.title}</h1>
          <p className="text-zinc-500 font-medium">Manage note details and content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border p-8 rounded-[24px] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">Note Information</h2>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Title</label>
                  <input required value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Subject</label>
                  <input value={editForm.subject} onChange={e => setEditForm({ ...editForm, subject: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Description</label>
                  <textarea rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className={inputClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-black/5 dark:bg-white/[0.02] border border-border rounded-xl">
                    <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1"><FileText size={12} /> PDF URL</label>
                    <input required value={editForm.notesPdfUrl} onChange={e => setEditForm({ ...editForm, notesPdfUrl: e.target.value })} className={`${inputClass} mb-2 py-2`} />
                    <label className={`flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-lg font-bold text-xs cursor-pointer transition-all ${uploadingPdf ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" disabled={uploadingPdf} />
                      {uploadingPdf ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                      {uploadingPdf ? "Uploading..." : "Upload New PDF"}
                    </label>
                  </div>
                  <div className="p-4 bg-black/5 dark:bg-white/[0.02] border border-border rounded-xl">
                    <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1"><ImageIcon size={12} /> Thumbnail URL</label>
                    <input value={editForm.thumbnailUrl} onChange={e => setEditForm({ ...editForm, thumbnailUrl: e.target.value })} className={`${inputClass} mb-2 py-2`} />
                    <label className={`flex items-center justify-center gap-2 px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 rounded-lg font-bold text-xs cursor-pointer transition-all ${uploadingImg ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input type="file" accept="image/*" onChange={handleImgUpload} className="hidden" disabled={uploadingImg} />
                      {uploadingImg ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                      {uploadingImg ? "Uploading..." : "Upload New Image"}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Related Courses</label>
                  <div className="max-h-40 overflow-y-auto border border-border rounded-xl p-3 bg-black/5 dark:bg-white/[0.03] grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {courses.length === 0 && <span className="text-zinc-500 text-sm">No courses available.</span>}
                    {courses.map(c => (
                      <label key={c._id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
                        <input type="checkbox" checked={editForm.courses.includes(c._id)}
                          onChange={(e) => {
                            if (e.target.checked) setEditForm({ ...editForm, courses: [...editForm.courses, c._id] });
                            else setEditForm({ ...editForm, courses: editForm.courses.filter(id => id !== c._id) });
                          }}
                          className="w-3.5 h-3.5 accent-indigo-500" />
                        <span className="text-xs font-medium truncate">{c.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Price (₹)</label>
                    <input type="number" value={editForm.price} disabled={editForm.isFree} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} className={`${inputClass} disabled:opacity-50`} />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Offer Price (₹)</label>
                    <input type="number" value={editForm.offerPrice} disabled={editForm.isFree} onChange={e => setEditForm({ ...editForm, offerPrice: Number(e.target.value) })} className={`${inputClass} disabled:opacity-50`} />
                  </div>
                  <div className="flex flex-col justify-end">
                    <div onClick={() => setEditForm({ ...editForm, isFree: !editForm.isFree })} className="flex items-center gap-2 px-3 py-3 bg-white/[0.03] border border-white/5 rounded-2xl mb-1 cursor-pointer">
                      <input type="checkbox" checked={editForm.isFree} readOnly className="w-4 h-4 accent-indigo-500 rounded" />
                      <span className="text-xs font-bold whitespace-nowrap">Free Notes</span>
                    </div>
                  </div>
                </div>

                {!editForm.isFree && (
                  <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                    <h3 className="text-indigo-400 font-bold mb-4 flex items-center gap-2"><Lock size={16}/> Premium Content Settings</h3>
                    <p className="text-xs text-zinc-500 mb-4">Total Pages: <span className="font-bold text-white">{editForm.totalPages || "Unknown"}</span></p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Preview Start Page</label>
                        <input type="number" min="1" placeholder="1" value={editForm.previewStartPage} onChange={(e) => setEditForm({ ...editForm, previewStartPage: Number(e.target.value) })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Preview End Page</label>
                        <input type="number" min="1" placeholder="10" value={editForm.previewEndPage} onChange={(e) => setEditForm({ ...editForm, previewEndPage: Number(e.target.value) })} className={inputClass} />
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-black uppercase text-xs tracking-widest text-zinc-400 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-3 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all"><Save size={16} /> Save Changes</button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {note.thumbnailUrl && (
                  <div className="w-full h-48 rounded-xl overflow-hidden mb-6 border border-border">
                    <img src={note.thumbnailUrl} alt={note.title} className="w-full h-full object-cover" />
                  </div>
                )}
                {note.description && (
                  <div className="mb-6">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Description</p>
                    <p className="text-sm text-zinc-300 leading-relaxed bg-black/5 dark:bg-white/[0.02] p-4 rounded-xl border border-border">{note.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Subject</p>
                    <p className="font-bold">{note.subject || "General"}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Pricing</p>
                    <div className="flex items-center gap-2">
                      <p className={`font-black ${note.offerPrice > 0 ? 'text-zinc-500 line-through text-xs' : 'text-indigo-400'}`}>{note.isFree ? "Free" : `₹${note.price}`}</p>
                      {note.offerPrice > 0 && !note.isFree && <p className="font-black text-emerald-400">₹{note.offerPrice}</p>}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Pages</p>
                    <p className="font-bold">{note.totalPages > 0 ? note.totalPages : "N/A"}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-border">
                  <a href={note.notesPdfUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-indigo-400" />
                      <span className="font-bold text-sm text-indigo-400 group-hover:underline">View PDF Document</span>
                    </div>
                    <LinkIcon size={16} className="text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border p-6 rounded-[24px] shadow-sm">
            <h3 className="text-lg font-black mb-4">Stats & Info</h3>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Downloads / Access</span>
              <span className="font-black text-pink-400 flex items-center gap-1"><Download size={14} /> {note.downloads || 0}</span>
            </div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Total Purchases</span>
              <span className="font-black text-indigo-400 flex items-center gap-1"><Users size={14} /> {note.purchases || 0}</span>
            </div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Uploaded On</span>
              <span className="font-bold text-sm">{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Associated Courses</span>
              {note.courses?.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {note.courses.map((c: any, i: number) => (
                    <span key={i} className="text-xs font-bold bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-border break-words leading-tight">{c.title || c}</span>
                  ))}
                </div>
              ) : (
                <span className="font-bold text-sm text-zinc-500">None</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => setIsEditing(!isEditing)} className="flex items-center justify-center gap-2 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-foreground">
              <Edit size={16} /> {isEditing ? "Cancel Edit" : "Edit Note"}
            </button>
            <button onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(""); }} className="flex items-center justify-center gap-2 py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
              <Trash2 size={16} /> Delete Note
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[32px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden text-center">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <Trash2 size={36} className="text-rose-500" />
            </div>

            <h2 className="text-xl font-black text-foreground mb-2 tracking-tight line-clamp-2 px-2">
              Delete "{note.title}"?
            </h2>
            <p className="text-zinc-500 text-sm mb-8 px-4">
              This will permanently delete the note. This action cannot be undone.
            </p>

            <div className="bg-black/5 dark:bg-white/5 border border-border rounded-2xl p-6 mb-8 text-left">
              <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-3 text-center">
                Type <span className="text-foreground select-all">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full text-center px-4 py-4 bg-black/5 dark:bg-black/40 border border-border rounded-xl text-foreground text-lg font-black outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-zinc-400 tracking-[0.2em]"
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }} className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-zinc-500 hover:text-foreground">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmText.toLowerCase() !== "delete"}
                className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 disabled:bg-white/5 disabled:text-zinc-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-white shadow-lg shadow-rose-600/20 active:scale-95 border border-transparent"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

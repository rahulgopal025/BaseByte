import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Link as LinkIcon, Loader2, ChevronDown } from "lucide-react";

const NOTIFICATION_TYPES = [
  { value: "SYSTEM", label: "System" },
  { value: "COURSE", label: "Course" },
  { value: "ALERT", label: "Alert" }
];
import { 
  getAdminNotifications, 
  createAdminNotification, 
  updateAdminNotification,
  getStudents,
  getAdminCourses,
  getAdminNotes
} from "../../api/admin.api";
import { useToast } from "../../hooks/useToast";

const emptyForm = {
  title: "", message: "", type: "SYSTEM", link: "",
  targetUsers: [] as string[],
  targetCourses: [] as string[],
  targetNotes: [] as string[]
};

export default function AdminNotificationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [allNotes, setAllNotes] = useState<any[]>([]);
  const [isGlobal, setIsGlobal] = useState(true);

  useEffect(() => {
    Promise.all([
      getStudents(),
      getAdminCourses(),
      getAdminNotes()
    ]).then(([studentsRes, coursesRes, notesRes]) => {
      setAllStudents(studentsRes.data.data || []);
      setAllCourses(coursesRes.data.data || []);
      setAllNotes(notesRes.data.data || []);
    }).catch(console.error);

    if (id) {
      getAdminNotifications().then(res => {
        const found = (res.data.data || []).find((n: any) => n._id === id);
        if (found) {
          setForm({ 
            title: found.title, 
            message: found.message, 
            type: found.type, 
            link: found.link || "",
            targetUsers: found.targetUsers || [],
            targetCourses: found.targetCourses || [],
            targetNotes: found.targetNotes || []
          });
          if (found.targetUsers?.length > 0 || found.targetCourses?.length > 0 || found.targetNotes?.length > 0) {
            setIsGlobal(false);
          }
        }
      }).catch(console.error).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = isGlobal 
        ? { ...form, targetUsers: [], targetCourses: [], targetNotes: [] }
        : form;

      if (id) {
        await updateAdminNotification(id, payload);
        showToast("Notification updated successfully", "success");
      } else {
        await createAdminNotification(payload);
        showToast("Notification broadcasted successfully", "success");
      }
      navigate("/admin/notifications");
    } catch {
      showToast("Failed to save notification.", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";

  if (loading) {
    return <div className="p-8 text-zinc-500 animate-pulse">Loading notification details...</div>;
  }

  return (
    <div className="p-8 text-white max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/admin/notifications")} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black">{id ? "Edit Notification" : "New Broadcast"}</h1>
          <p className="text-zinc-500 font-medium">Create and manage broadcast notifications</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0d0d0e] border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Title</label>
          <input required placeholder="e.g. Server Maintenance" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Message</label>
          <textarea required placeholder="Write your announcement here..." rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputClass + " resize-none"} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Type</label>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${inputClass} cursor-pointer flex justify-between items-center`}
            >
              {NOTIFICATION_TYPES.find(t => t.value === form.type)?.label || "Select Type"}
              <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </div>
            
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#161618] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
                  {NOTIFICATION_TYPES.map(t => (
                    <div 
                      key={t.value}
                      onClick={() => {
                        setForm({ ...form, type: t.value });
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-3 cursor-pointer text-sm transition-colors ${form.type === t.value ? 'bg-indigo-500/10 text-indigo-400 font-bold' : 'text-zinc-300 hover:text-white hover:bg-white/5'}`}
                    >
                      {t.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Link (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon size={14} className="text-zinc-500" />
              </div>
              <input placeholder="/courses/123" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={`${inputClass} pl-10`} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl cursor-pointer" onClick={() => setIsGlobal(!isGlobal)}>
          <input type="checkbox" checked={isGlobal} readOnly className="w-5 h-5 accent-indigo-500 pointer-events-none" />
          <div>
            <label className="text-sm text-white font-bold block">Send to Everyone (Global)</label>
            <p className="text-xs text-zinc-500">If unchecked, you can target specific courses, students, or notes.</p>
          </div>
        </div>

        {!isGlobal && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Target Courses</label>
              <div className="max-h-48 overflow-y-auto bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2">
                {allCourses.map(course => (
                  <label key={course._id} className="flex items-center gap-3 cursor-pointer p-1">
                    <input 
                      type="checkbox" 
                      checked={form.targetCourses.includes(course._id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setForm(prev => ({
                          ...prev,
                          targetCourses: checked 
                            ? [...prev.targetCourses, course._id]
                            : prev.targetCourses.filter(id => id !== course._id)
                        }));
                      }}
                      className="w-4 h-4 accent-indigo-500 rounded"
                    />
                    <span className="text-sm font-bold text-white">{course.title}</span>
                  </label>
                ))}
                {allCourses.length === 0 && <p className="text-xs text-zinc-500">No courses available.</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Target Notes</label>
              <div className="max-h-48 overflow-y-auto bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2">
                {allNotes.map(note => (
                  <label key={note._id} className="flex items-center gap-3 cursor-pointer p-1">
                    <input 
                      type="checkbox" 
                      checked={form.targetNotes.includes(note._id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setForm(prev => ({
                          ...prev,
                          targetNotes: checked 
                            ? [...prev.targetNotes, note._id]
                            : prev.targetNotes.filter(id => id !== note._id)
                        }));
                      }}
                      className="w-4 h-4 accent-indigo-500 rounded"
                    />
                    <span className="text-sm font-bold text-white">{note.title}</span>
                  </label>
                ))}
                {allNotes.length === 0 && <p className="text-xs text-zinc-500">No notes available.</p>}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
          <button type="button" onClick={() => navigate("/admin/notifications")} className="flex-1 py-3 bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400 hover:bg-white/10 transition-all">Cancel</button>
          <button 
            type="submit" 
            disabled={saving || !form.title || !form.message || (!isGlobal && form.targetUsers.length === 0 && form.targetCourses.length === 0 && form.targetNotes.length === 0)} 
            className="flex-1 flex justify-center items-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="animate-spin" size={14}/> : null}
            {saving ? "Saving..." : id ? "Update Notification" : <><Send size={14}/> Broadcast Now</>}
          </button>
        </div>
      </form>
    </div>
  );
}

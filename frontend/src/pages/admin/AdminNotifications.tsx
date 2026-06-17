import { useEffect, useState } from "react";
import { Bell, Plus, Trash2, Edit, X, Link as LinkIcon, Send } from "lucide-react";
import { getAdminNotifications, createAdminNotification, updateAdminNotification, deleteAdminNotification } from "../../api/admin.api";
import { useToast } from "../../hooks/useToast";

const emptyForm = {
  title: "", message: "", type: "SYSTEM", link: ""
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    getAdminNotifications()
      .then((res) => setNotifications(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await updateAdminNotification(editId, form);
        showToast("Notification updated successfully", "success");
      } else {
        await createAdminNotification(form);
        showToast("Notification broadcasted successfully", "success");
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      load();
    } catch { 
      showToast("Failed to save notification.", "error"); 
    }
    finally { setSaving(false); }
  };

  const handleEdit = (notif: any) => {
    setForm({ title: notif.title, message: notif.message, type: notif.type, link: notif.link || "" });
    setEditId(notif._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification? It will be removed for all users.")) return;
    try {
      await deleteAdminNotification(id);
      showToast("Notification deleted", "success");
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      showToast("Failed to delete notification", "error");
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";

  return (
    <div className="p-8 text-white max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Bell size={18} className="text-amber-400" />
            </div>
            <span className="text-amber-400 text-xs font-black uppercase tracking-widest">Communication</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">Notifications</h1>
          <p className="text-zinc-500 font-medium">{notifications.length} total notifications</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Broadcast Notification
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0d0d0e] border border-white/10 rounded-[32px] p-8 w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">{editId ? "Edit Notification" : "New Broadcast"}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Title</label>
                <input required placeholder="e.g. Server Maintenance" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Message</label>
                <textarea required placeholder="Write your announcement here..." rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputClass + " resize-none"} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                    <option value="SYSTEM">System</option>
                    <option value="COURSE">Course</option>
                    <option value="ALERT">Alert</option>
                  </select>
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

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400 hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" disabled={saving || !form.title || !form.message} className="flex-1 flex justify-center items-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all disabled:opacity-60">
                  {saving ? "Saving..." : editId ? "Update Notification" : <><Send size={14}/> Broadcast Now</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => <div key={i} className="h-24 bg-zinc-900 rounded-[24px] animate-pulse border border-white/5" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <Bell size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No notifications have been broadcasted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div key={notif._id} className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all flex flex-col md:flex-row gap-6 md:items-center">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${notif.type === 'COURSE' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : notif.type === 'ALERT' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-zinc-800 text-zinc-400 border-white/5"}`}>
                    {notif.type}
                  </span>
                  <span className="text-zinc-500 text-xs font-bold">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                  {notif.isGlobal && (
                    <span className="text-indigo-400 text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">Global</span>
                  )}
                </div>
                <h3 className="font-black text-lg mb-1">{notif.title}</h3>
                <p className="text-zinc-400 text-sm">{notif.message}</p>
                {notif.link && (
                  <div className="flex items-center gap-1 mt-3 text-indigo-400 text-xs font-bold">
                    <LinkIcon size={12} /> {notif.link}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 md:border-l md:border-white/5 md:pl-6">
                <div className="text-center px-4">
                  <div className="text-2xl font-black text-white">{notif.readBy?.length || 0}</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Views</div>
                </div>
                <button onClick={() => handleEdit(notif)} className="p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all" title="Edit">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(notif._id)} className="p-3 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

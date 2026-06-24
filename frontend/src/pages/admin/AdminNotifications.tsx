import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Plus, Trash2, Edit, Link as LinkIcon } from "lucide-react";
import { getAdminNotifications, deleteAdminNotification } from "../../api/admin.api";
import { useToast } from "../../hooks/useToast";

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    getAdminNotifications()
      .then((res) => setNotifications(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);


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
          onClick={() => navigate("/admin/notifications/new")}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Broadcast Notification
        </button>
      </div>

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
                <button onClick={() => navigate(`/admin/notifications/${notif._id}/edit`)} className="p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all" title="Edit">
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

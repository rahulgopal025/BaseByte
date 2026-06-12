import { useEffect, useState } from "react";
import { MessageSquare, Trash2, Star } from "lucide-react";
import { getAdminFeedback, deleteFeedback } from "../../api/admin.api";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminFeedback()
      .then((res) => setFeedbacks(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feedback?")) return;
    await deleteFeedback(id);
    setFeedbacks((prev) => prev.filter((f) => f._id !== id));
  };

  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <MessageSquare size={18} className="text-rose-400" />
        </div>
        <span className="text-rose-400 text-xs font-black uppercase tracking-widest">Reports</span>
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-1">Feedback</h1>
      <p className="text-zinc-500 font-medium mb-8">{feedbacks.length} total feedback submissions</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-32 bg-zinc-900 rounded-[24px] animate-pulse border border-white/5" />)}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <MessageSquare size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No feedback yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map((fb) => (
            <div key={fb._id} className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-sm">{fb.userId?.name || "Anonymous"}</p>
                  <p className="text-zinc-500 text-xs">{fb.userId?.email || fb.userEmail}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={12} className={s <= fb.rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"} />
                  ))}
                </div>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-4">{fb.comment}</p>
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${fb.type === "course" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                  {fb.type}
                </span>
                <button onClick={() => handleDelete(fb._id)} className="text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-xl transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

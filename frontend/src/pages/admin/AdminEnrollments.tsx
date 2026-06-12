import { useEffect, useState } from "react";
import { ClipboardList, Check, X, Clock } from "lucide-react";
import { getAllEnrollments, updateEnrollmentStatus } from "../../api/admin.api";

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    getAllEnrollments()
      .then((res) => setEnrollments(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? enrollments : enrollments.filter((e) => e.status === filter);

  const handleStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdating(id);
    try {
      await updateEnrollmentStatus(id, status);
      setEnrollments((prev) => prev.map((e) => e._id === id ? { ...e, status } : e));
    } catch { alert("Failed to update."); }
    finally { setUpdating(null); }
  };

  const statusBadge = (status: string) => {
    const map: any = {
      pending: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      approved: "bg-green-500/10 text-green-400 border-green-500/20",
      rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return `text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${map[status] || ""}`;
  };

  const counts = {
    all: enrollments.length,
    pending: enrollments.filter((e) => e.status === "pending").length,
    approved: enrollments.filter((e) => e.status === "approved").length,
    rejected: enrollments.filter((e) => e.status === "rejected").length,
  };

  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <ClipboardList size={18} className="text-orange-400" />
        </div>
        <span className="text-orange-400 text-xs font-black uppercase tracking-widest">Management</span>
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-1">Enrollments</h1>
      <p className="text-zinc-500 font-medium mb-8">Manage student course access requests.</p>

      {/* Filter Tabs */}
      <div className="flex bg-[#0d0d0e] border border-white/5 p-1 rounded-xl w-fit mb-8 gap-1">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === f ? "bg-indigo-600 text-white shadow-lg" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
          >
            {f} <span className={`${filter === f ? "bg-white/20" : "bg-white/5"} px-1.5 py-0.5 rounded-md text-[9px]`}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse border border-white/5" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <ClipboardList size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No {filter === "all" ? "" : filter} enrollments found.</p>
        </div>
      ) : (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <div className="col-span-3">Student</div>
            <div className="col-span-3">Course</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Actions</div>
          </div>
          {filtered.map((enr, i) => (
            <div key={enr._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors ${i !== filtered.length - 1 ? "border-b border-white/5" : ""}`}>
              <div className="col-span-3">
                <p className="text-white text-sm font-bold truncate">{enr.userId?.name || "—"}</p>
                <p className="text-zinc-500 text-xs truncate">{enr.userId?.email || enr.userEmail}</p>
              </div>
              <div className="col-span-3">
                <p className="text-white text-sm font-bold truncate">{enr.courseId?.title || "—"}</p>
                <p className="text-zinc-500 text-xs">{enr.courseId?.price === 0 ? "Free" : `₹${enr.courseId?.price}`}</p>
              </div>
              <div className="col-span-2"><span className={statusBadge(enr.status)}>{enr.status}</span></div>
              <div className="col-span-2 text-zinc-500 text-xs flex items-center gap-1">
                <Clock size={11} />{new Date(enr.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
              <div className="col-span-2 flex gap-2">
                {enr.status === "pending" && (
                  <>
                    <button onClick={() => handleStatus(enr._id, "approved")} disabled={updating === enr._id} className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50">
                      <Check size={11} /> Approve
                    </button>
                    <button onClick={() => handleStatus(enr._id, "rejected")} disabled={updating === enr._id} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all disabled:opacity-50">
                      <X size={11} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, BarChart3, FileText,
  FileQuestion, ClipboardList, MessageSquare,
  Zap, ArrowRight, Clock, Bell, Send
} from "lucide-react";
import { getAdminStats } from "../../api/admin.api";
import { useToast } from "../../hooks/useToast";

interface Stats {
  totalStudents: number;
  totalCourses: number;
  totalProblems: number;
  totalQuizzes: number;
  totalFeedback: number;
  totalNotes: number;
  pendingEnrollments: number;
  recentStudents: { _id: string; name: string; email: string; createdAt: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    getAdminStats()
      .then((res) => {
        console.log("ADMIN STATS RESPONSE:", res.data);
        setStats(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalStudents, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", path: "/admin/students" },
    { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", path: "/admin/courses" },
    { label: "Total Problems", value: stats.totalProblems, icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", path: "/admin/problems" },
    { label: "Total Quizzes", value: stats.totalQuizzes, icon: FileQuestion, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", path: "/admin/quiz" },
    { label: "Practice Paths", value: "Manage", icon: BarChart3, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", path: "/admin/practice-paths" },
    { label: "Feedback", value: stats.totalFeedback, icon: MessageSquare, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", path: "/admin/feedback" },
    { label: "Approved Notes", value: stats.totalNotes, icon: FileText, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20", path: "/admin/notes" },
  ] : [];

  return (
    <div className="p-8 text-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
          <Zap size={18} className="text-indigo-400" fill="currentColor" />
        </div>
        <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">Overview</span>
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-1">Dashboard</h1>
      <p className="text-zinc-500 font-medium mb-10">Welcome back, Admin. Here's your live overview.</p>

      {/* Pending Enrollments Alert */}
      {stats && stats.pendingEnrollments > 0 && (
        <div
          onClick={() => navigate("/admin/enrollments")}
          className="mb-8 flex items-center justify-between p-5 bg-orange-500/5 border border-orange-500/20 rounded-[20px] cursor-pointer hover:bg-orange-500/10 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <ClipboardList size={18} className="text-orange-400" />
            </div>
            <div>
              <p className="text-foreground font-black">
                {stats.pendingEnrollments} Pending Enrollment{stats.pendingEnrollments > 1 ? "s" : ""}
              </p>
              <p className="text-zinc-500 text-sm">Waiting for your approval</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-20 bg-card rounded-2xl animate-pulse border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
          {statCards.map((card) => (
            <div
              key={card.label}
              onClick={() => navigate(card.path)}
              className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:border-zinc-400 dark:hover:border-white/10 hover:-translate-y-0.5 transition-all duration-300 group flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className={`inline-flex p-2.5 rounded-xl border ${card.bg}`}>
                  <card.icon size={18} className={card.color} />
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{card.label}</div>
                  <div className="text-2xl font-black leading-none">{card.value}</div>
                </div>
              </div>
              <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-zinc-600 group-hover:text-foreground" />
            </div>
          ))}
        </div>
      )}

      {/* Recent Students */}
      <div className="bg-card border border-border rounded-[24px] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black">Recent Signups</h2>
          <button
            onClick={() => navigate("/admin/students")}
            className="text-indigo-400 text-xs font-black uppercase tracking-widest hover:text-indigo-300 flex items-center gap-1"
          >
            View All <ArrowRight size={12} />
          </button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : stats?.recentStudents.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-8">No students yet.</p>
        ) : (
          <div className="space-y-2">
            {stats?.recentStudents.map((student) => (
              <div key={student._id} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/[0.02] rounded-2xl hover:bg-black/10 dark:hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-600/20 rounded-full flex items-center justify-center">
                    <span className="text-indigo-400 text-sm font-black">{student.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-bold">{student.name}</p>
                    <p className="text-zinc-500 text-xs">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-zinc-600 text-xs">
                  <Clock size={11} />
                  {new Date(student.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

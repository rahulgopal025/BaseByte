import React from "react";
import { Users, BookOpen, BarChart3, FileText, TrendingUp, Zap } from "lucide-react";

const stats = [
  { label: "Total Students", value: "—", icon: <Users size={20} />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { label: "Total Courses", value: "—", icon: <BookOpen size={20} />, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { label: "Total Problems", value: "—", icon: <BarChart3 size={20} />, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { label: "Feedback Received", value: "—", icon: <FileText size={20} />, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
];

export default function AdminDashboard() {
  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
          <Zap size={18} className="text-indigo-400" fill="currentColor" />
        </div>
        <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">Admin Panel</span>
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-1">Dashboard</h1>
      <p className="text-zinc-500 font-medium mb-10">Welcome back, Admin. Here's your overview.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6">
            <div className={`inline-flex p-3 rounded-2xl border mb-4 ${stat.bg}`}>
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <div className="text-3xl font-black mb-1">{stat.value}</div>
            <div className="text-zinc-500 text-sm font-bold">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-8 flex flex-col items-center justify-center min-h-48 text-center">
        <TrendingUp size={32} className="text-zinc-700 mb-4" />
        <p className="text-zinc-500 font-bold">Live stats and charts coming in Phase 2</p>
        <p className="text-zinc-600 text-sm mt-1">Stats will connect to real DB data.</p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Users, UserPlus, Calendar, BarChart2, Activity, MapPin, FileText } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getVisitorAnalytics } from "../../api/admin.api";

export default function AdminVisitors() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVisitorAnalytics()
      .then(res => setAnalytics(res.data.data))
      .catch(err => {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load visitor analytics.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <Activity size={48} className="text-indigo-500 mb-4 animate-bounce" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl text-center">
          <p className="text-rose-500 font-bold">{error || "Analytics data unavailable"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-foreground">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <BarChart2 size={18} className="text-emerald-400" />
          </div>
          <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Reports</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-1">Visitor Analytics</h1>
        <p className="text-zinc-500 font-medium">Traffic and page view metrics from Google Analytics</p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border p-6 rounded-[24px] shadow-sm flex items-center justify-between group hover:border-indigo-500/50 transition-all">
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Total Visitors</p>
            <p className="text-3xl font-black leading-none">{analytics.totalVisitors.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-indigo-500/10 rounded-2xl"><Users size={24} className="text-indigo-400" /></div>
        </div>

        <div className="bg-card border border-border p-6 rounded-[24px] shadow-sm flex items-center justify-between group hover:border-emerald-500/50 transition-all">
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-emerald-400 transition-colors">Today's Visitors</p>
            <p className="text-3xl font-black leading-none">{analytics.todayVisitors.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-2xl"><UserPlus size={24} className="text-emerald-400" /></div>
        </div>

        <div className="bg-card border border-border p-6 rounded-[24px] shadow-sm flex items-center justify-between group hover:border-blue-500/50 transition-all">
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Weekly Visitors</p>
            <p className="text-3xl font-black leading-none">{analytics.weeklyVisitors.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-2xl"><Calendar size={24} className="text-blue-400" /></div>
        </div>

        <div className="bg-card border border-border p-6 rounded-[24px] shadow-sm flex items-center justify-between group hover:border-purple-500/50 transition-all">
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">Monthly Visitors</p>
            <p className="text-3xl font-black leading-none">{analytics.monthlyVisitors.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-2xl"><Activity size={24} className="text-purple-400" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-[24px] shadow-sm">
          <h2 className="text-xl font-black mb-6">Visitor Trends (Last 7 Days)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#818cf8', fontWeight: '900' }}
                />
                <Area type="monotone" dataKey="visitors" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Pages Table */}
        <div className="bg-card border border-border p-6 rounded-[24px] shadow-sm flex flex-col">
          <h2 className="text-xl font-black mb-6">Most Visited Pages</h2>
          <div className="flex-1 overflow-auto">
            {analytics.topPages?.length > 0 ? (
              <div className="space-y-4">
                {analytics.topPages.map((page: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/[0.02] rounded-xl hover:bg-black/10 dark:hover:bg-white/[0.05] transition-colors border border-transparent hover:border-border">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                        <MapPin size={14} />
                      </div>
                      <p className="text-sm font-bold truncate text-foreground" title={page.path}>
                        {page.path === '/' ? '/ (Home)' : page.path}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-black text-emerald-400">{page.views.toLocaleString()}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Views</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
                <FileText size={32} className="mb-3 opacity-20" />
                <p className="font-bold text-sm">No page data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

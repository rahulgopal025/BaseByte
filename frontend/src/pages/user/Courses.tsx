import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Star, Users, Zap, IndianRupee } from "lucide-react";
import { getAllCourses } from "../../api/course.api";

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");
  const navigate = useNavigate();

  useEffect(() => {
    getAllCourses()
      .then(res => setCourses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "free" ? c.isFree : !c.isFree);
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-16 md:px-16">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
          <Zap size={12} fill="currentColor" /> BaseByte Courses
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
          Learn <span className="text-indigo-500">Everything</span>
        </h1>
        <p className="text-zinc-400 text-lg mb-12 max-w-xl">
          Video lectures, live sessions, notes, and hands-on problems — all in one place.
        </p>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search courses or instructor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-[#0d0d0e] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex bg-[#0d0d0e] border border-white/5 p-1 rounded-xl gap-1">
            {(["all", "free", "paid"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === f ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-zinc-900 rounded-[24px] animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen size={40} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold text-lg">
              {courses.length === 0 ? "No courses published yet. Check back soon!" : "No courses match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(course => (
              <div
                key={course._id}
                onClick={() => navigate(`/courses/${course._id}`)}
                className="bg-[#0d0d0e] border border-white/5 rounded-[24px] overflow-hidden hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="h-40 bg-indigo-600/10 flex items-center justify-center border-b border-white/5 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={40} className="text-indigo-400/50" />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${course.isFree ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"}`}>
                      {course.isFree ? "Free" : "Paid"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-black text-lg leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                  </div>
                  <p className="text-zinc-500 text-sm mb-1">{course.instructor}</p>
                  {course.category && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 text-zinc-500 rounded-md">
                      {course.category}
                    </span>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <div className="text-2xl font-black">
                      {course.isFree ? (
                        <span className="text-green-400">Free</span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <IndianRupee size={18} className="text-indigo-400" />
                          <span>{course.price}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Star, Users, Zap, IndianRupee, Video, Radio, Infinity, CalendarClock } from "lucide-react";
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
    <div className="min-h-screen bg-[#050505] text-white px-6 py-16 md:px-16 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 backdrop-blur-xl hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-default">
            <Zap size={14} fill="currentColor" className="animate-pulse" />
            <span>Premium Learning Experience</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Master Your <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-rose-400 text-transparent bg-clip-text drop-shadow-sm">Craft</span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium px-2">
            Elevate your skills with world-class video lectures, interactive live sessions, comprehensive notes, and hands-on coding problems.
          </p>

          {/* Search + Filter */}
          <div className="w-full max-w-4xl flex flex-col md:flex-row gap-3 md:gap-4 p-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-3xl shadow-2xl">
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-transparent text-white text-sm md:text-base font-medium outline-none placeholder:text-zinc-500 transition-all"
              />
            </div>
            <div className="flex bg-black/40 p-1 md:p-1.5 rounded-2xl gap-1 overflow-hidden w-full md:w-auto">
              {(["all", "free", "paid"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 md:flex-none px-3 sm:px-6 md:px-8 py-2.5 md:py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] transition-all duration-300 ${filter === f ? "bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[340px] bg-white/5 rounded-[2rem] animate-pulse border border-white/5 backdrop-blur-sm" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={40} className="text-zinc-500" />
            </div>
            <p className="text-zinc-300 font-bold text-2xl mb-2">
              {courses.length === 0 ? "No courses published yet." : "No courses match your search."}
            </p>
            <p className="text-zinc-500 font-medium">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((course: any) => (
            <div
              key={course._id}
              onClick={() => navigate(`/courses/${course._id}`)}
              className="group relative bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 cursor-pointer hover:shadow-[0_0_40px_rgba(79,70,229,0.15)] hover:border-indigo-500/30 flex flex-col backdrop-blur-sm"
            >
              {/* Thumbnail */}
              <div className="h-[180px] relative overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border-b border-white/5">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <BookOpen size={48} className="text-indigo-400/50 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-500 relative z-10" />
                  </div>
                )}
                
                {/* Glow effect on hover over image */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent opacity-90" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                  {course.discountPercentage && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-lg shadow-rose-500/30 backdrop-blur-md">
                      {course.discountPercentage}% OFF
                    </span>
                  )}
                </div>
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-20">
                  {course.isFeatured && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg shadow-amber-500/30 backdrop-blur-md flex items-center gap-1.5">
                      <Star size={12} fill="currentColor" /> FEATURED
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1 relative z-10">
                {/* Subtle gradient orb behind text */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500 pointer-events-none" />

                <div className="mb-2">
                  <h3 className="font-bold text-xl md:text-xl tracking-tight leading-snug text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-fuchsia-400 transition-all line-clamp-2 drop-shadow-md">
                    {course.title}
                  </h3>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-2 mb-5">
                  {course.instructor && (
                    <div className="flex items-center gap-2.5 text-zinc-300 text-[13px] col-span-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white shadow-inner ring-2 ring-white/10">
                        {course.instructor.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm truncate">{course.instructor}</span>
                    </div>
                  )}
                  {course.level && (
                    <div className="flex items-center gap-2 text-zinc-400 text-[13px] bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                      <Zap size={14} className="text-indigo-400" />
                      <span className="truncate">{course.level}</span>
                    </div>
                  )}
                  {course.duration && (
                    <div className="flex items-center gap-2 text-zinc-400 text-[13px] bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                      <span className="text-fuchsia-400 text-sm">⏱️</span>
                      <span className="truncate">{course.duration}</span>
                    </div>
                  )}
                  {course.lessonsCount && (
                    <div className="flex items-center gap-2 text-zinc-400 text-[13px] bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                      <BookOpen size={14} className="text-rose-400" />
                      <span className="truncate">{course.lessonsCount} lessons</span>
                    </div>
                  )}
                  {course.courseType && (
                    <div className="flex items-center gap-2 text-zinc-400 text-[13px] bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                      {course.courseType === 'Recorded' ? (
                        <Video size={14} className="text-blue-400" />
                      ) : (
                        <Radio size={14} className="text-red-500 animate-pulse" />
                      )}
                      <span className="truncate">{course.courseType}</span>
                    </div>
                  )}
                  {course.validity && (
                    <div className="flex items-center gap-2 text-zinc-400 text-[13px] bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                      {course.validity === 'Lifetime Access' ? (
                        <Infinity size={14} className="text-emerald-400" />
                      ) : (
                        <CalendarClock size={14} className="text-amber-400" />
                      )}
                      <span className="truncate">{course.validity}</span>
                    </div>
                  )}
                </div>

                {/* Footer (Price & Button) */}
                <div className="mt-auto pt-4 border-t border-white/10">
                  <div className="flex items-end gap-3 mb-4">
                    {course.isFree ? (
                      <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text">Free</span>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-white leading-none tracking-tight">
                          ₹{course.price}
                        </span>
                        {course.originalPrice > 0 && course.originalPrice > course.price && (
                          <span className="text-sm font-medium text-zinc-500 line-through leading-none mb-1">
                            ₹{course.originalPrice}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all duration-300 text-[14px] flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 group/btn">
                    View Course
                    <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                  </button>
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

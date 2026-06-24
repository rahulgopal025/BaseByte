import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Star, Zap, Video, Radio, Infinity, CalendarClock, Play } from "lucide-react";
import { getMyEnrollments } from "../../api/course.api";

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getMyEnrollments()
      .then(res => setEnrollments(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter(e => {
    const c = e.courseId;
    if (!c) return false;
    return c.title.toLowerCase().includes(search.toLowerCase()) ||
           c.instructor?.toLowerCase().includes(search.toLowerCase());
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
            <span>My Learning Journey</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Your <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-rose-400 text-transparent bg-clip-text drop-shadow-sm">Enrolled</span> Courses
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium px-2">
            Pick up right where you left off. Access all your premium content, videos, and notes here.
          </p>

          {/* Search */}
          <div className="w-full max-w-4xl flex flex-col md:flex-row gap-3 md:gap-4 p-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-3xl shadow-2xl">
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search your courses or instructor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-transparent text-white text-sm md:text-base font-medium outline-none placeholder:text-zinc-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[340px] bg-white/5 rounded-[2rem] animate-pulse border border-white/5 backdrop-blur-sm" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={40} className="text-zinc-500" />
            </div>
            <p className="text-zinc-300 font-bold text-2xl mb-2">
              {enrollments.length === 0 ? "You haven't enrolled in any courses yet." : "No enrolled courses match your search."}
            </p>
            {enrollments.length === 0 && (
              <button 
                onClick={() => navigate("/courses")}
                className="mt-6 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-full font-bold hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all active:scale-95"
              >
                Browse Courses
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(enrollment => {
              const course = enrollment.courseId;
              if (!course) return null;
              return (
                <div
                  key={enrollment._id}
                  onClick={() => navigate(`/courses/${course._id}/learn`)}
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
                    
                    {/* Play Button Overlay (Optional for enrolled) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-2xl">
                        <Play fill="currentColor" size={24} className="ml-1" />
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg shadow-emerald-500/30 backdrop-blur-md">
                        ENROLLED
                      </span>
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
                    <div className="grid grid-cols-2 gap-y-2 gap-x-2 mb-5 mt-auto">
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
                    </div>

                    {/* Footer (Button) */}
                    <div className="mt-auto pt-4 border-t border-white/10">
                      <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-fuchsia-500 transition-all duration-300 text-[14px] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95 group/btn">
                        Continue Learning
                        <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

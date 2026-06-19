import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Zap, IndianRupee } from "lucide-react";
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
    <div className="min-h-screen bg-[#050505] text-white px-6 py-16 md:px-16">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
          <Zap size={12} fill="currentColor" /> My Learning
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
          Your <span className="text-indigo-500">Enrolled</span> Courses
        </h1>
        <p className="text-zinc-400 text-lg mb-12 max-w-xl">
          Pick up right where you left off. Access all your enrolled courses here.
        </p>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search your courses or instructor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-[#0d0d0e] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-zinc-900 rounded-[24px] animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen size={40} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold text-lg">
              {enrollments.length === 0 ? "You haven't enrolled in any courses yet." : "No enrolled courses match your search."}
            </p>
            {enrollments.length === 0 && (
              <button 
                onClick={() => navigate("/courses")}
                className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors"
              >
                Browse Courses
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(enrollment => {
              const course = enrollment.courseId;
              if (!course) return null;
              return (
                <div
                  key={enrollment._id}
                  onClick={() => navigate(`/courses/${course._id}/learn`)}
                  className="bg-[#0d0d0e] border border-white/5 rounded-[24px] overflow-hidden hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="h-40 bg-indigo-600/10 flex items-center justify-center border-b border-white/5 relative overflow-hidden flex-shrink-0">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <BookOpen size={40} className="text-indigo-400/50 group-hover:scale-110 transition-transform duration-500" />
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Enrolled
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-black text-lg leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                    </div>
                    <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{course.instructor}</p>
                      <button className="text-indigo-400 text-sm font-bold group-hover:text-indigo-300 flex items-center gap-1">
                        Continue <Zap size={14} />
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

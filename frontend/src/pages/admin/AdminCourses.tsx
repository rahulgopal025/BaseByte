import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, Trash2, Edit, Eye, EyeOff, X, Users, Settings, ArrowLeft } from "lucide-react";
import { getAdminCourses, createCourse, updateCourse, deleteCourse } from "../../api/admin.api";

const emptyForm = {
  title: "", description: "", thumbnail: "", price: 0, originalPrice: 0,
  isFree: false, instructor: "", category: "", tags: "", isPublished: false,
  discountPercentage: "", level: "", duration: "", lessonsCount: "", isFeatured: false
};

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "free" | "paid">("paid");

  const load = () => {
    getAdminCourses()
      .then((res) => setCourses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => { load(); }, []);



  const togglePublish = async (course: any) => {
    const updated = await updateCourse(course._id, { isPublished: !course.isPublished });
    setCourses((prev) => prev.map((c) => c._id === course._id ? updated.data.data : c));
  };

  const inputClass = "w-full px-4 py-3 bg-black/5 dark:bg-white/[0.03] border border-border rounded-2xl text-foreground text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600";

  const filteredCourses = courses.filter((c) => {
    if (filterType === "free") return c.isFree;
    if (filterType === "paid") return !c.isFree;
    return true;
  });

  return (
    <div className="p-8 text-foreground">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-6">
          <button onClick={() => navigate("/admin")} className="mt-2 p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl transition-all">
            <ArrowLeft size={20} className="text-zinc-400" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <BookOpen size={18} className="text-purple-400" />
              </div>
              <span className="text-purple-400 text-xs font-black uppercase tracking-widest">Courses</span>
            </div>

          </div>
        </div>
        <button
          onClick={() => navigate("/admin/courses/new")}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> New Course
        </button>
      </div>

      <div className="flex gap-4 border-b border-border mb-8">
        {(['all', 'free', 'paid'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${filterType === tab ? "border-indigo-500 text-indigo-400" : "border-transparent text-zinc-500 hover:text-foreground"}`}
          >
            {tab} Courses
          </button>
        ))}
      </div>





      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3].map((i) => <div key={i} className="h-48 bg-black/5 dark:bg-zinc-900 rounded-[24px] animate-pulse border border-border" />)}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-card border border-border rounded-[24px] p-16 text-center">
          <BookOpen size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No courses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="bg-card border border-border rounded-[24px] p-6 hover:border-zinc-400 dark:hover:border-white/10 transition-all flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${course.isPublished ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-black/10 dark:bg-zinc-800 text-zinc-500 border-border"}`}>
                  {course.isPublished ? "Published" : "Draft"}
                </span>
                <span className="text-indigo-400 font-black text-lg">
                  {course.isFree ? "Free" : `₹${course.price}`}
                </span>
              </div>
              <h3 className="font-black text-xl mb-2 leading-tight">{course.title}</h3>
              <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{course.description}</p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-xs font-bold bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-border">
                  <Users size={14} className="text-blue-400" /> {course.enrolledCount || 0} Enrolled
                </div>
              </div>

              <div className="mt-auto space-y-2">
                <button onClick={() => navigate(`/admin/courses/${course._id}`)} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                  <Settings size={14} /> Manage Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

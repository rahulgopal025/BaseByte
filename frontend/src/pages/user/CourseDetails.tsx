import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, Clock, User, Tag, CheckCircle2, Lock, IndianRupee, ArrowLeft } from "lucide-react";
import { getCourseById } from "../../api/course.api";
import axiosInstance from "../../api/axios.instance";
import { useAuth } from "../../hooks/useAuth";
import { useToastContext } from "../../context/ToastContext";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToastContext();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<{ enrolled: boolean; status: string | null } | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    getCourseById(id!)
      .then(res => setCourse(res.data.data))
      .catch(() => showToast("Course not found.", "error"))
      .finally(() => setLoading(false));

    if (user) {
      axiosInstance.get(`/api/enrollments/check/${id}`)
        .then(res => setEnrollment(res.data.data))
        .catch(console.error);
    }
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) { navigate("/auth"); return; }
    setEnrolling(true);
    try {
      if (course.isFree) {
        await axiosInstance.post("/api/enrollments/request", { courseId: id });
        setEnrollment({ enrolled: true, status: "approved" });
        showToast("Enrolled successfully! You can now access the course.", "success");
      } else {
        navigate(`/checkout/${id}`);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to enroll.", "error");
    } finally {
      setEnrolling(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] p-16">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-48 bg-zinc-800/60 rounded-[24px] animate-pulse" />
        <div className="h-6 w-full bg-zinc-800/40 rounded-xl animate-pulse" />
      </div>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-zinc-500 font-bold mb-4">Course not found.</p>
        <button onClick={() => navigate("/courses")} className="px-6 py-3 bg-indigo-600 rounded-xl font-black uppercase text-xs tracking-widest">Back to Courses</button>
      </div>
    </div>
  );

  const isEnrolled = enrollment?.enrolled && enrollment.status === "approved";
  const isPending = enrollment?.status === "pending";

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-16 md:px-16">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate("/courses")} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 font-bold text-sm">
          <ArrowLeft size={16} /> Back to Courses
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Course Info */}
          <div className="lg:col-span-2">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-black uppercase tracking-widest">
                <Tag size={12} /> {course.category || "Course"}
              </div>
              {course.isFeatured && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] text-xs font-black uppercase tracking-widest">
                  Featured
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
              {course.title}
            </h1>
            
            <p className="text-[#9ca3af] text-[17px] leading-relaxed mb-10">
              {course.description}
            </p>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[1.5rem] mb-8">
              {course.instructor && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em]">Instructor</span>
                  <div className="flex items-center gap-2 text-[#cbd5e1] font-medium text-sm">
                    <span className="text-lg">👩‍🏫</span> <span className="truncate">{course.instructor}</span>
                  </div>
                </div>
              )}
              {course.level && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em]">Level</span>
                  <div className="flex items-center gap-2 text-[#cbd5e1] font-medium text-sm">
                    <span className="text-lg">🔍</span> <span className="truncate">{course.level}</span>
                  </div>
                </div>
              )}
              {course.duration && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em]">Duration</span>
                  <div className="flex items-center gap-2 text-[#cbd5e1] font-medium text-sm">
                    <span className="text-lg">⏱️</span> <span className="truncate">{course.duration}</span>
                  </div>
                </div>
              )}
              {course.lessonsCount && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em]">Lessons</span>
                  <div className="flex items-center gap-2 text-[#cbd5e1] font-medium text-sm">
                    <span className="text-lg">📚</span> <span className="truncate">{course.lessonsCount}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {course.tags?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-8">
                {course.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-white/5 border border-white/5 text-zinc-400 text-xs rounded-lg font-bold">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right — Enroll Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#0d0d0e] border border-white/5 rounded-[32px] p-6 sticky top-24">
              {/* Price */}
              {/* Price */}
              <div className="flex flex-col mb-6">
                {course.discountPercentage && !course.isFree && (
                  <span className="inline-block w-fit mb-3 text-[11px] font-black px-2.5 py-1 bg-[#ef4444] text-white rounded-md shadow-md uppercase tracking-wider">
                    {course.discountPercentage}
                  </span>
                )}
                
                <div className="flex items-end gap-3">
                  {course.isFree ? (
                    <span className="text-[40px] font-black text-green-400 leading-none">Free</span>
                  ) : (
                    <>
                      <span className="text-[40px] font-black text-white leading-none tracking-tight">
                        ₹{course.price}
                      </span>
                      {course.originalPrice > 0 && (
                        <span className="text-xl font-medium text-zinc-500 line-through leading-none mb-1">
                          ₹{course.originalPrice}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              {!course.isFree && (
                <p className="text-zinc-500 text-sm font-medium mb-6">One-time payment. Lifetime access.</p>
              )}

              {/* Enroll Button */}
              {isEnrolled ? (
                <button
                  onClick={() => navigate(`/courses/${id}/learn`)}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 mb-4"
                >
                  Continue Learning →
                </button>
              ) : isPending ? (
                <div className="w-full py-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl font-black uppercase text-xs tracking-widest text-center mb-4">
                  Enrollment Pending Approval
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 mb-4 disabled:opacity-60 shadow-lg shadow-indigo-600/20"
                >
                  {enrolling ? "Processing..." : course.isFree ? "Enroll for Free" : "Buy Course"}
                </button>
              )}

              {/* Features */}
              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex items-center gap-2"><BookOpen size={14} className="text-indigo-400" /> Full course access</div>
                <div className="flex items-center gap-2"><Clock size={14} className="text-indigo-400" /> Learn at your own pace</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-400" /> Certificate on completion</div>
                {!course.isFree && <div className="flex items-center gap-2"><Lock size={14} className="text-zinc-600" /> Secure payment via Razorpay</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

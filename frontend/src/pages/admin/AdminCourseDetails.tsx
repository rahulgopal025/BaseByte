import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, Users, Video, Edit, ArrowLeft, Plus, CheckCircle, XCircle } from "lucide-react";
import { getAdminCourses, getAdminLectures, getAllEnrollments, updateEnrollmentStatus } from "../../api/admin.api";

export default function AdminCourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'lectures' | 'students'>('overview');

  const load = async () => {
    try {
      const [courseRes, lectRes, enrollRes] = await Promise.all([
        getAdminCourses(),
        getAdminLectures(),
        getAllEnrollments()
      ]);

      const foundCourse = (courseRes.data.data || []).find((c: any) => c._id === id);
      setCourse(foundCourse);

      const courseLectures = (lectRes.data.data || []).filter((l: any) => (l.courseId?._id || l.courseId) === id);
      setLectures(courseLectures.sort((a: any, b: any) => a.order - b.order));

      const courseEnrollments = (enrollRes.data.data || []).filter((e: any) => (e.courseId?._id || e.courseId) === id);
      setEnrollments(courseEnrollments);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleEnrollmentStatus = async (enrollId: string, status: 'approved' | 'rejected') => {
    try {
      await updateEnrollmentStatus(enrollId, status);
      load();
    } catch {
      alert("Failed to update status.");
    }
  };

  if (loading) {
    return <div className="p-8 text-zinc-500 animate-pulse">Loading course details...</div>;
  }

  if (!course) {
    return <div className="p-8 text-rose-500">Course not found.</div>;
  }

  const approvedStudents = enrollments.filter(e => e.status === 'approved');
  const revenue = approvedStudents.length * (course.price || 0);

  return (
    <div className="p-8 text-white max-w-7xl mx-auto flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/admin/courses")} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black">{course.title}</h1>
          <p className="text-zinc-500 font-medium">Manage course content and students</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 mb-8">
        {(['overview', 'lectures', 'students'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? "border-indigo-500 text-indigo-400" : "border-transparent text-zinc-500 hover:text-white"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0d0d0e] border border-white/5 p-6 rounded-3xl">
            <div className="p-3 bg-blue-500/10 w-fit rounded-xl mb-4"><Users size={24} className="text-blue-400" /></div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Total Students</p>
            <p className="text-4xl font-black">{approvedStudents.length}</p>
          </div>
          <div className="bg-[#0d0d0e] border border-white/5 p-6 rounded-3xl">
            <div className="p-3 bg-emerald-500/10 w-fit rounded-xl mb-4"><span className="text-emerald-400 font-black text-2xl leading-none">₹</span></div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Estimated Revenue</p>
            <p className="text-4xl font-black">₹{revenue.toLocaleString()}</p>
          </div>
          <div className="bg-[#0d0d0e] border border-white/5 p-6 rounded-3xl">
            <div className="p-3 bg-violet-500/10 w-fit rounded-xl mb-4"><Video size={24} className="text-violet-400" /></div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Total Lectures</p>
            <p className="text-4xl font-black">{lectures.length}</p>
          </div>
          
          <div className="md:col-span-3 bg-[#0d0d0e] border border-white/5 p-6 rounded-3xl mt-4">
             <h3 className="text-xl font-black mb-4">Course Info</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Price</p>
                  <p className="font-bold">{course.isFree ? "Free" : `₹${course.price}`}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Instructor</p>
                  <p className="font-bold">{course.instructor || "N/A"}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Status</p>
                  <p className={`font-bold ${course.isPublished ? "text-green-400" : "text-amber-400"}`}>{course.isPublished ? "Published" : "Draft"}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Level</p>
                  <p className="font-bold">{course.level || "N/A"}</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Lectures Tab */}
      {activeTab === 'lectures' && (
        <div>
          <div className="bg-[#0d0d0e] border border-white/5 rounded-3xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              <div className="col-span-1">#</div>
              <div className="col-span-7">Title & Duration</div>
              <div className="col-span-4">Type</div>
            </div>
            {lectures.length === 0 ? (
               <div className="p-8 text-center text-zinc-500">No lectures added yet.</div>
            ) : (
               lectures.map((l, i) => (
                 <div key={l._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] ${i !== lectures.length - 1 ? 'border-b border-white/5' : ''}`}>
                   <div className="col-span-1 font-black text-zinc-500">{l.order}</div>
                   <div className="col-span-7">
                     <p className="font-bold text-sm">{l.title}</p>
                     <p className="text-zinc-500 text-xs">{l.duration}</p>
                   </div>
                   <div className="col-span-4">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${l.isLive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-violet-500/10 text-violet-400 border-violet-500/20"}`}>
                       {l.isLive ? "Live" : "Recorded"}
                     </span>
                   </div>
                 </div>
               ))
            )}
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div>
          <h2 className="text-xl font-black mb-6">Enrolled Students ({enrollments.length})</h2>
          <div className="bg-[#0d0d0e] border border-white/5 rounded-3xl overflow-hidden">
             <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              <div className="col-span-4">Student</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2">Actions</div>
            </div>
            {enrollments.length === 0 ? (
               <div className="p-8 text-center text-zinc-500">No students enrolled yet.</div>
            ) : (
               enrollments.map((e, i) => (
                 <div key={e._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] ${i !== enrollments.length - 1 ? 'border-b border-white/5' : ''}`}>
                   <div className="col-span-4 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs">
                       {e.userId?.name?.charAt(0).toUpperCase() || "S"}
                     </div>
                     <div>
                       <p className="font-bold text-sm truncate">{e.userId?.name || "Unknown User"}</p>
                       <p className="text-zinc-500 text-xs truncate">{e.userId?.email || e.userEmail || "No email"}</p>
                     </div>
                   </div>
                   <div className="col-span-3">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${e.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : e.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                       {e.status}
                     </span>
                   </div>
                   <div className="col-span-3 text-zinc-500 text-xs">
                     {new Date(e.enrolledAt || e.createdAt).toLocaleDateString()}
                   </div>
                   <div className="col-span-2 flex gap-2">
                     {e.status === 'pending' && (
                       <>
                         <button onClick={() => handleEnrollmentStatus(e._id, 'approved')} className="text-green-400 hover:text-green-300 transition-colors p-1" title="Approve">
                           <CheckCircle size={16} />
                         </button>
                         <button onClick={() => handleEnrollmentStatus(e._id, 'rejected')} className="text-rose-400 hover:text-rose-300 transition-colors p-1" title="Reject">
                           <XCircle size={16} />
                         </button>
                       </>
                     )}
                   </div>
                 </div>
               ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}

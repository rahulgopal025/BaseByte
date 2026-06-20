import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { BookOpen, Users, Video, Edit, ArrowLeft, Plus, CheckCircle, XCircle, Trash2, X, Lock, Unlock, Eye } from "lucide-react";
import { getAdminCourses, getAdminLectures, getAllEnrollments, updateEnrollmentStatus, createLecture, updateLecture, deleteLecture, deleteCourse } from "../../api/admin.api";
import { useBreadcrumbs } from "../../context/BreadcrumbContext";

export default function AdminCourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'overview' | 'lectures' | 'students') || location.state?.tab || 'overview';

  const [deleteLectureId, setDeleteLectureId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);
  const [courseDeleteConfirmText, setCourseDeleteConfirmText] = useState("");

  const [blockStudentId, setBlockStudentId] = useState<string | null>(null);

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

  const { setCustomBreadcrumb } = useBreadcrumbs();
  useEffect(() => {
    if (course && id) {
      setCustomBreadcrumb(id, course.title);
    }
  }, [course, id, setCustomBreadcrumb]);

  const handleEnrollmentStatus = async (enrollId: string, status: 'approved' | 'rejected' | 'blocked') => {
    try {
      await updateEnrollmentStatus(enrollId, status);
      load();
    } catch {
      alert("Failed to update status.");
    }
  };

  const confirmDeleteLecture = async () => {
    if (!deleteLectureId || deleteConfirmText.toLowerCase() !== "delete") return;
    await deleteLecture(deleteLectureId);
    setLectures(prev => prev.filter(l => l._id !== deleteLectureId));
    setDeleteLectureId(null);
    setDeleteConfirmText("");
  };

  const confirmDeleteCourse = async () => {
    if (courseDeleteConfirmText.toLowerCase() !== "delete" || !id) return;
    await deleteCourse(id);
    navigate("/admin/courses");
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
    <div className="p-8 text-foreground max-w-7xl mx-auto flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/admin/courses")} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black">{course.title}</h1>
          <p className="text-zinc-500 font-medium">Manage course content and students</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mb-8">
        {(['overview', 'lectures', 'students'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSearchParams({ tab })}
            className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? "border-indigo-500 text-indigo-400" : "border-transparent text-zinc-500 hover:text-foreground"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border p-5 rounded-[20px] flex items-center justify-between shadow-sm hover:border-zinc-400 dark:hover:border-white/10 transition-all">
            <div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Students</p>
              <p className="text-3xl font-black leading-none">{approvedStudents.length}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl"><Users size={20} className="text-blue-400" /></div>
          </div>
          <div className="bg-card border border-border p-5 rounded-[20px] flex items-center justify-between shadow-sm hover:border-zinc-400 dark:hover:border-white/10 transition-all">
            <div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Revenue</p>
              <p className="text-3xl font-black leading-none">₹{revenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl flex items-center justify-center"><span className="text-emerald-400 font-black text-xl leading-none">₹</span></div>
          </div>
          <div className="bg-card border border-border p-5 rounded-[20px] flex items-center justify-between shadow-sm hover:border-zinc-400 dark:hover:border-white/10 transition-all">
            <div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Lectures</p>
              <p className="text-3xl font-black leading-none">{lectures.length}</p>
            </div>
            <div className="p-3 bg-violet-500/10 rounded-xl"><Video size={20} className="text-violet-400" /></div>
          </div>
          
          <div className="md:col-span-3 bg-card border border-border p-6 rounded-[24px] mt-2 shadow-sm">
             <h3 className="text-lg font-black mb-4">Course Info</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-black/5 dark:bg-white/[0.02] rounded-xl border border-transparent hover:border-border transition-colors">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">Price</p>
                  <p className="font-bold text-sm text-foreground">{course.isFree ? "Free" : `₹${course.price}`}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-white/[0.02] rounded-xl border border-transparent hover:border-border transition-colors">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">Instructor</p>
                  <p className="font-bold text-sm text-foreground">{course.instructor || "N/A"}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-white/[0.02] rounded-xl border border-transparent hover:border-border transition-colors">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">Status</p>
                  <p className={`font-bold text-sm ${course.isPublished ? "text-green-500" : "text-amber-500"}`}>{course.isPublished ? "Published" : "Draft"}</p>
                </div>
                 <div className="p-4 bg-black/5 dark:bg-white/[0.02] rounded-xl border border-transparent hover:border-border transition-colors">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">Level</p>
                  <p className="font-bold text-sm text-foreground">{course.level || "N/A"}</p>
                </div>
             </div>
          </div>
          
          <div className="md:col-span-3 flex justify-end gap-4 mt-2">
            <button onClick={() => navigate(`/admin/courses/${id}/edit`)} className="flex items-center gap-2 px-6 py-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-[16px] font-black uppercase text-xs tracking-widest transition-all">
              <Edit size={16} /> Edit Course
            </button>
            <button onClick={() => { setShowDeleteCourseModal(true); setCourseDeleteConfirmText(""); }} className="flex items-center gap-2 px-6 py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-[16px] font-black uppercase text-xs tracking-widest transition-all">
              <Trash2 size={16} /> Delete Course
            </button>
          </div>
        </div>
      )}

      {/* Lectures Tab */}
      {activeTab === 'lectures' && (
        <div>
          <div className="flex items-center justify-end mb-6">
            <button
              onClick={() => navigate(`/admin/courses/${id}/lectures/new`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Plus size={16} /> New Lecture
            </button>
          </div>
          <div className="bg-card border border-border rounded-[24px] overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Title & Duration</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {lectures.length === 0 ? (
               <div className="p-8 text-center text-zinc-500">No lectures added yet.</div>
            ) : (
               lectures.map((l, i) => (
                 <div key={l._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-black/5 dark:hover:bg-white/[0.02] ${i !== lectures.length - 1 ? 'border-b border-border' : ''}`}>
                   <div className="col-span-1 font-black text-zinc-400 dark:text-zinc-500">{l.order}</div>
                   <div className="col-span-6">
                     <p className="font-bold text-sm text-foreground truncate">{l.title}</p>
                     <p className="text-zinc-500 text-xs truncate">{l.duration}</p>
                   </div>
                   <div className="col-span-3">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${l.isLive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-violet-500/10 text-violet-500 border-violet-500/20"}`}>
                       {l.isLive ? "Live" : "Recorded"}
                     </span>
                   </div>
                   <div className="col-span-2 flex items-center justify-end gap-2">
                     <button onClick={() => navigate(`/admin/courses/${id}/lectures/${l._id}`)} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-zinc-500 hover:text-foreground transition-all">
                       <Edit size={14} />
                     </button>
                     <button onClick={() => { setDeleteLectureId(l._id); setDeleteConfirmText(""); }} className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                       <Trash2 size={14} />
                     </button>
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
          <div className="bg-card border border-border rounded-[24px] overflow-hidden shadow-sm">
             <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              <div className="col-span-4">Student</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-center">View Profile</div>
              <div className="col-span-2 text-center">Block Profile</div>
            </div>
            {enrollments.length === 0 ? (
               <div className="p-8 text-center text-zinc-500">No students enrolled yet.</div>
            ) : (
               enrollments.map((e, i) => (
                 <div key={e._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-black/5 dark:hover:bg-white/[0.02] ${i !== enrollments.length - 1 ? 'border-b border-border' : ''}`}>
                   <div className="col-span-4 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 font-black text-xs">
                       {e.userId?.name?.charAt(0).toUpperCase() || "S"}
                     </div>
                     <div>
                       <p className="font-bold text-sm truncate text-foreground">{e.userId?.name || "Unknown User"}</p>
                       <p className="text-zinc-500 text-xs truncate">{e.userId?.email || e.userEmail || "No email"}</p>
                     </div>
                   </div>
                   <div className="col-span-2">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${e.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : e.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : e.status === 'blocked' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                       {e.status}
                     </span>
                   </div>
                   <div className="col-span-2 text-zinc-500 text-xs">
                     {new Date(e.enrolledAt || e.createdAt).toLocaleDateString()}
                   </div>
                   <div className="col-span-2 flex items-center justify-center">
                     <button onClick={() => navigate(`/admin/students/${e.userId?._id || e.userId}/profile`)} className="text-blue-400 hover:text-blue-300 transition-colors p-1.5 bg-blue-500/10 rounded-lg" title="View Profile">
                       <Eye size={16} />
                     </button>
                   </div>
                   <div className="col-span-2 flex items-center justify-center gap-2">
                     {e.status === 'pending' && (
                       <>
                         <button onClick={() => handleEnrollmentStatus(e._id, 'approved')} className="text-green-400 hover:text-green-300 transition-colors p-1.5 bg-green-500/10 rounded-lg" title="Approve">
                           <CheckCircle size={16} />
                         </button>
                         <button onClick={() => handleEnrollmentStatus(e._id, 'rejected')} className="text-rose-400 hover:text-rose-300 transition-colors p-1.5 bg-rose-500/10 rounded-lg" title="Reject">
                           <XCircle size={16} />
                         </button>
                       </>
                     )}
                     {e.status === 'approved' && (
                       <button onClick={() => setBlockStudentId(e._id)} className="text-red-400 hover:text-red-300 transition-colors p-1.5 bg-red-500/10 rounded-lg" title="Block Student">
                         <Lock size={16} />
                       </button>
                     )}
                     {e.status === 'blocked' && (
                       <button onClick={() => handleEnrollmentStatus(e._id, 'approved')} className="text-emerald-400 hover:text-emerald-300 transition-colors p-1.5 bg-emerald-500/10 rounded-lg" title="Unblock Student">
                         <Unlock size={16} />
                       </button>
                     )}
                   </div>
                 </div>
               ))
            )}
          </div>
        </div>
      )}



      {/* Delete Confirmation Modal */}
      {deleteLectureId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[32px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden text-center">
            
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <Trash2 size={36} className="text-rose-500" />
            </div>
            
            <h2 className="text-xl font-black text-foreground mb-2 tracking-tight line-clamp-2 px-2">
              Delete "{lectures.find(l => l._id === deleteLectureId)?.title}"?
            </h2>
            <p className="text-zinc-500 text-sm mb-8 px-4">
              This will permanently delete the lecture. This action cannot be undone.
            </p>

            <div className="bg-black/5 dark:bg-white/5 border border-border rounded-2xl p-6 mb-8 text-left">
              <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-3 text-center">
                Type <span className="text-foreground select-all">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full text-center px-4 py-4 bg-black/5 dark:bg-black/40 border border-border rounded-xl text-foreground text-lg font-black outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700 tracking-[0.2em]"
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => { setDeleteLectureId(null); setDeleteConfirmText(""); }} className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-zinc-500 hover:text-foreground">
                Cancel
              </button>
              <button 
                onClick={confirmDeleteLecture} 
                disabled={deleteConfirmText.toLowerCase() !== "delete"}
                className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 disabled:bg-white/5 disabled:text-zinc-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-white shadow-lg shadow-rose-600/20 active:scale-95 border border-transparent"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Delete Confirmation Modal */}
      {showDeleteCourseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[32px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden text-center">
            
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <Trash2 size={36} className="text-rose-500" />
            </div>
            
            <h2 className="text-xl font-black text-foreground mb-2 tracking-tight line-clamp-2 px-2">
              Delete "{course.title}"?
            </h2>
            <p className="text-zinc-500 text-sm mb-8 px-4">
              This will permanently delete the course and all associated data. This action cannot be undone.
            </p>

            <div className="bg-black/5 dark:bg-white/5 border border-border rounded-2xl p-6 mb-8 text-left">
              <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-3 text-center">
                Type <span className="text-foreground select-all">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={courseDeleteConfirmText}
                onChange={(e) => setCourseDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full text-center px-4 py-4 bg-black/5 dark:bg-black/40 border border-border rounded-xl text-foreground text-lg font-black outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700 tracking-[0.2em]"
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => { setShowDeleteCourseModal(false); setCourseDeleteConfirmText(""); }} className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-zinc-500 hover:text-foreground">
                Cancel
              </button>
              <button 
                onClick={confirmDeleteCourse} 
                disabled={courseDeleteConfirmText.toLowerCase() !== "delete"}
                className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 disabled:bg-white/5 disabled:text-zinc-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-white shadow-lg shadow-rose-600/20 active:scale-95 border border-transparent"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Student Confirmation Modal */}
      {blockStudentId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[32px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden text-center">
            
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <Lock size={36} className="text-rose-500" />
            </div>
            
            <h2 className="text-xl font-black text-foreground mb-2 tracking-tight">
              Block Student?
            </h2>
            <p className="text-zinc-500 text-sm mb-8 px-4">
              This will suspend the student's access to the course content. They will still remain enrolled, but will be locked out until you unblock them.
            </p>

            <div className="flex gap-4">
              <button onClick={() => setBlockStudentId(null)} className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-zinc-500 hover:text-foreground">
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleEnrollmentStatus(blockStudentId, 'blocked');
                  setBlockStudentId(null);
                }} 
                className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-white shadow-lg shadow-rose-600/20 active:scale-95 border border-transparent"
              >
                Block Student
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

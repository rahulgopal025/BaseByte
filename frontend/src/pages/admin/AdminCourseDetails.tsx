import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { BookOpen, Users, Video, Edit, ArrowLeft, Plus, CheckCircle, XCircle, Trash2, X, Lock, Unlock, Eye, Search, Upload, Code2 } from "lucide-react";
import Papa from "papaparse";
import { getAdminCourses, getAdminLectures, getAllEnrollments, updateEnrollmentStatus, createLecture, updateLecture, deleteLecture, deleteCourse, getAdminProblems, deleteProblem, bulkUploadProblems } from "../../api/admin.api";
import { useBreadcrumbs } from "../../context/BreadcrumbContext";
import { useToastContext } from "../../context/ToastContext";

export default function AdminCourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToastContext();

  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'overview' | 'lectures' | 'students' | 'practice') || location.state?.tab || 'overview';

  const [deleteLectureId, setDeleteLectureId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);
  const [courseDeleteConfirmText, setCourseDeleteConfirmText] = useState("");

  const [blockStudentId, setBlockStudentId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState("");

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [deleteProblemId, setDeleteProblemId] = useState<string | null>(null);
  const [problemDeleteConfirmText, setProblemDeleteConfirmText] = useState("");
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState("");

  const load = async () => {
    try {
      const [courseRes, lectRes, enrollRes, probRes] = await Promise.all([
        getAdminCourses(),
        getAdminLectures(),
        getAllEnrollments(),
        getAdminProblems().catch(() => ({ data: { data: [] } }))
      ]);

      const foundCourse = (courseRes.data.data || []).find((c: any) => c._id === id);
      setCourse(foundCourse);

      const courseLectures = (lectRes.data.data || []).filter((l: any) => (l.courseId?._id || l.courseId) === id);
      setLectures(courseLectures.sort((a: any, b: any) => a.order - b.order));

      const courseEnrollments = (enrollRes.data.data || []).filter((e: any) => (e.courseId?._id || e.courseId) === id);
      setEnrollments(courseEnrollments);

      const courseProblems = (probRes.data.data || []).filter((p: any) => (p.course?._id || p.course) === id);
      setProblems(courseProblems);

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
      showToast("Failed to update status.", "error");
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

  const confirmDeleteProblem = async () => {
    if (!deleteProblemId || problemDeleteConfirmText.toLowerCase() !== "delete") return;
    await deleteProblem(deleteProblemId);
    setProblems(prev => prev.filter(p => p._id !== deleteProblemId));
    setDeleteProblemId(null);
    setProblemDeleteConfirmText("");
  };

  const confirmBulkDelete = async () => {
    if (bulkDeleteConfirmText.toLowerCase() !== "delete") return;
    try {
      await Promise.all(selectedProblems.map(id => deleteProblem(id)));
      setProblems(prev => prev.filter(p => !selectedProblems.includes(p._id)));
      setSelectedProblems([]);
      setShowBulkDeleteModal(false);
      setBulkDeleteConfirmText("");
    } catch (err) {
      showToast("Failed to delete some problems.", "error");
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile || !id) return;
    try {
      setUploadingCsv(true);
      Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const arr = results.data.map((row: any) => ({
              title: row.title,
              description: row.description,
              difficulty: row.difficulty || "Easy",
              language: row.language || "c",
              course: id,
              topic: row.topic || "",
              sampleInput: row.sampleInput || "",
              sampleOutput: row.sampleOutput || "",
              solution: row.solution || "",
              testCases: [{ input: row.sampleInput || "", output: row.sampleOutput || "" }]
            }));
            await bulkUploadProblems(arr);
            showToast("Problems uploaded successfully!", "success");
            setCsvFile(null);
            load();
          } catch (err: any) {
            showToast(err?.response?.data?.message || "Upload failed.", "error");
          } finally {
            setUploadingCsv(false);
          }
        },
        error: () => {
          showToast("Invalid CSV format.", "error");
          setUploadingCsv(false);
        }
      });
    } catch (err) {
      showToast("Upload failed.", "error");
      setUploadingCsv(false);
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
      <div className="flex gap-4 border-b border-border mb-8 overflow-x-auto hide-scrollbar">
        {(['overview', 'lectures', 'students', 'practice'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSearchParams({ tab })}
            className={`pb-4 px-2 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${activeTab === tab ? "border-indigo-500 text-indigo-400" : "border-transparent text-zinc-500 hover:text-foreground"}`}
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
          
          <div className="md:col-span-3 bg-card border border-border p-6 rounded-[24px] mt-2 shadow-sm flex flex-col md:flex-row gap-6">
            {/* Thumbnail */}
            {course.thumbnail && (
              <div className="w-full md:w-64 shrink-0 rounded-[16px] overflow-hidden bg-black/5 border border-border aspect-video relative">
                <img src={course.thumbnail} alt="Course Thumbnail" className="w-full h-full object-cover" />
              </div>
            )}
            
            {/* Extended Details Grid */}
            <div className="flex-1">
              <h3 className="text-lg font-black mb-4">Course Info</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-black/5 dark:bg-white/[0.02] rounded-xl border border-transparent hover:border-border transition-colors">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">Price</p>
                  <p className="font-bold text-sm text-foreground">{course.isFree ? "Free" : `₹${course.price}`}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-white/[0.02] rounded-xl border border-transparent hover:border-border transition-colors">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">Instructor</p>
                  <p className="font-bold text-sm text-foreground truncate">{course.instructor || "N/A"}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-white/[0.02] rounded-xl border border-transparent hover:border-border transition-colors">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">Status</p>
                  <p className={`font-bold text-sm ${course.isPublished ? "text-green-500" : "text-amber-500"}`}>{course.isPublished ? "Published" : "Draft"}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-white/[0.02] rounded-xl border border-transparent hover:border-border transition-colors">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">Type</p>
                  <p className="font-bold text-sm text-foreground truncate">{course.courseType || "Recorded"}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-white/[0.02] rounded-xl border border-transparent hover:border-border transition-colors">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">Validity</p>
                  <p className="font-bold text-sm text-foreground truncate">{course.validity || "Lifetime Access"}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-white/[0.02] rounded-xl border border-transparent hover:border-border transition-colors">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">Category</p>
                  <p className="font-bold text-sm text-foreground truncate">{course.category || "N/A"}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-white/[0.02] rounded-xl border border-transparent hover:border-border transition-colors">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">Level</p>
                  <p className="font-bold text-sm text-foreground truncate">{course.level || "N/A"}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-white/[0.02] rounded-xl border border-transparent hover:border-border transition-colors">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">Duration</p>
                  <p className="font-bold text-sm text-foreground truncate">{course.duration || "N/A"}</p>
                </div>
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
              <div className="col-span-5">Title & Duration</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {lectures.length === 0 ? (
               <div className="p-8 text-center text-zinc-500">No lectures added yet.</div>
            ) : (
               lectures.map((l, i) => (
                 <div key={l._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-black/5 dark:hover:bg-white/[0.02] ${i !== lectures.length - 1 ? 'border-b border-border' : ''}`}>
                   <div className="col-span-1 font-black text-zinc-400 dark:text-zinc-500">{l.order}</div>
                   <div className="col-span-5">
                     <p className="font-bold text-sm text-foreground truncate">{l.title}</p>
                     <p className="text-zinc-500 text-xs truncate">{l.duration}</p>
                   </div>
                   <div className="col-span-2">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${l.isLive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-violet-500/10 text-violet-500 border-violet-500/20"}`}>
                       {l.isLive ? "Live" : "Recorded"}
                     </span>
                   </div>
                   <div className="col-span-2">
                     <p className="font-bold text-xs text-zinc-400">{new Date(l.createdAt || Date.now()).toLocaleDateString()}</p>
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
      {activeTab === 'students' && (() => {
        const filteredStudents = enrollments.filter(e => {
          const search = studentSearch.toLowerCase();
          return (e.userId?.name?.toLowerCase().includes(search)) || 
                 (e.userId?.email?.toLowerCase().includes(search)) || 
                 (e.userEmail?.toLowerCase().includes(search));
        });

        return (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h2 className="text-xl font-black">Enrolled Students ({filteredStudents.length})</h2>
                <button 
                  onClick={() => navigate(`/admin/courses/${id}/add-students`)} 
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95"
                >
                  <Plus size={16} /> Add Student
                </button>
              </div>
              <div className="relative w-full md:w-64">
                <input 
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/5 dark:bg-white/[0.03] border border-border rounded-xl text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-500"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-[24px] overflow-hidden shadow-sm">
             <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              <div className="col-span-4">Student</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-center">View Profile</div>
              <div className="col-span-2 text-center">Block Profile</div>
            </div>
            {filteredStudents.length === 0 ? (
               <div className="p-8 text-center text-zinc-500">No students found.</div>
            ) : (
               filteredStudents.map((e, i) => (
                 <div key={e._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-black/5 dark:hover:bg-white/[0.02] ${i !== filteredStudents.length - 1 ? 'border-b border-border' : ''}`}>
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
                       {e.status === 'approved' ? 'Active' : (e.status === 'blocked' || e.status === 'rejected' ? 'Inactive' : e.status)}
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
                       <button onClick={() => setBlockStudentId(e._id)} className="text-emerald-400 hover:text-emerald-300 transition-colors p-1.5 bg-emerald-500/10 rounded-lg" title="Unblock Student">
                         <Unlock size={16} />
                       </button>
                     )}
                   </div>
                 </div>
               ))
            )}
          </div>
        </div>
      )})()}

      {/* Practice Tab */}
      {activeTab === 'practice' && (
        <div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-black">Practice Problems ({problems.length})</h2>
            <div className="flex items-center gap-3">
              {selectedProblems.length > 0 && (
                <button
                  onClick={() => { setShowBulkDeleteModal(true); setBulkDeleteConfirmText(""); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 whitespace-nowrap"
                >
                  <Trash2 size={16} /> Delete ({selectedProblems.length})
                </button>
              )}
              <div className="relative overflow-hidden group rounded-xl">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <button
                  disabled={uploadingCsv}
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 whitespace-nowrap disabled:opacity-60"
                >
                  <Upload size={16} /> {csvFile ? (uploadingCsv ? "Uploading..." : `Ready to upload ${csvFile.name}`) : "Select CSV"}
                </button>
              </div>
              {csvFile && !uploadingCsv && (
                <button
                  onClick={handleCsvUpload}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 whitespace-nowrap"
                >
                  <CheckCircle size={16} /> Confirm Upload
                </button>
              )}
              {csvFile && (
                <button
                  onClick={() => setCsvFile(null)}
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-[24px] overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-zinc-500 text-[10px] font-black uppercase tracking-widest items-center">
              <div className="col-span-5 flex items-center gap-4">
                <input 
                  type="checkbox" 
                  checked={problems.length > 0 && selectedProblems.length === problems.length}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedProblems(problems.map(p => p._id));
                    else setSelectedProblems([]);
                  }}
                  className="w-4 h-4 rounded border-zinc-700 bg-black/20 text-indigo-500 focus:ring-indigo-500/20"
                />
                Title & Topic
              </div>
              <div className="col-span-3">Difficulty</div>
              <div className="col-span-2">Language</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {problems.length === 0 ? (
               <div className="p-8 text-center text-zinc-500">No practice problems added yet.</div>
            ) : (
               problems.map((p, i) => (
                 <div key={p._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-black/5 dark:hover:bg-white/[0.02] ${i !== problems.length - 1 ? 'border-b border-border' : ''}`}>
                   <div className="col-span-5 flex items-center gap-4 min-w-0">
                     <input 
                       type="checkbox" 
                       checked={selectedProblems.includes(p._id)}
                       onChange={(e) => {
                         if (e.target.checked) setSelectedProblems([...selectedProblems, p._id]);
                         else setSelectedProblems(selectedProblems.filter(id => id !== p._id));
                       }}
                       className="w-4 h-4 rounded border-zinc-700 bg-black/20 text-indigo-500 focus:ring-indigo-500/20 shrink-0"
                     />
                     <div className="truncate min-w-0">
                       <p className="font-bold text-sm text-foreground truncate">{p.title}</p>
                       <p className="text-zinc-500 text-xs truncate">{p.topic || "No topic"}</p>
                     </div>
                   </div>
                   <div className="col-span-3">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                       p.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                       p.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                       'bg-rose-500/10 text-rose-500 border-rose-500/20'
                     }`}>
                       {p.difficulty}
                     </span>
                   </div>
                   <div className="col-span-2">
                     <p className="font-bold text-xs text-zinc-400 uppercase">{p.language}</p>
                   </div>
                   <div className="col-span-2 flex items-center justify-end gap-2">
                     <button onClick={() => { setDeleteProblemId(p._id); setProblemDeleteConfirmText(""); }} className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                       <Trash2 size={14} />
                     </button>
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

      {/* Delete Problem Modal */}
      {deleteProblemId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[32px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden text-center">
            
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <Trash2 size={36} className="text-rose-500" />
            </div>
            
            <h2 className="text-xl font-black text-foreground mb-2 tracking-tight line-clamp-2 px-2">
              Delete Problem?
            </h2>
            <p className="text-zinc-500 text-sm mb-8 px-4">
              This will permanently delete the problem. This action cannot be undone.
            </p>

            <div className="bg-black/5 dark:bg-white/5 border border-border rounded-2xl p-6 mb-8 text-left">
              <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-3 text-center">
                Type <span className="text-foreground select-all">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={problemDeleteConfirmText}
                onChange={(e) => setProblemDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full text-center px-4 py-4 bg-black/5 dark:bg-black/40 border border-border rounded-xl text-foreground text-lg font-black outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700 tracking-[0.2em]"
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => { setDeleteProblemId(null); setProblemDeleteConfirmText(""); }} className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-zinc-500 hover:text-foreground">
                Cancel
              </button>
              <button 
                onClick={confirmDeleteProblem} 
                disabled={problemDeleteConfirmText.toLowerCase() !== "delete"}
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

      {/* Bulk Delete Problems Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[32px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden text-center">
            
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <Trash2 size={36} className="text-rose-500" />
            </div>
            
            <h2 className="text-xl font-black text-foreground mb-2 tracking-tight line-clamp-2 px-2">
              Delete {selectedProblems.length} Problem(s)?
            </h2>
            <p className="text-zinc-500 text-sm mb-8 px-4">
              This will permanently delete the selected practice problems. This action cannot be undone.
            </p>

            <div className="bg-black/5 dark:bg-white/5 border border-border rounded-2xl p-6 mb-8 text-left">
              <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-3 text-center">
                Type <span className="text-foreground select-all">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={bulkDeleteConfirmText}
                onChange={(e) => setBulkDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full text-center px-4 py-4 bg-black/5 dark:bg-black/40 border border-border rounded-xl text-foreground text-lg font-black outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700 tracking-[0.2em]"
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => { setShowBulkDeleteModal(false); setBulkDeleteConfirmText(""); }} className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-zinc-500 hover:text-foreground">
                Cancel
              </button>
              <button 
                onClick={confirmBulkDelete} 
                disabled={bulkDeleteConfirmText.toLowerCase() !== "delete"}
                className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 disabled:bg-white/5 disabled:text-zinc-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-white shadow-lg shadow-rose-600/20 active:scale-95 border border-transparent"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block/Unblock Student Confirmation Modal */}
      {blockStudentId && (() => {
        const enrollment = enrollments.find(e => e._id === blockStudentId);
        const isBlocked = enrollment?.status === 'blocked';
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-[32px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden text-center">
              
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border ${isBlocked ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                {isBlocked ? <Unlock size={36} className="text-emerald-500" /> : <Lock size={36} className="text-rose-500" />}
              </div>
              
              <h2 className="text-xl font-black text-foreground mb-2 tracking-tight">
                {isBlocked ? "Unblock Student?" : "Block Student?"}
              </h2>
              <p className="text-zinc-500 text-sm mb-8 px-4">
                {isBlocked 
                  ? "This will restore the student's access to the course content. They will be able to learn and interact with the course again." 
                  : "This will suspend the student's access to the course content. They will still remain enrolled, but will be locked out until you unblock them."}
              </p>

              <div className="flex gap-4">
                <button onClick={() => setBlockStudentId(null)} className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-zinc-500 hover:text-foreground">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleEnrollmentStatus(blockStudentId, isBlocked ? 'approved' : 'blocked');
                    setBlockStudentId(null);
                  }} 
                  className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-white active:scale-95 border border-transparent ${isBlocked ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20' : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20'}`}
                >
                  {isBlocked ? "Unblock Student" : "Block Student"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

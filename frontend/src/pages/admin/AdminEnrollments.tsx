import { useEffect, useState, useMemo } from "react";
import { ClipboardList, Search, Calendar, BookOpen, FileText, Loader2, IndianRupee } from "lucide-react";
import { getAllEnrollments, getAdminNotes, getAdminCourses } from "../../api/admin.api";
import { useToastContext } from "../../context/ToastContext";

export default function AdminEnrollments() {
  const { showToast } = useToastContext();
  
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [emailSearch, setEmailSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [noteFilter, setNoteFilter] = useState("all");
  const [pricingTab, setPricingTab] = useState<"paid" | "free">("paid");

  useEffect(() => {
    Promise.all([getAllEnrollments(), getAdminCourses(), getAdminNotes()])
      .then(([enrRes, courseRes, noteRes]) => {
        setEnrollments(enrRes.data.data || []);
        setCourses(courseRes.data.data || []);
        setNotes(noteRes.data.data || []);
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to load data.", "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(enr => {
      // 1. Email Search
      const email = (enr.userEmail || enr.userId?.email || "").toLowerCase();
      if (emailSearch && !email.includes(emailSearch.toLowerCase())) return false;

      // 2. Date Range
      if (dateRange !== "all") {
        const enrDate = new Date(enr.enrolledAt);
        const now = new Date();
        const diffMs = now.getTime() - enrDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (dateRange === "1d" && diffDays > 1) return false;
        if (dateRange === "3d" && diffDays > 3) return false;
        if (dateRange === "7d" && diffDays > 7) return false;
        if (dateRange === "1m" && diffDays > 30) return false;
        if (dateRange === "3m" && diffDays > 90) return false;
        if (dateRange === "6m" && diffDays > 180) return false;
        if (dateRange === "1y" && diffDays > 365) return false;
      }

      // 3. Course and Note Filters
      if (courseFilter !== "all" && noteFilter !== "all") return false; // Impossible to be both
      
      if (courseFilter !== "all") {
        if (!enr.courseId || enr.courseId._id.toString() !== courseFilter) return false;
      }
      if (noteFilter !== "all") {
        if (!enr.noteId || enr.noteId._id.toString() !== noteFilter) return false;
      }

      // 4. Pricing Tab Filter
      const item = enr.courseId || enr.noteId;
      const isItemFree = item?.price === 0 || item?.isFree;
      if (pricingTab === "paid" && isItemFree) return false;
      if (pricingTab === "free" && !isItemFree) return false;

      return true;
    });
  }, [enrollments, emailSearch, dateRange, courseFilter, noteFilter, pricingTab]);

  const inputClass = "bg-[#0a0a0b]/80 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600 text-white";

  return (
    <div className="p-8 text-white max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <ClipboardList size={18} className="text-emerald-400" />
        </div>
        <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Tracking</span>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">Enrollment Records</h1>
          <p className="text-zinc-500 font-medium">View and filter all student enrollments across courses and notes.</p>
        </div>

        <div className="flex bg-[#0d0d0e] border border-white/5 p-1 rounded-xl w-fit shrink-0">
          <button 
            onClick={() => setPricingTab("paid")}
            className={`px-8 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${pricingTab === "paid" ? "bg-indigo-600 text-white shadow-lg" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
          >
            Paid
          </button>
          <button 
            onClick={() => setPricingTab("free")}
            className={`px-8 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${pricingTab === "free" ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
          >
            Free
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 mb-8 flex flex-col gap-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search student by Email ID..."
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              className={`${inputClass} w-full pl-11`}
            />
          </div>
          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`${inputClass} w-full pl-11 appearance-none cursor-pointer`}
            >
              <option value="all">Past All Time</option>
              <option value="1d">Past 1 Day</option>
              <option value="3d">Past 3 Days</option>
              <option value="7d">Past 7 Days</option>
              <option value="1m">Past 1 Month</option>
              <option value="3m">Past 3 Months</option>
              <option value="6m">Past 6 Months</option>
              <option value="1y">Past 1 Year</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <select 
              value={courseFilter}
              onChange={(e) => { setCourseFilter(e.target.value); setNoteFilter("all"); }}
              className={`${inputClass} w-full pl-11 appearance-none cursor-pointer`}
            >
              <option value="all">All Courses</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <div className="relative">
            <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <select 
              value={noteFilter}
              onChange={(e) => { setNoteFilter(e.target.value); setCourseFilter("all"); }}
              className={`${inputClass} w-full pl-11 appearance-none cursor-pointer`}
            >
              <option value="all">All Notes</option>
              {notes.map(n => <option key={n._id} value={n._id}>{n.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={40} className="text-indigo-500 animate-spin" />
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center shadow-sm">
          <ClipboardList size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No enrollment records found.</p>
        </div>
      ) : (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest bg-white/[0.02]">
            <div className="col-span-3">Student</div>
            <div className="col-span-4">Enrolled Item</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-1">Fees</div>
            <div className="col-span-2">Date</div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredEnrollments.map((enr, i) => {
              const isCourse = !!enr.courseId;
              const item = enr.courseId || enr.noteId;
              const price = item?.price === 0 || item?.isFree ? "Free" : `₹${item?.offerPrice > 0 ? item.offerPrice : (item?.price || 0)}`;

              return (
                <div key={enr._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors ${i !== filteredEnrollments.length - 1 ? "border-b border-white/5" : ""}`}>
                  <div className="col-span-3 pr-2">
                    <p className="text-white text-sm font-bold truncate" title={enr.userId?.name || "Unknown"}>{enr.userId?.name || "Unknown"}</p>
                    <p className="text-zinc-500 text-[11px] truncate" title={enr.userId?.email || enr.userEmail}>{enr.userId?.email || enr.userEmail}</p>
                  </div>
                  <div className="col-span-4 pr-2">
                    <p className="text-white text-sm font-bold truncate" title={item?.title || "Unknown"}>{item?.title || "Unknown"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${isCourse ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'}`}>
                      {isCourse ? "Course" : "Note"}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center gap-1 font-bold text-xs text-emerald-400">
                    {price !== "Free" && <IndianRupee size={12} />}{price === "Free" ? price : price.replace('₹', '')}
                  </div>
                  <div className="col-span-2 text-zinc-400 text-xs font-medium">
                    {new Date(enr.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

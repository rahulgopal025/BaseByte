import { useEffect, useState } from "react";
import { Users, Search, Trash2, Mail, Calendar } from "lucide-react";
import { getStudents, deleteStudent } from "../../api/admin.api";

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getStudents()
      .then((res) => setStudents(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this student?")) return;
    setDeleting(id);
    try {
      await deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch { alert("Failed to delete."); }
    finally { setDeleting(null); }
  };

  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <Users size={18} className="text-blue-400" />
        </div>
        <span className="text-blue-400 text-xs font-black uppercase tracking-widest">Management</span>
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-1">Students</h1>
      <p className="text-zinc-500 font-medium mb-8">
        {students.length} total registered students
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-3 bg-[#0d0d0e] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 bg-zinc-900 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <Users size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No students found</p>
        </div>
      ) : (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <div className="col-span-4">Student</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-3">Joined</div>
            <div className="col-span-1">Action</div>
          </div>
          {/* Rows */}
          {filtered.map((student, i) => (
            <div
              key={student._id}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors ${i !== filtered.length - 1 ? "border-b border-white/5" : ""}`}
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 text-sm font-black">{student.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="font-bold text-sm truncate">{student.name}</span>
              </div>
              <div className="col-span-4 flex items-center gap-2 text-zinc-400 text-sm">
                <Mail size={12} className="flex-shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="col-span-3 flex items-center gap-2 text-zinc-500 text-xs">
                <Calendar size={11} />
                {new Date(student.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="col-span-1">
                <button
                  onClick={() => handleDelete(student._id)}
                  disabled={deleting === student._id}
                  className="p-2 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

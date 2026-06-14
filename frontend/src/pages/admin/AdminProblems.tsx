import { useEffect, useState } from "react";
import { Code2, Plus, Trash2, Edit, X } from "lucide-react";
import { getAdminProblems, createProblem, updateProblem, deleteProblem } from "../../api/admin.api";
import { getAllCourses } from "../../api/course.api";

const emptyForm = {
  title: "", description: "", difficulty: "Easy",
  language: "c", tags: "", sampleInput: "", sampleOutput: "",
  course: "", topic: "", leetCodeUrl: "", gfgUrl: "", hackerRankUrl: "", codeChefUrl: ""
};

export default function AdminProblems() {
  const [problems, setProblems] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([getAdminProblems(), getAllCourses()])
      .then(([probRes, courseRes]) => {
        setProblems(probRes.data.data || []);
        setCourses(courseRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...form, tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) };
      if (payload.course === "") delete payload.course;
      if (editId) { await updateProblem(editId, payload); }
      else { await createProblem(payload); }
      setShowForm(false); setEditId(null); setForm(emptyForm); load();
    } catch { alert("Failed to save."); }
    finally { setSaving(false); }
  };

  const handleEdit = (p: any) => {
    setForm({ 
      ...p, 
      tags: p.tags?.join(", ") || "", 
      course: p.course?._id || p.course || "",
      topic: p.topic || "",
      leetCodeUrl: p.leetCodeUrl || "",
      gfgUrl: p.gfgUrl || "",
      hackerRankUrl: p.hackerRankUrl || "",
      codeChefUrl: p.codeChefUrl || ""
    });
    setEditId(p._id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this problem?")) return;
    await deleteProblem(id);
    setProblems((prev) => prev.filter((p) => p._id !== id));
  };

  const difficultyColor = (d: string) => ({
    Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Hard: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  }[d] || "");

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";
  const selectClass = inputClass + " cursor-pointer";

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Code2 size={18} className="text-emerald-400" />
            </div>
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Content</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">Problems</h1>
          <p className="text-zinc-500 font-medium">{problems.length} total coding problems</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Add Problem
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0e] border border-white/10 rounded-[32px] p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">{editId ? "Edit Problem" : "New Problem"}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Problem Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              <textarea required placeholder="Problem Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass + " resize-none"} />
              <div className="grid grid-cols-2 gap-4">
                <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className={selectClass}>
                  <option value="" className="bg-[#0d0d0e] text-white">Select Course (Optional)</option>
                  {courses.map(c => <option key={c._id} value={c._id} className="bg-[#0d0d0e] text-white">{c.title}</option>)}
                </select>
                <input placeholder="Topic (e.g. Arrays)" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={selectClass}>
                  <option value="Easy" className="bg-[#0d0d0e] text-white">Easy</option>
                  <option value="Medium" className="bg-[#0d0d0e] text-white">Medium</option>
                  <option value="Hard" className="bg-[#0d0d0e] text-white">Hard</option>
                </select>
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={selectClass}>
                  <option value="c" className="bg-[#0d0d0e] text-white">C</option>
                  <option value="python" className="bg-[#0d0d0e] text-white">Python</option>
                  <option value="java" className="bg-[#0d0d0e] text-white">Java</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} />
                <input placeholder="LeetCode URL" value={form.leetCodeUrl} onChange={(e) => setForm({ ...form, leetCodeUrl: e.target.value })} className={inputClass} />
                <input placeholder="GeeksforGeeks URL" value={form.gfgUrl} onChange={(e) => setForm({ ...form, gfgUrl: e.target.value })} className={inputClass} />
                <input placeholder="HackerRank URL" value={form.hackerRankUrl} onChange={(e) => setForm({ ...form, hackerRankUrl: e.target.value })} className={inputClass} />
                <input placeholder="CodeChef URL" value={form.codeChefUrl} onChange={(e) => setForm({ ...form, codeChefUrl: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <textarea placeholder="Sample Input" rows={3} value={form.sampleInput} onChange={(e) => setForm({ ...form, sampleInput: e.target.value })} className={inputClass + " resize-none font-mono text-xs"} />
                <textarea required placeholder="Sample Output" rows={3} value={form.sampleOutput} onChange={(e) => setForm({ ...form, sampleOutput: e.target.value })} className={inputClass + " resize-none font-mono text-xs"} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400 hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all disabled:opacity-60">
                  {saving ? "Saving..." : editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Problems List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse border border-white/5" />)}</div>
      ) : problems.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <Code2 size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No problems yet.</p>
        </div>
      ) : (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2">Language</div>
            <div className="col-span-3">Actions</div>
          </div>
          {problems.map((p, i) => (
            <div key={p._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors ${i !== problems.length - 1 ? "border-b border-white/5" : ""}`}>
              <div className="col-span-5 font-bold text-sm">{p.title}</div>
              <div className="col-span-2"><span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${difficultyColor(p.difficulty)}`}>{p.difficulty}</span></div>
              <div className="col-span-2 text-zinc-400 text-sm uppercase font-bold">{p.language}</div>
              <div className="col-span-3 flex gap-2">
                <button onClick={() => handleEdit(p)} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"><Edit size={11} /> Edit</button>
                <button onClick={() => handleDelete(p._id)} className="p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

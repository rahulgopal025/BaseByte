import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, X, Map } from "lucide-react";
import { getAllPracticePaths, createPracticePath, updatePracticePath, deletePracticePath } from "../../api/practice.api";
import { getAdminProblems } from "../../api/admin.api";

const emptyForm = {
  title: "", language: "c", description: "", thumbnail: "", problems: [] as string[]
};

export default function AdminPracticePaths() {
  const [paths, setPaths] = useState<any[]>([]);
  const [allProblems, setAllProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([getAllPracticePaths(), getAdminProblems()])
      .then(([pathsRes, probsRes]) => {
        setPaths(pathsRes.data.data || []);
        setAllProblems(probsRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) { await updatePracticePath(editId, form); }
      else { await createPracticePath(form); }
      setShowForm(false); setEditId(null); setForm(emptyForm); load();
    } catch { alert("Failed to save."); }
    finally { setSaving(false); }
  };

  const handleEdit = (p: any) => {
    setForm({ 
      title: p.title, 
      language: p.language, 
      description: p.description, 
      thumbnail: p.thumbnail, 
      problems: p.problems ? p.problems.map((prob: any) => prob._id || prob) : []
    });
    setEditId(p._id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this practice path?")) return;
    await deletePracticePath(id);
    setPaths((prev) => prev.filter((p) => p._id !== id));
  };

  const toggleProblem = (probId: string) => {
    setForm(prev => ({
      ...prev,
      problems: prev.problems.includes(probId)
        ? prev.problems.filter(id => id !== probId)
        : [...prev.problems, probId]
    }));
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";
  const selectClass = inputClass + " cursor-pointer";

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Map size={18} className="text-indigo-400" />
            </div>
            <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">Paths</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">Practice Paths</h1>
          <p className="text-zinc-500 font-medium">{paths.length} total paths configured</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Add Path
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0e] border border-white/10 rounded-[32px] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">{editId ? "Edit Path" : "New Practice Path"}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Path Title (e.g. C Programming Masterclass)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              <textarea required placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass + " resize-none"} />
              <div className="grid grid-cols-2 gap-4">
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={selectClass}>
                  <option value="c" className="bg-[#0d0d0e] text-white">C</option>
                  <option value="python" className="bg-[#0d0d0e] text-white">Python</option>
                  <option value="java" className="bg-[#0d0d0e] text-white">Java</option>
                  <option value="javascript" className="bg-[#0d0d0e] text-white">JavaScript</option>
                  <option value="cpp" className="bg-[#0d0d0e] text-white">C++</option>
                </select>
                <input placeholder="Thumbnail URL (Optional)" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className={inputClass} />
              </div>

              {/* Problem Selection */}
              <div className="mt-6 border border-white/5 rounded-2xl p-4 bg-white/[0.01]">
                <h3 className="text-sm font-black mb-3">Assign Problems ({form.problems.length} selected)</h3>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {allProblems.filter(p => p.language.toLowerCase() === form.language).length === 0 && (
                     <p className="text-zinc-500 text-xs">No problems found for {form.language}. Please create problems first.</p>
                  )}
                  {allProblems.filter(p => p.language.toLowerCase() === form.language).map(prob => (
                    <div 
                      key={prob._id} 
                      onClick={() => toggleProblem(prob._id)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                        form.problems.includes(prob._id) 
                          ? 'border-indigo-500 bg-indigo-500/10' 
                          : 'border-white/5 bg-[#0A0A0C] hover:bg-white/[0.03]'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={form.problems.includes(prob._id)} 
                        readOnly
                        className="w-4 h-4 rounded accent-indigo-600"
                      />
                      <div>
                        <p className="text-sm font-bold">{prob.title}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase">{prob.difficulty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400 hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all disabled:opacity-60">
                  {saving ? "Saving..." : editId ? "Update Path" : "Create Path"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse border border-white/5" />)}</div>
      ) : paths.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <Map size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No practice paths found.</p>
        </div>
      ) : (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Language</div>
            <div className="col-span-3">Problems Assigned</div>
            <div className="col-span-3">Actions</div>
          </div>
          {paths.map((p, i) => (
            <div key={p._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors ${i !== paths.length - 1 ? "border-b border-white/5" : ""}`}>
              <div className="col-span-4 font-bold text-sm">{p.title}</div>
              <div className="col-span-2 text-zinc-400 text-sm uppercase font-bold">{p.language}</div>
              <div className="col-span-3 text-indigo-400 text-sm font-black">{p.problems?.length || 0} Problems</div>
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

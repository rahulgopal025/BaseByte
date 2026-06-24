import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Loader2, Users } from "lucide-react";
import Papa from "papaparse";
import { enrollStudentsToCourse, getAdminCourses } from "../../api/admin.api";
import { useToastContext } from "../../context/ToastContext";
import { useBreadcrumbs } from "../../context/BreadcrumbContext";

export default function AdminAddStudents() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { setCustomBreadcrumb } = useBreadcrumbs();

  const [course, setCourse] = useState<any>(null);
  const [addStudentInput, setAddStudentInput] = useState("");
  const [addStudentCsvFile, setAddStudentCsvFile] = useState<File | null>(null);
  const [addingStudent, setAddingStudent] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAdminCourses().then(res => {
      const found = (res.data.data || []).find((c: any) => c._id === id);
      setCourse(found);
      if (found) setCustomBreadcrumb(id, found.title);
    }).catch(console.error);
  }, [id, setCustomBreadcrumb]);

  const handleAddStudents = async () => {
    if (!id) return;
    try {
      setAddingStudent(true);
      
      let allIdentifiers: string[] = [];
      
      if (addStudentInput.trim()) {
        const manualIds = addStudentInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        allIdentifiers = [...allIdentifiers, ...manualIds];
      }

      if (addStudentCsvFile) {
        Papa.parse(addStudentCsvFile, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            try {
              let csvIdentifiers: string[] = [];
              if (results.meta.fields && results.meta.fields.length > 0) {
                const emailField = results.meta.fields.find(f => f.toLowerCase() === 'email');
                const usernameField = results.meta.fields.find(f => f.toLowerCase() === 'username');
                const targetField = emailField || usernameField || results.meta.fields[0];
                csvIdentifiers = results.data.map((row: any) => row[targetField]?.trim()).filter(Boolean);
              } else {
                 csvIdentifiers = results.data.map((row: any) => Object.values(row)[0]?.toString().trim()).filter(Boolean);
              }
              
              allIdentifiers = [...allIdentifiers, ...csvIdentifiers];
              
              if (allIdentifiers.length === 0) {
                showToast("No emails/usernames found.", "error");
                setAddingStudent(false);
                return;
              }
              
              const res = await enrollStudentsToCourse(id, allIdentifiers);
              const { enrolledCount, notFound } = res.data.data;
              if (notFound.length > 0) {
                 showToast(`Enrolled ${enrolledCount}. Not found: ${notFound.length}`, "warning");
              } else {
                 showToast(`Successfully enrolled ${enrolledCount} students!`, "success");
              }
              
              navigate(`/admin/courses/${id}?tab=students`);
            } catch (err: any) {
              showToast(err?.response?.data?.message || "Failed to add students.", "error");
              setAddingStudent(false);
            }
          },
          error: () => {
            showToast("Invalid CSV format.", "error");
            setAddingStudent(false);
          }
        });
      } else {
         if (allIdentifiers.length === 0) {
            showToast("Please enter emails or upload a CSV.", "error");
            setAddingStudent(false);
            return;
         }
         const res = await enrollStudentsToCourse(id, allIdentifiers);
         const { enrolledCount, notFound } = res.data.data;
         if (notFound.length > 0) {
             showToast(`Enrolled ${enrolledCount}. Not found: ${notFound.length}`, "warning");
         } else {
             showToast(`Successfully enrolled ${enrolledCount} students!`, "success");
         }
         navigate(`/admin/courses/${id}?tab=students`);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to add students.", "error");
      setAddingStudent(false);
    }
  };

  return (
    <div className="p-8 text-foreground max-w-3xl mx-auto flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(`/admin/courses/${id}?tab=students`)} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black">Add Students</h1>
          <p className="text-zinc-500 font-medium">{course ? `To ${course.title}` : 'Loading course...'}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
        <p className="text-zinc-500 text-sm mb-8">Manually enter emails/usernames or upload a CSV file. The system will automatically check if they are already enrolled.</p>
        
        <div className="space-y-8">
          <div>
            <label className="block text-zinc-500 text-xs font-black uppercase tracking-widest mb-3">Manual Entry</label>
            <textarea 
              value={addStudentInput}
              onChange={(e) => setAddStudentInput(e.target.value)}
              placeholder="Enter emails or usernames, separated by commas or new lines..."
              className="w-full px-6 py-4 bg-black/5 dark:bg-white/[0.03] border border-border rounded-2xl text-foreground text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-500 resize-y min-h-[150px]"
            />
          </div>

          <div>
            <label className="block text-zinc-500 text-xs font-black uppercase tracking-widest mb-3">CSV Upload</label>
            <div className={`relative overflow-hidden group rounded-2xl border-2 border-dashed transition-all p-10 text-center ${addStudentCsvFile ? 'border-indigo-500 bg-indigo-500/5' : 'border-border hover:border-indigo-500 hover:bg-black/5 dark:hover:bg-white/[0.02]'}`}>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setAddStudentCsvFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-colors ${addStudentCsvFile ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-500 group-hover:scale-110'}`}>
                  <Upload size={28} />
                </div>
                <p className="font-bold text-lg">{addStudentCsvFile ? addStudentCsvFile.name : "Upload CSV File"}</p>
                <p className="text-sm text-zinc-500">{addStudentCsvFile ? "Ready to upload" : "Drag and drop or click to browse"}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-border mt-8">
            <button 
              onClick={() => navigate(`/admin/courses/${id}?tab=students`)} 
              className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-zinc-500 hover:text-foreground"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddStudents} 
              disabled={addingStudent || (!addStudentInput.trim() && !addStudentCsvFile)}
              className="flex-1 flex justify-center items-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-white shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              {addingStudent ? (
                <><Loader2 size={18} className="animate-spin" /> Adding...</>
              ) : (
                <><Users size={18} /> Enroll Students</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

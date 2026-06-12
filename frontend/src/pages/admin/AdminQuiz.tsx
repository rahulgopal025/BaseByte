import { useState } from "react";
import { FileQuestion, Upload, CheckCircle2, AlertCircle, X, Plus, Trash2 } from "lucide-react";
import { bulkUploadQuiz } from "../../api/admin.api";
import Papa from "papaparse";

const emptyQuestion = {
  language: "c", topic: "", question: "",
  options: ["", "", "", ""], correctAnswer: 1, explanation: ""
};

export default function AdminQuiz() {
  const [questions, setQuestions] = useState<any[]>([{ ...emptyQuestion, options: ["", "", "", ""] }]);
  const [jsonInput, setJsonInput] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"form" | "json" | "csv">("form");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const addQuestion = () => setQuestions([...questions, { ...emptyQuestion, options: ["", "", "", ""] }]);
  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i));

  const updateQuestion = (i: number, field: string, value: any) => {
    setQuestions(questions.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    setQuestions(questions.map((q, idx) => {
      if (idx !== qi) return q;
      const options = [...q.options];
      options[oi] = value;
      return { ...q, options };
    }));
  };

  const handleFormUpload = async () => {
    const valid = questions.every((q) => q.topic && q.question && q.options.every((o: string) => o) && q.explanation);
    if (!valid) { alert("Please fill all fields for every question."); return; }
    setUploading(true);
    try {
      const res = await bulkUploadQuiz(questions);
      setResult({ success: true, message: res.data.message });
      setQuestions([{ ...emptyQuestion, options: ["", "", "", ""] }]);
    } catch (err: any) {
      setResult({ success: false, message: err?.response?.data?.message || "Upload failed." });
    } finally { setUploading(false); }
  };

  const handleJsonUpload = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      setUploading(true);
      const res = await bulkUploadQuiz(arr);
      setResult({ success: true, message: res.data.message });
      setJsonInput("");
    } catch (err: any) {
      setResult({ success: false, message: err?.response?.data?.message || "Invalid JSON or upload failed." });
    } finally { setUploading(false); }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    try {
      setUploading(true);
      Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const arr = results.data.map((row: any) => ({
              language: row.language,
              topic: row.topic,
              question: row.question,
              options: [row.option1, row.option2, row.option3, row.option4],
              correctAnswer: Number(row.correctAnswer) || 1,
              explanation: row.explanation
            }));
            const res = await bulkUploadQuiz(arr);
            setResult({ success: true, message: res.data.message });
            setCsvFile(null);
            // Reset file input value
            const fileInput = document.getElementById('csv-upload-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          } catch (err: any) {
            setResult({ success: false, message: err?.response?.data?.message || "Upload failed." });
          } finally {
            setUploading(false);
          }
        },
        error: (err) => {
          setResult({ success: false, message: "Invalid CSV format." });
          setUploading(false);
        }
      });
    } catch (err: any) {
      setResult({ success: false, message: "Upload failed." });
      setUploading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";

  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <FileQuestion size={18} className="text-yellow-400" />
        </div>
        <span className="text-yellow-400 text-xs font-black uppercase tracking-widest">Content</span>
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-1">Quiz Manager</h1>
      <p className="text-zinc-500 font-medium mb-8">Bulk upload quiz questions for any language and topic.</p>

      {/* Result Banner */}
      {result && (
        <div className={`flex items-center justify-between p-4 rounded-2xl border mb-6 ${result.success ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          <div className="flex items-center gap-3">
            {result.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="font-bold text-sm">{result.message}</span>
          </div>
          <button onClick={() => setResult(null)} className="opacity-60 hover:opacity-100"><X size={16} /></button>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex bg-[#0d0d0e] border border-white/5 p-1 rounded-xl w-fit mb-8 gap-1">
        {(["form", "json", "csv"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === m ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}>
            {m === "form" ? "Form Builder" : m === "json" ? "JSON Upload" : "CSV Upload"}
          </button>
        ))}
      </div>

      {mode === "csv" ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6">
          <h2 className="text-lg font-black mb-2">Upload CSV File</h2>
          <p className="text-zinc-500 text-sm mb-4">Format: language, topic, question, option1, option2, option3, option4, correctAnswer, explanation</p>
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 mb-4 text-xs font-mono text-zinc-400 overflow-x-auto whitespace-nowrap">
            language,topic,question,option1,option2,option3,option4,correctAnswer,explanation<br/>
            c,intro of c,Your question here?,Option A,Option B,Option C,Option D,2,Explanation here
          </div>
          <input
            id="csv-upload-input"
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            className={inputClass + " mb-4 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-white/10 file:text-white hover:file:bg-white/20"}
          />
          <button onClick={handleCsvUpload} disabled={uploading || !csvFile} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-60">
            <Upload size={16} /> {uploading ? "Uploading..." : "Upload CSV"}
          </button>
        </div>
      ) : mode === "json" ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6">
          <h2 className="text-lg font-black mb-2">Paste JSON Array</h2>
          <p className="text-zinc-500 text-sm mb-4">Format: Array of objects with language, topic, question, options (array of 4), correctAnswer (1-4), explanation</p>
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 mb-4 text-xs font-mono text-zinc-400">
            {`[{\n  "language": "c",\n  "topic": "intro of c",\n  "question": "Your question here?",\n  "options": ["Option A", "Option B", "Option C", "Option D"],\n  "correctAnswer": 2,\n  "explanation": "Explanation here"\n}]`}
          </div>
          <textarea
            rows={12}
            placeholder="Paste your JSON array here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className={inputClass + " font-mono text-xs resize-none mb-4"}
          />
          <button onClick={handleJsonUpload} disabled={uploading || !jsonInput.trim()} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-60">
            <Upload size={16} /> {uploading ? "Uploading..." : "Upload Questions"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, qi) => (
            <div key={qi} className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">Question {qi + 1}</span>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qi)} className="text-zinc-600 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <select value={q.language} onChange={(e) => updateQuestion(qi, "language", e.target.value)} className={inputClass + " cursor-pointer"}>
                  <option value="c" className="bg-[#0d0d0e] text-white">C</option>
                  <option value="python" className="bg-[#0d0d0e] text-white">Python</option>
                  <option value="java" className="bg-[#0d0d0e] text-white">Java</option>
                </select>
                <input placeholder="Topic (e.g. intro of c)" value={q.topic} onChange={(e) => updateQuestion(qi, "topic", e.target.value)} className={inputClass} />
              </div>
              <textarea rows={2} placeholder="Question text" value={q.question} onChange={(e) => updateQuestion(qi, "question", e.target.value)} className={inputClass + " resize-none mb-4"} />
              <div className="grid grid-cols-2 gap-3 mb-4">
                {q.options.map((opt: string, oi: number) => (
                  <div key={oi} className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-black">{oi + 1}.</span>
                    <input placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} className={inputClass + " pl-8"} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-2 block">Correct Answer</label>
                  <select value={q.correctAnswer} onChange={(e) => updateQuestion(qi, "correctAnswer", Number(e.target.value))} className={inputClass + " cursor-pointer"}>
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n} className="bg-[#0d0d0e] text-white">Option {n}</option>)}
                  </select>
                </div>
              </div>
              <textarea rows={2} placeholder="Explanation (shown after answering)" value={q.explanation} onChange={(e) => updateQuestion(qi, "explanation", e.target.value)} className={inputClass + " resize-none"} />
            </div>
          ))}

          <div className="flex gap-4">
            <button onClick={addQuestion} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
              <Plus size={16} /> Add Another
            </button>
            <button onClick={handleFormUpload} disabled={uploading} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-indigo-600/20">
              <Upload size={16} /> {uploading ? "Uploading..." : `Upload ${questions.length} Question${questions.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

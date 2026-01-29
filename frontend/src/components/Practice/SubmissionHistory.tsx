import { Clock, CheckCircle2, XCircle } from "lucide-react";

export default function SubmissionHistory({ submissions }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden font-['Public_Sans',_sans-serif]">
      {/* Title bar similar to your "Modify College Information" header */}
      <div className="px-6 py-4 border-b bg-slate-50/50">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Recent Activity</h3>
      </div>
      
      <div className="divide-y divide-slate-100">
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No activity recorded yet.</div>
        ) : (
          submissions.map((sub: any, index: number) => (
            <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-all">
              <div className="flex items-center gap-4">
                {sub.status === "Accepted" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500" />
                )}
                <div>
                  <p className="text-sm font-bold text-slate-800">{sub.problemId?.title || "Challenge"}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">{sub.language} • {new Date(sub.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                sub.status === "Accepted" ? "text-emerald-600" : "text-rose-600"
              }`}>
                {sub.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
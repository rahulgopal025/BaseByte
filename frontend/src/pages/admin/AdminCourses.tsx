import React from "react";
import { BookOpen } from "lucide-react";

export default function AdminCourses() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-4xl font-black tracking-tighter mb-1">Manage Courses</h1>
      <p className="text-zinc-500 font-medium mb-10">Create, edit, and publish courses.</p>
      <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center text-zinc-600 mb-6">
          <BookOpen size={32} />
        </div>
        <h3 className="text-xl font-black text-white mb-2">Coming in Phase 2</h3>
        <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
          This section will be fully functional with real data in the next development phase.
        </p>
      </div>
    </div>
  );
}

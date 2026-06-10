// Phase 2 — Admin Layout placeholder
import React from "react";
import { Outlet } from "react-router-dom";

const AdminLayout: React.FC = () => (
  <div className="min-h-screen bg-[#050505] flex">
    <aside className="w-64 bg-[#0A0A0C] border-r border-white/5 p-6">
      <h2 className="text-xl font-black text-white mb-8">Admin Panel</h2>
      <p className="text-zinc-500 text-sm">Coming in Phase 2</p>
    </aside>
    <main className="flex-1 p-8">
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;

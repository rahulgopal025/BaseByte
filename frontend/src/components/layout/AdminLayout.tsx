import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../admin/AdminSidebar";
import AdminHeader from "../admin/AdminHeader";

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden w-full text-white font-sans">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 h-screen transform transition-transform duration-300 md:relative md:translate-x-0 flex-shrink-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <AdminSidebar onMobileClose={() => setMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col h-screen min-w-0 bg-[#050505] relative">
        <AdminHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 lg:pl-0">
          <div className="bg-[#0a0a0c] min-h-full rounded-[32px] border border-white/5 shadow-2xl relative">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

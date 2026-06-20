import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard, Users, BookOpen, Video,
  Code2, FileQuestion, FileText, ClipboardList,
  MessageSquare, ChevronLeft, LogOut,
  ChevronRight, Bell
} from "lucide-react";

const navItems = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", path: "/admin", icon: LayoutDashboard, color: "text-indigo-400" },
    ]
  },
  {
    section: "Users",
    items: [
      { label: "Students", path: "/admin/students", icon: Users, color: "text-blue-400" },
      { label: "Enrollments", path: "/admin/enrollments", icon: ClipboardList, color: "text-orange-400" },
    ]
  },
  {
    section: "Courses",
    items: [
      { label: "Courses", path: "/admin/courses", icon: BookOpen, color: "text-purple-400" },
    ]
  },
  {
    section: "Practice Path",
    items: [
      { label: "Practice Paths", path: "/admin/practice-paths", icon: Code2, color: "text-cyan-400" },
    ]
  },
  {
    section: "Notes",
    items: [
      { label: "Notes", path: "/admin/notes", icon: FileText, color: "text-pink-400" },
    ]
  },
  {
    section: "Reports",
    items: [
      { label: "Feedback", path: "/admin/feedback", icon: MessageSquare, color: "text-rose-400" },
      { label: "Notifications", path: "/admin/notifications", icon: Bell, color: "text-amber-400" },
    ]
  }
];

export default function AdminSidebar({ onMobileClose }: { onMobileClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`${collapsed ? "w-[72px]" : "w-64"} h-screen bg-card border-r border-border flex flex-col transition-all duration-300 relative flex-shrink-0`}
    >
      {/* Logo */}
      <div className={`flex items-center justify-between gap-3 p-5 border-b border-border ${collapsed ? "justify-center" : ""}`}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain" />
          {!collapsed && (
            <div>
              <h1 className="text-foreground font-black text-base leading-tight">BaseByte</h1>
              <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest">Admin Panel</p>
            </div>
          )}
        </div>
        {onMobileClose && (
          <button onClick={onMobileClose} className="md:hidden text-zinc-500 hover:text-white p-1">
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-zinc-500 hover:text-foreground transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6 mt-2">
        {navItems.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest px-3 mb-2">
                {group.section}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                      ${active
                        ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-white"
                        : "text-zinc-500 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 border border-transparent"
                      }
                      ${collapsed ? "justify-center" : ""}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      size={18}
                      className={active ? item.color : ""}
                    />
                    {!collapsed && (
                      <span className="text-sm font-bold">{item.label}</span>
                    )}
                    {!collapsed && active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-border">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-black/5 dark:bg-white/[0.03] rounded-2xl">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-foreground text-xs font-black truncate">{user?.name || "Admin"}</p>
              <p className="text-zinc-500 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm font-bold">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}



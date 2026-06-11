import React from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Breadcrumb {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  breadcrumbs: Breadcrumb[];
}

export default function PageHeader({ title, description, icon, breadcrumbs }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-12 relative">
      <div className="absolute -left-20 -top-10 w-64 h-64 bg-indigo-600/5 blur-[100px]"></div>
      
      {/* Breadcrumbs */}
      <nav className="flex items-center text-[13px] text-zinc-600 mb-10 font-bold relative z-10">
        {breadcrumbs.map((bc, idx) => (
          <React.Fragment key={idx}>
            <span 
              onClick={() => bc.path && navigate(bc.path)} 
              className={`${bc.path ? "hover:text-indigo-400 cursor-pointer transition-colors" : "text-zinc-500"} uppercase tracking-widest`}
            >
              {bc.label}
            </span>
            {idx < breadcrumbs.length - 1 && <ChevronRight className="h-3 w-3 mx-3" />}
          </React.Fragment>
        ))}
      </nav>

      <div className="flex items-start gap-4 relative z-10">
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          {icon}
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2">
            {title}
          </h1>
          <p className="text-zinc-500 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

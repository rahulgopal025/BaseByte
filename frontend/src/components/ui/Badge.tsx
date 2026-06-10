import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "indigo" | "green" | "amber" | "red" | "zinc";
}

const variantStyles = {
  indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  red: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  zinc: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
};

const Badge: React.FC<BadgeProps> = ({ children, variant = "indigo" }) => (
  <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${variantStyles[variant]}`}>
    {children}
  </span>
);

export default Badge;

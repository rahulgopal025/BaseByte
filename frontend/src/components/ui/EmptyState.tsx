import React from "react";

interface EmptyStateProps {
  title: string;
  message: string;
  icon: React.ReactNode;
  actionButton?: React.ReactNode;
}

export default function EmptyState({ title, message, icon, actionButton }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-[#0A0A0C] border border-white/5 rounded-[2rem]">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-zinc-500 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-500 max-w-md mx-auto mb-8 text-sm">
        {message}
      </p>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
}

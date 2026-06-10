import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20",
  secondary: "bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20",
  ghost: "bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white",
};

const sizeStyles = {
  sm: "px-4 py-2 text-[10px]",
  md: "px-6 py-3 text-xs",
  lg: "px-10 py-4 text-xs",
};

const Button: React.FC<ButtonProps> = ({ variant = "primary", size = "md", loading = false, children, className = "", disabled, ...props }) => (
  <button
    className={`font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? "Please wait..." : children}
  </button>
);

export default Button;

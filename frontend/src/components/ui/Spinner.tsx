import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "w-6 h-6", md: "w-10 h-10", lg: "w-16 h-16" };

const Spinner: React.FC<SpinnerProps> = ({ size = "md" }) => (
  <div className={`${sizeMap[size]} border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin`} />
);

export default Spinner;

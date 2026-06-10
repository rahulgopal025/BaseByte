import React from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { Toast as ToastType } from "../../types/common.types";

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const iconMap = {
  success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
  error: <AlertCircle className="w-5 h-5 text-red-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
};

const bgMap = {
  success: "border-green-500/30 bg-green-500/10",
  error: "border-red-500/30 bg-red-500/10",
  warning: "border-yellow-500/30 bg-yellow-500/10",
  info: "border-blue-500/30 bg-blue-500/10",
};

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => (
  <div
    className={`flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${bgMap[toast.type]} animate-in slide-in-from-right duration-300`}
  >
    {iconMap[toast.type]}
    <span className="text-sm font-bold text-white flex-1">{toast.message}</span>
    <button onClick={() => onClose(toast.id)} className="text-zinc-500 hover:text-white transition-colors">
      <X size={16} />
    </button>
  </div>
);

export default Toast;

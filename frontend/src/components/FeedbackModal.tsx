import { useState } from "react";
import { X, MessageSquare, Star, Send } from "lucide-react";
import axiosInstance from "../api/axios.instance";
import { useToastContext } from "../context/ToastContext";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'course' | 'website' | 'lecture' | 'practice' | 'note' | 'quiz' | 'general';
  courseId?: string;
}

export default function FeedbackModal({ isOpen, onClose, type, courseId }: FeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToastContext();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast("Please enter a comment.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post("/api/feedback", {
        type,
        courseId,
        rating,
        comment
      });
      showToast("Thank you for your feedback!", "success");
      setComment("");
      setRating(5);
      onClose();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to submit feedback", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg bg-[#0d0d0e] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20 border-b border-white/5"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-md transition-all"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 border border-white/20">
            <MessageSquare size={28} className="text-white" />
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Help Us Improve</h2>
          <p className="text-zinc-400 text-sm mb-8">We would love to hear your thoughts or suggestions about this {type === 'general' ? 'platform' : type}.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">How would you rate it?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 transition-all duration-300 hover:scale-110 ${rating >= star ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-zinc-700 hover:text-zinc-500'}`}
                  >
                    <Star size={32} fill={rating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Your Feedback</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like? What can we do better?"
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all resize-none h-32 custom-scrollbar"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Submitting..." : (
                <>
                  <Send size={18} /> Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

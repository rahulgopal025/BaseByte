import { useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";
import axiosInstance from "../../api/axios.instance";
import { useAuth } from "../../hooks/useAuth";
import { useToastContext } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function Feedback() {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({ type: "website", rating: 0, comment: "" });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/auth"); return; }
    if (form.rating === 0) { showToast("Please select a rating.", "error"); return; }
    setSubmitting(true);
    try {
      await axiosInstance.post("/api/feedback", form);
      setSubmitted(true);
      showToast("Thank you for your feedback!", "success");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to submit.", "error");
    } finally { setSubmitting(false); }
  };

  if (submitted) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white text-center p-8">
      <div>
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Send size={32} className="text-green-400" />
        </div>
        <h1 className="text-4xl font-black mb-3 tracking-tighter">Thank You! 🎉</h1>
        <p className="text-zinc-400 text-lg mb-8">Your feedback helps us improve BaseByte for everyone.</p>
        <button onClick={() => navigate("/")} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all">Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-16 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <MessageSquare size={18} className="text-rose-400" />
          </div>
          <span className="text-rose-400 text-xs font-black uppercase tracking-widest">Share Your Thoughts</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-2">Give Feedback</h1>
        <p className="text-zinc-500 mb-10">Help us improve BaseByte for all students.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Toggle */}
          <div>
            <label className="text-zinc-500 text-xs font-black uppercase tracking-widest block mb-3">Feedback Type</label>
            <div className="flex bg-[#0d0d0e] border border-white/5 p-1 rounded-xl gap-1 w-fit">
              {(["website", "course"] as const).map(t => (
                <button key={t} type="button" onClick={() => setForm({...form, type: t})} className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${form.type === t ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}>
                  {t === "website" ? "Website" : "Course"}
                </button>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <label className="text-zinc-500 text-xs font-black uppercase tracking-widest block mb-3">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm({...form, rating: star})}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${star <= (hoveredStar || form.rating) ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"} transition-colors`}
                  />
                </button>
              ))}
            </div>
            {form.rating > 0 && (
              <p className="text-zinc-500 text-xs mt-2">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.rating]}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="text-zinc-500 text-xs font-black uppercase tracking-widest block mb-3">Your Comment *</label>
            <textarea
              required
              rows={5}
              placeholder="Share your experience with BaseByte..."
              value={form.comment}
              onChange={e => setForm({...form, comment: e.target.value})}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-sm tracking-widest transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-indigo-600/20"
          >
            <Send size={18} /> {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Download, Tag, Lock, FileText } from "lucide-react";
import axiosInstance from "../../api/axios.instance";
import { useAuth } from "../../hooks/useAuth";
import { useToastContext } from "../../context/ToastContext";

export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToastContext();

  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchasedCourse, setHasPurchasedCourse] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    axiosInstance.get(`/api/notes/${id}`)
      .then(res => {
        setNote(res.data.data.note);
        setHasPurchasedCourse(res.data.data.hasPurchasedCourse);
      })
      .catch(() => showToast("Note not found.", "error"))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handlePurchaseNote = async () => {
    if (!user) { navigate("/auth"); return; }
    setProcessing(true);
    try {
      const orderRes = await axiosInstance.post("/api/payment/create", { noteId: id });
      const { orderId, amount, currency, key } = orderRes.data.data;

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key,
          amount,
          currency,
          name: "BaseByte Notes",
          description: note.title,
          order_id: orderId,
          prefill: { name: user?.name, email: user?.email },
          theme: { color: "#6366F1" },
          handler: async (response: any) => {
            try {
              await axiosInstance.post("/api/payment/verify", {
                orderId,
                noteId: id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              });
              showToast("Payment successful! Note unlocked.", "success");
              setHasPurchasedCourse(true);
            } catch {
              showToast("Payment verification failed.", "error");
            }
          }
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
        setProcessing(false);
      };

      script.onerror = () => {
        showToast("Failed to load payment gateway.", "error");
        setProcessing(false);
      };
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Payment failed.", "error");
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-16 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-64 md:h-96 bg-white/5 rounded-[32px] animate-pulse" />
        <div className="h-6 w-full bg-white/5 rounded-xl animate-pulse" />
      </div>
    </div>
  );

  if (!note) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
      <div className="text-center bg-white/5 p-10 rounded-3xl backdrop-blur-xl border border-white/10">
        <BookOpen size={48} className="mx-auto mb-4 text-zinc-600" />
        <p className="text-zinc-400 font-bold mb-6 text-lg">Note not found.</p>
        <button onClick={() => navigate("/notes")} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/20">Back to Notes</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-16 md:px-16 pb-32 lg:pb-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back */}
        <button onClick={() => navigate("/notes")} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 font-bold text-sm w-fit group bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left — Note Info */}
          <div className="lg:col-span-2">
            {/* Image Preview with Immersive Blur */}
            <div className="w-full h-64 md:h-[450px] rounded-[32px] mb-8 overflow-hidden relative flex items-center justify-center group border border-white/10 bg-black">
              {note.thumbnailUrl && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-40 blur-2xl scale-110 transition-opacity duration-700" 
                  style={{ backgroundImage: `url(${note.thumbnailUrl})` }} 
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-0" />
              {note.thumbnailUrl ? (
                <img src={note.thumbnailUrl} alt={note.title} className="w-full h-full object-contain relative z-10 drop-shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" />
              ) : (
                <div className="flex flex-col items-center justify-center text-indigo-500/50 relative z-10">
                  <FileText size={80} className="mb-4 drop-shadow-lg" />
                  <span className="font-bold tracking-widest uppercase text-xs text-zinc-400">Document Preview</span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-lg">
                <Tag size={12} /> {note.subject || "General"}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 drop-shadow-sm">
              {note.title}
            </h1>
            
            <p className="text-[#9ca3af] text-lg leading-relaxed mb-10 whitespace-pre-line max-w-3xl">
              {note.description || "No description provided for these notes."}
            </p>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex flex-col gap-2 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-colors">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em]">Pages</span>
                <div className="flex items-center gap-3 text-white font-medium text-lg">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <FileText size={20} />
                  </div>
                  <span>{note.totalPages || "N/A"} Pages</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Purchase Card (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-[#0a0a0b]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sticky top-24 shadow-2xl shadow-black">
              {/* Price */}
              <div className="flex flex-col mb-8">
                <div className="flex items-end gap-3">
                  {note.isFree ? (
                    <span className="text-[48px] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 leading-none">Free</span>
                  ) : (
                    <>
                      <span className="text-[48px] font-black text-white leading-none tracking-tight">
                        ₹{note.offerPrice > 0 ? note.offerPrice : note.price}
                      </span>
                      {note.offerPrice > 0 && (
                        <span className="text-xl font-bold text-zinc-500 line-through leading-none mb-1.5">
                          ₹{note.price}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {!note.isFree && !hasPurchasedCourse && (
                <p className="text-zinc-400 text-sm font-medium mb-8">Unlock full access to these study notes and boost your preparation.</p>
              )}

              {/* Action Buttons */}
              {hasPurchasedCourse || note.isFree ? (
                <>
                  <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center rounded-xl font-bold text-xs uppercase tracking-widest mb-4">
                    {note.isFree ? "Free Note" : "Already Purchased"}
                  </div>
                  <button
                    onClick={() => navigate(`/notes/${note._id}/view`)}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-95 mb-4 shadow-xl shadow-indigo-600/20"
                  >
                    Read Notes →
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4 mb-8">
                  <button
                    onClick={handlePurchaseNote}
                    disabled={processing}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100 shadow-xl shadow-indigo-600/20"
                  >
                    {processing ? "Processing..." : `Buy Notes`}
                  </button>
                  
                  {note.courses?.length > 0 && (
                    <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Or unlock with a course</span>
                      {note.courses.map((c: any) => (
                        <button
                          key={c._id}
                          onClick={() => navigate(`/courses/${c._id}`)}
                          className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold uppercase text-xs tracking-wider transition-all active:scale-95"
                        >
                          View {c.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Free Preview Button */}
              {!hasPurchasedCourse && !note.isFree && (
                <button
                  onClick={() => navigate(`/notes/${note._id}/view`)}
                  className="w-full py-3 bg-transparent hover:bg-white/5 text-zinc-300 rounded-xl font-bold text-sm transition-all active:scale-95 mb-4 border border-white/10 hover:text-white"
                >
                  View Free Preview
                </button>
              )}

              {/* Features */}
              <div className="space-y-4 text-sm text-zinc-400 mt-2 border-t border-white/10 pt-8">
                <div className="flex items-center gap-3"><div className="p-1.5 bg-indigo-500/10 rounded-md"><BookOpen size={16} className="text-indigo-400" /></div> High-quality PDF notes</div>
                <div className="flex items-center gap-3"><div className="p-1.5 bg-indigo-500/10 rounded-md"><Download size={16} className="text-indigo-400" /></div> Downloadable for offline use</div>
                {!note.isFree && <div className="flex items-center gap-3"><div className="p-1.5 bg-indigo-500/10 rounded-md"><Lock size={16} className="text-indigo-400" /></div> Secure payment</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0b]/90 backdrop-blur-xl border-t border-white/10 z-50 lg:hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Total Price</span>
            {note.isFree ? (
              <span className="text-2xl font-black text-emerald-400 leading-none">Free</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white leading-none tracking-tight">₹{note.offerPrice > 0 ? note.offerPrice : note.price}</span>
                {note.offerPrice > 0 && <span className="text-sm font-bold text-zinc-500 line-through">₹{note.price}</span>}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {!hasPurchasedCourse && !note.isFree && (
            <button
              onClick={() => navigate(`/notes/${note._id}/view`)}
              className="flex-1 sm:flex-none px-4 py-3 bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-transform whitespace-nowrap"
            >
              Preview
            </button>
          )}
          
          {hasPurchasedCourse || note.isFree ? (
            <button
              onClick={() => navigate(`/notes/${note._id}/view`)}
              className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-transform shadow-lg shadow-indigo-600/20 whitespace-nowrap"
            >
              Read Notes
            </button>
          ) : (
            <button
              onClick={handlePurchaseNote}
              disabled={processing}
              className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-transform disabled:opacity-60 shadow-lg shadow-indigo-600/20 whitespace-nowrap"
            >
              {processing ? "..." : `Buy Notes`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

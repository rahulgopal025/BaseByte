import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldCheck, IndianRupee, ArrowLeft, CreditCard, Zap } from "lucide-react";
import { getCourseById } from "../../api/course.api";
import axiosInstance from "../../api/axios.instance";
import { useAuth } from "../../hooks/useAuth";
import { useToastContext } from "../../context/ToastContext";

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToastContext();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    getCourseById(id!)
      .then(res => setCourse(res.data.data))
      .catch(() => { showToast("Course not found.", "error"); navigate("/courses"); })
      .finally(() => setLoading(false));
  }, [id, user]);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const orderRes = await axiosInstance.post("/api/payment/create", { courseId: id });
      const { orderId, amount, currency, key } = orderRes.data.data;

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key,
          amount,
          currency,
          name: "BaseByte",
          description: course.title,
          order_id: orderId,
          prefill: { name: user?.name, email: user?.email },
          theme: { color: "#6366F1" },
          handler: async (response: any) => {
            try {
              await axiosInstance.post("/api/payment/verify", {
                orderId,
                courseId: id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              });
              showToast("Payment successful! You are now enrolled.", "success");
              navigate(`/courses/${id}/learn`);
            } catch {
              showToast("Payment verification failed. Contact support.", "error");
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-zinc-500 animate-pulse font-bold">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-16 md:px-16">
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate(`/courses/${id}`)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 font-bold text-sm">
          <ArrowLeft size={16} /> Back to Course
        </button>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
          <Zap size={12} fill="currentColor" /> Secure Checkout
        </div>

        <h1 className="text-4xl font-black tracking-tighter mb-8">Complete Purchase</h1>

        {/* Course Summary */}
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 mb-6">
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-3">You are purchasing</p>
          <h2 className="text-xl font-black mb-1">{course?.title}</h2>
          <p className="text-zinc-500 text-sm mb-4">{course?.instructor}</p>
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-zinc-400 font-bold">Total Amount</span>
            <span className="text-3xl font-black flex items-center gap-1">
              <IndianRupee size={22} className="text-indigo-400" /> {course?.price}
            </span>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-sm tracking-widest transition-all active:scale-95 disabled:opacity-60 shadow-xl shadow-indigo-600/25 mb-6"
        >
          <CreditCard size={20} />
          {processing ? "Opening Payment Gateway..." : `Pay ₹${course?.price}`}
        </button>

        {/* Security Note */}
        <div className="flex items-center gap-3 text-zinc-500 text-sm justify-center">
          <ShieldCheck size={16} className="text-green-400" />
          <span>Secured by Razorpay. Your payment is safe.</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Zap, Eye, EyeOff } from "lucide-react";
import { signupApi, loginApi } from "../../api/auth.api";
import { useAuth } from "../../hooks/useAuth";
import { useToastContext } from "../../context/ToastContext";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToastContext();

  const [isLogin, setIsLogin] = useState<boolean>(
    location.state?.showSignup ? false : true
  );
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (location.state?.showSignup !== undefined) {
      setIsLogin(!location.state.showSignup);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await loginApi(email, password);
      } else {
        response = await signupApi(name, email, password);
      }

      if (response.data.success) {
        if (isLogin) {
          // Get the data directly — no || fallback guessing
          const apiData = response.data.data;
          const userData = apiData.user;

          // Login first — store token and user in context
          login(apiData);

          showToast(
            `Welcome back, ${userData?.name?.split(" ")[0] || "User"}!`,
            "success"
          );

          // Navigate based on role from API response directly
          if (userData?.role === "admin") {
            navigate("/admin", { replace: true });
          } else {
            navigate("/", { replace: true });
          }

        } else {
          showToast("Account created successfully! Please login.", "success");
          setIsLogin(true);
          setError("");
        }

      } else {
        const msg = response.data.message || "Something went wrong!";
        showToast(msg, "error");
        setError(msg);
      }

    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || "Server error! Please try again.";
      showToast(errMsg, "error");
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="max-w-md w-full bg-[#0A0A0C] rounded-[2.5rem] shadow-2xl p-10 border border-white/5 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-400 text-[10px] font-bold tracking-widest uppercase mb-4">
            <Zap size={12} fill="currentColor" />
            {isLogin ? "Auth Required" : "Join Tribe"}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {isLogin ? "Welcome Back!" : "Create Account"}
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Full Name"
                required
                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-white outline-none focus:border-indigo-500 transition-all"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-white outline-none focus:border-indigo-500 transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-white outline-none focus:border-indigo-500 transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-400 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full group py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : isLogin ? "Login to Dashboard" : "Get Started Now"}
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 font-medium">
          {isLogin ? "New to BaseByte?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
          >
            {isLogin ? "Sign up for free" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
}
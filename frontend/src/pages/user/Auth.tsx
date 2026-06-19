import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, ArrowLeft, Zap, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import {
  loginApi,
  sendOtpApi,
  verifyOtpApi,
  completeSignupApi,
  resetPasswordApi,
  googleAuthApi
} from "../../api/auth.api";
import { useAuth } from "../../hooks/useAuth";
import { useToastContext } from "../../context/ToastContext";

type AuthMode = "login" | "signup_email" | "signup_verify_otp" | "signup_details" | "forgot_email" | "forgot_verify_otp" | "forgot_reset";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToastContext();

  const [mode, setMode] = useState<AuthMode>(
    location.state?.showSignup ? "signup_email" : 
    location.state?.showForgot ? "forgot_email" : 
    "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (location.state?.showSignup) {
      setMode("signup_email");
    } else if (location.state?.showForgot) {
      setMode("forgot_email");
    } else if (location.state?.showSignup === false) {
      setMode("login");
    }
  }, [location.state]);

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculateStrength(password);
  const strengthColors = ["bg-zinc-700", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-400", "bg-emerald-500"];
  const strengthLabels = ["", "Very Weak", "Weak", "Fair", "Good", "Strong"];

  const handleAuthSuccess = (response: any) => {
    const apiData = response.data.data;
    login(apiData);
    showToast(`Welcome, ${apiData.user?.name?.split(" ")[0] || "User"}!`, "success");
    if (apiData.user?.role === "admin") {
      setTimeout(() => navigate("/admin", { replace: true }), 100);
    } else {
      navigate("/", { replace: true });
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await googleAuthApi(tokenResponse.access_token);
        if (res.data.success) {
          handleAuthSuccess(res);
        }
      } catch (err: any) {
        showToast("Google Login failed", "error");
      } finally {
        setLoading(false);
      }
    }
  });

  const triggerGoogle = () => {
    try { handleGoogleLogin(); } 
    catch (e) { showToast("Google Auth is not fully configured.", "error"); }
  };

  const triggerGithub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!clientId) {
      showToast("GitHub Auth is not configured in .env", "error");
      return;
    }
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await loginApi(email, password);
        handleAuthSuccess(res);

      } else if (mode === "signup_email" || mode === "forgot_email") {
        const type = mode === "signup_email" ? "register" : "reset";
        const res = await sendOtpApi(email, type);
        if (res.data.success) {
          showToast(`OTP sent to ${email}`, "success");
          setMode(type === "register" ? "signup_verify_otp" : "forgot_verify_otp");
          setTimer(60);
          setOtp(""); // reset OTP field
        }

      } else if (mode === "signup_verify_otp" || mode === "forgot_verify_otp") {
        const type = mode === "signup_verify_otp" ? "register" : "reset";
        const res = await verifyOtpApi(email, otp, type);
        if (res.data.success) {
          showToast("Email verified successfully!", "success");
          setMode(type === "register" ? "signup_details" : "forgot_reset");
          setPassword(""); // reset passwords
          setConfirmPassword("");
        }

      } else if (mode === "signup_details") {
        if (strength < 3) throw new Error("Please choose a stronger password.");
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        
        const res = await completeSignupApi(email, otp, name, password);
        if (res.data.success) handleAuthSuccess(res);

      } else if (mode === "forgot_reset") {
        if (strength < 3) throw new Error("Please choose a stronger password.");
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        
        const res = await resetPasswordApi(email, otp, password);
        if (res.data.success) {
          handleAuthSuccess(res);
        }
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "Something went wrong!";
      showToast(errMsg, "error");
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      const type = mode.includes("signup") ? "register" : "reset";
      await sendOtpApi(email, type);
      showToast("New OTP sent!", "success");
      setTimer(60);
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to resend OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (mode === "signup_verify_otp") setMode("signup_email");
    else if (mode === "signup_details") setMode("signup_verify_otp");
    else if (mode === "forgot_email") setMode("login");
    else if (mode === "forgot_verify_otp") setMode("forgot_email");
    else if (mode === "forgot_reset") setMode("forgot_verify_otp");
  };

  const renderPasswordInput = (val: string, setter: any, show: boolean, setShow: any, placeholder: string) => (
    <div className="relative mb-4">
      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        required
        className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-white outline-none focus:border-indigo-500 transition-all"
        value={val}
        onChange={(e) => setter(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-400 transition-colors"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md bg-card/80 backdrop-blur-2xl border border-border rounded-[2rem] p-8 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {mode !== "login" && mode !== "signup_email" && (
          <button
            type="button"
            onClick={handleBack}
            className="absolute top-8 left-8 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold tracking-wider uppercase mb-6 border border-indigo-500/20">
            <Zap size={14} className="animate-pulse" />
            {mode === "login" ? "Auth Required" : mode.includes("forgot") ? "Account Recovery" : "Join BaseByte"}
          </div>
          <h2 className="text-3xl font-black text-foreground mb-2 tracking-tight">
            {mode === "login" ? "Welcome Back!" 
              : mode === "signup_email" ? "Create Account" 
              : mode === "forgot_email" ? "Forgot Password" 
              : mode.includes("verify") ? "Enter OTP" 
              : mode === "signup_details" ? "Final Step" 
              : "Set New Password"}
          </h2>
          {(mode.includes("verify") || mode === "signup_details" || mode === "forgot_reset") && (
            <p className="text-muted-foreground text-sm font-medium">
              {email}
              <button type="button" onClick={() => setMode(mode.includes("signup") ? "signup_email" : "forgot_email")} className="ml-2 text-indigo-400 hover:text-indigo-300">
                (Change)
              </button>
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {(mode === "login" || mode === "signup_email" || mode === "forgot_email") && (
            <div className="relative">
              {mode === "login" ? <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" /> : <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />}
              <input
                type={mode === "login" ? "text" : "email"}
                placeholder={mode === "login" ? "Username or Email" : "Email Address"}
                required
                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-background border border-border text-foreground outline-none focus:border-indigo-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {mode === "login" && renderPasswordInput(password, setPassword, showPassword, setShowPassword, "Password")}

          {(mode === "signup_verify_otp" || mode === "forgot_verify_otp") && (
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="6-Digit OTP"
                required
                maxLength={6}
                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-background border border-border text-foreground outline-none focus:border-indigo-500 transition-all text-center tracking-[0.5em] font-bold text-xl"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          )}

          {(mode === "signup_details" || mode === "forgot_reset") && (
            <>
              {mode === "signup_details" && (
                <div className="relative mb-4">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-background border border-border text-foreground outline-none focus:border-indigo-500 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              {renderPasswordInput(password, setPassword, showPassword, setShowPassword, "New Password")}

              {password && (
                <div className="mb-4">
                  <div className="flex gap-1 h-1.5 mb-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} className={`h-full flex-1 rounded-full transition-colors duration-300 ${strength >= level ? strengthColors[strength] : 'bg-border'}`} />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className={`font-bold ${strength >= 3 ? 'text-emerald-500' : 'text-orange-500'}`}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                </div>
              )}

              {renderPasswordInput(confirmPassword, setConfirmPassword, showConfirmPassword, setShowConfirmPassword, "Confirm Password")}
            </>
          )}

          {mode === "login" && (
            <div className="flex justify-end">
              <button type="button" onClick={() => setMode("forgot_email")} className="text-xs text-indigo-400 font-bold hover:text-indigo-300">
                Forgot Password?
              </button>
            </div>
          )}

          <button
            disabled={loading || ((mode === "signup_details" || mode === "forgot_reset") && (strength < 3 || password !== confirmPassword))}
            className="w-full group py-4 mt-6 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
          >
            {loading ? "Processing..." : 
              mode === "login" ? "Login" : 
              mode.includes("email") ? "Send OTP" : 
              mode.includes("verify") ? "Verify OTP" : 
              "Complete"}
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        {mode.includes("verify") && (
           <div className="mt-6 text-center text-sm text-muted-foreground font-medium">
             Didn't receive the code? {" "}
             <button
               type="button"
               disabled={timer > 0 || loading}
               onClick={handleResendOtp}
               className="text-indigo-400 font-bold hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
             </button>
           </div>
        )}

        {(mode === "login" || mode === "signup_email") && (
          <>
            <div className="mt-8 flex items-center justify-center gap-4 text-xs font-bold text-muted-foreground tracking-widest uppercase">
              <div className="h-px bg-border flex-1"></div>
              <span>OR CONTINUE WITH</span>
              <div className="h-px bg-border flex-1"></div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={triggerGoogle}
                className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/[0.03] border border-white/10 text-white font-bold hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 group shadow-lg"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Google
              </button>
              <button
                type="button"
                onClick={triggerGithub}
                className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/[0.03] border border-white/10 text-white font-bold hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 group shadow-lg"
              >
                <img src="https://github.com/favicon.ico" className="w-5 h-5 invert group-hover:scale-110 transition-transform" alt="GitHub" />
                GitHub
              </button>
            </div>
          </>
        )}

        {!mode.includes("verify") && !mode.includes("details") && mode !== "forgot_reset" && (
          <div className="mt-8 text-center">
            <button 
              type="button"
              onClick={() => setMode(mode.includes("login") ? "signup_email" : "login")}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors group"
            >
              {mode === "login" ? (
                <>New to BaseByte? <span className="text-indigo-400 font-bold group-hover:text-indigo-300 group-hover:underline underline-offset-4">Sign up</span></>
              ) : (
                <>Already have an account? <span className="text-indigo-400 font-bold group-hover:text-indigo-300 group-hover:underline underline-offset-4">Login</span></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
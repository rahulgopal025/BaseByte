import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../hooks/useAuth";
import { ShieldCheck, User, Lock, Key, Save, AlertCircle, CheckCircle2, Mail, Eye, EyeOff } from "lucide-react";

export default function AccountSettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profileData, updateAccount } = useProfile();
  
  const [username, setUsername] = useState(profileData?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword && newPassword !== confirmPassword) {
      return setError("New passwords do not match.");
    }
    if (newPassword && newPassword.length < 6) {
      return setError("New password must be at least 6 characters.");
    }
    if (newPassword && !currentPassword) {
      return setError("Current password is required to change your password.");
    }

    setLoading(true);
    
    const payload: any = {};
    if (username !== profileData?.username) {
      if (!/^[a-zA-Z0-9._]+$/.test(username)) {
        return setError("Username can only contain letters, numbers, dots, and underscores.");
      }
      if (!/\d/.test(username)) {
        return setError("Username must contain at least one number.");
      }
      payload.username = username;
    }
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      setLoading(false);
      return setError("No changes made.");
    }

    const res = await updateAccount(payload);
    setLoading(false);

    if (res.success) {
      setSuccess("Account settings updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setError(res.error || "Failed to update account settings.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Account Security</h2>
            <p className="text-sm text-white/40 mt-0.5">Update your unique username and manage your password.</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6 max-w-xl">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-medium">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-sm font-medium">
              <CheckCircle2 size={16} className="shrink-0" />
              {success}
            </div>
          )}

          {/* Email Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2 border-b border-white/[0.04] pb-2">
              <Mail size={14} className="text-indigo-400" /> Email
            </h3>
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Registered Email</label>
              <input
                type="email"
                value={profileData?.email || ""}
                disabled
                className="w-full bg-white/[0.01] border border-white/[0.05] rounded-xl px-4 py-3 text-white/50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Username Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2 border-b border-white/[0.04] pb-2">
              <User size={14} className="text-indigo-400" /> Username
            </h3>
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Unique Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a unique username"
                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2 border-b border-white/[0.04] pb-2">
              <Lock size={14} className="text-indigo-400" /> Change Password
            </h3>
            
            <div className="relative">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider">Current Password</label>
                <button 
                  type="button" 
                  onClick={() => {
                    logout();
                    navigate("/auth", { state: { showForgot: true } });
                  }}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required if changing password"
                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl pl-4 pr-12 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-[34px] text-gray-500 hover:text-indigo-400 transition-colors"
              >
                {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl pl-4 pr-12 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-[34px] text-gray-500 hover:text-indigo-400 transition-colors"
                >
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="relative">
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Confirm Password</label>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl pl-4 pr-12 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-[34px] text-gray-500 hover:text-indigo-400 transition-colors"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full group py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
            {!loading && <Save size={16} className="group-hover:scale-110 transition-transform" />}
          </button>
        </form>
      </div>
    </div>
  );
}

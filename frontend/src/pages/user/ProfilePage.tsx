import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../hooks/useAuth";
import CompleteProfile from "../../components/profile/CompleteProfile";
import MyProfile from "../../components/profile/MyProfile";


export default function ProfilePage() {
  const { fetchProfile, isLoading } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<"display" | "form">("display");

  useEffect(() => {
    if (user) fetchProfile();
    // fetchProfile is now stable via useCallback — safe to include but 
    // we only want this to run once on mount when user is available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-black text-white mb-4">Please login to view your profile</h2>
        <button onClick={() => navigate('/auth')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all">
          Go to Login
        </button>
      </div>
    );
  }

  if (isLoading) return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-16 pt-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero skeleton */}
        <div className="rounded-3xl bg-white/[0.02] border border-white/5 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-28 h-28 bg-zinc-800 rounded-3xl animate-pulse" />
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="h-8 w-64 bg-zinc-800 rounded-xl animate-pulse mx-auto md:mx-0" />
              <div className="h-4 w-48 bg-zinc-800/60 rounded-lg animate-pulse mx-auto md:mx-0" />
              <div className="h-4 w-80 bg-zinc-800/40 rounded-lg animate-pulse mx-auto md:mx-0" />
              <div className="h-3 w-full max-w-md bg-zinc-800/30 rounded-full animate-pulse mx-auto md:mx-0 mt-4" />
            </div>
          </div>
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-800/30 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
        {/* Coding stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-zinc-800/20 rounded-2xl animate-pulse" />
          <div className="h-64 bg-zinc-800/20 rounded-2xl animate-pulse" style={{ animationDelay: '200ms' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-20 pb-20 px-4 md:px-6">
      {view === "display" ? <MyProfile setView={setView} /> : <CompleteProfile setView={setView} />}
    </div>

  
  );
}
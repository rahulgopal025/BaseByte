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
  }, [user, fetchProfile]);

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
    <div className="min-h-screen bg-[#050505] p-8 md:p-16">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-10 w-64 bg-zinc-800 rounded-2xl animate-pulse" />
        <div className="h-6 w-full bg-zinc-800/60 rounded-xl animate-pulse" />
        <div className="h-6 w-3/4 bg-zinc-800/60 rounded-xl animate-pulse" />
        <div className="h-48 w-full bg-zinc-800/40 rounded-2xl animate-pulse mt-8" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6">
      {view === "display" ? <MyProfile setView={setView} /> : <CompleteProfile setView={setView} />}
      
    </div>

  
  );
}
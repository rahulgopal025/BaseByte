import React, { useState, useEffect } from "react";
import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";
import CompleteProfile from "../context/CompleteProfile";
import MyProfile from "../context/MyProfile";


export default function ProfilePage() {
  const { fetchProfile, isLoading } = useProfile();
  const { user } = useAuth();
  const [view, setView] = useState<"display" | "form">("display");

  useEffect(() => {
    if (user?.email) fetchProfile(user.email);
  }, [user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white font-black tracking-widest animate-pulse">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6">
      {view === "display" ? <MyProfile setView={setView} /> : <CompleteProfile setView={setView} />}
      
    </div>

  
  );
}
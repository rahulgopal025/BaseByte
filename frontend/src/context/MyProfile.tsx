import React from "react";
import { useProfile } from "./ProfileContext";
import { useAuth } from "./AuthContext";
import { Edit3, MapPin, School, Phone, Mail, User, PlusCircle, ShieldCheck } from "lucide-react";

export default function MyProfile({ setView }: { setView: any }) {
  const { profileData } = useProfile();
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in zoom-in pt-1 duration-500 -mt-24 ">
      
      <div className="relative overflow-hidden bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[3rem] text-white">
        <div className="absolute top-0 right-0 p-6 opacity-10">
            <ShieldCheck size={120} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 uppercase bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl shadow-indigo-500/20">
              {user?.name ? user.name[0] : "U"}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#050505] p-2 rounded-xl border border-white/10">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-5xl font-black tracking-tighter uppercase italic">
              {user?.name || "User Name"}
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400">
              <Mail size={16} className="text-indigo-500" /> 
              <span className="text-sm font-medium tracking-wide">{user?.email}</span>
            </div>
          </div>

          <button 
            onClick={() => setView("form")} 
            className="group relative px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 hover:text-white transition-all duration-300 flex items-center gap-3 overflow-hidden"
          >
            {profileData ? <><Edit3 size={18} /> Edit Profile</> : <><PlusCircle size={18} /> Complete Profile</>}
          </button>
        </div>
      </div>

      {profileData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group">
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Full Registered Name</p>
                  <p className="text-white text-lg font-bold">{profileData.firstName} {profileData.midName} {profileData.lastName}</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <School size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Institution / College</p>
                  <p className="text-white text-lg font-bold">{profileData.college}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group">
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Contact Number</p>
                  <p className="text-white text-lg font-bold">{profileData.mobile}</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Current Address</p>
                  <p className="text-white text-lg font-bold leading-tight">{profileData.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-8 bg-gradient-to-r from-indigo-600/10 to-transparent border border-white/5 rounded-[2.5rem] flex items-center justify-between">
             <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-500 rounded-2xl text-white">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Educational Degree</p>
                  <p className="text-white text-xl font-black">{profileData.degree} Student</p>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="p-20 text-center bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[4rem] group hover:border-indigo-500/20 transition-all">
          <div className="inline-flex p-6 bg-white/5 rounded-full mb-6 text-gray-600 group-hover:text-indigo-500 transition-all">
            <User size={48} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Profile Incomplete</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">Please add your college details, address, and mobile number to build your developer identity.</p>
          <button onClick={() => setView("form")} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all">
             Start Setup Now
          </button>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useProfile } from "./ProfileContext";
import { useAuth } from "./AuthContext";
import { Save, ArrowLeft } from "lucide-react";

export default function CompleteProfile({ setView }: { setView: any }) {
  const { profileData, saveProfile } = useProfile();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: "", 
    midName: "", 
    lastName: "",
    college: "", 
    address: "", 
    mobile: "", 
    degree: "B.Tech"
  });

  useEffect(() => {
    if (profileData) {
      setFormData(profileData);
    } else if (user?.email) {
      setFormData((prev: any) => ({ ...prev, email: user.email }));
    }
  }, [profileData, user]);

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.mobile) {
      alert("Please fill all required fields");
      return;
    }
    const success = await saveProfile(formData);
    if (success) setView("display");
  };

  const degrees = ["11th", "12th", "Diploma", "B.Tech", "BCA", "BSC", "Other"];

  return (
    <div className="max-w-3xl mx-auto bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem]">
      <div className="flex justify-between items-center mb-8 text-white">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">
          {profileData ? "Edit" : "Complete"} <span className="text-indigo-500">Profile</span>
        </h2>
        <button onClick={() => setView("display")} className="text-gray-500 hover:text-white">
          <ArrowLeft size={24} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <input type="text" value={formData.firstName} placeholder="First Name" className="bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-indigo-500 text-white placeholder:text-gray-600" onChange={(e)=>setFormData({...formData, firstName: e.target.value})} />
        <input type="text" value={formData.midName} placeholder="Middle Name" className="bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-indigo-500 text-white placeholder:text-gray-600" onChange={(e)=>setFormData({...formData, midName: e.target.value})} />
        <input type="text" value={formData.lastName} placeholder="Last Name" className="bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-indigo-500 text-white placeholder:text-gray-600" onChange={(e)=>setFormData({...formData, lastName: e.target.value})} />
      </div>

      <div className="space-y-6 text-white ">
        <input type="text" value={formData.college} placeholder="College Name" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-indigo-500 text-white placeholder:text-gray-600" onChange={(e)=>setFormData({...formData, college: e.target.value})} />
        
        <select value={formData.degree} className="w-full bg-[#0A0A0C] p-4 rounded-2xl border border-white/10 outline-none focus:border-indigo-500 text-white cursor-pointer" onChange={(e)=>setFormData({...formData, degree: e.target.value})}>
           {degrees.map(d => <option key={d} value={d} className="bg-[#0A0A0C]">{d}</option>)}
        </select>

        <input type="tel" value={formData.mobile} placeholder="Mobile Number" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-indigo-500 text-white placeholder:text-gray-600" onChange={(e)=>setFormData({...formData, mobile: e.target.value})} />
        <textarea value={formData.address} placeholder="Address" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-indigo-500 text-white placeholder:text-gray-600 h-24" onChange={(e)=>setFormData({...formData, address: e.target.value})} />

        <button onClick={handleSubmit} className="w-full bg-indigo-600 p-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all text-white flex items-center justify-center gap-2">
          <Save size={18} /> Save Details
        </button>
      </div>
    </div>
  );
}
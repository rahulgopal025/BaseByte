import React, { useState, useEffect } from "react";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../hooks/useAuth";
import { Save, ArrowLeft, X, Plus, Camera } from "lucide-react";

export default function CompleteProfile({
  setView,
}: {
  setView: (view: string) => void;
}) {
  const { profileData, saveProfile } = useProfile();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: "",
    midName: "",
    lastName: "",
    bio: "",
    college: "",
    address: "",
    location: "",
    mobile: "",
    degree: "B.Tech",
    graduationYear: "",
    skills: [] as string[],
    github: "",
    linkedin: "",
    website: "",
    twitter: "",
    avatar: "",
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        email: user?.email || "",
        firstName: profileData.firstName || "",
        midName: profileData.midName || "",
        lastName: profileData.lastName || "",
        bio: profileData.bio || "",
        college: profileData.college || "",
        address: profileData.address || "",
        location: profileData.location || "",
        mobile: profileData.mobile || "",
        degree: profileData.degree || "B.Tech",
        graduationYear: profileData.graduationYear || "",
        skills: profileData.skills || [],
        github: profileData.github || "",
        linkedin: profileData.linkedin || "",
        website: profileData.website || "",
        twitter: profileData.twitter || "",
        avatar: profileData.avatar || "",
      });
    } else if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [profileData, user]);

  const handleSubmit = async () => {
    setError("");

    if (!formData.firstName || !formData.lastName || !formData.mobile) {
      setError(
        "Please fill all required fields (First Name, Last Name, Mobile)"
      );
      return;
    }

    // URL validation
    const urlFields = ['github', 'linkedin', 'website', 'twitter'] as const;
    for (const field of urlFields) {
      if (formData[field] && formData[field].trim() !== '') {
        try {
          new URL(formData[field]);
        } catch {
          setError(`Invalid URL for ${field.charAt(0).toUpperCase() + field.slice(1)}. Please enter a valid URL starting with https://`);
          return;
        }
      }
    }

    setSaving(true);
    const success = await saveProfile(formData);

    if (success) {
      setView("display");
    } else {
      setError("Failed to save profile. Please try again.");
    }
    setSaving(false);
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed) && formData.skills.length < 15) {
      setFormData({ ...formData, skills: [...formData.skills, trimmed] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError("Profile picture must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const degrees = ["11th", "12th", "Diploma", "B.Tech", "BCA", "BSC", "MCA", "M.Tech", "PhD", "Other"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear - 2 + i));

  const inputClasses = "w-full bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.08] outline-none focus:border-indigo-500/50 text-white placeholder:text-white/15 text-sm transition-colors";
  const labelClasses = "text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5 block";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight">
            {profileData ? "Edit" : "Complete"} <span className="text-indigo-400">Profile</span>
          </h2>
          <button onClick={() => setView("display")} className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Avatar Upload */}
        <div className="flex flex-col items-center justify-center py-6 border-b border-white/[0.06]">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-zinc-800 border-2 border-white/10 flex items-center justify-center">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-white/50 uppercase">{user?.email ? user.email[0] : "U"}</span>
              )}
            </div>
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center cursor-pointer">
              <Camera className="text-white w-8 h-8" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <p className="text-xs text-white/40 mt-3 font-medium tracking-wide">JPG, PNG or WebP. Max 2MB.</p>
        </div>

        <div className="space-y-6 pt-6">
          {/* Name Fields */}
          <div>
            <p className={labelClasses}>Full Name <span className="text-red-400">*</span></p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" value={formData.firstName} placeholder="First Name" className={inputClasses}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              <input type="text" value={formData.midName} placeholder="Middle Name" className={inputClasses}
                onChange={(e) => setFormData({ ...formData, midName: e.target.value })} />
              <input type="text" value={formData.lastName} placeholder="Last Name" className={inputClasses}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className={labelClasses}>Bio</label>
            <textarea value={formData.bio} placeholder="Tell us about yourself — your interests, goals, and what you're learning..."
              className={`${inputClasses} h-20 resize-none`}
              maxLength={300}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
            <p className="text-[10px] text-white/15 mt-1 text-right">{formData.bio.length}/300</p>
          </div>

          {/* Education Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={labelClasses}>College</label>
              <input type="text" value={formData.college} placeholder="College Name" className={inputClasses}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })} />
            </div>
            <div>
              <label className={labelClasses}>Degree</label>
              <select value={formData.degree} className={`${inputClasses} cursor-pointer bg-[#0a0a0c]`}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}>
                {degrees.map(d => <option key={d} value={d} className="bg-[#0a0a0c]">{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Graduation Year</label>
              <select value={formData.graduationYear} className={`${inputClasses} cursor-pointer bg-[#0a0a0c]`}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}>
                <option value="" className="bg-[#0a0a0c]">Select Year</option>
                {years.map(y => <option key={y} value={y} className="bg-[#0a0a0c]">{y}</option>)}
              </select>
            </div>
          </div>

          {/* Contact Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClasses}>Phone Number <span className="text-red-400">*</span></label>
              <input type="tel" value={formData.mobile} placeholder="Phone Number" className={inputClasses}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
            </div>
            <div>
              <label className={labelClasses}>Location</label>
              <input type="text" value={formData.location} placeholder="City, Country" className={inputClasses}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className={labelClasses}>Skills</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={skillInput} placeholder="Add a skill (e.g. Java, React, DSA...)"
                className={`${inputClasses} flex-1`}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                onChange={(e) => setSkillInput(e.target.value)}
              />
              <button onClick={addSkill} className="px-4 py-2 bg-indigo-500/15 text-indigo-400 rounded-xl hover:bg-indigo-500/25 transition-colors border border-indigo-500/20">
                <Plus size={16} />
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 text-xs font-medium text-white/60 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full">
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-white/20 hover:text-red-400 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="pt-4 border-t border-white/[0.04]">
            <p className={`${labelClasses} mb-3`}>Social Links <span className="font-normal text-white/15">(Optional)</span></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="url" value={formData.github} placeholder="https://github.com/username" className={inputClasses}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })} />
              <input type="url" value={formData.linkedin} placeholder="https://linkedin.com/in/username" className={inputClasses}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
              <input type="url" value={formData.website} placeholder="https://yourportfolio.com" className={inputClasses}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
              <input type="url" value={formData.twitter} placeholder="https://x.com/username" className={inputClasses}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} />
            </div>
          </div>

          {/* Address (legacy) */}
          <div>
            <label className={labelClasses}>Address</label>
            <textarea value={formData.address} placeholder="Full Address (optional)" 
              className={`${inputClasses} h-16 resize-none`}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all text-white flex items-center justify-center gap-2">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
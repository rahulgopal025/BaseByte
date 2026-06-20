import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getStudentProfile } from "../../api/admin.api";
import MyProfile from "../../components/profile/MyProfile";

export default function AdminStudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getStudentProfile(id)
        .then(res => setProfileData(res.data.data))
        .catch(err => {
          console.error(err);
          alert("Failed to load student profile");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-zinc-500 animate-pulse flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading student profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-foreground mb-8">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-rose-500">Student profile not found.</div>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-foreground">
      {/* Admin header nav */}
      <div className="p-6 md:px-12 pt-8 border-b border-border flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black">Student Profile</h1>
            <p className="text-zinc-500 text-sm">Read-only view for administrators</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-12">
        <MyProfile overrideData={profileData} />
      </div>
    </div>
  );
}

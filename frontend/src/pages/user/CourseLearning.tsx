import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, FileText, Wifi, CheckCircle2, Lock } from "lucide-react";
import axiosInstance from "../../api/axios.instance";
import { getCourseById } from "../../api/course.api";
import { useToastContext } from "../../context/ToastContext";

export default function CourseLearning() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToastContext();

  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, enrollRes, lectureRes] = await Promise.all([
          getCourseById(id!),
          axiosInstance.get(`/api/enrollments/check/${id}`),
          axiosInstance.get(`/api/lectures/${id}`)
        ]);
        setCourse(courseRes.data.data);
        const isEnrolled = enrollRes.data.data?.enrolled && enrollRes.data.data?.status === "approved";
        setEnrolled(isEnrolled || courseRes.data.data?.isFree);
        const lects = lectureRes.data.data?.filter((l: any) => (l.courseId?._id || l.courseId) === id) || [];
        setLectures(lects.sort((a: any, b: any) => a.order - b.order));
        if (lects.length > 0) setSelected(lects[0]);
      } catch {
        showToast("Failed to load course.", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-zinc-500 font-bold animate-pulse">Loading course...</div>
    </div>
  );

  if (!enrolled) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white text-center p-8">
      <div>
        <Lock size={40} className="text-zinc-700 mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2">Access Restricted</h2>
        <p className="text-zinc-500 mb-6">You need to enroll in this course to access lectures.</p>
        <button onClick={() => navigate(`/courses/${id}`)} className="px-8 py-3 bg-indigo-600 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all">
          View Course
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-[#08080A]">
        <button onClick={() => navigate("/courses")} className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-black text-lg truncate">{course?.title}</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — Lecture List */}
        <aside className="w-72 border-r border-white/5 bg-[#08080A] overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">
              {lectures.length} Lectures
            </p>
            {lectures.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-8">No lectures added yet.</p>
            ) : (
              <div className="space-y-1">
                {lectures.map(lecture => (
                  <button
                    key={lecture._id}
                    onClick={() => setSelected(lecture)}
                    className={`w-full text-left p-3 rounded-2xl transition-all ${selected?._id === lecture._id ? "bg-indigo-600/10 border border-indigo-500/20" : "hover:bg-white/5 border border-transparent"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black ${selected?._id === lecture._id ? "bg-indigo-600 text-white" : "bg-white/5 text-zinc-500"}`}>
                        {lecture.order}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${selected?._id === lecture._id ? "text-white" : "text-zinc-400"}`}>
                          {lecture.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {lecture.isLive ? (
                            <span className="text-[9px] font-black text-green-400 flex items-center gap-1"><Wifi size={9} /> Live</span>
                          ) : (
                            <span className="text-[9px] text-zinc-600 flex items-center gap-1"><Play size={9} /> {lecture.duration}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main — Video Player */}
        <main className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-zinc-600">
              <div className="text-center">
                <Play size={40} className="mx-auto mb-4" />
                <p className="font-bold">Select a lecture to start learning</p>
              </div>
            </div>
          ) : (
            <div className="p-8 max-w-4xl mx-auto">
              <h2 className="text-3xl font-black mb-2">{selected.title}</h2>
              <p className="text-zinc-500 text-sm mb-8">{selected.duration}</p>

              {selected.isLive ? (
                <div className="bg-[#0d0d0e] border border-green-500/20 rounded-[24px] p-8 text-center mb-8">
                  <Wifi size={32} className="text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-green-400 mb-2">Live Session</h3>
                  <p className="text-zinc-400 text-sm mb-6">Click the button below to join the live lecture.</p>
                  <a
                    href={selected.liveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all"
                  >
                    <Wifi size={14} /> Join Live Session
                  </a>
                </div>
              ) : selected.videoUrl ? (
                <div className="bg-black rounded-[24px] overflow-hidden mb-8 aspect-video">
                  <iframe
                    src={selected.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={selected.title}
                  />
                </div>
              ) : (
                <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center mb-8">
                  <Play size={32} className="text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 font-bold">Video not yet uploaded for this lecture.</p>
                </div>
              )}

              {/* Notes Download */}
              {selected.notes && (
                <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                        <FileText size={16} className="text-pink-400" />
                      </div>
                      <div>
                        <p className="font-bold">Lecture Notes</p>
                        <p className="text-zinc-500 text-xs">PDF study material</p>
                      </div>
                    </div>
                    <a
                      href={selected.notes}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded-xl font-black uppercase text-xs tracking-widest transition-all"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, FileText, Wifi, Lock, Code2, ExternalLink, X, Menu } from "lucide-react";
import axiosInstance from "../../api/axios.instance";
import { getCourseById } from "../../api/course.api";
import { useToastContext } from "../../context/ToastContext";

export default function CourseLearning() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToastContext();

  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  const [activeTab, setActiveTab] = useState<'lectures' | 'practice' | 'notes'>('lectures');
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleSelectLecture = (lecture: any) => {
    setSelected(lecture);
    setShowSidebar(false);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, enrollRes, lectureRes, problemRes, notesRes] = await Promise.all([
          getCourseById(id!),
          axiosInstance.get(`/api/enrollments/check/${id}`),
          axiosInstance.get(`/api/lectures/${id}`),
          axiosInstance.get(`/api/courses/${id}/problems`).catch(() => ({ data: { data: [] } })),
          axiosInstance.get(`/api/courses/${id}/notes`).catch(() => ({ data: { data: [] } }))
        ]);
        setCourse(courseRes.data.data);
        const isEnrolled = enrollRes.data.data?.enrolled && enrollRes.data.data?.status === "approved";
        setEnrolled(isEnrolled || courseRes.data.data?.isFree);

        const lects = lectureRes.data.data?.filter((l: any) => (l.courseId?._id || l.courseId) === id) || [];
        setLectures(lects.sort((a: any, b: any) => a.order - b.order));
        if (lects.length > 0) setSelected(lects[0]);

        setProblems(problemRes.data.data || []);
        setNotes(notesRes.data.data || []);
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
      <div className="text-zinc-500 font-bold animate-pulse">Loading workspace...</div>
    </div>
  );

  if (!enrolled) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white text-center p-8">
      <div>
        <Lock size={40} className="text-zinc-700 mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2">Access Restricted</h2>
        <p className="text-zinc-500 mb-6">You need to enroll in this course to access the workspace.</p>
        <button onClick={() => navigate(`/courses/${id}`)} className="px-8 py-3 bg-indigo-600 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all">
          View Course
        </button>
      </div>
    </div>
  );

  const difficultyColor = (d: string) => ({
    Easy: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    Medium: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    Hard: "text-rose-400 border-rose-500/20 bg-rose-500/10",
  }[d] || "text-zinc-400 border-white/10 bg-white/5");

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative">
      {/* Top Bar */}
      <div className="flex flex-col border-b border-white/5 bg-[#08080A]">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/courses")} className="text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-black text-lg truncate">{course?.title}</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 gap-6">
          {(['lectures', 'practice', 'notes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? "border-indigo-500 text-indigo-400" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
            >
              {tab === 'practice' ? 'Practice Problems' : tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'lectures' && (
        <div className="flex flex-1 overflow-hidden relative">

          {/* Mobile Backdrop */}
          {showSidebar && (
            <div
              className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Sidebar — Lecture List */}
          <aside className={`
            fixed md:relative z-50 top-0 left-0 h-full
            w-72 border-r border-white/5 bg-[#08080A] overflow-y-auto flex-shrink-0
            transition-transform duration-300 ease-in-out
            ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          `}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">
                  {lectures.length} Lectures
                </p>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="md:hidden text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              {lectures.length === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-8">No lectures added yet.</p>
              ) : (
                <div className="space-y-1">
                  {lectures.map(lecture => (
                    <button
                      key={lecture._id}
                      onClick={() => handleSelectLecture(lecture)}
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
          <main className="flex-1 overflow-y-auto relative">
            {/* Mobile Toggle Button */}
            <div className="md:hidden p-4 border-b border-white/5 bg-[#08080A] flex items-center gap-4">
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 text-zinc-400 hover:text-white transition-colors"
              >
                <Menu size={20} />
              </button>
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Course Content</span>
            </div>
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
              </div>
            )}
          </main>
        </div>
      )}

      {activeTab === 'practice' && (
        <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
          {problems.length === 0 ? (
            <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
              <Code2 size={40} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold">No practice problems available for this course yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {problems.map((p) => (
                <div key={p._id} className="bg-[#0d0d0e] border border-white/5 hover:border-white/10 rounded-[24px] p-6 flex flex-col transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${difficultyColor(p.difficulty)}`}>
                      {p.difficulty}
                    </span>
                    {p.topic && (
                      <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded-md">{p.topic}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-black mb-2 line-clamp-1">{p.title}</h3>
                  <p className="text-zinc-400 text-sm mb-6 line-clamp-2 flex-1">{p.description}</p>

                  {p.tags?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-6">
                      {p.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">{tag}</span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedProblem(p)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 text-center"
                  >
                    Solve Problem
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
          {notes.length === 0 ? (
            <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
              <FileText size={40} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold">No notes available for this course yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.map((note) => (
                <div key={note._id} className="bg-[#0d0d0e] border border-white/5 hover:border-white/10 rounded-[24px] p-6 flex items-center justify-between transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-black mb-1">{note.title}</h3>
                      <p className="text-zinc-500 text-xs">{note.subject || "Course Material"}</p>
                    </div>
                  </div>
                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest text-zinc-300 transition-all flex items-center gap-2"
                  >
                    View <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Platform Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0e] border border-white/10 rounded-[32px] p-8 w-full max-w-md relative">
            <button
              onClick={() => setSelectedProblem(null)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black mb-2">Choose Platform</h2>
            <p className="text-zinc-500 text-sm mb-8">Select where you want to solve '{selectedProblem.title}'.</p>

            <div className="space-y-3">
              {selectedProblem.leetCodeUrl && (
                <a href={selectedProblem.leetCodeUrl} target="_blank" rel="noreferrer" className="block w-full p-4 border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all text-center font-bold">
                  LeetCode
                </a>
              )}
              {selectedProblem.gfgUrl && (
                <a href={selectedProblem.gfgUrl} target="_blank" rel="noreferrer" className="block w-full p-4 border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all text-center font-bold">
                  GeeksforGeeks
                </a>
              )}
              {selectedProblem.hackerRankUrl && (
                <a href={selectedProblem.hackerRankUrl} target="_blank" rel="noreferrer" className="block w-full p-4 border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all text-center font-bold">
                  HackerRank
                </a>
              )}
              {selectedProblem.codeChefUrl && (
                <a href={selectedProblem.codeChefUrl} target="_blank" rel="noreferrer" className="block w-full p-4 border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all text-center font-bold">
                  CodeChef
                </a>
              )}

              {/* Fallback to BaseByte Internal Compiler */}
              {!selectedProblem.leetCodeUrl && !selectedProblem.gfgUrl && !selectedProblem.hackerRankUrl && !selectedProblem.codeChefUrl && (
                <button onClick={() => navigate(`/practice/${selectedProblem._id}`)} className="block w-full p-4 border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 rounded-2xl hover:bg-indigo-500/20 transition-all text-center font-bold">
                  BaseByte IDE
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

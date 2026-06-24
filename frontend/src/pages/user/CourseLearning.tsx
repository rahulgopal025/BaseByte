import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Play, FileText, Wifi, Lock, Code2, ExternalLink, X, Menu, CheckCircle2, Search, Filter, MessageSquare } from "lucide-react";
import axiosInstance from "../../api/axios.instance";
import { getCourseById } from "../../api/course.api";
import { useToastContext } from "../../context/ToastContext";
import FeedbackModal from "../../components/FeedbackModal";

export default function CourseLearning() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToastContext();

  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  const activeTab = (searchParams.get('tab') as 'lectures' | 'practice' | 'notes') || 'lectures';
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'course' | 'lecture' | 'practice' | 'note'>('course');

  const handleSelectLecture = (lecture: any) => {
    setSelected(lecture);
    setShowSidebar(false);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, enrollRes, lectureRes, problemRes, notesRes, submissionsRes] = await Promise.all([
          getCourseById(id!),
          axiosInstance.get(`/api/enrollments/check/${id}`),
          axiosInstance.get(`/api/lectures/${id}`),
          axiosInstance.get(`/api/courses/${id}/problems`).catch(() => ({ data: { data: [] } })),
          axiosInstance.get(`/api/courses/${id}/notes`).catch(() => ({ data: { data: [] } })),
          axiosInstance.get(`/api/submissions`).catch(() => ({ data: { data: [] } }))
        ]);
        setCourse(courseRes.data.data);
        const isEnrolled = enrollRes.data.data?.enrolled && enrollRes.data.data?.status === "approved";
        setEnrolled(isEnrolled || courseRes.data.data?.isFree);

        const lects = lectureRes.data.data?.filter((l: any) => (l.courseId?._id || l.courseId) === id) || [];
        setLectures(lects.sort((a: any, b: any) => a.order - b.order));
        if (lects.length > 0) setSelected(lects[0]);

        setProblems(problemRes.data.data || []);
        setNotes(notesRes.data.data || []);
        setSubmissions(submissionsRes.data.data || []);
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
        <div className="flex items-center px-4 md:px-6 gap-4 md:gap-6 overflow-x-auto hide-scrollbar">
          {(['lectures', 'practice', 'notes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-[10px] md:text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${activeTab === tab ? "border-indigo-500 text-indigo-400" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
            >
              {tab === 'practice' ? 'Practice' : tab}
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

      {activeTab === 'practice' && (() => {
        const solvedCount = problems.filter(p => submissions.some(s => s.problemId === p._id && s.status === 'Accepted')).length;
        const totalCount = problems.length;
        const progressPercentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

        const topics = ["All", ...Array.from(new Set(problems.map(p => p.topic).filter(Boolean)))];
        const difficulties = ["All", "Easy", "Medium", "Hard"];

        const filteredProblems = problems.filter(p => {
          const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesDifficulty = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
          const matchesTopic = selectedTopic === "All" || p.topic === selectedTopic;
          return matchesSearch && matchesDifficulty && matchesTopic;
        });

        return (
        <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
            <div className="relative bg-gradient-to-br from-indigo-900/20 to-fuchsia-900/10 border border-indigo-500/10 rounded-[32px] p-8 mb-10 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden group">
              {/* Decorative background blur */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-fuchsia-500/20 transition-all duration-700"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700"></div>
              
              <div className="relative z-10 flex-1">
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Practice Progress</h3>
                <p className="text-zinc-400 text-sm">You have conquered <span className="text-white font-bold">{solvedCount}</span> out of <span className="text-white font-bold">{totalCount}</span> challenges.</p>
              </div>
              
              <div className="relative z-10 flex items-center gap-6 w-full sm:w-auto">
                <div className="flex flex-col items-end flex-1 sm:w-64">
                  <div className="flex justify-between w-full mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Completion</span>
                    <span className="text-xs font-black text-white">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-black/40 h-4 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-full transition-all duration-1000 relative shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {problems.length === 0 ? (
            <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
              <Code2 size={40} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold">No practice problems available for this course yet.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search practice problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0d0d0e] border border-white/5 focus:border-indigo-500/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="relative">
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="appearance-none bg-[#0d0d0e] border border-white/5 focus:border-indigo-500/50 rounded-xl py-3 pl-4 pr-10 text-white outline-none transition-all w-full md:w-40 font-bold text-xs uppercase tracking-widest cursor-pointer"
                    >
                      {topics.map(t => <option key={t as string} value={t as string}>{t as string}</option>)}
                    </select>
                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
                  </div>
                  <div className="relative">
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="appearance-none bg-[#0d0d0e] border border-white/5 focus:border-indigo-500/50 rounded-xl py-3 pl-4 pr-10 text-white outline-none transition-all w-full md:w-40 font-bold text-xs uppercase tracking-widest cursor-pointer"
                    >
                      {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
                  </div>
                </div>
              </div>

              {filteredProblems.length === 0 ? (
                <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
                  <Search size={40} className="text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 font-bold">No practice problems match your search criteria.</p>
                  <button onClick={() => { setSearchQuery(""); setSelectedDifficulty("All"); setSelectedTopic("All"); }} className="mt-4 text-indigo-400 hover:text-indigo-300 font-bold text-sm transition-colors">Clear Filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProblems.map((p) => {
                const isSolved = submissions.some(s => s.problemId === p._id && s.status === 'Accepted');
                return (
                <div key={p._id} className="bg-[#0d0d0e] border border-white/5 hover:border-indigo-500/30 rounded-[24px] p-6 flex flex-col transition-all duration-300 relative hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 group">
                  {isSolved && (
                    <div className="absolute top-4 right-4 text-emerald-400 bg-emerald-500/10 p-1.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4 pr-10">
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
                    className={`w-full py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 text-center ${isSolved ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                  >
                    {isSolved ? "Solve Again" : "Solve Problem"}
                  </button>
                </div>
              )})}
            </div>
            )}
            </>
          )}
        </div>
      )})()}

      {activeTab === 'notes' && (
        <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
          {notes.length === 0 ? (
            <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
              <FileText size={40} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold">No notes available for this course yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {notes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => navigate(`/notes/${note._id}/view`)}
                  className="group relative bg-[#0d0d0e]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:-translate-y-2 hover:scale-[1.01] transition-all duration-500 cursor-pointer hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] hover:border-indigo-500/50 flex flex-col h-[400px]"
                >
                  {/* Thumbnail Header Area */}
                  <div className="h-[180px] relative overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/40 border-b border-white/10 flex items-center justify-center">
                    {note.thumbnailUrl ? (
                      <img src={note.thumbnailUrl} alt={note.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <FileText size={56} className="text-indigo-400/40 group-hover:text-indigo-400 transition-all duration-500 relative z-10" />
                      </>
                    )}
                    {/* Floating Badges inside thumbnail area */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                        {note.subject || "Course Material"}
                      </span>
                      <span className="px-3 py-1 bg-emerald-500/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                        Included
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1 relative z-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500 pointer-events-none" />

                    <h3 className="font-bold text-xl md:text-2xl tracking-tight leading-snug text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-fuchsia-400 transition-all line-clamp-2 drop-shadow-md mb-2">
                      {note.title}
                    </h3>

                    <div className="flex flex-col gap-1.5 text-zinc-400 text-sm font-medium mb-auto mt-1">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-indigo-400/70" /> 
                        <span>{note.totalPages > 0 ? `${note.totalPages} Pages` : "Full Access"}</span>
                      </div>
                      <div className="text-[11px] font-bold text-zinc-500 bg-white/5 w-max px-2 py-1 rounded-md border border-white/5 flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${note.isFree ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.5)]'}`} />
                        {note.isFree ? "Preview: Full Access" : `Preview: Pages ${note.previewStartPage || 1}-${note.previewEndPage || 5}`}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-end gap-2">
                        {note.price > 0 && (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-500 line-through">₹{note.price}</span>
                            <span className="text-xl font-black text-emerald-400 leading-none tracking-tight">Free</span>
                          </div>
                        )}
                      </div>
                      <div className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95 group/btn">
                        Read Now <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
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
              {!selectedProblem.leetCodeUrl && !selectedProblem.gfgUrl && !selectedProblem.hackerRankUrl && !selectedProblem.codeChefUrl && (
                <button onClick={() => navigate(`/solve/${selectedProblem._id}`)} className="block w-full p-4 border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 rounded-2xl hover:bg-indigo-500/20 transition-all text-center font-bold">
                  BaseByte IDE
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Button */}
      <button
        onClick={() => {
          setFeedbackType(activeTab === 'practice' ? 'practice' : activeTab === 'notes' ? 'note' : 'lecture');
          setShowFeedbackModal(true);
        }}
        className="fixed bottom-8 right-8 z-40 bg-white hover:bg-zinc-200 text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
      >
        <MessageSquare size={24} className="group-hover:-rotate-12 transition-transform" />
      </button>

      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
        type={feedbackType} 
        courseId={id} 
      />
    </div>
  );
}

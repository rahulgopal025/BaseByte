import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, BookOpen } from "lucide-react";

export default function Topics() {
  const { lang } = useParams();
  const navigate = useNavigate();

  
  const topicList: any = {
    c: ["Intro of C", "Variables & Datatype", "Input & Output", "Conditional Statements", "Loops", "Functions", "Array"],
    python: ["Python Basics", "Variables & Datatype", "Input & Output", "Conditional Statements", "Loops", "Functions", "Array","Lists & Tuples", "Dictionaries", "Functions", "OOPs"],
    java: ["Intro of Java","Java Syntax", "Classes & Objects", "Variables & Datatype", "Input & Output", "Conditional Statements", "Loops", "Functions", "Array"]
  };

  const currentTopics = topicList[lang as string] || [];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/practice')} className="flex items-center text-zinc-500 mb-8 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft className="mr-1 h-4 w-4" /> Change Language
        </button>

        <h1 className="text-4xl font-black mb-10 capitalize">
          {lang} <span className="text-indigo-500">Modules</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentTopics.map((topic: string) => (
            <div
              key={topic}
              onClick={() => navigate(`/quiz/${lang}/${topic.toLowerCase().replace(/ /g, '-')}`)}
              
              className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="font-bold text-zinc-200">{topic}</span>
              </div>
              <span className="text-zinc-600 group-hover:text-indigo-400 transition-colors">10 Qs</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
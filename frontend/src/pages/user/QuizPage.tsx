import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ChevronLeft, CheckCircle2, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { getQuizByTopic } from '../../api/quiz.api';
import type { Quiz } from "../../types/quiz.types";

const QuizPage = () => {
  const { lang, topic } = useParams(); 
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await getQuizByTopic(lang!, topic!);
        setQuestions(res.data.data || res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [lang, topic]);

  const handleOptionClick = (index: number) => {
    
    if (userAnswers[currentIndex] !== undefined) return; 

    const newAnswers = { ...userAnswers, [currentIndex]: index };
    setUserAnswers(newAnswers);
    
    const dbAnswer = Number(questions[currentIndex].correctAnswer);
    if ((index + 1) === dbAnswer) {
      confetti({ particleCount: 80, spread: 50, origin: { y: 0.8 } });
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowScore(true); 
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] p-8 md:p-16">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-10 w-64 bg-zinc-800 rounded-2xl animate-pulse" />
        <div className="h-6 w-full bg-zinc-800/60 rounded-xl animate-pulse" />
        <div className="h-6 w-3/4 bg-zinc-800/60 rounded-xl animate-pulse" />
        <div className="h-48 w-full bg-zinc-800/40 rounded-2xl animate-pulse mt-8" />
      </div>
    </div>
  );
  if (questions.length === 0) return <div className="text-white p-6">No data found.</div>;

  const currentQ = questions[currentIndex];
  const selectedOption = userAnswers[currentIndex];
  const isAnswered = selectedOption !== undefined;

  if (showScore) {
    const correctCount = Object.keys(userAnswers).filter(idx => (userAnswers[parseInt(idx)] + 1) === Number(questions[parseInt(idx)].correctAnswer)).length;
    const percentage = Math.round((correctCount / questions.length) * 100);
    let performanceMsg = "Keep Practicing";
    if (percentage >= 80) performanceMsg = "Excellent!";
    else if (percentage >= 60) performanceMsg = "Good!";

    return (
      <div className="h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-['Public_Sans']">
        <div className="bg-zinc-900/40 border border-white/5 rounded-[24px] p-8 md:p-12 w-full max-w-md text-center">
          <h2 className="text-3xl font-black mb-2">{performanceMsg}</h2>
          <p className="text-zinc-400 mb-8 font-medium capitalize">You completed the {topic?.replace(/-/g, ' ')} quiz.</p>
          
          <div className="text-6xl font-black text-indigo-400 mb-8">{percentage}%</div>
          
          <div className="flex justify-between text-sm font-bold text-zinc-300 mb-8">
            <div className="bg-white/5 px-4 py-3 rounded-xl flex-1 mr-2 text-center">
               <div className="text-xl text-green-400 mb-1">{correctCount}</div>
               <div className="text-[10px] uppercase tracking-widest text-zinc-500">Correct</div>
            </div>
            <div className="bg-white/5 px-4 py-3 rounded-xl flex-1 ml-2 text-center">
               <div className="text-xl text-red-400 mb-1">{questions.length - correctCount}</div>
               <div className="text-[10px] uppercase tracking-widest text-zinc-500">Wrong</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
             <button 
               onClick={() => { setCurrentIndex(0); setUserAnswers({}); setShowScore(false); }}
               className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all text-white active:scale-95 shadow-lg shadow-indigo-600/20"
             >
               Try Again
             </button>
             <button 
               onClick={() => navigate(`/topics/${lang}`)}
               className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all text-zinc-300 active:scale-95"
             >
               Back to Topics
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col p-4 font-['Public_Sans'] overflow-hidden ">
      <div className="max-w-xl mx-auto w-full flex flex-col h-full justify-between ">
        
        
        <div className="flex justify-between items-center py-2">
          <button onClick={() => navigate(`/topics/${lang}`)} className="text-zinc-500 hover:text-white text-[12px] font-bold uppercase tracking-widest flex items-center">
            <ChevronLeft className="mr-1 h-3 w-3" /> Exit Arena
          </button>
          <div className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* Progress & Question Card */}
        <div className="flex-grow flex flex-col justify-start">
          <div className="w-full h-1 bg-zinc-900 rounded-full mb-4">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-[24px] p-5 md:p-6">
            <h2 className="text-base md:text-lg font-bold mb-6 leading-tight text-zinc-100 text-[18px]">{currentQ.question}</h2>

            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((option: string, idx: number) => {
                const isSelected = selectedOption === idx;
                const isCorrectAnswer = (idx + 1) === Number(currentQ.correctAnswer);
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    disabled={isAnswered}
                    className={`flex items-center justify-between p-3 rounded-xl border text-l transition-all duration-200 ${
                      isSelected 
                        ? (idx + 1) === Number(currentQ.correctAnswer) ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
                        : isAnswered && isCorrectAnswer ? 'border-green-500/50 bg-green-500/10' : 'border-white/5 bg-white/5 hover:border-indigo-500/30'
                    }`}
                  >
                    <span className={`font-semibold ${isAnswered && isCorrectAnswer ? 'text-green-400' : 'text-zinc-400'}`}>{option}</span>
                    {isSelected && ( (idx + 1) === Number(currentQ.correctAnswer) ? <CheckCircle2 className="text-green-500 h-4 w-4" /> : <XCircle className="text-red-500 h-4 w-4" /> )}
                  </button>
                );
              })}
            </div>

            
            {isAnswered && (
              <div className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 animate-in fade-in">
                <h4 className="text-indigo-400 font-black uppercase text-[10px] mb-2 pt-5">Explanation</h4>
                <p className="text-zinc-200 text-[18px] md:text-base leading-relaxed font-medium ">{currentQ.explanation}</p>
              </div>
            )}
          </div>
        </div>

        
        <div className="py-4 flex gap-3 mb-24">
          
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 border transition-all ${
              currentIndex === 0 ? 'border-zinc-800 text-zinc-700 cursor-not-allowed' : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
            }`}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

         
          <button 
            onClick={handleNext}
            disabled={!isAnswered}
            className={`flex-[2] py-4 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all ${
              !isAnswered ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/10'
            }`}
          >
            {currentIndex + 1 < questions.length ? "Next" : "Finish"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuizPage;
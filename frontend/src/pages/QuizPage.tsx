import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { ChevronLeft, CheckCircle2, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const QuizPage = () => {
  const { lang, topic } = useParams(); 
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({}); // To store all answers
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/quizzes/${lang}/${topic}`);
        setQuestions(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching quizzes");
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
      navigate('/practice'); 
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) return <div className="text-white p-6 text-xs font-bold uppercase">Loading...</div>;
  if (questions.length === 0) return <div className="text-white p-6">No data found.</div>;

  const currentQ = questions[currentIndex];
  const selectedOption = userAnswers[currentIndex];
  const isAnswered = selectedOption !== undefined;

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

        
        <div className="py-4 flex gap-3 mb-25">
          
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
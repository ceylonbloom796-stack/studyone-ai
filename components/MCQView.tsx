
import React, { useState, useEffect } from 'react';
import { MCQ, Language } from '../types';
import { Trophy, CheckCircle, XCircle, ArrowRight, Brain, Target, Star, Award, Medal, Lightbulb, Info, Sparkles } from 'lucide-react';

interface MCQViewProps {
  mcqs: MCQ[];
  language: Language;
}

const EduBot: React.FC<{ grade: 'novice' | 'learner' | 'scholar' | 'savant' }> = ({ grade }) => {
  return (
    <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
      {/* Aura/Glow */}
      <div className={`absolute inset-0 rounded-full blur-3xl opacity-30 animate-pulse ${
        grade === 'savant' ? 'bg-yellow-400' : 
        grade === 'scholar' ? 'bg-indigo-500' : 
        grade === 'learner' ? 'bg-emerald-500' : 'bg-slate-500'
      }`}></div>

      {/* Floating Animation Wrapper */}
      <div className="relative animate-[float_3s_ease-in-out_infinite]">
        {/* Head */}
        <div className="w-24 h-20 bg-slate-100 rounded-[2rem] border-4 border-slate-300 relative flex flex-col items-center justify-center shadow-xl">
          {/* Eyes */}
          <div className="flex space-x-4 mb-2">
            <div className={`w-3 h-3 rounded-full bg-slate-900 transition-all ${grade === 'novice' ? 'h-1 mt-1' : 'animate-pulse'}`}></div>
            <div className={`w-3 h-3 rounded-full bg-slate-900 transition-all ${grade === 'novice' ? 'h-1 mt-1' : 'animate-pulse'}`}></div>
          </div>
          {/* Mouth */}
          <div className={`w-8 h-1 bg-slate-900 rounded-full ${grade === 'novice' ? 'rotate-12' : grade === 'savant' ? 'w-10 h-3 border-b-4 border-slate-900 bg-transparent rounded-none' : ''}`}></div>
          
          {/* Savant Crown */}
          {grade === 'savant' && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-500 drop-shadow-lg animate-bounce">
              <Trophy className="w-10 h-10 fill-current" />
            </div>
          )}

          {/* Scholar Glasses */}
          {grade === 'scholar' && (
            <div className="absolute top-6 w-full px-2 flex justify-between pointer-events-none">
              <div className="w-8 h-8 border-2 border-slate-800 rounded-full"></div>
              <div className="w-8 h-8 border-2 border-slate-800 rounded-full"></div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="w-20 h-16 bg-slate-200 border-4 border-slate-300 rounded-t-xl mx-auto -mt-1 shadow-lg relative">
          {/* Arms */}
          <div className={`absolute -left-6 top-2 w-6 h-2 bg-slate-300 rounded-full origin-right ${grade === 'learner' ? '-rotate-45' : ''}`}></div>
          <div className={`absolute -right-6 top-2 w-6 h-2 bg-slate-300 rounded-full origin-left ${grade === 'learner' ? 'rotate-45' : ''}`}></div>
          
          {/* Accessory */}
          <div className="absolute inset-0 flex items-center justify-center">
            {grade === 'savant' && <Star className="text-yellow-500 fill-current w-6 h-6 animate-spin" />}
            {grade === 'scholar' && <Award className="text-indigo-500 w-6 h-6" />}
            {grade === 'learner' && <Lightbulb className="text-emerald-500 w-6 h-6" />}
            {grade === 'novice' && <Target className="text-slate-400 w-6 h-6" />}
          </div>
        </div>
      </div>

      {/* Particle Effects */}
      {grade === 'savant' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <Sparkles 
              key={i} 
              className={`absolute text-yellow-400 w-4 h-4 animate-ping`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MCQView: React.FC<MCQViewProps> = ({ mcqs, language }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [animatedPct, setAnimatedPct] = useState(0);

  const t = (en: string, si: string, ta: string) => {
    if (language === 'si') return si;
    if (language === 'ta') return ta;
    return en;
  };

  const handleOption = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    if (idx === mcqs[currentIdx].correctAnswerIndex) setScore(prev => prev + 1);
  };

  const handleNext = () => {
    if (currentIdx < mcqs.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
    }
  };

  // Animation for the final score
  useEffect(() => {
    if (completed) {
      const finalPct = Math.round((score / mcqs.length) * 100);
      const timer = setTimeout(() => {
        let start = 0;
        const duration = 1500;
        const stepTime = Math.abs(Math.floor(duration / finalPct)) || 10;
        const interval = setInterval(() => {
          start += 1;
          setAnimatedPct(start);
          if (start >= finalPct) clearInterval(interval);
        }, stepTime);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [completed, score, mcqs.length]);

  const q = mcqs[currentIdx];

  if (completed) {
    const pct = Math.round((score / mcqs.length) * 100);
    
    // Determine Grade and Theme
    let grade: 'novice' | 'learner' | 'scholar' | 'savant' = 'novice';
    let gradeLabel = t("Novice", "ආරම්භකයා", "தொடக்கநிலை");
    let colorClass = "from-slate-500 to-slate-700";
    let glowClass = "shadow-slate-500/20";

    if (pct >= 90) {
      grade = 'savant';
      gradeLabel = t("Savant", "ප්‍රවීණයා", "மேதை");
      colorClass = "from-yellow-400 to-orange-500";
      glowClass = "shadow-orange-500/40";
    } else if (pct >= 70) {
      grade = 'scholar';
      gradeLabel = t("Scholar", "උගතා", "அறிஞர்");
      colorClass = "from-indigo-500 to-purple-600";
      glowClass = "shadow-indigo-500/30";
    } else if (pct >= 50) {
      grade = 'learner';
      gradeLabel = t("Learner", "ශිෂ්‍යයා", "மாணவர்");
      colorClass = "from-emerald-400 to-teal-600";
      glowClass = "shadow-emerald-500/20";
    }

    return (
      <div className="max-w-4xl mx-auto py-12 animate-in zoom-in-95 duration-700">
        <div className="glass-panel rounded-[3.5rem] p-10 md:p-20 text-center border-white/5 shadow-2xl relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-5`}></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Animated Character & Visual Score */}
            <div className="flex flex-col items-center">
              <EduBot grade={grade} />
              
              <div className="relative w-48 h-48 mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-800" />
                  <circle
                    cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="10" fill="transparent"
                    strokeDasharray={502.6}
                    strokeDashoffset={502.6 - (502.6 * animatedPct) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-100 ease-out"
                    style={{ stroke: 'url(#gradientScore)' }}
                  />
                  <defs>
                    <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#f472b6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white tracking-tighter">{animatedPct}%</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t("Final Score", "අවසන් ලකුණු", "மதிப்பெண்")}</span>
                </div>
              </div>

              <div className={`inline-flex items-center space-x-3 bg-gradient-to-br ${colorClass} px-8 py-4 rounded-[2rem] text-white shadow-2xl ${glowClass} animate-bounce`}>
                <div className="text-center w-full">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{t("Knowledge Rank", "දැනුමේ මට්ටම", "அறிவு நிலை")}</p>
                  <p className="text-2xl font-black leading-none">{gradeLabel}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Details & Actions */}
            <div className="text-left space-y-8">
              <div>
                <h2 className="text-4xl font-black text-white mb-2 leading-tight">
                  {pct >= 70 ? t("Academic Excellence!", "විශිෂ්ට සාමාර්ථයක්!", "சிறந்த தேர்ச்சி!") : t("Quiz Completed", "පරීක්ෂණය අවසන්", "முடிந்தது")}
                </h2>
                <p className="text-slate-400 font-medium">
                  {t(
                    "EduBot is impressed by your dedication to mastering these concepts. Ready for the next level?",
                    "ඔබේ කැපවීම ගැන EduBot සතුටු වෙනවා. ඊළඟ මට්ටමට සූදානම්ද?",
                    "EduBot உங்கள் அர்ப்பணிப்பைக் கண்டு வியக்கிறார். அடுத்த கட்டத்திற்குத் தயாரா?"
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t("Accuracy", "නිරවද්‍යතාවය", "துல்லியம்")}</span>
                  <span className="text-2xl font-black text-emerald-400">{score} / {mcqs.length}</span>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t("Grade", "සාමාර්ථය", "தரம்")}</span>
                  <span className="text-2xl font-black text-indigo-400">{pct >= 90 ? 'A+' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : 'C'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => { setCompleted(false); setCurrentIdx(0); setScore(0); setSelected(null); setShowExplanation(false); setAnimatedPct(0); }}
                  className="flex-1 py-5 bg-white text-slate-950 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all transform active:scale-95 shadow-xl flex items-center justify-center space-x-2"
                >
                  <Target className="w-4 h-4" />
                  <span>{t("Retry Quiz", "නැවත උත්සාහ කරන්න", "மீண்டும் முயற்சி")}</span>
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 py-5 bg-slate-800 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-700 transition-all transform active:scale-95 border border-white/5"
                >
                  {t("Finish Study", "පාඩම අවසන්", "ஆய்வை முடி")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">
            <Target className="w-4 h-4" />
            <span>{t("Recall Challenge", "මතකයේ අභියෝගය", "மீளாய்வு சவால்")}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black text-white">{currentIdx + 1}</span>
            <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden">
               <div className="bg-indigo-500 h-full transition-all duration-700 shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${((currentIdx + 1) / mcqs.length) * 100}%` }} />
            </div>
            <span className="text-slate-600 font-bold text-sm">/ {mcqs.length}</span>
          </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-2xl flex items-center space-x-3">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t("Score", "ලකුණු", "மதிப்பெண்")}</span>
          <span className="text-xl font-black text-emerald-400">{score}</span>
        </div>
      </div>

      <div className="glass-panel rounded-[3rem] p-10 md:p-14 border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] mb-8 transition-all hover:border-white/20 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-[loading_5s_linear_infinite] opacity-30"></div>
        <h3 className="text-2xl md:text-3xl font-black text-white mb-10 leading-[1.3] tracking-tight">
          {q.question}
        </h3>

        <div className="space-y-4">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correctAnswerIndex;
            const isSelected = i === selected;
            
            let variant = "bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10";
            if (selected !== null) {
              if (isCorrect) variant = "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20 scale-[1.02]";
              else if (isSelected) variant = "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20 animate-[shake_0.5s_ease-in-out]";
              else variant = "bg-white/5 border-white/5 text-slate-600 opacity-40";
            }

            return (
              <button 
                key={i} 
                onClick={() => handleOption(i)} 
                disabled={selected !== null} 
                className={`w-full text-left p-6 rounded-[1.5rem] border-2 transition-all duration-300 flex items-center group ${variant}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm mr-6 transition-colors ${selected === i ? 'bg-white/20' : 'bg-white/5 text-slate-500 group-hover:text-white'}`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="flex-1 font-bold text-lg">{opt}</span>
                {selected !== null && isCorrect && <CheckCircle className="w-6 h-6 ml-4 text-white" />}
                {selected !== null && isSelected && !isCorrect && <XCircle className="w-6 h-6 ml-4 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {showExplanation && (
        <div className="animate-in slide-in-from-top-4 duration-700">
          <div className="glass-panel rounded-[2.5rem] border-indigo-500/30 bg-indigo-950/40 p-10 mb-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Lightbulb className="w-24 h-24 text-yellow-400" />
            </div>
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-500/20 p-2.5 rounded-xl">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-black text-indigo-400 uppercase tracking-[0.2em] text-[10px] mb-1">
                  {t("Learning Insight", "ඉගෙනුම් අවබෝධය", "கற்றல் நுண்ணறிவு")}
                </h4>
                <p className="text-white font-black text-lg">
                  {selected === q.correctAnswerIndex 
                    ? t("Brilliant! You're Right.", "විශිෂ්ටයි! ඔබ නිවැරදියි.", "அருமை! நீங்கள் சொன்னது சரி.")
                    : t("Almost there! Here's why...", "තව පොඩ්ඩයි! හේතුව බලමු...", "கிட்டத்தட்ட வந்துவிட்டீர்கள்! இதோ காரணம்...")
                  }
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              <p className="text-slate-300 leading-relaxed font-medium text-lg pl-8 italic">
                "{q.explanation}"
              </p>
            </div>
            
            <div className="mt-8 flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <Info className="w-4 h-4 text-indigo-400" />
              <p className="text-xs font-bold text-slate-400">
                {t("Correct Answer:", "නිවැරදි පිළිතුර:", "சரியான பதில்:")} <span className="text-emerald-400 ml-1">{q.options[q.correctAnswerIndex]}</span>
              </p>
            </div>
          </div>

          <button 
            onClick={handleNext} 
            className="w-full py-6 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl"
          >
            <span>{currentIdx === mcqs.length - 1 ? t('Complete Challenge', 'පරීක්ෂණය අවසන්', 'முடிவுகளைப் பார்க்கவும்') : t('Next Challenge', 'ඊළඟ අභියෝගය', 'அடுத்த வினா')}</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
};

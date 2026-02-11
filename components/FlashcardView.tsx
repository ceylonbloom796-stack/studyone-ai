
import React, { useState } from 'react';
import { Flashcard, Language } from '../types';
// Added CheckSquare to imports
import { ChevronLeft, ChevronRight, HelpCircle, GraduationCap, RefreshCw, CheckSquare } from 'lucide-react';

interface FlashcardViewProps {
  flashcards: Flashcard[];
  language: Language;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({ flashcards, language }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const t = (en: string, si: string, ta: string) => {
    if (language === 'si') return si;
    if (language === 'ta') return ta;
    return en;
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const card = flashcards[currentIndex];

  return (
    <div className="animate-in zoom-in duration-700 flex flex-col items-center py-10">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 text-purple-400 font-black text-[10px] uppercase tracking-widest mb-3">
          <GraduationCap className="w-4 h-4" />
          <span>{t("Memory Optimization", "මතකය වර්ධනය කරමු", "நினைவாற்றல் மேம்பாடு")}</span>
        </div>
        <h2 className="text-4xl font-black text-white mb-2">{t("Concept Mastery", "සංකල්ප අවබෝධය", "கருத்து மேலாண்மை")}</h2>
        <div className="bg-white/5 border border-white/5 px-4 py-1.5 rounded-full inline-block mt-2">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{t("Card", "කාඩ් එක", "அட்டை")} {currentIndex + 1} <span className="text-slate-700">/</span> {flashcards.length}</p>
        </div>
      </div>

      <div 
        className={`relative w-full max-w-2xl aspect-[1.6/1] perspective-1000 cursor-pointer group ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flip-card-inner relative w-full h-full">
          {/* Front */}
          <div className="flip-card-front absolute inset-0 glass-panel rounded-[2.5rem] border-white/10 p-12 flex items-center justify-center text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] group-hover:scale-[1.02] transition-transform duration-500 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-center space-x-2 text-indigo-400/60 font-black text-[10px] uppercase tracking-widest">
                <HelpCircle className="w-4 h-4" />
                <span>{t("Question", "ප්‍රශ්නය", "வினா")}</span>
              </div>
              <p className="text-3xl md:text-4xl font-black text-white leading-tight">
                {card.front}
              </p>
              <div className="flex items-center justify-center space-x-2 text-slate-500 text-xs font-bold pt-8 animate-pulse">
                <RefreshCw className="w-4 h-4" />
                <span>{t("Click to Reveal", "පිළිතුර බලන්න ඔබන්න", "பதிலை பார்க்க அழுத்தவும்")}</span>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="flip-card-back absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-700 p-12 flex items-center justify-center text-center rounded-[2.5rem] text-white shadow-[0_40px_80px_-20px_rgba(79,70,229,0.4)] overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-10"></div>
            <div className="space-y-6 relative z-10">
               <div className="flex items-center justify-center space-x-2 text-white/50 font-black text-[10px] uppercase tracking-widest">
                <CheckSquare className="w-4 h-4 text-white" />
                <span>{t("The Insight", "අවබෝධය", "பதில்")}</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold leading-relaxed tracking-tight">
                {card.back}
              </p>
              <button className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest mt-8 border border-white/10 transition-colors">
                {t("Mastered", "මතකයි", "புரிந்தது")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-12 mt-16">
        <button onClick={handlePrev} className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 border-white/5 transition-all transform active:scale-90 group">
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="flex space-x-2">
          {flashcards.map((_, idx) => (
            <div key={idx} className={`h-2 transition-all duration-500 rounded-full ${currentIndex === idx ? 'w-10 bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'w-2 bg-slate-800'}`} />
          ))}
        </div>

        <button onClick={handleNext} className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 border-white/5 transition-all transform active:scale-90 group">
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

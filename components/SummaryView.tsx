
import React from 'react';
import { Language } from '../types';
// Added Sparkles to imports
import { Quote, BookOpen, Star, Sparkles } from 'lucide-react';

interface SummaryViewProps {
  title: string;
  summary: string;
  language: Language;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ title, summary, language }) => {
  const t = (en: string, si: string, ta: string) => {
    if (language === 'si') return si;
    if (language === 'ta') return ta;
    return en;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="glass-panel rounded-[3rem] overflow-hidden border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-10 py-16 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <BookOpen className="w-64 h-64" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center space-x-2 text-indigo-200 text-xs font-black uppercase tracking-[0.3em] mb-4">
              <Star className="w-3 h-3 fill-current" />
              <span>{t("AI Curated Insight", "AI මගින් සැකසූ අවබෝධය", "AI சுருக்கம்")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">{title}</h1>
            <div className="w-24 h-1.5 bg-indigo-400/50 rounded-full"></div>
          </div>
        </div>
        
        <div className="p-10 md:p-16 bg-slate-900/40 relative">
          <div className="absolute top-12 left-8 opacity-5 text-indigo-500">
            <Quote className="w-32 h-32" />
          </div>
          <div className="prose prose-invert prose-lg max-w-none relative z-10">
            {summary.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-slate-300 text-xl leading-[1.8] mb-10 font-medium tracking-tight last:mb-0 first-letter:text-4xl first-letter:font-black first-letter:text-indigo-400 first-letter:mr-1">
                {paragraph}
              </p>
            ))}
          </div>
          
          <div className="mt-20 flex items-center justify-center space-x-6">
             <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
             <div className="flex items-center space-x-3 text-slate-500 font-black text-[10px] tracking-[0.5em] uppercase">
               <Sparkles className="w-4 h-4 text-indigo-500" />
               <span>{t("Knowledge Consolidated", "දැනුම එක්තැන් කරන ලදී", "அறிவு ஒருங்கிணைக்கப்பட்டது")}</span>
             </div>
             <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

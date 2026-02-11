
import React from 'react';
import { ViewState, Language } from '../types';
import { Layout, Brain, GraduationCap, FileText, Layers, CheckSquare, Plus, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  hasStudySet: boolean;
  onReset: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setView, 
  hasStudySet, 
  onReset,
  language,
  setLanguage
}) => {
  const t = (en: string, si: string, ta: string) => {
    if (language === 'si') return si;
    if (language === 'ta') return ta;
    return en;
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/50 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center space-x-4 cursor-pointer group" 
          onClick={onReset}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
            <Brain className="text-white w-7 h-7" />
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-black text-white leading-none tracking-tight">StudyOne <span className="text-indigo-400">AI</span></h1>
              <div className="h-6 w-px bg-slate-800"></div>
              
              {/* BRANDING SECTION WITH ANIMATION */}
              <div className="brand-sweep-container relative px-3 py-1.5 bg-fuchsia-500/5 rounded-lg border border-fuchsia-500/10 transition-all hover:bg-fuchsia-500/10">
                <div className="brand-sweep-overlay"></div>
                <div className="flex items-center space-x-2.5 animate-brand-glow">
                  <span className="text-xl font-black text-fuchsia-400 leading-none tracking-tight flex items-center">
                    <span className="text-slate-500 font-medium text-[10px] lowercase mr-1">by</span>
                    WebNexlanka
                  </span>
                  <span className="hidden xl:block h-3 w-px bg-fuchsia-500/20"></span>
                  <span className="hidden xl:block text-[9px] font-extrabold text-fuchsia-300/90 uppercase tracking-[0.15em] whitespace-nowrap">
                    elevate your business with us
                  </span>
                  <Sparkles className="w-3 h-3 text-fuchsia-300 animate-pulse" />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1 pl-1">{t("Smart Study Hub", "ස්මාර්ට් අධ්‍යයනය", "ஸ்மார்ட் ஆய்வு")}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Language Toggle */}
          <div className="flex items-center bg-slate-900/50 p-1 rounded-xl border border-white/5">
            {['en', 'si', 'ta'].map((l) => (
              <button 
                key={l}
                onClick={() => setLanguage(l as Language)}
                className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                  language === l 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {l === 'en' ? 'EN' : l === 'si' ? 'සිං' : 'தமி'}
              </button>
            ))}
          </div>

          {hasStudySet && (
            <div className="hidden md:flex items-center space-x-1 glass-panel p-1 rounded-2xl">
              <NavButton 
                active={currentView === 'summary'} 
                onClick={() => setView('summary')}
                label={t("Summary", "සාරාංශය", "සුරුக்கம்")} 
                icon={<FileText className="w-4 h-4" />}
                color="indigo"
              />
              <NavButton 
                active={currentView === 'flashcards'} 
                onClick={() => setView('flashcards')}
                label={t("Flashcards", "කාඩ්පත්", "அட்டை")} 
                icon={<Layers className="w-4 h-4" />}
                color="purple"
              />
              <NavButton 
                active={currentView === 'mcqs'} 
                onClick={() => setView('mcqs')}
                label={t("Quizzes", "ප්‍රශ්න පත්තර", "வினாடி-வினா")} 
                icon={<CheckSquare className="w-4 h-4" />}
                color="emerald"
              />
            </div>
          )}

          <div>
            {hasStudySet ? (
              <button 
                onClick={onReset}
                className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-700/50 text-white border border-white/5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t("New Study", "අලුත් පාඩමක්", "புதிய ஆய்வு")}</span>
              </button>
            ) : (
              <div className="bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-500/20 hidden sm:block">
                {t("Ready to Learn?", "සූදානම්ද?", "தயாரா?")}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile progress-style nav */}
      {hasStudySet && (
        <div className="md:hidden flex items-center justify-around bg-slate-950/80 border-t border-white/5 py-3">
           <NavButton 
              active={currentView === 'summary'} 
              onClick={() => setView('summary')}
              label="" icon={<FileText className="w-5 h-5" />} color="indigo"
            />
            <NavButton 
              active={currentView === 'flashcards'} 
              onClick={() => setView('flashcards')}
              label="" icon={<Layers className="w-5 h-5" />} color="purple"
            />
            <NavButton 
              active={currentView === 'mcqs'} 
              onClick={() => setView('mcqs')}
              label="" icon={<CheckSquare className="w-5 h-5" />} color="emerald"
            />
        </div>
      )}
    </nav>
  );
};

const NavButton: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  label: string; 
  icon: React.ReactNode;
  color: 'indigo' | 'purple' | 'emerald'
}> = ({ active, onClick, label, icon, color }) => {
  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-500',
    purple: 'from-purple-500 to-purple-600 text-purple-500',
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-500'
  };

  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-2.5 rounded-xl flex items-center space-x-2.5 text-sm font-bold transition-all duration-300 ${
        active 
          ? `bg-gradient-to-br ${colorMap[color].split(' text-')[0]} text-white shadow-lg` 
          : `text-slate-400 hover:text-slate-200 hover:bg-white/5`
      }`}
    >
      <span className={active ? 'text-white' : colorMap[color].split(' text-')[1]}>{icon}</span>
      {label && <span>{label}</span>}
      {active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>}
    </button>
  );
};

import React, { useState } from 'react';
import { ViewState, StudySet, Language } from './types';
import { generateStudySet } from './services/geminiService';
import { Navbar } from './components/Navbar';
import { UploadSection } from './components/UploadSection';
import { SummaryView } from './components/SummaryView';
import { FlashcardView } from './components/FlashcardView';
import { MCQView } from './components/MCQView';
import { Sparkles, BrainCircuit, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('upload');
  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  const handleProcessContent = async (content: any, numMcqs: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateStudySet(content, language, numMcqs);
      setStudySet(result);
      setView('summary');
    } catch (err: any) {
      console.error(err);
      let errorMsg = "Failed to generate study materials. Please try a different document or check your API key.";
      if (language === 'si') errorMsg = "වැඩේ පොඩ්ඩක් වැරදුනා. ආයෙත් ට්‍රයි එකක් දීලා බලමුද?";
      if (language === 'ta') errorMsg = "தகவலை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStudySet(null);
    setView('upload');
    setError(null);
  };

  const t = (en: string, si: string, ta: string) => {
    if (language === 'si') return si;
    if (language === 'ta') return ta;
    return en;
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-200">
      <Navbar 
        currentView={view} 
        setView={setView} 
        hasStudySet={!!studySet} 
        onReset={handleReset}
        language={language}
        setLanguage={setLanguage}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl relative">
        {loading && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center">
            <div className="relative p-12 rounded-[2.5rem] flex flex-col items-center space-y-6 max-w-md text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none"></div>
              
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <BrainCircuit className="absolute inset-0 m-auto w-10 h-10 text-indigo-400 animate-pulse" />
              </div>
              
              <div className="space-y-2 relative">
                <h2 className="text-2xl font-black text-white flex items-center justify-center space-x-2">
                  <span>{t("AI is Synthesizing", "AI එක හදනවා", "AI உருவாக்குகிறது")}</span>
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-bounce" />
                </h2>
                <p className="text-slate-400 font-medium">
                  {t(
                    "Transforming your notes into a powerful study experience...", 
                    "ඔයාගේ සටහන් ඉගෙනුම් මෙවලම් බවට පත් කරනවා...",
                    "உங்கள் குறிப்புகளைக் கற்றல் கருவிகளாக மாற்றுகிறது..."
                  )}
                </p>
              </div>
              
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-2/3 animate-[loading_2s_infinite]"></div>
              </div>
            </div>
          </div>
        )}

        <div className="transition-all duration-700 ease-in-out">
          {error && (
            <div className="mb-8 glass-panel border-rose-500/30 bg-rose-500/5 p-5 rounded-2xl flex items-start space-x-4 animate-in slide-in-from-top-4">
              <div className="bg-rose-500 p-2 rounded-xl text-white">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-rose-400 font-bold">{t("Something went wrong", "වැඩේ වැරදුනා", "ஏதோ தவறு நடந்துவிட்டது")}</p>
                <p className="text-rose-400/80 text-sm">{error}</p>
              </div>
            </div>
          )}

          {view === 'upload' && (
            <UploadSection onProcess={handleProcessContent} language={language} />
          )}

          {studySet && (
            <div className="space-y-8 animate-in fade-in duration-1000">
              {view === 'summary' && (
                <SummaryView summary={studySet.summary} title={studySet.title} language={language} />
              )}

              {view === 'flashcards' && (
                <FlashcardView flashcards={studySet.flashcards} language={language} />
              )}

              {view === 'mcqs' && (
                <MCQView mcqs={studySet.mcqs} language={language} />
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 border-t border-slate-800/50 text-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-4 font-black text-xl">
               <span className="text-white">StudyOne AI</span>
               <span className="text-slate-700">|</span>
               <div className="brand-sweep-container relative px-5 py-2 rounded-xl border border-fuchsia-500/10 bg-fuchsia-500/5">
                 <div className="brand-sweep-overlay"></div>
                 <div className="text-fuchsia-400 animate-brand-glow flex flex-col md:flex-row items-center md:space-x-3">
                   <span className="font-black">WebNexlanka</span>
                   <span className="hidden md:inline-block h-3 w-px bg-fuchsia-500/20"></span>
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-300/80">
                     elevate your business with us
                   </span>
                   <Sparkles className="w-4 h-4 ml-2 text-fuchsia-300 animate-pulse hidden md:block" />
                 </div>
               </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
            <BrainCircuit className="w-3 h-3" />
            <span>&copy; {new Date().getFullYear()} {t("Forging Knowledge through Intelligence", "බුද්ධියෙන් දැනුම නිර්මාණය කරමු", "அறிவால் அறிவை உருவாக்குவோம்")}</span>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default App;
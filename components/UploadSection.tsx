
import React, { useState, useRef, useEffect } from 'react';
import { Language, SearchSource } from '../types';
import { 
  FileText, Upload, CheckCircle2, Mic, MicOff, Sparkles, 
  BookOpen, Layers, Target, Search, Globe, Library, 
  FileDown, BookMarked, ArrowRight, Book
} from 'lucide-react';
import { searchSources } from '../services/geminiService';

interface UploadSectionProps {
  onProcess: (content: any, numMcqs: number) => void;
  language: Language;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onProcess, language }) => {
  const [mode, setMode] = useState<'upload' | 'search'>('upload');
  const [text, setText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchSource[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [images, setImages] = useState<{ data: string; mimeType: string }[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [numMcqs, setNumMcqs] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const recognitionRef = useRef<any>(null);
  const preMicTextRef = useRef<string>('');

  const t = (en: string, si: string, ta: string) => {
    if (language === 'si') return si;
    if (language === 'ta') return ta;
    return en;
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += transcript;
          else interimTranscript += transcript;
        }
        const currentSessionText = (finalTranscript || interimTranscript) ? 
          (preMicTextRef.current + (preMicTextRef.current ? ' ' : '') + finalTranscript + interimTranscript) 
          : preMicTextRef.current;
        setText(currentSessionText);
      };
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        preMicTextRef.current = text;
      };
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [text, language]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchSources(searchQuery, language);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStudySource = (source: SearchSource) => {
    onProcess({ topic: source.title, sourceUri: source.uri }, numMcqs);
  };

  const toggleVoiceTyping = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else {
      preMicTextRef.current = text;
      recognitionRef.current.lang = { 'en': 'en-US', 'si': 'si-LK', 'ta': 'ta-LK' }[language];
      recognitionRef.current.start();
    }
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    setImages([]);
    setText('');
    
    if (file.type === 'application/pdf') {
      setIsParsing(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);
        // @ts-ignore
        const loadingTask = window.pdfjsLib.getDocument({ data: typedArray });
        const pdf = await loadingTask.promise;
        let extractedText = '';
        const pageImages: any[] = [];
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            pageImages.push({ data: canvas.toDataURL('image/jpeg', 0.8).split(',')[1], mimeType: 'image/jpeg' });
          }
        }
        if (extractedText.trim().length < 200 && pageImages.length > 0) {
          setImages(pageImages);
          setText(`[Document Image Mode: ${pageImages.length} pages captured]`);
        } else {
          setText(extractedText);
        }
      } catch (err: any) {
        console.error(err);
      } finally { setIsParsing(false); }
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        setImages([{ data: base64, mimeType: file.type }]);
        setText(`[Image Capture: ${file.name}]`);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setText(e.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    if (images.length > 0) {
      onProcess(images, numMcqs);
    } else if (text.trim().length >= 50) {
      onProcess(text, numMcqs);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center mb-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-32 h-32 bg-indigo-500/10 blur-[80px] pointer-events-none"></div>
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
          <Sparkles className="w-3 h-3" />
          <span>{t("Empowered by Intelligence", "බුද්ධියෙන් බල ගැන්වේ", "அறிவால் இயக்கப்படுகிறது")}</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
          {t("Master Any", "ඕනෑම දෙයක්", "எதையும்")} <br />
          <span className="gradient-text">{t("Subject Instantly", "වහාම ඉගෙනගන්න", "உடனடியாக கற்க")}</span>
        </h1>
        
        {/* MODE TOGGLE */}
        <div className="flex items-center justify-center p-1 bg-slate-900/60 border border-white/5 rounded-2xl w-fit mx-auto mb-8">
           <button 
             onClick={() => setMode('upload')}
             className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${mode === 'upload' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Upload className="w-3.5 h-3.5" />
             <span>{t("Upload Files", "පැටවීම", "பதிவேற்றம்")}</span>
           </button>
           <button 
             onClick={() => setMode('search')}
             className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${mode === 'search' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Search className="w-3.5 h-3.5" />
             <span>{t("Global Discovery", "සොයාගන්න", "கண்டுபிடிப்பு")}</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          {mode === 'upload' ? (
            <div className="glass-panel rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-focus-within:opacity-10 transition-opacity">
                <BookOpen className="w-48 h-48 text-indigo-500" />
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {images.length > 0 ? t("Visual Insights", "දෘශ්‍ය අවබෝධය", "காட்சி நுண்ணறிவு") : t("Knowledge Input", "දැනුම ඇතුළත් කිරීම", "அறிவு உள்ளீடு")}
                  </label>
                </div>
                {fileName && (
                   <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-sm animate-in zoom-in">
                    <CheckCircle2 className="w-3 h-3 mr-2" />
                    {fileName}
                  </span>
                )}
              </div>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setFileName(null);
                    setImages([]);
                    preMicTextRef.current = e.target.value;
                  }}
                  readOnly={images.length > 0}
                  placeholder={t("Paste your notes here or use the mic...", "සටහන් මෙතනට දාන්න...", "குறிப்புகளை ஒட்டவும்...")}
                  className="w-full h-[450px] p-8 rounded-3xl bg-slate-900/40 border border-white/5 focus:bg-slate-900/60 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none text-lg font-medium leading-relaxed text-slate-200 placeholder:text-slate-600 shadow-inner"
                />
                <div className="absolute bottom-6 right-6 flex items-center space-x-3">
                  {isListening && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full">
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{t("Live Listening", "අහගෙන ඉන්නේ", "கேட்கிறது")}</span>
                    </div>
                  )}
                  <button
                    onClick={toggleVoiceTyping}
                    disabled={images.length > 0}
                    className={`p-5 rounded-2xl shadow-2xl transition-all transform hover:scale-110 active:scale-95 ${isListening ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/30'}`}
                  >
                    {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.2rem] opacity-20 group-focus-within:opacity-50 blur transition-opacity"></div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("Search for books, academic papers or topics...", "පොත් හෝ මාතෘකා සොයන්න...", "புத்தகங்கள் அல்லது தலைப்புகளைத் தேடுங்கள்...")}
                  className="w-full p-8 pr-24 rounded-[2rem] bg-slate-900/80 border border-white/10 text-xl font-bold text-white focus:border-indigo-500/50 transition-all outline-none shadow-2xl relative z-10"
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-4 top-4 bottom-4 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all flex items-center space-x-2 active:scale-95 z-20"
                >
                  {isSearching ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Search className="w-4 h-4" />}
                  <span>{t("Search", "සොයන්න", "தேடு")}</span>
                </button>
              </form>

              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {searchResults.map((res, i) => (
                    <div key={i} className="glass-panel p-8 rounded-[2.5rem] border-white/5 hover:border-indigo-500/30 transition-all group flex flex-col justify-between h-full relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                         <Library className="w-40 h-40 text-indigo-400" />
                      </div>
                      
                      <div className="relative">
                        <div className="flex items-center space-x-2 mb-4">
                           <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                             <Book className="w-4 h-4" />
                           </div>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] truncate max-w-[120px]">
                             {new URL(res.uri).hostname}
                           </span>
                        </div>
                        
                        <h4 className="text-xl font-black text-white mb-3 line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">
                          {res.title}
                        </h4>
                        <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed font-medium mb-6">
                          {res.snippet}
                        </p>
                      </div>
                      
                      <div className="flex flex-col space-y-3 relative">
                        <button 
                          onClick={() => handleStudySource(res)}
                          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center space-x-2 active:scale-95"
                        >
                          <BookMarked className="w-4 h-4" />
                          <span>{t("Study Now", "දැන් ඉගෙනගන්න", "இப்போதே படிக்கவும்")}</span>
                        </button>
                        <a 
                          href={res.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-4 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/5 flex items-center justify-center space-x-2"
                        >
                          <FileDown className="w-4 h-4" />
                          <span>{t("Open Document", "ගොනුව බලන්න", "மூலத்தைப் பார்க்கவும்")}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isSearching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass-panel h-72 rounded-[2.5rem] border-white/5 shimmer opacity-20"></div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 glass-panel rounded-[3rem] border-white/5 relative overflow-hidden">
                   <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>
                   <div className="bg-indigo-500/10 p-10 rounded-[2.5rem] relative">
                     <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>
                     <Library className="w-20 h-20 text-indigo-400 relative z-10" />
                   </div>
                   <div className="relative z-10 px-8">
                     <h3 className="text-3xl font-black text-white mb-3">{t("Global Library Discovery", "ලොව පුරා දැනුම සොයන්න", "உலகளாவிய நூலகம்")}</h3>
                     <p className="text-slate-500 max-w-sm mx-auto font-medium text-lg leading-relaxed">
                       {t("Find any academic PDF or textbook online. EduBot will analyze it instantly for your study set.", "මාතෘකාවක් දෙන්න, EduBot ඔබට හොඳම පීඩීඑෆ් සහ පොත් සොයා දෙයි.", "உங்கள் பாடத்தைத் தேடுங்கள், எடுபொட் சிறந்த புத்தகங்களைக் கண்டுபிடிக்கும்.")}
                     </p>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          {mode === 'upload' && (
            <div 
              onDragOver={(e) => {e.preventDefault(); setIsDragging(true);}}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]);}}
              className={`relative overflow-hidden rounded-[2.5rem] p-10 transition-all duration-500 border-2 border-dashed flex flex-col items-center text-center group min-h-[300px] justify-center ${
                isDragging ? 'bg-indigo-500/10 border-indigo-400 scale-[1.02] shadow-[0_0_50px_rgba(79,70,229,0.2)]' : 'bg-slate-900/30 border-white/10 hover:border-indigo-500/30'
              }`}
            >
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 ${isDragging ? 'bg-indigo-500 text-white scale-110 rotate-3' : 'bg-slate-800 text-indigo-400 group-hover:scale-110 group-hover:-rotate-3'}`}>
                {isParsing ? <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div> : <Upload className="w-10 h-10" />}
              </div>
              <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                {isParsing ? t("Analyzing...", "විශ්ලේෂණය කරනවා", "ஆய்வு செய்கிறது") : t("Drop Files", "PDF හෝ පින්තූරයක් දාන්න", "PDF அல்லது படத்தை இழுக்கவும்")}
              </h3>
              <p className="text-slate-500 text-sm font-medium mb-8">{t("Up to 10 pages, scanned or text", "ස්කෑන් කල PDF ද සහය දක්වයි", "ஸ்கேன் செய்தவையும் ஆதரிக்கப்படும்")}</p>
              <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all text-sm active:scale-95">{t("Browse Files", "ගොනු තෝරන්න", "தேர்ந்தெடுக்கவும்")}</button>
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} className="hidden" accept=".pdf,.txt,.png,.jpg,.jpeg" />
            </div>
          )}

          <div className="glass-panel rounded-[2.5rem] p-10 border-white/5 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white flex items-center space-x-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  <span>{t("Study Level", "සැකසුම්", "அமைப்பு")}</span>
                </h3>
                <div className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-xs font-black">{numMcqs} {t("Items", "ප්‍රශ්න", "வினாக்கள்")}</div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  <span>{t("Light", "අඩු", "குறைவு")}</span>
                  <span>{t("Intense", "සම්පූර්ණ", "முழுமையான")}</span>
                </div>
                <input type="range" min="1" max="20" value={numMcqs} onChange={(e) => setNumMcqs(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all shadow-[0_0_15px_rgba(79,70,229,0.1)]" />
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                   <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400"><FileText className="w-4 h-4" /></div>
                   <span className="text-xs font-bold text-slate-300 tracking-tight">{t("AI Summarization", "සාරාංශ කිරීම", "சுருக்கம்")}</span>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                   <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><Layers className="w-4 h-4" /></div>
                   <span className="text-xs font-bold text-slate-300 tracking-tight">{t("Dynamic Flashcards", "කාඩ්පත්", "அட்டை")}</span>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                   <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400"><Target className="w-4 h-4" /></div>
                   <span className="text-xs font-bold text-slate-300 tracking-tight">{t("Targeted Quiz", "ඉලක්කගත පරීක්ෂණ", "இலக்கு வினாடி-வினா")}</span>
                </div>
              </div>
            </div>

            {mode === 'upload' && (
              <button
                onClick={handleSubmit}
                disabled={isParsing || (text.length < 50 && images.length === 0)}
                className={`w-full py-5 rounded-2xl font-black transition-all transform active:scale-95 shadow-2xl flex items-center justify-center space-x-3 ${(text.length >= 50 || images.length > 0) ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-indigo-500/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed grayscale'}`}
              >
                <Sparkles className="w-5 h-5" />
                <span className="uppercase tracking-widest text-sm">{t("Start Learning", "ඉගෙනීම ආරම්භ කරමු", "கற்கத் தொடங்குங்கள்")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

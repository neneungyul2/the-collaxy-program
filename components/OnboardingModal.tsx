import React, { useState } from 'react';
import { DifficultyLevel, Language } from '../types';
import { Rocket, BookOpen, User, Sparkles, Loader2, Globe } from 'lucide-react';
import { UI_TEXT } from '../constants';

interface OnboardingModalProps {
  onStart: (mode: 'CUSTOM' | 'RECOMMEND', level: DifficultyLevel, customWord?: string) => void;
  isLoading: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onStart, isLoading, language, onLanguageChange }) => {
  const [activeTab, setActiveTab] = useState<'CUSTOM' | 'RECOMMEND'>('CUSTOM');
  const [customWord, setCustomWord] = useState('');
  const [level, setLevel] = useState<DifficultyLevel | ''>('');

  const t = UI_TEXT[language];

  const handleStart = () => {
    // Default to NATIVE if level is not selected in Custom mode
    const selectedLevel = level || 'NATIVE';
    onStart(activeTab, selectedLevel, customWord);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl bg-space-800 border-2 border-space-700 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left Panel: Visual */}
        <div className="md:w-5/12 bg-space-900 p-10 flex flex-col justify-between border-r border-space-700 relative overflow-hidden group">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-neon-cyan/20 via-transparent to-transparent opacity-50 pointer-events-none"></div>
           <div className="relative z-10">
             <h1 className="font-display font-black text-5xl lg:text-6xl text-white mb-3 tracking-widest leading-none">
               {t.APP_TITLE}<br/><span className="text-neon-cyan">{t.APP_SUBTITLE}</span>
             </h1>
             <p className="text-gray-500 text-sm uppercase tracking-[0.3em] font-bold">{t.ONBOARD_TITLE}</p>
           </div>
           
           <div className="relative z-10 space-y-8 mt-10">
              <div className="flex gap-5">
                 <div className="w-14 h-14 rounded-full bg-space-800 border border-space-600 flex items-center justify-center shrink-0 shadow-lg">
                    <Globe className="w-7 h-7 text-neon-purple" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-white uppercase tracking-wider">{t.ONBOARD_SCOUT_TITLE}</h3>
                   <p className="text-base text-gray-400 mt-1 leading-relaxed">{t.ONBOARD_SCOUT_DESC}</p>
                 </div>
              </div>
              <div className="flex gap-5">
                 <div className="w-14 h-14 rounded-full bg-space-800 border border-space-600 flex items-center justify-center shrink-0 shadow-lg">
                    <Rocket className="w-7 h-7 text-neon-gold" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-white uppercase tracking-wider">{t.ONBOARD_DOCK_TITLE}</h3>
                   <p className="text-base text-gray-400 mt-1 leading-relaxed">{t.ONBOARD_DOCK_DESC}</p>
                 </div>
              </div>
           </div>

           {/* Initial Language Toggle */}
           <div className="relative z-10 mt-8 flex gap-2">
             <button 
               onClick={() => onLanguageChange('EN')}
               className={`px-4 py-2 rounded text-sm font-bold border ${language === 'EN' ? 'border-neon-cyan text-neon-cyan' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}
             >
               EN
             </button>
             <button 
               onClick={() => onLanguageChange('KO')}
               className={`px-4 py-2 rounded text-sm font-bold border ${language === 'KO' ? 'border-neon-cyan text-neon-cyan' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}
             >
               한국어
             </button>
           </div>
        </div>

        {/* Right Panel: Form */}
        <div className="md:w-7/12 p-10 flex flex-col bg-space-800/50">
          
          {/* Tabs */}
          <div className="flex gap-6 mb-10 border-b border-space-700 pb-5">
             <button 
               onClick={() => setActiveTab('CUSTOM')}
               className={`flex items-center gap-2 pb-2 text-base font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'CUSTOM' ? 'text-white border-neon-cyan' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
             >
               <User className="w-6 h-6" />
               {t.TAB_MANUAL}
             </button>
             <button 
               onClick={() => setActiveTab('RECOMMEND')}
               className={`flex items-center gap-2 pb-2 text-base font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'RECOMMEND' ? 'text-white border-neon-cyan' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
             >
               <Sparkles className="w-6 h-6" />
               {t.TAB_AUTO}
             </button>
          </div>

          <div className="flex-1 space-y-8">
            
            {/* Level Selector */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-neon-cyan uppercase tracking-widest">{t.SELECT_DIFFICULTY}</label>
              <div className="grid grid-cols-2 gap-4">
                 {(['ELEMENTARY', 'MIDDLE', 'HIGH', 'NATIVE'] as DifficultyLevel[]).map((l) => (
                   <button
                     key={l}
                     onClick={() => setLevel(l)}
                     className={`py-4 px-5 rounded-xl text-base font-mono border transition-all text-left flex items-center justify-between group
                       ${level === l 
                         ? 'bg-neon-cyan/10 border-neon-cyan text-white shadow-[0_0_15px_rgba(0,243,255,0.1)]' 
                         : 'bg-space-900 border-space-700 text-gray-500 hover:border-gray-500 hover:bg-space-800'
                       }
                     `}
                   >
                     <span>{l}</span>
                     {level === l && <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan animate-pulse" />}
                   </button>
                 ))}
              </div>
            </div>

            {/* Custom Input */}
            {activeTab === 'CUSTOM' && (
              <div className="space-y-4 animate-fadeIn">
                <label className="text-sm font-bold text-neon-cyan uppercase tracking-widest">{t.PLANET_NAME_LABEL}</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={customWord}
                    onChange={(e) => setCustomWord(e.target.value)}
                    placeholder={t.PLANET_PLACEHOLDER}
                    className="w-full bg-space-900 border border-space-700 rounded-xl p-5 pl-12 text-xl text-white focus:outline-none focus:border-neon-cyan transition-colors"
                  />
                  <BookOpen className="absolute left-4 top-5 w-6 h-6 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
                </div>
              </div>
            )}

            {/* Recommendation Info */}
            {activeTab === 'RECOMMEND' && (
              <div className="p-5 bg-space-900/50 border border-space-700 rounded-xl animate-fadeIn flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-neon-gold mt-0.5" />
                <p className="text-base text-gray-300 leading-relaxed">
                  {t.AUTO_DESC}
                </p>
              </div>
            )}

          </div>

          <div className="mt-10">
            <button
              onClick={handleStart}
              disabled={isLoading || (activeTab === 'CUSTOM' && !customWord.trim()) || (activeTab === 'RECOMMEND' && !level)}
              className="w-full py-5 bg-white text-black font-display font-black text-2xl tracking-widest rounded-xl hover:bg-neon-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : t.BTN_LAUNCH}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
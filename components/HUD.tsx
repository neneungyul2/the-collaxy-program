import React from 'react';
import { Target, Activity, Share2, Eye, EyeOff, Globe, Languages } from 'lucide-react';
import { LabelRevealMode, Language, LogEntry } from '../types';
import { UI_TEXT } from '../constants';

interface HUDProps {
  stats: {
    discovered: number;
    mastered: number;
    connections: number;
  };
  logs: LogEntry[];
  revealMode: LabelRevealMode;
  onToggleRevealMode: (mode: LabelRevealMode) => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
}

const HUD: React.FC<HUDProps> = ({ stats, logs, revealMode, onToggleRevealMode, language, onToggleLanguage }) => {
  const t = UI_TEXT[language];

  return (
    <div className="absolute left-4 top-4 bottom-4 w-96 flex flex-col gap-4 pointer-events-none z-10">
      
      {/* Title Card */}
      <div className="bg-space-800/80 backdrop-blur-md border border-space-700 p-5 rounded-2xl pointer-events-auto shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h1 className="font-display font-black text-3xl text-white tracking-widest leading-none">
          {t.APP_TITLE}<br/>
          <span className="text-neon-cyan">{t.APP_SUBTITLE}</span>
        </h1>
      </div>

      {/* Stats */}
      <div className="bg-space-800/80 backdrop-blur-md border border-space-700 p-5 rounded-2xl space-y-3 pointer-events-auto shadow-lg">
        <div className="flex items-center justify-between group">
           <div className="flex items-center gap-3 text-gray-400 group-hover:text-neon-cyan transition-colors">
             <Globe className="w-5 h-5" />
             <span className="text-sm font-bold uppercase tracking-wider">{t.STATS_DISCOVERED}</span>
           </div>
           <span className="font-mono text-white text-xl">{stats.discovered}</span>
        </div>
        <div className="flex items-center justify-between group">
           <div className="flex items-center gap-3 text-gray-400 group-hover:text-neon-gold transition-colors">
             <Activity className="w-5 h-5" />
             <span className="text-sm font-bold uppercase tracking-wider">{t.STATS_TERRAFORMED}</span>
           </div>
           <span className="font-mono text-neon-gold text-xl">{stats.mastered}</span>
        </div>
         <div className="flex items-center justify-between group">
           <div className="flex items-center gap-3 text-gray-400 group-hover:text-neon-purple transition-colors">
             <Share2 className="w-5 h-5" />
             <span className="text-sm font-bold uppercase tracking-wider">{t.STATS_CONNECTIONS}</span>
           </div>
           <span className="font-mono text-neon-purple text-xl">{stats.connections}</span>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-space-800/80 backdrop-blur-md border border-space-700 p-5 rounded-2xl pointer-events-auto shadow-lg flex flex-col gap-4">
        {/* View Mode */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            {t.SCANNER_CONFIG}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleRevealMode('FIRST_LETTER')}
              className={`flex-1 py-2 px-2 text-xs font-bold uppercase tracking-wider border rounded-lg transition-all flex items-center justify-center gap-2
                ${revealMode === 'FIRST_LETTER' 
                  ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan' 
                  : 'bg-space-900 border-space-700 text-gray-500 hover:border-gray-400'
                }`}
            >
              <Eye className="w-4 h-4" />
              <span>{t.MODE_HINT}</span>
            </button>
            <button
              onClick={() => onToggleRevealMode('HIDDEN')}
              className={`flex-1 py-2 px-2 text-xs font-bold uppercase tracking-wider border rounded-lg transition-all flex items-center justify-center gap-2
                ${revealMode === 'HIDDEN' 
                  ? 'bg-neon-purple/10 border-neon-purple text-neon-purple' 
                  : 'bg-space-900 border-space-700 text-gray-500 hover:border-gray-400'
                }`}
            >
              <EyeOff className="w-4 h-4" />
              <span>{t.MODE_BLIND}</span>
            </button>
          </div>
        </div>

        {/* Language Toggle */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            {t.LANG_SETTING}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleLanguage('EN')}
              className={`flex-1 py-2 px-2 text-xs font-bold uppercase tracking-wider border rounded-lg transition-all flex items-center justify-center gap-2
                ${language === 'EN' 
                  ? 'bg-neon-gold/10 border-neon-gold text-neon-gold' 
                  : 'bg-space-900 border-space-700 text-gray-500 hover:border-gray-400'
                }`}
            >
              <span>ENGLISH</span>
            </button>
            <button
              onClick={() => onToggleLanguage('KO')}
              className={`flex-1 py-2 px-2 text-xs font-bold uppercase tracking-wider border rounded-lg transition-all flex items-center justify-center gap-2
                ${language === 'KO' 
                  ? 'bg-neon-gold/10 border-neon-gold text-neon-gold' 
                  : 'bg-space-900 border-space-700 text-gray-500 hover:border-gray-400'
                }`}
            >
              <span>한국어</span>
            </button>
          </div>
        </div>
      </div>

       {/* Legend */}
      <div className="bg-space-800/80 backdrop-blur-md border border-space-700 p-5 rounded-2xl pointer-events-auto shadow-lg">
         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            {t.LEGEND_TITLE}
         </h3>
         <div className="grid grid-cols-2 gap-y-2 gap-x-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-white to-amber-600 border border-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
              <span className="text-xs text-gray-300">{t.LEGEND_MASTERED}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500 border border-cyan-400"></div>
              <span className="text-xs text-gray-300">{t.LEGEND_NOUN}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500 border border-pink-400"></div>
              <span className="text-xs text-gray-300">{t.LEGEND_VERB}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500 border border-violet-400"></div>
              <span className="text-xs text-gray-300">{t.LEGEND_ADJ}</span>
            </div>
             <div className="flex items-center gap-2 col-span-2">
              <div className="w-3 h-3 rounded-full bg-gray-700 border border-gray-600"></div>
              <span className="text-xs text-gray-400 italic">{t.LEGEND_UNKNOWN}</span>
            </div>
         </div>
      </div>

      {/* Action Log */}
      <div className="flex-1 bg-space-800/80 backdrop-blur-md border border-space-700 p-5 rounded-2xl overflow-hidden flex flex-col pointer-events-auto shadow-lg relative min-h-[150px]">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-gold opacity-50"></div>
         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-space-700">{t.MISSION_LOG}</h3>
         <div className="flex-1 overflow-y-auto space-y-3 pr-2 font-mono scrollbar-thin">
            {logs.length === 0 && <span className="text-gray-500 text-sm italic">{t.LOG_WAITING}</span>}
            {logs.map((log, i) => (
              <div key={i} className="text-sm border-l-2 border-space-600 pl-3 py-1 text-gray-400 hover:text-white transition-colors">
                 <span className="text-neon-cyan opacity-50 text-[10px] mr-2 block mb-0.5">
                    {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                 </span>
                 <span className="leading-snug block">
                   {log.prefix}{t[log.key as keyof typeof t] || log.key}{log.suffix}
                 </span>
              </div>
            ))}
            <div id="log-end" />
         </div>
      </div>

    </div>
  );
};

export default HUD;
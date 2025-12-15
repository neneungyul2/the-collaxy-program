import React, { useState, useEffect } from 'react';
import { BattleScenario, LabelRevealMode, Language } from '../types';
import { validateAnswer } from '../services/geminiService';
import { Disc, Brain, X, Check, Loader2, Lightbulb, Satellite, Radio, ShieldAlert } from 'lucide-react';
import { UI_TEXT } from '../constants';

interface BattleModalProps {
  scenario: BattleScenario | null;
  onComplete: (success: boolean) => void;
  onClose: () => void;
  sourceLabel: string;
  revealMode: LabelRevealMode;
  language: Language;
}

const MAX_ATTEMPTS = 3;

const BattleModal: React.FC<BattleModalProps> = ({ scenario, onComplete, onClose, sourceLabel, revealMode, language }) => {
  const [input, setInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const t = UI_TEXT[language];

  useEffect(() => {
    // Reset state on new scenario
    setInput('');
    setFeedback(null);
    setResult(null);
    setShowHint(false);
    setAttempts(0);
  }, [scenario]);

  if (!scenario) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsValidating(true);
    // CHANGED: Passed language to validateAnswer
    const validation = await validateAnswer(input, scenario.contextSentence, scenario.correctAnswer, language);
    setIsValidating(false);

    if (validation.isCorrect) {
      setFeedback(validation.feedback);
      setResult('success');
      setTimeout(() => {
        onComplete(true);
      }, 2000);
    } else {
      // Handle Failure
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      // PROGRESSIVE HINTING LOGIC
      if (newAttempts === 1) {
        setShowHint(true); // 1st Fail: Auto-reveal the text hint
      }
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setResult('fail');
        setFeedback("Maximum attempts exceeded. Signal lost.");
        setTimeout(() => {
          onComplete(false); // Notify failure
        }, 2500);
      } else {
        setFeedback(`${validation.feedback} (${MAX_ATTEMPTS - newAttempts} attempts remaining)`);
      }
    }
  };

  const parts = scenario.contextSentence.split('_____');
  const attemptsLeft = MAX_ATTEMPTS - attempts;

  // Helper for structural hint (Attempt 2)
  const getPartialReveal = (word: string) => {
    if (word.length <= 2) return word.split('').join(' ');
    const first = word.charAt(0);
    const last = word.charAt(word.length - 1);
    const middle = Array(word.length - 2).fill('_').join(' ');
    return `${first} ${middle} ${last}`.toUpperCase();
  };

  // Helper to determine what to show in the blank
  const getBlankContent = () => {
    if (input) return input;
    if (revealMode === 'FIRST_LETTER' && scenario) {
      // If hint mode is on, show first letter + dots
      return scenario.targetWord.charAt(0).toUpperCase() + "...";
    }
    return "?";
  };

  // Helper for input placeholder
  const getPlaceholder = () => {
    if (result === 'fail') return t.PLACEHOLDER_LOCKED;
    if (revealMode === 'FIRST_LETTER' && scenario) {
       return `${t.PLACEHOLDER_HINT} '${scenario.targetWord.charAt(0).toUpperCase()}'...`;
    }
    return t.PLACEHOLDER_DEFAULT;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-space-800 border-2 border-space-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Holographic Top Bar - Fixed Header */}
        <div className="bg-space-900/80 p-5 border-b border-space-700 flex justify-between items-center relative shrink-0 z-20">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-transparent pointer-events-none"></div>
          <div className="flex items-center gap-3 text-neon-cyan z-10">
            <Radio className="w-8 h-8 animate-pulse" />
            <div>
              <h2 className="font-display font-bold text-2xl tracking-widest leading-none">{t.DOCKING_SEQ}</h2>
              <p className="text-sm text-neon-cyan/60 uppercase tracking-widest mt-0.5">{t.SIGNAL_LOCKED}</p>
            </div>
          </div>
          
          {/* Attempts Indicator */}
          <div className="flex gap-2">
             {[...Array(MAX_ATTEMPTS)].map((_, i) => (
               <div 
                 key={i} 
                 className={`w-4 h-10 rounded-sm transform skew-x-[-12deg] transition-all
                   ${i < attemptsLeft 
                     ? 'bg-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.5)]' 
                     : 'bg-red-900/50'
                   }
                 `}
               />
             ))}
          </div>

          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors z-10 ml-4">
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto z-10 custom-scrollbar">
          {/* AI Navigator Message */}
          <div className="flex items-start gap-5">
             <div className="w-16 h-16 rounded-full bg-space-700 border border-space-600 flex items-center justify-center shrink-0">
                <Brain className="w-8 h-8 text-neon-purple" />
             </div>
             <div className="space-y-1">
               <div className="flex items-center gap-2">
                 <span className="text-base font-bold text-neon-purple uppercase">{t.AI_NAV}</span>
                 <span className="text-xs bg-space-900 px-2 py-0.5 rounded text-gray-500">PROBE-7</span>
               </div>
               <p className="text-lg text-gray-400 italic leading-relaxed">
                 "{t.NAV_MSG_START} <span className="text-white font-bold">{sourceLabel}</span>. 
                 {t.NAV_MSG_END}"
               </p>
             </div>
          </div>

          {/* Puzzle Interface */}
          <div className="bg-space-900/50 p-8 rounded-xl border border-space-700 space-y-6 relative overflow-hidden">
            {/* Critical Failure Overlay */}
            {result === 'fail' && (
               <div className="absolute inset-0 bg-red-900/80 z-10 flex flex-col items-center justify-center text-center animate-fadeIn backdrop-blur-sm">
                  <ShieldAlert className="w-20 h-20 text-red-500 mb-6 animate-bounce" />
                  <h3 className="text-4xl font-display font-black text-white tracking-widest">{t.MSG_LOST}</h3>
                  <p className="text-red-300 mt-2 font-mono text-lg">{t.MSG_LOST_SUB}</p>
               </div>
            )}

            <div className="text-3xl text-gray-200 leading-loose font-sans text-center font-medium">
              {parts[0]}
              <span className={`inline-block min-w-[120px] border-b-4 px-2 mx-2 text-center font-bold transition-colors
                ${result === 'success' ? 'border-green-500 text-green-400' : 'border-neon-cyan text-neon-cyan'}
                ${result === 'fail' ? 'border-red-500 text-red-500' : ''}
              `}>
                 {getBlankContent()}
              </span>
              {parts[1]}
            </div>
            
            {/* Structural Hint (Attempt 2) */}
            {attempts >= 2 && result !== 'success' && result !== 'fail' && (
              <div className="flex justify-center animate-pulse">
                <span className="text-neon-cyan font-mono text-2xl tracking-widest border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-1 rounded">
                  {getPartialReveal(scenario.targetWord)}
                </span>
              </div>
            )}

            {scenario.hint && result !== 'fail' && (
              <div className="flex justify-center mt-4">
                {!showHint ? (
                  <button 
                    onClick={() => setShowHint(true)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-neon-cyan transition-colors"
                  >
                    <Lightbulb className="w-5 h-5" />
                    {t.BTN_DECRYPT}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-neon-gold animate-fadeIn bg-neon-gold/5 px-4 py-2 rounded-full">
                    <Lightbulb className="w-5 h-5" />
                    <span className="text-base font-mono">{scenario.hint}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="relative">
             <input
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder={getPlaceholder()}
               className={`w-full bg-space-900 border border-space-600 rounded-lg p-6 text-center text-2xl text-white font-mono tracking-wider focus:outline-none transition-all
                 ${result === 'fail' ? 'border-red-900 text-red-700' : 'focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,243,255,0.2)]'}
               `}
               disabled={result === 'success' || result === 'fail' || isValidating}
               autoFocus
               autoComplete="off"
             />
             
             <button
                type="submit"
                disabled={!input.trim() || isValidating || result === 'success' || result === 'fail'}
                className={`mt-5 w-full py-6 rounded-lg font-display font-bold text-2xl uppercase tracking-widest transition-all flex items-center justify-center gap-3
                  ${result === 'success' 
                    ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]' 
                    : result === 'fail'
                      ? 'bg-red-900 text-red-400 border border-red-700 cursor-not-allowed'
                      : 'bg-neon-cyan text-black hover:bg-white shadow-[0_0_20px_rgba(0,243,255,0.3)]'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                `}
             >
                {isValidating ? (
                   <><Loader2 className="w-8 h-8 animate-spin" /> {t.BTN_VERIFYING}</>
                ) : result === 'success' ? (
                   <><Check className="w-8 h-8" /> {t.BTN_SUCCESS}</>
                ) : result === 'fail' ? (
                   <><X className="w-8 h-8" /> {t.BTN_BROKEN}</>
                ) : (
                   <><Satellite className="w-8 h-8" /> {t.BTN_INITIATE}</>
                )}
             </button>
          </form>

          {/* System Feedback */}
          {feedback && result !== 'success' && result !== 'fail' && (
            <div className="p-5 rounded-lg border border-red-500/30 bg-red-500/10 flex items-center gap-4 animate-shake">
               <X className="w-8 h-8 text-red-400" />
               <p className="text-lg text-red-200">{feedback}</p>
            </div>
          )}
          
           {feedback && result === 'success' && (
            <div className="p-5 rounded-lg border border-green-500/30 bg-green-500/10 flex items-center gap-4">
               <Check className="w-8 h-8 text-green-400" />
               <p className="text-lg text-green-200">{feedback}</p>
            </div>
          )}
        </div>

        {/* Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-30"></div>
      </div>
    </div>
  );
};

export default BattleModal;
import React, { useState } from 'react';
import { Language } from '../types';
import { UI_TEXT } from '../constants';
import { Radar, Crosshair, Network, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
  language: Language;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose, language }) => {
  const [step, setStep] = useState(0);
  const t = UI_TEXT[language];

  const steps = [
    {
      title: t.TUTORIAL_STEP1_TITLE,
      desc: t.TUTORIAL_STEP1_DESC,
      icon: <Radar className="w-10 h-10 text-neon-cyan animate-pulse" />,
      color: "border-neon-cyan",
      textColor: "text-neon-cyan"
    },
    {
      title: t.TUTORIAL_STEP2_TITLE,
      desc: t.TUTORIAL_STEP2_DESC,
      icon: <Crosshair className="w-10 h-10 text-red-500 animate-pulse" />,
      color: "border-red-500",
      textColor: "text-red-500"
    },
    {
      title: t.TUTORIAL_STEP3_TITLE,
      desc: t.TUTORIAL_STEP3_DESC,
      icon: <Network className="w-10 h-10 text-neon-gold animate-pulse" />,
      color: "border-neon-gold",
      textColor: "text-neon-gold"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`relative w-full max-w-sm bg-space-800 border-2 ${currentStep.color} rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden transition-colors duration-500`}>
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white z-20">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          
          <div className="w-20 h-20 rounded-full bg-space-900 flex items-center justify-center mb-1 border border-space-700 shadow-xl">
             {currentStep.icon}
          </div>

          <div className="space-y-2">
             <h2 className={`font-display font-black text-2xl tracking-wider ${currentStep.textColor} uppercase`}>
               {currentStep.title}
             </h2>
             <p className="text-gray-300 text-sm leading-relaxed">
               {currentStep.desc}
             </p>
          </div>

          {/* Dots */}
          <div className="flex gap-2 py-2">
            {steps.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? `w-4 ${currentStep.textColor} bg-current` : 'bg-gray-700'}`} />
            ))}
          </div>

          {/* Controls */}
          <div className="flex w-full justify-between items-center gap-3">
            <button 
              onClick={handlePrev}
              disabled={step === 0}
              className="p-2 rounded-full hover:bg-space-700 disabled:opacity-0 transition-colors text-gray-400"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className={`flex-1 py-3 rounded-xl font-bold text-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all ${step === steps.length - 1 ? 'bg-white' : 'bg-gray-200'} text-xs`}
            >
              {step === steps.length - 1 ? t.BTN_START_GAME : t.BTN_NEXT}
              {step !== steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Background Effect */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default TutorialModal;
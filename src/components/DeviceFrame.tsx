import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  enabled,
  onToggle,
}) => {
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.innerWidth <= 768 ||
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    );
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(
        window.innerWidth <= 768 ||
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      );
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When on an actual iPhone, Android, or mobile-sized screen, NEVER render an artificial phone bezel!
  // Render native full viewport so iOS native safe areas and status bar work 100% naturally.
  if (isMobileScreen || !enabled) {
    return (
      <div className="w-full min-h-screen bg-[var(--app-bg,#f0f7ff)] flex flex-col">
        {children}
      </div>
    );
  }

  // On large desktop monitors only: optional visual device shell preview
  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 flex flex-col items-center justify-center">
      {/* Device Mode Desktop Toggle */}
      <div className="mb-3 flex items-center gap-2 px-3.5 py-1.5 bg-slate-800/90 text-white rounded-full text-xs shadow-md border border-slate-700">
        <Smartphone size={14} className="text-amber-400" />
        <span className="font-display font-medium text-slate-200">Visualização Simulador (Desktop)</span>
        <button
          onClick={onToggle}
          className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-700 hover:bg-slate-600 text-[11px] font-bold text-amber-300 transition-colors cursor-pointer"
        >
          Modo Tela Cheia
        </button>
      </div>

      {/* Realistic Mobile Device Shell for Desktop Inspection */}
      <div className="relative w-full max-w-[414px] h-[860px] max-h-[92vh] bg-black rounded-[52px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[10px] border-slate-800 ring-2 ring-slate-700/60 overflow-hidden flex flex-col">
        {/* Dynamic Island on desktop shell */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3 shadow-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
          <div className="w-2 h-2 rounded-full bg-blue-950"></div>
        </div>

        {/* Screen Viewport */}
        <div className="flex-1 w-full overflow-y-auto bg-[var(--app-bg,#f0f7ff)] relative scroll-smooth">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="w-full h-5 bg-transparent flex items-center justify-center pb-1">
          <div className="w-32 h-1 bg-slate-500/80 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface TopBarProps {
  currentView: 'desktop' | 'cli' | 'inspector' | 'guide';
  onSelectView: (view: 'desktop' | 'cli' | 'inspector' | 'guide') => void;
  onResetOS: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onSelectView,
  onResetOS,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-2.5 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md z-50 select-none shrink-0 h-12">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 font-sans">
          KoreOS 2.4
        </span>
        <span className="text-xs text-slate-500 font-mono hidden md:inline">
          x86_64
        </span>
      </div>

      {/* Zone 2: 4 nav links with clean hover styling and active states */}
      <nav className="flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => onSelectView('desktop')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'desktop' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Bureau Graphique
        </button>
        <button
          onClick={() => onSelectView('cli')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'cli' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Terminal TTY
        </button>
        <button
          onClick={() => onSelectView('inspector')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'inspector' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Inspecteur Noyau
        </button>
        <button
          onClick={() => onSelectView('guide')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'guide' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Guide Architecture
        </button>
      </nav>

      {/* Zone 3: 1 primary action with time */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-xs text-slate-400 tabular-nums hidden sm:inline">
          {timeStr}
        </span>
        <button
          onClick={onResetOS}
          title="Réinitialiser le VFS et l'environnement virtuel"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-slate-700/60"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Redémarrer OS</span>
        </button>
      </div>
    </header>
  );
};

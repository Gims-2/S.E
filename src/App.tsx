import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { Desktop } from './components/Desktop';
import { TerminalApp } from './components/apps/TerminalApp';
import { KernelInspector } from './components/KernelInspector';
import { GuideOSApp } from './components/apps/GuideOSApp';
import { vfsInstance } from './os/vfs';
import { kernelInstance } from './os/kernel';
import { Terminal, Monitor, Activity, BookOpen, AlertCircle } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'desktop' | 'cli' | 'inspector' | 'guide'>('desktop');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2' || (e.altKey && e.key.toLowerCase() === 'g')) {
        e.preventDefault();
        setViewMode(prev => (prev === 'desktop' ? 'cli' : 'desktop'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResetOS = () => {
    vfsInstance.reset();
    kernelInstance.logSyscall('sys_reboot', 'magic=0xFEE1DEAD, cmd=LINUX_REBOOT_CMD_RESTART', '0', 'init');
    setShowResetConfirm(false);
    setResetMessage('KoreOS a été réinitialisé à l\'état d\'usine avec succès.');
    setTimeout(() => setResetMessage(null), 3500);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Barre de navigation supérieure (Top Bar Contract 3 zones) */}
      <TopBar
        currentView={viewMode}
        onSelectView={setViewMode}
        onResetOS={() => setShowResetConfirm(true)}
      />

      {/* Notification de réinitialisation */}
      {resetMessage && (
        <div className="absolute top-14 right-6 z-50 px-4 py-2 bg-emerald-950/90 border border-emerald-700/80 rounded-xl text-emerald-200 text-xs shadow-xl backdrop-blur-md animate-fadeIn">
          {resetMessage}
        </div>
      )}

      {/* Modal de confirmation de redémarrage / réinitialisation */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-semibold text-slate-100 font-sans">
                Redémarrer et réinitialiser KoreOS ?
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cette action restaurera l'arborescence virtuelle de fichiers <code>/</code>, réinitialisera les processus noyau et videra le cache LocalStorage.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleResetOS}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors"
              >
                Confirmer la réinitialisation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu selon le mode d'affichage choisi */}
      <main className="flex-1 w-full h-[calc(100%-48px)] overflow-hidden relative">
        {viewMode === 'desktop' && (
          <Desktop
            toggleViewMode={setViewMode}
            onResetOS={() => setShowResetConfirm(true)}
          />
        )}

        {viewMode === 'cli' && (
          <div className="w-full h-full flex flex-col bg-black">
            <div className="px-4 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 select-none">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-slate-200">KoreOS Pure TTY1 Console (VGA 80x25 Mode)</span>
              </span>
              <button
                onClick={() => setViewMode('desktop')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-700/70 hover:bg-cyan-900 text-cyan-200 text-xs font-medium transition-colors"
              >
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span>Basculer vers le Bureau GUI (ou tapez 'gui' / F2)</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TerminalApp
                isStandalone={true}
                toggleViewMode={setViewMode}
              />
            </div>
          </div>
        )}

        {viewMode === 'inspector' && (
          <div className="w-full h-full">
            <KernelInspector />
          </div>
        )}

        {viewMode === 'guide' && (
          <div className="w-full h-full">
            <GuideOSApp />
          </div>
        )}
      </main>
    </div>
  );
}

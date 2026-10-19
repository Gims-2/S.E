import React, { useState } from 'react';
import {
  Search,
  Power,
  RotateCcw,
  Terminal,
  Folder,
  Code2,
  Activity,
  Monitor,
  BookOpen,
  Gamepad2,
  User,
  Cpu,
  FileText,
  Layers,
  ChevronRight,
  Sliders,
} from 'lucide-react';

interface WindowsStartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: string, initialParam?: string) => void;
  onResetOS: () => void;
  onToggleViewMode: (mode: 'desktop' | 'cli' | 'inspector' | 'guide') => void;
}

export const WindowsStartMenu: React.FC<WindowsStartMenuProps> = ({
  isOpen,
  onClose,
  onOpenApp,
  onResetOS,
  onToggleViewMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPowerMenu, setShowPowerMenu] = useState(false);

  if (!isOpen) return null;

  const pinnedApps = [
    {
      id: 'files',
      name: 'Ce PC (Explorateur)',
      icon: <Folder className="w-6 h-6 text-amber-400" />,
      category: 'Système',
    },
    {
      id: 'terminal',
      name: 'Terminal Windows',
      icon: <Terminal className="w-6 h-6 text-cyan-400" />,
      category: 'Développement',
    },
    {
      id: 'editor',
      name: 'KoreEdit (Bloc-notes)',
      icon: <Code2 className="w-6 h-6 text-emerald-400" />,
      category: 'Outils',
    },
    {
      id: 'monitor',
      name: 'Gestionnaire des tâches',
      icon: <Activity className="w-6 h-6 text-rose-400" />,
      category: 'Performances',
    },
    {
      id: 'framebuffer',
      name: 'Lab Framebuffer VBE',
      icon: <Monitor className="w-6 h-6 text-indigo-400" />,
      category: 'Graphique OS',
    },
    {
      id: 'guide',
      name: 'Guide Création OS',
      icon: <BookOpen className="w-6 h-6 text-sky-400" />,
      category: 'Formation',
    },
    {
      id: 'snake',
      name: 'Retro Snake 2D',
      icon: <Gamepad2 className="w-6 h-6 text-emerald-300" />,
      category: 'Jeux',
    },
    {
      id: 'inspector',
      name: 'Inspecteur Noyau (Syscalls)',
      icon: <Cpu className="w-6 h-6 text-purple-400" />,
      category: 'Système',
      action: () => onToggleViewMode('inspector'),
    },
    {
      id: 'cli_full',
      name: 'Console TTY Plein Écran',
      icon: <Layers className="w-6 h-6 text-slate-300" />,
      category: 'Mode texte',
      action: () => onToggleViewMode('cli'),
    },
  ];

  const recentDocuments = [
    {
      name: 'architecture_os.md',
      path: '/home/user/architecture_os.md',
      desc: 'Guide de conception du système d\'exploitation',
    },
    {
      name: 'kernel.c',
      path: '/kernel/kernel.c',
      desc: 'Code source C du noyau minimal (Mode Protégé)',
    },
    {
      name: 'boot.asm',
      path: '/kernel/boot.asm',
      desc: 'Secteur d\'amorçage MBR 512 octets en NASM',
    },
    {
      name: 'bienvenue.txt',
      path: '/home/user/bienvenue.txt',
      desc: 'Documentation de bienvenue dans KoreOS',
    },
  ];

  const filteredApps = pinnedApps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLaunchApp = (app: typeof pinnedApps[0]) => {
    if (app.action) {
      app.action();
    } else {
      onOpenApp(app.id);
    }
    onClose();
  };

  const handleOpenDoc = (docPath: string) => {
    onOpenApp('editor', docPath);
    onClose();
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[580px] max-w-[92vw] h-[600px] max-h-[82vh] rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-slate-700/60 shadow-2xl flex flex-col overflow-hidden z-50 text-slate-100 animate-in fade-in zoom-in-95 duration-150 select-none"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Barre de recherche style Windows 11 */}
      <div className="p-6 pb-4">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tapez ici pour rechercher (applications, paramètres, fichiers...)"
            autoFocus
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-slate-800/80 border border-slate-700/70 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* Contenu principal défilable */}
      <div className="flex-1 overflow-y-auto px-6 space-y-6">
        {/* Section Applications Épinglées */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-200">Épinglé</span>
            <span className="text-[11px] text-slate-400">Toutes les applications</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {filteredApps.map(app => (
              <button
                key={app.id}
                onClick={() => handleLaunchApp(app)}
                className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-slate-800/70 transition-all group cursor-pointer text-center"
              >
                <div className="p-2.5 rounded-xl bg-slate-800/50 group-hover:scale-105 transition-transform mb-2">
                  {app.icon}
                </div>
                <span className="text-[11px] font-medium text-slate-200 truncate w-full">
                  {app.name}
                </span>
                <span className="text-[10px] text-slate-500 truncate w-full">
                  {app.category}
                </span>
              </button>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs">
              Aucune application trouvée pour « {searchQuery} »
            </div>
          )}
        </div>

        {/* Section Nos Recommandations / Fichiers Récents */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-200">Nos recommandations</span>
            <span className="text-[11px] text-slate-400">Plus &gt;</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentDocuments.map(doc => (
              <button
                key={doc.path}
                onClick={() => handleOpenDoc(doc.path)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 transition-colors text-left group"
              >
                <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-slate-200 truncate font-mono">
                    {doc.name}
                  </span>
                  <span className="block text-[10px] text-slate-500 truncate">
                    {doc.desc}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Barre de profil utilisateur & Alimentation (Bas du menu Démarrer) */}
      <div className="relative p-4 px-6 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
        {/* Utilisateur */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-semibold text-xs">
            U
          </div>
          <div className="text-left">
            <span className="block text-xs font-semibold text-slate-200">Utilisateur KoreOS</span>
            <span className="block text-[10px] text-slate-400">user@kore-workstation</span>
          </div>
        </div>

        {/* Bouton Marche / Arrêt */}
        <div className="relative">
          <button
            onClick={() => setShowPowerMenu(!showPowerMenu)}
            title="Alimentation et Redémarrage"
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <Power className="w-4 h-4" />
          </button>

          {showPowerMenu && (
            <div className="absolute right-0 bottom-10 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 space-y-1 z-30">
              <button
                onClick={() => {
                  setShowPowerMenu(false);
                  onResetOS();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 text-left transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Redémarrer l'OS</span>
              </button>
              <button
                onClick={() => {
                  setShowPowerMenu(false);
                  onToggleViewMode('cli');
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 text-left transition-colors"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mode Console TTY</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

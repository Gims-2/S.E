import React, { useState, useEffect } from 'react';
import {
  Search,
  Folder,
  Terminal,
  Code2,
  Activity,
  Monitor,
  BookOpen,
  Gamepad2,
  Wifi,
  Volume2,
  VolumeX,
  Battery,
  ChevronUp,
  Cpu,
  Layers,
} from 'lucide-react';
import { kernelInstance } from '../../os/kernel';

interface WindowsTaskbarProps {
  openAppIds: string[];
  activeAppId: string | null;
  isStartMenuOpen: boolean;
  onToggleStartMenu: () => void;
  onOpenApp: (appId: string) => void;
  onToggleMinimizeAll: () => void;
  onToggleViewMode: (mode: 'desktop' | 'cli' | 'inspector' | 'guide') => void;
}

export const WindowsTaskbar: React.FC<WindowsTaskbarProps> = ({
  openAppIds,
  activeAppId,
  isStartMenuOpen,
  onToggleStartMenu,
  onOpenApp,
  onToggleMinimizeAll,
  onToggleViewMode,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [showSystrayPopup, setShowSystrayPopup] = useState(false);
  const [cpuLoad, setCpuLoad] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateCpu = () => {
      setCpuLoad(kernelInstance.getTotalCpuUsage());
    };
    updateCpu();
    const unsub = kernelInstance.subscribe(updateCpu);
    return () => unsub();
  }, []);

  const taskbarApps = [
    {
      id: 'files',
      name: 'Explorateur de fichiers (Ce PC)',
      icon: <Folder className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'terminal',
      name: 'Windows Terminal (CLI)',
      icon: <Terminal className="w-5 h-5 text-cyan-400" />,
    },
    {
      id: 'editor',
      name: 'KoreEdit (Bloc-notes)',
      icon: <Code2 className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'monitor',
      name: 'Gestionnaire des tâches',
      icon: <Activity className="w-5 h-5 text-rose-400" />,
    },
    {
      id: 'framebuffer',
      name: 'Laboratoire Framebuffer',
      icon: <Monitor className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'guide',
      name: 'Guide d\'Architecture OS',
      icon: <BookOpen className="w-5 h-5 text-sky-400" />,
    },
    {
      id: 'snake',
      name: 'Retro Snake 2D',
      icon: <Gamepad2 className="w-5 h-5 text-emerald-300" />,
    },
  ];

  return (
    <footer
      onClick={e => e.stopPropagation()}
      className="absolute bottom-0 left-0 right-0 h-12 bg-slate-900/85 backdrop-blur-2xl border-t border-slate-700/50 flex items-center justify-between px-3 z-50 select-none text-slate-200"
      style={{
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Zone gauche (Widgets / Statut du Noyau) */}
      <div className="flex items-center gap-2 w-48 shrink-0">
        <button
          onClick={() => onToggleViewMode('inspector')}
          title="Inspecteur interne du noyau"
          className="flex items-center gap-2 px-2.5 py-1 rounded-md hover:bg-slate-800/80 transition-colors text-xs text-slate-300"
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-[10px] text-slate-400 font-sans">KoreOS 2.4</span>
            <span className="text-[11px] font-mono text-cyan-300 tabular-nums font-semibold">
              CPU: {cpuLoad.toFixed(1)}%
            </span>
          </div>
        </button>
      </div>

      {/* Zone centrale : Logo Windows 11 + Icônes centrées */}
      <div className="flex items-center gap-1">
        {/* Bouton Démarrer Windows 11 (Logo 4 carrés bleus) */}
        <button
          onClick={onToggleStartMenu}
          title="Démarrer (Win)"
          className={`relative flex items-center justify-center w-10 h-10 rounded-md transition-all ${
            isStartMenuOpen ? 'bg-slate-800 shadow-inner' : 'hover:bg-slate-800/80'
          }`}
        >
          <div className="grid grid-cols-2 gap-[2.5px] w-4 h-4">
            <div className="bg-sky-400 rounded-[1px]" />
            <div className="bg-sky-400 rounded-[1px]" />
            <div className="bg-sky-400 rounded-[1px]" />
            <div className="bg-sky-400 rounded-[1px]" />
          </div>
        </button>

        {/* Bouton Recherche Windows */}
        <button
          onClick={onToggleStartMenu}
          title="Rechercher"
          className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
        >
          <Search className="w-4 h-4 text-slate-400" />
        </button>

        {/* Icônes des applications épinglées et ouvertes */}
        {taskbarApps.map(app => {
          const isOpen = openAppIds.includes(app.id);
          const isActive = activeAppId === app.id;

          return (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              title={app.name}
              className={`relative flex items-center justify-center w-10 h-10 rounded-md transition-all group ${
                isActive
                  ? 'bg-slate-800 shadow-inner'
                  : 'hover:bg-slate-800/80'
              }`}
            >
              {app.icon}

              {/* Indicateur sous l'application active ou ouverte */}
              {isOpen && (
                <span
                  className={`absolute bottom-0.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'w-4 h-[3px] bg-cyan-400'
                      : 'w-1.5 h-1.5 bg-slate-400 group-hover:w-3 group-hover:bg-cyan-300'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Zone droite : Systray, Réseau, Son, Batterie, Horloge et Show Desktop */}
      <div className="flex items-center gap-1.5 w-56 justify-end shrink-0 text-xs">
        {/* Menu overflow icônes cachées (chevron haut) */}
        <div className="relative">
          <button
            onClick={() => setShowSystrayPopup(!showSystrayPopup)}
            title="Afficher les processus d'arrière-plan"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {showSystrayPopup && (
            <div className="absolute right-0 bottom-11 w-52 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-xs space-y-2 z-40">
              <span className="font-semibold text-slate-300 text-[11px] block border-b border-slate-800 pb-1">
                Démons d'arrière-plan actifs
              </span>
              <div className="space-y-1.5 text-[10px] text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>kthreadd</span>
                  <span className="text-emerald-400">PID 2 (En veille)</span>
                </div>
                <div className="flex justify-between">
                  <span>kore-compositor</span>
                  <span className="text-cyan-400">PID 12 (Actif 60Hz)</span>
                </div>
                <div className="flex justify-between">
                  <span>kore-vfsd</span>
                  <span className="text-slate-500">PID 24 (Sync)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pilote Réseau */}
        <div className="p-1 text-slate-400" title="Réseau virtuel connecté : Ethernet 1 Gbps">
          <Wifi className="w-3.5 h-3.5 text-cyan-400" />
        </div>

        {/* Contrôle du Volume interactif */}
        <div className="relative">
          <button
            onClick={() => setShowVolumePopup(!showVolumePopup)}
            title={`Volume : ${isMuted ? 'Muet' : `${volume}%`}`}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-slate-300" />
            )}
          </button>

          {showVolumePopup && (
            <div className="absolute right-0 bottom-11 w-48 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-xs space-y-2 z-40">
              <div className="flex items-center justify-between text-slate-300">
                <span>Haut-parleurs</span>
                <span className="font-mono tabular-nums">{isMuted ? '0%' : `${volume}%`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={e => {
                  setVolume(parseInt(e.target.value, 10));
                  setIsMuted(false);
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Batterie */}
        <div className="p-1 text-slate-400" title="Alimentation secteur (100% chargée)">
          <Battery className="w-3.5 h-3.5 text-emerald-400" />
        </div>

        {/* Horloge et date style Windows 11 (2 lignes) */}
        <div
          onClick={() => onToggleViewMode('desktop')}
          title="Heure et calendrier système"
          className="flex flex-col text-right px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer leading-tight text-slate-200 font-sans"
        >
          <span className="text-[11px] font-medium tabular-nums">{timeStr}</span>
          <span className="text-[10px] text-slate-400 tabular-nums">{dateStr}</span>
        </div>

        {/* Bouton Windows 11 « Afficher le bureau » (tranche à droite) */}
        <button
          onClick={onToggleMinimizeAll}
          title="Afficher le bureau"
          className="w-1.5 h-7 rounded-sm border-l border-slate-700 hover:bg-cyan-500/30 transition-colors ml-1"
        />
      </div>
    </footer>
  );
};

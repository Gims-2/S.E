import React from 'react';
import {
  Terminal,
  Folder,
  Code2,
  Activity,
  Monitor,
  BookOpen,
  Gamepad2,
} from 'lucide-react';

export interface DockApp {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface DockProps {
  openAppIds: string[];
  activeAppId: string | null;
  onOpenApp: (appId: string) => void;
}

export const Dock: React.FC<DockProps> = ({
  openAppIds,
  activeAppId,
  onOpenApp,
}) => {
  const apps: DockApp[] = [
    {
      id: 'terminal',
      name: 'Terminal TTY',
      icon: <Terminal className="w-5 h-5 text-cyan-400" />,
    },
    {
      id: 'files',
      name: 'Fichiers VFS',
      icon: <Folder className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'editor',
      name: 'Éditeur KoreEdit',
      icon: <Code2 className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'monitor',
      name: 'Moniteur Système',
      icon: <Activity className="w-5 h-5 text-rose-400" />,
    },
    {
      id: 'framebuffer',
      name: 'Laboratoire Framebuffer',
      icon: <Monitor className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'guide',
      name: 'Guide d\'Architecture',
      icon: <BookOpen className="w-5 h-5 text-sky-400" />,
    },
    {
      id: 'snake',
      name: 'Retro Snake (Test Processus)',
      icon: <Gamepad2 className="w-5 h-5 text-emerald-300" />,
    },
  ];

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 select-none">
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/85 border border-slate-700/60 shadow-2xl backdrop-blur-xl">
        {apps.map(app => {
          const isOpen = openAppIds.includes(app.id);
          const isActive = activeAppId === app.id;

          return (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              title={app.name}
              className={`relative group flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-slate-800 scale-105 shadow-inner'
                  : 'hover:bg-slate-800/80 hover:scale-105'
              }`}
            >
              {app.icon}

              {/* Point indicateur si la fenêtre est ouverte */}
              {isOpen && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}

              {/* Tooltip de l'application */}
              <span className="absolute -top-9 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-[11px] font-sans text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                {app.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

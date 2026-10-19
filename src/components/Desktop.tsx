import React, { useState } from 'react';
import { Window } from './Window';
import { Dock } from './Dock';
import { TerminalApp } from './apps/TerminalApp';
import { FileManagerApp } from './apps/FileManagerApp';
import { TextEditorApp } from './apps/TextEditorApp';
import { ProcessMonitorApp } from './apps/ProcessMonitorApp';
import { GuideOSApp } from './apps/GuideOSApp';
import { FramebufferVisualizer } from './apps/FramebufferVisualizer';
import { SnakeGameApp } from './apps/SnakeGameApp';
import {
  Terminal,
  Folder,
  Code2,
  Activity,
  Monitor,
  BookOpen,
  Gamepad2,
} from 'lucide-react';

interface WindowState {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  initialPos: { x: number; y: number };
  initialSize: { width: number; height: number };
  initialParam?: string;
}

interface DesktopProps {
  toggleViewMode: (mode: 'desktop' | 'cli' | 'inspector' | 'guide') => void;
}

export const Desktop: React.FC<DesktopProps> = ({ toggleViewMode }) => {
  const [nextZIndex, setNextZIndex] = useState(20);
  const [activeWindowId, setActiveWindowId] = useState<string | null>('terminal');

  const [windows, setWindows] = useState<Record<string, WindowState>>({
    terminal: {
      id: 'terminal',
      title: 'Console Terminal TTY1 (Shell CLI)',
      icon: <Terminal className="w-4 h-4 text-cyan-400" />,
      isOpen: true,
      isMinimized: false,
      zIndex: 10,
      initialPos: { x: 40, y: 30 },
      initialSize: { width: 680, height: 420 },
    },
    guide: {
      id: 'guide',
      title: 'Guide d\'Architecture : Créer son OS de A à Z',
      icon: <BookOpen className="w-4 h-4 text-sky-400" />,
      isOpen: true,
      isMinimized: false,
      zIndex: 12,
      initialPos: { x: 380, y: 70 },
      initialSize: { width: 760, height: 500 },
    },
    files: {
      id: 'files',
      title: 'Explorateur de Fichiers VFS',
      icon: <Folder className="w-4 h-4 text-amber-400" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 5,
      initialPos: { x: 120, y: 80 },
      initialSize: { width: 660, height: 420 },
    },
    editor: {
      id: 'editor',
      title: 'Éditeur de Code KoreEdit',
      icon: <Code2 className="w-4 h-4 text-emerald-400" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 5,
      initialPos: { x: 180, y: 90 },
      initialSize: { width: 720, height: 460 },
      initialParam: '/kernel/kernel.c',
    },
    monitor: {
      id: 'monitor',
      title: 'Moniteur Système & Ordonnanceur (PCB)',
      icon: <Activity className="w-4 h-4 text-rose-400" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 5,
      initialPos: { x: 160, y: 60 },
      initialSize: { width: 700, height: 440 },
    },
    framebuffer: {
      id: 'framebuffer',
      title: 'Laboratoire Moteur Graphique & Framebuffer',
      icon: <Monitor className="w-4 h-4 text-indigo-400" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 5,
      initialPos: { x: 100, y: 50 },
      initialSize: { width: 780, height: 480 },
    },
    snake: {
      id: 'snake',
      title: 'Retro Snake 2D (Processus Utilisateur)',
      icon: <Gamepad2 className="w-4 h-4 text-emerald-300" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 5,
      initialPos: { x: 260, y: 100 },
      initialSize: { width: 440, height: 460 },
    },
  });

  const bringToFront = (id: string) => {
    const newZ = nextZIndex + 1;
    setNextZIndex(newZ);
    setActiveWindowId(id);
    setWindows(prev => {
      const target = prev[id];
      if (!target) return prev;
      return {
        ...prev,
        [id]: {
          ...target,
          zIndex: newZ,
          isMinimized: false,
        },
      };
    });
  };

  const handleOpenWindow = (id: string, initialParam?: string) => {
    const newZ = nextZIndex + 1;
    setNextZIndex(newZ);
    setActiveWindowId(id);
    setWindows(prev => {
      const target = prev[id];
      if (!target) return prev;
      return {
        ...prev,
        [id]: {
          ...target,
          isOpen: true,
          isMinimized: false,
          zIndex: newZ,
          initialParam: initialParam || target.initialParam,
        },
      };
    });
  };

  const handleCloseWindow = (id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: false,
      },
    }));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const handleMinimizeWindow = (id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMinimized: true,
      },
    }));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const handleOpenFileInEditor = (filePath: string) => {
    handleOpenWindow('editor', filePath);
  };

  // Icônes sur le bureau
  const desktopShortcuts = [
    { id: 'terminal', name: 'Terminal CLI', icon: <Terminal className="w-8 h-8 text-cyan-400" /> },
    { id: 'files', name: 'Fichiers VFS', icon: <Folder className="w-8 h-8 text-amber-400" /> },
    { id: 'editor', name: 'Éditeur Code', icon: <Code2 className="w-8 h-8 text-emerald-400" /> },
    { id: 'monitor', name: 'Moniteur Tâches', icon: <Activity className="w-8 h-8 text-rose-400" /> },
    { id: 'framebuffer', name: 'Lab Framebuffer', icon: <Monitor className="w-8 h-8 text-indigo-400" /> },
    { id: 'guide', name: 'Guide Création OS', icon: <BookOpen className="w-8 h-8 text-sky-400" /> },
    { id: 'snake', name: 'Jeu Snake', icon: <Gamepad2 className="w-8 h-8 text-emerald-300" /> },
  ];

  const openAppIds = Object.values(windows)
    .filter(w => w.isOpen)
    .map(w => w.id);

  return (
    <div className="relative flex-1 w-full h-[calc(100%-48px)] overflow-hidden select-none bg-slate-950">
      {/* Arrière-plan Desktop Wallpaper */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/os_wallpaper_dark_nordic_1792401059633.jpg"
          alt="Fond d'écran du bureau KoreOS"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center pointer-events-none opacity-85"
          onError={(e) => {
            // CSS fallback
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Grille subtile de texture et gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
      </div>

      {/* Raccourcis icônes sur le bureau */}
      <div className="relative z-10 p-6 grid grid-flow-col grid-rows-6 gap-3 w-max pointer-events-auto">
        {desktopShortcuts.map(sc => (
          <button
            key={sc.id}
            onDoubleClick={() => handleOpenWindow(sc.id)}
            onClick={() => handleOpenWindow(sc.id)}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-800/50 hover:backdrop-blur-sm border border-transparent hover:border-slate-700/50 transition-all text-center w-24 group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/40 shadow-lg group-hover:scale-110 transition-transform mb-1.5">
              {sc.icon}
            </div>
            <span className="text-[11px] font-medium text-slate-200 drop-shadow-md truncate w-full">
              {sc.name}
            </span>
          </button>
        ))}
      </div>

      {/* Fenêtres d'applications */}
      {/* 1. Terminal App */}
      <Window
        id="terminal"
        title={windows.terminal.title}
        icon={windows.terminal.icon}
        isOpen={windows.terminal.isOpen}
        isMinimized={windows.terminal.isMinimized}
        zIndex={windows.terminal.zIndex}
        initialPosition={windows.terminal.initialPos}
        initialSize={windows.terminal.initialSize}
        onFocus={() => bringToFront('terminal')}
        onClose={() => handleCloseWindow('terminal')}
        onMinimize={() => handleMinimizeWindow('terminal')}
      >
        <TerminalApp
          openAppWindow={handleOpenWindow}
          toggleViewMode={toggleViewMode}
        />
      </Window>

      {/* 2. Guide OS */}
      <Window
        id="guide"
        title={windows.guide.title}
        icon={windows.guide.icon}
        isOpen={windows.guide.isOpen}
        isMinimized={windows.guide.isMinimized}
        zIndex={windows.guide.zIndex}
        initialPosition={windows.guide.initialPos}
        initialSize={windows.guide.initialSize}
        onFocus={() => bringToFront('guide')}
        onClose={() => handleCloseWindow('guide')}
        onMinimize={() => handleMinimizeWindow('guide')}
      >
        <GuideOSApp />
      </Window>

      {/* 3. Explorateur de Fichiers */}
      <Window
        id="files"
        title={windows.files.title}
        icon={windows.files.icon}
        isOpen={windows.files.isOpen}
        isMinimized={windows.files.isMinimized}
        zIndex={windows.files.zIndex}
        initialPosition={windows.files.initialPos}
        initialSize={windows.files.initialSize}
        onFocus={() => bringToFront('files')}
        onClose={() => handleCloseWindow('files')}
        onMinimize={() => handleMinimizeWindow('files')}
      >
        <FileManagerApp onOpenFileInEditor={handleOpenFileInEditor} />
      </Window>

      {/* 4. Éditeur de Texte */}
      <Window
        id="editor"
        title={windows.editor.title}
        icon={windows.editor.icon}
        isOpen={windows.editor.isOpen}
        isMinimized={windows.editor.isMinimized}
        zIndex={windows.editor.zIndex}
        initialPosition={windows.editor.initialPos}
        initialSize={windows.editor.initialSize}
        onFocus={() => bringToFront('editor')}
        onClose={() => handleCloseWindow('editor')}
        onMinimize={() => handleMinimizeWindow('editor')}
      >
        <TextEditorApp initialFilePath={windows.editor.initialParam} />
      </Window>

      {/* 5. Moniteur Système */}
      <Window
        id="monitor"
        title={windows.monitor.title}
        icon={windows.monitor.icon}
        isOpen={windows.monitor.isOpen}
        isMinimized={windows.monitor.isMinimized}
        zIndex={windows.monitor.zIndex}
        initialPosition={windows.monitor.initialPos}
        initialSize={windows.monitor.initialSize}
        onFocus={() => bringToFront('monitor')}
        onClose={() => handleCloseWindow('monitor')}
        onMinimize={() => handleMinimizeWindow('monitor')}
      >
        <ProcessMonitorApp />
      </Window>

      {/* 6. Laboratoire Framebuffer */}
      <Window
        id="framebuffer"
        title={windows.framebuffer.title}
        icon={windows.framebuffer.icon}
        isOpen={windows.framebuffer.isOpen}
        isMinimized={windows.framebuffer.isMinimized}
        zIndex={windows.framebuffer.zIndex}
        initialPosition={windows.framebuffer.initialPos}
        initialSize={windows.framebuffer.initialSize}
        onFocus={() => bringToFront('framebuffer')}
        onClose={() => handleCloseWindow('framebuffer')}
        onMinimize={() => handleMinimizeWindow('framebuffer')}
      >
        <FramebufferVisualizer />
      </Window>

      {/* 7. Snake Game */}
      <Window
        id="snake"
        title={windows.snake.title}
        icon={windows.snake.icon}
        isOpen={windows.snake.isOpen}
        isMinimized={windows.snake.isMinimized}
        zIndex={windows.snake.zIndex}
        initialPosition={windows.snake.initialPos}
        initialSize={windows.snake.initialSize}
        onFocus={() => bringToFront('snake')}
        onClose={() => handleCloseWindow('snake')}
        onMinimize={() => handleMinimizeWindow('snake')}
      >
        <SnakeGameApp />
      </Window>

      {/* Dock d'applications inférieur */}
      <Dock
        openAppIds={openAppIds}
        activeAppId={activeWindowId}
        onOpenApp={handleOpenWindow}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Window } from './Window';
import { WindowsTaskbar } from './windows/WindowsTaskbar';
import { WindowsStartMenu } from './windows/WindowsStartMenu';
import { TerminalApp } from './apps/TerminalApp';
import { WindowsExplorerApp } from './apps/WindowsExplorerApp';
import { TextEditorApp } from './apps/TextEditorApp';
import { ProcessMonitorApp } from './apps/ProcessMonitorApp';
import { GuideOSApp } from './apps/GuideOSApp';
import { FramebufferVisualizer } from './apps/FramebufferVisualizer';
import { SnakeGameApp } from './apps/SnakeGameApp';
import { vfsInstance } from '../os/vfs';
import {
  Monitor,
  Trash2,
  Terminal,
  Code2,
  Activity,
  Layers,
  BookOpen,
  Gamepad2,
  FolderPlus,
  FilePlus,
  RotateCw,
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
  onResetOS: () => void;
}

export const Desktop: React.FC<DesktopProps> = ({ toggleViewMode, onResetOS }) => {
  const [nextZIndex, setNextZIndex] = useState(20);
  const [activeWindowId, setActiveWindowId] = useState<string | null>('files');
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const [windows, setWindows] = useState<Record<string, WindowState>>({
    files: {
      id: 'files',
      title: 'Explorateur de fichiers',
      icon: <Monitor className="w-4 h-4 text-cyan-400" />,
      isOpen: true,
      isMinimized: false,
      zIndex: 10,
      initialPos: { x: 80, y: 40 },
      initialSize: { width: 780, height: 480 },
    },
    terminal: {
      id: 'terminal',
      title: 'Terminal Windows (KoreOS sh)',
      icon: <Terminal className="w-4 h-4 text-cyan-400" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 5,
      initialPos: { x: 120, y: 70 },
      initialSize: { width: 680, height: 420 },
    },
    editor: {
      id: 'editor',
      title: 'KoreEdit - Bloc-notes',
      icon: <Code2 className="w-4 h-4 text-emerald-400" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 5,
      initialPos: { x: 180, y: 80 },
      initialSize: { width: 720, height: 460 },
      initialParam: '/home/user/bienvenue.txt',
    },
    monitor: {
      id: 'monitor',
      title: 'Gestionnaire des tâches Windows',
      icon: <Activity className="w-4 h-4 text-rose-400" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 5,
      initialPos: { x: 200, y: 60 },
      initialSize: { width: 720, height: 450 },
    },
    framebuffer: {
      id: 'framebuffer',
      title: 'Laboratoire Moteur Graphique VBE & Framebuffer',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 5,
      initialPos: { x: 140, y: 50 },
      initialSize: { width: 800, height: 500 },
    },
    guide: {
      id: 'guide',
      title: 'Guide d\'Architecture : Créer son OS de A à Z',
      icon: <BookOpen className="w-4 h-4 text-sky-400" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 5,
      initialPos: { x: 160, y: 50 },
      initialSize: { width: 760, height: 500 },
    },
    snake: {
      id: 'snake',
      title: 'Retro Snake 2D',
      icon: <Gamepad2 className="w-4 h-4 text-emerald-300" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 5,
      initialPos: { x: 240, y: 80 },
      initialSize: { width: 440, height: 460 },
    },
  });

  const bringToFront = (id: string) => {
    const newZ = nextZIndex + 1;
    setNextZIndex(newZ);
    setActiveWindowId(id);
    setIsStartMenuOpen(false);
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
    setIsStartMenuOpen(false);
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

  const handleToggleMinimizeAll = () => {
    const anyOpenNotMinimized = Object.values(windows).some(w => w.isOpen && !w.isMinimized);
    setWindows(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        if (updated[k].isOpen) {
          updated[k] = { ...updated[k], isMinimized: anyOpenNotMinimized };
        }
      });
      return updated;
    });
    if (anyOpenNotMinimized) setActiveWindowId(null);
  };

  const handleOpenFileInEditor = (filePath: string) => {
    handleOpenWindow('editor', filePath);
  };

  // Clic droit sur le bureau
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDesktopClick = () => {
    setIsStartMenuOpen(false);
    setContextMenu(null);
  };

  // Raccourcis icônes du bureau alignés à gauche comme Windows
  const desktopIcons = [
    {
      id: 'files',
      name: 'Ce PC',
      icon: <Monitor className="w-9 h-9 text-cyan-400" />,
      action: () => handleOpenWindow('files', 'this_pc'),
    },
    {
      id: 'recycle',
      name: 'Corbeille',
      icon: <Trash2 className="w-9 h-9 text-slate-300" />,
      action: () => handleOpenWindow('files', '/home/user'),
    },
    {
      id: 'terminal',
      name: 'Terminal',
      icon: <Terminal className="w-9 h-9 text-cyan-400" />,
      action: () => handleOpenWindow('terminal'),
    },
    {
      id: 'editor',
      name: 'KoreEdit',
      icon: <Code2 className="w-9 h-9 text-emerald-400" />,
      action: () => handleOpenWindow('editor'),
    },
    {
      id: 'monitor',
      name: 'Gestionnaire des tâches',
      icon: <Activity className="w-9 h-9 text-rose-400" />,
      action: () => handleOpenWindow('monitor'),
    },
    {
      id: 'framebuffer',
      name: 'Lab Framebuffer',
      icon: <Layers className="w-9 h-9 text-indigo-400" />,
      action: () => handleOpenWindow('framebuffer'),
    },
    {
      id: 'guide',
      name: 'Guide Création OS',
      icon: <BookOpen className="w-9 h-9 text-sky-400" />,
      action: () => handleOpenWindow('guide'),
    },
  ];

  const openAppIds = Object.values(windows)
    .filter(w => w.isOpen && !w.isMinimized)
    .map(w => w.id);

  return (
    <div
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
      className="relative w-full h-full overflow-hidden select-none bg-slate-950 font-sans"
    >
      {/* Fond d'écran officiel Windows 11 Bloom */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/src/assets/images/windows_11_bloom_dark_1792402915224.jpg"
          alt="Fond d'écran Windows 11 Bloom Dark"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
          onError={e => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px]" />
      </div>

      {/* Icônes sur le bureau alignées à gauche façon Windows */}
      <div className="relative z-10 p-4 pt-6 grid grid-flow-col grid-rows-6 gap-2 w-max pointer-events-auto">
        {desktopIcons.map(item => (
          <button
            key={item.id}
            onClick={e => {
              e.stopPropagation();
              item.action();
            }}
            onDoubleClick={e => {
              e.stopPropagation();
              item.action();
            }}
            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-sm border border-transparent hover:border-white/15 transition-all text-center w-24 h-24 group cursor-pointer focus:bg-white/15 focus:border-cyan-400/50 outline-none"
          >
            <div className="p-1 group-hover:scale-105 transition-transform drop-shadow-lg">
              {item.icon}
            </div>
            <span className="text-[11px] font-medium text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full px-1">
              {item.name}
            </span>
          </button>
        ))}
      </div>

      {/* Menu contextuel clic-droit sur le bureau */}
      {contextMenu && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed w-52 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-1.5 z-50 text-xs space-y-0.5 text-slate-200 animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            onClick={() => {
              vfsInstance.createDir('/home/user/Nouveau dossier');
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Nouveau dossier</span>
          </button>
          <button
            onClick={() => {
              vfsInstance.writeFile('/home/user/Nouveau document.txt', '');
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nouveau document texte</span>
          </button>
          <div className="h-[1px] bg-slate-800 my-1" />
          <button
            onClick={() => {
              handleOpenWindow('terminal');
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ouvrir dans le Terminal</span>
          </button>
          <button
            onClick={() => {
              handleOpenWindow('monitor');
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Gestionnaire des tâches</span>
          </button>
          <div className="h-[1px] bg-slate-800 my-1" />
          <button
            onClick={() => {
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Actualiser</span>
          </button>
        </div>
      )}

      {/* Fenêtres d'applications ouvertes */}
      {/* 1. Explorateur Windows (Ce PC) */}
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
        <WindowsExplorerApp onOpenFileInEditor={handleOpenFileInEditor} />
      </Window>

      {/* 2. Terminal Windows */}
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

      {/* 3. KoreEdit (Bloc-notes) */}
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

      {/* 4. Gestionnaire des tâches */}
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

      {/* 5. Laboratoire Framebuffer */}
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

      {/* 6. Guide d'Architecture */}
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

      {/* Menu Démarrer Windows 11 flottant */}
      <WindowsStartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        onOpenApp={handleOpenWindow}
        onResetOS={onResetOS}
        onToggleViewMode={toggleViewMode}
      />

      {/* Barre des tâches Windows 11 en bas */}
      <WindowsTaskbar
        openAppIds={openAppIds}
        activeAppId={activeWindowId}
        isStartMenuOpen={isStartMenuOpen}
        onToggleStartMenu={() => setIsStartMenuOpen(!isStartMenuOpen)}
        onOpenApp={handleOpenWindow}
        onToggleMinimizeAll={handleToggleMinimizeAll}
        onToggleViewMode={toggleViewMode}
      />
    </div>
  );
};

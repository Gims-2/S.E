import React, { useState, useRef, useEffect } from 'react';
import { executeCommand, TerminalOutputLine } from '../../os/terminalEngine';
import { vfsInstance } from '../../os/vfs';
import { CornerDownLeft, Sparkles, Trash2 } from 'lucide-react';

interface TerminalAppProps {
  initialCwd?: string;
  isStandalone?: boolean;
  openAppWindow?: (appId: string, initialParam?: string) => void;
  toggleViewMode?: (mode: 'desktop' | 'cli' | 'inspector') => void;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
  initialCwd = '/home/user',
  isStandalone = false,
  openAppWindow,
  toggleViewMode,
}) => {
  const [cwd, setCwd] = useState(initialCwd);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [lines, setLines] = useState<TerminalOutputLine[]>([
    {
      id: 'welcome_1',
      type: 'info',
      content: 'KoreOS Linux Kernel v2.4 (x86_64) - Console TTY1 [ttyS0]',
    },
    {
      id: 'welcome_2',
      type: 'output',
      content: 'Tapez "help" pour afficher la liste des commandes ou "gui" pour le bureau graphique.',
    },
    {
      id: 'welcome_3',
      type: 'output',
      content: 'Astuce : Consultez "/kernel" pour examiner le code source C et Assembleur.',
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleRunCommand = (commandToRun: string) => {
    const trimmed = commandToRun.trim();
    if (!trimmed) return;

    // Ajouter à l'historique
    setHistory(prev => [trimmed, ...prev.filter(c => c !== trimmed)]);
    setHistoryIndex(-1);

    // Ligne de saisie de l'utilisateur
    const promptDisplay = `user@kore-os:${cwd === '/home/user' ? '~' : cwd}$ ${trimmed}`;
    const userLine: TerminalOutputLine = {
      id: `usr_${Date.now()}`,
      type: 'input',
      content: promptDisplay,
    };

    if (trimmed.toLowerCase() === 'clear') {
      setLines([]);
      setInputVal('');
      return;
    }

    const output = executeCommand(trimmed, {
      cwd,
      setCwd,
      openAppWindow,
      toggleViewMode,
    });

    setLines(prev => [...prev, userLine, ...output]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRunCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = Math.min(history.length - 1, historyIndex + 1);
      setHistoryIndex(nextIdx);
      setInputVal(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complétion des commandes et des fichiers
      handleTabCompletion();
    }
  };

  const handleTabCompletion = () => {
    const parts = inputVal.split(' ');
    if (parts.length === 1) {
      // Auto-compléter une commande
      const commonCommands = [
        'help', 'ls', 'cd', 'pwd', 'cat', 'echo', 'touch', 'mkdir', 'rm',
        'nano', 'ps', 'kill', 'top', 'sysinfo', 'syscalls', 'gui', 'open',
        'matrix', 'clear', 'guide', 'calc', 'tree', 'whoami', 'date'
      ];
      const match = commonCommands.filter(c => c.startsWith(parts[0]));
      if (match.length === 1) {
        setInputVal(match[0] + ' ');
      } else if (match.length > 1) {
        setLines(prev => [
          ...prev,
          { id: `tab_${Date.now()}`, type: 'info', content: match.join('   ') },
        ]);
      }
    } else {
      // Auto-compléter un fichier dans le dossier courant
      const currentToken = parts[parts.length - 1];
      const items = vfsInstance.listDir(cwd);
      const matches = items.filter(i => i.name.startsWith(currentToken));
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0].name + (matches[0].type === 'dir' ? '/' : ' ');
        setInputVal(parts.join(' '));
      } else if (matches.length > 1) {
        setLines(prev => [
          ...prev,
          { id: `tab_${Date.now()}`, type: 'info', content: matches.map(m => m.name).join('   ') },
        ]);
      }
    }
  };

  const quickCommands = [
    { label: 'ls -la', cmd: 'ls -la' },
    { label: 'cat guide', cmd: 'cat /home/user/architecture_os.md' },
    { label: 'ps (tâches)', cmd: 'ps' },
    { label: 'syscalls', cmd: 'syscalls' },
    { label: 'tree (VFS)', cmd: 'tree' },
    { label: 'calc FB', cmd: 'calc 1024 * 768 * 4' },
    { label: 'open guide', cmd: 'open guide' },
  ];

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`flex flex-col h-full bg-slate-950 font-mono text-sm leading-relaxed p-4 overflow-hidden ${
        isStandalone ? 'crt-screen' : ''
      }`}
    >
      {/* Zone de défilement des logs */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 select-text">
        {lines.map(line => {
          let colorClass = 'text-slate-300';
          if (line.type === 'input') colorClass = 'text-cyan-300 font-semibold';
          else if (line.type === 'error') colorClass = 'text-rose-400 font-medium';
          else if (line.type === 'success') colorClass = 'text-emerald-400';
          else if (line.type === 'info') colorClass = 'text-amber-300/90';
          else if (line.type === 'system') colorClass = 'text-indigo-300';

          return (
            <div key={line.id} className={`${colorClass} break-words whitespace-pre-wrap`}>
              {line.content}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Raccourcis de commandes fréquentes */}
      <div className="flex flex-wrap items-center gap-1.5 pt-3 pb-2 border-t border-slate-800/80 text-xs text-slate-400">
        <span className="text-slate-500 font-sans text-[11px] mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Raccourcis :
        </span>
        {quickCommands.map((qc, idx) => (
          <button
            key={idx}
            onClick={e => {
              e.stopPropagation();
              handleRunCommand(qc.cmd);
            }}
            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-300 transition-colors text-xs font-mono"
          >
            {qc.label}
          </button>
        ))}
        <button
          onClick={e => {
            e.stopPropagation();
            setLines([]);
          }}
          title="Effacer l'écran (clear)"
          className="ml-auto p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Ligne d'invite de commande active */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-slate-200">
        <span className="text-emerald-400 font-bold whitespace-nowrap">
          user@kore-os:{cwd === '/home/user' ? '~' : cwd}$
        </span>
        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            className="w-full bg-transparent text-cyan-200 focus:outline-none font-mono caret-cyan-400 text-sm"
            placeholder="Tapez une commande (help, ls, cat, gui...)"
          />
          <button
            onClick={() => handleRunCommand(inputVal)}
            disabled={!inputVal.trim()}
            className="p-1 rounded text-slate-500 hover:text-cyan-400 disabled:opacity-30 transition-colors"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

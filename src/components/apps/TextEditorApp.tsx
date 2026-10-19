import React, { useState, useEffect } from 'react';
import { vfsInstance } from '../../os/vfs';
import { kernelInstance } from '../../os/kernel';
import { Save, Play, CheckCircle2, FileText, Code2, Sparkles, FolderOpen } from 'lucide-react';

interface TextEditorAppProps {
  initialFilePath?: string;
}

export const TextEditorApp: React.FC<TextEditorAppProps> = ({
  initialFilePath = '/kernel/kernel.c',
}) => {
  const [filePath, setFilePath] = useState(initialFilePath);
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadFile(filePath);
  }, [filePath]);

  const loadFile = (path: string) => {
    const fileContent = vfsInstance.readFile(path);
    if (fileContent !== null) {
      setContent(fileContent);
      setFilePath(path);
      setIsSaved(true);
      kernelInstance.logSyscall('sys_open', `path="${path}", flags=O_RDWR`, 'fd=6', 'kore-edit');
    } else {
      setContent('// Nouveau fichier non enregistré dans KoreOS\n');
      setIsSaved(false);
    }
  };

  const handleSave = () => {
    const success = vfsInstance.writeFile(filePath, content);
    if (success) {
      setIsSaved(true);
      kernelInstance.logSyscall('sys_write', `file="${filePath}", len=${content.length}`, `${content.length} octets`, 'kore-edit');
      setStatusMessage('Fichier enregistré avec succès dans le VFS !');
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage('Erreur : impossible d\'enregistrer dans ce dossier.');
    }
  };

  const handleSimulateBuild = () => {
    kernelInstance.logSyscall('sys_execve', `path="/usr/bin/gcc", args="-m32 -c ${filePath}"`, 'pid=105', 'kore-edit');
    if (filePath.endsWith('.asm')) {
      setStatusMessage('Assembleur NASM : 0 erreurs. Code machine x86 généré (secteur de boot 512 octets prêt).');
    } else if (filePath.endsWith('.c')) {
      setStatusMessage('Compilateur GCC freestanding : Syntaxe valide ! Fonctions VGA et Interruptions vérifiées.');
    } else {
      setStatusMessage('Document texte validé et synchronisé avec le cache VFS.');
    }
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const linesCount = content.split('\n').length;
  const charsCount = content.length;

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-xs select-text">
      {/* Barre d'outils supérieure */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900 border-b border-slate-800 shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={filePath}
            onChange={e => {
              setFilePath(e.target.value);
              setIsSaved(false);
            }}
            className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs w-48 sm:w-64"
          />
          {!isSaved && (
            <span className="text-[10px] text-amber-400 font-medium whitespace-nowrap">● Modifié</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Charger modèles d'exemples de code OS */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 mr-2">
            <span className="text-slate-500">Exemples :</span>
            <button
              onClick={() => loadFile('/kernel/kernel.c')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              kernel.c
            </button>
            <button
              onClick={() => loadFile('/kernel/boot.asm')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              boot.asm
            </button>
            <button
              onClick={() => loadFile('/kernel/framebuffer.c')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              framebuffer.c
            </button>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-sans text-xs font-medium transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Enregistrer</span>
          </button>
          <button
            onClick={handleSimulateBuild}
            title="Vérifier la syntaxe et simuler la compilation C / ASM"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-900/40 font-sans text-xs font-medium transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Compiler</span>
          </button>
        </div>
      </div>

      {/* Message de statut temporaire */}
      {statusMessage && (
        <div className="px-3 py-1.5 bg-emerald-950/80 border-b border-emerald-800/80 text-emerald-300 flex items-center gap-2 text-[11px] animate-fadeIn select-none">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Éditeur de texte avec numéros de lignes */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Colonne numéros de lignes */}
        <div className="w-12 bg-slate-900/60 border-r border-slate-800/80 py-3 pr-2 text-right text-slate-600 font-mono text-xs select-none overflow-hidden shrink-0 tabular-nums">
          {Array.from({ length: linesCount }, (_, i) => (
            <div key={i} className="leading-5 h-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea de saisie */}
        <textarea
          value={content}
          onChange={e => {
            setContent(e.target.value);
            setIsSaved(false);
          }}
          spellCheck={false}
          className="flex-1 h-full p-3 bg-slate-950 text-slate-200 focus:outline-none resize-none font-mono text-xs leading-5 whitespace-pre overflow-auto"
        />
      </div>

      {/* Barre d'état inférieure */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-300">{filePath}</span>
          </span>
          <span>·</span>
          <span>Encodage: UTF-8</span>
          <span>·</span>
          <span>Tabulation: 4 espaces</span>
        </div>
        <div className="flex items-center gap-3 tabular-nums">
          <span>{linesCount} lignes</span>
          <span>{charsCount} caractères</span>
        </div>
      </div>
    </div>
  );
};

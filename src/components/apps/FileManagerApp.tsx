import React, { useState, useEffect } from 'react';
import { vfsInstance, VFSNode } from '../../os/vfs';
import { kernelInstance } from '../../os/kernel';
import {
  Folder,
  FileText,
  FileCode,
  FolderPlus,
  FilePlus,
  Trash2,
  ChevronRight,
  HardDrive,
  Home,
  Cpu,
  Layers,
  ArrowLeft,
} from 'lucide-react';

interface FileManagerAppProps {
  initialPath?: string;
  onOpenFileInEditor?: (filePath: string) => void;
}

export const FileManagerApp: React.FC<FileManagerAppProps> = ({
  initialPath = '/home/user',
  onOpenFileInEditor,
}) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [items, setItems] = useState<VFSNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<VFSNode | null>(null);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingDir, setIsCreatingDir] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const refreshList = (path: string) => {
    kernelInstance.logSyscall('sys_opendir', `path="${path}"`, 'dir_fd=4', 'kore-fm');
    const nodes = vfsInstance.listDir(path);
    setItems(nodes);
    setSelectedNode(null);
  };

  useEffect(() => {
    refreshList(currentPath);
  }, [currentPath]);

  const handleNavigate = (targetPath: string) => {
    const node = vfsInstance.getNode(targetPath);
    if (node && node.type === 'dir') {
      setCurrentPath(targetPath);
    }
  };

  const handleNavigateUp = () => {
    if (currentPath === '/') return;
    const lastSlash = currentPath.lastIndexOf('/');
    const parent = lastSlash === 0 ? '/' : currentPath.slice(0, lastSlash);
    handleNavigate(parent);
  };

  const handleCreateFile = () => {
    if (!newItemName.trim()) return;
    const target = vfsInstance.resolvePath(currentPath, newItemName.trim());
    vfsInstance.writeFile(target, '// Nouveau fichier source KoreOS\n');
    kernelInstance.logSyscall('sys_creat', `path="${target}", mode=0644`, 'fd=5', 'kore-fm');
    setNewItemName('');
    setIsCreatingFile(false);
    refreshList(currentPath);
  };

  const handleCreateDir = () => {
    if (!newItemName.trim()) return;
    const target = vfsInstance.resolvePath(currentPath, newItemName.trim());
    vfsInstance.createDir(target);
    kernelInstance.logSyscall('sys_mkdir', `path="${target}"`, '0 (SUCCESS)', 'kore-fm');
    setNewItemName('');
    setIsCreatingDir(false);
    refreshList(currentPath);
  };

  const handleDelete = (path: string) => {
    vfsInstance.deleteNode(path);
    kernelInstance.logSyscall('sys_unlink', `path="${path}"`, '0 (SUCCESS)', 'kore-fm');
    refreshList(currentPath);
  };

  const handleItemDoubleClick = (item: VFSNode) => {
    if (item.type === 'dir') {
      handleNavigate(item.path);
    } else if (onOpenFileInEditor) {
      onOpenFileInEditor(item.path);
    }
  };

  // Breadcrumbs
  const pathParts = currentPath.split('/').filter(Boolean);

  const quickLinks = [
    { name: 'Racine (/)', path: '/', icon: <HardDrive className="w-4 h-4 text-slate-400" /> },
    { name: 'Maison (~)', path: '/home/user', icon: <Home className="w-4 h-4 text-cyan-400" /> },
    { name: 'Noyau (/kernel)', path: '/kernel', icon: <Cpu className="w-4 h-4 text-emerald-400" /> },
    { name: 'Système (/etc)', path: '/etc', icon: <Layers className="w-4 h-4 text-amber-400" /> },
    { name: 'Journaux (/var/log)', path: '/var/log', icon: <FileText className="w-4 h-4 text-indigo-400" /> },
  ];

  return (
    <div className="flex h-full bg-slate-950 text-slate-200 text-xs">
      {/* Panneau latéral gauche (Favoris système) */}
      <div className="w-48 bg-slate-900/90 border-r border-slate-800 p-3 flex flex-col gap-1 shrink-0">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
          Emplacements
        </span>
        {quickLinks.map(link => {
          const isActive = currentPath === link.path;
          return (
            <button
              key={link.path}
              onClick={() => handleNavigate(link.path)}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                isActive ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {link.icon}
              <span className="truncate">{link.name}</span>
            </button>
          );
        })}

        <div className="mt-auto p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300 mb-1">VFS Posix</div>
          <p className="text-[10px] leading-relaxed text-slate-500">
            Arborescence in-memory avec persistance synchronisée. Double-cliquez sur un fichier pour l'éditer.
          </p>
        </div>
      </div>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barre d'outils et chemin */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/60 border-b border-slate-800">
          <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto text-slate-300">
            <button
              onClick={handleNavigateUp}
              disabled={currentPath === '/'}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:bg-transparent mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNavigate('/')}
              className="hover:text-cyan-400 px-1 py-0.5 rounded font-mono font-medium"
            >
              /
            </button>
            {pathParts.map((part, index) => {
              const fullPath = '/' + pathParts.slice(0, index + 1).join('/');
              return (
                <React.Fragment key={fullPath}>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <button
                    onClick={() => handleNavigate(fullPath)}
                    className="hover:text-cyan-400 px-1 py-0.5 rounded font-mono truncate"
                  >
                    {part}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setIsCreatingFile(true);
                setIsCreatingDir(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nouveau fichier</span>
            </button>
            <button
              onClick={() => {
                setIsCreatingDir(true);
                setIsCreatingFile(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Nouveau dossier</span>
            </button>
          </div>
        </div>

        {/* Formulaire de création rapide de fichier/dossier */}
        {(isCreatingFile || isCreatingDir) && (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-cyan-800/40 text-slate-300">
            <span className="text-slate-400">
              {isCreatingFile ? 'Nom du nouveau fichier :' : 'Nom du nouveau dossier :'}
            </span>
            <input
              type="text"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              placeholder={isCreatingFile ? 'ex: test.c' : 'ex: mes_scripts'}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  isCreatingFile ? handleCreateFile() : handleCreateDir();
                } else if (e.key === 'Escape') {
                  setIsCreatingFile(false);
                  setIsCreatingDir(false);
                  setNewItemName('');
                }
              }}
              className="px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-cyan-200 focus:outline-none focus:border-cyan-400 text-xs font-mono"
            />
            <button
              onClick={isCreatingFile ? handleCreateFile : handleCreateDir}
              className="px-2.5 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
            >
              Créer
            </button>
            <button
              onClick={() => {
                setIsCreatingFile(false);
                setIsCreatingDir(false);
                setNewItemName('');
              }}
              className="px-2 py-0.5 text-slate-400 hover:text-slate-200"
            >
              Annuler
            </button>
          </div>
        )}

        {/* Grille des fichiers */}
        <div className="flex-1 p-4 overflow-y-auto">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <Folder className="w-10 h-10 opacity-30" />
              <p>Ce dossier est vide</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {items.map(item => {
                const isSelected = selectedNode?.path === item.path;
                let IconComponent = FileText;
                let iconColor = 'text-slate-400';

                if (item.type === 'dir') {
                  IconComponent = Folder;
                  iconColor = 'text-amber-400';
                } else if (item.name.endsWith('.c') || item.name.endsWith('.asm') || item.name.endsWith('.h')) {
                  IconComponent = FileCode;
                  iconColor = 'text-emerald-400';
                } else if (item.name.endsWith('.md') || item.name.endsWith('.txt')) {
                  IconComponent = FileText;
                  iconColor = 'text-cyan-400';
                }

                return (
                  <div
                    key={item.path}
                    onClick={() => setSelectedNode(item)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer group select-none ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <IconComponent className={`w-9 h-9 mb-2 transition-transform group-hover:scale-105 ${iconColor}`} />
                    <span className="w-full text-xs font-medium text-slate-200 truncate px-1 font-mono">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                      {item.type === 'dir' ? 'Dossier' : `${item.size} octets`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Barre d'état inférieure (Statut du fichier sélectionné) */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            {selectedNode ? (
              <span className="flex items-center gap-2">
                <span className="font-mono text-slate-200 font-semibold">{selectedNode.path}</span>
                <span>·</span>
                <span className="font-mono">{selectedNode.permissions}</span>
                <span>·</span>
                <span className="tabular-nums">{selectedNode.size} octets</span>
              </span>
            ) : (
              <span>{items.length} élément(s) dans le répertoire</span>
            )}
          </div>

          {selectedNode && (
            <div className="flex items-center gap-2">
              {selectedNode.type === 'file' && onOpenFileInEditor && (
                <button
                  onClick={() => onOpenFileInEditor(selectedNode.path)}
                  className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 transition-colors font-medium"
                >
                  Ouvrir dans l'éditeur
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedNode.path)}
                title="Supprimer définitivement"
                className="p-1 rounded text-rose-400 hover:bg-rose-950/60 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
  HardDrive,
  Home,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCw,
  Search,
  LayoutGrid,
  List,
  Monitor,
  Cpu,
  Clock,
  Download,
  File,
  Scissors,
  Copy,
} from 'lucide-react';

interface WindowsExplorerAppProps {
  initialPath?: string;
  onOpenFileInEditor?: (filePath: string) => void;
}

export const WindowsExplorerApp: React.FC<WindowsExplorerAppProps> = ({
  initialPath = '/home/user',
  onOpenFileInEditor,
}) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [items, setItems] = useState<VFSNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<VFSNode | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingDir, setIsCreatingDir] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const isThisPC = currentPath === 'this_pc';

  const refreshList = (path: string) => {
    if (path === 'this_pc') {
      setItems([]);
      setSelectedNode(null);
      return;
    }
    kernelInstance.logSyscall('sys_opendir', `path="${path}"`, 'dir_fd=4', 'explorer.exe');
    const nodes = vfsInstance.listDir(path);
    setItems(nodes);
    setSelectedNode(null);
  };

  useEffect(() => {
    refreshList(currentPath);
  }, [currentPath]);

  const navigateTo = (newPath: string) => {
    if (newPath === currentPath) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPath);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(newPath);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(prev);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(next);
    }
  };

  const handleUp = () => {
    if (isThisPC) return;
    if (currentPath === '/') {
      navigateTo('this_pc');
      return;
    }
    const lastSlash = currentPath.lastIndexOf('/');
    const parent = lastSlash === 0 ? '/' : currentPath.slice(0, lastSlash);
    navigateTo(parent);
  };

  const handleCreateFile = () => {
    if (!newItemName.trim() || isThisPC) return;
    const target = vfsInstance.resolvePath(currentPath, newItemName.trim());
    vfsInstance.writeFile(target, '// Nouveau fichier créé depuis l\'Explorateur Windows\n');
    kernelInstance.logSyscall('sys_creat', `path="${target}"`, 'fd=5', 'explorer.exe');
    setNewItemName('');
    setIsCreatingFile(false);
    refreshList(currentPath);
  };

  const handleCreateDir = () => {
    if (!newItemName.trim() || isThisPC) return;
    const target = vfsInstance.resolvePath(currentPath, newItemName.trim());
    vfsInstance.createDir(target);
    kernelInstance.logSyscall('sys_mkdir', `path="${target}"`, '0', 'explorer.exe');
    setNewItemName('');
    setIsCreatingDir(false);
    refreshList(currentPath);
  };

  const handleDelete = (path: string) => {
    vfsInstance.deleteNode(path);
    kernelInstance.logSyscall('sys_unlink', `path="${path}"`, '0', 'explorer.exe');
    refreshList(currentPath);
  };

  const handleItemDoubleClick = (item: VFSNode) => {
    if (item.type === 'dir') {
      navigateTo(item.path);
    } else if (onOpenFileInEditor) {
      onOpenFileInEditor(item.path);
    }
  };

  // Filtrage selon recherche
  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Formatage du chemin Windows
  const formatWindowsPath = (unixPath: string) => {
    if (unixPath === 'this_pc') return 'Ce PC';
    if (unixPath === '/') return 'Ce PC > Disque local (C:)';
    const parts = unixPath.split('/').filter(Boolean);
    return `Ce PC > Disque local (C:) > ${parts.join(' > ')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 text-xs select-none">
      {/* Barre d'onglet style Windows 11 */}
      <div className="flex items-center px-3 pt-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-slate-950 border-t border-x border-slate-700/70 text-slate-200 text-xs font-medium">
          <Folder className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate max-w-xs">
            {isThisPC ? 'Ce PC' : currentPath.split('/').pop() || 'Disque local (C:)'}
          </span>
        </div>
      </div>

      {/* Barre d'actions supérieure (Ribbon Windows 11) */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-300">
        <button
          onClick={() => {
            setIsCreatingDir(true);
            setIsCreatingFile(false);
          }}
          disabled={isThisPC}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-800 disabled:opacity-40 transition-colors"
        >
          <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
          <span>Nouveau dossier</span>
        </button>
        <button
          onClick={() => {
            setIsCreatingFile(true);
            setIsCreatingDir(false);
          }}
          disabled={isThisPC}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-800 disabled:opacity-40 transition-colors"
        >
          <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Nouveau document</span>
        </button>
        <div className="h-4 w-[1px] bg-slate-800 mx-1" />
        <button
          onClick={() => selectedNode && handleDelete(selectedNode.path)}
          disabled={!selectedNode}
          className="p-1.5 rounded-md hover:bg-slate-800 disabled:opacity-30 text-rose-400 transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-[1px] bg-slate-800 mx-1" />
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-800 text-slate-300 transition-colors"
          title="Changer d'affichage"
        >
          {viewMode === 'grid' ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
          <span>Affichage</span>
        </button>
      </div>

      {/* Barre d'adresse et de recherche */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/60 border-b border-slate-800">
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleBack}
            disabled={historyIndex <= 0}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Précédent"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Suivant"
          >
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={handleUp}
            className="p-1 rounded hover:bg-slate-800 transition-colors"
            title="Dossier parent"
          >
            <ArrowUp className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Fil d'Ariane façon Windows */}
        <div className="flex-1 flex items-center px-3 py-1 bg-slate-950 border border-slate-700/70 rounded-md text-xs text-slate-300 font-sans truncate">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400 mr-2 shrink-0" />
          <span className="truncate">{formatWindowsPath(currentPath)}</span>
          <button
            onClick={() => refreshList(currentPath)}
            className="ml-auto p-0.5 hover:text-white transition-colors"
            title="Actualiser"
          >
            <RotateCw className="w-3 h-3 text-slate-500 hover:text-slate-200" />
          </button>
        </div>

        {/* Champ de recherche dans le dossier */}
        <div className="relative w-48 sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Rechercher dans ${isThisPC ? 'Ce PC' : 'le dossier'}`}
            className="w-full pl-8 pr-3 py-1 rounded-md bg-slate-950 border border-slate-700/70 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>
      </div>

      {/* Formulaire de création rapide */}
      {(isCreatingFile || isCreatingDir) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-cyan-700/60 text-slate-200">
          <span>{isCreatingFile ? 'Nom du nouveau document :' : 'Nom du nouveau dossier :'}</span>
          <input
            type="text"
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            placeholder={isCreatingFile ? 'ex: rapport.txt' : 'ex: Projets'}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') isCreatingFile ? handleCreateFile() : handleCreateDir();
              else if (e.key === 'Escape') {
                setIsCreatingFile(false);
                setIsCreatingDir(false);
                setNewItemName('');
              }
            }}
            className="px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-cyan-200 focus:outline-none text-xs font-mono"
          />
          <button
            onClick={isCreatingFile ? handleCreateFile : handleCreateDir}
            className="px-2.5 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
          >
            Valider
          </button>
          <button
            onClick={() => {
              setIsCreatingFile(false);
              setIsCreatingDir(false);
              setNewItemName('');
            }}
            className="px-2 py-0.5 text-slate-400 hover:text-white"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Zone centrale : Volet de navigation à gauche + Grille de fichiers à droite */}
      <div className="flex-1 flex overflow-hidden">
        {/* Volet de navigation gauche (Accès rapide & Ce PC) */}
        <div className="w-52 bg-slate-900/80 border-r border-slate-800 p-2.5 flex flex-col gap-1 shrink-0 overflow-y-auto">
          {/* Accès rapide */}
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
            Accès rapide
          </div>
          <button
            onClick={() => navigateTo('this_pc')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              isThisPC ? 'bg-cyan-950 text-cyan-300 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span className="truncate">Ce PC</span>
          </button>
          <button
            onClick={() => navigateTo('/home/user')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              currentPath === '/home/user' ? 'bg-cyan-950 text-cyan-300 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-400" />
            <span className="truncate">Documents (user)</span>
          </button>

          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1 mt-3">
            Ce PC
          </div>
          <button
            onClick={() => navigateTo('/')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              currentPath === '/' ? 'bg-cyan-950 text-cyan-300 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span className="truncate">Disque local (C:)</span>
          </button>
          <button
            onClick={() => navigateTo('/kernel')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              currentPath === '/kernel' ? 'bg-cyan-950 text-cyan-300 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="truncate">Noyau (/kernel)</span>
          </button>
          <button
            onClick={() => navigateTo('/var/log')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              currentPath === '/var/log' ? 'bg-cyan-950 text-cyan-300 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="truncate">Journaux (/var/log)</span>
          </button>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950">
          {/* Si on est dans "Ce PC" */}
          {isThisPC ? (
            <div className="space-y-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Périphériques et lecteurs (1)
              </span>

              <div
                onClick={() => navigateTo('/')}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900/90 transition-all cursor-pointer w-72 group"
              >
                <HardDrive className="w-10 h-10 text-cyan-400 group-hover:scale-105 transition-transform" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-200 text-xs">Disque local (C:)</div>
                  <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full w-2" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">4.0 Go libres sur 4.0 Go (VFS)</div>
                </div>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <Folder className="w-12 h-12 opacity-30" />
              <p>Ce dossier est vide</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Affichage en Grille style Windows */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredItems.map(item => {
                const isSelected = selectedNode?.path === item.path;
                let Icon = FileText;
                let iconCol = 'text-slate-400';

                if (item.type === 'dir') {
                  Icon = Folder;
                  iconCol = 'text-amber-400';
                } else if (item.name.endsWith('.c') || item.name.endsWith('.asm') || item.name.endsWith('.h')) {
                  Icon = FileCode;
                  iconCol = 'text-emerald-400';
                } else if (item.name.endsWith('.md') || item.name.endsWith('.txt')) {
                  Icon = FileText;
                  iconCol = 'text-cyan-400';
                }

                return (
                  <div
                    key={item.path}
                    onClick={() => setSelectedNode(item)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    className={`flex flex-col items-center p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/70 shadow-md'
                        : 'bg-slate-900/30 border-transparent hover:bg-slate-900/80 hover:border-slate-700/60'
                    }`}
                  >
                    <Icon className={`w-10 h-10 mb-2 ${iconCol}`} />
                    <span className="text-xs font-medium text-slate-200 truncate w-full font-mono">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                      {item.type === 'dir' ? 'Dossier de fichiers' : `${item.size} octets`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Affichage en Liste détaillée style Windows */
            <table className="w-full text-left border-collapse text-xs">
              <thead className="border-b border-slate-800 text-[11px] text-slate-400">
                <tr>
                  <th className="py-2 px-3">Nom</th>
                  <th className="py-2 px-3">Modifié le</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3 text-right">Taille</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {filteredItems.map(item => {
                  const isSelected = selectedNode?.path === item.path;
                  return (
                    <tr
                      key={item.path}
                      onClick={() => setSelectedNode(item)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      className={`hover:bg-slate-900/60 cursor-pointer ${
                        isSelected ? 'bg-cyan-950/40 text-cyan-200' : ''
                      }`}
                    >
                      <td className="py-2 px-3 flex items-center gap-2">
                        {item.type === 'dir' ? (
                          <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        )}
                        <span className="truncate">{item.name}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-400 tabular-nums">{item.updatedAt}</td>
                      <td className="py-2 px-3 text-slate-400 font-sans">
                        {item.type === 'dir' ? 'Dossier de fichiers' : 'Fichier texte / source'}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400 tabular-nums">
                        {item.type === 'dir' ? '' : `${item.size} octets`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Barre d'état inférieure style Windows 11 */}
      <div className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div>
          {isThisPC ? (
            <span>1 lecteur disponible</span>
          ) : selectedNode ? (
            <span>
              1 élément sélectionné : <strong className="text-slate-200">{selectedNode.name}</strong> ({selectedNode.size} octets)
            </span>
          ) : (
            <span>{filteredItems.length} élément(s)</span>
          )}
        </div>

        {selectedNode && selectedNode.type === 'file' && onOpenFileInEditor && (
          <button
            onClick={() => onOpenFileInEditor(selectedNode.path)}
            className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 text-xs font-medium transition-colors"
          >
            Ouvrir dans KoreEdit
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { kernelInstance, SyscallLog } from '../os/kernel';
import { vfsInstance } from '../os/vfs';
import { Activity, Cpu, HardDrive, ShieldCheck, Terminal, Layers, Search, RefreshCw } from 'lucide-react';

export const KernelInspector: React.FC = () => {
  const [syscalls, setSyscalls] = useState<SyscallLog[]>([]);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'syscalls' | 'memory' | 'registers' | 'vfs'>('syscalls');
  const [registers, setRegisters] = useState({
    eax: '0x00000000',
    ebx: '0x08048000',
    ecx: '0x00000010',
    edx: '0x00000003',
    esi: '0x08049240',
    edi: '0x08049280',
    esp: '0xBFFFFF00',
    ebp: '0xBFFFFF80',
    eip: '0x00100412',
    cr0: '0x80000011 (Paging + Protected Mode)',
    cr3: '0x0009D000 (Page Directory Base)',
  });

  useEffect(() => {
    const update = () => {
      setSyscalls(kernelInstance.getSyscalls());
    };
    update();
    const unsub = kernelInstance.subscribe(update);
    return () => unsub();
  }, []);

  // Simuler de subtils changements de registres CPU
  useEffect(() => {
    const interval = setInterval(() => {
      setRegisters(prev => ({
        ...prev,
        eax: '0x' + Math.floor(Math.random() * 0xFFFFF).toString(16).padStart(8, '0').toUpperCase(),
        edx: '0x' + Math.floor(Math.random() * 0xFF).toString(16).padStart(8, '0').toUpperCase(),
        eip: '0x0010' + Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, '0').toUpperCase(),
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const filteredSyscalls = syscalls.filter(
    s => s.name.toLowerCase().includes(filter.toLowerCase()) || s.caller.toLowerCase().includes(filter.toLowerCase())
  );

  const totalVfsNodes = vfsInstance.getAllNodes();

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 text-xs overflow-hidden">
      {/* En-tête de l'inspecteur */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="font-semibold text-slate-100 text-sm">
              Inspecteur Interne du Noyau (Kernel Live DevTools)
            </h2>
            <p className="text-[11px] text-slate-400">
              Traçage en direct des interruptions, segments mémoire, registres CPU et VFS Inodes.
            </p>
          </div>
        </div>

        {/* Onglets de l'inspecteur */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('syscalls')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'syscalls' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Syscalls ({syscalls.length})
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'memory' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Carte Mémoire
          </button>
          <button
            onClick={() => setActiveTab('registers')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'registers' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Registres CPU
          </button>
          <button
            onClick={() => setActiveTab('vfs')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'vfs' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inodes VFS ({totalVfsNodes.length})
          </button>
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'syscalls' && (
          <div className="space-y-3">
            {/* Barre de recherche et filtre */}
            <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  placeholder="Filtrer par appel (sys_read, sys_write, sh...)"
                  className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                />
              </div>

              <div className="text-[11px] text-slate-400">
                Interception des appels système en direct (Syscall Table / <code>int 0x80</code>)
              </div>
            </div>

            {/* Flux des appels système */}
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-sans">
                  <tr>
                    <th className="py-2 px-3">Heure</th>
                    <th className="py-2 px-3">Appelant</th>
                    <th className="py-2 px-3">Syscall</th>
                    <th className="py-2 px-3">Paramètres</th>
                    <th className="py-2 px-3 text-right">Valeur de retour</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredSyscalls.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3 text-slate-500 tabular-nums">{log.timestamp}</td>
                      <td className="py-2 px-3 text-slate-400 font-sans font-medium">{log.caller}</td>
                      <td className="py-2 px-3 font-semibold text-cyan-400">{log.name}</td>
                      <td className="py-2 px-3 text-slate-300 truncate max-w-xs">{log.args}</td>
                      <td className="py-2 px-3 text-right font-medium text-emerald-400 tabular-nums">
                        {log.returnValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="space-y-4 max-w-3xl">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 leading-relaxed text-[11px]">
              <strong>Plan d'adressage virtuel (Virtual Memory Layout x86) :</strong>
              <p className="mt-1">
                La MMU (Memory Management Unit) du CPU traduit les adresses virtuelles des processus vers la RAM physique grâce à la pagination (Page Directory et Page Tables de 4 Ko).
              </p>
            </div>

            <div className="space-y-3 font-mono">
              {kernelInstance.memorySegments.map((seg, idx) => {
                let badgeClass = 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60';
                if (seg.type === 'kernel') badgeClass = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
                else if (seg.type === 'hardware') badgeClass = 'text-amber-400 bg-amber-950/60 border-amber-800/60';

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 text-sm">{seg.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${badgeClass}`}>
                          {seg.type.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-mono text-slate-400 tabular-nums font-semibold">{seg.sizeMb} Mo</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono mb-2">
                      <span>Début : <strong className="text-cyan-300">{seg.startAddress}</strong></span>
                      <span>Fin : <strong className="text-cyan-300">{seg.endAddress}</strong></span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-sans">{seg.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'registers' && (
          <div className="space-y-4 max-w-2xl">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 leading-relaxed text-[11px]">
              <strong>Registres CPU (Architecture x86 32-bit) :</strong>
              <p className="mt-1">
                Lors d'une commutation de tâche (Context Switch) ou d'un appel système (<code>int 0x80</code>), ces registres sont empilés dans la pile noyau pour restaurer l'état exact du thread.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              {Object.entries(registers).map(([reg, val]) => (
                <div key={reg} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 uppercase text-[11px] block">{reg}</span>
                  <span className="text-sm font-semibold text-cyan-300 tabular-nums">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vfs' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-[11px]">
              <strong>Table des Inodes VFS (Virtual File System) :</strong> {totalVfsNodes.length} nœuds actifs en mémoire
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-sans">
                  <tr>
                    <th className="py-2 px-3">Chemin VFS</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Droits</th>
                    <th className="py-2 px-3">Propriétaire</th>
                    <th className="py-2 px-3 text-right">Taille</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {totalVfsNodes.map(node => (
                    <tr key={node.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3 text-slate-200 font-semibold">{node.path}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-sans ${
                            node.type === 'dir' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {node.type === 'dir' ? 'Dossier' : 'Fichier'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">{node.permissions}</td>
                      <td className="py-2 px-3 text-slate-400">{node.owner}</td>
                      <td className="py-2 px-3 text-right text-slate-400 tabular-nums">{node.size} o</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

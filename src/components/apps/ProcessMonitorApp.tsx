import React, { useState, useEffect } from 'react';
import { kernelInstance, ProcessControlBlock } from '../../os/kernel';
import { Activity, Plus, Trash2, Cpu, HardDrive, ShieldAlert, Zap } from 'lucide-react';

export const ProcessMonitorApp: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessControlBlock[]>([]);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryInfo, setMemoryInfo] = useState({ usedMb: 0, totalMb: 4096, percentage: 0 });
  const [selectedPid, setSelectedPid] = useState<number | null>(null);

  useEffect(() => {
    const updateStats = () => {
      setProcesses(kernelInstance.getProcesses());
      setCpuUsage(kernelInstance.getTotalCpuUsage());
      setMemoryInfo(kernelInstance.getTotalMemoryUsage());
    };

    updateStats();
    const unsubscribe = kernelInstance.subscribe(updateStats);
    return () => unsubscribe();
  }, []);

  const handleKill = (pid: number) => {
    kernelInstance.killProcess(pid);
    if (selectedPid === pid) setSelectedPid(null);
  };

  const handleSpawn = () => {
    const apps = ['kore-calc', 'web-renderer', 'sound-daemon', 'network-stack', 'input-filter'];
    const chosen = apps[Math.floor(Math.random() * apps.length)];
    kernelInstance.spawnProcess(chosen, `/usr/bin/${chosen}`, Math.floor(Math.random() * 8000 + 1024));
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 text-xs select-none">
      {/* En-tête avec métriques système globales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-900 border-b border-slate-800 shrink-0">
        {/* Jauge CPU */}
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-md bg-cyan-950 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Charge CPU</span>
              <span className="font-mono font-semibold text-cyan-400 tabular-nums">{cpuUsage}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, cpuUsage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Jauge RAM */}
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-md bg-emerald-950 text-emerald-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Mémoire RAM</span>
              <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                {memoryInfo.usedMb} / {memoryInfo.totalMb} Mo
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${memoryInfo.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Processus actifs & Actions */}
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-slate-400 text-[11px] block">Tâches ordonnancées</span>
            <span className="font-mono text-base font-semibold text-slate-100 tabular-nums">
              {processes.length} processus
            </span>
          </div>
          <button
            onClick={handleSpawn}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau fork()</span>
          </button>
        </div>
      </div>

      {/* Tableau des processus ordonnancés (Process Control Block - PCB) */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-2 px-3">PID</th>
              <th className="py-2 px-3">Nom du Processus</th>
              <th className="py-2 px-3">État</th>
              <th className="py-2 px-3 text-right">CPU</th>
              <th className="py-2 px-3 text-right">Mémoire</th>
              <th className="py-2 px-3">Démarrage</th>
              <th className="py-2 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {processes.map(proc => {
              const isSelected = selectedPid === proc.pid;
              const isProtected = proc.pid <= 2;

              let stateBadge = 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50';
              if (proc.state === 'SLEEPING') {
                stateBadge = 'text-slate-400 bg-slate-800/60 border border-slate-700/50';
              } else if (proc.state === 'ZOMBIE') {
                stateBadge = 'text-rose-400 bg-rose-950/60 border border-rose-800/50';
              }

              return (
                <tr
                  key={proc.pid}
                  onClick={() => setSelectedPid(proc.pid)}
                  className={`hover:bg-slate-900/50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-cyan-950/30' : ''
                  }`}
                >
                  <td className="py-2 px-3 font-semibold text-cyan-400 tabular-nums">{proc.pid}</td>
                  <td className="py-2 px-3">
                    <span className="font-sans font-medium text-slate-200">{proc.name}</span>
                    <span className="block text-[10px] text-slate-500 font-mono">{proc.command}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-medium ${stateBadge}`}>
                      {proc.state}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-slate-300 tabular-nums">
                    {proc.cpuUsage.toFixed(1)}%
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400 tabular-nums">
                    {proc.memoryKb >= 1024 ? `${(proc.memoryKb / 1024).toFixed(1)} Mo` : `${proc.memoryKb} Ko`}
                  </td>
                  <td className="py-2 px-3 text-slate-500 tabular-nums">{proc.startedAt}</td>
                  <td className="py-2 px-3 text-center">
                    {isProtected ? (
                      <span className="text-[10px] text-slate-600 font-sans">Système</span>
                    ) : (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleKill(proc.pid);
                        }}
                        title="Tuer le processus (SIGKILL)"
                        className="p-1 rounded text-rose-400 hover:bg-rose-950/80 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Encadré explicatif en bas */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Ordonnanceur préemptif Round-Robin :</strong> Le timer matériel (PIT 100 Hz) interrompt le CPU pour sauvegarder les registres et basculer de thread (Context Switch).
          </span>
        </div>
        {selectedPid && (
          <button
            onClick={() => handleKill(selectedPid)}
            disabled={selectedPid <= 2}
            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-sans font-medium text-xs disabled:opacity-30 disabled:hover:bg-rose-600"
          >
            Tuer PID {selectedPid}
          </button>
        )}
      </div>
    </div>
  );
};

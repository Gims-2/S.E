/**
 * KoreOS Kernel Simulator
 * Gère l'ordonnancement des processus (PCB), les appels système (Syscalls),
 * l'espace mémoire virtuel et les métriques système.
 */

export interface ProcessControlBlock {
  pid: number;
  name: string;
  command: string;
  state: 'RUNNING' | 'SLEEPING' | 'ZOMBIE';
  cpuUsage: number;
  memoryKb: number;
  priority: number;
  startedAt: string;
}

export interface SyscallLog {
  id: string;
  name: string;
  args: string;
  returnValue: string;
  timestamp: string;
  caller: string;
}

export interface MemorySegment {
  name: string;
  startAddress: string;
  endAddress: string;
  sizeMb: number;
  description: string;
  type: 'kernel' | 'user' | 'hardware' | 'stack';
}

type KernelListener = () => void;

class Kernel {
  private processes: ProcessControlBlock[] = [];
  private syscalls: SyscallLog[] = [];
  private listeners: Set<KernelListener> = new Set();
  private nextPid = 100;
  private timerInterval: any = null;

  public memorySegments: MemorySegment[] = [
    {
      name: 'VGA / VBE Framebuffer LFB',
      startAddress: '0xE0000000',
      endAddress: '0xE1000000',
      sizeMb: 16,
      description: 'Mémoire vidéo linéaire pour le moteur d\'affichage GUI',
      type: 'hardware',
    },
    {
      name: 'Espace Noyau (High Memory)',
      startAddress: '0xC0000000',
      endAddress: '0xFFFFFFFF',
      sizeMb: 1024,
      description: 'Page tables, GDT, IDT, drivers périphériques et buffers DMA',
      type: 'kernel',
    },
    {
      name: 'Tas Utilisateur (User Heap)',
      startAddress: '0x08048000',
      endAddress: '0xBFFFFFFF',
      sizeMb: 2940,
      description: 'Allocations dynamiques malloc() des processus en espace utilisateur',
      type: 'user',
    },
    {
      name: 'Espace Bas & Vecteurs (IVT / BIOS)',
      startAddress: '0x00000000',
      endAddress: '0x000FFFFF',
      sizeMb: 1,
      description: 'Vecteurs d\'interruption du BIOS 16-bit et tampon d\'amorçage MBR',
      type: 'hardware',
    },
  ];

  constructor() {
    this.initKernel();
    this.startSchedulerSimulation();
  }

  private initKernel() {
    this.processes = [
      {
        pid: 1,
        name: 'init (kore-init)',
        command: '/sbin/init',
        state: 'RUNNING',
        cpuUsage: 0.2,
        memoryKb: 2048,
        priority: 0,
        startedAt: '00:00:01',
      },
      {
        pid: 2,
        name: 'kthreadd',
        command: '[kthreadd]',
        state: 'SLEEPING',
        cpuUsage: 0.1,
        memoryKb: 512,
        priority: -5,
        startedAt: '00:00:01',
      },
      {
        pid: 12,
        name: 'compositor (GUI Engine)',
        command: '/usr/bin/kore-compositor --vbe-lfb',
        state: 'RUNNING',
        cpuUsage: 2.4,
        memoryKb: 14200,
        priority: 10,
        startedAt: '00:00:02',
      },
      {
        pid: 24,
        name: 'vfs-cache-daemon',
        command: '/usr/bin/kore-vfsd',
        state: 'SLEEPING',
        cpuUsage: 0.3,
        memoryKb: 4096,
        priority: 5,
        startedAt: '00:00:03',
      },
      {
        pid: 45,
        name: 'tty1 (Shell bash)',
        command: '/bin/sh --interactive',
        state: 'RUNNING',
        cpuUsage: 0.8,
        memoryKb: 3120,
        priority: 0,
        startedAt: '00:00:04',
      },
    ];

    this.logSyscall('sys_boot', 'magic=0x1BADB002, flags=0x03', '0 (SUCCESS)', 'bootloader');
    this.logSyscall('sys_mmap', 'addr=0xE0000000, len=16MB, prot=PROT_WRITE', '0xE0000000', 'kore-compositor');
    this.logSyscall('sys_mount', 'source="ramdisk", target="/", type="ext2"', '0 (SUCCESS)', 'init');
  }

  private startSchedulerSimulation() {
    if (typeof window === 'undefined') return;
    this.timerInterval = setInterval(() => {
      // Fluctuations réalistes du scheduler
      this.processes = this.processes.map(proc => {
        if (proc.state === 'ZOMBIE') return proc;
        const variance = (Math.random() - 0.48) * 0.8;
        const newCpu = Math.max(0.1, Math.min(28.0, Number((proc.cpuUsage + variance).toFixed(1))));
        return {
          ...proc,
          cpuUsage: newCpu,
        };
      });
      this.notify();
    }, 2500);
  }

  public subscribe(listener: KernelListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public getProcesses(): ProcessControlBlock[] {
    return [...this.processes];
  }

  public getSyscalls(): SyscallLog[] {
    return [...this.syscalls];
  }

  public logSyscall(name: string, args: string, returnValue: string, caller: string): SyscallLog {
    const log: SyscallLog = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      args,
      returnValue,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour12: false, fractionalSecondDigits: 3 }),
      caller,
    };

    this.syscalls.unshift(log);
    if (this.syscalls.length > 50) {
      this.syscalls.pop();
    }
    this.notify();
    return log;
  }

  public spawnProcess(name: string, command: string, memKb = 4096): number {
    const pid = this.nextPid++;
    const now = new Date().toLocaleTimeString('fr-FR', { hour12: false });
    const newProc: ProcessControlBlock = {
      pid,
      name,
      command,
      state: 'RUNNING',
      cpuUsage: Number((Math.random() * 3 + 1.2).toFixed(1)),
      memoryKb: memKb,
      priority: 0,
      startedAt: now,
    };

    this.processes.push(newProc);
    this.logSyscall('sys_fork', `parent_pid=45`, `new_pid=${pid}`, 'sh');
    this.logSyscall('sys_execve', `path="${command}"`, '0 (SUCCESS)', name);
    this.notify();
    return pid;
  }

  public killProcess(pid: number): boolean {
    if (pid <= 2) {
      this.logSyscall('sys_kill', `pid=${pid}, sig=SIGTERM`, '-1 (EPERM: Kernel process protected)', 'sh');
      return false;
    }

    const index = this.processes.findIndex(p => p.pid === pid);
    if (index === -1) return false;

    const proc = this.processes[index];
    this.processes.splice(index, 1);
    this.logSyscall('sys_kill', `pid=${pid}, sig=SIGKILL`, '0 (SUCCESS)', 'sh');
    this.notify();
    return true;
  }

  public getTotalMemoryUsage(): { usedMb: number; totalMb: number; percentage: number } {
    const totalKb = this.processes.reduce((acc, p) => acc + p.memoryKb, 0);
    const usedMb = Math.round((totalKb / 1024) + 64); // +64MB kernel core
    const totalMb = 4096;
    return {
      usedMb,
      totalMb,
      percentage: Math.min(100, Math.round((usedMb / totalMb) * 100)),
    };
  }

  public getTotalCpuUsage(): number {
    const sum = this.processes.reduce((acc, p) => acc + p.cpuUsage, 0);
    return Math.min(100, Number(sum.toFixed(1)));
  }

  public destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}

export const kernelInstance = new Kernel();

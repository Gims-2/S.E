/**
 * KoreOS Shell & Terminal Engine
 * Analyseur syntaxique de ligne de commande (POSIX-like REPL)
 * avec redirection, gestion du VFS, appels système et interaction GUI.
 */

import { vfsInstance } from './vfs';
import { kernelInstance } from './kernel';

export interface TerminalOutputLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'system';
  content: string;
}

export interface ExecutionContext {
  cwd: string;
  setCwd: (path: string) => void;
  openAppWindow?: (appId: string, initialParam?: string) => void;
  toggleViewMode?: (mode: 'desktop' | 'cli' | 'inspector') => void;
  onClear?: () => void;
}

export function executeCommand(rawCommand: string, context: ExecutionContext): TerminalOutputLine[] {
  const trimmed = rawCommand.trim();
  if (!trimmed) return [];

  const { cwd, setCwd, openAppWindow, toggleViewMode } = context;

  // Enregistrer le syscall sys_read du clavier
  kernelInstance.logSyscall('sys_read', `fd=0 (stdin), count=${trimmed.length}`, `${trimmed.length} octets`, 'sh');

  // Gestion basique des redirections: `echo "hello" > file.txt` ou `>>`
  let commandStr = trimmed;
  let redirectFile: string | null = null;
  let redirectAppend = false;

  if (commandStr.includes('>>')) {
    const parts = commandStr.split('>>');
    commandStr = parts[0].trim();
    redirectFile = parts[1].trim();
    redirectAppend = true;
  } else if (commandStr.includes('>')) {
    const parts = commandStr.split('>');
    commandStr = parts[0].trim();
    redirectFile = parts[1].trim();
    redirectAppend = false;
  }

  const tokens = parseArguments(commandStr);
  const cmd = tokens[0]?.toLowerCase();
  const args = tokens.slice(1);

  let resultLines: TerminalOutputLine[] = [];

  switch (cmd) {
    case 'help': {
      resultLines = [
        { id: uid(), type: 'info', content: '=== COMMANDES DISPONIBLES DANS KORE-OS ===' },
        { id: uid(), type: 'output', content: '  Navigation & Fichiers :' },
        { id: uid(), type: 'output', content: '    ls [-la] [dir]    : Lister le contenu d\'un répertoire' },
        { id: uid(), type: 'output', content: '    cd [dir]          : Changer de répertoire courant (.. , ~, /)' },
        { id: uid(), type: 'output', content: '    pwd               : Afficher le chemin absolu courant' },
        { id: uid(), type: 'output', content: '    cat <file>        : Afficher le texte d\'un fichier' },
        { id: uid(), type: 'output', content: '    echo <texte> [> f]: Écrire du texte (redirection > ou >>)' },
        { id: uid(), type: 'output', content: '    touch <file>      : Créer un nouveau fichier vide' },
        { id: uid(), type: 'output', content: '    mkdir <dir>       : Créer un sous-répertoire' },
        { id: uid(), type: 'output', content: '    rm [-r] <cible>   : Supprimer un fichier ou un dossier' },
        { id: uid(), type: 'output', content: '    tree              : Visualiser l\'arborescence VFS complète' },
        { id: uid(), type: 'output', content: '  Système & Processus :' },
        { id: uid(), type: 'output', content: '    ps                : Lister les processus actifs (PCB)' },
        { id: uid(), type: 'output', content: '    kill <pid>        : Arrêter un processus par son PID' },
        { id: uid(), type: 'output', content: '    top               : Statut du CPU, de la RAM et des tâches' },
        { id: uid(), type: 'output', content: '    sysinfo, uname -a : Informations sur le noyau et le matériel' },
        { id: uid(), type: 'output', content: '    syscalls          : Inspecter les derniers appels système noyau' },
        { id: uid(), type: 'output', content: '    calc <expr>       : Calculatrice arithmétique pour dev OS' },
        { id: uid(), type: 'output', content: '  Interface Graphique (GUI) :' },
        { id: uid(), type: 'output', content: '    gui, desktop      : Basculer en mode Bureau graphique' },
        { id: uid(), type: 'output', content: '    open <app>        : Lancer une fenêtre d\'application GUI :' },
        { id: uid(), type: 'output', content: '                        editor, files, monitor, guide, framebuffer, snake' },
        { id: uid(), type: 'output', content: '    nano, edit <file> : Ouvrir directement un fichier dans l\'éditeur GUI' },
        { id: uid(), type: 'output', content: '  Divers :' },
        { id: uid(), type: 'output', content: '    clear             : Nettoyer l\'écran du terminal' },
        { id: uid(), type: 'output', content: '    matrix            : Effet pluie numérique Matrix' },
        { id: uid(), type: 'output', content: '    date, whoami      : Date courante et utilisateur actif' },
        { id: uid(), type: 'output', content: '    reboot            : Redémarrer la machine virtuelle' },
      ];
      break;
    }

    case 'pwd': {
      kernelInstance.logSyscall('sys_getcwd', `buf=0x08048200, size=256`, `"${cwd}"`, 'pwd');
      resultLines = [{ id: uid(), type: 'output', content: cwd }];
      break;
    }

    case 'cd': {
      const target = args[0] || '~';
      const resolved = vfsInstance.resolvePath(cwd, target);
      const node = vfsInstance.getNode(resolved);

      if (!node) {
        kernelInstance.logSyscall('sys_chdir', `path="${resolved}"`, '-1 (ENOENT: No such file or directory)', 'cd');
        resultLines = [{ id: uid(), type: 'error', content: `cd: aucun dossier de ce nom : ${target}` }];
      } else if (node.type !== 'dir') {
        kernelInstance.logSyscall('sys_chdir', `path="${resolved}"`, '-1 (ENOTDIR: Not a directory)', 'cd');
        resultLines = [{ id: uid(), type: 'error', content: `cd: n'est pas un dossier : ${target}` }];
      } else {
        kernelInstance.logSyscall('sys_chdir', `path="${resolved}"`, '0 (SUCCESS)', 'cd');
        setCwd(resolved);
      }
      break;
    }

    case 'ls': {
      let showAll = false;
      let longFormat = false;
      let targetArg: string | undefined;

      for (const arg of args) {
        if (arg.startsWith('-')) {
          if (arg.includes('a')) showAll = true;
          if (arg.includes('l')) longFormat = true;
        } else {
          targetArg = arg;
        }
      }

      const targetPath = targetArg ? vfsInstance.resolvePath(cwd, targetArg) : cwd;
      kernelInstance.logSyscall('sys_opendir', `name="${targetPath}"`, 'dir_fd=3', 'ls');

      const items = vfsInstance.listDir(targetPath);

      if (items.length === 0 && !vfsInstance.getNode(targetPath)) {
        resultLines = [{ id: uid(), type: 'error', content: `ls: impossible d'accéder à '${targetArg}': Aucun fichier de ce type` }];
      } else if (longFormat) {
        const header = `total ${items.length}`;
        const lines = items.map(item => {
          const typeChar = item.type === 'dir' ? 'd' : '-';
          const sizeStr = item.size.toString().padStart(6, ' ');
          const nameColored = item.type === 'dir' ? `${item.name}/` : item.name;
          return `${typeChar}${item.permissions} 1 ${item.owner.padEnd(5, ' ')} staff ${sizeStr} ${item.updatedAt} ${nameColored}`;
        });
        resultLines = [
          { id: uid(), type: 'info', content: header },
          ...lines.map(l => ({ id: uid(), type: 'output' as const, content: l })),
        ];
      } else {
        // Format compact
        const formatted = items.map(i => (i.type === 'dir' ? `📁 ${i.name}/` : `📄 ${i.name}`)).join('    ');
        resultLines = [{ id: uid(), type: 'output', content: formatted || '(dossier vide)' }];
      }
      break;
    }

    case 'cat': {
      if (args.length === 0) {
        resultLines = [{ id: uid(), type: 'error', content: 'Usage: cat <nom_de_fichier>' }];
        break;
      }
      const targetPath = vfsInstance.resolvePath(cwd, args[0]);
      kernelInstance.logSyscall('sys_open', `path="${targetPath}", flags=O_RDONLY`, 'fd=3', 'cat');

      const content = vfsInstance.readFile(targetPath);
      if (content === null) {
        const node = vfsInstance.getNode(targetPath);
        if (node?.type === 'dir') {
          resultLines = [{ id: uid(), type: 'error', content: `cat: ${args[0]}: Est un dossier` }];
        } else {
          resultLines = [{ id: uid(), type: 'error', content: `cat: ${args[0]}: Aucun fichier de ce type` }];
        }
      } else {
        kernelInstance.logSyscall('sys_read', `fd=3, count=${content.length}`, `${content.length} octets`, 'cat');
        const split = content.split('\n');
        resultLines = split.map(line => ({ id: uid(), type: 'output', content: line }));
      }
      break;
    }

    case 'echo': {
      const text = args.join(' ').replace(/^["']|["']$/g, '');
      resultLines = [{ id: uid(), type: 'output', content: text }];
      break;
    }

    case 'touch': {
      if (args.length === 0) {
        resultLines = [{ id: uid(), type: 'error', content: 'Usage: touch <nom_de_fichier>' }];
        break;
      }
      const targetPath = vfsInstance.resolvePath(cwd, args[0]);
      kernelInstance.logSyscall('sys_open', `path="${targetPath}", flags=O_CREAT|O_WRONLY`, 'fd=3', 'touch');
      const success = vfsInstance.writeFile(targetPath, '');
      if (success) {
        resultLines = [{ id: uid(), type: 'success', content: `Fichier créé : ${args[0]}` }];
      } else {
        resultLines = [{ id: uid(), type: 'error', content: `touch: impossible de créer ${args[0]}` }];
      }
      break;
    }

    case 'mkdir': {
      if (args.length === 0) {
        resultLines = [{ id: uid(), type: 'error', content: 'Usage: mkdir <nom_de_dossier>' }];
        break;
      }
      const targetPath = vfsInstance.resolvePath(cwd, args[0]);
      kernelInstance.logSyscall('sys_mkdir', `path="${targetPath}", mode=0755`, '0 (SUCCESS)', 'mkdir');
      const success = vfsInstance.createDir(targetPath);
      if (success) {
        resultLines = [{ id: uid(), type: 'success', content: `Dossier créé : ${args[0]}` }];
      } else {
        resultLines = [{ id: uid(), type: 'error', content: `mkdir: impossible de créer le dossier '${args[0]}'` }];
      }
      break;
    }

    case 'rm': {
      if (args.length === 0) {
        resultLines = [{ id: uid(), type: 'error', content: 'Usage: rm [-r] <cible>' }];
        break;
      }
      const target = args[args.length - 1];
      const targetPath = vfsInstance.resolvePath(cwd, target);
      kernelInstance.logSyscall('sys_unlink', `path="${targetPath}"`, '0 (SUCCESS)', 'rm');
      const success = vfsInstance.deleteNode(targetPath);
      if (success) {
        resultLines = [{ id: uid(), type: 'success', content: `Supprimé : ${target}` }];
      } else {
        resultLines = [{ id: uid(), type: 'error', content: `rm: impossible de supprimer '${target}'` }];
      }
      break;
    }

    case 'tree': {
      const nodes = vfsInstance.getAllNodes().sort((a, b) => a.path.localeCompare(b.path));
      resultLines = [
        { id: uid(), type: 'info', content: 'Arborescence du système de fichiers virtuel KoreOS :' },
        ...nodes.map(n => {
          const depth = n.path.split('/').filter(Boolean).length;
          const indent = '  '.repeat(depth);
          const icon = n.type === 'dir' ? '📁' : '📄';
          return { id: uid(), type: 'output' as const, content: `${indent}${icon} ${n.name}` };
        }),
      ];
      break;
    }

    case 'ps': {
      kernelInstance.logSyscall('sys_getprocs', `buf=0x08049000`, '5 procs', 'ps');
      const procs = kernelInstance.getProcesses();
      resultLines = [
        { id: uid(), type: 'info', content: '  PID  CPU%   MEM(KB)  STAT      COMMANDE' },
        ...procs.map(p => ({
          id: uid(),
          type: 'output' as const,
          content: `${p.pid.toString().padStart(5, ' ')}  ${p.cpuUsage.toFixed(1).padStart(4, ' ')}%  ${p.memoryKb.toString().padStart(7, ' ')}  ${p.state.padEnd(8, ' ')}  ${p.name}`,
        })),
      ];
      break;
    }

    case 'kill': {
      if (args.length === 0) {
        resultLines = [{ id: uid(), type: 'error', content: 'Usage: kill <pid>' }];
        break;
      }
      const pid = parseInt(args[0], 10);
      if (isNaN(pid)) {
        resultLines = [{ id: uid(), type: 'error', content: `kill: PID invalide: ${args[0]}` }];
      } else {
        const ok = kernelInstance.killProcess(pid);
        if (ok) {
          resultLines = [{ id: uid(), type: 'success', content: `Processus ${pid} terminé avec succès (SIGKILL envoyé)` }];
        } else {
          resultLines = [{ id: uid(), type: 'error', content: `kill: impossible d'arrêter le processus ${pid} (protégé ou inexistant)` }];
        }
      }
      break;
    }

    case 'top': {
      const cpu = kernelInstance.getTotalCpuUsage();
      const mem = kernelInstance.getTotalMemoryUsage();
      const procs = kernelInstance.getProcesses();
      resultLines = [
        { id: uid(), type: 'info', content: `[KORE-OS TOP] CPU Global: ${cpu}% | RAM: ${mem.usedMb}MB / ${mem.totalMb}MB (${mem.percentage}%)` },
        { id: uid(), type: 'output', content: `Tâches: ${procs.length} total, 1 en cours, ${procs.length - 1} en veille` },
        { id: uid(), type: 'output', content: '  PID  NOM                     CPU%   MÉMOIRE' },
        ...procs.map(p => ({
          id: uid(),
          type: 'output' as const,
          content: `${p.pid.toString().padStart(5, ' ')}  ${p.name.padEnd(22, ' ')}  ${p.cpuUsage.toFixed(1)}%  ${p.memoryKb} KB`,
        })),
      ];
      break;
    }

    case 'sysinfo':
    case 'uname': {
      kernelInstance.logSyscall('sys_uname', `buf=0x0804A000`, '0 (SUCCESS)', 'uname');
      resultLines = [
        { id: uid(), type: 'info', content: '================ KORE-OS HYBRID KERNEL ================' },
        { id: uid(), type: 'output', content: 'Système d\'exploitation : KoreOS v2.4 (x86_64 / Protected Mode)' },
        { id: uid(), type: 'output', content: 'Architecture           : Hybride CLI (VGA text 0xB8000) + GUI (VBE LFB 0xE0000000)' },
        { id: uid(), type: 'output', content: 'Moteur d\'affichage     : KoreCompositor (Double-buffering VSync 60Hz)' },
        { id: uid(), type: 'output', content: 'Système de fichiers    : KoreVFS Inode-based POSIX Tree' },
        { id: uid(), type: 'output', content: 'Mémoire RAM totale     : 4096 Mo (4 Go virtuels)' },
        { id: uid(), type: 'output', content: 'Noyau                  : Micro-kernel modulaire avec ordonnanceur Round-Robin' },
        { id: uid(), type: 'info', content: '=======================================================' },
      ];
      break;
    }

    case 'syscalls': {
      const calls = kernelInstance.getSyscalls().slice(0, 10);
      resultLines = [
        { id: uid(), type: 'info', content: '=== JOURNAL DES DERNIERS APPELS SYSTÈME (SYSCALLS TRACE) ===' },
        ...calls.map(c => ({
          id: uid(),
          type: 'output' as const,
          content: `[${c.timestamp}] ${c.caller} -> ${c.name}(${c.args}) => ${c.returnValue}`,
        })),
      ];
      break;
    }

    case 'calc': {
      if (args.length === 0) {
        resultLines = [{ id: uid(), type: 'error', content: 'Usage: calc <expression arithmétique> (ex: calc 1024 * 768 * 4)' }];
        break;
      }
      const expr = args.join(' ');
      try {
        // Évaluation sécurisée d'arithmétique pure
        if (!/^[0-9+\-*/().\s^%]+$/.test(expr)) {
          throw new Error('Caractères non autorisés');
        }
        // eslint-disable-next-line no-eval
        const val = Function(`'use strict'; return (${expr})`)();
        resultLines = [
          { id: uid(), type: 'output', content: `${expr} = ${val}` },
          { id: uid(), type: 'info', content: `Note technique : ${val} octets = ${(val / 1024).toFixed(2)} Ko = ${(val / (1024 * 1024)).toFixed(2)} Mo` },
        ];
      } catch {
        resultLines = [{ id: uid(), type: 'error', content: `Erreur d'évaluation dans l'expression : ${expr}` }];
      }
      break;
    }

    case 'gui':
    case 'desktop': {
      if (toggleViewMode) {
        toggleViewMode('desktop');
        resultLines = [{ id: uid(), type: 'success', content: 'Bascule vers l\'environnement graphique de bureau (GUI Compositor)...' }];
      }
      break;
    }

    case 'open': {
      const targetApp = args[0]?.toLowerCase();
      if (!targetApp) {
        resultLines = [{ id: uid(), type: 'error', content: 'Usage: open <editor | files | monitor | guide | framebuffer | snake | terminal>' }];
        break;
      }
      if (openAppWindow) {
        openAppWindow(targetApp);
        kernelInstance.spawnProcess(`app-${targetApp}`, `/usr/bin/${targetApp}`);
        resultLines = [{ id: uid(), type: 'success', content: `Lancement de la fenêtre GUI pour l'application : ${targetApp}` }];
      }
      break;
    }

    case 'nano':
    case 'edit': {
      const targetFile = args[0];
      if (!targetFile) {
        resultLines = [{ id: uid(), type: 'error', content: 'Usage: nano <fichier>' }];
        break;
      }
      const resolved = vfsInstance.resolvePath(cwd, targetFile);
      if (openAppWindow) {
        openAppWindow('editor', resolved);
        resultLines = [{ id: uid(), type: 'success', content: `Ouverture de '${resolved}' dans l'éditeur graphique KoreEdit...` }];
      }
      break;
    }

    case 'guide': {
      if (openAppWindow) {
        openAppWindow('guide');
        resultLines = [{ id: uid(), type: 'success', content: 'Ouverture du guide complet de conception d\'un système d\'exploitation hybride...' }];
      }
      break;
    }

    case 'matrix': {
      resultLines = [
        { id: uid(), type: 'success', content: '01001011 01101111 01110010 01100101 01001111 01010011' },
        { id: uid(), type: 'success', content: 'Wake up, Neo... Le système d\'exploitation est en pleine exécution.' },
        { id: uid(), type: 'success', content: 'VFS monté. Framebuffer actif. GDT/IDT synchronisées.' },
      ];
      break;
    }

    case 'whoami': {
      resultLines = [{ id: uid(), type: 'output', content: 'user (uid=1000 gid=1000 groups=1000(user),4(adm),27(sudo))' }];
      break;
    }

    case 'date': {
      resultLines = [{ id: uid(), type: 'output', content: new Date().toString() }];
      break;
    }

    case 'reboot': {
      resultLines = [
        { id: uid(), type: 'system', content: '[KORE-OS] Arrêt des services et synchronisation des buffers VFS...' },
        { id: uid(), type: 'system', content: '[KORE-OS] Triple fault simulé -> Redémarrage du noyau' },
      ];
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      break;
    }

    default: {
      resultLines = [{ id: uid(), type: 'error', content: `${cmd}: commande introuvable. Tapez 'help' pour voir la liste des commandes.` }];
      break;
    }
  }

  // Si redirection vers un fichier
  if (redirectFile && resultLines.length > 0) {
    const targetPath = vfsInstance.resolvePath(cwd, redirectFile);
    const textToSave = resultLines.map(r => r.content).join('\n');
    let finalContent = textToSave;

    if (redirectAppend) {
      const existing = vfsInstance.readFile(targetPath) || '';
      finalContent = existing + (existing.endsWith('\n') ? '' : '\n') + textToSave;
    }

    vfsInstance.writeFile(targetPath, finalContent);
    kernelInstance.logSyscall('sys_write', `file="${targetPath}", len=${finalContent.length}`, `${finalContent.length} octets`, 'sh');

    return [{ id: uid(), type: 'success', content: `Sortie redirigée vers ${redirectFile} (${finalContent.length} octets)` }];
  }

  return resultLines;
}

function parseArguments(cmd: string): string[] {
  const matches: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < cmd.length; i++) {
    const char = cmd[i];
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
    } else if (char === ' ' && !inQuotes) {
      if (current.length > 0) {
        matches.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current.length > 0) {
    matches.push(current);
  }

  return matches;
}

function uid(): string {
  return Math.random().toString(36).substring(2, 9);
}

import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  Monitor,
  Cpu,
  Layers,
  Code2,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

export const GuideOSApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'boot' | 'kernel' | 'cli' | 'gui' | 'build'>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (codeText: string, key: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const tabs = [
    { id: 'overview', label: '1. Vision d\'Ensemble', icon: <Layers className="w-4 h-4" /> },
    { id: 'boot', label: '2. Bootloader & CPU', icon: <Cpu className="w-4 h-4" /> },
    { id: 'kernel', label: '3. Noyau & IDT/GDT', icon: <Zap className="w-4 h-4" /> },
    { id: 'cli', label: '4. Moteur Terminal (CLI)', icon: <Terminal className="w-4 h-4" /> },
    { id: 'gui', label: '5. Moteur Graphique (GUI)', icon: <Monitor className="w-4 h-4" /> },
    { id: 'build', label: '6. Compiler & Tester (QEMU)', icon: <Code2 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-full bg-slate-950 text-slate-200 text-xs select-text">
      {/* Navigation latérale des chapitres */}
      <div className="w-56 bg-slate-900 border-r border-slate-800 p-3 flex flex-col gap-1.5 shrink-0 select-none">
        <div className="flex items-center gap-2 px-2 py-1 mb-2 text-cyan-400 font-semibold text-xs tracking-wide">
          <BookOpen className="w-4 h-4" />
          <span>Guide d'Ingénierie OS</span>
        </div>

        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 font-medium border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}

        <div className="mt-auto p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300 block mb-1">Architecture Hybride</span>
          <p className="text-[10px] leading-relaxed text-slate-500">
            Ce cours détaille les étapes réelles pour concevoir un OS bootable en C et Assembleur x86 combinant TTY texte et Framebuffer fenêtré.
          </p>
        </div>
      </div>

      {/* Contenu principal du chapitre */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                Chapitre 1
              </span>
              <h2 className="text-xl font-bold text-slate-100 font-sans">
                Comment concevoir un Système d'Exploitation Hybride (CLI + GUI)
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Créer un système d'exploitation à partir de zéro (from scratch) est l'un des projets informatiques les plus formateurs. Un OS hybride réunit la puissance et l'efficacité d'un terminal en ligne de commande (façon Unix/Linux) et la convivialité d'un environnement graphique fenêtré.
              </p>
            </div>

            {/* Schéma architectural */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 select-none">
              <span className="font-semibold text-slate-200 text-xs block">
                Pile Architecturale de l'OS Hybride :
              </span>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-200 flex items-center justify-between">
                  <span>ESPACE UTILISATEUR (Ring 3)</span>
                  <span className="text-[10px] bg-cyan-900/60 px-2 py-0.5 rounded">Applications : Shell CLI, Éditeur, Explorateur, Jeux</span>
                </div>
                <div className="text-center text-slate-600 text-xs">↕ Appels Système (Syscalls : int 0x80 ou instruction sysenter) ↕</div>
                <div className="p-2.5 rounded-lg bg-indigo-950/70 border border-indigo-800/60 text-indigo-200 flex items-center justify-between">
                  <span>SERVEUR D'AFFICHAGE & VFS</span>
                  <span className="text-[10px] bg-indigo-900/60 px-2 py-0.5 rounded">Window Compositor & Inode Tree</span>
                </div>
                <div className="text-center text-slate-600 text-xs">↕ Abstraction Matérielle & Pilotes ↕</div>
                <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-200 flex items-center justify-between">
                  <span>NOYAU DU SYSTÈME (Ring 0 Kernel)</span>
                  <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded">Ordonnanceur, Gestionnaire Mémoire (Paging), IDT, GDT</span>
                </div>
                <div className="text-center text-slate-600 text-xs">↕ Accès Direct au Matériel ↕</div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-between">
                  <span>MATÉRIEL PHYSIQUE (Hardware)</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded">CPU x86_64, RAM, Clavier PS/2/USB, VRAM Framebuffer</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                  <Terminal className="w-4 h-4" />
                  <span>Le Mode Texte Terminal (CLI)</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  En mode texte VGA standard, le GPU réserve l'adresse mémoire <strong>0xB8000</strong>. Chaque cellule fait 2 octets : le caractère ASCII et son attribut de couleur (fond + texte). Le CPU peut y écrire instantanément sans calcul de pixels complexes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                  <Monitor className="w-4 h-4" />
                  <span>Le Mode Graphique Fenêtré (GUI)</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Le BIOS ou GRUB active le mode VBE (VESA) avec un <strong>Linear Framebuffer (LFB)</strong> en mémoire (ex: à 0xE0000000). Chaque pixel est un entier 32-bit (ARGB). Le gestionnaire de fenêtres compose les bordures, textes et icônes dans un Back-Buffer avant de l'envoyer à l'écran.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveTab('boot')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                <span>Chapitre suivant : Le Bootloader</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'boot' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                Chapitre 2
              </span>
              <h2 className="text-xl font-bold text-slate-100 font-sans">
                Le Bootloader et la transition vers le Mode Protégé 32-bit
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                À la mise sous tension, le CPU démarre en <strong>Real Mode 16-bit</strong> (comme un processeur 8086 de 1978). Le BIOS charge les 512 premiers octets du disque (le Master Boot Record) à l'adresse <code>0x7C00</code>. Le bootloader a 3 missions capitales :
              </p>
            </div>

            <ol className="list-decimal pl-4 space-y-2 text-slate-300 leading-relaxed">
              <li>
                <strong>Activer la ligne A20</strong> : débloquer l'accès à la mémoire au-delà de 1 Mo.
              </li>
              <li>
                <strong>Charger la GDT (Global Descriptor Table)</strong> : définir les segments de code et de données plats (Flat Memory Model de 4 Go).
              </li>
              <li>
                <strong>Passer en Mode Protégé 32-bit</strong> : mettre le bit 0 du registre CPU <code>CR0</code> à 1 (Protection Enable).
              </li>
            </ol>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-cyan-300">boot.asm (NASM 16-bit vers 32-bit)</span>
                <button
                  onClick={() => handleCopy(CODE_BOOT_ASM, 'boot')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {copiedCode === 'boot' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'boot' ? 'Copié !' : 'Copier le code'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                {CODE_BOOT_ASM}
              </pre>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              <strong>Astuce pour gagner du temps :</strong> Dans un premier projet sérieux, vous pouvez utiliser <strong>GRUB</strong> (spécification Multiboot) qui effectue déjà cette transition en mode protégé et vous passe directement la main en C avec les paramètres de mémoire et de Framebuffer déjà initialisés !
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveTab('kernel')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                <span>Chapitre suivant : Le Noyau & IDT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'kernel' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                Chapitre 3
              </span>
              <h2 className="text-xl font-bold text-slate-100 font-sans">
                Le Noyau Minimal, la Table des Interruptions (IDT) et la Mémoire
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Le noyau en langage C est le chef d'orchestre. Pour réagir aux périphériques (frappe d'une touche au clavier, impulsion d'horloge du timer), le CPU consulte l'<strong>IDT (Interrupt Descriptor Table)</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-200 text-xs block">
                  1. Le Timer Matériel (IRQ0 / PIT à 100 Hz)
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Toutes les 10 millisecondes, le circuit PIT envoie une interruption au CPU. Le gestionnaire d'interruption sauvegarde l'état des registres du processus en cours et passe la main au processus suivant dans la file (Multitâche préemptif).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-200 text-xs block">
                  2. Le Clavier PS/2 (IRQ1)
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Lorsque l'utilisateur presse ou relâche une touche, l'IRQ1 se déclenche. Le pilote lit le scancode sur le port d'entrée/sortie <code>inb(0x60)</code> et le place dans un buffer circulaire pour le shell CLI ou les fenêtres GUI.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-cyan-300">kernel.c (Initialisation VGA et boucle noyau)</span>
                <button
                  onClick={() => handleCopy(CODE_KERNEL_MINIMAL, 'kernel')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {copiedCode === 'kernel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'kernel' ? 'Copié !' : 'Copier le code'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                {CODE_KERNEL_MINIMAL}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveTab('cli')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                <span>Chapitre suivant : Le Terminal CLI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'cli' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                Chapitre 4
              </span>
              <h2 className="text-xl font-bold text-slate-100 font-sans">
                Le Système de Terminal (CLI) et l'Interpréteur de Commandes
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Le terminal est l'interface en ligne de commande historique. Son fonctionnement repose sur une boucle REPL (Read, Eval, Print, Loop) articulée autour du pilote TTY :
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-mono">
              <div className="text-cyan-400 font-semibold font-sans">Les 4 étapes clés d'un Shell d'OS :</div>
              <div className="pl-3 border-l-2 border-cyan-500/60 space-y-1.5">
                <div>1. <strong>readline()</strong> : lecture des caractères tapés au clavier jusqu'à la touche Entrée ('\n').</div>
                <div>2. <strong>parse_args()</strong> : découpage de la chaîne en tokens séparés par des espaces (ex: "cat", "guide.txt").</div>
                <div>3. <strong>execute_command()</strong> : recherche de la commande dans la table des fonctions intégrées (built-ins) ou dans le VFS (/bin).</div>
                <div>4. <strong>display_output()</strong> : affichage du résultat avec défilement de l'écran VGA si la 25e ligne est dépassée.</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-cyan-300">shell.c (Boucle REPL simplifiée)</span>
                <button
                  onClick={() => handleCopy(CODE_SHELL_C, 'shell')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {copiedCode === 'shell' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'shell' ? 'Copié !' : 'Copier le code'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                {CODE_SHELL_C}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveTab('gui')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                <span>Chapitre suivant : Le Moteur Graphique GUI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'gui' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                Chapitre 5
              </span>
              <h2 className="text-xl font-bold text-slate-100 font-sans">
                L'Interface Graphique (GUI Engine) et le Gestionnaire de Fenêtres
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Comment passer du texte monochrome à des fenêtres avec souris ? Le noyau configure la carte graphique en mode VBE (VESA) 32 bits par pixel et utilise un <strong>Linear Framebuffer (LFB)</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="font-semibold text-slate-200 text-xs block">
                Comment un gestionnaire de fenêtres (Window Manager) dessine l'écran ?
              </span>
              <ul className="list-disc pl-4 space-y-2 text-[11px] text-slate-400 leading-relaxed">
                <li>
                  <strong>Double-Buffering obligatoire</strong> : On crée un tableau en RAM ordinaire <code>uint32_t backbuffer[1024 * 768]</code>. Tous les dessins (fond d'écran, fenêtres, texte) se font d'abord dans ce tableau.
                </li>
                <li>
                  <strong>Algorithme du Peintre (Painter's Algorithm)</strong> : On dessine d'abord l'arrière-plan, puis la barre des tâches, puis les fenêtres de la plus ancienne à la plus récente selon leur <code>z_index</code>.
                </li>
                <li>
                  <strong>Rendu de police bitmap</strong> : Pour afficher du texte graphique, on utilise une matrice 8x8 pixels par caractère. Si le bit vaut 1, on peint le pixel de la couleur du texte.
                </li>
                <li>
                  <strong>VSync Swap</strong> : Une fois l'image entière composée, on la copie d'un coup dans la mémoire vidéo VRAM à <code>0xE0000000</code>. Zéro clignotement !
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-cyan-300">gui_compositor.c (Moteur de composition 2D)</span>
                <button
                  onClick={() => handleCopy(CODE_GUI_C, 'gui')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {copiedCode === 'gui' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'gui' ? 'Copié !' : 'Copier le code'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                {CODE_GUI_C}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveTab('build')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                <span>Chapitre suivant : Compiler & Tester dans QEMU</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'build' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                Chapitre 6
              </span>
              <h2 className="text-xl font-bold text-slate-100 font-sans">
                Guide de Démarrage Pratique : Compiler et Tester dans QEMU
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Voici la boîte à outils standard de tout développeur d'OS sous Linux/macOS/WSL pour assembler, lier et tester son système dans un émulateur sans risquer d'endommager sa machine physique.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-200 text-xs block">
                  1. Installer les outils nécessaires (Ubuntu/Debian) :
                </span>
                <pre className="p-2 bg-slate-950 rounded font-mono text-[11px] text-cyan-300">
                  sudo apt install build-essential nasm qemu-system-x86 grub-pc-bin xorriso
                </pre>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-200 text-xs block">
                  2. Script de liaison mémoire (linker.ld) :
                </span>
                <pre className="p-2 bg-slate-950 rounded font-mono text-[11px] text-slate-300 leading-relaxed">
{`ENTRY(kernel_main)
SECTIONS {
    . = 1M; /* Charger le noyau à 1 Mo physique */
    .text : { *(.text) }
    .rodata : { *(.rodata) }
    .data : { *(.data) }
    .bss : { *(.bss) }
}`}
                </pre>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-200 text-xs block">
                  3. Commandes de compilation et lancement dans QEMU :
                </span>
                <pre className="p-2 bg-slate-950 rounded font-mono text-[11px] text-emerald-300 leading-relaxed">
{`# 1. Compiler l'assembleur
nasm -f elf32 boot.asm -o boot.o

# 2. Compiler le noyau C (sans libc standard)
gcc -m32 -ffreestanding -fno-stack-protector -c kernel.c -o kernel.o

# 3. Lier les fichiers objets
ld -m elf_i386 -T linker.ld boot.o kernel.o -o my_os.bin

# 4. Lancer instantanément dans l'émulateur QEMU
qemu-system-i386 -kernel my_os.bin`}
                </pre>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-emerald-300 text-xs block">
                  Vous avez désormais toutes les clés techniques !
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Vous pouvez tester ces concepts directement dans cet environnement KoreOS : ouvrez l'éditeur de code, examinez les fichiers dans <code>/kernel</code>, observez le rendu du Framebuffer dans l'application dédiée et suivez les appels système en direct.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CODE_BOOT_ASM = `[BITS 16]
[ORG 0x7C00]

start:
    cli                     ; 1. Désactiver les interruptions
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00          ; Initialiser la pile

    ; 2. Activer la ligne A20 pour débloquer la mémoire
    in al, 0x92
    or al, 2
    out 0x92, al

    ; 3. Charger la GDT (Global Descriptor Table)
    lgdt [gdt_descriptor]

    ; 4. Passer en Mode Protégé (Bit PE dans CR0)
    mov eax, cr0
    or eax, 1
    mov cr0, eax

    ; 5. Saut lointain vers le segment de code 32-bit
    jmp CODE_SEG:init_pm

[BITS 32]
init_pm:
    mov ax, DATA_SEG
    mov ds, ax
    mov ss, ax
    call 0x100000           ; Appeler le noyau C (kernel_main)
    hlt`;

const CODE_KERNEL_MINIMAL = `#include <stdint.h>
#define VGA_ADDR 0xB8000

void terminal_print(const char* str) {
    volatile uint16_t* vga = (volatile uint16_t*)VGA_ADDR;
    uint8_t color = 0x0F; /* Blanc sur noir */
    static int cursor = 0;

    for (int i = 0; str[i] != '\\0'; i++) {
        if (str[i] == '\\n') {
            cursor = (cursor / 80 + 1) * 80;
        } else {
            vga[cursor++] = (uint16_t)str[i] | ((uint16_t)color << 8);
        }
    }
}

void kernel_main(void) {
    terminal_print("KoreOS Kernel Initialized!\\n");
    terminal_print("CLI & GUI Ready.\\n");
    while (1) {
        asm volatile("hlt");
    }
}`;

const CODE_SHELL_C = `void shell_run(void) {
    char cmd_buffer[256];
    while (1) {
        terminal_print("user@os:~$ ");
        keyboard_read_line(cmd_buffer, 256);

        if (strcmp(cmd_buffer, "help") == 0) {
            terminal_print("Commandes: help, gui, reboot, clear\\n");
        } else if (strcmp(cmd_buffer, "gui") == 0) {
            enter_graphical_vbe_mode();
        } else {
            terminal_print("Commande inconnue\\n");
        }
    }
}`;

const CODE_GUI_C = `typedef struct {
    int x, y, w, h;
    const char* title;
    uint32_t bg_color;
} Window;

void draw_window(Framebuffer* fb, Window* win) {
    /* 1. Dessiner le corps de la fenêtre */
    fb_draw_rect(fb, win->x, win->y, win->w, win->h, win->bg_color);

    /* 2. Dessiner la barre de titre */
    fb_draw_rect(fb, win->x, win->y, win->w, 20, 0x003366);

    /* 3. Bouton de fermeture */
    fb_draw_rect(fb, win->x + win->w - 16, win->y + 4, 12, 12, 0xFF0000);

    /* 4. Afficher le titre de la fenêtre */
    fb_draw_text(fb, win->x + 8, win->y + 5, win->title, 0xFFFFFF);
}`;

/**
 * KoreOS Virtual File System (VFS)
 * Implémentation d'un système de fichiers virtuel arborescent
 * inspiré de l'architecture POSIX/UNIX.
 */

export interface VFSNode {
  id: string;
  name: string;
  type: 'file' | 'dir';
  path: string;
  content?: string;
  size: number;
  permissions: string;
  owner: string;
  updatedAt: string;
}

const STORAGE_KEY = 'kore_os_vfs_data_v1';

const INITIAL_NODES: Record<string, VFSNode> = {
  '/': {
    id: 'root',
    name: '/',
    type: 'dir',
    path: '/',
    size: 4096,
    permissions: 'rwxr-xr-x',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },
  '/bin': {
    id: 'bin',
    name: 'bin',
    type: 'dir',
    path: '/bin',
    size: 4096,
    permissions: 'rwxr-xr-x',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },
  '/etc': {
    id: 'etc',
    name: 'etc',
    type: 'dir',
    path: '/etc',
    size: 4096,
    permissions: 'rwxr-xr-x',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },
  '/home': {
    id: 'home',
    name: 'home',
    type: 'dir',
    path: '/home',
    size: 4096,
    permissions: 'rwxr-xr-x',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },
  '/home/user': {
    id: 'home_user',
    name: 'user',
    type: 'dir',
    path: '/home/user',
    size: 4096,
    permissions: 'rwxr-xr-x',
    owner: 'user',
    updatedAt: '2026-10-19 09:15',
  },
  '/dev': {
    id: 'dev',
    name: 'dev',
    type: 'dir',
    path: '/dev',
    size: 4096,
    permissions: 'rwxr-xr-x',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },
  '/var': {
    id: 'var',
    name: 'var',
    type: 'dir',
    path: '/var',
    size: 4096,
    permissions: 'rwxr-xr-x',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },
  '/var/log': {
    id: 'var_log',
    name: 'log',
    type: 'dir',
    path: '/var/log',
    size: 4096,
    permissions: 'rwxr-xr-x',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },
  '/kernel': {
    id: 'kernel',
    name: 'kernel',
    type: 'dir',
    path: '/kernel',
    size: 4096,
    permissions: 'rwxr-xr-x',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },

  // Fichiers d'accueil et d'apprentissage
  '/home/user/bienvenue.txt': {
    id: 'doc_bienvenue',
    name: 'bienvenue.txt',
    type: 'file',
    path: '/home/user/bienvenue.txt',
    content: `=====================================================
       BIENVENUE SUR KORE-OS HYBRID KERNEL v2.4
=====================================================

Cet environnement simule fidèlement le fonctionnement d'un OS
mélangeant un terminal Unix (CLI) et un gestionnaire de fenêtres (GUI).

Commandes utiles dans le terminal :
- help         : Affiche la liste des commandes disponibles
- ls, cd, pwd  : Navigation dans le VFS (Virtual File System)
- cat [f]      : Lire le contenu d'un fichier
- nano [f]     : Ouvrir le fichier dans l'éditeur de code
- ps, top      : Consulter les processus et l'ordonnanceur
- gui          : Basculer en mode bureau graphique
- syscalls     : Voir les derniers appels système en temps réel
- guide        : Ouvrir le guide complet de création d'un OS

Explorez également le dossier /kernel pour voir le code source
C et Assembleur réel servant à créer un vrai OS pour x86 !
`,
    size: 890,
    permissions: 'rw-r--r--',
    owner: 'user',
    updatedAt: '2026-10-19 09:15',
  },

  '/home/user/architecture_os.md': {
    id: 'doc_arch',
    name: 'architecture_os.md',
    type: 'file',
    path: '/home/user/architecture_os.md',
    content: `# Comment créer un OS hybride (CLI + GUI)

Un système d'exploitation complet s'articule autour de 5 couches fondamentales :

1. LE BOOTLOADER (ex: GRUB ou ASM 16-bit vers 32-bit/64-bit)
   - Initialise le CPU, charge le noyau en mémoire RAM.
   - Passe en Mode Protégé (Protected Mode) et active l'A20 line.

2. LE NOYAU (KERNEL)
   - GDT (Global Descriptor Table) : segmentation mémoire.
   - IDT (Interrupt Descriptor Table) : gère le clavier, timer et appels système.
   - Gestionnaire de mémoire physique (Bitmap/Paging) et virtuelle (MMU).

3. LE PILOTE ENTRÉE/SORTIE & TERMINAL (CLI)
   - Pilote clavier (port I/O 0x60) qui remplit un buffer circulaire de scancodes.
   - Pilote VGA texte (adresse mémoire 0xB8000) pour afficher 80x25 caractères.
   - Interpréteur de commandes (Shell / REPL).

4. LE VFS & GESTIONNAIRE DE PROCESSUS
   - VFS : abstraction unifiée pour manipuler disques et pseudo-fichiers.
   - Scheduler : Round-Robin avec timer matériel (PIT 100 Hz).

5. LE MOTEUR GRAPHIQUE (GUI / WINDOW MANAGER)
   - VBE Framebuffer linéaire (ex: 1024x768x32bpp à 0xE0000000).
   - Double Buffering (Front buffer & Back buffer) pour éviter le scintillement.
   - Moteur de composition de fenêtres avec gestion de la souris (PS/2) et du z-index.
`,
    size: 1350,
    permissions: 'rw-r--r--',
    owner: 'user',
    updatedAt: '2026-10-19 09:20',
  },

  // Fichiers système
  '/etc/hostname': {
    id: 'etc_hostname',
    name: 'hostname',
    type: 'file',
    path: '/etc/hostname',
    content: 'kore-workstation-01\n',
    size: 20,
    permissions: 'rw-r--r--',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },
  '/etc/os-release': {
    id: 'etc_os_release',
    name: 'os-release',
    type: 'file',
    path: '/etc/os-release',
    content: `NAME="KoreOS Hybrid"
VERSION="2.4.0-educational"
ID=koreos
PRETTY_NAME="KoreOS Microkernel + Linear Framebuffer GUI"
KERNEL_ARCH="x86_64 / WebOS Sim"
DISPLAY_SERVER="KoreCompositor v1.2"
SHELL="/bin/sh"
`,
    size: 185,
    permissions: 'rw-r--r--',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },
  '/var/log/syslog': {
    id: 'log_syslog',
    name: 'syslog',
    type: 'file',
    path: '/var/log/syslog',
    content: `[0.000000] Linux/Kore-OS booting on bare-metal simulator
[0.000412] GDT initialized at 0x00001000
[0.000850] IDT loaded with 256 interrupt descriptors
[0.001200] Physical memory manager: 4096 MB available
[0.002400] VBE 3.0 graphics controller found: 1920x1080 32bpp LFB at 0xE0000000
[0.003100] PS/2 Mouse & Keyboard initialized
[0.004000] Root VFS mounted on ramdisk ext2
[0.005120] Starting init process (PID 1)
[0.006200] Launching TTY1 console on ttyS0
[0.007800] Launching KoreCompositor Window Manager
`,
    size: 512,
    permissions: 'rw-r-----',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },

  // Code source Kernel réel
  '/kernel/boot.asm': {
    id: 'src_boot_asm',
    name: 'boot.asm',
    type: 'file',
    path: '/kernel/boot.asm',
    content: `; ==============================================================
; Bootloader minimal x86 (512 octets)
; Compile avec: nasm -f bin boot.asm -o boot.bin
; ==============================================================
[BITS 16]
[ORG 0x7C00]

start:
    cli                     ; Désactiver les interruptions
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00          ; Initialiser la pile

    ; Afficher un message de bienvenue en mode texte 16-bit
    mov si, msg_boot
print_char:
    lodsb
    or al, al
    jz enter_pm
    mov ah, 0x0E
    int 0x10
    jmp print_char

enter_pm:
    ; Activer la ligne A20 pour accéder à toute la mémoire
    in al, 0x92
    or al, 2
    out 0x92, al

    ; Charger la GDT (Global Descriptor Table)
    lgdt [gdt_descriptor]

    ; Activer le bit PE (Protection Enable) dans CR0
    mov eax, cr0
    or eax, 1
    mov cr0, eax

    ; Saut lointain (Far jump) vers le code 32-bit pour vider le pipeline
    jmp CODE_SEG:init_pm

[BITS 32]
init_pm:
    mov ax, DATA_SEG
    mov ds, ax
    mov ss, ax
    mov es, ax
    mov fs, ax
    mov gs, ax
    mov ebp, 0x90000
    mov esp, ebp

    ; Appeler le point d'entrée du noyau en C (kernel_main)
    call 0x100000
    hlt

; --- Tables GDT ---
gdt_start:
    dd 0x0, 0x0             ; Null descriptor
gdt_code:
    dw 0xFFFF, 0x0000, 0x9A00, 0x00CF ; Code segment 4GB
gdt_data:
    dw 0xFFFF, 0x0000, 0x9200, 0x00CF ; Data segment 4GB
gdt_end:

gdt_descriptor:
    dw gdt_end - gdt_start - 1
    dd gdt_start

CODE_SEG equ gdt_code - gdt_start
DATA_SEG equ gdt_data - gdt_start

msg_boot db "Booting KoreOS...", 13, 10, 0

times 510 - ($ - $$) db 0
dw 0xAA55                   ; Signature de boot MBR obligatoire
`,
    size: 1620,
    permissions: 'rw-r--r--',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },

  '/kernel/kernel.c': {
    id: 'src_kernel_c',
    name: 'kernel.c',
    type: 'file',
    path: '/kernel/kernel.c',
    content: `/* ==============================================================
 * Noyau minimal en C - Point d'entrée de KoreOS
 * Compile avec: gcc -m32 -ffreestanding -c kernel.c -o kernel.o
 * ============================================================== */
#include <stdint.h>

/* Mémoire vidéo VGA en mode texte standard 80x25 */
#define VGA_ADDRESS 0xB8000
#define VGA_WIDTH   80
#define VGA_HEIGHT  25

static uint16_t* const vga_buffer = (uint16_t*)VGA_ADDRESS;
static uint16_t cursor_x = 0;
static uint16_t cursor_y = 0;
static uint8_t  terminal_color = 0x0F; /* Blanc sur fond noir */

/* Écriture d'un caractère avec attributs de couleur */
void terminal_putentryat(char c, uint8_t color, size_t x, size_t y) {
    const size_t index = y * VGA_WIDTH + x;
    vga_buffer[index] = (uint16_t)c | ((uint16_t)color << 8);
}

void terminal_putchar(char c) {
    if (c == '\\n') {
        cursor_x = 0;
        if (++cursor_y == VGA_HEIGHT) {
            cursor_y = 0; /* Défilement simplifié */
        }
        return;
    }
    terminal_putentryat(c, terminal_color, cursor_x, cursor_y);
    if (++cursor_x == VGA_WIDTH) {
        cursor_x = 0;
        if (++cursor_y == VGA_HEIGHT) cursor_y = 0;
    }
}

void terminal_print(const char* str) {
    for (size_t i = 0; str[i] != '\\0'; i++) {
        terminal_putchar(str[i]);
    }
}

/* Point d'entrée exécuté par le bootloader */
void kernel_main(void) {
    /* Nettoyage de l'écran VGA */
    for (size_t y = 0; y < VGA_HEIGHT; y++) {
        for (size_t x = 0; x < VGA_WIDTH; x++) {
            terminal_putentryat(' ', terminal_color, x, y);
        }
    }

    terminal_print("KoreOS v2.4 (x86_32 Protected Mode)\\n");
    terminal_print("Kernel initialize: IDT OK | GDT OK | Timer 100Hz OK\\n");
    terminal_print("Launching Hybrid Shell (CLI) & Framebuffer Compositor (GUI)...\\n");

    /* Boucle d'attente d'interruptions matérielles */
    while (1) {
        asm volatile("hlt");
    }
}
`,
    size: 1840,
    permissions: 'rw-r--r--',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },

  '/kernel/framebuffer.c': {
    id: 'src_fb_c',
    name: 'framebuffer.c',
    type: 'file',
    path: '/kernel/framebuffer.c',
    content: `/* ==============================================================
 * Moteur Graphique (GUI Engine) sur Framebuffer Linéaire
 * ============================================================== */
#include <stdint.h>

typedef struct {
    uint32_t* address;   /* Adresse physique VBE (ex: 0xE0000000) */
    uint32_t width;      /* ex: 1024 */
    uint32_t height;     /* ex: 768 */
    uint32_t pitch;      /* Octets par ligne (width * 4) */
} Framebuffer;

/* Double buffer pour éliminer le scintillement */
static uint32_t backbuffer[1024 * 768];

/* Formule fondamentale du rendu 2D dans un OS : */
void fb_put_pixel(Framebuffer* fb, int x, int y, uint32_t color_rgb) {
    if (x < 0 || x >= fb->width || y < 0 || y >= fb->height) return;
    /* Calcul de l'offset mémoire linéaire : y * pitch + x */
    backbuffer[y * fb->width + x] = color_rgb;
}

/* Rendu d'un rectangle (base d'une fenêtre de bureau) */
void fb_draw_rect(Framebuffer* fb, int x, int y, int w, int h, uint32_t color) {
    for (int j = y; j < y + h; j++) {
        for (int i = x; i < x + w; i++) {
            fb_put_pixel(fb, i, j, color);
        }
    }
}

/* Échange du backbuffer vers le frontbuffer vidéo (VSync Swap) */
void fb_swap_buffers(Framebuffer* fb) {
    for (uint32_t i = 0; i < fb->width * fb->height; i++) {
        fb->address[i] = backbuffer[i];
    }
}
`,
    size: 1350,
    permissions: 'rw-r--r--',
    owner: 'root',
    updatedAt: '2026-10-19 09:00',
  },
};

export class VirtualFileSystem {
  private nodes: Record<string, VFSNode>;

  constructor() {
    this.nodes = this.load();
  }

  private load(): Record<string, VFSNode> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignorer l'erreur et initialiser les noeuds par défaut
    }
    return { ...INITIAL_NODES };
  }

  public save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.nodes));
    } catch {
      // Fallback in-memory
    }
  }

  public reset(): void {
    this.nodes = { ...INITIAL_NODES };
    this.save();
  }

  public resolvePath(cwd: string, targetPath: string): string {
    let cleanTarget = targetPath.trim();
    if (!cleanTarget || cleanTarget === '.') return cwd;
    if (cleanTarget === '~') return '/home/user';
    if (cleanTarget.startsWith('~/')) {
      cleanTarget = '/home/user/' + cleanTarget.slice(2);
    }

    let absolute = cleanTarget.startsWith('/') ? cleanTarget : `${cwd === '/' ? '' : cwd}/${cleanTarget}`;
    
    // Normaliser les '.' et '..'
    const parts = absolute.split('/').filter(p => p.length > 0);
    const resolved: string[] = [];

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        resolved.pop();
      } else {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/');
  }

  public getNode(path: string): VFSNode | null {
    const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
    return this.nodes[normalized] || null;
  }

  public listDir(dirPath: string): VFSNode[] {
    const normalized = dirPath === '/' ? '/' : dirPath.replace(/\/+$/, '');
    const dir = this.getNode(normalized);
    if (!dir || dir.type !== 'dir') return [];

    const prefix = normalized === '/' ? '/' : `${normalized}/`;
    const results: VFSNode[] = [];

    for (const [key, node] of Object.entries(this.nodes)) {
      if (key === normalized) continue;
      if (key.startsWith(prefix)) {
        const remainder = key.slice(prefix.length);
        if (!remainder.includes('/')) {
          results.push(node);
        }
      }
    }

    return results.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  public readFile(path: string): string | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'file') return null;
    return node.content ?? '';
  }

  public writeFile(path: string, content: string, owner = 'user'): boolean {
    const normalized = path.replace(/\/+$/, '');
    const lastSlash = normalized.lastIndexOf('/');
    const parentPath = lastSlash === 0 ? '/' : normalized.slice(0, lastSlash);
    const fileName = normalized.slice(lastSlash + 1);

    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== 'dir') return false;

    const existing = this.getNode(normalized);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    this.nodes[normalized] = {
      id: existing?.id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: fileName,
      type: 'file',
      path: normalized,
      content,
      size: new Blob([content]).size,
      permissions: existing?.permissions || 'rw-r--r--',
      owner: existing?.owner || owner,
      updatedAt: now,
    };

    this.save();
    return true;
  }

  public createDir(path: string, owner = 'user'): boolean {
    const normalized = path.replace(/\/+$/, '');
    if (this.getNode(normalized)) return false;

    const lastSlash = normalized.lastIndexOf('/');
    const parentPath = lastSlash === 0 ? '/' : normalized.slice(0, lastSlash);
    const dirName = normalized.slice(lastSlash + 1);

    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== 'dir') return false;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    this.nodes[normalized] = {
      id: `dir_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: dirName,
      type: 'dir',
      path: normalized,
      size: 4096,
      permissions: 'rwxr-xr-x',
      owner,
      updatedAt: now,
    };

    this.save();
    return true;
  }

  public deleteNode(path: string): boolean {
    const normalized = path.replace(/\/+$/, '');
    if (normalized === '/' || normalized === '/bin' || normalized === '/etc') return false;

    const node = this.getNode(normalized);
    if (!node) return false;

    // Supprimer récursivement si c'est un dossier
    if (node.type === 'dir') {
      const prefix = `${normalized}/`;
      for (const key of Object.keys(this.nodes)) {
        if (key.startsWith(prefix)) {
          delete this.nodes[key];
        }
      }
    }

    delete this.nodes[normalized];
    this.save();
    return true;
  }

  public getAllNodes(): VFSNode[] {
    return Object.values(this.nodes);
  }
}

export const vfsInstance = new VirtualFileSystem();

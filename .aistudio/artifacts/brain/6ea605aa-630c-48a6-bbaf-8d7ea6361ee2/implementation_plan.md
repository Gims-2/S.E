# Transformation de KoreOS en Environnement de Bureau Windows 11 Moderne

Transformation complète de l'interface graphique de KoreOS pour offrir une expérience authentique de bureau **Windows 11** moderne (menu Démarrer flottant et centré, barre des tâches avec zone de notification système, explorateur de fichiers façon « Ce PC » / « Disque C: », et fenêtres avec coins arrondis et effets acryliques Mica).

## User Review & Critical Decisions

> [!IMPORTANT]
> Vos préférences confirmées ont été intégrées dans ce plan :
> - **Style visuel** : Windows 11 moderne avec barre des tâches centrée, menu Démarrer flottant, coins arrondis (`rounded-2xl`) et effet de verre acrylique translucide avec flou d'arrière-plan (*Mica / Acrylic backdrop blur*).
> - **Menu Démarrer** : Menu Démarrer Windows 11 complet avec champ de recherche en direct, grille d'applications épinglées, section « Recommandés / Récents » et bouton utilisateur/alimentation.
> - **Barre des tâches (Taskbar)** : Raccourcis centrés avec icône Windows 11, icônes d'applications actives avec barre indicatrice bleue sous l'icône, zone de notifications (systray) à droite avec heure/date, son, réseau, batterie et bouton « Afficher le Bureau ».
> - **Explorateur de fichiers façon Windows** : Refonte en « Explorateur Windows » avec volet de navigation gauche (Accès rapide, Ce PC, Disque local C:), barre de commande supérieure (Nouveau, Découper, Copier, Supprimer) et barre d'adresse avec chemin dynamique.

---

## 1. Overview & Core Concept

* **Ce que fait l'application** : Met à disposition un système d'exploitation éducatif hybride complet (Terminal Unix + Moteur graphique) habillé de l'ergonomie et du design de **Windows 11**. Les utilisateurs profitent de la familiarité d'un bureau Windows tout en conservant le noyau simulé sous-jacent (VFS, appels système en temps réel, ordonnanceur de processus, terminal puissant et laboratoire de mémoire vidéo).
* **Public cible** : Développeurs, étudiants et curieux souhaitant comprendre les rouages d'un OS tout en naviguant dans une interface fluide et intuitive façon Windows 11.
* **Bénéfice clé** : Combinaison unique entre la pédagogie bas niveau (C/ASM, VFS, Framebuffer) et une interface utilisateur moderne, réactive et élégante.

---

## 2. User Experience & Visual Design

### Parcours Utilisateur
1. **Démarrage & Bureau** : Fond d'écran officiel Windows 11 (fleur abstraite bleue *Bloom* sur fond sombre ou clair) avec icônes alignées à gauche sur la grille (« Ce PC », « Corbeille », « Terminal Windows », « KoreEdit », « Gestionnaire des tâches »).
2. **Menu Démarrer (Touche Win ou clic)** : Ouverture fluide d'un volet centré avec barre de recherche, grille de raccourcis, accès direct aux guides et applications du système, et bouton d'extinction/redémarrage.
3. **Explorateur Windows 11** : Affichage hiérarchique avec `Ce PC > Disque local (C:) > home > user`, ruban d'actions en haut (Nouveau dossier, Nouveau fichier, Supprimer, Actualiser) et prévisualisation des fichiers.
4. **Gestionnaire des fenêtres Windows** : Contrôles de fenêtres standard Windows (Réduire `_`, Agrandir `▢`, Fermer `✕`), bouton « Snap » pour aligner les fenêtres, et barre de titre discrète et sobre.
5. **Barre des tâches & Systray** :
   - Zone centrale : Logo Windows 11, Recherche, Explorateur, Terminal, Éditeur, Gestionnaire des tâches, Paramètres.
   - Zone droite (Systray) : Icône Réseau, Volume sonore interactif, Jauge CPU/RAM discrète, Horloge sur 2 lignes (Heure / Date) et trait discret « Réduire toutes les fenêtres » à l'extrémité droite.

### Charte Graphique & Thème
* **Palette Windows 11 Dark Mode** :
  * Fond du bureau : Nuances profondes `#0f141c` / `#18202f` avec fond d'écran haute définition abstrait Windows Bloom.
  * Surfaces Acryliques : `rgba(32, 38, 50, 0.85)` avec bordure hairline fine `rgba(255, 255, 255, 0.08)` et `backdrop-blur-xl`.
  * Accentuation Windows : Bleu vibrant Windows `#0078d4` / `#2394ff`.
  * Typographie : `Plus Jakarta Sans` / `Segoe UI` pour l'interface utilisateur, `JetBrains Mono` pour le terminal et l'éditeur.

---

## 3. Key Product Decisions & Trade-Offs

* **Barre des tâches centrée vs alignée à gauche** :
  * *Approche retenue* : Centrée par défaut (comme Windows 11 natif), avec possibilité de centrer ou aligner à gauche dans les paramètres si souhaité.
  * *Pourquoi* : Respecte fidèlement l'identité visuelle de Windows 11.
* **Explorateur de fichiers & Correspondance VFS** :
  * *Approche retenue* : Mapper le lecteur `C:\` virtuel directement sur la racine `/` du VFS POSIX sous-jacent (`C:\Users\user` pointe sur `/home/user`, `C:\Kernel` sur `/kernel`).
  * *Pourquoi* : Permet une navigation familière à la Windows tout en préservant la compatibilité avec les commandes Unix (`ls`, `cat`, `cd`) exécutées dans le terminal.
* **Menu Démarrer modulaire** :
  * *Approche retenue* : Composant dédié avec filtrage en temps réel des applications dès la frappe, affichage des documents récents créés dans le VFS, et raccourcis système.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BUREAU WINDOWS 11                               │
│  ┌────────────────┐  ┌───────────────────────────────────────────────┐ │
│  │ Icônes Bureau  │  │ Fenêtres Flottantes (Windows 11 Window Frame) │ │
│  │ - Ce PC (C:)   │  │  - Explorateur Windows (Ribbon, Arborescence) │ │
│  │ - Terminal     │  │  - Windows Terminal (Shell Unix + Syscalls)   │ │
│  │ - KoreEdit     │  │  - Gestionnaire des tâches (CPU, RAM, PCB)    │ │
│  │ - Corbeille    │  │  - Laboratoire Framebuffer & Architecture OS  │ │
│  └────────────────┘  └───────────────────────────────────────────────┘ │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Menu Démarrer Flottant (Search, Épinglés, Récents, Session)      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Barre des tâches : [Start] [Icons Centrées] ... [Systray + Heure]│  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Actions Utilisateur & Syscalls
┌────────────────────────────────────▼───────────────────────────────────┐
│                      NOYAU KORE-OS & SYSTÈME VFS                       │
│  - Virtual File System (Mappé C:\ <-> POSIX root /)                    │
│  - Ordonnanceur de Processus (PCB, Round-Robin 100 Hz, CPU/RAM)        │
│  - Syscall Tracer (sys_open, sys_read, sys_write, sys_fb_blit)         │
└────────────────────────────────────────────────────────────────────────┘
```

### Étapes d'Implémentation
1. **Génération d'un fond d'écran Windows 11 officiel de qualité** (`generate_image` style fleur abstraite bleue *Bloom* sur fond sombre).
2. **Création du composant `WindowsTaskbar`** : Barre des tâches en bas, logo Démarrer Windows 11, icônes centrées avec pastilles actives, Systray complet (audio, wifi, batterie, horloge Windows, bouton retour bureau).
3. **Création du composant `WindowsStartMenu`** : Menu flottant avec recherche réactive, applications épinglées, fichiers récemment ouverts, profil utilisateur et bouton d'extinction.
4. **Refonte du conteneur `Window`** : Bordures et coins arrondis Windows 11, boutons Réduire/Agrandir/Fermer style Windows, effet acrylique `backdrop-blur`.
5. **Refonte de l'Explorateur de fichiers en `WindowsExplorerApp`** : Volet gauche « Ce PC », disque « Local Disk (C:) », barre d'outils avec boutons d'actions (Nouveau, Découper, Supprimer), barre de chemin `Ce PC > C: > ...`.
6. **Mise à jour du bureau `Desktop`** : Alignement des icônes à gauche façon Windows, intégration de la corbeille, gestion du clic extérieur pour fermer le menu Démarrer.
7. **Compilation et validation globale** avec `compile_applet` et `lint_applet`.

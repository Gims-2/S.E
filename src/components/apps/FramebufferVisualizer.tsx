import React, { useState, useRef, useEffect } from 'react';
import { kernelInstance } from '../../os/kernel';
import { Monitor, RefreshCw, Eye, Move, Sparkles, Layers, Sliders } from 'lucide-react';

export const FramebufferVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Position et état de la fenêtre simulée dans le Framebuffer
  const [winPos, setWinPos] = useState({ x: 40, y: 30 });
  const [winSize, setWinSize] = useState({ w: 160, h: 100 });
  const [activeColor, setActiveColor] = useState('#0284c7');
  const [showGrid, setShowGrid] = useState(true);
  const [renderCount, setRenderCount] = useState(0);

  const fbWidth = 320;
  const fbHeight = 200;

  useEffect(() => {
    drawFramebuffer();
  }, [winPos, winSize, activeColor, showGrid]);

  const drawFramebuffer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Nettoyage du Framebuffer (Couleur d'arrière-plan du bureau OS)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, fbWidth, fbHeight);

    // 2. Grille de pixels mémoire si activée
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < fbWidth; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, fbHeight);
        ctx.stroke();
      }
      for (let y = 0; y < fbHeight; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(fbWidth, y);
        ctx.stroke();
      }
    }

    // 3. Barre de tâches simulée en bas (y = fbHeight - 20)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, fbHeight - 20, fbWidth, 20);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(4, fbHeight - 16, 24, 12); // Menu démarrer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px monospace';
    ctx.fillText('OS DOCK', 34, fbHeight - 7);

    // 4. Dessin de la fenêtre utilisateur
    // Ombre de la fenêtre
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(winPos.x + 4, winPos.y + 4, winSize.w, winSize.h);

    // Corps de la fenêtre
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(winPos.x, winPos.y, winSize.w, winSize.h);

    // Barre de titre de la fenêtre
    ctx.fillStyle = activeColor;
    ctx.fillRect(winPos.x, winPos.y, winSize.w, 16);

    // Titre de la fenêtre
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
    ctx.fillText('Terminal & GUI Window', winPos.x + 6, winPos.y + 11);

    // Boutons de la fenêtre
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(winPos.x + winSize.w - 14, winPos.y + 4, 8, 8);

    // Contenu interne simulé
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(winPos.x + 6, winPos.y + 22, winSize.w - 12, winSize.h - 28);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '8px monospace';
    ctx.fillText('> KoreOS LFB Engine', winPos.x + 10, winPos.y + 36);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText('> 32bpp Double Buffer', winPos.x + 10, winPos.y + 48);

    // Log du syscall
    kernelInstance.logSyscall(
      'sys_fb_blit',
      `rect=(${winPos.x},${winPos.y},${winSize.w},${winSize.h}), color=${activeColor}`,
      'VSYNC SWAP (0)',
      'compositor'
    );
    setRenderCount(prev => prev + 1);
  };

  const selectedMemoryOffset = (winPos.y * fbWidth + winPos.x) * 4;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 text-xs overflow-y-auto">
      {/* En-tête explicatif */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              Laboratoire Framebuffer Vidéo (VBE Linear Framebuffer)
            </h3>
            <p className="text-[11px] text-slate-400">
              Visualisez comment la mémoire vidéo linéaire se transforme en fenêtres graphiques.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              showGrid ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Grille pixels
          </button>
          <button
            onClick={drawFramebuffer}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rafraîchir (Swap VSync)</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Visualisation Canvas du Framebuffer simulé */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 mb-2 w-full flex items-center justify-between">
            <span>Écran VBE Simulé : 320 x 200 pixels (32 bpp RGBX)</span>
            <span className="tabular-nums text-cyan-400">{renderCount} swaps VSync</span>
          </div>

          <div className="relative p-1 bg-slate-950 rounded-lg border-2 border-slate-700 shadow-2xl">
            <canvas
              ref={canvasRef}
              width={fbWidth}
              height={fbHeight}
              className="rounded image-rendering-pixelated cursor-crosshair max-w-full"
              style={{ width: '480px', height: '300px' }}
            />
          </div>

          <p className="text-[10px] text-slate-500 mt-2 text-center">
            Les résolutions réelles d'un OS (ex: 1920x1080) fonctionnent selon le même algorithme mathématique.
          </p>
        </div>

        {/* Panneau de contrôle et calculs d'adresses mémoire */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Formule mathématique du Framebuffer */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-100 text-xs">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Formule d'Adressement Mémoire</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg font-mono text-[11px] text-emerald-400 border border-slate-800">
              Offset = (Y * Largeur + X) * 4 octets
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>
                Coordonnée coin fenêtre : <span className="font-mono text-cyan-300">X = {winPos.x}, Y = {winPos.y}</span>
              </div>
              <div>
                Offset mémoire VRAM :{' '}
                <span className="font-mono text-amber-300 tabular-nums">
                  {selectedMemoryOffset.toLocaleString()} octets (0x{selectedMemoryOffset.toString(16).toUpperCase()})
                </span>
              </div>
              <div>
                Adresse physique absolue :{' '}
                <span className="font-mono text-indigo-300">
                  0x{(0xE0000000 + selectedMemoryOffset).toString(16).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Déplacement interactif de la fenêtre simulée */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-100 text-xs">
              <Move className="w-4 h-4 text-cyan-400" />
              <span>Manipuler la Fenêtre dans le Framebuffer</span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Position X : {winPos.x} px</span>
                  <span>Max : {fbWidth - winSize.w}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={fbWidth - winSize.w}
                  value={winPos.x}
                  onChange={e => setWinPos({ ...winPos, x: parseInt(e.target.value, 10) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Position Y : {winPos.y} px</span>
                  <span>Max : {fbHeight - winSize.h - 20}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={fbHeight - winSize.h - 20}
                  value={winPos.y}
                  onChange={e => setWinPos({ ...winPos, y: parseInt(e.target.value, 10) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Largeur : {winSize.w} px</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="240"
                  value={winSize.w}
                  onChange={e => setWinSize({ ...winSize, w: parseInt(e.target.value, 10) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Sélection couleur de la barre de titre */}
              <div>
                <span className="block text-[11px] text-slate-400 mb-1.5">Couleur du Window Manager :</span>
                <div className="flex items-center gap-2">
                  {['#0284c7', '#059669', '#7c3aed', '#dc2626', '#d97706'].map(col => (
                    <button
                      key={col}
                      onClick={() => setActiveColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        activeColor === col ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Note pédagogique sur le Double-Buffering */}
          <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-800/40 text-[11px] text-cyan-300 leading-relaxed">
            <strong>Pourquoi le Double-Buffering est indispensable ?</strong>
            <p className="mt-1 text-slate-400">
              Sans double-buffer, dessiner directement dans la mémoire de l'écran provoque des déchirures visuelles (tearing) et des clignotements. Le noyau prépare l'image dans un Back-Buffer en RAM ordinaire, puis l'envoie d'un seul bloc (ou via DMA) vers la carte graphique lors du VSync vertical.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

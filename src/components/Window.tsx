import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X, RotateCcw } from 'lucide-react';

export interface WindowProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({
  title,
  icon,
  isOpen,
  isMinimized,
  zIndex,
  initialPosition = { x: 80, y: 60 },
  initialSize = { width: 720, height: 480 },
  minWidth = 360,
  minHeight = 240,
  onFocus,
  onClose,
  onMinimize,
  children,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaxState, setPreMaxState] = useState({ position, size });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 0, y: 0 });

  const isResizingRef = useRef(false);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if (isMaximized) return;
    onFocus();
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
  };

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();
    isResizingRef.current = true;
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setPosition({
          x: Math.max(10, Math.min(window.innerWidth - 100, posStartRef.current.x + dx)),
          y: Math.max(35, Math.min(window.innerHeight - 80, posStartRef.current.y + dy)),
        });
      } else if (isResizingRef.current) {
        const dw = e.clientX - resizeStartRef.current.x;
        const dh = e.clientY - resizeStartRef.current.y;
        setSize({
          width: Math.max(minWidth, Math.min(window.innerWidth - 20, resizeStartRef.current.width + dw)),
          height: Math.max(minHeight, Math.min(window.innerHeight - 80, resizeStartRef.current.height + dh)),
        });
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      isResizingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minWidth, minHeight]);

  const toggleMaximize = () => {
    if (!isMaximized) {
      setPreMaxState({ position, size });
      setPosition({ x: 0, y: 36 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 90 });
      setIsMaximized(true);
    } else {
      setPosition(preMaxState.position);
      setSize(preMaxState.size);
      setIsMaximized(false);
    }
  };

  if (!isOpen || isMinimized) return null;

  return (
    <div
      onMouseDown={onFocus}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex,
      }}
      className={`absolute top-0 left-0 flex flex-col rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900/95 shadow-2xl backdrop-blur-md transition-shadow select-none ${
        isMaximized ? 'rounded-none border-x-0' : ''
      }`}
    >
      {/* Barre de titre de la fenêtre */}
      <div
        onMouseDown={handleMouseDownHeader}
        onDoubleClick={toggleMaximize}
        className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/80 border-b border-slate-700/50 cursor-move text-slate-200"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-slate-400 shrink-0">{icon}</span>
          <span className="text-xs font-semibold tracking-wide truncate text-slate-100">{title}</span>
        </div>

        {/* Boutons de contrôle de la fenêtre (Close, Minimize, Maximize) */}
        <div className="flex items-center gap-1.5 shrink-0" onMouseDown={e => e.stopPropagation()}>
          <button
            onClick={onMinimize}
            title="Minimiser"
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleMaximize}
            title={isMaximized ? 'Restaurer' : 'Agrandir'}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isMaximized ? <RotateCcw className="w-3 h-3" /> : <Square className="w-3 h-3" />}
          </button>
          <button
            onClick={onClose}
            title="Fermer"
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-rose-600/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Contenu principal de la fenêtre */}
      <div className="flex-1 overflow-hidden relative bg-slate-950/80 text-slate-100">
        {children}
      </div>

      {/* Poignée de redimensionnement dans le coin inférieur droit */}
      {!isMaximized && (
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20 flex items-end justify-end p-0.5"
        >
          <svg className="w-2.5 h-2.5 text-slate-500/60" viewBox="0 0 6 6" fill="currentColor">
            <circle cx="5" cy="5" r="1" />
            <circle cx="5" cy="2" r="1" />
            <circle cx="2" cy="5" r="1" />
          </svg>
        </div>
      )}
    </div>
  );
};

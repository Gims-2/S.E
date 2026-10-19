import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, RotateCcw, Trophy } from 'lucide-react';
import { kernelInstance } from '../../os/kernel';

export const SnakeGameApp: React.FC = () => {
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const directionRef = useRef(direction);
  directionRef.current = direction;

  const gridSize = 20;

  const resetGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]);
    setDirection('UP');
    setScore(0);
    setGameOver(false);
    spawnFood();
  };

  const spawnFood = () => {
    const rx = Math.floor(Math.random() * gridSize);
    const ry = Math.floor(Math.random() * gridSize);
    setFood({ x: rx, y: ry });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const cur = directionRef.current;
      if ((e.key === 'ArrowUp' || e.key === 'w') && cur !== 'DOWN') setDirection('UP');
      else if ((e.key === 'ArrowDown' || e.key === 's') && cur !== 'UP') setDirection('DOWN');
      else if ((e.key === 'ArrowLeft' || e.key === 'a') && cur !== 'RIGHT') setDirection('LEFT');
      else if ((e.key === 'ArrowRight' || e.key === 'd') && cur !== 'LEFT') setDirection('RIGHT');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const dir = directionRef.current;

        if (dir === 'UP') head.y -= 1;
        else if (dir === 'DOWN') head.y += 1;
        else if (dir === 'LEFT') head.x -= 1;
        else if (dir === 'RIGHT') head.x += 1;

        // Collision avec les murs
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
          setGameOver(true);
          return prevSnake;
        }

        // Collision avec soi-même
        for (const segment of prevSnake) {
          if (segment.x === head.x && segment.y === head.y) {
            setGameOver(true);
            return prevSnake;
          }
        }

        // Manger la nourriture
        if (head.x === food.x && head.y === food.y) {
          setScore(s => {
            const next = s + 10;
            if (next > highScore) setHighScore(next);
            return next;
          });
          spawnFood();
          kernelInstance.logSyscall('sys_snd_beep', 'freq=880Hz, dur=50ms', '0 (SUCCESS)', 'snake');
          return [head, ...prevSnake];
        }

        return [head, ...prevSnake.slice(0, -1)];
      });
    }, 120);

    return () => clearInterval(interval);
  }, [gameOver, food, highScore]);

  return (
    <div className="flex flex-col items-center justify-between h-full bg-slate-950 p-4 text-slate-200 select-none">
      {/* Barre de score */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-300">Retro Snake 2D (Processus GUI)</span>
        </div>
        <div className="flex items-center gap-4 tabular-nums">
          <span>Score : <strong className="text-cyan-400">{score}</strong></span>
          <span className="flex items-center gap-1 text-amber-400">
            <Trophy className="w-3.5 h-3.5" /> {highScore}
          </span>
        </div>
      </div>

      {/* Grille de jeu */}
      <div className="relative my-auto p-1 bg-slate-900 border-2 border-slate-700 rounded-lg shadow-xl">
        <div
          className="grid gap-[1px] bg-slate-950"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 14px)`,
            gridTemplateRows: `repeat(${gridSize}, 14px)`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }, (_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = snake.slice(1).some(s => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;

            let cellBg = 'bg-slate-900/40';
            if (isHead) cellBg = 'bg-cyan-400 rounded-sm';
            else if (isBody) cellBg = 'bg-cyan-600/80 rounded-sm';
            else if (isFood) cellBg = 'bg-rose-500 rounded-full animate-pulse';

            return <div key={i} className={`w-[14px] h-[14px] ${cellBg}`} />;
          })}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 rounded">
            <span className="text-sm font-bold text-rose-400">Partie Terminée !</span>
            <span className="text-xs text-slate-300">Score final : {score}</span>
            <button
              onClick={resetGame}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rejouer</span>
            </button>
          </div>
        )}
      </div>

      {/* Contrôles d'aide */}
      <div className="text-[11px] text-slate-500 text-center">
        Contrôles : Touches fléchées ou Z/Q/S/D pour déplacer le serpent.
      </div>
    </div>
  );
};

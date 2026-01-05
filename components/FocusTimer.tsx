import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

const FocusTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound or notify
      if (mode === 'focus') {
        alert("¡Tiempo de foco terminado! Tómate un descanso.");
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        alert("Descanso terminado. ¿Listo para volver?");
        setMode('focus');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center">
      <div className="bg-white/10 p-3 rounded-full mb-4 backdrop-blur-sm">
        <Zap className="w-8 h-8 text-yellow-300" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{mode === 'focus' ? 'Modo Foco IA' : 'Micro-Descanso'}</h2>
      <p className="text-indigo-200 mb-8 max-w-xs">
        {mode === 'focus' 
          ? 'Concéntrate en una sola tarea. Silencia notificaciones.' 
          : 'Levántate, estira las piernas y mira por la ventana.'}
      </p>
      
      <div className="text-7xl font-mono font-bold tracking-tighter mb-8">
        {formatTime(timeLeft)}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={toggleTimer}
          className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-full font-bold text-lg transition-colors flex items-center gap-2"
        >
          {isActive ? <><Pause className="w-5 h-5"/> Pausa</> : <><Play className="w-5 h-5" /> Iniciar</>}
        </button>
        <button 
          onClick={resetTimer}
          className="bg-indigo-500/50 hover:bg-indigo-500/70 text-white px-4 py-3 rounded-full transition-colors"
          aria-label="Reiniciar"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FocusTimer;
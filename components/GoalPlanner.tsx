
import React, { useState } from 'react';
import { Goal, GoalPeriod } from '../types';
import { Plus, Check, Trash2, Target, Calendar, Award, Flag, Star, Zap } from 'lucide-react';

interface GoalPlannerProps {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
}

interface GoalCardProps {
    goal: Goal;
    colorFrom: string;
    colorTo: string;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, colorFrom, colorTo, onToggle, onDelete }) => (
    <div className="relative group animate-in zoom-in-95 duration-300">
        <div 
            className={`
                h-full p-4 rounded-xl shadow-md border border-white/10 relative overflow-hidden transition-all duration-300
                ${goal.completed ? 'opacity-60 grayscale' : 'hover:-translate-y-1 hover:shadow-xl'}
                bg-gradient-to-br ${colorFrom} ${colorTo}
            `}
        >
            {/* Background Texture */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="mb-2">
                    <h4 className={`font-bold text-white text-sm md:text-base leading-snug drop-shadow-sm ${goal.completed ? 'line-through decoration-white/50' : ''}`}>
                        {goal.text}
                    </h4>
                    {!goal.completed && (
                        <p className="text-[10px] text-white/80 mt-1 font-medium tracking-wide uppercase flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> Prioridad
                        </p>
                    )}
                </div>

                <div className="flex justify-between items-end mt-3 border-t border-white/20 pt-3">
                    <button 
                        onClick={() => onDelete(goal.id)}
                        className="text-white/60 hover:text-white p-1 hover:bg-white/20 rounded transition-colors"
                        title="Eliminar meta"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    <button 
                        onClick={() => onToggle(goal.id)}
                        className={`
                            px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 transition-all
                            ${goal.completed 
                                ? 'bg-white/20 text-white hover:bg-white/30' 
                                : 'bg-white text-slate-900 hover:scale-105 active:scale-95'}
                        `}
                    >
                        {goal.completed ? (
                            <>¡Logrado! <Check className="w-3 h-3" /></>
                        ) : (
                            <>Conquistar <Zap className="w-3 h-3" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

interface PeriodSectionProps {
    period: GoalPeriod;
    title: string;
    icon: any;
    gradientFrom: string;
    gradientTo: string;
    goals: Goal[];
    onToggleGoal: (id: string) => void;
    onDeleteGoal: (id: string) => void;
}

const PeriodSection: React.FC<PeriodSectionProps> = ({ period, title, icon: Icon, gradientFrom, gradientTo, goals, onToggleGoal, onDeleteGoal }) => {
    const periodGoals = goals.filter(g => g.period === period);
    
    return (
      <div className="flex flex-col gap-3">
         <div className="flex items-center gap-2 mb-1 px-1">
            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-sm`}>
                <Icon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">{title}</h3>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3">
            {periodGoals.length === 0 && (
                <div className="col-span-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center text-slate-400 min-h-[100px]">
                    <Icon className="w-6 h-6 mb-2 opacity-50" />
                    <p className="text-xs">Sin metas aún.</p>
                </div>
            )}
            {periodGoals.map(goal => (
                <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    colorFrom={gradientFrom}
                    colorTo={gradientTo}
                    onToggle={onToggleGoal}
                    onDelete={onDeleteGoal}
                />
            ))}
         </div>
      </div>
    );
};

const GoalPlanner: React.FC<GoalPlannerProps> = ({ goals, onAddGoal, onToggleGoal, onDeleteGoal }) => {
  const [newGoalText, setNewGoalText] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<GoalPeriod>('diario');

  const handleAdd = () => {
    if (!newGoalText.trim()) return;
    onAddGoal({
      id: Date.now().toString(),
      text: newGoalText,
      period: selectedPeriod,
      completed: false
    });
    setNewGoalText('');
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Input Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <Target className="w-8 h-8 text-teal-500" />
                Mapa de Conquistas
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm md:text-base">
                No anotes tareas, anota <span className="text-teal-600 dark:text-teal-400 font-bold">legados</span>. ¿Qué paso vas a dar hoy hacia tu mejor versión?
            </p>

            <div className="flex flex-col md:flex-row gap-3">
                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as GoalPeriod)}
                    className="px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                >
                    <option value="diario">Para Hoy</option>
                    <option value="semanal">Esta Semana</option>
                    <option value="mensual">Este Mes</option>
                    <option value="anual">Este Año</option>
                </select>
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        value={newGoalText}
                        onChange={(e) => setNewGoalText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        placeholder={`Ej: "Sentirme orgulloso de mi trabajo..."`}
                        className="flex-1 px-5 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner placeholder-slate-400"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!newGoalText.trim()}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-teal-900/20 active:scale-95 disabled:opacity-50 disabled:shadow-none"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PeriodSection 
            period="diario" 
            title="Mis Batallas de Hoy" 
            icon={Flag} 
            gradientFrom="from-blue-500" 
            gradientTo="to-indigo-600" 
            goals={goals}
            onToggleGoal={onToggleGoal}
            onDeleteGoal={onDeleteGoal}
        />
        <PeriodSection 
            period="semanal" 
            title="Mi Evolución Semanal" 
            icon={Calendar} 
            gradientFrom="from-emerald-500" 
            gradientTo="to-teal-600" 
            goals={goals}
            onToggleGoal={onToggleGoal}
            onDeleteGoal={onDeleteGoal}
        />
        <PeriodSection 
            period="mensual" 
            title="Mi Transformación Mensual" 
            icon={Target} 
            gradientFrom="from-violet-500" 
            gradientTo="to-purple-600" 
            goals={goals}
            onToggleGoal={onToggleGoal}
            onDeleteGoal={onDeleteGoal}
        />
        <PeriodSection 
            period="anual" 
            title="El Legado de este Año" 
            icon={Award} 
            gradientFrom="from-amber-500" 
            gradientTo="to-orange-600" 
            goals={goals}
            onToggleGoal={onToggleGoal}
            onDeleteGoal={onDeleteGoal}
        />
      </div>
    </div>
  );
};

export default GoalPlanner;

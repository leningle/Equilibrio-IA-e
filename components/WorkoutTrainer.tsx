import React, { useState } from 'react';
import { generateTextResponse } from '../services/geminiService';
import { ModelType, WorkoutPlan } from '../types';
import { Dumbbell, Activity, Flame, ChevronRight, PlayCircle, Trophy, Loader2, Save } from 'lucide-react';

const WorkoutTrainer: React.FC = () => {
  const [target, setTarget] = useState('');
  const [equipment, setEquipment] = useState('bodyweight');
  const [level, setLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);

  const generateWorkout = async () => {
    if (!target) return;
    setLoading(true);

    const prompt = `Actúa como un entrenador personal experto. Crea una rutina de ejercicios en formato JSON para:
    - Objetivo/Músculo: ${target}
    - Equipo disponible: ${equipment}
    - Nivel: ${level}
    
    Devuelve SOLAMENTE un objeto JSON válido con esta estructura (sin markdown):
    {
      "name": "Nombre creativo de la rutina",
      "targetMuscle": "${target}",
      "exercises": [
        { "name": "Nombre ejercicio", "sets": "Número series", "reps": "Número repeticiones", "notes": "Breve tip de forma" }
      ]
    }`;

    try {
      const response = await generateTextResponse({ prompt, modelType: ModelType.FLASH_LITE });
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const plan = JSON.parse(cleanJson);
      setWorkout({ ...plan, id: Date.now().toString() });
    } catch (error) {
      console.error(error);
      alert("Error generando rutina. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
          <Dumbbell className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Entrenador Personal IA
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">¿Qué quieres entrenar?</label>
            <input 
              type="text" 
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Ej: Pecho, Piernas, Cuerpo Completo..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Equipo Disponible</label>
            <select 
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
            >
              <option value="bodyweight">Solo peso corporal (Casa)</option>
              <option value="dumbbells">Mancuernas / Pesas</option>
              <option value="gym">Gimnasio Completo</option>
              <option value="bands">Bandas Elásticas</option>
            </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nivel</label>
            <select 
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>
        </div>

        <button 
          onClick={generateWorkout}
          disabled={loading || !target}
          className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Flame className="w-5 h-5" />}
          Generar Rutina de Poder
        </button>
      </div>

      {/* Results Display */}
      {workout && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
             <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" /> {workout.name}
                </h3>
                <p className="text-slate-400 text-sm mt-1">Enfoque: {workout.targetMuscle}</p>
             </div>
             <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <Save className="w-5 h-5" />
             </button>
          </div>

          <div className="p-6 grid gap-4">
            {workout.exercises.map((ex, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 hover:border-teal-500 transition-colors group">
                <div className="bg-white dark:bg-slate-800 w-10 h-10 rounded-full flex items-center justify-center font-bold text-teal-600 dark:text-teal-400 shadow-sm shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-teal-600 transition-colors">
                    {ex.name}
                  </h4>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 px-3 py-1 rounded-full font-medium">
                      {ex.sets} Series
                    </span>
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full font-medium">
                      {ex.reps} Repeticiones
                    </span>
                  </div>
                  {ex.notes && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 italic flex items-start gap-1">
                      <Activity className="w-4 h-4 mt-0.5 shrink-0" /> {ex.notes}
                    </p>
                  )}
                </div>
                <button className="text-slate-300 hover:text-teal-500 self-center">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 text-center">
            <button className="text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center gap-2 w-full py-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
              <PlayCircle className="w-5 h-5" /> Comenzar Entrenamiento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutTrainer;

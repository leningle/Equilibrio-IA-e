
import React, { useState, useRef } from 'react';
import { RoutineType } from '../types';
import { Camera, User, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface OnboardingData {
    name: string;
    mainGoal: string;
    routinePreference: RoutineType;
    avatar?: string;
}

interface SimpleOnboardingProps {
    initialName: string;
    onComplete: (data: OnboardingData) => void;
}

const PRESET_GOALS = [
    "Organizar mi vida y rutina",
    "Salir adelante con mis proyectos",
    "Recuperar mi equilibrio personal",
    "Ser más productivo en el trabajo",
    "Mejorar mi salud y energía"
];

const SimpleOnboarding: React.FC<SimpleOnboardingProps> = ({ initialName, onComplete }) => {
    const [name, setName] = useState(initialName);
    const [mainGoal, setMainGoal] = useState('');
    const [routinePref, setRoutinePref] = useState<RoutineType>(RoutineType.MORNING_PRODUCTIVE);
    const [avatar, setAvatar] = useState<string | undefined>(undefined);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setAvatar(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!name.trim() || !mainGoal.trim() || !acceptedTerms) return;
        onComplete({
            name,
            mainGoal,
            routinePreference: routinePref,
            avatar
        });
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-4">
            {/* Main Card Container */}
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header Strip - Personal Tone */}
                <div className="bg-slate-100 dark:bg-slate-800 px-8 py-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-800 dark:text-white text-2xl flex items-center gap-2">
                        <User className="w-6 h-6 text-teal-600" />
                        Mis Datos
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Configura tu perfil para adaptar el sistema a ti.</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Top Section: Photo & Basic Info */}
                    <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                        {/* Avatar Section */}
                        <div className="relative group shrink-0 text-center">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-28 h-28 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-dashed border-slate-400 dark:border-slate-600 flex items-center justify-center cursor-pointer overflow-hidden hover:border-teal-500 transition-colors shadow-inner"
                            >
                                {avatar ? (
                                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="w-8 h-8 text-slate-400" />
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                            <p className="text-[10px] uppercase tracking-wide mt-3 text-teal-600 cursor-pointer font-bold hover:underline">Subir Foto</p>
                        </div>

                        {/* Inputs Section */}
                        <div className="flex-1 w-full space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Tu nombre aquí"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Modalidad de Horario</label>
                                <select 
                                    value={routinePref}
                                    onChange={(e) => setRoutinePref(e.target.value as RoutineType)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                >
                                    <option value={RoutineType.MORNING_PRODUCTIVE}>Mañana (Activo temprano)</option>
                                    <option value={RoutineType.AFTERNOON_FOCUS}>Tarde (Activo tarde)</option>
                                    <option value={RoutineType.SPLIT_SHIFT}>Jornada Partida</option>
                                    <option value={RoutineType.WEEKEND_RECHARGE}>Weekend Recharge (Ocio y Relax)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Goal Section with Presets */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-teal-500"/> Objetivo Principal (Foco Actual)
                         </label>
                         
                         <input 
                            type="text" 
                            value={mainGoal}
                            onChange={(e) => setMainGoal(e.target.value)}
                            placeholder="Escribe tu meta o selecciona una abajo..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none placeholder:text-slate-400 font-medium mb-3"
                        />

                        {/* Preset Goals Chips */}
                        <div className="flex flex-wrap gap-2">
                            {PRESET_GOALS.map((goal, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainGoal(goal)}
                                    className={`text-[10px] px-3 py-1.5 rounded-full border transition-all ${
                                        mainGoal === goal 
                                        ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700 font-bold' 
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:text-teal-600'
                                    }`}
                                >
                                    {goal}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer / Terms */}
                <div className="bg-slate-50 dark:bg-slate-950/50 p-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-3 mb-6 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center h-5">
                            <input 
                                id="terms" 
                                type="checkbox" 
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                            />
                        </div>
                        <label htmlFor="terms" className="select-none cursor-pointer">
                            <span className="block text-sm font-bold text-slate-800 dark:text-white mb-1">Acepto los términos de uso personal</span>
                            <span className="block text-xs text-slate-500 leading-relaxed">
                                Entiendo que esta aplicación guarda mis datos exclusivamente en este dispositivo para organizar mi rutina diaria. No se comparten datos con terceros.
                            </span>
                        </label>
                    </div>

                    <button 
                        onClick={handleSubmit}
                        disabled={!acceptedTerms || !name || !mainGoal}
                        className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <span>INGRESAR AL SISTEMA</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            <p className="mt-6 text-slate-500 text-xs text-center opacity-60 font-mono">
                SISTEMA V1.0 • ALMACENAMIENTO LOCAL SEGURO
            </p>
        </div>
    );
};

export default SimpleOnboarding;


import React, { useState } from 'react';
import { RoutineType, Goal } from '../types';
import { ArrowRight, Sparkles, User, Target, Sun, Moon, CheckCircle2, Rocket } from 'lucide-react';

interface OnboardingData {
    name: string;
    mainGoal: string;
    routinePreference: RoutineType;
}

interface OnboardingWizardProps {
    onComplete: (data: OnboardingData) => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [mainGoal, setMainGoal] = useState('');
    const [routinePref, setRoutinePref] = useState<RoutineType>(RoutineType.MORNING_PRODUCTIVE);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleNext = () => {
        if (step === 1 && !name.trim()) return;
        if (step === 2 && !mainGoal.trim()) return;

        setIsAnimating(true);
        setTimeout(() => {
            setStep(prev => prev + 1);
            setIsAnimating(false);
        }, 300);
    };

    const handleFinish = () => {
        setIsAnimating(true);
        setTimeout(() => {
            onComplete({
                name,
                mainGoal,
                routinePreference: routinePref
            });
        }, 500);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-500/50">
                            <User className="w-10 h-10 text-teal-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Hola, viajero.</h2>
                        <p className="text-slate-300 text-lg">Para ajustar tu brújula, necesito saber cómo llamarte.</p>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tu Nombre"
                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-6 py-4 text-xl text-center text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                            autoFocus
                        />
                        <button 
                            onClick={handleNext}
                            disabled={!name.trim()}
                            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                        >
                            Siguiente <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/50">
                            <Target className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Una gran meta.</h2>
                        <p className="text-slate-300">Si solo pudieras lograr una cosa importante esta semana, ¿cuál sería? (Sé breve)</p>
                        <input 
                            type="text" 
                            value={mainGoal}
                            onChange={(e) => setMainGoal(e.target.value)}
                            placeholder="Ej: Terminar el proyecto X, Empezar a correr..."
                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-6 py-4 text-lg text-center text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                        <button 
                            onClick={handleNext}
                            disabled={!mainGoal.trim()}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            Confirmar Meta <CheckCircle2 className="w-5 h-5" />
                        </button>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/50">
                            <Sparkles className="w-10 h-10 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Tu Ritmo Natural</h2>
                        <p className="text-slate-300">¿Cuándo tienes más energía para hacer cosas difíciles?</p>
                        
                        <div className="grid grid-cols-1 gap-3">
                            <button 
                                onClick={() => setRoutinePref(RoutineType.MORNING_PRODUCTIVE)}
                                className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${routinePref === RoutineType.MORNING_PRODUCTIVE ? 'border-amber-400 bg-amber-400/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'}`}
                            >
                                <div className="p-2 bg-amber-100 rounded-full text-amber-600"><Sun className="w-6 h-6"/></div>
                                <div className="text-left">
                                    <h4 className="text-white font-bold">Por la Mañana</h4>
                                    <p className="text-xs text-slate-400">Soy madrugador y activo.</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setRoutinePref(RoutineType.AFTERNOON_FOCUS)}
                                className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${routinePref === RoutineType.AFTERNOON_FOCUS ? 'border-purple-400 bg-purple-400/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'}`}
                            >
                                <div className="p-2 bg-purple-100 rounded-full text-purple-600"><Moon className="w-6 h-6"/></div>
                                <div className="text-left">
                                    <h4 className="text-white font-bold">Tarde / Noche</h4>
                                    <p className="text-xs text-slate-400">Me concentro mejor tarde.</p>
                                </div>
                            </button>
                        </div>

                        <button 
                            onClick={handleFinish}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                        >
                            <Rocket className="w-5 h-5" /> Iniciar mi Sistema
                        </button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>
            
            <div className={`relative z-10 w-full max-w-md transition-opacity duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                {/* Progress Bar */}
                <div className="flex gap-2 mb-8 justify-center">
                    <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-teal-500' : 'bg-slate-700'}`}></div>
                    <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-teal-500' : 'bg-slate-700'}`}></div>
                    <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 3 ? 'bg-teal-500' : 'bg-slate-700'}`}></div>
                </div>

                {renderStep()}
            </div>
        </div>
    );
};

export default OnboardingWizard;

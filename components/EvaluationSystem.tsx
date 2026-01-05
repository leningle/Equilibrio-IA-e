
import React, { useState, useMemo, useRef } from 'react';
import { DailyEvaluation } from '../types';
import { Calendar, Star, Zap, MessageSquare, AlertTriangle, CheckCircle2, Mic, Square, ThumbsUp, ThumbsDown, Minus, Smile, Frown, Meh, Play, Trash2 } from 'lucide-react';

interface EvaluationSystemProps {
    evaluations: DailyEvaluation[];
    onSaveEvaluation: (evaluation: DailyEvaluation) => void;
    lastInteractionTimestamp?: number;
}

const EvaluationSystem: React.FC<EvaluationSystemProps> = ({ evaluations, onSaveEvaluation, lastInteractionTimestamp }) => {
    // Form State
    const [planCompletion, setPlanCompletion] = useState<'yes' | 'partial' | 'no' | null>(null);
    const [moodEmoji, setMoodEmoji] = useState<DailyEvaluation['moodEmoji'] | null>(null);
    const [energyLevel, setEnergyLevel] = useState(5);
    const [todayRating, setTodayRating] = useState(0);
    
    // Audio State
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get today's date string YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    const existingEvaluation = evaluations.find(e => e.date === todayStr);
    const hasEvaluatedToday = !!existingEvaluation;

    // --- LOGIC: INTERACTION TRACKING (The "Ghosting" Detector) ---
    const getInteractionStatus = () => {
        if (!lastInteractionTimestamp) return { status: 'danger', days: 'Nunca', msg: "No hemos hablado nunca." };
        
        const now = Date.now();
        const diffMs = now - lastInteractionTimestamp;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return { status: 'good', days: 'Hoy', msg: "Estamos conectados." };
        if (diffDays < 3) return { status: 'warning', days: `${diffDays} días`, msg: "Vuelve al chat." };
        return { status: 'danger', days: `${diffDays} días`, msg: "Alerta: No te aísles." };
    };

    const interactionStatus = getInteractionStatus();

    // --- LOGIC: AUDIO RECORDING ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    setAudioUrl(reader.result as string);
                };
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error mic", err);
            alert("No se pudo acceder al micrófono.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // --- LOGIC: CALENDAR GENERATION ---
    const calendarDays = useMemo(() => {
        const days = [];
        const today = new Date();
        // Generate last 28 days
        for (let i = 27; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const evaluation = evaluations.find(e => e.date === dateStr);
            days.push({ date: dateStr, evaluation, dayNum: d.getDate() });
        }
        return days;
    }, [evaluations]);

    const handleSubmit = () => {
        if (!planCompletion || !moodEmoji || todayRating === 0) {
            alert("Por favor completa los íconos básicos (Plan, Ánimo y Estrellas).");
            return;
        }
        
        const newEval: DailyEvaluation = {
            date: todayStr,
            rating: todayRating,
            planCompletion,
            moodEmoji,
            energyLevel,
            audioNote: audioUrl,
            interactionScore: interactionStatus.status === 'good' ? 10 : 0
        };

        onSaveEvaluation(newEval);
        setIsSubmitting(true);
        setTimeout(() => setIsSubmitting(false), 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            
            {/* 1. CONNECTION STATUS (The "Ghosting" Detector) - Compact */}
            {interactionStatus.status !== 'good' && (
                <div className="p-4 rounded-xl bg-rose-900/20 border border-rose-500/50 flex items-center gap-4 animate-pulse">
                     <AlertTriangle className="w-6 h-6 text-rose-500" />
                     <div className="flex-1">
                         <p className="text-sm text-rose-200 font-bold">Hace {interactionStatus.days} que no hablamos.</p>
                         <p className="text-xs text-rose-300">No me digas que estás bien si te estás escondiendo.</p>
                     </div>
                </div>
            )}

            {/* 2. CALENDAR ALMANAC (Heatmap) */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-400" />
                        Tu Constancia
                    </h3>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.map((day, idx) => {
                        const isToday = day.date === todayStr;
                        const rating = day.evaluation?.rating || 0;
                        const done = day.evaluation?.planCompletion === 'yes';
                        
                        let bgClass = 'bg-slate-800/50';
                        let borderClass = 'border-slate-800';
                        
                        if (day.evaluation) {
                            if (done) {
                                bgClass = 'bg-teal-500 shadow-[0_0_5px_rgba(20,184,166,0.6)]';
                                borderClass = 'border-teal-400';
                            } else if (day.evaluation.planCompletion === 'partial') {
                                bgClass = 'bg-yellow-600';
                                borderClass = 'border-yellow-500';
                            } else {
                                bgClass = 'bg-rose-900';
                                borderClass = 'border-rose-800';
                            }
                        }
                        
                        if (isToday && !hasEvaluatedToday) {
                            borderClass = 'border-dashed border-slate-500 animate-pulse';
                        }

                        return (
                            <div key={idx} className="flex flex-col items-center">
                                <div 
                                    className={`w-full aspect-square rounded-md border ${borderClass} ${bgClass} flex items-center justify-center text-[10px] font-bold text-white transition-all`}
                                >
                                    {day.dayNum}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 3. QUICK CHECK-IN FORM */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
                {!hasEvaluatedToday ? (
                    <>
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
                            <CheckCircle2 className="w-5 h-5 text-teal-400" />
                            <h3 className="text-lg font-bold text-white">Check-in Rápido</h3>
                        </div>

                        <div className="space-y-8">
                            
                            {/* Q1: PLAN COMPLETION (Big Buttons) */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-3 text-center">¿Cumpliste lo planeado?</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        onClick={() => setPlanCompletion('no')}
                                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all active:scale-95 ${
                                            planCompletion === 'no' 
                                            ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
                                        }`}
                                    >
                                        <ThumbsDown className="w-8 h-8" />
                                        <span className="text-xs font-bold">No</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => setPlanCompletion('partial')}
                                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all active:scale-95 ${
                                            planCompletion === 'partial' 
                                            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' 
                                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
                                        }`}
                                    >
                                        <Minus className="w-8 h-8" />
                                        <span className="text-xs font-bold">A medias</span>
                                    </button>

                                    <button 
                                        onClick={() => setPlanCompletion('yes')}
                                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all active:scale-95 ${
                                            planCompletion === 'yes' 
                                            ? 'bg-teal-500/20 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]' 
                                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
                                        }`}
                                    >
                                        <ThumbsUp className="w-8 h-8" />
                                        <span className="text-xs font-bold">¡Sí!</span>
                                    </button>
                                </div>
                            </div>

                            {/* Q2: MOOD & ENERGY */}
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-3 text-center">¿Cómo te sientes?</label>
                                    <div className="flex justify-between px-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                        {[
                                            { id: 'terrible', icon: '😫', label: 'Mal' },
                                            { id: 'bad', icon: '😕', label: 'Bajo' },
                                            { id: 'neutral', icon: '😐', label: 'Normal' },
                                            { id: 'good', icon: '🙂', label: 'Bien' },
                                            { id: 'great', icon: '🤩', label: 'Genial' }
                                        ].map((mood) => (
                                            <button
                                                key={mood.id}
                                                onClick={() => setMoodEmoji(mood.id as any)}
                                                className={`flex flex-col items-center gap-1 transition-transform ${
                                                    moodEmoji === mood.id ? 'scale-125 opacity-100' : 'opacity-40 hover:opacity-80'
                                                }`}
                                            >
                                                <span className="text-3xl filter drop-shadow-md">{mood.icon}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                     <label className="block text-sm font-bold text-slate-300 mb-2 flex justify-between">
                                        <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> Energía</span>
                                        <span className="text-teal-400">{energyLevel}/10</span>
                                     </label>
                                     <input 
                                        type="range" 
                                        min="1" 
                                        max="10" 
                                        value={energyLevel} 
                                        onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                                        className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                    />
                                </div>
                            </div>

                            {/* Q3: AUDIO DUMP (The "Desahogo") */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-3 text-center">Desahogo Rápido (Opcional)</label>
                                <div className="flex flex-col items-center justify-center gap-3 bg-slate-800/50 rounded-xl p-4 border border-slate-700 border-dashed">
                                    {!audioUrl ? (
                                        !isRecording ? (
                                            <button 
                                                onClick={startRecording}
                                                className="w-16 h-16 rounded-full bg-slate-700 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-lg active:scale-90"
                                            >
                                                <Mic className="w-8 h-8" />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={stopRecording}
                                                className="w-16 h-16 rounded-full bg-rose-600 animate-pulse text-white flex items-center justify-center transition-all shadow-lg"
                                            >
                                                <Square className="w-6 h-6 fill-current" />
                                            </button>
                                        )
                                    ) : (
                                        <div className="flex items-center gap-4 w-full justify-center">
                                             <button 
                                                onClick={() => new Audio(audioUrl).play()}
                                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-full font-bold shadow-lg"
                                             >
                                                 <Play className="w-4 h-4 fill-current" /> Escuchar
                                             </button>
                                             <button 
                                                onClick={() => setAudioUrl(undefined)}
                                                className="p-2 text-rose-400 hover:bg-rose-900/20 rounded-full"
                                             >
                                                 <Trash2 className="w-5 h-5" />
                                             </button>
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-500">
                                        {isRecording ? "Grabando... (Toca para terminar)" : !audioUrl ? "Toca para grabar audio nota" : "Audio grabado"}
                                    </p>
                                </div>
                            </div>

                            {/* Q4: RATING & SAVE */}
                            <div className="pt-4 border-t border-slate-700">
                                <div className="flex justify-center gap-2 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setTodayRating(star)}
                                            className={`transition-all duration-300 ${
                                                todayRating >= star 
                                                ? 'text-yellow-400 scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' 
                                                : 'text-slate-700'
                                            }`}
                                        >
                                            <Star className={`w-8 h-8 ${todayRating >= star ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    onClick={handleSubmit}
                                    className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold text-lg rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? "Guardando..." : "Cerrar Día"}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in">
                        <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                            <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3">¡Listo!</h3>
                        <p className="text-slate-400 max-w-xs text-lg mb-6">
                            Día registrado. Mañana seguimos construyendo.
                        </p>
                        
                        {/* Display Summary of today's input */}
                        <div className="flex gap-4 opacity-70">
                             <span className="text-2xl" title="Plan">{existingEvaluation.planCompletion === 'yes' ? '👍' : existingEvaluation.planCompletion === 'partial' ? '✋' : '👎'}</span>
                             <span className="text-2xl" title="Mood">
                                {existingEvaluation.moodEmoji === 'great' ? '🤩' : 
                                 existingEvaluation.moodEmoji === 'good' ? '🙂' : 
                                 existingEvaluation.moodEmoji === 'neutral' ? '😐' : 
                                 existingEvaluation.moodEmoji === 'bad' ? '😕' : '😫'}
                             </span>
                             <span className="text-2xl font-bold text-yellow-500 flex items-center">{existingEvaluation.rating}★</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EvaluationSystem;

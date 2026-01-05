
import React, { useState, useEffect, useMemo } from 'react';
import { DailyStats, Routine, DailyEvaluation, Goal } from '../types';
import { MOTIVATIONAL_QUOTES } from '../constants';
import { Briefcase, Heart, Coffee, Sun, CheckCircle2, MapPin, Clock, Sparkles, FastForward, BellRing, CalendarDays, AlertCircle, Radio, PieChart } from 'lucide-react';

interface DashboardProps {
    stats: DailyStats[]; 
    currentRoutine?: Routine;
    userAvatar?: string;
    mentorAvatar?: string;
    evaluations?: DailyEvaluation[];
    goals?: Goal[];
    onOpenChat: () => void;
    onShiftSchedule?: () => void; 
}

const Dashboard: React.FC<DashboardProps> = ({ currentRoutine, userAvatar, mentorAvatar, evaluations = [], onOpenChat, onShiftSchedule }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [aiQuote, setAiQuote] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); 
        return () => clearInterval(timer);
    }, []);

    // Calculate routine durations
    const routineSummary = useMemo(() => {
        if (!currentRoutine) return { work: 0, sacred: 0 };
        let work = 0;
        let sacred = 0;
        
        currentRoutine.blocks.forEach((block, i) => {
            const [h, m] = block.time.split(':').map(Number);
            const start = h * 60 + m;
            let end = start + 60; // Default 60 min if last block
            
            // Try to infer end time from next block
            if (i < currentRoutine.blocks.length - 1) {
                const [nextH, nextM] = currentRoutine.blocks[i+1].time.split(':').map(Number);
                end = nextH * 60 + nextM;
            }
            
            const duration = Math.max(0, end - start);
            
            if (block.type === 'work') work += duration;
            if (block.type === 'sacred') sacred += duration;
        });

        return { work, sacred };
    }, [currentRoutine]);

    const formatMins = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h > 0 && m > 0) return `${h}h ${m}m`;
        if (h > 0) return `${h}h`;
        return `${m}m`;
    };

    // Personalized Motivation Logic
    useEffect(() => {
        if (aiQuote) return;
        const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
        setAiQuote(randomQuote);
    }, []);

    const routineProgress = useMemo(() => {
        if (!currentRoutine || !currentRoutine.blocks.length) return 0;
        const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        
        let completed = 0;
        currentRoutine.blocks.forEach((block, index) => {
            const [h, m] = block.time.split(':').map(Number);
            const blockStart = h * 60 + m;
            
            if (nowMinutes >= blockStart) {
                completed++;
            }
        });

        return Math.round((completed / currentRoutine.blocks.length) * 100);
    }, [currentRoutine, currentTime]);

    const currentActivityBlock = useMemo(() => {
        if (!currentRoutine) return null;
        const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        return currentRoutine.blocks.find((block, index) => {
            const [bh, bm] = block.time.split(':').map(Number);
            const start = bh * 60 + bm;
            let end = start + 60;
            if (index < currentRoutine.blocks.length - 1) {
                const [nh, nm] = currentRoutine.blocks[index + 1].time.split(':').map(Number);
                end = nh * 60 + nm;
            }
            return nowMinutes >= start && nowMinutes < end;
        });
    }, [currentRoutine, currentTime]);

    const getIcon = (type: string) => {
         switch (type) {
            case 'work': return <Briefcase className="w-5 h-5" />;
            case 'sacred': return <Heart className="w-5 h-5" />;
            case 'break': return <Coffee className="w-5 h-5" />;
            default: return <Sun className="w-5 h-5" />;
        }
    };

    if (!currentRoutine) return <div className="p-8 text-center text-slate-300">Iniciando sistema...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 pb-20 md:pb-8 relative">
            
            {/* MOBILE ONLY: COMPACT HEADER (Simpler than Hero) */}
            <div className="lg:hidden col-span-1 flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                         <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            <path className="text-teal-500" strokeDasharray={`${routineProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{routineProgress}%</div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">Tu Progreso</h2>
                        <p className="text-xs text-slate-400">"{aiQuote?.slice(0, 30)}..."</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-teal-500/30 overflow-hidden" onClick={onOpenChat}>
                    {mentorAvatar ? <img src={mentorAvatar} className="w-full h-full object-cover"/> : <Sparkles className="p-2 w-full h-full text-teal-400"/>}
                </div>
            </div>

            {/* DESKTOP ONLY: HERO PANEL */}
            <div className="hidden lg:block lg:col-span-3">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[250px]">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -ml-20 -mt-20 animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mb-20 animate-pulse" style={{animationDelay: '1s'}}></div>
                    
                    <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8 md:px-10">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-700 bg-slate-800 overflow-hidden shadow-2xl relative">
                                {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt="User"/> : <CheckCircle2 className="p-6 w-full h-full text-slate-600"/>}
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Yo Actual</span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center">
                             <div className="relative">
                                <div className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-lg">
                                    {routineProgress}%
                                </div>
                                <div className="absolute -top-4 -right-8 bg-teal-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-bounce">
                                    HOY
                                </div>
                             </div>
                            <p className="text-teal-400 font-bold text-xs tracking-widest uppercase mt-3">Rutina Diaria Completada</p>
                            <div className="mt-6 max-w-md px-4 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 relative">
                                <p className="text-slate-200 text-sm md:text-base font-medium italic leading-relaxed">"{aiQuote}"</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={onOpenChat}>
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-teal-500/30 bg-slate-800 overflow-hidden relative shadow-2xl z-10 hover:scale-105 transition-transform">
                                {mentorAvatar ? <img src={mentorAvatar} className="w-full h-full object-cover" alt="Mentor"/> : <Sparkles className="p-6 w-full h-full text-teal-200"/>}
                            </div>
                            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest mt-1 drop-shadow-md">Yo Futuro</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MISSION CONTROL: CURRENT BLOCK (Simplified for Mobile) */}
            <div className="lg:col-span-3">
                <div className="bg-gradient-to-r from-teal-900/40 to-emerald-900/40 p-5 md:p-6 rounded-3xl md:rounded-[2rem] border border-teal-500/30 shadow-lg relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Clock className="w-24 h-24" />
                     </div>
                     <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                         <div className="flex items-center gap-5 w-full md:w-auto">
                             <div className="bg-teal-500 p-3 md:p-4 rounded-2xl shadow-lg animate-pulse ring-4 ring-teal-500/20 shrink-0">
                                 <Radio className="w-6 h-6 md:w-8 md:h-8 text-white" />
                             </div>
                             <div className="flex-1 min-w-0">
                                 <h3 className="text-[10px] font-black text-teal-300 uppercase tracking-widest mb-1">Misión en Curso</h3>
                                 <h2 className="text-2xl md:text-4xl font-black text-white leading-tight truncate">
                                     {currentActivityBlock ? currentActivityBlock.activity : "Tiempo de Recarga"}
                                 </h2>
                                 <div className="flex items-center gap-3 mt-2">
                                     <span className="text-slate-300 text-sm flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                                        <Clock className="w-3 h-3" /> {currentActivityBlock?.time || '--:--'}
                                     </span>
                                     {currentActivityBlock?.location && (
                                         <span className="text-slate-300 text-sm flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md truncate max-w-[100px]">
                                            <MapPin className="w-3 h-3" /> {currentActivityBlock.location}
                                         </span>
                                     )}
                                 </div>
                             </div>
                         </div>
                         <div className="flex items-center gap-2 w-full md:w-auto">
                            <button 
                                onClick={onShiftSchedule}
                                className="flex-1 md:flex-none bg-slate-800/80 hover:bg-slate-700 text-white px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/5 text-sm md:text-base"
                            >
                                <FastForward className="w-4 h-4" /> +15m
                            </button>
                            <button className="flex-1 md:flex-none bg-white text-teal-900 px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black hover:bg-teal-50 transition-colors shadow-xl active:scale-95 text-sm md:text-base">
                                Logrado
                            </button>
                         </div>
                     </div>
                </div>
            </div>

            {/* SIDE COLUMN: ALERTS & SUMMARY (Hidden on Mobile for Simplicity) */}
            <div className="hidden lg:flex lg:col-span-1 flex-col gap-6">
                {/* 1. Alerts Panel */}
                <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-sm">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <BellRing className="w-5 h-5 text-amber-400" /> Alertas
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                        <AlertCircle className="w-3 h-3 inline mr-1 text-amber-500"/>
                        El sistema te notificará 5 minutos antes de cada bloque.
                    </p>
                </div>

                {/* 2. Daily Summary Panel */}
                <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-sm">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-400" /> Resumen
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-900/10 rounded-2xl border border-blue-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-blue-200/60 uppercase font-black tracking-wider">Foco</p>
                                    <p className="text-xl font-bold text-white">{formatMins(routineSummary.work)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-rose-900/10 rounded-2xl border border-rose-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400">
                                    <Heart className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-rose-200/60 uppercase font-black tracking-wider">Sagrado</p>
                                    <p className="text-xl font-bold text-white">{formatMins(routineSummary.sacred)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Goal Snapshot */}
                <div className="bg-indigo-900/20 rounded-3xl p-6 border border-indigo-500/20 backdrop-blur-sm">
                     <h2 className="text-sm font-bold text-indigo-200 mb-2 flex items-center gap-2 uppercase tracking-wide">
                        <CalendarDays className="w-4 h-4" /> Meta Principal
                    </h2>
                    <p className="text-lg text-white font-medium leading-relaxed italic">
                        "{JSON.parse(localStorage.getItem('equilibrio_user') || '{}').mainGoal || 'Define tu meta en ajustes'}"
                    </p>
                </div>
            </div>

            {/* MAIN LIST: UPCOMING */}
            <div className="lg:col-span-2">
                <div className="bg-slate-800/20 backdrop-blur-md rounded-3xl md:rounded-[2rem] p-5 md:p-8 border border-white/10 shadow-inner h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg md:text-xl font-bold text-white">Próximo en tu Agenda</h2>
                        <button className="text-teal-400 text-xs font-bold hover:underline">Ver todo</button>
                    </div>
                    <div className="space-y-3">
                        {currentRoutine.blocks.map((block, idx) => {
                            // Simple logic to dim past events
                            const [bh, bm] = block.time.split(':').map(Number);
                            const blockMins = bh * 60 + bm;
                            const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes();
                            const isPast = nowMins > blockMins + 30; // 30 min buffer

                            return (
                                <div key={idx} className={`flex items-center gap-4 p-3 md:p-4 rounded-2xl border transition-all ${isPast ? 'bg-slate-900/50 border-white/5 opacity-40' : 'bg-slate-800/50 border-white/10 hover:bg-slate-800 hover:border-teal-500/30'}`}>
                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-sm md:text-lg shrink-0 ${isPast ? 'bg-slate-700 text-slate-500' : 'bg-teal-500/10 text-teal-400'}`}>
                                        {block.time}
                                    </div>
                                    <span className={`flex-1 font-bold text-sm md:text-lg truncate ${isPast ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-200'}`}>{block.activity}</span>
                                    {getIcon(block.type)}
                                    {!isPast && <ChevronRight className="w-5 h-5 text-slate-600" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChevronRight = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default Dashboard;

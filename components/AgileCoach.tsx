import React, { useState } from 'react';
import { RetroEntry } from '../types';
import { RefreshCw, ThumbsUp, TrendingUp, CheckCircle } from 'lucide-react';

const AgileCoach: React.FC = () => {
    const [entries, setEntries] = useState<RetroEntry[]>([]);
    const [wentWell, setWentWell] = useState('');
    const [toImprove, setToImprove] = useState('');
    const [actionItem, setActionItem] = useState('');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        if (!wentWell && !toImprove) return;
        
        const newEntry: RetroEntry = {
            date: new Date().toLocaleDateString(),
            wentWell,
            toImprove,
            actionItem
        };
        
        setEntries([newEntry, ...entries]);
        setWentWell('');
        setToImprove('');
        setActionItem('');
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-indigo-600" />
                        Modo Mejora (Retrospectiva)
                    </h2>
                    <p className="text-slate-500 mb-6">"Modo uno y una mejora". Analiza tu día para ser más ágil mañana.</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                <ThumbsUp className="w-4 h-4 text-emerald-500" /> ¿Qué salió bien hoy?
                            </label>
                            <textarea 
                                value={wentWell}
                                onChange={(e) => setWentWell(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                rows={2}
                                placeholder="Ej: Completé el bloque de foco sin distracciones..."
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-rose-500" /> ¿Qué puedo mejorar?
                            </label>
                            <textarea 
                                value={toImprove}
                                onChange={(e) => setToImprove(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                rows={2}
                                placeholder="Ej: Me distraje con redes sociales a las 10:00..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-500" /> Acción Concreta para Mañana
                            </label>
                            <input 
                                type="text"
                                value={actionItem}
                                onChange={(e) => setActionItem(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Ej: Dejar el teléfono en otra habitación durante el foco."
                            />
                        </div>

                        <button 
                            onClick={handleSave}
                            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                                saved ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {saved ? '¡Guardado!' : 'Registrar Mejora'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 overflow-y-auto max-h-[600px]">
                <h3 className="font-bold text-slate-800 mb-4">Historial de Mejoras</h3>
                <div className="space-y-4">
                    {entries.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                            <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>Sin registros aún. ¡Empieza hoy!</p>
                        </div>
                    )}
                    {entries.map((entry, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-500">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-2">{entry.date}</div>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <div><span className="font-bold text-emerald-600">Bien:</span> {entry.wentWell}</div>
                                <div><span className="font-bold text-rose-600">Mejorar:</span> {entry.toImprove}</div>
                                <div className="mt-2 pt-2 border-t border-slate-100 font-medium text-indigo-700">
                                    🚀 Acción: {entry.actionItem}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AgileCoach;
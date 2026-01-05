
import React, { useRef, useState } from 'react';
import { AppSettings } from '../types';
import { PRESET_ALARMS, DEFAULT_ALARM_URL } from '../constants';
import { Music, Play, Upload, Trash2, BellRing, Palette, UserCircle2, Camera, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';

interface SettingsProps {
    settings: AppSettings;
    onUpdateSettings: (settings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const alarmInputRef = useRef<HTMLInputElement>(null);
    const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleAlarmUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError(null);
        const file = e.target.files?.[0];
        
        if (file) {
            // Check size limit (1.5MB to be safe for localStorage)
            if (file.size > 1.5 * 1024 * 1024) {
                setUploadError("El archivo es demasiado grande (Máx 1.5MB). Intenta con un clip de audio más corto.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                const url = ev.target?.result as string;
                // Test play
                const audio = new Audio(url);
                audio.volume = 0.5;
                
                onUpdateSettings({ ...settings, customAlarmUrl: url });
            };
            reader.readAsDataURL(file);
        }
    };

    const playPreview = (url: string) => {
        if (previewAudio) {
            previewAudio.pause();
        }
        const audio = new Audio(url);
        audio.play().catch(console.error);
        setPreviewAudio(audio);
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("La imagen es muy pesada. Intenta con una más pequeña.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                onUpdateSettings({ ...settings, userAvatar: ev.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-24 max-w-4xl mx-auto">
            
            {/* ALARMS CONFIGURATION */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Music className="w-6 h-6 text-amber-500" /> Sonido de Alarmas
                </h2>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Sonidos del Sistema</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {PRESET_ALARMS.map(alarm => (
                                <button
                                    key={alarm.id}
                                    onClick={() => onUpdateSettings({ ...settings, customAlarmUrl: alarm.url })}
                                    className={`p-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-2 ${
                                        settings.customAlarmUrl === alarm.url 
                                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg' 
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 border-transparent hover:bg-slate-200'
                                    }`}
                                >
                                    <span className="truncate w-full text-center">{alarm.name}</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); playPreview(alarm.url); }}
                                        className="p-1 bg-white/20 rounded-full hover:bg-white/40"
                                    >
                                        <Play className="w-3 h-3" />
                                    </button>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Subir tu propia música</h4>
                        
                        {uploadError && (
                            <div className="mb-3 p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 rounded-lg text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                {uploadError}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button
                                onClick={() => alarmInputRef.current?.click()}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                            >
                                <Upload className="w-4 h-4" /> Seleccionar MP3 (Max 1.5MB)
                            </button>
                            <input 
                                type="file" 
                                ref={alarmInputRef} 
                                className="hidden" 
                                accept="audio/*"
                                onChange={handleAlarmUpload}
                            />
                            {settings.customAlarmUrl && !PRESET_ALARMS.some(a => a.url === settings.customAlarmUrl) && (
                                <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded-lg text-amber-700 dark:text-amber-400 font-bold text-xs">
                                    <span className="truncate max-w-[150px]">Audio Personalizado</span>
                                    <button onClick={() => playPreview(settings.customAlarmUrl!)} className="p-1 hover:bg-amber-500/20 rounded-full"><Play className="w-3 h-3"/></button>
                                    <button 
                                        onClick={() => onUpdateSettings({ ...settings, customAlarmUrl: DEFAULT_ALARM_URL })}
                                        className="p-1 hover:bg-rose-500/20 rounded-full text-rose-500"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                            Nota: Debido a limitaciones del navegador, solo se permiten archivos de audio cortos o ligeros.
                        </p>
                    </div>
                </div>
            </div>

            {/* SMART NOTIFICATIONS PANEL */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <BellRing className="w-6 h-6 text-teal-500" /> Notificaciones Inteligentes
                </h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Avisarme antes de empezar:</label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[2, 5, 10, 15].map(min => (
                                <button
                                    key={min}
                                    onClick={() => onUpdateSettings({ ...settings, notificationLeadTime: min })}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                        settings.notificationLeadTime === min 
                                        ? 'bg-teal-500 text-white shadow-lg' 
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                    }`}
                                >
                                    {min} min
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Detección de Retrasos</h4>
                            <p className="text-xs text-slate-500">Ofrecer re-ajustar horario si vas tarde.</p>
                        </div>
                        <button 
                            onClick={() => onUpdateSettings({ ...settings, enableSmartNudges: !settings.enableSmartNudges })}
                            className={`text-3xl ${settings.enableSmartNudges ? 'text-teal-500' : 'text-slate-400'}`}
                        >
                            {settings.enableSmartNudges ? <ToggleRight /> : <ToggleLeft />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Palette className="w-6 h-6 text-indigo-500" /> Aspecto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Color de Acento</h4>
                        <div className="flex gap-3">
                            {['teal', 'indigo', 'rose', 'amber'].map(id => (
                                <button 
                                    key={id}
                                    onClick={() => onUpdateSettings({ ...settings, accentColor: id as any })}
                                    className={`w-10 h-10 rounded-full border-2 ${settings.accentColor === id ? 'border-white ring-2 ring-teal-500' : 'border-transparent opacity-50'} bg-${id}-500`}
                                    style={{ backgroundColor: id === 'teal' ? '#14b8a6' : id === 'indigo' ? '#6366f1' : id === 'rose' ? '#f43f5e' : '#f59e0b' }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><UserCircle2 className="w-6 h-6 text-rose-500" /> Perfil</h2>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-dashed border-slate-400 dark:border-slate-600 flex items-center justify-center cursor-pointer overflow-hidden hover:border-teal-500 transition-colors">
                            {settings.userAvatar ? <img src={settings.userAvatar} className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-slate-400" />}
                        </div>
                        <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"><EditIcon className="w-3 h-3 text-slate-600 dark:text-slate-300" /></button>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">Imagen de Usuario</p>
                        <p className="text-xs text-slate-500">Afecta visualmente al panel de control.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

export default Settings;

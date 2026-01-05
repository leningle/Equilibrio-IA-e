
import React from 'react';
import { Target, Dumbbell, Wind, Mic, Settings, LogOut, ChevronRight, Zap, Trophy, Heart } from 'lucide-react';

interface ExploreMenuProps {
    onNavigate: (tab: any) => void;
    userAvatar?: string;
    userName: string;
}

const ExploreMenu: React.FC<ExploreMenuProps> = ({ onNavigate, userAvatar, userName }) => {
    
    const MenuCard = ({ icon: Icon, title, desc, colorClass, target }: any) => (
        <button 
            onClick={() => onNavigate(target)}
            className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 transition-all w-full text-left group"
        >
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-teal-500 transition-colors">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
        </button>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-teal-500">
                     {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xl">{userName.charAt(0)}</div>}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Menú</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Herramientas y Ajustes</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Crecimiento Personal</h3>
                <MenuCard 
                    icon={Target} 
                    title="Mis Metas" 
                    desc="Mapa de conquistas y objetivos." 
                    colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" 
                    target="goals"
                />
                 <MenuCard 
                    icon={Dumbbell} 
                    title="Entrenador IA" 
                    desc="Rutinas de ejercicio personalizadas." 
                    colorClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" 
                    target="workout"
                />
                 <MenuCard 
                    icon={Wind} 
                    title="Meditación" 
                    desc="Centro de calma y respiración." 
                    colorClass="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" 
                    target="meditation"
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Herramientas</h3>
                 <MenuCard 
                    icon={Mic} 
                    title="Modo Voz en Vivo" 
                    desc="Habla con tu asistente en tiempo real." 
                    colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
                    target="live"
                />
                 <MenuCard 
                    icon={Settings} 
                    title="Configuración" 
                    desc="Perfil, alarmas y apariencia." 
                    colorClass="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" 
                    target="settings"
                />
            </div>

            <button 
                onClick={() => { if(confirm('¿Cerrar sesión?')) { localStorage.removeItem('equilibrio_user'); window.location.reload(); }}} 
                className="w-full py-4 text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/10 rounded-xl mt-4 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center gap-2"
            >
                <LogOut className="w-5 h-5" /> Cerrar Sesión
            </button>
        </div>
    );
};

export default ExploreMenu;


import React, { useState, useEffect, useRef } from 'react';
import { Routine, RoutineType, Goal, AppSettings, TimeBlock, DailyEvaluation } from './types';
import { ROUTINES, DEFAULT_ALARM_URL } from './constants';
import RoutineManager from './components/RoutineManager';
import FocusTimer from './components/FocusTimer';
import ChatInterface from './components/ChatInterface';
import LiveAssistant from './components/LiveAssistant';
import Dashboard from './components/Dashboard';
import GoalPlanner from './components/GoalPlanner';
import AgileCoach from './components/AgileCoach';
import Settings from './components/Settings';
import WorkoutTrainer from './components/WorkoutTrainer';
import MeditationCenter from './components/MeditationCenter';
import EvaluationSystem from './components/EvaluationSystem'; 
import SplashScreen from './components/SplashScreen'; 
import SimpleOnboarding from './components/SimpleOnboarding';
import ExploreMenu from './components/ExploreMenu';
import { LayoutDashboard, Calendar, Zap, MessageSquare, Mic, Menu, X, AlertTriangle, Target, RefreshCw, Lock, Volume2, VolumeX, Moon, Sun, Settings as SettingsIcon, LogOut, Dumbbell, Wind, Download, Sparkles, Share2, Import, Clock, FastForward, SkipForward, TrendingUp, Layers, ChevronRight, Share, PlusSquare, Bell, Grid } from 'lucide-react';

const APP_BG = "https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?q=80&w=2072&auto=format&fit=crop";

const App: React.FC = () => {
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; userName: string }>({
      isAuthenticated: false,
      userName: ''
  });
  
  const [currentView, setCurrentView] = useState<'splash' | 'onboarding' | 'app'>('splash');

  useEffect(() => {
      const saved = localStorage.getItem('equilibrio_user');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              setAuth({ isAuthenticated: true, userName: parsed.name });
              const hasOnboarded = localStorage.getItem('equilibrio_has_onboarded');
              if (hasOnboarded) setCurrentView('app');
              else setCurrentView('onboarding');
          } catch(e) { setCurrentView('splash'); }
      } else setCurrentView('splash');
  }, []);

  // 'explore' is the mobile menu page
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routine' | 'chat' | 'evaluation' | 'explore' | 'goals' | 'workout' | 'meditation' | 'settings' | 'live'>('dashboard');
  const [currentRoutineId, setCurrentRoutineId] = useState<string>(RoutineType.MORNING_PRODUCTIVE);
  
  const [customRoutines, setCustomRoutines] = useState<Record<string, Routine>>(() => {
    let initial = { ...ROUTINES };
    const saved = localStorage.getItem('equilibrio_routines');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            initial = { ...initial, ...parsed };
        } catch (e) {}
    }
    return initial;
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('equilibrio_settings');
    if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      vitaminDTime: '10:00',
      vitaminDEnabled: true,
      theme: 'dark',
      accentColor: 'teal',
      appVolume: 0.5,
      lastInteractionTimestamp: Date.now(),
      notificationLeadTime: 5,
      enableSmartNudges: true,
      customAlarmUrl: DEFAULT_ALARM_URL
    };
  });

  const [dailyEvaluations, setDailyEvaluations] = useState<DailyEvaluation[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'info' | 'warning' | 'success', action?: { label: string, onClick: () => void }} | null>(null);
  const [notifiedBlocks, setNotifiedBlocks] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [currentSacredActivity, setCurrentSacredActivity] = useState('');
  
  const accentColor = appSettings.accentColor || 'teal';
  const getAccentClass = (type: 'text' | 'bg' | 'border' | 'ring' | 'from' | 'to') => {
      const colors: any = {
          teal: { text: 'text-teal-400', bg: 'bg-teal-500', border: 'border-teal-500', ring: 'ring-teal-500', from: 'from-teal-500', to: 'to-teal-600' },
          indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500', border: 'border-indigo-500', ring: 'ring-indigo-500', from: 'from-indigo-500', to: 'to-indigo-600' },
          rose: { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500', ring: 'ring-rose-500', from: 'from-rose-500', to: 'to-rose-600' },
          amber: { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500', ring: 'ring-amber-500', from: 'from-amber-500', to: 'to-amber-600' },
      };
      return colors[accentColor][type];
  };

  const shiftSchedule = (minutes: number) => {
      const routine = customRoutines[currentRoutineId];
      if (!routine) return;
      const newBlocks = routine.blocks.map(block => {
          const [h, m] = block.time.split(':').map(Number);
          const date = new Date();
          date.setHours(h);
          date.setMinutes(m + minutes);
          const newH = date.getHours().toString().padStart(2, '0');
          const newM = date.getMinutes().toString().padStart(2, '0');
          return { ...block, time: `${newH}:${newM}` };
      });
      updateRoutine({ ...routine, blocks: newBlocks });
      setToast({ message: `Agenda ajustada +${minutes} min.`, type: 'success' });
  };

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentMinutesTotal = now.getHours() * 60 + now.getMinutes();
      const dayKey = now.toLocaleDateString(); 

      // 1. Vitamin D Reminder
      if (appSettings.vitaminDEnabled && appSettings.vitaminDTime) {
          const [vh, vm] = appSettings.vitaminDTime.split(':').map(Number);
          const vitaminDMinutes = vh * 60 + vm;
          if (currentMinutesTotal === vitaminDMinutes) {
              const vitKey = `${dayKey}-VITAMIN-D`;
              if (!notifiedBlocks.has(vitKey)) {
                  const msg = "¡Es hora de tu Vitamina D! Mantén tu salud en equilibrio.";
                  if (Notification.permission === 'granted') new Notification('Equilibrio', { body: msg });
                  setToast({ message: msg, type: 'info' });
                  setNotifiedBlocks(prev => new Set(prev).add(vitKey));
                  if (!isMuted) alarmAudioRef.current?.play().catch(() => {});
              }
          }
      }

      const routine = customRoutines[currentRoutineId];
      if (!routine) return;
      
      routine.blocks.forEach((block, index) => {
         const [h, m] = block.time.split(':').map(Number);
         const blockStartMinutes = h * 60 + m;
         const diff = blockStartMinutes - currentMinutesTotal;

         // 1. SMART PRE-NOTIFICATION (Lead Time)
         if (diff === appSettings.notificationLeadTime && diff > 0) {
             const preKey = `${dayKey}-${block.id}-PRE`;
             if (!notifiedBlocks.has(preKey)) {
                 const msg = `Prepárate: "${block.activity}" comienza en ${appSettings.notificationLeadTime} min.`;
                 if (Notification.permission === 'granted') new Notification('Equilibrio', { body: msg });
                 setToast({ message: msg, type: 'info' });
                 setNotifiedBlocks(prev => new Set(prev).add(preKey));
             }
         }

         // 2. BLOCK START & LOCK
         if (currentMinutesTotal === blockStartMinutes) {
             const startKey = `${dayKey}-${block.id}-START`;
             if (!notifiedBlocks.has(startKey)) {
                 if (block.type === 'sacred' && block.enforceLock) {
                     setCurrentSacredActivity(block.activity);
                     setIsLocked(true);
                 }
                 if (block.alarmEnabled !== false && !isMuted) {
                    alarmAudioRef.current?.play().catch(() => {});
                 }
                 setToast({ message: `¡Es hora! Comenzando: ${block.activity}`, type: 'success' });
                 setNotifiedBlocks(prev => new Set(prev).add(startKey));
             }
         }

         // 3. LATE DETECTION (Smart Nudge)
         if (appSettings.enableSmartNudges && currentMinutesTotal === blockStartMinutes + 2) {
             const nudgeKey = `${dayKey}-${block.id}-LATE-NUDGE`;
             if (!notifiedBlocks.has(nudgeKey)) {
                 setToast({ 
                     message: `¿Te has retrasado con "${block.activity}"?`, 
                     type: 'warning',
                     action: { label: "Retrasar 15m", onClick: () => shiftSchedule(15) }
                 });
                 setNotifiedBlocks(prev => new Set(prev).add(nudgeKey));
             }
         }
      });
    };

    const intervalId = setInterval(checkTime, 10000);
    checkTime();
    return () => clearInterval(intervalId);
  }, [currentRoutineId, customRoutines, notifiedBlocks, isLocked, isMuted, appSettings]);

  // Persist settings with error handling for large files (QuotaExceededError)
  useEffect(() => {
      try {
        localStorage.setItem('equilibrio_settings', JSON.stringify(appSettings));
      } catch (e: any) {
        console.error("Storage Limit Reached", e);
        if (e.name === 'QuotaExceededError') {
            setToast({ message: "No se pudo guardar la configuración. Archivo de audio/imagen muy pesado.", type: 'warning' });
        }
      }
  }, [appSettings]);

  // Persist routines
  useEffect(() => {
    localStorage.setItem('equilibrio_routines', JSON.stringify(customRoutines));
  }, [customRoutines]);

  const handleSplashAuth = (name: string, isNewUser: boolean) => {
      setAuth({ isAuthenticated: false, userName: name }); 
      if (isNewUser) setCurrentView('onboarding');
      else {
          setAuth({ isAuthenticated: true, userName: name });
          setCurrentView('app');
      }
  };

  const handleOnboardingComplete = (data: any) => {
      const userSettings = { name: data.name, password: 'demo' };
      localStorage.setItem('equilibrio_user', JSON.stringify(userSettings)); 
      localStorage.setItem('equilibrio_has_onboarded', 'true');
      setAppSettings(prev => ({ ...prev, userAvatar: data.avatar }));
      setCurrentRoutineId(data.routinePreference);
      setAuth({ isAuthenticated: true, userName: data.name });
      setCurrentView('app');
  };

  const updateRoutine = (updatedRoutine: Routine) => {
      setCustomRoutines({ ...customRoutines, [updatedRoutine.id]: updatedRoutine });
  };

  // NavButton for Desktop Sidebar
  const NavButton = ({ tab, icon: Icon, label, description }: { tab: any, icon: any, label: string, description?: string }) => {
    const isActive = activeTab === tab;
    return (
        <button
        onClick={() => { setActiveTab(tab); }}
        className={`group w-full text-left relative overflow-hidden transition-all duration-300 rounded-xl mb-2
            ${isActive ? `${getAccentClass('bg')} text-white shadow-lg transform scale-[1.02]` : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white'}
        `}
        >
            <div className="relative z-10 flex items-center gap-3 px-4 py-3">
                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-slate-800'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                </div>
                <div>
                    <span className={`block text-sm font-bold ${isActive ? 'text-white' : ''}`}>{label}</span>
                    {description && isActive && <span className="block text-[10px] opacity-80 font-medium leading-tight">{description}</span>}
                </div>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
            </div>
            {isActive && <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/20 to-transparent pointer-events-none"></div>}
        </button>
    );
  };

  // Mobile Bottom Tab Item
  const MobileTab = ({ tab, icon: Icon, label }: { tab: any, icon: any, label: string }) => {
      const isActive = activeTab === tab;
      return (
          <button 
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-teal-400 -translate-y-1' : 'text-slate-500 hover:text-slate-300'}`}
          >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-teal-500/10 ring-1 ring-teal-500/50' : ''}`}>
                 <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold tracking-wide">{label}</span>
          </button>
      );
  };

  if (currentView === 'splash') return <SplashScreen onAuthenticated={handleSplashAuth} />;
  if (currentView === 'onboarding') return <SimpleOnboarding initialName={auth.userName} onComplete={handleOnboardingComplete} />;

  return (
    <div className="h-[100dvh] text-slate-100 flex flex-col md:flex-row relative overflow-hidden bg-cover bg-fixed bg-center" style={{ backgroundImage: `url(${APP_BG})` }}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-0"></div>

      {isLocked && (
          <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center text-white text-center p-8 animate-in zoom-in-95">
              <Lock className="w-20 h-20 mb-4 text-rose-500 animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">Bloque Sagrado</h1>
              <p className="text-2xl text-teal-400 mb-8 font-light">{currentSacredActivity}</p>
              <div className="flex flex-col gap-3 w-full max-w-sm">
                  <button onClick={() => { shiftSchedule(15); setIsLocked(false); }} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                      <Clock className="w-5 h-5" /> Llego tarde (+15 min)
                  </button>
                  <button onClick={() => setIsLocked(false)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-medium text-slate-300 flex items-center justify-center gap-2 transition-all active:scale-95">
                      <SkipForward className="w-5 h-5" /> Saltar Bloque
                  </button>
              </div>
          </div>
      )}

      {/* DESKTOP SIDEBAR (Hidden on mobile) */}
      <aside className="hidden md:flex w-72 p-4 flex-col glass-panel border-r border-white/10 shadow-2xl relative z-20 h-full">
        <div className="mb-6 pb-6 border-b border-white/10 flex flex-col items-center text-center">
             <div className="relative mb-3 group cursor-pointer" onClick={() => setActiveTab('settings')}>
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAccentClass('from')} ${getAccentClass('to')} p-1 shadow-lg`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                        {appSettings.userAvatar ? <img src={appSettings.userAvatar} className="w-full h-full object-cover" alt="User Avatar" /> : <span className="flex items-center justify-center h-full text-2xl font-bold">{auth.userName.charAt(0)}</span>}
                    </div>
                </div>
                <div className="absolute bottom-0 right-0 bg-slate-800 rounded-full p-1 border border-white/20"><SettingsIcon className="w-3 h-3 text-white" /></div>
             </div>
             <h2 className="text-lg font-bold text-white truncate w-full">{auth.userName}</h2>
             <p className="text-xs text-slate-400">Modo: {currentRoutineId}</p>
        </div>
        <nav className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Principal</p>
            <NavButton tab="dashboard" icon={LayoutDashboard} label="Panel Central" description="Métricas y foco hoy" />
            <NavButton tab="routine" icon={Calendar} label="Mi Agenda" />
            <NavButton tab="evaluation" icon={TrendingUp} label="Evaluar Mi Día" />
          </div>
          <div className="pt-4">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Explorar</p>
             <NavButton tab="goals" icon={Target} label="Mis Metas" />
             <NavButton tab="workout" icon={Dumbbell} label="Entrenador IA" />
             <NavButton tab="meditation" icon={Wind} label="Meditación" />
             <NavButton tab="chat" icon={MessageSquare} label="Asistente Chat" />
             <NavButton tab="live" icon={Mic} label="Voz en Vivo" />
          </div>
        </nav>
        <div className="pt-4 border-t border-white/10 mt-auto">
             <button onClick={() => setActiveTab('settings')} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors mb-1"><SettingsIcon className="w-5 h-5" /><span className="text-sm font-bold">Configuración</span></button>
             <button 
                onClick={() => { if(confirm('¿Cerrar sesión?')) { localStorage.removeItem('equilibrio_user'); window.location.reload(); }}} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-rose-400 hover:text-rose-300 hover:bg-rose-900/20 transition-colors"
             >
                 <LogOut className="w-5 h-5" /><span className="text-sm font-bold">Cerrar Sesión</span>
             </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION (Visible only on mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-slate-900/90 backdrop-blur-xl border-t border-white/10 z-50 pb-4 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
          <div className="grid grid-cols-5 h-full px-2">
              <MobileTab tab="dashboard" icon={LayoutDashboard} label="Inicio" />
              <MobileTab tab="routine" icon={Calendar} label="Agenda" />
              <MobileTab tab="chat" icon={MessageSquare} label="Asistente" />
              <MobileTab tab="evaluation" icon={TrendingUp} label="Progreso" />
              <MobileTab tab="explore" icon={Grid} label="Más" />
          </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100dvh-80px)] md:h-screen relative z-10 pb-24 md:pb-8">
        
        {/* Mobile Header (Simplified) */}
        <div className="md:hidden flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden">
                     {appSettings.userAvatar ? <img src={appSettings.userAvatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold">{auth.userName.charAt(0)}</div>}
                 </div>
                 <div>
                     <h1 className="font-bold text-lg leading-tight">Hola, {auth.userName.split(' ')[0]}</h1>
                     <p className="text-xs text-slate-400">{new Date().toLocaleDateString(undefined, {weekday: 'long', day: 'numeric'})}</p>
                 </div>
             </div>
             <button onClick={() => setIsMuted(!isMuted)} className={`p-2 rounded-full ${isMuted ? 'text-slate-500 bg-slate-800' : 'text-teal-400 bg-teal-900/20'}`}>
                 {isMuted ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
             </button>
        </div>

        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
              <Dashboard 
                stats={[]} 
                currentRoutine={customRoutines[currentRoutineId]} 
                userAvatar={appSettings.userAvatar}
                mentorAvatar={appSettings.mentorAvatar}
                evaluations={dailyEvaluations}
                goals={[]}
                onOpenChat={() => setActiveTab('chat')}
                onShiftSchedule={() => shiftSchedule(15)}
              />
          )}
          {activeTab === 'routine' && <RoutineManager routines={customRoutines} currentRoutineId={currentRoutineId} onRoutineChange={setCurrentRoutineId} onUpdateRoutine={updateRoutine} onDeleteRoutine={() => {}} />}
          
          {/* Menu / Explore Page */}
          {activeTab === 'explore' && (
              <ExploreMenu 
                onNavigate={setActiveTab} 
                userAvatar={appSettings.userAvatar} 
                userName={auth.userName} 
              />
          )}

          {activeTab === 'settings' && <Settings settings={appSettings} onUpdateSettings={setAppSettings} />}
          {activeTab === 'evaluation' && <EvaluationSystem evaluations={dailyEvaluations} onSaveEvaluation={(ev) => setDailyEvaluations(prev => [ev, ...prev])} />}
          {activeTab === 'workout' && <WorkoutTrainer />}
          {activeTab === 'meditation' && <MeditationCenter />}
          {activeTab === 'goals' && <GoalPlanner goals={[]} onAddGoal={() => {}} onToggleGoal={() => {}} onDeleteGoal={() => {}} />}
          {activeTab === 'chat' && <ChatInterface onInteraction={() => setAppSettings({...appSettings, lastInteractionTimestamp: Date.now()})} />}
          {activeTab === 'live' && <LiveAssistant onInteraction={() => setAppSettings({...appSettings, lastInteractionTimestamp: Date.now()})} />}
        </div>

        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 w-[90%] md:w-auto">
            <div className={`p-4 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
              toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/50 text-amber-100' : toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100' : 'bg-slate-900/90 border-slate-700 text-slate-100'
            }`}>
              <div className="flex-1">
                <p className="text-sm font-bold">{toast.message}</p>
                {toast.action && (
                    <button 
                        onClick={() => { toast.action?.onClick(); setToast(null); }}
                        className="mt-2 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg font-bold w-full"
                    >
                        {toast.action.label}
                    </button>
                )}
              </div>
              <button onClick={() => setToast(null)} className="text-white/50 hover:text-white p-2"><X className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {/* HIDDEN ALARM AUDIO */}
        <audio 
            ref={alarmAudioRef} 
            src={appSettings.customAlarmUrl || DEFAULT_ALARM_URL} 
            preload="auto" 
        />
      </main>
    </div>
  );
};

export default App;

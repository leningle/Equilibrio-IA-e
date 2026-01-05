
import React, { useState, useEffect } from 'react';
import { Lock, User, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';

interface SplashScreenProps {
  onAuthenticated: (name: string, isNewUser: boolean) => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [storedPassword, setStoredPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing user on mount with error handling
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('equilibrio_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.name && parsed.password) {
            setName(parsed.name);
            setStoredPassword(parsed.password);
            setMode('login');
        }
      }
    } catch (e) {
      console.error("Error parsing user data", e);
      // If data is corrupt, clear it to prevent lockout
      localStorage.removeItem('equilibrio_user');
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }
    
    setIsLoading(true);
    // Simulate processing
    setTimeout(() => {
      // We don't save to localStorage fully yet, we wait for the next step (SimpleOnboarding)
      // But we pass the name and 'true' for isNewUser
      onAuthenticated(name, true);
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== storedPassword) {
      setError('Contraseña incorrecta.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onAuthenticated(name, false); // false = returning user, skip onboarding
    }, 1000);
  };

  // Background Image: Intense Universe/Earth
  const BG_IMAGE = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";

  return (
    <div 
      className="min-h-[100dvh] w-full flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-y-auto py-10"
      style={{ backgroundImage: `url(${BG_IMAGE})` }}
    >
      {/* Reduced overlay opacity to let the universe shine through */}
      <div className="fixed inset-0 bg-slate-950/60 z-0"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center">
        
        <div className="mb-8 md:mb-12 flex flex-col items-center text-center">
            {/* Logo glowing effect */}
            <div className="relative mb-6 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <div className="relative w-20 h-20 md:w-24 md:h-24 bg-slate-950 rounded-full flex items-center justify-center ring-2 ring-white/20">
                    <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-teal-400" />
                </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-200 to-indigo-200 drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
              Equilibrio
            </h1>
            <p className="text-teal-200 font-medium text-lg md:text-xl tracking-wide drop-shadow-md">
              Tu espacio de paz y conexión
            </p>
        </div>

        {/* Minimalist Inputs - Floating Glass */}
        <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="w-full space-y-6">
            {mode === 'login' ? (
              <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <p className="text-teal-100/80 mb-2 font-medium tracking-wider text-sm uppercase">Bienvenido de nuevo</p>
                 <h2 className="text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-2 drop-shadow-lg truncate">
                    {name}
                 </h2>
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-300 transition-colors group-focus-within:text-white" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu Nombre"
                      className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white text-base placeholder-white/40 focus:outline-none focus:bg-white/20 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all backdrop-blur-sm shadow-xl"
                    />
                </div>
              </div>
            )}

            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-300 transition-colors group-focus-within:text-white" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                      }}
                      placeholder="Contraseña"
                      className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-12 text-white text-base placeholder-white/40 focus:outline-none focus:bg-white/20 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all backdrop-blur-sm shadow-xl"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {error && (
              <p className="text-rose-300 text-sm font-bold text-center bg-rose-900/40 py-2 rounded-lg border border-rose-500/30 backdrop-blur-md animate-pulse">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(20,184,166,0.4)] flex items-center justify-center gap-3 transition-all transform hover:scale-[1.03] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 border border-white/10"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Conectando...
                </span>
              ) : (
                <>
                  {mode === 'register' ? 'Comenzar Viaje' : 'Entrar al Espacio'} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
        </form>

        {mode === 'login' && (
            <button 
            onClick={() => {
                localStorage.removeItem('equilibrio_user');
                setMode('register');
                setName('');
                setPassword('');
                setStoredPassword('');
            }}
            className="mt-8 text-sm text-white/60 hover:text-white underline transition-colors animate-in fade-in delay-500"
            >
                Cambiar de cuenta
            </button>
        )}
        
        <div className="mt-12 text-center opacity-40">
            <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-2"></div>
        </div>
      </div>
    </div>
  );
};

// Helper Icon
function Loader2(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
}

export default SplashScreen;

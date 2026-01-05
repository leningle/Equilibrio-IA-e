
import React, { useState, useRef } from 'react';
import { generateTextResponse, generateTTS } from '../services/geminiService';
import { ModelType } from '../types';
import { Sparkles, Wind, Moon, Sun, Heart, Play, BookOpen, Brain, Loader2, Feather, Coffee, Activity, Volume2, Square } from 'lucide-react';

const MEDITATION_TYPES = [
  {
    title: "Mindfulness (Atención Plena)",
    description: "La práctica de estar presente intencionalmente en el momento actual, sin juzgar. Ideal para reducir estrés y ansiedad.",
    icon: Brain,
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
  },
  {
    title: "Metta (Amor Bondadoso)",
    description: "Cultiva sentimientos de bondad y compasión hacia uno mismo y hacia los demás. Ayuda con la ira y mejora la empatía.",
    icon: Heart,
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
  },
  {
    title: "Vipassana",
    description: "Significa 'ver las cosas como realmente son'. Se centra en la auto-observación de las sensaciones corporales y la mente.",
    icon: EyeIcon,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
  },
  {
    title: "Yoga Nidra",
    description: "El 'sueño yóguico'. Un estado de relajación profunda consciente, ideal para recuperar energía o mejorar el sueño.",
    icon: Moon,
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
  }
];

const BREATHING_EXERCISES = [
    { name: "Respiración 4-7-8", desc: "Inhala 4s, retén 7s, exhala 8s. Para ansiedad extrema.", time: "2 min" },
    { name: "Respiración de Caja", desc: "Inhala 4s, retén 4s, exhala 4s, espera 4s. Para enfoque.", time: "3 min" },
    { name: "Respiración Alterna", desc: "Tapa una fosa nasal, inhala, cambia y exhala. Para balance.", time: "5 min" }
];

// Audio decoding utilities following guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Helper component for Eye icon since it wasn't imported in main list
function EyeIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
}

const MeditationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'library'>('generate');
  const [occasion, setOccasion] = useState('');
  const [duration, setDuration] = useState('5');
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const generateMeditation = async () => {
    if (!occasion.trim()) return;
    setLoading(true);
    stopAudio();

    const prompt = `Actúa como un maestro de meditación experto. Escribe un guion de meditación guiada detallado y relajante.
    
    Contexto/Objetivo: ${occasion}
    Duración estimada: ${duration} minutos
    
    Estructura requerida:
    1. Inicio: Preparación de postura y respiración inicial.
    2. Cuerpo: Visualización o técnica específica para "${occasion}".
    3. Cierre: Vuelta a la conciencia y afirmación final.
    
    Usa un tono calmado, empático y suave. Formatea el texto con párrafos claros y pausas sugeridas [Pausa].`;

    try {
        const response = await generateTextResponse({ prompt, modelType: ModelType.PRO });
        setGeneratedScript(response);
    } catch (error) {
        console.error("Error generating meditation", error);
    } finally {
        setLoading(false);
    }
  };

  const playMeditationAudio = async () => {
    if (!generatedScript) return;
    if (isPlaying) {
      stopAudio();
      return;
    }

    setAudioLoading(true);
    try {
      const base64Audio = await generateTTS(generatedScript);
      if (!base64Audio) throw new Error("Could not generate audio");

      if (!audioContextRef.current) {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        ctx,
        24000,
        1
      );

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      
      sourceNodeRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (error) {
      console.error("Audio error", error);
      alert("No se pudo reproducir el audio.");
    } finally {
      setAudioLoading(false);
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
          <Wind className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Centro de Meditación y Calma
        </h2>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-100 dark:border-slate-700 pb-1">
            <button 
                onClick={() => setActiveTab('generate')}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === 'generate' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-b-2 border-teal-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Guía IA Personalizada
            </button>
            <button 
                onClick={() => setActiveTab('library')}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === 'library' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-b-2 border-teal-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Biblioteca de Técnicas
            </button>
        </div>

        {activeTab === 'generate' && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                            ¿Cómo te sientes o qué necesitas?
                        </label>
                        <input 
                            type="text" 
                            value={occasion}
                            onChange={(e) => setOccasion(e.target.value)}
                            placeholder="Ej: Ansiedad por trabajo, Necesito dormir, Energía mañanera..."
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                            Duración
                        </label>
                        <select 
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                        >
                            <option value="3">3 Minutos (Rápido)</option>
                            <option value="5">5 Minutos (Estándar)</option>
                            <option value="10">10 Minutos (Profundo)</option>
                            <option value="20">20 Minutos (Intenso)</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['Dormir Mejor', 'Reducir Ansiedad', 'Enfoque Profundo', 'Gratitud', 'Empezar el Día'].map(tag => (
                        <button 
                            key={tag}
                            onClick={() => setOccasion(tag)}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={generateMeditation}
                    disabled={loading || !occasion}
                    className="w-full bg-gradient-to-r from-teal-500 to-indigo-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Feather className="w-5 h-5" />}
                    Generar Guía de Meditación
                </button>

                {generatedScript && (
                    <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-teal-900/10 p-6 rounded-xl border border-teal-100 dark:border-slate-700 animate-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-teal-800 dark:text-teal-300">Tu Sesión Guiada</h3>
                            <div className="flex gap-2">
                              <button 
                                onClick={playMeditationAudio} 
                                disabled={audioLoading}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm transition-all shadow-sm ${isPlaying ? 'bg-rose-500 text-white' : 'bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-50'}`}
                              >
                                {audioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                                {isPlaying ? "Detener Guía" : "Escuchar Guía IA"}
                              </button>
                              <button onClick={() => { stopAudio(); setGeneratedScript(null); }} className="text-slate-400 hover:text-slate-600 p-1">
                                  Cerrar
                              </button>
                            </div>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-serif">
                            {generatedScript}
                        </div>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'library' && (
            <div className="space-y-8 animate-in slide-in-from-right-2">
                
                {/* Types Grid */}
                <section>
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5" /> Tipos de Meditación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MEDITATION_TYPES.map((type) => (
                            <div key={type.title} className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${type.color}`}>
                                        <type.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white mb-1">{type.title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{type.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Exercises List */}
                <section>
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <Wind className="w-5 h-5" /> Ejercicios de Respiración (Pranayama)
                    </h3>
                    <div className="space-y-3">
                        {BREATHING_EXERCISES.map((ex) => (
                            <div key={ex.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">{ex.name}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{ex.desc}</p>
                                </div>
                                <div className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded">
                                    {ex.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        )}
      </div>
    </div>
  );
};

export default MeditationCenter;

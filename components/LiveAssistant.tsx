
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Radio, Volume2 } from 'lucide-react';
import { ai } from '../services/geminiService';
import { LiveServerMessage, Modality, Blob } from '@google/genai';

interface LiveAssistantProps {
    onInteraction?: () => void;
}

// Audio encoding helper following @google/genai guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Audio decoding helper following @google/genai guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Create audio blob for real-time input per guidelines
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    // The supported audio MIME type is 'audio/pcm'.
    mimeType: 'audio/pcm;rate=16000',
  };
}

// Decode raw PCM data returned by the API as shown in guidelines
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

const LiveAssistant: React.FC<LiveAssistantProps> = ({ onInteraction }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Refs for audio context and processing to survive re-renders
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = () => {
    // Cleanup audio
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    
    // Disconnect processors
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }

    // Stop all playing sources
    for (const source of sourcesRef.current.values()) {
        try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();
    
    // Reset Contexts
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }

    setIsActive(false);
    setStatus('disconnected');
  };

  const startSession = async () => {
    setError(null);
    setStatus('connecting');
    if (onInteraction) onInteraction(); // Record interaction

    try {
        // Initialize Audio Contexts
        const InputContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        inputAudioContextRef.current = new InputContextClass({ sampleRate: 16000 });
        
        const OutputContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        outputAudioContextRef.current = new OutputContextClass({ sampleRate: 24000 });
        const outputNode = outputAudioContextRef.current.createGain();
        outputNode.connect(outputAudioContextRef.current.destination);

        // Get Microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Connect to Gemini Live following @google/genai guidelines
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    setStatus('connected');
                    setIsActive(true);

                    // Setup Input Stream Processing
                    if (!inputAudioContextRef.current) return;
                    const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        
                        // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`
                        // to prevent stale closures and handle connection sequence correctly.
                        sessionPromise.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    // Handle Audio Output
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    
                    if (base64Audio && outputAudioContextRef.current) {
                        const ctx = outputAudioContextRef.current;
                        // Use a running timestamp variable to track the end of audio playback queue for gapless playback
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                        
                        const audioBuffer = await decodeAudioData(
                            decode(base64Audio),
                            ctx,
                            24000,
                            1
                        );

                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        source.addEventListener('ended', () => {
                            sourcesRef.current.delete(source);
                        });

                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }

                    // Handle Interruption by stopping all active sources immediately
                    const interrupted = message.serverContent?.interrupted;
                    if (interrupted) {
                        for (const source of sourcesRef.current.values()) {
                          try { source.stop(); } catch(e) {}
                          sourcesRef.current.delete(source);
                        }
                        nextStartTimeRef.current = 0;
                    }
                },
                onerror: (e: any) => {
                    console.error("Gemini Live Error", e);
                    setError("Connection Error");
                    stopSession();
                },
                onclose: () => {
                    setStatus('disconnected');
                    setIsActive(false);
                }
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    // Available voice names: Puck, Charon, Kore, Fenrir, Zephyr
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                },
                systemInstruction: "You are a helpful, calm, and balanced wellness assistant called 'Equilibrio'. You help the user manage their routine and avoid burnout. Keep responses concise.",
            }
        });

        sessionRef.current = sessionPromise;

    } catch (e) {
        console.error(e);
        setError("Could not access microphone or connect.");
        setStatus('disconnected');
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => stopSession();
  }, []);

  return (
    <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Animation Pulse */}
        {isActive && (
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/20 rounded-full animate-ping duration-[3s]"></div>
            </div>
        )}

      <div className="z-10 relative flex flex-col items-center">
        <div className={`p-6 rounded-full mb-6 transition-all duration-500 ${isActive ? 'bg-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.5)]' : 'bg-slate-700'}`}>
            {isActive ? <Volume2 className="w-12 h-12 text-white animate-pulse" /> : <MicOff className="w-12 h-12 text-slate-400" />}
        </div>

        <h2 className="text-2xl font-bold mb-2">Modo Voz en Vivo</h2>
        <p className="text-slate-400 mb-8 text-center max-w-md">
            {status === 'connecting' ? 'Conectando...' : 
             isActive ? 'Escuchando... Habla libremente.' : 
             'Ten una conversación fluida con tu asistente para organizar tu día.'}
        </p>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {!isActive ? (
             <button 
                onClick={startSession}
                className="bg-white text-slate-900 hover:bg-slate-200 px-8 py-3 rounded-full font-bold text-lg transition-colors flex items-center gap-2"
            >
                <Mic className="w-5 h-5" /> Iniciar Conversación
            </button>
        ) : (
            <button 
                onClick={stopSession}
                className="bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 px-8 py-3 rounded-full font-bold text-lg transition-colors flex items-center gap-2"
            >
                <Radio className="w-5 h-5" /> Terminar Sesión
            </button>
        )}
      </div>
    </div>
  );
};

export default LiveAssistant;

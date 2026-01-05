
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Routine, TimeBlock, ModelType, Subtask } from '../types';
import { generateTextResponse } from '../services/geminiService';
import { 
  Clock, Briefcase, Coffee, Heart, Sun, Plus, Trash2, Save, Edit2, 
  Check, X, MapPin, Palette, Mic, Square, Play, Sparkles, ChevronDown, ChevronUp, Loader2, Bell, BellOff, Wand2, Lightbulb, Settings2, ListTodo, CheckSquare, Pencil, Lock, Unlock, FastForward, Rewind, CloudUpload, CloudCheck, AlertTriangle 
} from 'lucide-react';

interface RoutineManagerProps {
  routines: Record<string, Routine>;
  currentRoutineId: string;
  onRoutineChange: (routineId: string) => void;
  onUpdateRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
}

const RoutineManager: React.FC<RoutineManagerProps> = ({ routines, currentRoutineId, onRoutineChange, onUpdateRoutine, onDeleteRoutine }) => {
  const routine = routines[currentRoutineId];
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // State for deletion modal
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);

  // Local state for debounced saving
  const [localRoutine, setLocalRoutine] = useState<Routine | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<number | null>(null);

  // Sync local state when switching routines
  useEffect(() => {
    setLocalRoutine(routine);
    setSaveStatus('idle');
  }, [currentRoutineId]);

  // Handle auto-save with debounce
  const triggerAutoSave = (updatedRoutine: Routine) => {
    setLocalRoutine(updatedRoutine);
    setSaveStatus('saving');

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      onUpdateRoutine(updatedRoutine);
      setSaveStatus('saved');
      // Hide "Saved" status after a while
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  // State for new routine creation
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineDesc, setNewRoutineDesc] = useState('');
  
  // State for expanded block details (editing mode)
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  
  // State for toggling AI Tips visibility (view mode)
  const [activeTipId, setActiveTipId] = useState<string | null>(null);

  // Subtask Input State
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Audio Recording State
  const [recordingBlockId, setRecordingBlockId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // AI Loading State
  const [aiLoadingBlockId, setAiLoadingBlockId] = useState<string | null>(null);
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);

  // Time and Progress State
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Use localRoutine if available, otherwise fallback to prop
  const currentDisplayedRoutine = localRoutine || routine;

  useEffect(() => {
      setNewSubtaskInput('');
  }, [expandedBlockId]);

  const completionProgress = useMemo(() => {
    if (!currentDisplayedRoutine || !currentDisplayedRoutine.blocks || currentDisplayedRoutine.blocks.length === 0) return 0;
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    let completedCount = 0;
    
    currentDisplayedRoutine.blocks.forEach((block, index) => {
        const [h, m] = block.time.split(':').map(Number);
        const start = h * 60 + m;
        let end = start + 60; // Default duration assumption
        
        // Try to infer end time from next block
        if (index < currentDisplayedRoutine.blocks.length - 1) {
             const [nh, nm] = currentDisplayedRoutine.blocks[index + 1].time.split(':').map(Number);
             if ((nh * 60 + nm) > start) {
                 end = nh * 60 + nm;
             }
        }
        
        if (currentMinutes >= end) {
            completedCount++;
        }
    });

    return Math.round((completedCount / currentDisplayedRoutine.blocks.length) * 100);
  }, [currentDisplayedRoutine, currentTime]);


  const handleBlockChange = (index: number, field: keyof TimeBlock, value: any) => {
    if (!currentDisplayedRoutine) return;
    const newBlocks = [...currentDisplayedRoutine.blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    // Only sort if time changes
    if (field === 'time') {
        newBlocks.sort((a, b) => a.time.localeCompare(b.time));
    }
    triggerAutoSave({ ...currentDisplayedRoutine, blocks: newBlocks });
  };

  const addSubtask = (blockIndex: number) => {
    if (!newSubtaskInput.trim() || !currentDisplayedRoutine) return;
    
    const block = currentDisplayedRoutine.blocks[blockIndex];
    const newSubtask: Subtask = {
        id: Math.random().toString(36).substr(2, 9),
        text: newSubtaskInput.trim(),
        completed: false
    };
    
    const updatedSubtasks = [...(block.subtasks || []), newSubtask];
    handleBlockChange(blockIndex, 'subtasks', updatedSubtasks);
    setNewSubtaskInput('');
  };

  const deleteSubtask = (blockIndex: number, subtaskId: string) => {
    if (!currentDisplayedRoutine) return;
    const block = currentDisplayedRoutine.blocks[blockIndex];
    const updatedSubtasks = (block.subtasks || []).filter(st => st.id !== subtaskId);
    handleBlockChange(blockIndex, 'subtasks', updatedSubtasks);
  };

  const addBlock = () => {
    if (!currentDisplayedRoutine) return;
    const newBlock: TimeBlock = {
      id: Math.random().toString(36).substr(2, 9),
      time: '12:00',
      activity: 'Nueva Actividad',
      type: 'work',
      alarmEnabled: true,
      enforceLock: false,
      subtasks: []
    };
    const newBlocks = [...currentDisplayedRoutine.blocks, newBlock];
    newBlocks.sort((a, b) => a.time.localeCompare(b.time));
    triggerAutoSave({ ...currentDisplayedRoutine, blocks: newBlocks });
    setExpandedBlockId(newBlock.id);
  };

  const removeBlock = (index: number) => {
    if (!currentDisplayedRoutine) return;
    const newBlocks = currentDisplayedRoutine.blocks.filter((_, i) => i !== index);
    triggerAutoSave({ ...currentDisplayedRoutine, blocks: newBlocks });
  };

  const shiftWholeRoutine = (minutes: number) => {
      if (!currentDisplayedRoutine) return;
      const newBlocks = currentDisplayedRoutine.blocks.map(block => {
          const [h, m] = block.time.split(':').map(Number);
          const date = new Date();
          date.setHours(h);
          date.setMinutes(m + minutes);
          const newH = date.getHours().toString().padStart(2, '0');
          const newM = date.getMinutes().toString().padStart(2, '0');
          return { ...block, time: `${newH}:${newM}` };
      });
      newBlocks.sort((a, b) => a.time.localeCompare(b.time));
      triggerAutoSave({ ...currentDisplayedRoutine, blocks: newBlocks });
  };

  const handleCreateRoutine = () => {
    if (!newRoutineName.trim()) return;

    const id = Math.random().toString(36).substr(2, 9);
    const newRoutine: Routine = {
        id,
        name: newRoutineName,
        description: newRoutineDesc || 'Rutina personalizada',
        blocks: [
            { id: Math.random().toString(36).substr(2, 9), time: '07:00', activity: 'Inicio del día', type: 'personal', alarmEnabled: true },
            { id: Math.random().toString(36).substr(2, 9), time: '09:00', activity: 'Bloque de Trabajo', type: 'work', alarmEnabled: false },
            { id: Math.random().toString(36).substr(2, 9), time: '13:00', activity: 'Comida', type: 'sacred', alarmEnabled: true, enforceLock: false },
        ]
    };

    onUpdateRoutine(newRoutine);
    onRoutineChange(id);
    setIsCreating(false);
    setNewRoutineName('');
    setNewRoutineDesc('');
    setIsEditing(true); // Auto-enter edit mode
  };

  // Generate Full Routine with AI
  const handleGenerateRoutine = async () => {
      setIsGeneratingRoutine(true);
      try {
          const now = new Date();
          const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
          
          const prompt = `Create a JSON list of daily routine blocks starting from ${timeString} for the rest of the day. 
          Focus on productivity and balance. 
          Return ONLY a JSON array like: [{"time": "HH:MM", "activity": "Activity Name", "type": "work"|"break"|"sacred"|"personal"}]. 
          No markdown, no explanation.`;

          const response = await generateTextResponse({ prompt, modelType: ModelType.FLASH_LITE });
          
          // Parse JSON (basic cleanup for potential markdown)
          const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
          const blocksData = JSON.parse(cleanJson);

          const newBlocks: TimeBlock[] = blocksData.map((b: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              time: b.time,
              activity: b.activity,
              type: b.type,
              alarmEnabled: true,
              enforceLock: b.type === 'sacred'
          }));

          const id = Math.random().toString(36).substr(2, 9);
          const aiRoutine: Routine = {
              id,
              name: `Rutina IA (${timeString})`,
              description: 'Generada automáticamente para tu momento actual.',
              blocks: newBlocks
          };

          onUpdateRoutine(aiRoutine);
          onRoutineChange(id);
      } catch (e) {
          console.error("Error generating routine", e);
          alert("No pude generar la rutina. Intenta de nuevo.");
      } finally {
          setIsGeneratingRoutine(false);
      }
  };

  // Audio Logic
  const startRecording = async (blockId: string) => {
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
                const base64Audio = reader.result as string;
                // Find index
                const idx = currentDisplayedRoutine?.blocks.findIndex(b => b.id === blockId);
                if (idx !== undefined && idx !== -1) {
                    handleBlockChange(idx, 'audioUrl', base64Audio);
                }
            };
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setRecordingBlockId(blockId);
    } catch (err) {
        console.error("Error accessing microphone", err);
        alert("No se pudo acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingBlockId) {
        mediaRecorderRef.current.stop();
        setRecordingBlockId(null);
    }
  };

  // AI Suggestion Logic
  const getAiSuggestion = async (block: TimeBlock, index: number) => {
    setAiLoadingBlockId(block.id);
    try {
        const prompt = `Act as a productivity coach. Review this routine block: "${block.activity}" at ${block.time} (Type: ${block.type}, Location: ${block.location || 'Not specified'}). Suggest one specific tip to optimize this activity or improve well-being. Keep it short (max 20 words).`;
        const suggestion = await generateTextResponse({ prompt, modelType: ModelType.FLASH_LITE });
        handleBlockChange(index, 'aiSuggestion', suggestion);
        // Automatically open the tip after generating
        if (!isEditing) {
            setActiveTipId(block.id);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setAiLoadingBlockId(null);
    }
  };

  // Toggle Tip View
  const toggleTip = (id: string) => {
      setActiveTipId(activeTipId === id ? null : id);
  };

  // Helper to get consistent styling across view/edit modes
  const getBlockStyles = (type: string, customColor?: string) => {
    if (customColor) {
        return { 
            borderStyle: { borderLeft: `4px solid ${customColor}` },
            bgStyle: { backgroundColor: `${customColor}15` }, // Low opacity for background
            borderClass: '',
            bgClass: ''
        }; 
    }

    switch (type) {
      case 'work': return { borderClass: 'border-l-4 border-blue-500', bgClass: 'bg-blue-50 dark:bg-blue-900/20' };
      case 'sacred': return { borderClass: 'border-l-4 border-rose-500', bgClass: 'bg-rose-50 dark:bg-rose-900/20' };
      case 'break': return { borderClass: 'border-l-4 border-amber-500', bgClass: 'bg-amber-50 dark:bg-amber-900/20' };
      default: return { borderClass: 'border-l-4 border-emerald-500', bgClass: 'bg-emerald-50 dark:bg-emerald-900/20' };
    }
  };
  
  // Helper for icon based on type
  const getTypeIcon = (type: string) => {
      switch (type) {
        case 'work': return <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
        case 'sacred': return <Heart className="w-5 h-5 text-rose-500 dark:text-rose-400" />;
        case 'break': return <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
        case 'personal': return <Sun className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
        default: return <Sun className="w-5 h-5 text-slate-400 dark:text-slate-500" />;
      }
  };

  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Slate', value: '#64748b' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0 relative">
      
      {/* DELETION MODAL */}
      {routineToDelete && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">¿Eliminar esta Rutina?</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
                            Estás a punto de borrar permanentemente <strong>"{routines[routineToDelete]?.name}"</strong>. Esta acción no se puede deshacer.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full mt-4">
                         <button
                            onClick={() => setRoutineToDelete(null)}
                            className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                onDeleteRoutine(routineToDelete);
                                setRoutineToDelete(null);
                            }}
                            className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/20 transition-all active:scale-95"
                        >
                            Sí, Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Selector Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" /> 
            Mis Rutinas y Horarios
            </h2>
            <div className="flex items-center gap-4">
                {saveStatus !== 'idle' && (
                    <div className={`flex items-center gap-1.5 text-xs font-bold transition-all duration-500 ${saveStatus === 'saving' ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`}>
                        {saveStatus === 'saving' ? <CloudUpload className="w-4 h-4" /> : <CloudCheck className="w-4 h-4" />}
                        {saveStatus === 'saving' ? 'Guardando...' : 'Guardado'}
                    </div>
                )}
                <button 
                    onClick={handleGenerateRoutine}
                    disabled={isGeneratingRoutine}
                    className="text-xs flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                    {isGeneratingRoutine ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>}
                    Sugerir Rutina para Ahora
                </button>
            </div>
        </div>
        
        {isCreating ? (
             <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">Diseña tu Nueva Rutina</h3>
                    <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Nombre</label>
                        <input 
                            type="text" 
                            value={newRoutineName}
                            onChange={(e) => setNewRoutineName(e.target.value)}
                            placeholder="Ej: Turno Noche, Fin de Semana..."
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Descripción</label>
                        <input 
                            type="text" 
                            value={newRoutineDesc}
                            onChange={(e) => setNewRoutineDesc(e.target.value)}
                            placeholder="Breve descripción del objetivo de esta rutina..."
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                        />
                    </div>
                    <div className="pt-2">
                        <button 
                            onClick={handleCreateRoutine}
                            disabled={!newRoutineName.trim()}
                            className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-bold hover:bg-teal-700 disabled:opacity-50 flex justify-center items-center gap-2 transition-all shadow-md active:scale-[0.99]"
                        >
                            <Check className="w-4 h-4" /> Crear y Diseñar
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(routines).map((r: Routine) => (
                <button
                key={r.id}
                onClick={() => onRoutineChange(r.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-300 h-full relative group hover:shadow-md dark:hover:bg-slate-700 ${
                    currentRoutineId === r.id
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 ring-1 ring-teal-500 dark:border-teal-400'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-600'
                }`}
                >
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors pr-6">{r.name}</h3>
                    
                    {/* Delete Button - Only visible on hover or if current */}
                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            // Trigger custom modal instead of window.confirm
                            setRoutineToDelete(r.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-white dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-slate-400 hover:text-rose-500 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 transition-all absolute top-3 right-3"
                    >
                        <Trash2 className="w-4 h-4" />
                    </div>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed pr-2">{r.description}</p>
                </button>
            ))}
            
            <button
                onClick={() => setIsCreating(true)}
                className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/30 dark:hover:bg-teal-900/20 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 transition-all min-h-[100px] hover:shadow-inner"
            >
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full group-hover:bg-teal-100 dark:group-hover:bg-teal-900 transition-colors">
                    <Plus className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm">Crear Nueva</span>
            </button>
            </div>
        )}
      </div>

      {currentDisplayedRoutine && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-500">
            {/* Header with Circular Progress */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex-1 mr-4">
                    {isEditing ? (
                        <div>
                             <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Nombre de la Rutina</label>
                             <input 
                                value={currentDisplayedRoutine.name} 
                                onChange={(e) => triggerAutoSave({...currentDisplayedRoutine, name: e.target.value})}
                                className="w-full text-lg font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 focus:border-teal-500 outline-none transition-colors"
                             />
                        </div>
                    ) : (
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                             Agenda: {currentDisplayedRoutine.name}
                        </h3>
                    )}
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Adapta los horarios y detalles a tu día.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                     {/* SHIFT SCHEDULE TOOLS - "Life Happens" */}
                     {!isEditing && (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button 
                                onClick={() => shiftWholeRoutine(-15)}
                                className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded flex items-center gap-1 transition-all"
                                title="Adelantar agenda 15 min"
                            >
                                <Rewind className="w-3 h-3" /> -15m
                            </button>
                            <span className="text-xs text-slate-400 px-1">|</span>
                            <button 
                                onClick={() => shiftWholeRoutine(15)}
                                className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded flex items-center gap-1 transition-all"
                                title="Retrasar agenda 15 min (Llego tarde)"
                            >
                                +15m <FastForward className="w-3 h-3" />
                            </button>
                        </div>
                     )}

                     {/* Circular Progress Indicator - Unobtrusive */}
                     {!isEditing && (
                        <div className="hidden md:flex flex-col items-center justify-center" title={`${completionProgress}% completado hoy`}>
                            <div className="relative w-10 h-10">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-100 dark:text-slate-700"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                    />
                                    <path
                                        className="text-teal-500 transition-all duration-1000 ease-out"
                                        strokeDasharray={`${completionProgress}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-teal-700 dark:text-teal-400">
                                    {completionProgress}%
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap ${
                            isEditing 
                            ? 'bg-teal-600 text-white hover:bg-teal-700' 
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        {isEditing ? <><Check className="w-4 h-4" /> Finalizar Diseño</> : <><Pencil className="w-4 h-4" /> Diseñar Día</>}
                    </button>
                </div>
            </div>
            
            <div className="space-y-4">
            {currentDisplayedRoutine.blocks.map((block, index) => {
                const { borderStyle, bgStyle, borderClass, bgClass } = getBlockStyles(block.type, block.customColor);
                const isExpanded = expandedBlockId === block.id && isEditing;
                const isAlarmOn = block.alarmEnabled !== false; // Default true if undefined
                const isLocked = block.enforceLock === true;
                
                return (
                <div 
                    key={block.id} 
                    className={`rounded-lg transition-all duration-300 
                        ${borderClass || ''} 
                        ${isExpanded ? 'bg-white dark:bg-slate-800 shadow-lg ring-1 ring-slate-200 dark:ring-slate-600' : (bgClass || '')}
                    `}
                    style={{
                        ...borderStyle,
                        ...(isExpanded ? {} : bgStyle)
                    }}
                >
                    {/* Block Header / View Mode */}
                    <div className="flex flex-col">
                        <div 
                            className={`flex items-center p-3 rounded-lg transition-all`}
                        >
                            {isEditing ? (
                                <>
                                    {/* Edit Mode Time Input */}
                                    <div className="relative mr-4">
                                        <input 
                                            type="time" 
                                            value={block.time}
                                            onChange={(e) => handleBlockChange(index, 'time', e.target.value)}
                                            className="font-mono font-bold text-xl text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-700 border-2 border-teal-100 dark:border-teal-900 focus:border-teal-500 rounded-lg px-2 py-1 w-32 shadow-sm transition-colors text-center cursor-pointer"
                                        />
                                        <div className="text-[10px] text-center text-slate-400 mt-1 uppercase font-bold tracking-wider">Hora Inicio</div>
                                    </div>

                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            value={block.activity}
                                            onChange={(e) => handleBlockChange(index, 'activity', e.target.value)}
                                            placeholder="Nombre de la actividad..."
                                            className="font-bold text-lg text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-slate-600 focus:border-teal-500 rounded-none px-0 py-1 w-full outline-none transition-colors"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                                        className={`ml-2 px-3 py-1.5 rounded-md transition-colors text-xs font-bold flex items-center gap-1.5 ${
                                            isExpanded 
                                            ? 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200' 
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                    >
                                        {isExpanded ? <ChevronUp className="w-3 h-3"/> : <Settings2 className="w-3 h-3"/>}
                                        <span>{isExpanded ? 'Menos' : 'Ajustar'}</span>
                                    </button>
                                    <button 
                                        onClick={() => removeBlock(index)}
                                        className="ml-2 p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-16 text-lg">{block.time}</span>
                                    <div className="flex-1 ml-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Replaced inline checks with helper function */}
                                                <div title={block.type === 'work' ? 'Trabajo' : block.type === 'sacred' ? 'Sagrado' : block.type === 'break' ? 'Descanso' : 'Personal'}>
                                                    {getTypeIcon(block.type)}
                                                </div>
                                                
                                                <span className="font-bold text-slate-900 dark:text-white mr-2">{block.activity}</span>
                                                
                                                {/* Badges for extra content */}
                                                {isAlarmOn && (
                                                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                                                        <Bell className="w-3 h-3"/> Alarma
                                                    </span>
                                                )}
                                                {isLocked && (
                                                    <span className="text-[10px] bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-200 dark:border-rose-800" title="La pantalla se bloqueará durante este bloque">
                                                        <Lock className="w-3 h-3"/> Estricto
                                                    </span>
                                                )}
                                                {block.location && (
                                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-200 dark:border-slate-600">
                                                        <MapPin className="w-3 h-3"/> {block.location}
                                                    </span>
                                                )}
                                                {block.audioUrl && (
                                                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900 text-indigo-500 dark:text-indigo-300 px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                                                        <Mic className="w-3 h-3"/> Audio
                                                    </span>
                                                )}
                                                {block.subtasks && block.subtasks.length > 0 && (
                                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-200 dark:border-slate-600">
                                                        <ListTodo className="w-3 h-3"/> {block.subtasks.length} items
                                                    </span>
                                                )}

                                                {/* AI Suggestion Badge / Toggle */}
                                                {block.aiSuggestion && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleTip(block.id); }}
                                                        className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors border shadow-sm ${
                                                            activeTipId === block.id
                                                            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 font-semibold'
                                                            : 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                                        }`}
                                                    >
                                                        <Sparkles className="w-3 h-3" />
                                                        {activeTipId === block.id ? 'Ocultar Consejo' : 'Ver Consejo IA'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Quick Play Audio in View Mode */}
                                    {block.audioUrl && (
                                        <button onClick={() => new Audio(block.audioUrl).play()} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-full">
                                            <Play className="w-4 h-4" />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        
                        {/* Subtasks View Mode */}
                        {!isEditing && block.subtasks && block.subtasks.length > 0 && (
                            <div className="pl-14 pr-4 pb-3 animate-in slide-in-from-top-1">
                                <div className="flex flex-col gap-1.5 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                    {block.subtasks.map(st => (
                                        <div key={st.id} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                                            <div className="mt-0.5">
                                                <div className="w-3 h-3 border-2 border-slate-300 dark:border-slate-500 rounded-sm"></div>
                                            </div>
                                            <span className="leading-tight">{st.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* AI Tip Expandable Panel (View Mode) */}
                        {!isEditing && activeTipId === block.id && block.aiSuggestion && (
                             <div className="mx-4 mb-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg animate-in slide-in-from-top-2 duration-300 shadow-sm relative overflow-hidden">
                                 <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 dark:bg-white/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
                                 <div className="flex items-start gap-3 relative z-10">
                                     <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-white/50 dark:border-slate-700 shrink-0">
                                         <Lightbulb className="w-4 h-4 text-purple-500" />
                                     </div>
                                     <div className="flex-1">
                                         <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">
                                             Sugerencia de Optimización
                                         </h4>
                                         <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                             "{block.aiSuggestion}"
                                         </p>
                                     </div>
                                     <button 
                                        onClick={() => toggleTip(block.id)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                     >
                                         <X className="w-4 h-4"/>
                                     </button>
                                 </div>
                             </div>
                        )}
                    </div>

                    {/* EXPANDED DETAILS PANEL (Edit Mode) */}
                    {isExpanded && (
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-lg space-y-4 animate-in slide-in-from-top-2 duration-200">
                            
                            {/* Row 1: Type, Location, Alarm */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Tipo de Actividad</label>
                                    <select 
                                        value={block.type}
                                        onChange={(e) => handleBlockChange(index, 'type', e.target.value as any)}
                                        className="w-full text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="work">Trabajo (Foco)</option>
                                        <option value="sacred">Sagrado (Familia/Descanso)</option>
                                        <option value="break">Descanso (Pausa)</option>
                                        <option value="personal">Personal/Gestión</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block flex items-center gap-1">
                                        <MapPin className="w-3 h-3"/> Ubicación
                                    </label>
                                    <input 
                                        type="text" 
                                        value={block.location || ''}
                                        onChange={(e) => handleBlockChange(index, 'location', e.target.value)}
                                        placeholder="Ej: Oficina, Sala, Parque..."
                                        className="w-full text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block flex items-center gap-1">
                                        <Bell className="w-3 h-3"/> Alarma Sonara
                                    </label>
                                    <div 
                                        onClick={() => handleBlockChange(index, 'alarmEnabled', !isAlarmOn)}
                                        className="flex items-center gap-3 cursor-pointer p-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors group"
                                    >
                                        <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${isAlarmOn ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-500'}`}>
                                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${isAlarmOn ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </div>
                                        <span className={`text-sm font-medium ${isAlarmOn ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {isAlarmOn ? 'Sí' : 'No'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block flex items-center gap-1">
                                        <Lock className="w-3 h-3"/> Bloqueo Estricto
                                    </label>
                                    <div 
                                        onClick={() => handleBlockChange(index, 'enforceLock', !isLocked)}
                                        className="flex items-center gap-3 cursor-pointer p-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors group"
                                    >
                                        <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${isLocked ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-500'}`}>
                                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${isLocked ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </div>
                                        <span className={`text-sm font-medium ${isLocked ? 'text-rose-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {isLocked ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Color Picker */}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block flex items-center gap-1">
                                    <Palette className="w-3 h-3"/> Personalizar Color (Emoción)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map(c => (
                                        <button
                                            key={c.name}
                                            onClick={() => handleBlockChange(index, 'customColor', c.value)}
                                            className={`w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600 transition-transform hover:scale-110 ${block.customColor === c.value ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : ''}`}
                                            style={{ backgroundColor: c.value }}
                                            title={c.name}
                                        />
                                    ))}
                                    <button 
                                        onClick={() => handleBlockChange(index, 'customColor', undefined)}
                                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline ml-2"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Row 3: Audio & AI */}
                            <div className="flex flex-col md:flex-row gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                                {/* Audio Recorder */}
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block flex items-center gap-1">
                                        <Mic className="w-3 h-3"/> Nota de Voz (Motivación)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {recordingBlockId === block.id ? (
                                            <button 
                                                onClick={stopRecording}
                                                className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 animate-pulse"
                                            >
                                                <Square className="w-3 h-3 fill-current" /> Detener
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => startRecording(block.id)}
                                                className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1"
                                            >
                                                <Mic className="w-3 h-3" /> Grabar
                                            </button>
                                        )}
                                        
                                        {block.audioUrl && (
                                            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800">
                                                <button onClick={() => new Audio(block.audioUrl).play()} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">
                                                    <Play className="w-4 h-4" />
                                                </button>
                                                <span className="text-[10px] text-indigo-400 font-mono">Audio Guardado</span>
                                                <button onClick={() => handleBlockChange(index, 'audioUrl', undefined)} className="text-slate-400 hover:text-red-400 ml-1">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* AI Suggestions */}
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-purple-500"/> Sugerencia IA
                                    </label>
                                    <div className="flex items-start gap-2">
                                        <button 
                                            onClick={() => getAiSuggestion(block, index)}
                                            disabled={aiLoadingBlockId === block.id}
                                            className="bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                                        >
                                            {aiLoadingBlockId === block.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            Pedir Consejo
                                        </button>
                                        {block.aiSuggestion && (
                                            <p className="text-xs text-slate-400 dark:text-slate-500 italic pt-1.5">
                                               (Disponible)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Row 4: Subtasks */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block flex items-center gap-1">
                                     <ListTodo className="w-3 h-3"/> Subtareas / Checklist
                                </label>
                                
                                {/* List of subtasks */}
                                <div className="space-y-2 mb-3">
                                    {(block.subtasks || []).map(st => (
                                        <div key={st.id} className="flex items-center gap-2 bg-white dark:bg-slate-700 p-2 rounded border border-slate-200 dark:border-slate-600">
                                             <div className="p-1">
                                                <CheckSquare className="w-4 h-4 text-slate-300 dark:text-slate-500" />
                                             </div>
                                             <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">{st.text}</span>
                                             <button onClick={() => deleteSubtask(index, st.id)} className="text-slate-400 hover:text-rose-500 p-1">
                                                 <Trash2 className="w-4 h-4" />
                                             </button>
                                        </div>
                                    ))}
                                    {(!block.subtasks || block.subtasks.length === 0) && (
                                        <p className="text-xs text-slate-400 italic">No hay subtareas definidas.</p>
                                    )}
                                </div>

                                {/* Add Input */}
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newSubtaskInput}
                                        onChange={(e) => setNewSubtaskInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addSubtask(index)}
                                        placeholder="Añadir subtarea..."
                                        className="flex-1 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400"
                                    />
                                    <button 
                                        onClick={() => addSubtask(index)}
                                        className="bg-slate-200 dark:bg-slate-600 hover:bg-teal-500 hover:text-white text-slate-600 dark:text-slate-300 px-3 py-2 rounded transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
                );
            })}

            {isEditing && (
                <button 
                    onClick={addBlock}
                    className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/10 flex items-center justify-center gap-2 font-bold transition-all mt-4"
                >
                    <Plus className="w-5 h-5" /> Añadir Nuevo Bloque
                </button>
            )}
            </div>
        </div>
      )}
    </div>
  );
};

export default RoutineManager;

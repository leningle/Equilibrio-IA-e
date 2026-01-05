
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Zap, BrainCircuit, User } from 'lucide-react';
import { ModelType, ChatMessage } from '../types';
import { generateTextResponse } from '../services/geminiService';

interface ChatInterfaceProps {
    onInteraction?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onInteraction }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<ModelType>(ModelType.FLASH_LITE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Notify parent component that interaction occurred
    if (onInteraction) onInteraction();

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await generateTextResponse({
        prompt: input,
        modelType: model,
        history: history
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        isThinking: model === ModelType.THINKING,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Lo siento, tuve problemas para conectar con el servicio de IA. Por favor intenta de nuevo.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-teal-600" />
          <h2 className="font-bold text-slate-800">Asistente Gemini</h2>
        </div>
        
        {/* Model Selector */}
        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
          <button
            onClick={() => setModel(ModelType.FLASH_LITE)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
              model === ModelType.FLASH_LITE ? 'bg-teal-100 text-teal-800' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-3 h-3" /> Rápido
          </button>
          <button
            onClick={() => setModel(ModelType.PRO)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
              model === ModelType.PRO ? 'bg-indigo-100 text-indigo-800' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3 h-3" /> Inteligente
          </button>
          <button
            onClick={() => setModel(ModelType.THINKING)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
              model === ModelType.THINKING ? 'bg-purple-100 text-purple-800' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <BrainCircuit className="w-3 h-3" /> Pensamiento
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Bot className="w-12 h-12 mb-2 opacity-50" />
            <p>¿En qué puedo ayudarte hoy?</p>
            <p className="text-xs mt-2">Prueba el modo "Pensamiento" para planes complejos.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                 {msg.role === 'user' ? <User className="w-3 h-3 opacity-70"/> : <Bot className="w-3 h-3 opacity-70"/>}
                 <span className="text-xs opacity-70 font-semibold uppercase">{msg.role === 'user' ? 'Tú' : 'Gemini'}</span>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
                model === ModelType.THINKING 
                ? "Pregunta algo complejo..." 
                : "Escribe tu mensaje..."
            }
            className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

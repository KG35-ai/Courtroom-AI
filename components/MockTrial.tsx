import React, { useState, useRef, useEffect } from 'react';
import { createMockTrialSession, critiqueArgument } from '../services/geminiService';
import { Message, TrialPersona } from '../types';
import { Send, User, RotateCcw, Settings, Play, ShieldAlert, Sparkles, X } from 'lucide-react';
import { Chat } from '@google/genai';

const MockTrial: React.FC = () => {
  const [setupMode, setSetupMode] = useState(true);
  const [persona, setPersona] = useState<TrialPersona>(TrialPersona.OPPOSING_COUNSEL);
  const [context, setContext] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [critique, setCritique] = useState<string | null>(null);
  const [coachMode, setCoachMode] = useState(false);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startSession = () => {
    if (!context.trim()) return;
    chatSessionRef.current = createMockTrialSession(persona, context);
    setSetupMode(false);
    setMessages([{
      id: 'init',
      role: 'model',
      content: `[Simulation Persona Active: ${persona}]\nCounselor, I am ready. Proceed.`,
      timestamp: new Date()
    }]);
  };

  const resetSession = () => {
    chatSessionRef.current = null;
    setMessages([]);
    setSetupMode(true);
    setCritique(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, critique]);

  const sendMessage = async () => {
    if (!currentInput.trim() || !chatSessionRef.current) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    const inputSnapshot = currentInput;
    setCurrentInput('');
    setLoading(true);
    setCritique(null);

    // Run critique in parallel if coach mode is on
    if (coachMode) {
       critiqueArgument(context, inputSnapshot).then(res => setCritique(res));
    }

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.content });
      const responseText = result.text || "...";
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (setupMode) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 w-full max-w-2xl">
           <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
             <div className="bg-slate-900 text-white p-2.5 rounded-lg">
               <Settings size={24} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-slate-900">Simulation Configuration</h2>
               <p className="text-sm text-slate-500">Define parameters for the mock proceeding.</p>
             </div>
           </div>
           
           <div className="space-y-6">
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Target Persona</label>
               <div className="grid grid-cols-3 gap-3">
                 {Object.values(TrialPersona).map((p) => (
                   <button
                     key={p}
                     onClick={() => setPersona(p)}
                     className={`px-4 py-4 rounded-lg border text-sm font-semibold transition-all flex flex-col items-center gap-2 ${
                       persona === p 
                       ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                       : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                     }`}
                   >
                     {p === TrialPersona.JUDGE && <ShieldAlert size={20} />}
                     {p === TrialPersona.OPPOSING_COUNSEL && <User size={20} />}
                     {p === TrialPersona.WITNESS && <User size={20} />}
                     {p}
                   </button>
                 ))}
               </div>
             </div>

             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Case Context</label>
               <textarea 
                 value={context}
                 onChange={(e) => setContext(e.target.value)}
                 className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:outline-none resize-none text-sm"
                 placeholder="e.g. 'Civil suit for breach of contract. Defendant claims Force Majeure due to supply chain disruption. I am cross-examining the Defendant regarding their inventory logs.'"
               />
             </div>

             <div className="pt-4">
               <button 
                 onClick={startSession}
                 disabled={!context}
                 className="w-full py-3.5 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
               >
                 <Play size={18} fill="currentColor" /> Initialize Simulation
               </button>
             </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600">
             {persona === TrialPersona.JUDGE ? <ShieldAlert size={16} /> : <User size={16} />}
           </div>
           <div>
             <h3 className="font-bold text-slate-900 text-sm leading-none">{persona}</h3>
             <span className="text-xs text-emerald-600 font-medium">● Live Session</span>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setCoachMode(!coachMode)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
               coachMode 
                 ? 'bg-amber-50 border-amber-200 text-amber-700' 
                 : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
             }`}
           >
             <Sparkles size={12} /> AI Coach {coachMode ? 'On' : 'Off'}
           </button>
           <div className="h-6 w-px bg-slate-200"></div>
           <button 
             onClick={resetSession}
             className="text-slate-400 hover:text-red-600 transition-colors"
             title="End Session"
           >
             <X size={20} />
           </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
         {messages.map((msg) => (
           <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-sm' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
           </div>
         ))}
         
         {loading && (
           <div className="flex justify-start">
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              </div>
           </div>
         )}

         {/* Coach Critique Card */}
         {critique && !loading && (
           <div className="flex justify-center animate-fade-in my-4">
             <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-lg flex items-start gap-3 shadow-sm">
                <Sparkles size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800 uppercase mb-1">Coach Insight</p>
                  <p className="text-sm text-amber-900 leading-snug">{critique}</p>
                </div>
             </div>
           </div>
         )}
         
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto relative">
           <textarea
             value={currentInput}
             onChange={(e) => setCurrentInput(e.target.value)}
             onKeyDown={handleKeyPress}
             placeholder="Enter your argument or question..."
             className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-slate-400 focus:outline-none resize-none text-sm text-slate-900 shadow-inner"
             rows={1}
             style={{ minHeight: '52px', maxHeight: '150px' }}
           />
           <button 
             onClick={sendMessage}
             disabled={!currentInput.trim() || loading}
             className="absolute right-2 bottom-2 p-2 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             <Send size={16} />
           </button>
        </div>
        <div className="max-w-4xl mx-auto mt-2 text-center">
          <p className="text-[10px] text-slate-400">Shift+Enter for new line • Enter to send</p>
        </div>
      </div>
    </div>
  );
};

export default MockTrial;

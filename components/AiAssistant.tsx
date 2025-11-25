import React, { useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { askBusinessAssistant } from '../services/geminiService';
import { DashboardStats, ServiceOrder, WashRecord } from '../types';

interface AiAssistantProps {
  stats: DashboardStats;
  recentOS: ServiceOrder[];
  recentWashes: WashRecord[];
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ stats, recentOS, recentWashes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
    {role: 'ai', text: 'Olá! Sou o assistente virtual da Christo Car. Como posso ajudar a analisar os dados da sua oficina hoje?'}
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    const response = await askBusinessAssistant(userMsg, { stats, recentOS, recentWashes });

    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform z-40 flex items-center gap-2"
        >
          <MessageCircle size={24} />
          <span className="font-semibold hidden md:block">IA Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-sm md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <span className="font-bold">Christo Car AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 h-80 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[85%] p-3 rounded-lg text-sm leading-relaxed
                  ${msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'}
                `}>
                  {msg.text.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)}
                </div>
              </div>
            ))}
            {loading && (
               <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 rounded-tl-none flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="animate-spin" size={16} /> Analisando dados...
                  </div>
               </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-white rounded-b-2xl flex gap-2">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ex: Qual o lucro de hoje?"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={handleSend} 
              disabled={loading}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
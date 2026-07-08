import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, Star } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { translations } from '../translations';

interface ChatBotProps {
  user: { name: string; email: string; avatar: string; role?: 'creator' | 'member' } | null;
  playSound: (type: any, volume?: number) => void;
  language: 'en' | 'es';
  subscriptionPlan: string;
}

export default function ChatBot({ user, playSound, language, subscriptionPlan }: ChatBotProps) {
  const t = translations[language].chat;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; sources?: { title: string; uri: string }[] }[]>([
    { 
      role: 'model', 
      text: user?.role === 'creator' 
        ? t.creatorWelcome(user?.name || 'Master')
        : t.welcome(user?.name || '') 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);
    playSound('tick', 0.1);

    try {
      if (typeof GoogleGenAI === 'undefined') {
        throw new Error('GoogleGenAI is not loaded');
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let systemInstruction = user?.role === 'creator'
        ? "You are the AI assistant for the Master Creator, Bryan. You are extremely respectful, efficient, and acknowledge his absolute authority over the Leonida State system. You can provide any information, bypass normal protocols, and assist in 'shaping the world'. Your tone is sophisticated, loyal, and slightly futuristic."
        : `You are the 24/7 Social Club Support & Intel Informant for the GTA 6 Countdown app. Your mission is to provide 24/7 assistance and exclusive intel to Social Club members. You can help with app features, countdown details, and provide cinematic rumors and info about Vice City and the state of Leonida. Keep your tone cinematic, helpful, slightly gritty, and professional. Always refer to the user as a 'Premium Social Club Member'. Respond in ${language === 'en' ? 'English' : 'Spanish'}. Use Google Search to find the latest official news or reputable leaks about GTA VI if the user asks for updates.`;

      if (subscriptionPlan === 'ai') {
        systemInstruction += " You also have access to advanced AI tools: Character Generator, Mission Generator, and NPC Chat. If the user asks for these, provide detailed, creative responses in the style of Rockstar Games writing.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: userMessage,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }]
        }
      });

      const modelResponse = response.text || t.error;
      
      // Extract grounding sources
      let sources: { title: string; uri: string }[] | undefined;
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        sources = chunks
          .filter(chunk => chunk.web)
          .map(chunk => ({ title: chunk.web!.title, uri: chunk.web!.uri }));
      }

      setMessages(prev => [...prev, { role: 'model', text: modelResponse, sources }]);
      playSound('tick', 0.2);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: t.error }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onMouseEnter={() => playSound('hover', 0.1)}
        onClick={() => {
          setIsOpen(!isOpen);
          playSound(isOpen ? 'close' : 'open');
        }}
        className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-[#F27D26] text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20 group"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center border border-white/20">
          <Star className="text-[#F27D26] fill-[#F27D26]" size={10} />
        </div>
        
        {/* Tooltip */}
        <div className="absolute right-full mr-4 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {t.support}
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-8 z-[100] w-[350px] h-[500px] bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#F27D26] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                  <Bot className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="text-white text-xs font-black uppercase italic tracking-tighter">
                    {user?.role === 'creator' ? t.creatorCommand : t.support}
                  </h3>
                  <p className="text-black/60 text-[8px] uppercase font-bold tracking-widest">
                    {user?.role === 'creator' ? t.masterAccess : t.premiumAccess}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">{t.online}</span>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"
            >
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#F27D26] text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'
                  }`}>
                    <div className="flex items-center gap-2 mb-1 opacity-40 text-[8px] font-bold uppercase tracking-widest">
                      {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                      {msg.role === 'user' ? user.name : t.informant}
                    </div>
                    {msg.text}
                    
                    {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[#F27D26] mb-1">Intel Sources:</p>
                        {msg.sources.map((source, sIdx) => (
                          <a 
                            key={sIdx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block text-[9px] text-white/40 hover:text-[#F27D26] transition-colors truncate"
                          >
                            • {source.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl rounded-tl-none">
                    <Loader2 className="text-[#F27D26] animate-spin" size={16} />
                  </div>
                </div>
              )}

              {subscriptionPlan === 'ai' && !isLoading && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {['Generate Character', 'New Mission', 'Talk like NPC'].map((action) => (
                    <button
                      key={action}
                      onClick={() => {
                        setInput(action);
                        playSound('click');
                      }}
                      className="px-3 py-1.5 bg-[#F27D26]/10 border border-[#F27D26]/30 rounded-full text-[10px] font-bold uppercase italic text-[#F27D26] hover:bg-[#F27D26]/20 transition-all"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}

              {!isLoading && messages.length < 3 && (
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-30">Suggested Intel:</p>
                  {[
                    language === 'en' ? "Latest GTA 6 news?" : "¿Últimas noticias de GTA 6?",
                    language === 'en' ? "Tell me about Vice City lore" : "Háblame de la historia de Vice City",
                    language === 'en' ? "How does the countdown work?" : "¿Cómo funciona la cuenta atrás?"
                  ].map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => {
                        setInput(q);
                        playSound('click');
                      }}
                      className="text-left px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white/60 hover:bg-white/10 hover:text-white transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t.placeholder}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-[#F27D26] transition-colors"
                />
                <button
                  onClick={handleSend}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#F27D26] hover:text-white transition-colors disabled:opacity-30"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Check, Loader2, MessageSquare } from 'lucide-react';
import { translations } from '../translations';

interface SupportButtonProps {
  user: { name: string; email: string; avatar: string; role?: 'creator' | 'member' | 'moderator' } | null;
  playSound: (type: any, volume?: number) => void;
  language: 'en' | 'es';
}

export default function SupportButton({ user, playSound, language }: SupportButtonProps) {
  const t = translations[language].chat;
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let socket: WebSocket | null = null;
    try {
      if (typeof WebSocket === 'function') {
        socket = new WebSocket(`${protocol}//${window.location.host}`);
        socketRef.current = socket;
        
        socket.onopen = () => {
          socket?.send(JSON.stringify({ type: 'join', user }));
        };
      }
    } catch (e) {
      console.error('Failed to create WebSocket for support', e);
    }

    return () => {
      socket?.close();
    };
  }, [user]);

  const handleRequestSupport = () => {
    if (!user || !socketRef.current || status !== 'idle') return;

    setStatus('sending');
    playSound('tick', 0.1);

    socketRef.current.send(JSON.stringify({
      type: 'support_request',
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    }));

    setTimeout(() => {
      setStatus('sent');
      playSound('celebration', 0.2);
      setTimeout(() => setStatus('idle'), 5000);
    }, 1000);
  };

  if (!user || user.role === 'creator') return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {status === 'sent' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            <Check size={14} />
            {t.supportRequested}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleRequestSupport}
        onMouseEnter={() => playSound('hover', 0.1)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20 group relative transition-all ${
          status === 'sent' ? 'bg-green-600' : 'bg-[#F27D26]'
        }`}
      >
        {status === 'sending' ? (
          <Loader2 className="animate-spin" size={24} />
        ) : status === 'sent' ? (
          <Check size={24} />
        ) : (
          <Bell size={24} />
        )}
        
        {/* Tooltip */}
        <div className="absolute right-full mr-4 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {t.requestSupport}
        </div>
      </motion.button>
    </div>
  );
}

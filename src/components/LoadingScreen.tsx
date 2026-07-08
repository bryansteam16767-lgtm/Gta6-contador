import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palmtree, Star } from 'lucide-react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[1000] bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Cinematic Effect */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0.3 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://picsum.photos/seed/vicecity/1920/1080?blur=10" 
          alt="Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Placeholder */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-12"
        >
          <div className="relative group">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(242,125,38,0.2)] overflow-hidden">
              {/* Actual Logo Image Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="https://picsum.photos/seed/gtalogo/400/400?grayscale" 
                  alt="App Logo Placeholder" 
                  className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Thematic Text Overlay */}
              <div className="relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl">
                  GTA <span className="text-[#F27D26]">VI</span>
                </h2>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={12} className="text-[#F27D26] fill-[#F27D26]" />
                  <span className="text-[8px] uppercase tracking-[0.4em] font-bold opacity-50">Leonida</span>
                  <Star size={12} className="text-[#F27D26] fill-[#F27D26]" />
                </div>
              </div>
            </div>
            
            {/* Animated Ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-dashed border-[#F27D26]/30 rounded-full"
            />
            
            {/* Scanline overlay on logo */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div className="w-full h-full bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] animate-scanline" />
            </div>
          </div>
        </motion.div>

        {/* Loading Info */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 mb-4"
          >
            <Palmtree className="text-[#F27D26] animate-pulse" size={20} />
            <span className="text-xs font-black uppercase tracking-[0.5em] text-white/80">
              Initializing Session
            </span>
          </motion.div>

          {/* Progress Bar Container */}
          <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-[#F27D26] to-[#D15D14] shadow-[0_0_10px_rgba(242,125,38,0.5)]"
            />
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="mt-4 text-[10px] font-mono uppercase tracking-widest"
          >
            {Math.min(Math.round(progress), 100)}% Complete
          </motion.div>
        </div>
      </div>

      {/* Corner Details */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-1 opacity-20">
        <span className="text-[8px] font-mono uppercase tracking-widest">R* North - Leonida Division</span>
        <span className="text-[8px] font-mono uppercase tracking-widest">Encrypted Handshake: OK</span>
      </div>
      
      <div className="absolute top-8 right-8 flex items-center gap-2 opacity-20">
        <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
        <span className="text-[8px] font-mono uppercase tracking-widest">Live Feed</span>
      </div>
    </motion.div>
  );
}

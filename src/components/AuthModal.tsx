import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { translations } from '../translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { uid: string; name: string; email: string; avatar: string; role?: 'creator' | 'member' }) => void;
  playSound: (type: any, volume?: number) => void;
  language: 'en' | 'es';
}

export default function AuthModal({ isOpen, onClose, onLogin, playSound, language }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = translations[language].auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (email === 'bryansteam16767@gmail.com') {
        if (password === 'bryansteam16767') {
          onLogin({
            uid: 'creator-bryan',
            name: 'Bryan Steam',
            email: email,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bryan',
            role: 'creator'
          });
          onClose();
        } else {
          setError(language === 'en' ? 'Incorrect credentials for creator account.' : 'Credenciales incorrectas para la cuenta de creador.');
        }
      } else {
        // Allow any other "fake" email to log in as a member
        onLogin({
          uid: `user-${email.replace(/[^a-zA-Z0-9]/g, '-')}`,
          name: username || email.split('@')[0],
          email: email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: 'member'
        });
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      setError(language === 'en' ? 'Connection error. Please try again.' : 'Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Rockstar Style Header */}
            <div className="bg-[#F27D26] p-6 flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-black flex items-center justify-center rounded-lg shadow-xl">
                <Star className="text-white fill-white" size={32} />
              </div>
              <h2 className="text-white font-black uppercase italic tracking-tighter text-2xl">{t.socialClub}</h2>
              <p className="text-black/60 text-[10px] uppercase font-bold tracking-[0.2em]">Rockstar Games</p>
            </div>

            <button 
              onClick={() => {
                onClose();
                playSound('close');
              }}
              onMouseEnter={() => playSound('hover', 0.05)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-2"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] uppercase font-bold tracking-widest text-center"
                >
                  {error}
                </motion.div>
              )}
              <div className="space-y-4">
                {isRegistering && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      type="text"
                      placeholder={t.username}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#F27D26] transition-colors"
                      required
                    />
                  </div>
                )}
                
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="email"
                    placeholder={t.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#F27D26] transition-colors"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="password"
                    placeholder={t.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#F27D26] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-white/40">
                <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" className="accent-[#F27D26]" />
                  {t.rememberMe}
                </label>
                <button type="button" className="hover:text-white transition-colors">{t.forgotPassword}</button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => playSound('hover', 0.1)}
                onClick={() => playSound('click')}
                className="w-full py-4 bg-[#F27D26] text-white font-black uppercase italic tracking-tighter rounded-xl flex items-center justify-center gap-2 hover:bg-[#D15D14] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isRegistering ? t.createAccount : t.signIn}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    playSound('click');
                  }}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-[#F27D26] transition-colors"
                >
                  {isRegistering ? t.alreadyHaveAccount : t.dontHaveAccount}
                </button>
              </div>
            </form>

            <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-center gap-2 text-[9px] uppercase font-bold tracking-[0.2em] text-white/20">
              <ShieldCheck size={12} />
              {t.secure}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Star({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

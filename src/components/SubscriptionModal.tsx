import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Check, ShieldCheck, Zap, Sparkles, Crown } from 'lucide-react';
import { translations } from '../translations';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'es';
  onSubscribe: (planId: string) => void;
  currentPlan: string;
  playSound: (type: any, volume?: number) => void;
}

export default function SubscriptionModal({ 
  isOpen, 
  onClose, 
  language, 
  onSubscribe, 
  currentPlan,
  playSound 
}: SubscriptionModalProps) {
  const t = translations[language].subscription;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#111]/80 backdrop-blur-md p-6 border-bottom border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                  <Crown className="text-[#F27D26]" />
                  {t.title}
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={14} 
                      className={star <= (currentPlan === 'free' ? 3 : 5) ? "fill-[#F27D26] text-[#F27D26]" : "text-white/10"} 
                    />
                  ))}
                  <span className="text-[10px] uppercase font-bold ml-2 opacity-50">
                    {currentPlan === 'free' ? t.freeStars : t.premiumStars}
                  </span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {t.plans.map((plan: any) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ y: -5 }}
                    className={`relative p-6 rounded-2xl border transition-all ${
                      currentPlan === plan.id 
                        ? 'bg-[#F27D26]/10 border-[#F27D26] shadow-[0_0_30px_rgba(242,125,38,0.1)]' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {plan.id === 'fivestar' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F27D26] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
                        Most Wanted
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-lg font-black uppercase italic mb-1">{plan.name}</h3>
                      <div className="text-2xl font-black text-[#F27D26]">{plan.price}</div>
                      <div className="text-[10px] uppercase opacity-40 font-bold">
                        {plan.id === 'premium' ? t.monthly : t.lifetime}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-xs opacity-80">
                          <Check size={14} className="text-[#F27D26] mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      disabled={currentPlan === plan.id}
                      onClick={() => {
                        onSubscribe(plan.id);
                        playSound('click');
                      }}
                      className={`w-full py-3 rounded-xl font-black uppercase italic tracking-tighter transition-all ${
                        currentPlan === plan.id
                          ? 'bg-white/10 text-white/40 cursor-default'
                          : 'bg-white text-black hover:bg-[#F27D26] hover:text-white'
                      }`}
                    >
                      {currentPlan === plan.id ? t.currentPlan : t.upgrade}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Viral Mechanic Info */}
              <div className="mt-12 p-6 bg-gradient-to-r from-purple-900/20 to-[#F27D26]/20 border border-white/10 rounded-2xl flex flex-col md:flex-row items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="w-12 h-12 rounded-full bg-[#111] border-2 border-[#F27D26] flex items-center justify-center shadow-lg">
                      <Star size={20} className="fill-[#F27D26] text-[#F27D26]" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-xl font-black uppercase italic tracking-tighter mb-1">
                    {t.wantedLevel}: 5 STARS
                  </h4>
                  <p className="text-xs opacity-60">
                    Unlock the maximum wanted level and dominate the Leonida State community. 
                    Premium members get priority in the Social Vault and exclusive NPC chat features.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold opacity-40">Starting at</div>
                    <div className="text-xl font-black">$1.99</div>
                  </div>
                  <Zap className="text-[#F27D26] animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Bell, Volume2, VolumeX, Layout, Palette, Check, Clock, Play } from 'lucide-react';
import { translations, Language } from '../translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  uiDensity: 'compact' | 'standard';
  setUiDensity: (density: 'compact' | 'standard') => void;
  theme: 'vice' | 'noir' | 'classic';
  setTheme: (theme: 'vice' | 'noir' | 'classic') => void;
  playSound: (type: any) => void;
  releaseAlertsEnabled: boolean;
  setReleaseAlertsEnabled: (enabled: boolean) => void;
  onSimulateAlert: (type: '24h' | '1h') => void;
  trailerVideoId: string;
  setTrailerVideoId: (id: string) => void;
  bgVideoEnabled: boolean;
  setBgVideoEnabled: (enabled: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  language,
  setLanguage,
  isMuted,
  setIsMuted,
  notificationsEnabled,
  setNotificationsEnabled,
  uiDensity,
  setUiDensity,
  theme,
  setTheme,
  playSound,
  releaseAlertsEnabled,
  setReleaseAlertsEnabled,
  onSimulateAlert,
  trailerVideoId,
  setTrailerVideoId,
  bgVideoEnabled,
  setBgVideoEnabled
}: SettingsModalProps) {
  const t = translations[language].settings;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F27D26] to-transparent opacity-50" />
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-wider text-white">
                  {t.title}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F27D26] opacity-80">
                  System Configuration v1.0.6
                </p>
              </div>
              <button 
                onClick={() => {
                  onClose();
                  playSound('close');
                }} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-50 hover:opacity-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Language */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/60">
                  <Globe size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.language}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(['en', 'es'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        playSound('click');
                      }}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        language === lang 
                          ? 'bg-[#F27D26]/10 border-[#F27D26] text-[#F27D26]' 
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-bold uppercase tracking-wider">{lang === 'en' ? 'English' : 'Español'}</span>
                      {language === lang && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications & Sound */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white/60">
                    <Bell size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.notifications}</span>
                  </div>
                  <button
                    onClick={() => {
                      setNotificationsEnabled(!notificationsEnabled);
                      playSound('click');
                    }}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      notificationsEnabled 
                        ? 'bg-green-500/10 border-green-500/50 text-green-500' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-bold uppercase tracking-wider text-xs">{t.enableNotifications}</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-white/20'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${notificationsEnabled ? 'left-6' : 'left-1'}`} />
                    </div>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white/60">
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.soundEffects}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      playSound('click');
                    }}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      !isMuted 
                        ? 'bg-[#F27D26]/10 border-[#F27D26]/50 text-[#F27D26]' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-bold uppercase tracking-wider text-xs">{!isMuted ? 'Enabled' : 'Disabled'}</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${!isMuted ? 'bg-[#F27D26]' : 'bg-white/20'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${!isMuted ? 'left-6' : 'left-1'}`} />
                    </div>
                  </button>
                </div>
              </div>

              {/* GTA 6 Release Alerts Section */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-white/80">
                  <Bell size={16} className="text-[#F27D26]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#F27D26]">
                    {t.releaseNotifications}
                  </span>
                </div>

                <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                  {t.releaseNotificationsDesc}
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {/* Toggle button */}
                  <button
                    onClick={() => {
                      setReleaseAlertsEnabled(!releaseAlertsEnabled);
                      playSound('click');
                    }}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      releaseAlertsEnabled 
                        ? 'bg-[#F27D26]/10 border-[#F27D26]/30 text-[#F27D26]' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-bold uppercase tracking-wider text-[11px]">
                      {t.enableReleaseNotifications}
                    </span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${releaseAlertsEnabled ? 'bg-[#F27D26]' : 'bg-white/20'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${releaseAlertsEnabled ? 'left-6' : 'left-1'}`} />
                    </div>
                  </button>

                  {/* Simulation/Test buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSimulateAlert('24h');
                        playSound('click');
                      }}
                      className="py-2.5 px-3 bg-white/5 hover:bg-[#F27D26]/10 border border-white/10 hover:border-[#F27D26]/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:text-[#F27D26] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Clock size={12} />
                      {t.test24hAlert}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSimulateAlert('1h');
                        playSound('click');
                      }}
                      className="py-2.5 px-3 bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:text-purple-400 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Clock size={12} />
                      {t.test1hAlert}
                    </button>
                  </div>
                </div>
              </div>

              {/* Trailer Customization Section */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-white/80">
                  <Play size={16} className="text-[#F27D26]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#F27D26]">
                    {t.trailerSection}
                  </span>
                </div>

                <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                  {t.trailerDesc}
                </p>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">
                      {t.trailerCustomLabel}
                    </label>
                    <input
                      type="text"
                      value={trailerVideoId}
                      onChange={(e) => {
                        const val = e.target.value;
                        let finalId = val.trim();
                        if (finalId.includes('watch?v=')) {
                          finalId = finalId.split('watch?v=')[1]?.split('&')[0] || finalId;
                        } else if (finalId.includes('youtu.be/')) {
                          finalId = finalId.split('youtu.be/')[1]?.split('?')[0] || finalId;
                        } else if (finalId.includes('youtube.com/embed/')) {
                          finalId = finalId.split('youtube.com/embed/')[1]?.split('?')[0] || finalId;
                        }
                        setTrailerVideoId(finalId);
                      }}
                      placeholder={t.trailerPlaceholder}
                      className="w-full bg-white/5 border border-white/10 focus:border-[#F27D26]/60 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-white/30 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">
                      {t.trailerPresetLabel}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTrailerVideoId('VQRLujxTm3c');
                          playSound('click');
                        }}
                        className={`py-2 px-3 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all text-left flex items-center justify-between cursor-pointer ${
                          trailerVideoId === 'VQRLujxTm3c'
                            ? 'bg-[#F27D26]/10 border-[#F27D26]/40 text-[#F27D26]'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <span>{t.trailerPreset1}</span>
                        <span className="text-[8px] font-mono opacity-40">VQRLujxTm3c</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTrailerVideoId('_5-rD7p_wQ8');
                          playSound('click');
                        }}
                        className={`py-2 px-3 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all text-left flex items-center justify-between cursor-pointer ${
                          trailerVideoId === '_5-rD7p_wQ8'
                            ? 'bg-[#F27D26]/10 border-[#F27D26]/40 text-[#F27D26]'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <span>{t.trailerPreset2}</span>
                        <span className="text-[8px] font-mono opacity-40">_5-rD7p_wQ8</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTrailerVideoId('63_vL-PbyQc');
                          playSound('click');
                        }}
                        className={`py-2 px-3 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all text-left flex items-center justify-between cursor-pointer ${
                          trailerVideoId === '63_vL-PbyQc'
                            ? 'bg-[#F27D26]/10 border-[#F27D26]/40 text-[#F27D26]'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <span>{t.trailerPreset3}</span>
                        <span className="text-[8px] font-mono opacity-40">63_vL-PbyQc</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setBgVideoEnabled(!bgVideoEnabled);
                        playSound('click');
                      }}
                      className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        bgVideoEnabled 
                          ? 'bg-[#F27D26]/10 border-[#F27D26]/30 text-[#F27D26]' 
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex flex-col items-start gap-0.5 text-left max-w-[80%]">
                        <span className="font-bold uppercase tracking-wider text-[11px]">
                          {t.bgVideoLabel}
                        </span>
                        <span className="text-[9px] text-white/40 font-medium leading-tight">
                          {t.bgVideoDesc}
                        </span>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${bgVideoEnabled ? 'bg-[#F27D26]' : 'bg-white/20'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${bgVideoEnabled ? 'left-6' : 'left-1'}`} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* UI Density */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/60">
                  <Layout size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.uiDensity}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(['standard', 'compact'] as const).map((density) => (
                    <button
                      key={density}
                      onClick={() => {
                        setUiDensity(density);
                        playSound('click');
                      }}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        uiDensity === density 
                          ? 'bg-[#F27D26]/10 border-[#F27D26] text-[#F27D26]' 
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-bold uppercase tracking-wider">{t[density]}</span>
                      {uiDensity === density && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/60">
                  <Palette size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.theme}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(['vice', 'noir', 'classic'] as const).map((tName) => (
                    <button
                      key={tName}
                      onClick={() => {
                        setTheme(tName);
                        playSound('click');
                      }}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                        theme === tName 
                          ? 'bg-[#F27D26]/10 border-[#F27D26] text-[#F27D26]' 
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-lg mb-1 ${
                        tName === 'vice' ? 'bg-gradient-to-br from-[#F27D26] to-[#FF00FF]' :
                        tName === 'noir' ? 'bg-zinc-900' :
                        'bg-blue-900'
                      }`} />
                      <span className="text-[8px] font-black uppercase tracking-widest leading-tight">
                        {tName === 'vice' ? t.viceCity : tName === 'noir' ? t.noir : t.classic}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                playSound('celebration');
              }}
              className="w-full mt-8 py-4 bg-[#F27D26] text-white font-black uppercase italic tracking-widest rounded-2xl hover:bg-[#ff8c37] transition-all shadow-lg shadow-[#F27D26]/20 active:scale-[0.98]"
            >
              {t.save}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

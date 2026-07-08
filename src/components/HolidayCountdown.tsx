import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, User as UserIcon, Calendar, X } from 'lucide-react';

const HOLIDAYS = [
  {
    id: 'mothers_day',
    name: { en: "Mother's Day", es: "Día de las Madres" },
    date: new Date('2026-05-10T00:00:00'), // Mother's Day ended (past date)
    icon: <Heart className="w-5 h-5 text-pink-500" />,
    color: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'border-pink-500/30'
  },
  {
    id: 'fathers_day',
    name: { en: "Father's Day", es: "Día de los Padres" },
    date: new Date('2026-07-26T00:00:00'), // Father's Day is upcoming 
    icon: <UserIcon className="w-5 h-5 text-blue-500" />,
    color: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30'
  }
];

interface HolidayCountdownProps {
  language: 'en' | 'es';
}

export default function HolidayCountdown({ language }: HolidayCountdownProps) {
  const [selectedHolidayId, setSelectedHolidayId] = useState<string>('fathers_day');
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [activeHolidays, setActiveHolidays] = useState<typeof HOLIDAYS>([]);

  useEffect(() => {
    const updateHoliday = () => {
      const now = new Date();
      const upcoming = HOLIDAYS.filter(h => h.date > now);
      setActiveHolidays(upcoming);

      if (upcoming.length === 0) {
        setTimeLeft(null);
        return;
      }

      // Auto-switch to first upcoming holiday if current one is not active / passed
      let currentId = selectedHolidayId;
      if (!upcoming.some(h => h.id === currentId)) {
        currentId = upcoming[0].id;
        setSelectedHolidayId(currentId);
      }

      const activeHoliday = upcoming.find(h => h.id === currentId);
      if (activeHoliday) {
        const diff = activeHoliday.date.getTime() - now.getTime();
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      } else {
        setTimeLeft(null);
      }
    };

    updateHoliday();
    const timer = setInterval(updateHoliday, 1000);
    return () => clearInterval(timer);
  }, [selectedHolidayId]);

  if (!timeLeft || !isVisible || activeHolidays.length === 0) return null;

  const currentHoliday = activeHolidays.find(h => h.id === selectedHolidayId) || activeHolidays[0];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1.5"
    >
      {/* Holiday Selector Pills (only visible if we have multiple active holidays) */}
      {activeHolidays.length > 1 && (
        <div className="flex gap-1.5 p-1 bg-black/60 border border-white/5 backdrop-blur-md rounded-full shadow-lg">
          {activeHolidays.map((h) => {
            const isActive = h.id === selectedHolidayId;
            return (
              <button
                key={h.id}
                onClick={() => setSelectedHolidayId(h.id)}
                className={`
                  px-3 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider transition-all duration-300 flex items-center gap-1.5
                  ${isActive 
                    ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)] border border-white/10' 
                    : 'text-white/40 hover:text-white/75 border border-transparent'
                  }
                `}
              >
                <span className="scale-75 origin-center">{h.icon}</span>
                {h.name[language]}
              </button>
            );
          })}
        </div>
      )}

      <div className={`
        relative px-6 py-3 rounded-2xl border backdrop-blur-md bg-gradient-to-r ${currentHoliday.color} ${currentHoliday.borderColor}
        shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-4 group
      `}>
        <div className="flex items-center gap-2">
          {currentHoliday.icon}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50">
              {language === 'en' ? 'Special Event' : 'Evento Especial'}
            </span>
            <span className="text-sm font-bold text-white whitespace-nowrap animate-fade-in">
              {currentHoliday.name[language]}
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10" />

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center w-8">
            <span className="text-lg font-black text-white leading-none">{timeLeft.days}</span>
            <span className="text-[8px] uppercase font-bold tracking-widest text-white/40">{language === 'en' ? 'Days' : 'Días'}</span>
          </div>
          <span className="text-white/20 font-bold">:</span>
          <div className="flex flex-col items-center w-8">
            <span className="text-lg font-black text-white leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[8px] uppercase font-bold tracking-widest text-white/40">{language === 'en' ? 'Hrs' : 'Hrs'}</span>
          </div>
          <span className="text-white/20 font-bold">:</span>
          <div className="flex flex-col items-center w-8">
            <span className="text-lg font-black text-white leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[8px] uppercase font-bold tracking-widest text-white/40">{language === 'en' ? 'Min' : 'Min'}</span>
          </div>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors text-white/30 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Decorative shine */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
      </div>
    </motion.div>
  );
}

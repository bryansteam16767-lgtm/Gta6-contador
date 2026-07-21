import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sun, CloudRain, CloudLightning, CloudFog, CloudSun, Moon, Wind, Thermometer, Radio } from 'lucide-react';

interface ViceCityWeatherBarProps {
  onOpenModal: () => void;
  playSound: (type: any, volume?: number) => void;
  language: 'en' | 'es';
}

interface QuickWeather {
  tempF: number;
  condition: string;
  icon: string;
  name: string;
  humidity: number;
  windMph: number;
}

export default function ViceCityWeatherBar({ onOpenModal, playSound, language }: ViceCityWeatherBarProps) {
  const [weather, setWeather] = useState<QuickWeather>({
    tempF: 88,
    condition: 'Neon Sunset Haze',
    icon: 'sun_sunset',
    name: 'Vice City',
    humidity: 78,
    windMph: 12
  });

  useEffect(() => {
    const fetchQuickWeather = async () => {
      try {
        const res = await fetch('/api/weather/leonida?zone=vice_city');
        if (res.ok) {
          const data = await res.json();
          if (data.zone) {
            setWeather({
              tempF: data.zone.tempF,
              condition: data.zone.condition,
              icon: data.zone.icon,
              name: data.zone.name,
              humidity: data.zone.humidity,
              windMph: data.zone.windMph
            });
          }
        }
      } catch (err) {
        console.error('Weather bar fetch error:', err);
      }
    };

    fetchQuickWeather();
    const interval = setInterval(fetchQuickWeather, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun size={14} className="text-amber-400 animate-spin-slow" />;
      case 'sun_sunset':
        return <Sun size={14} className="text-[#F27D26] animate-pulse" />;
      case 'cloud_sun':
        return <CloudSun size={14} className="text-sky-300" />;
      case 'rain':
        return <CloudRain size={14} className="text-blue-400 animate-bounce" />;
      case 'storm':
        return <CloudLightning size={14} className="text-yellow-400 animate-pulse" />;
      case 'fog':
        return <CloudFog size={14} className="text-slate-300" />;
      case 'moon':
        return <Moon size={14} className="text-indigo-300" />;
      default:
        return <Sun size={14} className="text-amber-400" />;
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        onOpenModal();
        playSound('open');
      }}
      onMouseEnter={() => playSound('hover', 0.05)}
      className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 hover:border-[#F27D26]/50 backdrop-blur-md cursor-pointer transition-all shadow-lg group"
      title={language === 'es' ? 'Ver Radar Meteorológico de Vice City' : 'Open Vice City Weather Radar'}
    >
      <div className="flex items-center gap-1.5 border-r border-white/10 pr-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        {renderIcon(weather.icon)}
        <span className="text-xs font-black font-mono text-white group-hover:text-[#F27D26] transition-colors">
          {weather.tempF}°F
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 hidden md:inline">
          {weather.name}
        </span>
        <span className="text-[10px] font-mono text-white/50 hidden lg:inline">
          • {weather.condition}
        </span>
      </div>

      <div className="pl-1 text-[#F27D26] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
        <Radio size={12} />
      </div>
    </motion.button>
  );
}

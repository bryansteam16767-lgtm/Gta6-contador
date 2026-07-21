import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, CloudRain, CloudLightning, CloudFog, CloudSun, Moon, Wind, Droplets, ShieldAlert, RefreshCw, Zap, Compass, Thermometer, Eye, Radio, Sparkles } from 'lucide-react';
import { translations } from '../translations';

interface ViceCityWeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'es';
  playSound: (type: any, volume?: number) => void;
  theme: 'vice' | 'noir' | 'classic';
}

interface ForecastDay {
  day: string;
  condition: string;
  highF: number;
  lowF: number;
  icon: string;
}

interface WeatherZoneData {
  id: string;
  name: string;
  area: string;
  tempF: number;
  feelsLikeF: number;
  condition: string;
  icon: string;
  humidity: number;
  windMph: number;
  windDirection: string;
  uvIndex: number;
  airQuality: string;
  advisory: string;
  forecast: ForecastDay[];
  loreTip: string;
}

const ZONES = [
  { id: 'vice_city', name: 'Vice City Metro' },
  { id: 'ocean_drive', name: 'Ocean Drive' },
  { id: 'starfish', name: 'Starfish Island' },
  { id: 'swamps', name: 'Leonida Swamps' },
  { id: 'port_gellhorn', name: 'Port Gellhorn' },
  { id: 'keys', name: 'Leonida Keys' }
];

export default function ViceCityWeatherModal({ isOpen, onClose, language, playSound, theme }: ViceCityWeatherModalProps) {
  const t = translations[language].weatherWidget;

  const [selectedZone, setSelectedZone] = useState<string>('vice_city');
  const [unit, setUnit] = useState<'F' | 'C'>('F');
  const [weatherData, setWeatherData] = useState<WeatherZoneData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStormSimulated, setIsStormSimulated] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  const fetchWeather = async (zoneId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/weather/leonida?zone=${zoneId}`);
      if (response.ok) {
        const data = await response.json();
        setWeatherData(data.zone);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Weather fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWeather(selectedZone);
      setIsStormSimulated(false);
    }
  }, [isOpen, selectedZone]);

  const handleRefresh = () => {
    playSound('tick', 0.2);
    fetchWeather(selectedZone);
  };

  const handleSimulateStorm = () => {
    playSound('hack', 0.3);
    setIsStormSimulated(prev => !prev);
    
    if (!isStormSimulated && weatherData) {
      setWeatherData({
        ...weatherData,
        tempF: 76,
        feelsLikeF: 72,
        condition: 'Severe Category 3 Tropical Storm',
        icon: 'storm',
        humidity: 98,
        windMph: 48,
        windDirection: 'SSE',
        uvIndex: 1,
        advisory: 'EMERGENCY WARNING: Severe Tropical Storm & Flash Flood Hazard Across Vice City!',
        loreTip: 'Street racing suspended. High risk of hydroplaning near Vice Port and Ocean Drive.'
      });
    } else {
      fetchWeather(selectedZone);
    }
  };

  const convertTemp = (tempF: number) => {
    if (unit === 'C') {
      return Math.round(((tempF - 32) * 5) / 9);
    }
    return tempF;
  };

  const renderWeatherIcon = (iconName: string, size = 28) => {
    switch (iconName) {
      case 'sun':
        return <Sun size={size} className="text-amber-400 animate-spin-slow" />;
      case 'sun_sunset':
        return <Sun size={size} className="text-[#F27D26] animate-pulse" />;
      case 'cloud_sun':
        return <CloudSun size={size} className="text-sky-300" />;
      case 'rain':
        return <CloudRain size={size} className="text-blue-400 animate-bounce" />;
      case 'storm':
        return <CloudLightning size={size} className="text-yellow-400 animate-pulse" />;
      case 'fog':
        return <CloudFog size={size} className="text-slate-300" />;
      case 'moon':
        return <Moon size={size} className="text-indigo-300" />;
      default:
        return <Sun size={size} className="text-amber-400" />;
    }
  };

  const getUVColor = (uv: number) => {
    if (uv <= 2) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (uv <= 5) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    if (uv <= 8) return 'text-[#F27D26] border-[#F27D26]/30 bg-[#F27D26]/10';
    return 'text-red-500 border-red-500/30 bg-red-500/10';
  };

  const getThemeAccent = () => {
    if (theme === 'vice') return 'border-[#F27D26]/40 text-[#F27D26] bg-[#F27D26]/10';
    if (theme === 'noir') return 'border-sky-500/40 text-sky-400 bg-sky-500/10';
    return 'border-amber-500/40 text-amber-500 bg-amber-500/10';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-[#0c0d12] border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient CRT Scanlines & Neon Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none z-50" />
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#F27D26]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-black/70 flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded border ${getThemeAccent()} flex items-center justify-center`}>
                  <Radio size={24} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                    {t.title}
                    <span className="text-[9px] not-italic px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest font-black font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {t.liveRadarStatus}
                    </span>
                  </h2>
                  <p className="text-[9px] uppercase font-bold text-white/40 tracking-widest mt-0.5 font-mono">
                    {t.subtitle} // LAST_SYNC: {lastSyncTime || 'LIVE'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Temperature Unit Toggle */}
                <button
                  onClick={() => {
                    setUnit(unit === 'F' ? 'C' : 'F');
                    playSound('click');
                  }}
                  className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-black font-mono text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {t.tempScale}: °{unit}
                </button>

                <button 
                  onClick={onClose}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 z-10">
              
              {/* Zone Navigation Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div className="flex flex-wrap gap-2">
                  {ZONES.map(z => {
                    const isActive = selectedZone === z.id;
                    return (
                      <button
                        key={z.id}
                        onClick={() => {
                          setSelectedZone(z.id);
                          playSound('click');
                        }}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                          isActive
                            ? 'bg-[#F27D26] text-black font-black shadow-[0_0_15px_rgba(242,125,38,0.4)]'
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                      >
                        {z.name}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/80 flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
                    {t.refreshRadar}
                  </button>

                  <button
                    onClick={handleSimulateStorm}
                    className={`px-3 py-1.5 rounded border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                      isStormSimulated
                        ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
                        : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    <Zap size={12} />
                    {t.simulateStorm}
                  </button>
                </div>
              </div>

              {/* Main Weather Display */}
              {weatherData ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Big Weather Card & Radar Graphics */}
                  <div className="lg:col-span-7 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
                    
                    {/* Background Radar Grid graphic */}
                    <div className="absolute top-4 right-4 w-32 h-32 rounded-full border border-white/10 flex items-center justify-center opacity-30 pointer-events-none">
                      <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border border-white/10" />
                      </div>
                      <div className="absolute inset-0 border-t border-white/10" />
                      <div className="absolute inset-0 border-l border-white/10" />
                      {/* Radar Sweep Line */}
                      <div className="absolute w-1/2 h-0.5 bg-gradient-to-r from-transparent to-[#F27D26] top-1/2 left-1/2 origin-left animate-spin-slow" />
                    </div>

                    <div className="flex flex-col gap-1 z-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#F27D26] font-mono flex items-center gap-1">
                        <Compass size={12} /> {weatherData.area}
                      </span>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                        {weatherData.name}
                      </h3>
                    </div>

                    <div className="my-8 flex items-baseline gap-6 z-10">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/10">
                          {renderWeatherIcon(weatherData.icon, 48)}
                        </div>
                        <div>
                          <div className="text-6xl font-black italic tracking-tighter font-mono text-white">
                            {convertTemp(weatherData.tempF)}°{unit}
                          </div>
                          <div className="text-[10px] font-bold font-mono text-white/50 uppercase">
                            FEELS LIKE {convertTemp(weatherData.feelsLikeF)}°{unit}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-lg font-black uppercase italic tracking-tight text-white/90">
                          {weatherData.condition}
                        </span>
                        <span className="text-[10px] font-mono text-white/40 uppercase">
                          SAT_ORBIT_PASS_COMPLETED
                        </span>
                      </div>
                    </div>

                    {/* Meteorological Alert Banner */}
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 z-10">
                      <ShieldAlert size={18} className="text-red-400 shrink-0 animate-pulse" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-red-400 font-mono">
                          {t.advisory}
                        </span>
                        <span className="text-xs font-bold text-white/90">
                          {weatherData.advisory}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Key Environmental Metrics */}
                  <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                    
                    {/* Humidity */}
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between opacity-50">
                        <span className="text-[9px] font-black uppercase tracking-widest font-mono">{t.humidity}</span>
                        <Droplets size={16} className="text-blue-400" />
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black font-mono text-white">{weatherData.humidity}%</div>
                        <div className="text-[9px] font-mono text-white/40 uppercase">TROPICAL VAPOR DENSITY</div>
                      </div>
                    </div>

                    {/* Wind Speed */}
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between opacity-50">
                        <span className="text-[9px] font-black uppercase tracking-widest font-mono">{t.wind}</span>
                        <Wind size={16} className="text-teal-400" />
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black font-mono text-white">
                          {weatherData.windMph} <span className="text-xs">MPH</span>
                        </div>
                        <div className="text-[9px] font-mono text-white/40 uppercase">GUSTS {weatherData.windDirection}</div>
                      </div>
                    </div>

                    {/* UV Index */}
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between opacity-50">
                        <span className="text-[9px] font-black uppercase tracking-widest font-mono">{t.uvIndex}</span>
                        <Sun size={16} className="text-amber-400" />
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black font-mono text-white">{weatherData.uvIndex}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getUVColor(weatherData.uvIndex)} font-mono`}>
                            {weatherData.uvIndex >= 8 ? 'EXTREME' : 'HIGH'}
                          </span>
                        </div>
                        <div className="text-[9px] font-mono text-white/40 uppercase">SOLAR EXPOSURE</div>
                      </div>
                    </div>

                    {/* Air Quality */}
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between opacity-50">
                        <span className="text-[9px] font-black uppercase tracking-widest font-mono">{t.airQuality}</span>
                        <Eye size={16} className="text-emerald-400" />
                      </div>
                      <div className="mt-3">
                        <div className="text-xs font-black font-mono text-white truncate">{weatherData.airQuality}</div>
                        <div className="text-[9px] font-mono text-white/40 uppercase">ATMOSPHERIC SENSORS</div>
                      </div>
                    </div>

                    {/* Field Conditions Tip */}
                    <div className="col-span-2 p-4 bg-black/50 border border-white/10 rounded-xl flex items-start gap-3">
                      <Sparkles size={16} className="text-[#F27D26] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#F27D26] font-mono block">
                          {t.loreTip}
                        </span>
                        <p className="text-xs font-mono text-white/80 mt-0.5 leading-relaxed">
                          {weatherData.loreTip}
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="p-12 text-center text-white/40 font-mono text-xs">
                  {t.title}... Loading Satellite Radar Feed...
                </div>
              )}

              {/* 5-Day Forecast Grid */}
              {weatherData?.forecast && (
                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50 font-mono flex items-center gap-1.5">
                    <Thermometer size={12} /> {t.forecastTitle}
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {weatherData.forecast.map((day, idx) => (
                      <div 
                        key={idx}
                        className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center justify-between text-center gap-2 hover:border-white/20 transition-colors"
                      >
                        <span className="text-xs font-black uppercase tracking-wider text-[#F27D26] font-mono">
                          {day.day}
                        </span>
                        <div className="my-1">
                          {renderWeatherIcon(day.icon, 24)}
                        </div>
                        <span className="text-[9px] font-bold text-white/70 truncate w-full">
                          {day.condition}
                        </span>
                        <div className="text-xs font-mono font-black text-white">
                          {convertTemp(day.highF)}° / <span className="text-white/40">{convertTemp(day.lowF)}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

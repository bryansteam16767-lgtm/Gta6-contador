import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Loader2, Sparkles, RefreshCw, Compass, Globe, Radar, Eye } from 'lucide-react';
import { translations } from '../translations';

interface MapExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'es';
  playSound: (type: any, volume?: number) => void;
  theme: 'vice' | 'noir' | 'classic';
}

interface Location {
  id: string;
  name: string;
  area: string;
  coordinates: string;
  type: 'beaches' | 'urban' | 'industrial' | 'nature' | 'luxury';
  description: string;
  promptGuide: string;
  image: string;
}

const LOCATIONS: Location[] = [
  {
    id: 'starfish',
    name: 'Starfish Island',
    area: 'Vice City Bays',
    coordinates: 'X: -340, Y: 120',
    type: 'luxury',
    description: 'A secluded enclave of massive estates, private yachts, and high security. Once ruled by drug lords and eccentric billionaires, it remains the ultimate status symbol of Vice City.',
    promptGuide: 'Generate high-octane lore or a rumored heist at Starfish Island involving a luxury waterfront mansion, Jason and Lucia casing the joint, high security guards, and sports cars parked outside.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ocean_drive',
    name: 'Ocean Drive',
    area: 'East Beach',
    coordinates: 'X: 820, Y: -910',
    type: 'beaches',
    description: 'The glittering, neon-soaked shoreline of East Beach. Flanked by pastel Art Deco hotels, supercars cruising at midnight, and beachgoers soaking in the atmosphere.',
    promptGuide: 'Generate cinematic lore or rumors about Ocean Drive. Focus on the pastel art deco neon hotels, the supercars cruising at night, beach parties, and Jason and Lucia blending into the crowd.',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'vice_port',
    name: 'Vice Port',
    area: 'South Industrial',
    coordinates: 'X: -100, Y: -890',
    type: 'industrial',
    description: 'The industrial heartbeat of Vice City. Massive container terminals, cargo vessels, and secluded warehouses that have hidden the city\'s black market operations for decades.',
    promptGuide: 'Generate a gritty, tense lore blurb or a smuggler rumor about Vice Port. Mention container shipping, cargo ships, port authorities, and a high-stakes night transaction by smugglers.',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'little_havana',
    name: 'Little Havana',
    area: 'Central Districts',
    coordinates: 'X: -540, Y: -230',
    type: 'urban',
    description: 'A lively cultural neighborhood filled with the aroma of strong Cuban espresso, colorful murals, street-side domino games, and tight-knit community networks.',
    promptGuide: 'Generate warm, lively but slightly edgy lore or rumors about Little Havana. Focus on Cafecito window chats, domino tables on Calle Ocho, retro lowriders, and local crews.',
    image: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'downtown',
    name: 'Downtown Vice',
    area: 'North Downtown',
    coordinates: 'X: -120, Y: 850',
    type: 'urban',
    description: 'The soaring skyscraper district. Home to corporate headquarters, the city\'s stadium, and premium high-rise condos where white-collar wealth meets underworld deals.',
    promptGuide: 'Generate corporate thriller style lore or rumors about Downtown Vice City. Talk about skyscrapers, glass offices, white-collar criminals laundering money, and rooftops with helicopter pads.',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'leafy_links',
    name: 'Leafy Links',
    area: 'North Islands',
    coordinates: 'X: 230, Y: 450',
    type: 'luxury',
    description: 'An exclusive 18-hole golf club and country club. A pristine retreat where the city\'s power players make high-society connections, secure backroom deals, and avoid the noise.',
    promptGuide: 'Generate humorous but premium lore or rumors about Leafy Links country club. Mention golf carts, pristine green fairways, corrupt politicians drinking cocktails, and a target for a sneaky robbery.',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'swamps',
    name: 'Leonida Swamps',
    area: 'West Wilderness',
    coordinates: 'X: -1500, Y: -400',
    type: 'nature',
    description: 'The untamed, humid wilderness of Leonida. Overgrown with mangrove roots and crawling with alligators, it\'s a sanctuary for outlaws, mud-boggers, and ancient local secrets.',
    promptGuide: 'Generate dark, swampy, atmospheric lore or rumors about Leonida Swamps. Focus on alligators, airboats, dense humidity, mysterious hermits, mud clubs, and hidden contraband caches.',
    image: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'port_gellhorn',
    name: 'Port Gellhorn',
    area: 'West Coast',
    coordinates: 'X: -2200, Y: 150',
    type: 'urban',
    description: 'A rugged, sun-bleached coastal town west of Vice City proper. Supported by local fishing and auto mechanics, it\'s a hotbed for drag racing, scrap yards, and blue-collar crews.',
    promptGuide: 'Generate a fast-paced blue-collar rumor about Port Gellhorn. Mention car customization, highway drag races, rusty trailer parks, police pursuits, and Jason and Lucia hiding out.',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80'
  }
];

export default function MapExplorerModal({ isOpen, onClose, language, playSound, theme }: MapExplorerModalProps) {
  const t = translations[language].mapExplorer;
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loreCache, setLoreCache] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Theme styling helpers
  const getThemeAccent = () => {
    if (theme === 'vice') return 'text-[#F27D26] border-[#F27D26]/40 bg-[#F27D26]/10';
    if (theme === 'noir') return 'text-sky-400 border-sky-500/40 bg-sky-500/10';
    return 'text-amber-500 border-amber-500/40 bg-amber-500/10';
  };

  const getThemeButtonClass = (isActive: boolean) => {
    if (theme === 'vice') {
      return isActive 
        ? 'bg-[#F27D26] text-black shadow-[0_0_15px_rgba(242,125,38,0.4)]' 
        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10';
    }
    if (theme === 'noir') {
      return isActive 
        ? 'bg-sky-500 text-black shadow-[0_0_15px_rgba(14,165,233,0.4)]' 
        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10';
    }
    return isActive 
      ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10';
  };

  const getThemeTextGlow = () => {
    if (theme === 'vice') return 'text-[#F27D26] drop-shadow-[0_0_10px_rgba(242,125,38,0.5)]';
    if (theme === 'noir') return 'text-sky-400 drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]';
    return 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]';
  };

  const handleFetchLore = async (location: Location, forceRefresh = false) => {
    const cacheKey = `${location.id}_${language}`;
    if (!forceRefresh && loreCache[cacheKey]) {
      playSound('click');
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    playSound('tick', 0.15);

    try {
      const response = await fetch('/api/map/lore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locationId: location.id,
          locationName: location.name,
          promptGuide: location.promptGuide,
          language
        })
      });

      if (!response.ok) {
        throw new Error('Signal interference');
      }

      const data = await response.json();
      if (data.lore) {
        setLoreCache(prev => ({
          ...prev,
          [cacheKey]: data.lore
        }));
        playSound('celebration', 0.15);
      } else {
        throw new Error('No lore received');
      }
    } catch (err) {
      console.error(err);
      setFetchError(t.error);
      playSound('hack', 0.2);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLocations = LOCATIONS.filter(loc => 
    activeTab === 'all' ? true : loc.type === activeTab
  );

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
            className="bg-[#0b0b0b] border border-white/10 rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none z-50" />

            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-black/60 flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded border ${getThemeAccent()} flex items-center justify-center`}>
                  <Compass size={24} className="animate-spin-slow" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                    {t.title}
                    <span className="text-[9px] not-italic px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-widest font-black font-mono animate-pulse">
                      LIVE RADAR
                    </span>
                  </h2>
                  <p className="text-[9px] uppercase font-bold text-white/40 tracking-widest mt-0.5">
                    {t.subtitle} // STATE_DECRYPT_MODE_ON
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                onMouseEnter={() => playSound('hover', 0.05)}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 z-10">
              
              {/* Left Column - Grid & Category Tabs */}
              <div className="lg:col-span-7 p-6 overflow-y-auto flex flex-col gap-6 border-r border-white/5 h-full">
                
                {/* Category Filtering Tabs */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {[
                    { id: 'all', label: t.locTypeAll },
                    { id: 'beaches', label: t.locTypeBeaches },
                    { id: 'urban', label: t.locTypeUrban },
                    { id: 'industrial', label: t.locTypeIndustrial },
                    { id: 'nature', label: t.locTypeNature },
                    { id: 'luxury', label: t.locTypeLuxury }
                  ].map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveTab(category.id);
                        playSound('click');
                      }}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${getThemeButtonClass(activeTab === category.id)}`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                {/* Locations Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  {filteredLocations.map((location) => {
                    const isSelected = selectedLocation?.id === location.id;
                    const isLoreDecrypted = !!loreCache[`${location.id}_${language}`];

                    return (
                      <motion.div
                        key={location.id}
                        whileHover={{ y: -3, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setSelectedLocation(location);
                          handleFetchLore(location);
                        }}
                        onMouseEnter={() => playSound('hover', 0.05)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group ${
                          isSelected
                            ? theme === 'vice' ? 'bg-[#F27D26]/5 border-[#F27D26] shadow-[0_0_15px_rgba(242,125,38,0.1)]'
                              : theme === 'noir' ? 'bg-sky-500/5 border-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.1)]'
                              : 'bg-amber-500/5 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                            : 'bg-white/5 border-white/5 hover:border-white/20'
                        }`}
                      >
                        {/* Decrypted Ribbon */}
                        {isLoreDecrypted && (
                          <div className={`absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black tracking-widest uppercase font-mono ${
                            theme === 'vice' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          }`}>
                            <Sparkles size={8} />
                            DECRYPTED
                          </div>
                        )}

                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] uppercase tracking-widest font-bold opacity-40 font-mono flex items-center gap-1">
                            <MapPin size={8} /> {location.area}
                          </span>
                          <h3 className="text-sm font-black uppercase italic tracking-tighter group-hover:text-white transition-colors">
                            {location.name}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between mt-1 text-[8px] font-bold font-mono opacity-60">
                          <span>{location.coordinates}</span>
                          <span className="uppercase text-white/40">{t.sector} #{location.id.slice(0,3).toUpperCase()}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column - Sector Radar Details */}
              <div className="lg:col-span-5 bg-black/40 flex flex-col h-full overflow-hidden">
                <AnimatePresence mode="wait">
                  {selectedLocation ? (
                    <motion.div
                      key={selectedLocation.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-6 flex flex-col gap-6 h-full overflow-y-auto"
                    >
                      {/* Image Preview with Cyberpunk Overlay */}
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 shadow-inner group">
                        <img 
                          src={selectedLocation.image} 
                          alt={selectedLocation.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                        <div className="absolute bottom-3 left-3 flex flex-col">
                          <span className="text-[7px] font-black tracking-widest uppercase font-mono text-white/50">LIVE CAMERA BROADCAST</span>
                          <span className="text-xs font-black uppercase italic tracking-tighter text-white">{selectedLocation.name}</span>
                        </div>
                        {/* Scanning bar animation */}
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-scan pointer-events-none" />
                      </div>

                      {/* Location Metadata */}
                      <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl border border-white/5 font-mono text-[9px] font-bold">
                        <div>
                          <div className="text-white/40 uppercase">{t.coordinates}</div>
                          <div className={getThemeTextGlow()}>{selectedLocation.coordinates}</div>
                        </div>
                        <div>
                          <div className="text-white/40 uppercase">VIBE SIGNATURE</div>
                          <div className="text-white uppercase">{selectedLocation.type}</div>
                        </div>
                      </div>

                      {/* Decrypted Lore Section */}
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-[10px] font-black uppercase italic tracking-widest text-white/60 flex items-center gap-1.5">
                            <Radar size={12} className={isLoading ? "animate-pulse" : ""} />
                            SATELLITE INTEL ANALYSIS
                          </span>
                          
                          {loreCache[`${selectedLocation.id}_${language}`] && (
                            <button
                              onClick={() => handleFetchLore(selectedLocation, true)}
                              disabled={isLoading}
                              className="text-[8px] font-black uppercase tracking-widest text-[#F27D26] hover:text-white transition-colors flex items-center gap-1 border border-[#F27D26]/20 bg-[#F27D26]/5 px-2 py-1 rounded"
                            >
                              <RefreshCw size={8} className={isLoading ? "animate-spin" : ""} />
                              {t.rescanIntel}
                            </button>
                          )}
                        </div>

                        <div className="p-4 bg-black/60 rounded-xl border border-white/5 flex-1 relative flex flex-col justify-center min-h-[150px]">
                          {isLoading ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
                              <Loader2 className="animate-spin text-red-500" size={24} />
                              <p className="text-[9px] font-bold font-mono tracking-widest text-red-400 animate-pulse uppercase">
                                {t.loading}
                              </p>
                            </div>
                          ) : fetchError ? (
                            <div className="text-center text-red-500 text-xs font-mono py-4">
                              {fetchError}
                            </div>
                          ) : (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5 }}
                              className="text-xs leading-relaxed text-white/90 font-mono"
                            >
                              {loreCache[`${selectedLocation.id}_${language}`] || selectedLocation.description}
                            </motion.p>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 h-full gap-4 opacity-40 select-none">
                      <Radar size={48} className="text-white/20 animate-pulse" />
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest mb-1 font-mono">
                          {t.sector} RADAR STATUS: IDLE
                        </h3>
                        <p className="text-[10px] max-w-xs leading-relaxed">
                          {t.defaultLore}
                        </p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

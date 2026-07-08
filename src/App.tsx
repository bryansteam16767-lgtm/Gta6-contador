/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, MapPin, Share2, X, Settings, Check, Volume2, VolumeX, Twitter, Facebook, Link2, Palmtree, Star, Sparkles, User, LogIn, LogOut, Languages, Users, MessageCircle, Send, ExternalLink, Bell, Info, Globe, Lock, Crown, Radio, Tag, FileText, Bookmark } from 'lucide-react';
import { auth, db } from './firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import CreatorLab from './components/CreatorLab';
import AuthModal from './components/AuthModal';
import ChatBot from './components/ChatBot';
import YouTubeTrailer from './components/YouTubeTrailer';
import LiveChat from './components/LiveChat';
import LoadingScreen from './components/LoadingScreen';
import SubscriptionModal from './components/SubscriptionModal';
import SupportButton from './components/SupportButton';
import SettingsModal from './components/SettingsModal';
import HolidayCountdown from './components/HolidayCountdown';
import GoogleDocsModal from './components/GoogleDocsModal';
import { translations, Language } from './translations';

const TARGET_DATE = new Date('2026-11-19T00:00:00');
const START_DATE = new Date('2023-12-04T00:00:00'); // Trailer 1 Announcement

const SOUNDS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  open: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  close: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
  tick: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3',
  celebration: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  hover: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  hack: 'https://assets.mixkit.co/active_storage/sfx/2557/2557-preview.mp3',
  radio_switch: 'https://assets.mixkit.co/active_storage/sfx/2558/2558-preview.mp3'
};

const RADIO_STATIONS = [
  { 
    id: 'v-theme', 
    nameKey: 'vTheme', 
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73456.mp3',
    color: '#F27D26',
    desc: 'Iconic Synthwave'
  },
  { 
    id: 'flash-fm', 
    nameKey: 'flashFM', 
    url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',
    color: '#FF00FF',
    desc: '80s Pop Hits'
  },
  { 
    id: 'emotion', 
    nameKey: 'emotion', 
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_1919491301.mp3',
    color: '#00FFFF',
    desc: 'Smooth Ballads'
  },
  { 
    id: 'v-rock', 
    nameKey: 'vRock', 
    url: 'https://cdn.pixabay.com/audio/2022/02/22/audio_83a61e3a92.mp3',
    color: '#FF0000',
    desc: '80s Hard Rock'
  },
  { 
    id: 'if99', 
    nameKey: 'if99', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    color: '#4ADE80',
    desc: 'Leonida Modern Pop'
  },
  { 
    id: 'vibe', 
    nameKey: 'vibe', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    color: '#FBBF24',
    desc: 'R&B and Soul Vibes'
  }
];

interface TimeLeft {
  years: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

import { Tooltip } from './components/Tooltip';

export default function App() {
  console.log("Render Start");
  console.log("CONNECTED");
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isYouTubeOpen, setIsYouTubeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharedCount, setSharedCount] = useState<number>(() => {
    const saved = localStorage.getItem('gta6_countdown_shared_count');
    return saved ? parseInt(saved, 10) : 1384210;
  });
  const [isCreatorLabOpen, setIsCreatorLabOpen] = useState(false);
  const [isGoogleDocsOpen, setIsGoogleDocsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [supportNotifications, setSupportNotifications] = useState<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('free');
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: 'info' | 'update' | 'rumor' }[]>([
    { id: '1', text: 'New Creator Lab features unlocked!', type: 'update' },
    { id: '2', text: 'Social Club maintenance scheduled for 03:00 UTC', type: 'info' },
    { id: '3', text: 'GTA VI: Reveal Event rumored for May 2026.', type: 'rumor' },
    { id: '4', text: 'Rumor: Trailer 3 might feature Lucia and Jason in a heist montage.', type: 'rumor' },
    { id: '5', text: 'Vice City Map leaks suggest a return to North Point Mall.', type: 'rumor' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar: string; role?: 'creator' | 'member' | 'moderator' } | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [uiDensity, setUiDensity] = useState<'compact' | 'standard'>('standard');
  const [theme, setTheme] = useState<'vice' | 'noir' | 'classic'>('vice');
  const [isReleased, setIsReleased] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentStation, setCurrentStation] = useState(0);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isTwitchLive, setIsTwitchLive] = useState(false);
  const [isGTA5PriceOpen, setIsGTA5PriceOpen] = useState(false);
  const [isHackMode, setIsHackMode] = useState(false);
  const [hackPhase, setHackPhase] = useState(1);
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [userCountry, setUserCountry] = useState<string>('');
  const [bookmarkedIntel, setBookmarkedIntel] = useState<string[]>(() => {
    const saved = localStorage.getItem('gta6_bookmarked_intel');
    return saved ? JSON.parse(saved) : [];
  });

  const [releaseAlertsEnabled, setReleaseAlertsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('gta6_release_alerts_enabled') !== 'false';
  });
  const [activeReleaseAlert, setActiveReleaseAlert] = useState<'24h' | '1h' | null>(null);

  const toggleReleaseAlerts = (enabled: boolean) => {
    setReleaseAlertsEnabled(enabled);
    localStorage.setItem('gta6_release_alerts_enabled', enabled ? 'true' : 'false');
    if (enabled && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const toggleBookmark = (id: string) => {
    playSound('click');
    const updated = bookmarkedIntel.includes(id)
      ? bookmarkedIntel.filter(item => item !== id)
      : [...bookmarkedIntel, id];
    setBookmarkedIntel(updated);
    localStorage.setItem('gta6_bookmarked_intel', JSON.stringify(updated));
  };

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  const t = translations[language];

  useEffect(() => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = document.createElement('audio');
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.15;
    }

    bgMusicRef.current.src = RADIO_STATIONS[currentStation].url;

    if (!isMuted) {
      bgMusicRef.current.play().catch(() => {
        console.log('Autoplay blocked. Music will start on user interaction.');
      });
    } else {
      bgMusicRef.current.pause();
    }

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
    };
  }, [isMuted, currentStation]);

  const playSound = (type: keyof typeof SOUNDS, volume = 0.2) => {
    if (isMuted) return;
    const audio = document.createElement('audio');
    audio.src = SOUNDS[type];
    audio.volume = volume;
    audio.play().catch(() => {}); // Ignore autoplay blocks
  };

  useEffect(() => {
    // Load mock session from localStorage
    const savedUser = localStorage.getItem('social_club_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Periodically update the mock share count with a random increment (+1 to +3) every 4 seconds
    const interval = setInterval(() => {
      setSharedCount((prev) => {
        const increment = Math.floor(Math.random() * 3) + 1;
        const next = prev + increment;
        localStorage.setItem('gta6_countdown_shared_count', next.toString());
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('social_club_session', JSON.stringify(userData));
    playSound('celebration');
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem('social_club_session');
    playSound('close');
  };

  useEffect(() => {
    // Listen for Twitch Status
    const unsubscribe = onSnapshot(doc(db, 'status', 'twitch'), (doc) => {
      if (doc.exists()) {
        setIsTwitchLive(doc.data().isLive);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    // Keep WebSocket for real-time screen sharing and support notifications for now
    // but move chat to Firestore
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let socket: WebSocket | null = null;
    try {
      if (typeof WebSocket === 'function') {
        socket = new WebSocket(`${protocol}//${window.location.host}`);
        socketRef.current = socket;
        
        socket.onopen = () => {
          socket?.send(JSON.stringify({ type: 'join', user }));
          console.log("CONNECTED");
        };

        socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'support_notification') {
            setSupportNotifications(prev => [message.data, ...prev].slice(0, 5));
            playSound('celebration', 0.3);
            setTimeout(() => {
              setSupportNotifications(prev => prev.filter(n => n.id !== message.data.id));
            }, 10000);
          }
        };
      }
    } catch (e) {
      console.error('Failed to create WebSocket for creator notifications', e);
    }

    return () => {
      socket?.close();
    };
  }, [user]);

  const handleSubscribe = (planId: string) => {
    setSubscriptionPlan(planId);
    setIsSubscriptionModalOpen(false);
    playSound('celebration');
    setNotifications(prev => [
      { id: Date.now().toString(), text: `Subscription upgraded to ${planId.toUpperCase()}!`, type: 'update' },
      ...prev
    ]);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Detect Country - Simplified or removed to avoid Illegal constructor errors
    try {
      // Use a simpler detection if needed, or just skip for now
      const lang = navigator.language;
      if (lang.includes('-')) {
        setUserCountry(lang.split('-')[1].toUpperCase());
      }
    } catch (e) {
      console.error('Failed to detect country', e);
    }

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [language]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = TARGET_DATE.getTime() - now;
      
      // Calculate Progress
      const total = TARGET_DATE.getTime() - START_DATE.getTime();
      const elapsed = now - START_DATE.getTime();
      setProgress(Math.min(Math.max((elapsed / total) * 100, 0), 100));
      
      if (difference > 0) {
        const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hoursPart = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutesPart = Math.floor((difference / 1000 / 60) % 60);
        const secondsPart = Math.floor((difference / 1000) % 60);

        setTimeLeft({
          years: Math.floor(totalDays / 365),
          days: totalDays % 365,
          hours: hoursPart,
          minutes: minutesPart,
          seconds: secondsPart,
        });

        // Countdown release alerts check
        if (releaseAlertsEnabled) {
          const hoursLeft = totalDays * 24 + hoursPart;
          
          // 24 Hours Alert
          if (hoursLeft <= 24 && hoursLeft > 1) {
            if (!localStorage.getItem('gta6_alert_24h_shown')) {
              localStorage.setItem('gta6_alert_24h_shown', 'true');
              setActiveReleaseAlert('24h');
              playSound('celebration', 0.5);
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('GTA VI: 24 Hours Left!', {
                  body: 'Only 24 hours left until the historic launch of Grand Theft Auto VI! Get ready to return to Vice City.',
                  icon: '/favicon.ico'
                });
              }
            }
          }
          
          // 1 Hour Alert
          if (hoursLeft <= 1 && hoursLeft >= 0) {
            if (!localStorage.getItem('gta6_alert_1h_shown')) {
              localStorage.setItem('gta6_alert_1h_shown', 'true');
              setActiveReleaseAlert('1h');
              playSound('hack', 0.5);
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('GTA VI: THE FINAL HOUR!', {
                  body: 'THE FINAL HOUR! Only 1 hour remains until Grand Theft Auto VI is unleashed! Start your engines.',
                  icon: '/favicon.ico'
                });
              }
            }
          }
        }

        // Update Hack Phase based on weeks remaining
        const weeksLeft = Math.floor(totalDays / 7);
        if (weeksLeft > 4) setHackPhase(1);
        else if (weeksLeft > 1) setHackPhase(2);
        else setHackPhase(3);
      } else {
        setTimeLeft({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!isReleased) {
          setIsReleased(true);
          if (isHackMode) {
            playSound('hack', 0.5);
          } else {
            playSound('celebration', 0.4);
          }
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(() => {
      calculateTimeLeft();
      playSound('tick', 0.05);
    }, 1000);

    // Artificial delay for cinematic loading effect
    const loadingTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 2500);

    return () => {
      clearInterval(timer);
      clearTimeout(loadingTimer);
    };
  }, []);

  console.log("Render End");
  return (
    <AnimatePresence mode="wait">
      {!isLoaded || !timeLeft ? (
        <LoadingScreen key="loading" />
      ) : (
        <motion.div 
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F27D26] selection:text-black overflow-hidden relative"
        >
      {/* Notification Bar */}
      <AnimatePresence>
        {user && showNotifications && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-[#F27D26] text-black py-2 px-4 flex items-center justify-between overflow-hidden shadow-lg shadow-[#F27D26]/20"
          >
            <div className="flex items-center gap-4 overflow-hidden flex-1">
              <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] whitespace-nowrap border-r border-black/20 pr-4">
                <Bell size={12} className="animate-bounce" />
                Live Updates
              </div>
              <div className="flex gap-8 animate-marquee whitespace-nowrap">
                {notifications.map(n => (
                  <span key={n.id} className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                    <Info size={10} />
                    {n.text}
                  </span>
                ))}
                {/* Duplicate for seamless loop */}
                {notifications.map(n => (
                  <span key={`dup-${n.id}`} className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                    <Info size={10} />
                    {n.text}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 pl-4 border-l border-black/20">
              <span className="text-[8px] font-black uppercase opacity-60 hidden sm:block">System: Active</span>
              <button 
                onClick={() => {
                  setShowNotifications(false);
                  playSound('close');
                }}
                className="p-1 hover:bg-black/10 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Twitch Live Bar */}
      <AnimatePresence>
        {isTwitchLive && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: (user && showNotifications) ? 40 : 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[55] bg-[#9146FF] text-white py-1 px-4 flex items-center justify-center gap-4 shadow-lg shadow-[#9146FF]/20"
          >
            <div className="flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest">bryan16767 IS LIVE ON TWITCH!</span>
            </div>
            <a 
              href="https://twitch.tv/bryan16767" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-[9px] font-black uppercase tracking-widest rounded transition-colors flex items-center gap-1"
            >
              Watch Now <ExternalLink size={10} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Cinematic Background Layer */}
      <div className={`absolute inset-0 z-0 overflow-hidden transition-colors duration-1000 ${isHackMode ? 'bg-[#1a0b1a]' : 'bg-[#050505]'}`}>
        {/* Parallax Image */}
        <motion.div 
          animate={{ 
            x: mousePos.x, 
            y: mousePos.y,
            scale: isHackMode ? 1.2 : 1.1,
            filter: isHackMode ? 'hue-rotate(280deg) contrast(1.2) brightness(0.8)' : 'none'
          }}
          transition={{ type: "tween", ease: "linear", duration: 0.5 }}
          className="absolute inset-[-50px]"
        >
          <motion.img
            animate={{ 
              scale: isHackMode ? [1.2, 1.25, 1.2] : [1, 1.05, 1],
              rotate: isHackMode ? [0, 2, 0] : [0, 1, 0]
            }}
            transition={{ 
              duration: isHackMode ? 5 : 20, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            src="https://picsum.photos/seed/gta-vi-ultra-realistic/1920/1080"
            alt="Realistic Vice City"
            className={`w-full h-full object-cover ${isHackMode ? 'opacity-30' : 'opacity-50'}`}
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {isHackMode && (
          <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
            <div className="absolute inset-0 animate-glitch-bg opacity-10 bg-pink-500/10" />
          </div>
        )}

        {/* Background Realistic Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            className="text-[30vw] font-black uppercase italic tracking-tighter whitespace-nowrap"
          >
            REALISTA
          </motion.span>
        </div>

        {/* Animated Light Shafts */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              rotate: [-45, -40, -45],
              x: [-100, 0, -100]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-50%] left-[-20%] w-[150%] h-[200%] bg-gradient-to-r from-transparent via-[#F27D26]/10 to-transparent skew-x-12 blur-3xl"
          />
          <motion.div 
            animate={{ 
              opacity: [0.05, 0.2, 0.05],
              rotate: [-35, -30, -35],
              x: [100, 0, 100]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[-50%] right-[-20%] w-[150%] h-[200%] bg-gradient-to-l from-transparent via-purple-500/5 to-transparent -skew-x-12 blur-3xl"
          />
        </div>

        {/* Cinematic Vignette & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] opacity-60" />
        
        {/* Film Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

        {/* Thematic Silhouettes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <Palmtree 
            size={600} 
            className="absolute -bottom-20 -left-40 text-white rotate-12 blur-sm" 
          />
          <Palmtree 
            size={400} 
            className="absolute -bottom-10 -right-20 text-white -rotate-12 blur-sm" 
          />
          <div className="absolute top-10 left-10 opacity-20 flex items-center gap-1">
            <div className="w-8 h-8 border-2 border-white flex items-center justify-center rounded-sm">
              <Star size={16} className="fill-white" />
            </div>
            <span className="text-xs font-black tracking-tighter">GAMES</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-[#F27D26] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-70">{t.home.releaseWindow}</span>
          </div>
          
          <h1 className="text-[15vw] md:text-[12vw] font-black leading-[0.85] tracking-tighter uppercase italic select-none">
            GTA <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#F27D26] to-[#D15D14]">6</span>
          </h1>
          
          <p className="mt-4 text-sm md:text-base font-medium tracking-[0.3em] uppercase opacity-50">
            {t.home.location}
          </p>
          
          {userCountry && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F27D26]/10 border border-[#F27D26]/20"
            >
              <Globe size={12} className="text-[#F27D26]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F27D26]">
                {t.home.detectedLocation(userCountry)}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Countdown Grid */}
        <div className="w-full max-w-6xl relative">
          {isHackMode && !isReleased && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const maxStars = subscriptionPlan === 'free' ? 3 : 5;
                  if (star > maxStars) return null;
                  
                  const totalDays = timeLeft ? (timeLeft.years * 365 + timeLeft.days) : 999;
                  const starsToShow = totalDays <= 7 ? 5 : totalDays <= 30 ? 4 : totalDays <= 90 ? 3 : totalDays <= 180 ? 2 : 1;
                  const isActive = star <= starsToShow;
                  return (
                    <motion.div
                      key={star}
                      animate={isActive && starsToShow >= 3 ? { 
                        scale: [1, 1.2, 1],
                        filter: ['drop-shadow(0 0 0px rgba(239,68,68,0))', 'drop-shadow(0 0 10px rgba(239,68,68,0.8))', 'drop-shadow(0 0 0px rgba(239,68,68,0))']
                      } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Star 
                        size={24} 
                        className={`${isActive ? 'text-red-600 fill-red-600' : 'text-white/10'} transition-colors duration-500`} 
                      />
                    </motion.div>
                  );
                })}
              </div>
              <div className="px-4 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] italic skew-x-[-12deg] shadow-lg shadow-red-600/20">
                {hackPhase === 1 ? 'Fase 1: Acceso a Vice City' : hackPhase === 2 ? 'Fase 2: Operación en progreso' : 'Fase 3: Ciudad abierta'}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!isReleased ? (
              isHackMode ? (
                <motion.div 
                  key="hack-countdown"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="flex flex-col items-center gap-8"
                >
                  <div className="relative group">
                    <div className="absolute inset-0 bg-red-600/5 blur-3xl group-hover:bg-red-600/10 transition-all duration-500" />
                    <div className="relative bg-black/40 backdrop-blur-3xl border border-red-600/20 p-12 md:p-20 rounded-3xl flex flex-col items-center justify-center overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
                      
                      <div className="text-[10px] uppercase tracking-[0.5em] font-black text-red-500/50 mb-4">
                        System Breach: Total Seconds Remaining
                      </div>

                      <motion.div 
                        className="text-6xl md:text-9xl font-black tracking-tighter tabular-nums text-white drop-shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center"
                      >
                        <span className="text-red-500 mr-2">$</span>
                        {Math.floor((TARGET_DATE.getTime() - Date.now()) / 1000).toLocaleString('en-US', { minimumIntegerDigits: 9, useGrouping: true }).replace(/,/g, ',')}
                      </motion.div>

                      <div className="mt-8 grid grid-cols-2 gap-12">
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-black text-red-500">{timeLeft.years * 365 + timeLeft.days}</span>
                          <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Days</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-black text-red-500">{timeLeft.hours}</span>
                          <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="countdown"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6"
                >
                  <CountdownItem label={t.countdown.years} value={timeLeft.years} />
                  <CountdownItem label={t.countdown.days} value={timeLeft.days} />
                  <CountdownItem label={t.countdown.hours} value={timeLeft.hours} />
                  <CountdownItem label={t.countdown.minutes} value={timeLeft.minutes} />
                  <CountdownItem label={t.countdown.seconds} value={timeLeft.seconds} />
                </motion.div>
              )
            ) : (
              <motion.div
                key="released"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center py-12 px-6 backdrop-blur-2xl border rounded-3xl shadow-2xl ${
                  isHackMode 
                    ? 'bg-red-950/20 border-red-600/30 shadow-red-600/20' 
                    : 'bg-white/5 border-[#F27D26]/30 shadow-[0_0_50px_rgba(242,125,38,0.2)]'
                }`}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4 ${
                    isHackMode ? 'text-red-500' : 'text-[#F27D26]'
                  }`}
                >
                  {isHackMode ? 'BIENVENIDO A VICE CITY' : t.home.welcome}
                </motion.div>
                <p className="text-xl md:text-2xl font-bold uppercase tracking-[0.2em] opacity-80">
                  {t.home.available}
                </p>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className={`h-1 mt-8 ${
                    isHackMode 
                      ? 'bg-gradient-to-r from-transparent via-red-600 to-transparent' 
                      : 'bg-gradient-to-r from-transparent via-[#F27D26] to-transparent'
                  }`}
                />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Release Intel Section */}
          {!isReleased && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Card 1: Official Intel */}
              <div className={`relative p-6 rounded-xl backdrop-blur-md flex flex-col items-center justify-center text-center group transition-all duration-300 border ${
                bookmarkedIntel.includes('official') 
                  ? 'border-[#F27D26]/50 bg-[#F27D26]/5 shadow-[0_0_15px_rgba(242,125,38,0.1)]' 
                  : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
              }`}>
                <button
                  type="button"
                  onClick={() => toggleBookmark('official')}
                  className="absolute top-2.5 right-2.5 p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all duration-200 cursor-pointer z-10"
                  title={bookmarkedIntel.includes('official') ? 'Remove Bookmark' : 'Bookmark Intel'}
                >
                  <Bookmark size={13} className={bookmarkedIntel.includes('official') ? "fill-[#F27D26] text-[#F27D26] scale-110" : "hover:scale-110"} />
                </button>
                <Calendar size={16} className="text-[#F27D26] mb-2" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{t.countdown.intel.title}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{t.countdown.intel.official}</span>
                {bookmarkedIntel.includes('official') && (
                  <span className="text-[7px] text-[#F27D26] font-bold uppercase mt-2 tracking-widest animate-pulse">Saved</span>
                )}
              </div>

              {/* Card 2: Rumor Mill */}
              <div className={`relative p-6 rounded-xl backdrop-blur-md flex flex-col items-center justify-center text-center group transition-all duration-300 border ${
                bookmarkedIntel.includes('rumor') 
                  ? 'border-purple-500/50 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                  : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
              }`}>
                <button
                  type="button"
                  onClick={() => toggleBookmark('rumor')}
                  className="absolute top-2.5 right-2.5 p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all duration-200 cursor-pointer z-10"
                  title={bookmarkedIntel.includes('rumor') ? 'Remove Bookmark' : 'Bookmark Intel'}
                >
                  <Bookmark size={13} className={bookmarkedIntel.includes('rumor') ? "fill-purple-500 text-purple-500 scale-110" : "hover:scale-110"} />
                </button>
                <Sparkles size={16} className="text-purple-500 mb-2" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Rumor Mill</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{t.countdown.intel.rumor1}</span>
                {bookmarkedIntel.includes('rumor') && (
                  <span className="text-[7px] text-purple-400 font-bold uppercase mt-2 tracking-widest animate-pulse">Saved</span>
                )}
              </div>

              {/* Card 3: Source Feed */}
              <div className={`relative p-6 rounded-xl backdrop-blur-md flex flex-col items-center justify-center text-center group transition-all duration-300 border ${
                bookmarkedIntel.includes('source') 
                  ? 'border-blue-500/50 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
              }`}>
                <button
                  type="button"
                  onClick={() => toggleBookmark('source')}
                  className="absolute top-2.5 right-2.5 p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all duration-200 cursor-pointer z-10"
                  title={bookmarkedIntel.includes('source') ? 'Remove Bookmark' : 'Bookmark Intel'}
                >
                  <Bookmark size={13} className={bookmarkedIntel.includes('source') ? "fill-blue-500 text-blue-500 scale-110" : "hover:scale-110"} />
                </button>
                <Info size={16} className="text-blue-500 mb-2" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{t.countdown.intel.source}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{t.countdown.intel.rumor2}</span>
                {bookmarkedIntel.includes('source') && (
                  <span className="text-[7px] text-blue-400 font-bold uppercase mt-2 tracking-widest animate-pulse">Saved</span>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-20 flex flex-col items-center gap-8"
        >
          {isMuted && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#F27D26]"
            >
              Sound Muted • Click Volume Icon to Enable
            </motion.div>
          )}
          
          <div className="flex flex-wrap justify-center gap-8 text-[11px] uppercase tracking-widest font-semibold opacity-40">
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>Leonida State</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>Coming 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>UTC-5</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          <button 
            onClick={() => {
              setIsSubscriptionModalOpen(true);
              playSound('open');
            }}
            onMouseEnter={() => playSound('hover', 0.05)}
            className={`p-3 border transition-all duration-300 rounded-sm cursor-pointer group relative ${
              subscriptionPlan !== 'free'
                ? 'bg-[#F27D26]/20 border-[#F27D26]/40 text-[#F27D26] shadow-[0_0_15px_rgba(242,125,38,0.3)]' 
                : 'border-white/20 hover:border-white/60 text-white'
            }`}
            title={t.nav.premium}
          >
            <Crown size={20} className={subscriptionPlan !== 'free' ? 'animate-pulse' : ''} />
            {subscriptionPlan !== 'free' && (
              <motion.div 
                layoutId="premium-glow"
                className="absolute inset-0 bg-[#F27D26]/10 blur-md -z-10"
              />
            )}
          </button>
          <button 
            onClick={() => {
              setIsYouTubeOpen(true);
              playSound('open');
            }}
            onMouseEnter={() => playSound('hover', 0.05)}
            className="px-8 py-3 bg-[#F27D26] text-white font-bold uppercase tracking-tighter hover:bg-white hover:text-black transition-all duration-300 rounded-sm cursor-pointer shadow-[0_0_20px_rgba(242,125,38,0.3)]"
          >
            {t.nav.officialTrailer}
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setLanguage(language === 'en' ? 'es' : 'en');
                playSound('click');
              }}
              onMouseEnter={() => playSound('hover', 0.05)}
              className="p-3 border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-300 rounded-sm cursor-pointer group flex items-center gap-2"
              title={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
            >
              <Languages size={20} />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">
                {language === 'en' ? 'ES' : 'EN'}
              </span>
            </button>
            {user && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex flex-col items-end mr-2"
              >
                <span className="text-[10px] font-black uppercase italic tracking-tighter text-[#F27D26]">
                  {user.role === 'creator' ? t.auth.masterCreator : t.auth.socialClub}
                </span>
                <span className="text-[12px] font-bold text-white/80">{user.name}</span>
              </motion.div>
            )}
            <button 
              onClick={() => {
                if (user) {
                  handleLogout();
                } else {
                  setIsAuthOpen(true);
                  playSound('open');
                }
              }}
              onMouseEnter={() => playSound('hover', 0.05)}
              className="p-3 border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-300 rounded-sm cursor-pointer group flex items-center gap-2"
              title={user ? t.nav.logOut : t.nav.signIn}
            >
              <Tooltip content={user ? t.tooltips.logOut : t.tooltips.signIn} position="top">
                {user ? <LogOut size={20} /> : <User size={20} />}
              </Tooltip>
            </button>
            {user && (
              <button 
                onClick={() => {
                  setIsLiveChatOpen(!isLiveChatOpen);
                  playSound(isLiveChatOpen ? 'close' : 'open');
                }}
                onMouseEnter={() => playSound('hover', 0.05)}
                className={`p-3 border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-300 rounded-sm cursor-pointer group flex items-center gap-2 ${isLiveChatOpen ? 'bg-[#F27D26]/20 border-[#F27D26]/40 text-[#F27D26]' : ''}`}
                title={t.liveChat.button}
              >
                <Tooltip content={t.tooltips.liveChat} position="top">
                  <Users size={20} />
                </Tooltip>
              </button>
            )}
          </div>
          <Tooltip content={t.tooltips.creatorLab} position="top">
            <button 
              onClick={() => {
                setIsCreatorLabOpen(true);
                playSound('open');
              }}
              onMouseEnter={() => playSound('hover', 0.05)}
              className="p-3 border border-[#F27D26]/40 bg-[#F27D26]/10 text-[#F27D26] hover:bg-[#F27D26] hover:text-white transition-all duration-300 rounded-sm cursor-pointer group relative"
              title={t.nav.creatorLab}
            >
              <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
              {user && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"
                />
              )}
            </button>
          </Tooltip>
          <Tooltip content={t.tooltips.radio} position="top">
            <button 
              onClick={() => {
                setIsRadioOpen(true);
                playSound('open');
              }}
              onMouseEnter={() => playSound('hover', 0.05)}
              className={`p-3 border transition-all duration-300 rounded-sm cursor-pointer group relative ${
                isRadioOpen 
                  ? 'bg-purple-600/20 border-purple-600/40 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                  : 'border-white/20 hover:border-white/60 text-white'
              }`}
              title={t.nav.radio}
            >
              <Radio size={20} className={!isMuted ? 'animate-pulse' : ''} />
              {!isMuted && (
                <motion.div 
                  layoutId="radio-glow"
                  className="absolute inset-0 bg-purple-600/10 blur-md -z-10"
                />
              )}
            </button>
          </Tooltip>
          
          {/* GTA 5 Price Button */}
          <Tooltip content={t.tooltips.gta5Price} position="top">
            <button 
              onClick={() => {
                setIsGTA5PriceOpen(true);
                playSound('open');
              }}
              onMouseEnter={() => playSound('hover', 0.05)}
              className="p-3 border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-300 rounded-sm cursor-pointer group flex items-center gap-2"
              title={t.countdown.gta5.button}
            >
              <Tag size={20} />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">
                GTA V
              </span>
            </button>
          </Tooltip>

          <Tooltip content={t.tooltips.googleDocs} position="top">
            <button 
              onClick={() => {
                setIsGoogleDocsOpen(true);
                playSound('open');
              }}
              onMouseEnter={() => playSound('hover', 0.05)}
              className="p-3 border border-white/20 hover:border-[#4285F4] text-[#4285F4] bg-[#4285F4]/5 transition-colors duration-300 rounded-sm cursor-pointer flex items-center justify-center group"
            >
              <FileText size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </Tooltip>

          <Tooltip content={t.tooltips.settings} position="top">
            <button 
              onClick={() => {
                setIsSettingsOpen(true);
                playSound('open');
              }}
              onMouseEnter={() => playSound('hover', 0.05)}
              className="p-3 border border-white/20 hover:border-white/60 transition-colors duration-300 rounded-sm cursor-pointer"
            >
              <Settings size={20} />
            </button>
          </Tooltip>
          <Tooltip content={t.tooltips.hackMode} position="top">
            <button 
              onClick={() => {
                setIsHackMode(!isHackMode);
                playSound(isHackMode ? 'close' : 'open');
              }}
              onMouseEnter={() => playSound('hover', 0.05)}
              className={`p-3 border transition-all duration-300 rounded-sm cursor-pointer group relative ${
                isHackMode 
                  ? 'bg-red-600/20 border-red-600/40 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                  : 'border-white/20 hover:border-white/60 text-white'
              }`}
              title="Vice City Hack Mode"
            >
              <Lock size={20} className={isHackMode ? 'animate-pulse' : ''} />
              {isHackMode && (
                <motion.div 
                  layoutId="hack-glow"
                  className="absolute inset-0 bg-red-600/10 blur-md -z-10"
                />
              )}
            </button>
          </Tooltip>
          <Tooltip content={t.tooltips.mute} position="top">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              onMouseEnter={() => playSound('hover', 0.05)}
              className="p-3 border border-white/20 hover:border-white/60 transition-colors duration-300 rounded-sm cursor-pointer"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </Tooltip>
          <Tooltip content={t.tooltips.share} position="top">
            <button 
              onClick={() => {
                setIsShareModalOpen(true);
                playSound('open');
              }}
              onMouseEnter={() => playSound('hover', 0.05)}
              className="p-3 border border-white/20 hover:border-white/60 transition-colors duration-300 rounded-sm cursor-pointer"
            >
              <Share2 size={20} />
            </button>
          </Tooltip>
        </motion.div>
      </main>

      {/* Creator Lab Modal */}
      <CreatorLab 
        isOpen={isCreatorLabOpen} 
        onClose={() => setIsCreatorLabOpen(false)} 
        playSound={playSound}
        user={user}
        language={language}
        socket={socketRef.current}
      />

      {/* GTA 5 Price Modal */}
      <AnimatePresence>
        {isGTA5PriceOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGTA5PriceOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F27D26]/10 rounded-lg">
                    <Tag size={20} className="text-[#F27D26]" />
                  </div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">{t.countdown.gta5.title}</h3>
                </div>
                <button 
                  onClick={() => setIsGTA5PriceOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-3xl font-black text-[#F27D26] tracking-tighter">
                    {t.countdown.gta5.price}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                    {t.countdown.gta5.platforms}
                  </p>
                </div>
                
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/60">
                    <span>Steam</span>
                    <span className="text-white">$29.99</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/60">
                    <span>PlayStation Store</span>
                    <span className="text-white">$19.99</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/60">
                    <span>Xbox Store</span>
                    <span className="text-white">$14.99</span>
                  </div>
                </div>

                <p className="text-[9px] text-center uppercase tracking-widest text-white/20 italic">
                  * Prices may vary based on region and active sales.
                </p>
              </div>

              <div className="p-4 bg-white/5 border-t border-white/10 flex justify-center">
                <button 
                  onClick={() => setIsGTA5PriceOpen(false)}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                >
                  {t.ui.complete}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={(userData) => {
          handleLogin(userData);
          setIsAuthOpen(false);
          setShowReward(true);
          setShowNotifications(true);
          setTimeout(() => setShowReward(false), 5000);
        }}
        playSound={playSound}
        language={language}
      />

      {/* Reward Notification */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-8 z-[150] bg-[#F27D26] p-4 rounded-xl shadow-2xl border border-white/20 flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-lg">
              <Star className="text-[#F27D26] fill-[#F27D26]" size={24} />
            </div>
            <div>
              <h4 className="text-white font-black uppercase italic tracking-tighter text-sm">
                {user?.role === 'creator' ? t.rewards.creatorActive : t.rewards.unlocked}
              </h4>
              <p className="text-black/60 text-[10px] uppercase font-bold tracking-widest">
                {user?.role === 'creator' ? t.rewards.accessGranted : t.rewards.intelEnabled}
              </p>
            </div>
            <button 
              onClick={() => setShowReward(false)}
              className="ml-4 text-white/40 hover:text-white"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support Notification Button (Members only) */}
      <SupportButton user={user} playSound={playSound} language={language} />

      {/* Creator Support Notifications */}
      <div className="fixed top-24 right-8 z-[150] pointer-events-none space-y-4">
        <AnimatePresence>
          {supportNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="pointer-events-auto bg-[#F27D26] text-white p-4 rounded-xl shadow-2xl border-2 border-white/20 flex items-center gap-4 min-w-[250px]"
            >
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Bell className="text-[#F27D26]" size={20} />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-black/60">
                  {translations[language].chat.supportNotification}
                </h4>
                <p className="text-xs font-bold">
                  {translations[language].chat.supportFrom(notif.user.name)}
                </p>
              </div>
              <button 
                onClick={() => setSupportNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="ml-auto p-1 hover:bg-black/20 rounded"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Live Community Chat */}
      <LiveChat 
        user={user} 
        language={language} 
        playSound={playSound} 
        isOpen={isLiveChatOpen}
        setIsOpen={setIsLiveChatOpen}
      />

      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)} 
        language={language}
        onSubscribe={handleSubscribe}
        currentPlan={subscriptionPlan}
        playSound={playSound}
      />

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => {
              setIsShareModalOpen(false);
              playSound('close');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold uppercase tracking-widest">{t.share.title}</h2>
                <button 
                  onClick={() => {
                    setIsShareModalOpen(false);
                    playSound('close');
                  }} 
                  className="opacity-50 hover:opacity-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Shared Count Feature */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Share2 className="w-5.5 h-5.5 text-[#F27D26]" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/45">
                      {t.share.totalShares}
                    </span>
                    <span className="text-lg font-black font-mono text-white tracking-widest">
                      {sharedCount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest animate-pulse">
                    ● {t.share.liveUpdates}
                  </span>
                  <p className="text-[8px] text-white/30 uppercase tracking-widest">
                    {language === 'en' ? 'Synced live' : 'Sincronizado'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    const text = encodeURIComponent(t.share.tweet(timeLeft?.days || 0));
                    const url = encodeURIComponent(window.location.href);
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                    playSound('click');
                    setSharedCount(prev => prev + 1);
                  }}
                  className="py-4 bg-[#1DA1F2] text-white font-bold rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Twitter size={20} />
                  <span className="text-[10px] uppercase tracking-widest">{t.share.twitter.split(' ')[2] || 'Twitter'}</span>
                </button>
                
                <button 
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                    playSound('click');
                    setSharedCount(prev => prev + 1);
                  }}
                  className="py-4 bg-[#1877F2] text-white font-bold rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Facebook size={20} />
                  <span className="text-[10px] uppercase tracking-widest">{t.share.facebook.split(' ')[2] || 'Facebook'}</span>
                </button>

                <button 
                  onClick={() => {
                    const text = encodeURIComponent(t.share.tweet(timeLeft?.days || 0));
                    const url = encodeURIComponent(window.location.href);
                    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                    playSound('click');
                    setSharedCount(prev => prev + 1);
                  }}
                  className="py-4 bg-[#25D366] text-white font-bold rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <MessageCircle size={20} />
                  <span className="text-[10px] uppercase tracking-widest">WhatsApp</span>
                </button>

                <button 
                  onClick={() => {
                    const text = encodeURIComponent(t.share.tweet(timeLeft?.days || 0));
                    const url = encodeURIComponent(window.location.href);
                    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
                    playSound('click');
                    setSharedCount(prev => prev + 1);
                  }}
                  className="py-4 bg-[#0088cc] text-white font-bold rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Send size={20} />
                  <span className="text-[10px] uppercase tracking-widest">Telegram</span>
                </button>

                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    playSound('click');
                    alert(t.share.copied);
                    setSharedCount(prev => prev + 1);
                  }}
                  className="py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <Link2 size={20} />
                  <span className="text-[10px] uppercase tracking-widest">{t.share.copyLink.split(' ')[1] || 'Link'}</span>
                </button>

                {navigator.share && (
                  <button 
                    onClick={async () => {
                      try {
                        await navigator.share({
                          title: 'GTA 6 Countdown',
                          text: t.share.tweet(timeLeft?.days || 0),
                          url: window.location.href,
                        });
                        playSound('celebration');
                        setSharedCount(prev => prev + 1);
                      } catch (err) {
                        console.error('Share failed:', err);
                      }
                    }}
                    className="py-4 bg-[#F27D26] text-white font-bold rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink size={20} />
                    <span className="text-[10px] uppercase tracking-widest">{t.share.more.split(' ')[1] || 'More'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Radio Modal */}
      <AnimatePresence>
        {isRadioOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => {
              setIsRadioOpen(false);
              playSound('close');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Glow */}
              <div 
                className="absolute top-0 left-0 w-full h-1 transition-colors duration-500" 
                style={{ backgroundColor: RADIO_STATIONS[currentStation].color }}
              />
              
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Radio className="text-white/40" size={20} />
                  <h2 className="text-xl font-bold uppercase tracking-widest">{t.radio.title}</h2>
                </div>
                <button 
                  onClick={() => {
                    setIsRadioOpen(false);
                    playSound('close');
                  }} 
                  className="opacity-50 hover:opacity-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {RADIO_STATIONS.map((station, index) => (
                  <button
                    key={station.id}
                    onClick={() => {
                      if (currentStation !== index) {
                        setCurrentStation(index);
                        playSound('radio_switch');
                        if (isMuted) setIsMuted(false);
                      }
                    }}
                    className={`w-full p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                      currentStation === index 
                        ? 'bg-white/10 border-white/20 shadow-lg' 
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-500 ${
                          currentStation === index ? 'scale-110 rotate-3' : 'group-hover:scale-105'
                        }`}
                        style={{ backgroundColor: station.color }}
                      >
                        <Volume2 className="text-white" size={24} />
                      </div>
                      <div className="text-left">
                        <h3 className={`font-black uppercase tracking-tighter italic text-lg ${
                          currentStation === index ? 'text-white' : 'text-white/60'
                        }`}>
                          {(t.radio.stations as any)[station.nameKey]}
                        </h3>
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">
                          {station.desc}
                        </p>
                      </div>
                    </div>
                    {currentStation === index && !isMuted && (
                      <div className="flex gap-1 items-end h-4">
                        {[1, 2, 3, 4].map(i => (
                          <motion.div
                            key={i}
                            animate={{ height: [4, 16, 4] }}
                            transition={{ 
                              duration: 0.5 + Math.random() * 0.5, 
                              repeat: Infinity,
                              delay: i * 0.1
                            }}
                            className="w-1 bg-white rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-full transition-colors ${
                      isMuted ? 'bg-white/5 text-white/40' : 'bg-white/10 text-white'
                    }`}
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <div>
                    <p className="text-[8px] uppercase font-black tracking-[0.2em] opacity-40">{t.radio.nowPlaying}</p>
                    <p className="text-xs font-bold uppercase tracking-widest">
                      {isMuted ? t.radio.off : (t.radio.stations as any)[RADIO_STATIONS[currentStation].nameKey]}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">FM STEREO</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Docs Modal */}
      <AnimatePresence>
        {isGoogleDocsOpen && (
          <GoogleDocsModal
            isOpen={isGoogleDocsOpen}
            onClose={() => setIsGoogleDocsOpen(false)}
            language={language}
            playSound={playSound}
            daysRemaining={Math.max(0, Math.floor((TARGET_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        setLanguage={setLanguage}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        uiDensity={uiDensity}
        setUiDensity={setUiDensity}
        theme={theme}
        setTheme={setTheme}
        playSound={playSound}
        releaseAlertsEnabled={releaseAlertsEnabled}
        setReleaseAlertsEnabled={toggleReleaseAlerts}
        onSimulateAlert={(type) => setActiveReleaseAlert(type)}
      />

      {/* YouTube Trailer Modal */}
      <YouTubeTrailer 
        isOpen={isYouTubeOpen}
        onClose={() => setIsYouTubeOpen(false)}
        videoId="VQRLujxTm3c"
        playSound={playSound}
      />

      {/* Holiday Countdown */}
      <HolidayCountdown language={language} />

      {/* Release Alert Pop-up */}
      <AnimatePresence>
        {activeReleaseAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          >
            {/* Ambient Background Glow matching the warning level */}
            <div className={`absolute inset-0 opacity-15 pointer-events-none transition-all duration-500 bg-[radial-gradient(circle_at_center,${
              activeReleaseAlert === '24h' ? '#F27D26' : '#FF00FF'
            }_0%,transparent_70%)]`} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className={`bg-[#0a0a0a] border-2 p-8 md:p-12 rounded-3xl max-w-2xl w-full text-center relative overflow-hidden shadow-2xl ${
                activeReleaseAlert === '24h' ? 'border-[#F27D26]/40 shadow-[#F27D26]/10' : 'border-pink-500/40 shadow-pink-500/10'
              }`}
            >
              {/* Scanlines inside alert */}
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
              
              {/* Pulsing Alert Icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center border-2 mb-6 ${
                  activeReleaseAlert === '24h' 
                    ? 'bg-[#F27D26]/10 border-[#F27D26] text-[#F27D26]' 
                    : 'bg-pink-500/10 border-pink-500 text-pink-500'
                }`}
              >
                <Bell size={40} className="animate-pulse" />
              </motion.div>

              <h2 className={`text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-4 ${
                activeReleaseAlert === '24h' ? 'text-[#F27D26]' : 'text-pink-500'
              }`}>
                {activeReleaseAlert === '24h' 
                  ? (language === 'es' ? 'ALERTA DE 24 HORAS' : '24-HOUR COUNTDOWN ALERT')
                  : (language === 'es' ? '¡LA HORA FINAL!' : 'THE FINAL HOUR ALERT')
                }
              </h2>

              <p className="text-sm md:text-base text-zinc-300 font-semibold uppercase tracking-wider mb-8 leading-relaxed">
                {activeReleaseAlert === '24h'
                  ? (language === 'es' 
                      ? '¡Solo quedan 24 horas para el lanzamiento histórico de Grand Theft Auto VI! Prepárate para regresar a Vice City.' 
                      : 'Only 24 hours left until the historic launch of Grand Theft Auto VI! Get ready to return to Vice City.')
                  : (language === 'es' 
                      ? '¡Inicia tus motores! Queda exactamente 1 hora para que comience el caos en Vice City. El juego de la década está por llegar.' 
                      : 'Start your engines! Exactly 1 hour remains until the chaos begins in Vice City. The game of the decade is about to unfold.')
                }
              </p>

              {/* Real-time precise target info display */}
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl mb-8 flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  {language === 'es' ? 'FECHA OBJETIVO DE LANZAMIENTO' : 'TARGET LAUNCH DATE'}
                </span>
                <span className="text-xl md:text-2xl font-black text-white tracking-widest uppercase italic">
                  {language === 'es' ? '19 de Noviembre, 2026' : 'November 19, 2026'}
                </span>
                <span className="text-xs font-mono text-zinc-400 mt-2">
                  {language === 'es' ? 'Localización: Global' : 'Deployment: Global'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setActiveReleaseAlert(null);
                    playSound('celebration', 0.3);
                  }}
                  className={`flex-1 py-4 px-6 font-black uppercase italic tracking-widest rounded-xl text-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${
                    activeReleaseAlert === '24h' ? 'bg-[#F27D26]' : 'bg-pink-500'
                  }`}
                >
                  {language === 'es' ? 'CONFIRMAR Y CERRAR' : 'ACKNOWLEDGE & DISMISS'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Elements */}
      <div className="fixed bottom-8 left-8 z-20 hidden lg:block">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">{t.ui.liveFromLeonida}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest opacity-20 font-bold">{t.ui.signalEncrypted}</span>
            <span className="text-[9px] uppercase tracking-widest opacity-20 font-bold">{t.ui.sourceNetwork}</span>
          </div>
        </div>
      </div>

      <div className="fixed top-8 right-8 z-20 hidden lg:block">
        <div className="text-right flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 opacity-30">
            <Star size={10} className="fill-current" />
            <span className="text-[10px] uppercase tracking-widest font-mono">Version 1.0.5</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest opacity-30 font-mono block">Build 2026.11.19</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-white/5 z-30">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#F27D26] to-[#D15D14] relative shadow-[0_0_10px_rgba(242,125,38,0.5)]"
        >
          <div className="absolute right-0 top-[-20px] text-[8px] font-mono uppercase tracking-widest opacity-40 pr-2">
            {progress.toFixed(2)}% {t.ui.complete}
          </div>
        </motion.div>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CountdownItem({ label, value }: { label: string; value: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-[#F27D26]/5 blur-2xl group-hover:bg-[#F27D26]/10 transition-all duration-500" />
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F27D26]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-5xl md:text-7xl font-black tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(242,125,38,0.3)]"
          >
            {value.toString().padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
        
        <span className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold opacity-40 group-hover:opacity-100 group-hover:text-[#F27D26] transition-all">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

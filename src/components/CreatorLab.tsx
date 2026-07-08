import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Video, Sparkles, Loader2, Download, Upload, AlertCircle, Radio, Camera, Play, Pause, Volume2, VolumeX, Share2, File, Trash2, Lock, Users, ShieldCheck, Globe, Twitter, Facebook, MessageCircle, Send, Link2, User, Bell, Check, Ban, Trophy, Map, Terminal } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp, collection, onSnapshot, query, orderBy, deleteDoc } from 'firebase/firestore';
import { translations } from '../translations';

import { Tooltip as AppTooltip } from './Tooltip';

interface CreatorLabProps {
  isOpen: boolean;
  onClose: () => void;
  playSound: (type: any, volume?: number) => void;
  user: { name: string; email: string; avatar: string; role?: 'creator' | 'member' | 'moderator' } | null;
  language: 'en' | 'es';
  socket?: WebSocket | null;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

function CustomVideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedProgress = (x / rect.width);
      videoRef.current.currentTime = clickedProgress * videoRef.current.duration;
    }
  };

  return (
    <div className="relative group w-full h-full">
      <video 
        ref={videoRef}
        src={src} 
        autoPlay 
        loop 
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-full object-cover"
      />
      
      {/* Custom Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        {/* Progress Bar */}
        <div 
          className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer relative overflow-hidden"
          onClick={handleProgressClick}
        >
          <motion.div 
            className="absolute top-0 left-0 h-full bg-[#F27D26] shadow-[0_0_10px_rgba(242,125,38,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button 
              onClick={toggleMute}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/60">
            Leonida Media Player
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorLab({ isOpen, onClose, playSound, user, language, socket }: CreatorLabProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'character' | 'mission' | 'live' | 'social' | 'users' | 'support' | 'analytics' | 'achievements' | 'map' | 'soundtrack'>('image');
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsHistory, setAnalyticsHistory] = useState<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('A cinematic shot of a neon-lit Vice City street at night, GTA 6 style, ultra realistic, 8k');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [selectedStyle, setSelectedStyle] = useState<'neon' | 'retro' | 'cinematic' | 'noir' | 'vibrant'>('cinematic');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Character Generation State
  const [characterPrompt, setCharacterPrompt] = useState('');
  const [generatedCharacter, setGeneratedCharacter] = useState<{
    name: string;
    role: string;
    background: string;
    traits: string[];
    outfit: string;
    image?: string;
  } | null>(null);

  // Mission Generation State
  const [missionPrompt, setMissionPrompt] = useState('');
  const [generatedMission, setGeneratedMission] = useState<{
    title: string;
    objective: string;
    difficulty: string;
    payout: string;
    briefing: string;
  } | null>(null);

  // Video Generation State
  const [videoPrompt, setVideoPrompt] = useState('The camera pans across the beach as the sun sets, cinematic lighting');
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>('720p');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Broadcast State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [liveVideoUrl, setLiveVideoUrl] = useState<string | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState('VICE CITY PATROL');
  const [viewerCount, setViewerCount] = useState(1240);
  const [newestSubscriber, setNewestSubscriber] = useState('TommyV_86');
  const [showTitleCard, setShowTitleCard] = useState(true);
  const [showViewerCount, setShowViewerCount] = useState(true);
  const [showSubAlert, setShowSubAlert] = useState(true);
  const [isTwitchLive, setIsTwitchLive] = useState(false);
  const [activeBroadcasters, setActiveBroadcasters] = useState<any[]>([]);
  const [activeScreenShares, setActiveScreenShares] = useState<any[]>([]);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [remoteFrames, setRemoteFrames] = useState<Record<string, string>>({});
  const screenCaptureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  React.useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      if (message.type === 'broadcasters_update') {
        setActiveBroadcasters(message.data);
      } else if (message.type === 'screen_shares_update') {
        setActiveScreenShares(message.data);
      } else if (message.type === 'screen_share_frame') {
        setRemoteFrames(prev => ({
          ...prev,
          [message.from]: message.frame
        }));
      } else if (message.type === 'ban_list_update') {
        setBannedUsers(message.data);
      } else if (message.type === 'twitch_status_update') {
        setIsTwitchLive(message.isLive);
      } else if (message.type === 'analytics_update') {
        setAnalyticsData(message.data);
        setAnalyticsHistory(prev => {
          const newHistory = [...prev, {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            users: message.data.activeUsers,
            traffic: message.data.traffic
          }].slice(-20); // Keep last 20 data points
          return newHistory;
        });
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket]);

  const toggleScreenShare = async () => {
    if (isSharingScreen) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: false
      });
      
      screenStreamRef.current = stream;
      setIsSharingScreen(true);
      
      if (socket) {
        socket.send(JSON.stringify({ type: 'screen_share_start', user }));
      }

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      screenCaptureIntervalRef.current = setInterval(() => {
        if (ctx && video.videoWidth > 0) {
          canvas.width = 480; // Lower resolution for performance
          canvas.height = (video.videoHeight / video.videoWidth) * 480;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frame = canvas.toDataURL('image/jpeg', 0.5);
          if (socket) {
            socket.send(JSON.stringify({ type: 'screen_share_frame', user, frame }));
          }
        }
      }, 1000); // Send frame every second

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      playSound('open');
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  const stopScreenShare = () => {
    if (screenCaptureIntervalRef.current) {
      clearInterval(screenCaptureIntervalRef.current);
      screenCaptureIntervalRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsSharingScreen(false);
    if (socket) {
      socket.send(JSON.stringify({ type: 'screen_share_stop', user }));
    }
    playSound('close');
  };

  React.useEffect(() => {
    if (activeTab === 'live' && showViewerCount) {
      const interval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 21) - 10);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, showViewerCount]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const liveFileInputRef = useRef<HTMLInputElement>(null);

  // Social Feed State
  const [communityUploads, setCommunityUploads] = useState<{id: string, name: string, type: string, size: string, date: string, user: string, userId: string}[]>([]);
  const socialFileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    
    const q = query(collection(db, 'uploads'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const uploads = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as any[];
      setCommunityUploads(uploads);
    });

    return () => unsubscribe();
  }, [isOpen]);

  // User Management State (Creator Only)
  const [registeredUsers, setRegisteredUsers] = useState<{email: string, username: string, role: string, last_login: string}[]>([]);
  const [modRequests, setModRequests] = useState<{email: string, username: string, status: string, timestamp: string}[]>([]);
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Sharing Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareAsset, setShareAsset] = useState<{ url: string, type: 'image' | 'video' } | null>(null);

  // Location Tracking State
  const [locationStatus, setLocationStatus] = useState<'idle' | 'tracking' | 'error'>('idle');
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  // Build State
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<{ id: string; text: string; type: 'info' | 'success' | 'warning' }[]>([]);

  const runBuild = async () => {
    setIsBuilding(true);
    setBuildLogs([]);
    playSound('click');

    const addLog = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
      setBuildLogs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), text, type }]);
    };

    // Build Sequence
    addLog('Build', 'info');
    await new Promise(r => setTimeout(r, 800));
    
    addLog(translations[language].creatorLab.build.logs.start, 'info');
    await new Promise(r => setTimeout(r, 1200));
    
    addLog(translations[language].creatorLab.build.connected, 'success');
    playSound('success');
    await new Promise(r => setTimeout(r, 1000));
    
    addLog(translations[language].creatorLab.build.logs.end, 'info');
    await new Promise(r => setTimeout(r, 600));
    
    addLog('Build', 'success');
    await new Promise(r => setTimeout(r, 400));
    
    addLog('Build', 'success');
    setIsBuilding(false);
    playSound('complete');
  };

  React.useEffect(() => {
    if (isOpen && user && user.role !== 'creator') {
      startLocationTracking();
    }
    return () => stopLocationTracking();
  }, [isOpen, user]);

  const startLocationTracking = () => {
    if ("geolocation" in navigator) {
      setLocationStatus('tracking');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Location access denied", error);
          setLocationStatus('error');
        }
      );
    }
  };

  const stopLocationTracking = () => {
    setLocationStatus('idle');
    setCoords(null);
  };

  const handleShare = (url: string, type: 'image' | 'video') => {
    setShareAsset({ url, type });
    setIsShareModalOpen(true);
    playSound('open');
  };

  React.useEffect(() => {
    if (isOpen && user?.role === 'creator' && activeTab === 'users') {
      fetchUsers();
      fetchModRequests();
      if (socket) {
        socket.send(JSON.stringify({ type: 'get_ban_list' }));
      }
    }
  }, [isOpen, activeTab, user, socket]);

  const fetchUsers = async () => {
    if (!user?.email) return;
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'x-creator-email': user.email
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRegisteredUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchModRequests = async () => {
    if (!user?.email) return;
    try {
      const response = await fetch('/api/mod/requests', {
        headers: {
          'x-creator-email': user.email
        }
      });
      if (response.ok) {
        const data = await response.json();
        setModRequests(data);
      }
    } catch (err) {
      console.error("Failed to fetch mod requests", err);
    }
  };

  const handleModResponse = async (userEmail: string, approve: boolean) => {
    if (!user?.email) return;
    try {
      const response = await fetch('/api/mod/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-creator-email': user.email
        },
        body: JSON.stringify({ userEmail, approve })
      });
      if (response.ok) {
        playSound('celebration', 0.2);
        fetchModRequests();
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to respond to mod request", err);
    }
  };

  const handleUnbanUser = (targetEmail: string) => {
    if (!socket) return;
    socket.send(JSON.stringify({ type: 'unban_user', targetEmail }));
    playSound('click');
  };

  const toggleTwitchStatus = async () => {
    if (!user) return;
    const nextStatus = !isTwitchLive;
    try {
      await setDoc(doc(db, 'status', 'twitch'), {
        isLive: nextStatus,
        updatedBy: (user as any).uid,
        updatedAt: serverTimestamp()
      });
      playSound('click');
    } catch (err) {
      console.error("Failed to update Twitch status", err);
    }
  };

  const handleSocialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const uploadId = Math.random().toString(36).substr(2, 9);
      const newUpload = {
        id: uploadId,
        name: file.name,
        type: file.type || 'Unknown',
        size: (file.size / 1024).toFixed(1) + ' KB',
        date: new Date().toLocaleDateString(),
        user: user.name,
        userId: (user as any).uid,
        timestamp: serverTimestamp()
      };
      
      try {
        await setDoc(doc(db, 'uploads', uploadId), newUpload);
        playSound('celebration', 0.2);
      } catch (err) {
        console.error("Failed to upload to vault", err);
      }
    }
  };

  const handleDeleteUpload = async (uploadId: string) => {
    try {
      await deleteDoc(doc(db, 'uploads', uploadId));
      playSound('click');
    } catch (err) {
      console.error("Failed to delete upload", err);
    }
  };

  const toggleCamera = async () => {
    if (isCameraActive) {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
      setLiveVideoUrl(null);
      
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'broadcast_stop', user }));
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
          setLiveVideoUrl(null);
          playSound('click');

          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ 
              type: 'broadcast_start', 
              user,
              title: broadcastTitle || "LIVE FROM LEONIDA"
            }));
          }
        }
      } catch (err) {
        setError('Could not access camera. Please check permissions.');
      }
    }
  };

  const handleLiveVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLiveVideoUrl(url);
      setIsCameraActive(false);
      playSound('click');
    }
  };

  React.useEffect(() => {
    if (!user || !isOpen) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let socket: WebSocket | null = null;
    try {
      if (typeof WebSocket === 'function') {
        socket = new WebSocket(`${protocol}//${window.location.host}`);
        socketRef.current = socket;
        
        socket.onopen = () => {
          socket?.send(JSON.stringify({ type: 'join', user }));
        };

        socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'support_history') {
            setSupportRequests(message.data);
          } else if (message.type === 'support_notification') {
            setSupportRequests(prev => [message.data, ...prev]);
          } else if (message.type === 'broadcasters_update') {
            setActiveBroadcasters(message.data);
          }
        };
      }
    } catch (e) {
      console.error('Failed to create WebSocket for Creator Lab', e);
    }

    return () => {
      socket?.close();
    };
  }, [user, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const ensureApiKey = async () => {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
      // After opening, we assume success as per instructions
    }
    return true;
  };

  const generateImage = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      await ensureApiKey();
      if (typeof GoogleGenAI === 'undefined') {
        throw new Error('GoogleGenAI is not loaded');
      }
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      
      const stylePrompts = {
        neon: 'vibrant pink and cyan neon lights, high contrast, Art Deco architecture of Ocean Drive, wet asphalt reflecting neon signs, humid tropical night atmosphere, purple and magenta hues',
        retro: '80s Miami aesthetic, VHS grain effect, synthwave color palette, palm tree silhouettes against a sunset, classic sports cars, pastel-colored buildings',
        cinematic: 'official GTA 6 artwork style, Leonida state environment, hyper-realistic lighting, volumetric clouds, dramatic golden hour shadows, 8k resolution, Rockstar Games aesthetic',
        noir: 'gritty Vice City backalleys, black and white with selective neon pink/blue, tropical rain, cinematic noir lighting, high-tension atmosphere',
        vibrant: 'bright sunny day in Vice City, highly saturated tropical colors, clear turquoise water, white sand beaches, vibrant street life, high energy atmosphere'
      };

      const finalPrompt = `${imagePrompt}. Style: ${stylePrompts[selectedStyle]}. Reference Vice City architecture, color palettes (pastels, neons), and the humid tropical vibe of Leonida. GTA 6 official style, ultra realistic.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: finalPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: imageSize
          }
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          playSound('celebration', 0.3);
          break;
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate image. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVideo = async () => {
    if (!selectedImage) {
      setError('Please upload an image first.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoProgress('Initializing Veo...');
    
    try {
      await ensureApiKey();
      if (typeof GoogleGenAI === 'undefined') {
        throw new Error('GoogleGenAI is not loaded');
      }
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      
      const base64Data = selectedImage.split(',')[1];
      
      const finalVideoPrompt = `${videoPrompt}. Style: Cinematic GTA 6, Leonida state atmosphere, vibrant colors, realistic motion, referencing Vice City aesthetic.`;

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: finalVideoPrompt,
        image: {
          imageBytes: base64Data,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: videoResolution,
          aspectRatio: '16:9'
        }
      });

      setVideoProgress('Generating video (this may take a few minutes)...');

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': (process.env as any).API_KEY,
          },
        });
        const blob = await response.blob();
        setGeneratedVideo(URL.createObjectURL(blob));
        playSound('celebration', 0.3);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate video. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
      setVideoProgress('');
    }
  };

  const generateCharacter = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      await ensureApiKey();
      if (typeof GoogleGenAI === 'undefined') {
        throw new Error('GoogleGenAI is not loaded');
      }
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      
      // 1. Generate Character Data
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Generate a GTA-style character profile based on this concept: ${characterPrompt || 'A random Vice City resident'}. The character should feel gritty, cinematic, and fit the GTA 6 vibe of Leonida. Reference local culture, slang, and the tropical setting.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              role: { type: "STRING" },
              background: { type: "STRING" },
              traits: { type: "ARRAY", items: { type: "STRING" } },
              outfit: { type: "STRING" },
              visualPrompt: { type: "STRING", description: "A detailed prompt for generating an image of this character in GTA style, referencing Vice City's aesthetic and fashion" }
            },
            required: ["name", "role", "background", "traits", "outfit", "visualPrompt"]
          }
        }
      });

      const characterData = JSON.parse(response.text || '{}');
      
      // 2. Generate Character Image
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: `${characterData.visualPrompt}, GTA 6 official artwork style, high contrast, cinematic lighting, vibrant colors` }],
        },
        config: {
          imageConfig: {
            aspectRatio: "3:4",
            imageSize: "1K"
          }
        },
      });

      let characterImage = '';
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          characterImage = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      setGeneratedCharacter({ ...characterData, image: characterImage });
      playSound('celebration', 0.3);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate character.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMission = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      await ensureApiKey();
      if (typeof GoogleGenAI === 'undefined') {
        throw new Error('GoogleGenAI is not loaded');
      }
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Generate a GTA-style mission briefing based on this concept: ${missionPrompt || 'A random heist in Vice City'}. The mission should be exciting, dangerous, and cinematic, set in the Leonida state. Reference specific Vice City locations (beaches, neon districts, swamps) and the high-stakes criminal underworld.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              objective: { type: "STRING" },
              difficulty: { type: "STRING" },
              payout: { type: "STRING" },
              briefing: { type: "STRING" }
            },
            required: ["title", "objective", "difficulty", "payout", "briefing"]
          }
        }
      });

      const missionData = JSON.parse(response.text || '{}');
      setGeneratedMission(missionData);
      playSound('celebration', 0.3);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate mission.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderBuild = () => {
    return (
      <div className="space-y-8 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-[#F27D26]">{translations[language].creatorLab.build.title}</h3>
            <p className="text-xs opacity-40 uppercase tracking-widest font-bold">{translations[language].creatorLab.build.description}</p>
          </div>
          <button
            onClick={runBuild}
            disabled={isBuilding}
            className="px-6 py-2 bg-[#F27D26] text-white font-black uppercase italic tracking-tighter rounded-lg hover:bg-[#D15D14] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isBuilding ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
            {isBuilding ? translations[language].creatorLab.build.rendering : translations[language].creatorLab.build.start}
          </button>
        </div>

        <div className="flex-1 bg-black/60 border border-white/10 rounded-2xl p-6 font-mono text-xs overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/10">
          {buildLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
              <Terminal size={48} className="mb-4" />
              <p className="uppercase tracking-widest font-bold">System Idle</p>
              <p className="text-[10px] mt-2">Ready for compilation</p>
            </div>
          ) : (
            buildLogs.map((log) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={log.id}
                className={`flex gap-3 ${
                  log.type === 'success' ? 'text-green-400' : 
                  log.type === 'warning' ? 'text-yellow-400' : 
                  'text-white/60'
                }`}
              >
                <span className="opacity-20">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                <span className="font-bold uppercase tracking-widest">{log.text}</span>
              </motion.div>
            ))
          )}
          {isBuilding && (
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-[#F27D26] inline-block ml-2"
            />
          )}
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!analyticsData) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-white/40">
          <Loader2 className="animate-spin" size={48} />
          <p className="font-mono text-[10px] uppercase tracking-widest">Waiting for live data stream...</p>
        </div>
      );
    }

    const t = translations[language].analytics;

    return (
      <div className="space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: t.liveConnections, value: analyticsData.activeUsers, icon: Radio, color: 'text-red-500' },
            { label: t.totalMembers, value: analyticsData.totalMembers, icon: Users, color: 'text-blue-500' },
            { label: t.sessions, value: analyticsData.sessions, icon: Play, color: 'text-green-500' },
            { label: t.traffic, value: `${analyticsData.traffic}%`, icon: Globe, color: 'text-purple-500' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl"
            >
              <div className="flex justify-between items-start mb-2">
                <stat.icon size={16} className={stat.color} />
                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Real-time</div>
              </div>
              <div className="text-2xl font-black italic tracking-tighter text-white mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Activity Chart */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <h3 className="text-sm font-black uppercase italic tracking-wider mb-6 flex items-center gap-2">
              <Radio size={16} className="text-[#F27D26]" />
              {t.liveConnections}
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsHistory}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#F27D26', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#F27D26" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Distribution */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <h3 className="text-sm font-black uppercase italic tracking-wider mb-6 flex items-center gap-2">
              <Globe size={16} className="text-blue-500" />
              {t.regionalData}
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Leonida', value: 45 },
                  { name: 'Liberty City', value: 25 },
                  { name: 'Los Santos', value: 20 },
                  { name: 'San Fierro', value: 10 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAchievements = () => {
    const t = translations[language].achievements;
    return (
      <div className="space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">{t.title}</h2>
            <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Your progress in Leonida</p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-sm font-black text-yellow-500 italic">2 / 4</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.list.map((achievement: any) => {
            const isUnlocked = ['first_visit', 'chat_active'].includes(achievement.id);
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-3xl border transition-all ${
                  isUnlocked 
                    ? 'bg-white/5 border-yellow-500/30' 
                    : 'bg-black/40 border-white/5 opacity-40 grayscale'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl ${isUnlocked ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-white/20'}`}>
                    <Trophy size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-black italic uppercase tracking-tight text-white">{achievement.title}</h3>
                      {isUnlocked && <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-2 py-0.5 rounded-full">Unlocked</span>}
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">{achievement.description}</p>
                    {isUnlocked && (
                      <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 w-full" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSoundtrack = () => (
    <div className="h-full overflow-y-auto pr-2">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF00FF]/10 rounded-lg">
            <Radio className="text-[#FF00FF]" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest">{translations[language].creatorLab.soundtrack.title}</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">{translations[language].creatorLab.soundtrack.description}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
             <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
               <Sparkles size={16} className="text-[#F27D26]" />
               {translations[language].creatorLab.soundtrack.confirmed}
             </h3>
             <div className="space-y-4">
                {translations[language].creatorLab.soundtrack.tracks.filter((t: any) => t.status.includes('Confirmado') || t.status.includes('Confirmed')).map((track: any, i: number) => (
                  <div key={i} className="p-4 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F27D26] rounded flex items-center justify-center">
                        <Play size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{track.song}</p>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest">{track.artist}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#F27D26]/20 text-[#F27D26] rounded-full">
                        {track.status}
                      </span>
                    </div>
                  </div>
                ))}
             </div>
           </div>

           <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
             <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
               <Users size={16} className="text-purple-500" />
               {translations[language].creatorLab.soundtrack.rumors}
             </h3>
             <div className="flex flex-wrap gap-2">
                {['The Weeknd', 'Travis Scott', 'Bad Bunny', 'Tems', 'Scorpions', 'Pet Shop Boys', 'Rick James', 'Genesis'].map((artist) => (
                  <span key={artist} className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors cursor-default">
                    {artist}
                  </span>
                ))}
             </div>
           </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest">{translations[language].creatorLab.soundtrack.stations}</h3>
          <div className="space-y-3">
             {translations[language].creatorLab.soundtrack.tracks.map((track: any, i: number) => (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.1 }}
                 key={i}
                 className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-all"
               >
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-black rounded flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                     <Volume2 size={20} className="text-[#FF00FF]" />
                   </div>
                   <div>
                     <p className="text-xs font-bold">{track.song}</p>
                     <p className="text-[8px] uppercase tracking-widest opacity-40">{track.artist} • {track.station}</p>
                   </div>
                 </div>
                 <div className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">
                   {track.status}
                 </div>
               </motion.div>
             ))}
          </div>

          <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
             <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-purple-500" />
                <h4 className="text-[10px] uppercase tracking-widest font-black text-purple-500">Music Intelligence</h4>
             </div>
             <p className="text-xs opacity-60 leading-relaxed italic">
               "Rockstar has reportedly licensed over 300 tracks for the base game, focusing on a mix of classic Vice City vibes and modern Leonida bangers."
             </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMap = () => {
    const t = translations[language].map;
    return (
      <div className="space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar">
        <div className="mb-8">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">{t.title}</h2>
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold">{t.explore}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 aspect-video bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group">
            {/* Mock Map Image */}
            <img 
              src="https://picsum.photos/seed/vice-map/1200/800?blur=2" 
              alt="Leonida Map" 
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            
            {/* Interactive Hotspots */}
            {[
              { id: 1, x: '25%', y: '30%', name: t.locations.portGellhorn },
              { id: 2, x: '65%', y: '45%', name: t.locations.viceCity },
              { id: 3, x: '45%', y: '75%', name: t.locations.everglades },
              { id: 4, x: '80%', y: '85%', name: t.locations.keys }
            ].map((spot) => (
              <motion.div
                key={spot.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ left: spot.x, top: spot.y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group/spot"
              >
                <div className="w-4 h-4 bg-[#F27D26] rounded-full animate-ping absolute inset-0" />
                <div className="w-4 h-4 bg-[#F27D26] rounded-full relative z-10 cursor-pointer border-2 border-white shadow-[0_0_15px_rgba(242,125,38,0.5)]" />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/90 border border-white/10 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover/spot:opacity-100 transition-opacity pointer-events-none z-20">
                  <p className="text-[10px] font-black uppercase italic tracking-wider text-white">{spot.name}</p>
                  <p className="text-[8px] text-[#F27D26] font-bold uppercase tracking-widest">{t.hotspot}</p>
                </div>
              </motion.div>
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div className="bg-black/50 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Satellite Signal: Locked</span>
                </div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">State of Leonida • 2026</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase italic tracking-wider flex items-center gap-2">
              <Radio size={16} className="text-[#F27D26]" />
              {t.rumors}
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Military Base', desc: 'Rumors of a high-security facility near Port Gellhorn.', type: 'rumor' },
                { title: 'Underwater Tunnel', desc: 'Possible connection discovered between Vice City and the Keys.', type: 'intel' },
                { title: 'Nightclub Heist', desc: 'Activity detected at the Malibu Club. High payout potential.', type: 'mission' }
              ].map((rumor, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-black uppercase italic text-white group-hover:text-[#F27D26] transition-colors">{rumor.title}</h4>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      rumor.type === 'rumor' ? 'bg-purple-500/20 text-purple-400' : 
                      rumor.type === 'intel' ? 'bg-blue-500/20 text-blue-400' : 
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {rumor.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed">{rumor.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#111] border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F27D26]/20 rounded-lg">
                  <Sparkles className="text-[#F27D26]" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter">{translations[language].creatorLab.title}</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{translations[language].creatorLab.poweredBy}</p>
                    {user && (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${
                        user.role === 'creator' 
                          ? 'bg-purple-500/20 border-purple-500/30' 
                          : 'bg-[#F27D26]/20 border-[#F27D26]/30'
                      }`}>
                        <div className={`w-1 h-1 rounded-full animate-pulse ${
                          user.role === 'creator' ? 'bg-purple-500' : 'bg-[#F27D26]'
                        }`} />
                        <span className={`text-[8px] uppercase font-black tracking-widest ${
                          user.role === 'creator' ? 'text-purple-400' : 'text-[#F27D26]'
                        }`}>
                          {user.role === 'creator' ? translations[language].creatorLab.masterAccess : `${user.name} ${translations[language].creatorLab.connected}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  onClose();
                  playSound('close');
                }}
                onMouseEnter={() => playSound('hover', 0.05)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <AppTooltip content={translations[language].tooltips.imageGen} position="bottom">
                <button
                  onClick={() => {
                    setActiveTab('image');
                    playSound('click');
                  }}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'image' ? 'bg-[#F27D26]/10 text-[#F27D26] border-b-2 border-[#F27D26]' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  <ImageIcon size={16} />
                  {translations[language].creatorLab.tabs.image}
                </button>
              </AppTooltip>
              <AppTooltip content={translations[language].tooltips.videoGen} position="bottom">
                <button
                  onClick={() => {
                    setActiveTab('video');
                    playSound('click');
                  }}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'video' ? 'bg-[#F27D26]/10 text-[#F27D26] border-b-2 border-[#F27D26]' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  <Video size={16} />
                  {translations[language].creatorLab.tabs.video}
                </button>
              </AppTooltip>
              <AppTooltip content={translations[language].tooltips.characterGen} position="bottom">
                <button
                  onClick={() => {
                    setActiveTab('character');
                    playSound('click');
                  }}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'character' ? 'bg-[#F27D26]/10 text-[#F27D26] border-b-2 border-[#F27D26]' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  <User size={16} />
                  {translations[language].creatorLab.tabs.character}
                </button>
              </AppTooltip>
              <AppTooltip content={translations[language].tooltips.missionGen} position="bottom">
                <button
                  onClick={() => {
                    setActiveTab('mission');
                    playSound('click');
                  }}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'mission' ? 'bg-[#F27D26]/10 text-[#F27D26] border-b-2 border-[#F27D26]' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  <File size={16} />
                  {translations[language].creatorLab.tabs.mission}
                </button>
              </AppTooltip>
              <AppTooltip content={translations[language].tooltips.build} position="bottom">
                <button
                  onClick={() => {
                    setActiveTab('build');
                    playSound('click');
                  }}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'build' ? 'bg-[#F27D26]/10 text-[#F27D26] border-b-2 border-[#F27D26]' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  <Terminal size={16} />
                  {translations[language].creatorLab.tabs.build}
                </button>
              </AppTooltip>
              <AppTooltip content={translations[language].tooltips.liveFeed} position="bottom">
                <button
                  onClick={() => {
                    setActiveTab('live');
                    playSound('click');
                  }}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'live' ? 'bg-[#F27D26]/10 text-[#F27D26] border-b-2 border-[#F27D26]' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  <Radio size={16} />
                  {translations[language].creatorLab.tabs.live}
                </button>
              </AppTooltip>
              <AppTooltip content={translations[language].tooltips.socialVault} position="bottom">
                <button
                  onClick={() => {
                    setActiveTab('social');
                    playSound('click');
                  }}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'social' ? 'bg-[#F27D26]/10 text-[#F27D26] border-b-2 border-[#F27D26]' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  <Share2 size={16} />
                  {translations[language].creatorLab.tabs.social}
                </button>
              </AppTooltip>
              {user?.role === 'creator' && (
                <AppTooltip content={translations[language].tooltips.analytics} position="bottom">
                  <button
                    onClick={() => {
                      setActiveTab('analytics');
                      playSound('click');
                    }}
                    onMouseEnter={() => playSound('hover', 0.05)}
                    className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'analytics' ? 'bg-[#F27D26]/10 text-[#F27D26] border-b-2 border-[#F27D26]' : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                    <Radio size={16} />
                    {translations[language].creatorLab.tabs.analytics}
                  </button>
                </AppTooltip>
              )}
              <AppTooltip content={translations[language].tooltips.achievements} position="bottom">
                <button
                  onClick={() => {
                    setActiveTab('achievements');
                    playSound('click');
                  }}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'achievements' ? 'bg-yellow-500/10 text-yellow-500 border-b-2 border-yellow-500' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  <Trophy size={16} />
                  {translations[language].creatorLab.tabs.achievements}
                </button>
              </AppTooltip>
              <AppTooltip content={translations[language].tooltips.map} position="bottom">
                <button
                  onClick={() => {
                    setActiveTab('map');
                    playSound('click');
                  }}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'map' ? 'bg-green-500/10 text-green-500 border-b-2 border-green-500' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  <Map size={16} />
                  {translations[language].creatorLab.tabs.map}
                </button>
              </AppTooltip>
              <AppTooltip content="Soundtrack Intel" position="bottom">
                <button
                  onClick={() => {
                    setActiveTab('soundtrack');
                    playSound('click');
                  }}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'soundtrack' ? 'bg-[#FF00FF]/10 text-[#FF00FF] border-b-2 border-[#FF00FF]' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  <Radio size={16} />
                  {translations[language].creatorLab.tabs.soundtrack}
                </button>
              </AppTooltip>
              {user?.role === 'creator' && (
                <AppTooltip content={translations[language].tooltips.userMgmt} position="bottom">
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      playSound('click');
                    }}
                    onMouseEnter={() => playSound('hover', 0.05)}
                    className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'users' ? 'bg-purple-500/10 text-purple-400 border-b-2 border-purple-500' : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                    <Users size={16} />
                    {translations[language].creatorLab.tabs.users}
                  </button>
                </AppTooltip>
              )}
              {user?.role === 'creator' && (
                <AppTooltip content={translations[language].tooltips.support} position="bottom">
                  <button
                    onClick={() => {
                      setActiveTab('support');
                      playSound('click');
                    }}
                    onMouseEnter={() => playSound('hover', 0.05)}
                    className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'support' ? 'bg-[#F27D26]/10 text-[#F27D26] border-b-2 border-[#F27D26]' : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                    <Bell size={16} />
                    {translations[language].creatorLab.tabs.support}
                    {supportRequests.filter(r => r.status === 'pending').length > 0 && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </button>
                </AppTooltip>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              {activeTab === 'analytics' ? (
                renderAnalytics()
              ) : activeTab === 'achievements' ? (
                renderAchievements()
              ) : activeTab === 'map' ? (
                renderMap()
              ) : activeTab === 'soundtrack' ? (
                renderSoundtrack()
              ) : activeTab === 'build' ? (
                renderBuild()
              ) : activeTab === 'image' ? (
                // ... image gen content ...
                <div className="grid md:grid-cols-2 gap-8">
                  {/* ... same as before ... */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">{translations[language].creatorLab.image.presets.label}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(translations[language].creatorLab.image.presets).filter(([key]) => key !== 'label').map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setImagePrompt(label as string);
                              playSound('click');
                            }}
                            className="py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#F27D26]/20 hover:border-[#F27D26]/30 transition-all text-left truncate"
                          >
                            {label as string}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">{translations[language].creatorLab.image.styles.label}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(translations[language].creatorLab.image.styles).filter(([key]) => key !== 'label').map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSelectedStyle(key as any);
                              playSound('click');
                            }}
                            className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                              selectedStyle === key ? 'bg-[#F27D26] border-[#F27D26] text-white' : 'bg-white/5 border-white/10 opacity-40 hover:opacity-100'
                            }`}
                          >
                            {label as string}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">{translations[language].creatorLab.image.prompt}</label>
                      <textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#F27D26] transition-colors resize-none"
                        placeholder={translations[language].creatorLab.image.promptPlaceholder}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">{translations[language].creatorLab.image.resolution}</label>
                      <div className="flex gap-2">
                        {(['1K', '2K', '4K'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => {
                              setImageSize(size);
                              playSound('click');
                            }}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                              imageSize === size ? 'bg-[#F27D26] border-[#F27D26] text-white' : 'bg-white/5 border-white/10 opacity-40 hover:opacity-100'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={generateImage}
                      onMouseEnter={() => playSound('hover', 0.1)}
                      disabled={isGenerating || !imagePrompt}
                      className="w-full py-4 bg-[#F27D26] text-white font-black uppercase italic tracking-tighter rounded-xl flex items-center justify-center gap-2 hover:bg-[#D15D14] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                      {isGenerating ? translations[language].creatorLab.image.generating : translations[language].creatorLab.image.generate}
                    </button>
                  </div>

                  <div className="aspect-video bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center relative group">
                    {generatedImage ? (
                      <>
                        <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleShare(generatedImage, 'image')}
                            className="p-3 bg-black/50 hover:bg-[#F27D26] rounded-full transition-colors"
                          >
                            <Share2 size={20} />
                          </button>
                          <a 
                            href={generatedImage} 
                            download="gta-vi-gen.png"
                            className="p-3 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
                          >
                            <Download size={20} />
                          </a>
                        </div>
                      </>
                    ) : (
                      <div className="text-center opacity-20">
                        <ImageIcon size={48} className="mx-auto mb-4" />
                        <p className="text-xs uppercase tracking-widest font-bold">{translations[language].creatorLab.image.placeholder}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'video' ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">{translations[language].creatorLab.video.sourceLabel}</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-video bg-white/5 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#F27D26]/50 transition-colors overflow-hidden"
                      >
                        {selectedImage ? (
                          <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload size={32} className="opacity-20 mb-2" />
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">{translations[language].creatorLab.video.uploadPlaceholder}</p>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleImageUpload} 
                          className="hidden" 
                          accept="image/*"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">{translations[language].creatorLab.video.presets.label}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(translations[language].creatorLab.video.presets).filter(([key]) => key !== 'label').map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setVideoPrompt(label as string);
                              playSound('click');
                            }}
                            className="py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#F27D26]/20 hover:border-[#F27D26]/30 transition-all text-left truncate"
                          >
                            {label as string}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">{translations[language].creatorLab.video.prompt}</label>
                      <textarea
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#F27D26] transition-colors resize-none"
                        placeholder={translations[language].creatorLab.video.promptPlaceholder}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">{translations[language].creatorLab.video.resolution}</label>
                      <div className="flex gap-2">
                        {(['720p', '1080p'] as const).map((res) => (
                          <button
                            key={res}
                            onClick={() => {
                              setVideoResolution(res);
                              playSound('click');
                            }}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                              videoResolution === res ? 'bg-[#F27D26] border-[#F27D26] text-white' : 'bg-white/5 border-white/10 opacity-40 hover:opacity-100'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={generateVideo}
                      disabled={isGenerating || !selectedImage}
                      className="w-full py-4 bg-[#F27D26] text-white font-black uppercase italic tracking-tighter rounded-xl flex items-center justify-center gap-2 hover:bg-[#D15D14] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" /> : <Video size={20} />}
                      {isGenerating ? translations[language].creatorLab.video.animating : translations[language].creatorLab.video.generate}
                    </button>
                    
                    {videoProgress && (
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#F27D26] text-center animate-pulse">
                        {videoProgress}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="aspect-video bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center relative group">
                      {generatedVideo ? (
                        <CustomVideoPlayer src={generatedVideo} />
                      ) : (
                        <div className="text-center opacity-20">
                          <Video size={48} className="mx-auto mb-4" />
                          <p className="text-xs uppercase tracking-widest font-bold">Generated video will appear here</p>
                        </div>
                      )}
                    </div>
                    
                      {generatedVideo && (
                        <div className="flex gap-4">
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => handleShare(generatedVideo, 'video')}
                            className="flex-1 py-4 bg-[#F27D26] text-white font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-3 hover:bg-[#D15D14] transition-all"
                          >
                            <Share2 size={18} />
                            {translations[language].creatorLab.sharing.title}
                          </motion.button>
                          <motion.a
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            href={generatedVideo}
                            download="gta-vi-animation.mp4"
                            className="flex-1 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-3 transition-all"
                          >
                            <Download size={18} />
                            {translations[language].creatorLab.video.download}
                          </motion.a>
                        </div>
                      )}
                  </div>
                </div>
              ) : activeTab === 'character' ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">{translations[language].creatorLab.character.title}</h3>
                      <p className="text-xs opacity-60 mb-6">{translations[language].creatorLab.character.description}</p>
                      
                      <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">{translations[language].creatorLab.character.prompt}</label>
                      <textarea
                        value={characterPrompt}
                        onChange={(e) => setCharacterPrompt(e.target.value)}
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#F27D26] transition-colors resize-none"
                        placeholder={translations[language].creatorLab.character.promptPlaceholder}
                      />
                    </div>

                    <button
                      onClick={generateCharacter}
                      disabled={isGenerating}
                      className="w-full py-4 bg-[#F27D26] text-white font-black uppercase italic tracking-tighter rounded-xl flex items-center justify-center gap-2 hover:bg-[#D15D14] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" /> : <Users size={20} />}
                      {isGenerating ? translations[language].creatorLab.character.generating : translations[language].creatorLab.character.generate}
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col relative group min-h-[400px]">
                    {generatedCharacter ? (
                      <div className="flex flex-col h-full">
                        <div className="aspect-[3/4] relative overflow-hidden">
                          {generatedCharacter.image ? (
                            <img src={generatedCharacter.image} alt={generatedCharacter.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black/40">
                              <Loader2 className="animate-spin text-[#F27D26]" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                          <div className="absolute bottom-4 left-4">
                            <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white">{generatedCharacter.name}</h4>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-[#F27D26]">{generatedCharacter.role}</p>
                          </div>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[300px]">
                          <div>
                            <span className="text-[8px] uppercase tracking-widest font-black text-[#F27D26] block mb-1">{translations[language].creatorLab.character.stats.background}</span>
                            <p className="text-xs text-white/70 leading-relaxed">{generatedCharacter.background}</p>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase tracking-widest font-black text-[#F27D26] block mb-1">{translations[language].creatorLab.character.stats.traits}</span>
                            <div className="flex flex-wrap gap-2">
                              {generatedCharacter.traits.map((trait, i) => (
                                <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase font-bold text-white/60">{trait}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase tracking-widest font-black text-[#F27D26] block mb-1">{translations[language].creatorLab.character.stats.outfit}</span>
                            <p className="text-xs text-white/70">{generatedCharacter.outfit}</p>
                          </div>
                        </div>
                        <div className="p-4 border-t border-white/10 flex gap-2">
                          <button 
                            onClick={() => handleShare(generatedCharacter.image || '', 'image')}
                            className="flex-1 py-2 bg-[#F27D26] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#D15D14] transition-all"
                          >
                            Share Character
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 p-8">
                        <Users size={48} className="mb-4" />
                        <p className="text-xs uppercase tracking-widest font-bold">{translations[language].creatorLab.character.placeholder}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'mission' ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">{translations[language].creatorLab.mission.title}</h3>
                      <p className="text-xs opacity-60 mb-6">{translations[language].creatorLab.mission.description}</p>
                      
                      <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">{translations[language].creatorLab.mission.prompt}</label>
                      <textarea
                        value={missionPrompt}
                        onChange={(e) => setMissionPrompt(e.target.value)}
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#F27D26] transition-colors resize-none"
                        placeholder={translations[language].creatorLab.mission.promptPlaceholder}
                      />
                    </div>

                    <button
                      onClick={generateMission}
                      disabled={isGenerating}
                      className="w-full py-4 bg-[#F27D26] text-white font-black uppercase italic tracking-tighter rounded-xl flex items-center justify-center gap-2 hover:bg-[#D15D14] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                      {isGenerating ? translations[language].creatorLab.mission.generating : translations[language].creatorLab.mission.generate}
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col relative group min-h-[400px]">
                    {generatedMission ? (
                      <div className="flex flex-col h-full">
                        <div className="p-6 bg-[#F27D26] flex justify-between items-center">
                          <div>
                            <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white">{generatedMission.title}</h4>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-black/60">Mission Briefing</p>
                          </div>
                          <ShieldCheck size={32} className="text-white/40" />
                        </div>
                        <div className="p-8 space-y-6 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                              <span className="text-[8px] uppercase tracking-widest font-black text-[#F27D26] block mb-1">{translations[language].creatorLab.mission.details.difficulty}</span>
                              <p className="text-sm font-bold text-white uppercase">{generatedMission.difficulty}</p>
                            </div>
                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                              <span className="text-[8px] uppercase tracking-widest font-black text-[#F27D26] block mb-1">{translations[language].creatorLab.mission.details.payout}</span>
                              <p className="text-sm font-bold text-green-400 font-mono">{generatedMission.payout}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase tracking-widest font-black text-[#F27D26] block mb-1">{translations[language].creatorLab.mission.details.objective}</span>
                            <p className="text-sm font-bold text-white leading-relaxed">{generatedMission.objective}</p>
                          </div>
                          <div className="p-4 bg-black/40 border-l-4 border-[#F27D26] rounded-r-xl">
                            <span className="text-[8px] uppercase tracking-widest font-black text-[#F27D26] block mb-2">{translations[language].creatorLab.mission.details.briefing}</span>
                            <p className="text-xs text-white/70 leading-relaxed italic">"{generatedMission.briefing}"</p>
                          </div>
                        </div>
                        <div className="p-4 mt-auto border-t border-white/10">
                          <button 
                            onClick={() => playSound('celebration')}
                            className="w-full py-3 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all"
                          >
                            Accept Mission
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 p-8">
                        <ShieldCheck size={48} className="mb-4" />
                        <p className="text-xs uppercase tracking-widest font-bold">{translations[language].creatorLab.mission.placeholder}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'support' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black uppercase italic tracking-tighter mb-1">
                        {translations[language].creatorLab.tabs.support}
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                        Manage incoming member support notifications
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#F27D26]">
                        {supportRequests.length} Total Requests
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {supportRequests.length > 0 ? (
                      supportRequests.map((req) => (
                        <motion.div
                          key={req.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <img src={req.user.avatar} alt={req.user.name} className="w-12 h-12 rounded-xl border border-white/10" />
                            <div>
                              <h4 className="text-sm font-bold text-white">{req.user.name}</h4>
                              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">{req.user.email}</p>
                              <p className="text-[8px] font-mono opacity-20 mt-1">{new Date(req.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              req.status === 'pending' ? 'bg-[#F27D26]/20 text-[#F27D26]' : 'bg-green-500/20 text-green-500'
                            }`}>
                              {req.status}
                            </span>
                            <button 
                              onClick={() => {
                                setSupportRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'resolved' } : r));
                                playSound('click');
                              }}
                              className="p-2 bg-white/5 hover:bg-green-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Check size={16} className="text-green-500" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-20 text-center opacity-20">
                        <Bell size={48} className="mx-auto mb-4" />
                        <p className="text-xs uppercase tracking-widest font-bold">No support requests yet</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'live' ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                      <h3 className="text-sm font-bold uppercase tracking-widest mb-4">{translations[language].creatorLab.live.controls}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={toggleCamera}
                          className={`py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${
                            isCameraActive ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <Camera size={24} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {isCameraActive ? translations[language].creatorLab.live.stop : translations[language].creatorLab.live.start}
                          </span>
                        </button>
                        <button
                          onClick={() => liveFileInputRef.current?.click()}
                          className="py-4 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-all"
                        >
                          <Upload size={24} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{translations[language].creatorLab.live.upload}</span>
                          <input 
                            type="file" 
                            ref={liveFileInputRef} 
                            onChange={handleLiveVideoUpload} 
                            className="hidden" 
                            accept="video/*"
                          />
                        </button>
                        <button
                          onClick={toggleScreenShare}
                          className={`py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border col-span-2 ${
                            isSharingScreen ? 'bg-[#F27D26] border-[#F27D26] text-white' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <Share2 size={24} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {isSharingScreen ? (language === 'en' ? 'STOP SHARING' : 'DEJAR DE COMPARTIR') : (language === 'en' ? 'SHARE SCREEN' : 'COMPARTIR PANTALLA')}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="p-6 bg-[#F27D26]/5 border border-[#F27D26]/20 rounded-2xl">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#F27D26] mb-2">{translations[language].creatorLab.live.newsNetwork}</h4>
                      <p className="text-xs opacity-60 leading-relaxed mb-6">
                        {translations[language].creatorLab.live.description}
                      </p>

                      <div className="space-y-4 pt-4 border-t border-[#F27D26]/20">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#F27D26]">{translations[language].creatorLab.live.overlays}</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest opacity-60">{translations[language].creatorLab.live.titleCard}</span>
                            <input 
                              type="checkbox" 
                              checked={showTitleCard} 
                              onChange={(e) => setShowTitleCard(e.target.checked)}
                              className="accent-[#F27D26]"
                            />
                          </div>
                          {showTitleCard && (
                            <input 
                              type="text"
                              value={broadcastTitle}
                              onChange={(e) => setBroadcastTitle(e.target.value.toUpperCase())}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white focus:border-[#F27D26] outline-none"
                            />
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest opacity-60">{translations[language].creatorLab.live.viewerCount}</span>
                            <input 
                              type="checkbox" 
                              checked={showViewerCount} 
                              onChange={(e) => setShowViewerCount(e.target.checked)}
                              className="accent-[#F27D26]"
                            />
                          </div>

                          <div className="h-px bg-[#F27D26]/10 my-2" />

                          <div className="flex items-center justify-between p-3 bg-[#9146FF]/10 border border-[#9146FF]/20 rounded-xl">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${isTwitchLive ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`} />
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#9146FF]">TWITCH LIVE STATUS</span>
                            </div>
                            <button 
                              onClick={toggleTwitchStatus}
                              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                isTwitchLive 
                                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                                  : 'bg-[#9146FF] text-white'
                              }`}
                            >
                              {isTwitchLive ? (language === 'en' ? 'STOP LIVE' : 'DETENER DIRECTO') : (language === 'en' ? 'GO LIVE' : 'IR A DIRECTO')}
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest opacity-60">{translations[language].creatorLab.live.newSub}</span>
                            <input 
                              type="checkbox" 
                              checked={showSubAlert} 
                              onChange={(e) => setShowSubAlert(e.target.checked)}
                              className="accent-[#F27D26]"
                            />
                          </div>
                          {showSubAlert && (
                            <input 
                              type="text"
                              value={newestSubscriber}
                              onChange={(e) => setNewestSubscriber(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white focus:border-[#F27D26] outline-none"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="aspect-video bg-black border border-white/10 rounded-2xl overflow-hidden relative group">
                    <video 
                      ref={videoRef}
                      src={liveVideoUrl || undefined}
                      autoPlay 
                      muted 
                      loop 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Live Overlay */}
                    {(isCameraActive || liveVideoUrl) && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Top Left Live Indicator */}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <div className="bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              {language === 'en' ? 'LIVE' : 'EN VIVO'}
                            </div>
                            <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-white/10">
                              LEONIDA STATE
                            </div>
                          </div>
                          
                          {showTitleCard && (
                            <motion.div 
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className="bg-[#F27D26] text-white px-3 py-1 text-[12px] font-black italic tracking-tighter border-l-4 border-white shadow-xl"
                            >
                              {broadcastTitle}
                            </motion.div>
                          )}
                        </div>

                        {/* Top Right Stats */}
                        <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                          {showViewerCount && (
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded flex items-center gap-2">
                              <Users size={12} className="text-[#F27D26]" />
                              <span className="text-[10px] font-mono font-bold text-white">
                                {viewerCount.toLocaleString()} {translations[language].creatorLab.live.viewers}
                              </span>
                            </div>
                          )}

                          {showSubAlert && (
                            <motion.div 
                              initial={{ x: 20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded flex items-center gap-3"
                            >
                              <div className="w-6 h-6 bg-[#F27D26] rounded-full flex items-center justify-center">
                                <Sparkles size={12} className="text-white" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[7px] font-black uppercase tracking-widest text-[#F27D26]">
                                  {translations[language].creatorLab.live.subAlert}
                                </span>
                                <span className="text-[9px] font-bold text-white">
                                  {newestSubscriber}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Bottom News Ticker */}
                        <div className="absolute bottom-0 left-0 w-full">
                          <div className="bg-[#F27D26] text-white py-2 px-6 flex items-center justify-between border-t-2 border-white/20">
                            <div className="flex items-center gap-4 overflow-hidden">
                              <span className="text-xs font-black uppercase italic tracking-tighter whitespace-nowrap">{translations[language].creatorLab.live.breaking}</span>
                              <div className="w-[2px] h-4 bg-white/30" />
                              <div className="flex gap-12 animate-marquee whitespace-nowrap text-[10px] font-bold uppercase tracking-widest">
                                <span>REPORTS OF UNUSUAL ACTIVITY IN VICE CITY BEACH...</span>
                                <span>MYSTERIOUS COUNTDOWN APPEARS ON GLOBAL NETWORKS...</span>
                                <span>CITIZENS PREPARE FOR HISTORIC EVENT...</span>
                              </div>
                            </div>
                            <div className="hidden md:block text-[10px] font-mono font-bold">
                              {new Date().toLocaleTimeString()}
                            </div>
                          </div>
                        </div>

                        {/* Scanlines Effect */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                      </div>
                    )}

                    {!isCameraActive && !liveVideoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center text-center opacity-20">
                        <div>
                          <Radio size={48} className="mx-auto mb-4" />
                          <p className="text-xs uppercase tracking-widest font-bold">{translations[language].creatorLab.live.placeholder}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Broadcasters Gallery */}
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60">Active Broadcasters</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{activeBroadcasters.length} Live</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {activeBroadcasters.length > 0 ? (
                        activeBroadcasters.map((broadcaster) => (
                          <div 
                            key={broadcaster.id}
                            className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/10 group cursor-pointer"
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                            <div className="absolute top-2 left-2 bg-red-600 text-[8px] font-black px-1 rounded">LIVE</div>
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-[9px] font-black uppercase tracking-tighter truncate text-white">{broadcaster.title}</p>
                              <p className="text-[7px] font-bold uppercase tracking-widest text-white/40 truncate">{broadcaster.user.name}</p>
                            </div>
                            <div className="absolute inset-0 bg-[#F27D26]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play size={20} className="text-white" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-8 text-center opacity-20">
                          <p className="text-[10px] font-bold uppercase tracking-widest">No active transmissions</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shared Screens Gallery (Creator Only) */}
                  {user?.role === 'creator' && (
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60">Shared Screens</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#F27D26] rounded-full animate-pulse" />
                          <span className="text-[10px] font-bold text-[#F27D26] uppercase tracking-widest">{activeScreenShares.length} Active</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {activeScreenShares.length > 0 ? (
                          activeScreenShares.map((share) => (
                            <div 
                              key={share.id}
                              className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/10 group cursor-pointer"
                            >
                              {remoteFrames[share.id] ? (
                                <img 
                                  src={remoteFrames[share.id]} 
                                  alt={`Screen from ${share.user.name}`}
                                  className="w-full h-full object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Loader2 className="animate-spin text-white/20" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                              <div className="absolute top-2 left-2 bg-[#F27D26] text-[8px] font-black px-1 rounded">SCREEN</div>
                              <div className="absolute bottom-2 left-2 right-2">
                                <p className="text-[9px] font-black uppercase tracking-tighter truncate text-white">{share.user.name}</p>
                                <p className="text-[7px] font-bold uppercase tracking-widest text-white/40 truncate">Shared from Leonida</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-8 text-center opacity-20">
                            <p className="text-[10px] font-bold uppercase tracking-widest">No shared screens</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {!user ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                        <Lock size={40} className="text-[#F27D26]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">{translations[language].creatorLab.social.locked}</h3>
                        <p className="text-xs opacity-40 uppercase tracking-widest max-w-xs mx-auto">
                          {translations[language].creatorLab.social.lockedDesc}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                          <h3 className="text-sm font-bold uppercase tracking-widest mb-4">{translations[language].creatorLab.social.upload}</h3>
                          <div 
                            onClick={() => socialFileInputRef.current?.click()}
                            className="aspect-video bg-white/5 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#F27D26]/50 transition-colors"
                          >
                            <Upload size={32} className="mb-4 opacity-40" />
                            <p className="text-xs uppercase tracking-widest font-bold opacity-40">{translations[language].creatorLab.social.drop}</p>
                            <p className="text-[10px] uppercase tracking-widest opacity-20 mt-2">{translations[language].creatorLab.social.anyFile}</p>
                            <input 
                              type="file" 
                              ref={socialFileInputRef} 
                              onChange={handleSocialUpload} 
                              className="hidden" 
                            />
                          </div>
                        </div>

                        <div className="p-6 bg-[#F27D26]/5 border border-[#F27D26]/20 rounded-2xl">
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#F27D26] mb-2">{translations[language].creatorLab.social.security}</h4>
                          <p className="text-xs opacity-60 leading-relaxed">
                            {translations[language].creatorLab.social.securityDesc}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest">{translations[language].creatorLab.social.activity}</h3>
                        <div className="space-y-3">
                          {communityUploads.length === 0 ? (
                            <div className="py-12 text-center opacity-20 border border-white/5 rounded-xl">
                              <File size={32} className="mx-auto mb-2" />
                              <p className="text-[10px] uppercase tracking-widest font-bold">{translations[language].creatorLab.social.noActivity}</p>
                            </div>
                          ) : (
                            communityUploads.map((upload) => (
                              <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={upload.id}
                                className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-4 group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                                      {upload.type.startsWith('image/') ? <ImageIcon size={20} className="text-[#F27D26]" /> : 
                                       upload.type.startsWith('video/') ? <Video size={20} className="text-[#F27D26]" /> :
                                       <File size={20} className="text-[#F27D26]" />}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold truncate max-w-[200px]">{upload.name}</p>
                                      <p className="text-[8px] uppercase tracking-widest opacity-40">{upload.user} • {upload.date}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono opacity-40">{upload.size}</span>
                                    {((user as any)?.uid === upload.userId || user?.role === 'creator') && (
                                      <button 
                                        onClick={() => handleDeleteUpload(upload.id)}
                                        className="p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-white/5">
                                  <div className="flex flex-col">
                                    <span className="text-[7px] uppercase tracking-widest opacity-30 font-black">{translations[language].creatorLab.social.details.type}</span>
                                    <span className="text-[9px] font-bold truncate">{upload.type}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[7px] uppercase tracking-widest opacity-30 font-black">{translations[language].creatorLab.social.details.size}</span>
                                    <span className="text-[9px] font-bold">{upload.size}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[7px] uppercase tracking-widest opacity-30 font-black">{translations[language].creatorLab.social.details.date}</span>
                                    <span className="text-[9px] font-bold">{upload.date}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[7px] uppercase tracking-widest opacity-30 font-black">{translations[language].creatorLab.social.details.uploader}</span>
                                    <span className="text-[9px] font-bold truncate">{upload.user}</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'users' && user?.role === 'creator' && (
                <div className="space-y-6">
                  {/* Mod Requests Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic tracking-tighter text-[#F27D26]">
                        {translations[language].creatorLab.users.requests}
                      </h3>
                      <div className="px-2 py-0.5 bg-[#F27D26]/10 border border-[#F27D26]/20 rounded text-[8px] font-black text-[#F27D26] uppercase tracking-widest">
                        {modRequests.length} Pending
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {modRequests.length === 0 ? (
                        <div className="p-8 text-center opacity-20 border border-white/5 rounded-2xl italic text-xs">
                          {translations[language].creatorLab.users.noRequests}
                        </div>
                      ) : (
                        modRequests.map((req) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={req.email}
                            className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                                <ShieldCheck size={20} className="text-[#F27D26]" />
                              </div>
                              <div>
                                <p className="text-xs font-bold">{req.username}</p>
                                <p className="text-[10px] font-mono opacity-40">{req.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleModResponse(req.email, true)}
                                className="px-4 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors"
                              >
                                {translations[language].creatorLab.users.approve}
                              </button>
                              <button 
                                onClick={() => handleModResponse(req.email, false)}
                                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors"
                              >
                                {translations[language].creatorLab.users.deny}
                              </button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Banned Users Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic tracking-tighter text-red-500">
                        Banned Users
                      </h3>
                      <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[8px] font-black text-red-500 uppercase tracking-widest">
                        {bannedUsers.length} Banned
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {bannedUsers.length === 0 ? (
                        <div className="p-8 text-center opacity-20 border border-white/5 rounded-2xl italic text-xs">
                          No users currently banned.
                        </div>
                      ) : (
                        bannedUsers.map((bannedEmail) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={bannedEmail}
                            className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                                <Ban size={20} className="text-red-500" />
                              </div>
                              <div>
                                <p className="text-xs font-bold">{bannedEmail.split('@')[0]}</p>
                                <p className="text-[10px] font-mono opacity-40">{bannedEmail}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleUnbanUser(bannedEmail)}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-white/10"
                            >
                              Unban
                            </button>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-purple-400">
                      {translations[language].creatorLab.users.title}
                    </h3>
                    <button 
                      onClick={fetchUsers}
                      className="p-2 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg text-purple-400 transition-colors"
                    >
                      <Loader2 size={16} className={isLoadingUsers ? 'animate-spin' : ''} />
                    </button>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                          <th className="px-6 py-4 uppercase tracking-widest opacity-40 font-bold">{translations[language].creatorLab.users.username}</th>
                          <th className="px-6 py-4 uppercase tracking-widest opacity-40 font-bold">{translations[language].creatorLab.users.email}</th>
                          <th className="px-6 py-4 uppercase tracking-widest opacity-40 font-bold">{translations[language].creatorLab.users.role}</th>
                          <th className="px-6 py-4 uppercase tracking-widest opacity-40 font-bold">{translations[language].creatorLab.users.lastLogin}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {registeredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center opacity-20 italic">
                              {translations[language].creatorLab.users.noUsers}
                            </td>
                          </tr>
                        ) : (
                          registeredUsers.map((u, i) => (
                            <motion.tr 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              key={u.email} 
                              className="hover:bg-white/5 transition-colors"
                            >
                              <td className="px-6 py-4 font-bold text-white/80">{u.username}</td>
                              <td className="px-6 py-4 font-mono text-[#F27D26]">{u.email}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                  u.role === 'creator' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white/40'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 opacity-40 font-mono">{new Date(u.last_login).toLocaleString()}</td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer Note */}
            <div className="p-4 bg-white/5 border-t border-white/10 text-center">
              <p className="text-[9px] uppercase tracking-[0.3em] opacity-30 font-bold">
                Experimental Feature • Requires Paid Gemini API Key
              </p>
            </div>
            {/* Footer / Location Tracking */}
            <div className="p-4 border-t border-white/10 bg-black/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {locationStatus === 'tracking' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 px-3 py-1.5 bg-[#F27D26]/10 border border-[#F27D26]/20 rounded-full"
                  >
                    <div className="relative">
                      <Globe size={14} className="text-[#F27D26] animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black animate-ping" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#F27D26]">
                        {translations[language].creatorLab.location.tracking}
                      </span>
                      <span className="text-[7px] font-bold uppercase tracking-widest opacity-60 text-white">
                        {translations[language].creatorLab.location.transmitting}
                      </span>
                    </div>
                  </motion.div>
                )}
                {coords && (
                  <div className="hidden sm:flex flex-col">
                    <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">{translations[language].creatorLab.location.status}</span>
                    <span className="text-[8px] font-mono text-[#F27D26] uppercase tracking-widest">
                      {translations[language].creatorLab.location.coordinates}: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 opacity-30">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-mono uppercase tracking-widest">Leonida State Cloud</span>
                  <span className="text-[8px] font-mono uppercase tracking-widest">Secure Uplink: Active</span>
                </div>
                <div className="w-8 h-8 border border-white/20 rounded flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Share Modal */}
          <AnimatePresence>
            {isShareModalOpen && shareAsset && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                onClick={() => setIsShareModalOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#111] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">{translations[language].creatorLab.sharing.title}</h2>
                    <button 
                      onClick={() => setIsShareModalOpen(false)} 
                      className="opacity-50 hover:opacity-100"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="aspect-video bg-white/5 rounded-xl overflow-hidden mb-6 border border-white/10">
                    {shareAsset.type === 'image' ? (
                      <img src={shareAsset.url} alt="Share" className="w-full h-full object-cover" />
                    ) : (
                      <video src={shareAsset.url} className="w-full h-full object-cover" muted autoPlay loop />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => {
                        const text = encodeURIComponent(translations[language].creatorLab.sharing.shareText);
                        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                        playSound('click');
                      }}
                      className="py-4 bg-[#1DA1F2] text-white font-bold rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <Twitter size={20} />
                      <span className="text-[10px] uppercase tracking-widest">{translations[language].creatorLab.sharing.twitter}</span>
                    </button>

                    <button 
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                        playSound('click');
                      }}
                      className="py-4 bg-[#4267B2] text-white font-bold rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <Facebook size={20} />
                      <span className="text-[10px] uppercase tracking-widest">{translations[language].creatorLab.sharing.facebook}</span>
                    </button>

                    <button 
                      onClick={() => {
                        const text = encodeURIComponent(translations[language].creatorLab.sharing.shareText);
                        window.open(`https://wa.me/?text=${text}`, '_blank');
                        playSound('click');
                      }}
                      className="py-4 bg-[#25D366] text-white font-bold rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <MessageCircle size={20} />
                      <span className="text-[10px] uppercase tracking-widest">{translations[language].creatorLab.sharing.whatsapp}</span>
                    </button>

                    <button 
                      onClick={() => {
                        const text = encodeURIComponent(translations[language].creatorLab.sharing.shareText);
                        window.open(`https://t.me/share/url?url=${window.location.href}&text=${text}`, '_blank');
                        playSound('click');
                      }}
                      className="py-4 bg-[#0088cc] text-white font-bold rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <Send size={20} />
                      <span className="text-[10px] uppercase tracking-widest">{translations[language].creatorLab.sharing.telegram}</span>
                    </button>

                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(shareAsset.url);
                        playSound('click');
                        alert(translations[language].creatorLab.sharing.copied);
                      }}
                      className="col-span-2 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
                    >
                      <Link2 size={20} />
                      <span className="text-[10px] uppercase tracking-widest">{translations[language].creatorLab.sharing.copy}</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

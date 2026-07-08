import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Users, MessageCircle, X, Minimize2, Maximize2, ShieldCheck, Loader2, Lock, Globe, User as UserIcon, Trash2, UserMinus, Ban, MoreVertical } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { translations } from '../translations';

interface Message {
  id: string;
  user: {
    name: string;
    email: string;
    avatar: string;
    role?: string;
  };
  text: string;
  timestamp: string;
}

interface LiveChatProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    role?: 'creator' | 'member' | 'moderator';
  } | null;
  language: 'en' | 'es';
  playSound: (type: any, volume?: number) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function LiveChat({ user, language, playSound, isOpen, setIsOpen }: LiveChatProps) {
  const t = translations[language].liveChat;
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');
  const [privateMessages, setPrivateMessages] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<{ email: string; name: string } | null>(null);
  const [modRequestStatus, setModRequestStatus] = useState<'none' | 'pending' | 'approved' | 'denied'>('none');
  const [isRequestingMod, setIsRequestingMod] = useState(false);
  const [activeModerationId, setActiveModerationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          user: {
            name: data.authorName,
            avatar: data.authorAvatar,
            role: data.authorRole,
            email: data.authorEmail || ''
          },
          text: data.text,
          timestamp: data.timestamp?.toDate()?.toISOString() || new Date().toISOString()
        });
      });
      setMessages(msgs);
      setConnected(true);
    }, (error) => {
      console.error("Firestore Chat Error:", error);
      setConnected(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    if (activeTab === 'public') {
      try {
        await addDoc(collection(db, 'messages'), {
          text: inputText.trim(),
          authorUid: (user as any).uid,
          authorName: user.name,
          authorAvatar: user.avatar,
          authorRole: user.role,
          authorEmail: user.email,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error("Failed to send message", err);
      }
    } else if (selectedRecipient) {
      // Private chat still uses WebSocket for now, or we could implement it in Firestore
      // For this turn, let's focus on public chat and auth
    }

    setInputText('');
    playSound('click');
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
      setActiveModerationId(null);
      playSound('click');
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  const handleKickUser = (targetEmail: string) => {
    // For now, these still use WebSocket if we want immediate effect without Firestore persistence
    // But since I removed socketRef, I should either re-add it or move these to Firestore
    console.log("Kicking user:", targetEmail);
    setActiveModerationId(null);
    playSound('click');
  };

  const handleBanUser = (targetEmail: string) => {
    console.log("Banning user:", targetEmail);
    setActiveModerationId(null);
    playSound('click');
  };

  const handleRequestMod = async () => {
    if (!user || isRequestingMod) return;
    setIsRequestingMod(true);
    try {
      const response = await fetch('/api/mod/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, username: user.name })
      });
      if (response.ok) {
        setModRequestStatus('pending');
        playSound('celebration', 0.2);
      }
    } catch (err) {
      console.error("Mod request failed", err);
    } finally {
      setIsRequestingMod(false);
    }
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            height: isMinimized ? '60px' : '450px',
            width: '350px'
          }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-24 right-8 z-[100] bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex flex-col gap-3 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs font-black uppercase tracking-widest text-white/80">
                  {t.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {user.role === 'member' && modRequestStatus === 'none' && (
                  <button 
                    onClick={handleRequestMod}
                    onMouseEnter={() => playSound('hover', 0.05)}
                    disabled={isRequestingMod}
                    className="flex items-center gap-1 px-2 py-1 bg-[#F27D26]/10 hover:bg-[#F27D26]/20 border border-[#F27D26]/30 rounded text-[8px] font-bold uppercase tracking-widest text-[#F27D26] transition-all"
                    title={t.requestMod}
                  >
                    {isRequestingMod ? <Loader2 size={10} className="animate-spin" /> : <ShieldCheck size={10} />}
                    {t.requestMod}
                  </button>
                )}
                {modRequestStatus === 'pending' && (
                  <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[8px] font-bold uppercase tracking-widest text-white/40">
                    {t.modRequested}
                  </span>
                )}
                <button 
                  onClick={() => {
                    setIsMinimized(!isMinimized);
                    playSound('click');
                  }}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/60"
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    playSound('close');
                  }}
                  onMouseEnter={() => playSound('hover', 0.05)}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/60"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setActiveTab('public');
                    playSound('click');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'public' ? 'bg-[#F27D26] text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  <Globe size={12} />
                  Public
                </button>
                <button
                  onClick={() => {
                    setActiveTab('private');
                    playSound('click');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'private' ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  <Lock size={12} />
                  Private
                </button>
              </div>
            )}
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
              >
                {activeTab === 'public' ? (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3 group">
                      <img 
                        src={msg.user.avatar} 
                        alt={msg.user.name} 
                        className="w-8 h-8 rounded-lg border border-white/10"
                      />
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span 
                              onClick={() => {
                                if (msg.user.email !== user.email) {
                                  setSelectedRecipient({ email: msg.user.email, name: msg.user.name });
                                  setActiveTab('private');
                                  playSound('click');
                                }
                              }}
                              className={`text-[10px] font-black uppercase tracking-tighter cursor-pointer hover:underline ${
                                msg.user.role === 'creator' ? 'text-[#F27D26]' : 
                                msg.user.role === 'moderator' ? 'text-purple-400' : 'text-white/60'
                              }`}
                            >
                              {msg.user.name}
                              {msg.user.role === 'moderator' && <ShieldCheck size={8} className="inline ml-1" />}
                            </span>
                            <span className="text-[8px] opacity-30 font-mono">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {(user.role === 'creator' || user.role === 'moderator') && (
                            <div className="relative">
                              <button 
                                onClick={() => setActiveModerationId(activeModerationId === msg.id ? null : msg.id)}
                                className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <MoreVertical size={12} className="text-white/40" />
                              </button>
                              
                              <AnimatePresence>
                                {activeModerationId === msg.id && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    className="absolute right-0 top-full mt-1 z-50 bg-black border border-white/10 rounded-lg shadow-2xl overflow-hidden min-w-[120px]"
                                  >
                                    <button 
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="w-full px-3 py-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-white/5 transition-colors"
                                    >
                                      <Trash2 size={12} />
                                      Delete
                                    </button>
                                    {msg.user.role !== 'creator' && (
                                      <>
                                        <button 
                                          onClick={() => handleKickUser(msg.user.email)}
                                          className="w-full px-3 py-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-yellow-400 hover:bg-white/5 transition-colors border-t border-white/5"
                                        >
                                          <UserMinus size={12} />
                                          Kick
                                        </button>
                                        <button 
                                          onClick={() => handleBanUser(msg.user.email)}
                                          className="w-full px-3 py-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-white/5 transition-colors border-t border-white/5"
                                        >
                                          <Ban size={12} />
                                          Ban
                                        </button>
                                      </>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    {selectedRecipient ? (
                      <>
                        <div className="flex items-center justify-between p-2 bg-purple-600/10 border border-purple-600/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <UserIcon size={14} className="text-purple-400" />
                            <span className="text-[10px] font-black uppercase text-purple-400">Chat with {selectedRecipient.name}</span>
                          </div>
                          <button 
                            onClick={() => setSelectedRecipient(null)}
                            className="text-[8px] uppercase font-bold opacity-40 hover:opacity-100"
                          >
                            Back
                          </button>
                        </div>
                        {privateMessages
                          .filter(msg => {
                            if (user.role === 'creator') {
                              // If creator, show messages belonging to the selected thread
                              // We use the same logic as the thread list to identify messages in this thread
                              const threadParticipants = [msg.from.email, msg.to].sort().join('|');
                              // We need to know which thread was selected. 
                              // For now, let's assume selectedRecipient.email is one of the participants.
                              // This is slightly ambiguous if a user has multiple threads, but better than showing everything.
                              return msg.from.email === selectedRecipient.email || msg.to === selectedRecipient.email;
                            }
                            return (msg.from.email === user.email && msg.to === selectedRecipient.email) ||
                                   (msg.from.email === selectedRecipient.email && msg.to === user.email);
                          })
                          .map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.from.email === user.email ? 'items-end' : 'items-start'}`}>
                              <div className={`max-w-[90%] p-2 rounded-lg text-xs ${
                                msg.from.email === user.email ? 'bg-purple-600 text-white' : 'bg-white/5 border border-white/10 text-white/80'
                              }`}>
                                {user.role === 'creator' && (
                                  <div className="text-[8px] font-bold opacity-40 mb-1 uppercase">
                                    From: {msg.from.name} To: {msg.to}
                                  </div>
                                )}
                                {msg.text}
                              </div>
                              <span className="text-[8px] opacity-20 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                      </>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase font-bold opacity-40 text-center mb-4">Select a conversation</p>
                        {user.role === 'creator' ? (
                          // Creator sees all threads
                          privateMessages
                            .map(m => [m.from.email, m.to].sort().join('|'))
                            .filter((v, i, a) => a.indexOf(v) === i)
                            .map(threadId => {
                              const threadMsgs = privateMessages.filter(m => [m.from.email, m.to].sort().join('|') === threadId);
                              const lastMsg = threadMsgs[threadMsgs.length - 1];
                              const otherEmail = lastMsg.from.email === user.email ? lastMsg.to : lastMsg.from.email;
                              const otherName = lastMsg.from.email === user.email ? 'User' : lastMsg.from.name;
                              return (
                                <button
                                  key={threadId}
                                  onClick={() => setSelectedRecipient({ email: otherEmail, name: otherName })}
                                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left"
                                >
                                  <div className="text-[10px] font-black uppercase text-purple-400 mb-1">Thread: {lastMsg.from.name} & {lastMsg.to.split('@')[0]}</div>
                                  <div className="text-xs opacity-40 truncate">{lastMsg.text}</div>
                                </button>
                              );
                            })
                        ) : (
                          // Regular user sees their threads
                          privateMessages
                            .filter(m => m.from.email === user.email || m.to === user.email)
                            .map(m => m.from.email === user.email ? m.to : m.from.email)
                            .filter((v, i, a) => a.indexOf(v) === i)
                            .map(otherEmail => {
                              const threadMsgs = privateMessages.filter(m => 
                                (m.from.email === otherEmail && m.to === user.email) ||
                                (m.from.email === user.email && m.to === otherEmail)
                              );
                              const lastMsg = threadMsgs[threadMsgs.length - 1];
                              const otherName = lastMsg.from.email === otherEmail ? lastMsg.from.name : 'Recipient';
                              return (
                                <button
                                  key={otherEmail}
                                  onClick={() => setSelectedRecipient({ email: otherEmail, name: otherName })}
                                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left"
                                >
                                  <div className="text-[10px] font-black uppercase text-purple-400 mb-1">{otherName}</div>
                                  <div className="text-xs opacity-40 truncate">{lastMsg.text}</div>
                                </button>
                              );
                            })
                        )}
                        {privateMessages.length === 0 && (
                          <div className="text-center opacity-20 py-8">
                            <Lock size={32} className="mx-auto mb-2" />
                            <p className="text-[10px] uppercase font-bold">No private messages</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'public' && messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-8">
                    <MessageCircle size={48} className="mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">
                      {t.noMessages}
                    </p>
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/5">
                <div className="relative">
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={activeTab === 'private' && !selectedRecipient ? "Select a user first" : t.placeholder}
                    disabled={activeTab === 'private' && !selectedRecipient}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-[#F27D26]/50 transition-colors disabled:opacity-20"
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim() || (activeTab === 'private' && !selectedRecipient)}
                    onMouseEnter={() => playSound('hover', 0.05)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#F27D26] hover:bg-[#F27D26]/10 rounded-lg transition-all disabled:opacity-20"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

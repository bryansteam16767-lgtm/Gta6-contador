import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Plus, LogOut, Check, ArrowRight, Loader2, RefreshCw, Send, Layout, ExternalLink, Globe, Search } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';

// Use same provider setup
const googleProvider = new GoogleAuthProvider();
// Requested scopes (must include the exact scope from metadata)
googleProvider.addScope('https://www.googleapis.com/auth/docs');

interface GoogleDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'es';
  playSound: (type: any, volume?: number) => void;
  daysRemaining: number;
}

interface SavedDoc {
  id: string;
  title: string;
  createdAt: string;
}

export default function GoogleDocsModal({ isOpen, onClose, language, playSound, daysRemaining }: GoogleDocsModalProps) {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [docsList, setDocsList] = useState<SavedDoc[]>(() => {
    const saved = localStorage.getItem('gta6_google_docs_created');
    return saved ? JSON.parse(saved) : [];
  });
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [newTitle, setNewTitle] = useState('GTA VI Countdown & Planning Notes');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active document viewing
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeDocContent, setActiveDocContent] = useState<any | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  
  // Custom appending text
  const [textToAppend, setTextToAppend] = useState('');
  const [updatingDoc, setUpdatingDoc] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Handle setting and loading the token
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // We look for a temporary cached token in sessionStorage
        const cached = sessionStorage.getItem('gta6_google_access_token');
        if (cached) {
          setAccessToken(cached);
          setGoogleUser(user);
        }
      } else {
        setGoogleUser(null);
        setAccessToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    playSound('click');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        setGoogleUser(result.user);
        sessionStorage.setItem('gta6_google_access_token', credential.accessToken);
        playSound('celebration');
      } else {
        alert(language === 'en' ? 'Could not obtain Google Docs authorization token.' : 'No se pudo obtener el token de autorización de Google Docs.');
      }
    } catch (err: any) {
      console.error('Google Docs OAuth Sign In Error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignOut = () => {
    playSound('close');
    setGoogleUser(null);
    setAccessToken(null);
    sessionStorage.removeItem('gta6_google_access_token');
  };

  // Create a real new Google Doc utilizing Google Docs API
  const handleCreateDocument = async () => {
    if (!accessToken) return;
    setCreatingDoc(true);
    playSound('click');
    try {
      const response = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTitle || 'GTA VI Countdown Report'
        })
      });

      if (!response.ok) {
        throw new Error(`Docs API responded with ${response.status}`);
      }

      const docData = await response.json();
      const newDoc: SavedDoc = {
        id: docData.documentId,
        title: docData.title,
        createdAt: new Date().toLocaleDateString()
      };

      const updatedDocs = [newDoc, ...docsList];
      setDocsList(updatedDocs);
      localStorage.setItem('gta6_google_docs_created', JSON.stringify(updatedDocs));
      setActiveDocId(docData.documentId);
      
      // Auto-append some initial countdown info
      await appendText(docData.documentId, 
        `👑 GTA VI MISSION CONTROL 👑\n` +
        `----------------------------------------\n` +
        `📝 Document: ${docData.title}\n` +
        `🕒 Created: ${new Date().toLocaleString()}\n` +
        `🎮 Days remaining until target (November 19, 2026): ${daysRemaining} days\n` +
        `----------------------------------------\n\n` +
        `Add your gameplay notes, wishlists, and mission maps right here.\n`
      );

      setSuccessMsg(language === 'en' ? 'Document created successfully!' : '¡Documento creado con éxito!');
      setTimeout(() => setSuccessMsg(''), 3000);
      playSound('celebration');
    } catch (err) {
      console.error('Error creating Google Doc:', err);
      alert(language === 'en' ? 'Error creating Google Doc. Please try signing in again.' : 'Error al crear el documento en Google Docs. Intente iniciar sesión nuevamente.');
    } finally {
      setCreatingDoc(false);
    }
  };

  // Append text to a Google Doc using Docs API :batchUpdate
  const appendText = async (docId: string, text: string) => {
    if (!accessToken) return;
    try {
      const response = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                text: text,
                endOfSegmentLocation: {} // Appends to the end of document
              }
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Batch update failed');
      }

      // Refresh document view
      fetchDocumentContent(docId);
    } catch (err) {
      console.error('Error appending text:', err);
    }
  };

  // Read/Fetch Google Doc details
  const fetchDocumentContent = async (docId: string) => {
    if (!accessToken) return;
    setLoadingDoc(true);
    try {
      const response = await fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      const data = await response.json();
      setActiveDocContent(data);
    } catch (err) {
      console.error('Error fetching document:', err);
      alert(language === 'en' ? 'Unable to load document' : 'Incapaz de cargar el documento');
    } finally {
      setLoadingDoc(false);
    }
  };

  // Trigger when selecting an existing doc
  useEffect(() => {
    if (activeDocId && accessToken) {
      fetchDocumentContent(activeDocId);
    } else {
      setActiveDocContent(null);
    }
  }, [activeDocId]);

  const handleAppendCustomText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDocId || !textToAppend.trim()) return;
    setUpdatingDoc(true);
    playSound('click');
    try {
      await appendText(activeDocId, `\n✍️ UPDATE (${new Date().toLocaleString()}):\n${textToAppend}\n`);
      setTextToAppend('');
      setSuccessMsg(language === 'en' ? 'Notes added!' : '¡Notas agregadas!');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingDoc(false);
    }
  };

  const handleAppendLiveCountdown = async () => {
    if (!activeDocId) return;
    setUpdatingDoc(true);
    playSound('click');
    try {
      const statusLine = `\n📅 STATUS LOG (${new Date().toLocaleString()}):\n🔥 GTA VI Countdown status of Leonida: Only ${daysRemaining} days left!\n`;
      await appendText(activeDocId, statusLine);
      setSuccessMsg(language === 'en' ? 'Live countdown synced!' : '¡Cuenta regresiva sincronizada!');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingDoc(false);
    }
  };

  // Convert Document Body elements to simple text representation
  const renderDocContentText = () => {
    if (!activeDocContent || !activeDocContent.body || !activeDocContent.body.content) {
      return language === 'en' ? 'No readable paragraphs.' : 'Sin párrafos legibles.';
    }

    let textOut = '';
    activeDocContent.body.content.forEach((elem: any) => {
      if (elem.paragraph && elem.paragraph.elements) {
        elem.paragraph.elements.forEach((sub: any) => {
          if (sub.textRun && sub.textRun.content) {
            textOut += sub.textRun.content;
          }
        });
      }
    });

    return textOut || (language === 'en' ? 'Document is empty.' : 'El documento está vacío.');
  };

  const filteredDocs = docsList.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
      />

      {/* Main Drawer Dashboard */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-4xl h-[85vh] bg-[#0c0c0e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans text-white z-10"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-[#212124] to-[#0c0c0e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#4285F4]/10 rounded-xl border border-[#4285F4]/35 text-[#4285F4]">
              <FileText className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#4285F4] px-1.5 py-0.5 bg-[#4285F4]/10 rounded-sm">
                  Google Workspace
                </span>
                <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                  Live Docs API
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                {language === 'en' ? 'GTA VI Document lab' : 'Laboratorio de Documentos GTA VI'}
              </h2>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Main Account Connection or App Screen */}
          {!accessToken ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
              <FileText className="w-16 h-16 text-[#4285F4] mb-4 opacity-75" />
              <h3 className="text-xl font-black mb-2 tracking-tight">
                {language === 'en' ? 'Access Google Docs Workspace' : 'Acceso a Google Docs'}
              </h3>
              <p className="text-sm text-white/60 mb-8 leading-relaxed">
                {language === 'en' 
                  ? 'Connect your personal Google Account to write game plans, leak notes, wishlists, and sync live GTA VI countdown updates into document files automatically.'
                  : 'Conecta tu cuenta personal de Google para escribir planes de juego, notas de filtraciones, listas de deseos y sincronizar la cuenta regresiva en vivo en documentos.'
                }
              </p>

              {/* GSI style button */}
              <button 
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button transition-transform active:scale-[0.98] border border-white/10 hover:border-white/20 shadow-lg cursor-pointer max-w-sm"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper p-3.5 flex items-center justify-center gap-3 bg-white hover:bg-white/95 rounded-xl text-black font-semibold text-sm">
                  {isLoggingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin text-black" />
                  ) : (
                    <div className="gsi-material-button-icon flex-shrink-0 w-5 h-5">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      </svg>
                    </div>
                  )}
                  <span>{language === 'en' ? 'Sign in with Google' : 'Iniciar sesión con Google'}</span>
                </div>
              </button>

              <p className="text-[10px] text-white/30 mt-6 tracking-wider uppercase font-bold">
                🔒 Secured via official Google Identity Service
              </p>
            </div>
          ) : (
            <>
              {/* Left Sidebar: Saved Documents list & Create Module */}
              <div className="w-full md:w-80 border-r border-white/10 flex flex-col bg-[#111113] p-4 gap-4 overflow-y-auto">
                {/* Google user header */}
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    {googleUser?.photoURL ? (
                      <img src={googleUser.photoURL} alt="Google Ava" className="w-8 h-8 rounded-full border border-white/20" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#4285F4] flex items-center justify-center font-bold text-xs text-white">G</div>
                    )}
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold truncate text-white">{googleUser?.displayName || 'Google User'}</span>
                      <span className="text-[9px] text-white/40 truncate">{googleUser?.email}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleGoogleSignOut}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400 transition-colors"
                    title={language === 'en' ? 'Sign Out' : 'Cerrar Sesión'}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Create New Document Box */}
                <div className="p-3 bg-gradient-to-br from-[#121c2c] to-[#0d121b] border border-[#4285F4]/20 rounded-xl flex flex-col gap-2.5">
                  <h4 className="text-[11px] font-black uppercase text-[#4285F4] tracking-widest flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    {language === 'en' ? 'Create Planning Doc' : 'Crear Documento'}
                  </h4>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={language === 'en' ? 'Doc Title...' : 'Título del documento...'}
                    className="px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-xs font-medium focus:border-[#4285F4]/50 outline-none w-full placeholder:text-white/30"
                  />
                  <button
                    onClick={handleCreateDocument}
                    disabled={creatingDoc || !newTitle.trim()}
                    className="w-full py-2 bg-[#4285F4] hover:bg-[#357ae8] active:translate-y-[1px] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#4285F4]/15"
                  >
                    {creatingDoc ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{language === 'en' ? 'Create on Google Docs' : 'Crear en Google Docs'}</span>
                  </button>
                </div>

                {/* Documents List */}
                <div className="flex-1 flex flex-col gap-2 mt-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#4285F4]">
                      {language === 'en' ? 'Active App Documents' : 'Documentos de la App'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded-full font-bold text-white/45">
                      {filteredDocs.length !== docsList.length ? `${filteredDocs.length}/${docsList.length}` : docsList.length}
                    </span>
                  </div>

                  {/* Search input field */}
                  {docsList.length > 0 && (
                    <div className="relative col-span-2">
                      <Search className="w-3.5 h-3.5 text-white/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={language === 'en' ? 'Search documents...' : 'Buscar documentos...'}
                        className="w-full pl-9 pr-8 py-2 bg-black/45 border border-white/5 focus:border-[#4285F4]/40 text-xs text-white rounded-xl outline-none placeholder:text-white/20 transition-all font-medium"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            playSound('click');
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/45 hover:text-white transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {docsList.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                      <FileText className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-[11px] text-white/40 leading-normal">
                        {language === 'en' 
                          ? 'No templates created yet. Type a title and create to begin!' 
                          : 'No hay plantillas creadas. ¡Escribe un título y arranca!'
                        }
                      </p>
                    </div>
                  ) : filteredDocs.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01] my-2">
                      <Search className="w-6 h-6 text-white/10 mx-auto mb-2" />
                      <p className="text-[11px] text-white/40 leading-normal">
                        {language === 'en' 
                          ? 'No matching documents found.' 
                          : 'No se encontraron documentos coincidentes.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-[220px] md:max-h-none overflow-y-auto">
                      {filteredDocs.map((doc) => {
                        const isActive = doc.id === activeDocId;
                        return (
                          <button
                            key={doc.id}
                            onClick={() => {
                              setActiveDocId(doc.id);
                              playSound('click');
                            }}
                            className={`p-2.5 text-left rounded-xl border transition-all flex items-center gap-2.5 group/btn ${
                              isActive 
                                ? 'bg-[#4285F4]/10 border-[#4285F4]/45 text-white shadow-md' 
                                : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-white/70 hover:text-white'
                            }`}
                          >
                            <FileText className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#4285F4]' : 'text-white/30 group-hover/btn:text-[#4285F4]'}`} />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-xs font-bold truncate">{doc.title}</span>
                              <span className="text-[9px] text-white/30">{doc.createdAt}</span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/btn:opacity-100 transition-opacity flex-shrink-0 text-white/40" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Area: Document Editor & Live Operations */}
              <div className="flex-1 bg-[#09090b] flex flex-col min-h-0 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {successMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-20 right-6 z-50 bg-green-500 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 border border-green-400/20"
                    >
                      <Check className="w-4 h-4" />
                      {successMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {activeDocId && activeDocContent ? (
                  <div className="p-6 flex-1 flex flex-col gap-6 min-h-0">
                    {/* Active Doc Header Options */}
                    <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#4285F4]" />
                        <div className="flex flex-col">
                          <h3 className="text-sm font-black text-white leading-none">{activeDocContent.title}</h3>
                          <span className="text-[8px] font-mono text-white/30 mt-1 uppercase tracking-wider">{activeDocContent.documentId}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => fetchDocumentContent(activeDocId)}
                          disabled={loadingDoc}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-white/60 hover:text-white"
                          title={language === 'en' ? 'Refresh Content' : 'Refrescar'}
                        >
                          <RefreshCw className={`w-4 h-4 ${loadingDoc ? 'animate-spin text-[#4285F4]' : ''}`} />
                        </button>
                        <button
                          onClick={() => window.open(`https://docs.google.com/document/d/${activeDocId}/edit`, '_blank')}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#4285F4]" />
                          <span>{language === 'en' ? 'Open Doc' : 'Ver Original'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Integrated Embedded Sandbox & Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                      
                      {/* Live Append / Push Updates */}
                      <div className="flex flex-col gap-4">
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-3">
                          <h4 className="text-[11px] font-black uppercase text-[#4285F4] tracking-widest flex items-center justify-between">
                            <span>⚡ Add GTA VI Mission Intel</span>
                            <span className="text-[9px] font-mono text-pink-400 lowercase italic">docs.batchUpdate</span>
                          </h4>
                          
                          <p className="text-xs text-white/50 leading-relaxed">
                            {language === 'en'
                              ? 'Directly inject critical game release data, your custom strategies, countdown timestamps and notes directly into this Google Document.'
                              : 'Inyecta datos críticos del lanzamiento del juego, tus estrategias, tiempos de cuenta regresiva y notas dentro del documento.'
                            }
                          </p>

                          <div className="flex flex-col gap-2 mt-1">
                            <button
                              onClick={handleAppendLiveCountdown}
                              disabled={updatingDoc}
                              className="w-full py-2.5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 border border-pink-500/25 text-pink-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                            >
                              {updatingDoc ? (
                                <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                              ) : (
                                <Send className="w-4 h-4 text-pink-400" />
                              )}
                              <span>{language === 'en' ? 'Push Live Countdown Status' : 'Insertar Cuenta Regresiva En Vivo'}</span>
                            </button>
                          </div>
                        </div>

                        <form onSubmit={handleAppendCustomText} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-2.5">
                          <h4 className="text-[11px] font-black uppercase text-white/70 tracking-widest">
                            ✍️ {language === 'en' ? 'Write Document Draft Notes' : 'Escribir Borrador'}
                          </h4>
                          <textarea
                            value={textToAppend}
                            onChange={(e) => setTextToAppend(e.target.value)}
                            placeholder={
                              language === 'en' 
                                ? 'Type something (e.g., Lucia and Jason are heist targets in Vice City...)' 
                                : 'Escribe algo (ej., Lucia y Jason serán objetivos en Vice City...)'
                            }
                            rows={3}
                            className="w-full p-3 bg-black/60 border border-white/10 rounded-xl text-xs outline-none focus:border-[#4285F4]/40 placeholder:text-white/20 font-medium resize-none leading-normal"
                          />
                          <button
                            type="submit"
                            disabled={updatingDoc || !textToAppend.trim()}
                            className="py-2.5 bg-[#4285F4] hover:bg-[#357ae8] active:translate-y-[1px] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors duration-200"
                          >
                            <span>{language === 'en' ? 'Append Notes' : 'Agregar Notas'}</span>
                          </button>
                        </form>
                      </div>

                      {/* Display Document Reader */}
                      <div className="bg-black/40 border border-white/10 rounded-2xl flex flex-col min-h-[180px] overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black tracking-widest text-[#4285F4]">
                            📖 {language === 'en' ? 'Real-Time Reader View' : 'Vista de Lector'}
                          </span>
                          <span className="text-[9px] font-bold text-white/30">
                            {renderDocContentText().length} {language === 'en' ? 'Chars' : 'Carácteres'}
                          </span>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] text-white/80 leading-relaxed whitespace-pre-wrap select-text">
                          {loadingDoc ? (
                            <div className="h-full flex flex-col items-center justify-center gap-2 text-white/45">
                              <Loader2 className="w-5 h-5 animate-spin text-[#4285F4]" />
                              <span>{language === 'en' ? 'Fetching contents...' : 'Obteniendo contenidos...'}</span>
                            </div>
                          ) : (
                            renderDocContentText()
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/40">
                    <Layout className="w-12 h-12 mb-3 text-white/15" />
                    <p className="text-xs font-medium">
                      {language === 'en' 
                        ? 'Select a document from the left list or create a new planning report!' 
                        : '¡Seleccione un documento del menú izquierdo o cree un reporte para empezar!'
                      }
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-white/10 bg-black/40 text-[10px] text-white/30 text-center uppercase font-bold tracking-widest flex items-center justify-center gap-3">
          <span>Google Docs API v1 Secure Channel</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>No personal data altered without explicit consent</span>
        </div>
      </motion.div>
    </div>
  );
}

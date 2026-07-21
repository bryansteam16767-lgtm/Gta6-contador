export type Language = 'en' | 'es';

export const translations = {
  en: {
    countdown: {
      years: 'Years',
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds',
      until: 'Until Greatness',
      released: 'The Wait is Over',
      intel: {
        title: 'Release Intel',
        official: 'Official Window: Fall 2025 (Take-Two)',
        rumor1: 'Rumored: May 2026 Reveal Event',
        rumor2: 'Launch Target: Fall 2026',
        source: 'Source: R* Insider Feed'
      },
      gta5: {
        title: 'GTA V Price Check',
        price: 'Current Price: $14.99 - $29.99',
        platforms: 'PS5 • Xbox Series X/S • PC',
        button: 'Check GTA V Price'
      }
    },
    home: {
      releaseWindow: 'Official Release Window',
      location: 'Vice City • November 19, 2026',
      welcome: 'Welcome to Leonida',
      available: 'GTA 6 is Now Available',
      detectedLocation: (loc: string) => `Days left in ${loc}`
    },
    liveChat: {
      title: 'Leonida Live Chat',
      placeholder: 'Type a message...',
      noMessages: 'No messages yet. Start the conversation!',
      button: 'Live Chat',
      online: 'Online',
      requestMod: 'Request Moderator',
      modRequested: 'Request Sent',
      modApproved: 'You are now a Moderator!',
      modDenied: 'Moderator request denied.'
    },
    share: {
      title: 'Share Countdown',
      twitter: 'Share on Twitter',
      facebook: 'Share on Facebook',
      whatsapp: 'Share on WhatsApp',
      telegram: 'Share on Telegram',
      more: 'More Options',
      copyLink: 'Copy Link',
      copied: 'Link copied to clipboard!',
      totalShares: 'Total Shares',
      liveUpdates: 'Live Updates',
      tweet: (days: number) => `Counting down to GTA 6! 🌴 Only ${days} days left until November 19, 2026. #GTA6 #RockstarGames`
    },
    ui: {
      applyChanges: 'Apply Changes',
      resetCountdown: 'Reset Countdown',
      testRelease: 'Test Release State',
      liveFromLeonida: 'Live from Leonida',
      signalEncrypted: 'Signal: Encrypted',
      sourceNetwork: 'Source: R* Global Network',
      complete: 'Complete'
    },
    nav: {
      watchTrailer: 'Watch Trailer',
      officialTrailer: 'Official Trailer',
      signIn: 'Sign In',
      logOut: 'Log Out',
      creatorLab: 'Creator Lab',
      settings: 'Settings',
      share: 'Share',
      premium: 'Premium',
      radio: 'Radio',
      fullscreen: 'Fullscreen',
      mapExplorer: 'Map Explorer',
      weather: 'Vice Weather'
    },
    radio: {
      title: 'Vice City Radio',
      nowPlaying: 'Now Playing',
      switching: 'Switching Station...',
      off: 'Radio Off',
      stations: {
        vTheme: 'Vice Theme',
        flashFM: 'Flash FM',
        emotion: 'Emotion 98.3',
        vRock: 'V-Rock',
        if99: 'IF99',
        vibe: 'Vibe 105.1',
        lowdown: 'The Lowdown',
        wave: 'Leonida Wave'
      }
    },
    auth: {
      socialClub: 'Social Club',
      masterCreator: 'Master Creator',
      signIn: 'Sign In',
      createAccount: 'Create Account',
      email: 'Email Address',
      password: 'Password',
      username: 'Username',
      rememberMe: 'Remember Me',
      forgotPassword: 'Forgot Password?',
      alreadyHaveAccount: 'Already have an account? Sign In',
      dontHaveAccount: "Don't have an account? Create one",
      secure: 'Secure Connection • Rockstar Games'
    },
    rewards: {
      unlocked: 'Reward Unlocked!',
      creatorActive: 'Creator Mode Active!',
      intelEnabled: 'Social Club Intel Feed Enabled',
      accessGranted: 'Full System Access Granted'
    },
    tooltips: {
      googleDocs: 'Open Google Docs integration to create, read, and write GTA VI countdown reports and planning documents.',
      liveChat: 'Open real-time community chat to interact with other fans.',
      creatorLab: 'Access AI-powered tools to generate characters, missions, and more.',
      radio: 'Listen to curated Vice City radio stations while you wait.',
      gta5Price: 'Check the current price of GTA V across different platforms.',
      mapExplorer: 'Explore iconic Vice City locations and uncover AI-generated lore.',
      weather: 'View live dynamic weather radar and atmospheric updates across Leonida.',
      settings: 'Customize the countdown and application settings.',
      hackMode: 'Toggle Vice City Hack Mode for a retro aesthetic.',
      mute: 'Mute or unmute background music and sound effects.',
      share: 'Share the countdown with your friends on social media.',
      watchTrailer: 'Watch the official GTA VI trailer.',
      signIn: 'Sign in to your Social Club account to unlock rewards.',
      logOut: 'Log out of your current session.',
      premium: 'Upgrade to Premium for exclusive features and content.',
      imageGen: 'Generate high-quality images using Gemini AI.',
      videoGen: 'Animate your images into videos using Veo AI.',
      characterGen: 'Create unique Vice City characters with detailed bios.',
      missionGen: 'Design custom missions and heists for Leonida.',
      liveFeed: 'Monitor real-time system status and broadcasts.',
      socialVault: 'Access shared community creations and assets.',
      userMgmt: 'Manage user accounts and moderator requests.',
      support: 'Handle community support and feedback tickets.',
      analytics: 'View real-time traffic and engagement metrics.',
      achievements: 'Track your progress and unlock visual rewards.',
      map: 'Explore rumors and intel across the Leonida map.',
      build: 'Compile and render Vice City assets.',
      fullscreen: 'Toggle cinematic fullscreen mode for an immersive experience.'
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      notifications: 'Notifications',
      enableNotifications: 'Enable Notifications',
      soundEffects: 'Sound Effects',
      uiDensity: 'UI Density',
      compact: 'Compact',
      standard: 'Standard',
      theme: 'Theme',
      viceCity: 'Vice City (Neon)',
      noir: 'Vice Noir (Dark)',
      classic: 'Classic (Retro)',
      save: 'Save Changes',
      releaseNotifications: 'GTA 6 Release Alerts',
      enableReleaseNotifications: 'Enable Countdown Alerts',
      releaseNotificationsDesc: 'Notify 24 hours and 1 hour before the November 19, 2026 launch.',
      test24hAlert: 'Simulate 24h Alert',
      test1hAlert: 'Simulate 1h Alert',
      browserPermission: 'Browser Permission',
      requestPermission: 'Request Access',
      permissionGranted: 'Granted',
      permissionDenied: 'Blocked',
      trailerSection: 'Trailer Customization',
      trailerDesc: 'Customize the YouTube Video ID or URL played by the trailer button.',
      trailerPlaceholder: 'Enter YouTube Video ID or full URL...',
      trailerPresetLabel: 'Presets',
      trailerCustomLabel: 'Custom Video',
      trailerPreset1: 'GTA VI Official Trailer 1',
      trailerPreset2: 'Vice City Fan Soundtrack',
      trailerPreset3: 'GTA VI Cinematic Hype',
      bgVideoLabel: 'Background Video',
      bgVideoDesc: 'Play the trailer video as an animated background behind the countdown.'
    },
    creatorLab: {
      title: 'Creator Lab',
      poweredBy: 'Powered by Gemini & Veo',
      connected: 'Connected',
      build: {
        title: 'System Build',
        description: 'Compile and render Vice City assets.',
        start: 'Start Build',
        rendering: 'Rendering...',
        connected: 'CONNECTED',
        logs: {
          start: 'Render Start',
          end: 'Render End'
        }
      },
      masterAccess: 'Master Creator Access',
      tabs: {
        image: 'Image Gen',
        video: 'Video Gen',
        character: 'Character Gen',
        mission: 'Mission Gen',
        build: 'Build',
        live: 'Live Feed',
        social: 'Social Vault',
        users: 'User Management',
        support: 'Support Requests',
        analytics: 'Analytics',
        achievements: 'Achievements',
        map: 'Interactive Map',
        soundtrack: 'Soundtrack Intel'
      },
      soundtrack: {
        title: 'Leonida Soundtrack Intel',
        description: 'Track rumored and confirmed artists for GTA VI.',
        confirmed: 'Confirmed Tracks',
        rumors: 'Rumored Artists',
        stations: 'Projected Stations',
        status: 'Status',
        tracks: [
          { artist: 'Tom Petty', song: 'Love Is a Long Road', station: 'V-Rock', status: 'Confirmed (Trailer 1)' },
          { artist: 'Rick James', song: 'Give It to Me Baby', station: 'The Lowdown', status: 'Rumored (Leak)' },
          { artist: 'The Weeknd', song: 'Blinding Lights', station: 'IF99', status: 'Highly Rumored' },
          { artist: 'Pet Shop Boys', song: 'West End Girls', station: 'Flash FM', status: 'Rumored (80s Classic)' }
        ]
      },
      character: {
        title: 'Character Generator',
        description: 'Create a unique Vice City resident with AI.',
        prompt: 'Character Concept',
        promptPlaceholder: 'e.g. A retired hitman living in a trailer park...',
        generate: 'Generate Character',
        generating: 'Recruiting...',
        placeholder: 'Generated character details will appear here',
        stats: {
          name: 'Name',
          role: 'Role',
          background: 'Background',
          traits: 'Traits',
          outfit: 'Signature Outfit'
        }
      },
      mission: {
        title: 'Mission Generator',
        description: 'Design a high-stakes heist or street hustle.',
        prompt: 'Mission Concept',
        promptPlaceholder: 'e.g. A high-speed chase through the neon district...',
        generate: 'Generate Mission',
        generating: 'Planning Heist...',
        placeholder: 'Generated mission briefing will appear here',
        details: {
          title: 'Mission Title',
          objective: 'Objective',
          difficulty: 'Difficulty',
          payout: 'Estimated Payout',
          briefing: 'Briefing'
        }
      },
      users: {
        title: 'User Management',
        email: 'Email',
        username: 'Username',
        role: 'Role',
        lastLogin: 'Last Login',
        noUsers: 'No users registered yet.',
        requests: 'Mod Requests',
        approve: 'Approve',
        deny: 'Deny',
        noRequests: 'No pending requests.'
      },
      image: {
        prompt: 'Prompt',
        promptPlaceholder: 'Describe the image you want to generate...',
        resolution: 'Resolution',
        generate: 'Generate Image',
        generating: 'Generating...',
        placeholder: 'Generated image will appear here',
        styles: {
          label: 'Visual Style',
          neon: 'Neon Night',
          retro: '80s Retro',
          cinematic: 'Cinematic',
          noir: 'Vice Noir',
          vibrant: 'Vibrant Day'
        },
        presets: {
          label: 'Vice City Presets',
          oceanDrive: 'Cinematic Ocean Drive at golden hour, ultra-realistic GTA 6 aesthetic, neon signs flickering, palm trees swaying, 4k',
          neonDistrict: 'Aerial view of Vice City neon district at night, vibrant pink and teal lighting, wet asphalt reflections, cinematic lighting',
          everglades: 'Atmospheric Everglades swamp at dawn, morning mist, high-detail vegetation, GTA 6 cinematic style, 4k',
          luxuryVilla: 'Luxury Star Island mansion with infinity pool, sunset backdrop, ultra-realistic textures, Vice City luxury aesthetic'
        }
      },
      video: {
        source: 'Source Image',
        sourceLabel: 'Source Image',
        uploadPlaceholder: 'Click to upload image',
        prompt: 'Animation Prompt',
        promptPlaceholder: 'Describe how you want to animate the image...',
        resolution: 'Resolution',
        generate: 'Generate Video',
        animating: 'Animating...',
        placeholder: 'Generated video will appear here',
        download: 'Download Video',
        presets: {
          label: 'Animation Presets',
          sunset: 'Cinematic sunset over Vice City beach, waves gently crashing, palm trees swaying in the wind, 4k',
          neon: 'Neon signs flickering on Ocean Drive at night, rain reflections on the street, moving traffic lights',
          traffic: 'Fast moving traffic on the highway at night, long exposure light trails, GTA 6 cinematic style',
          beach: 'Palm trees swaying in the wind on the beach, morning mist, high-detail vegetation, 4k'
        }
      },
      live: {
        controls: 'Broadcast Controls',
        start: 'Start Camera',
        stop: 'Stop Camera',
        upload: 'Upload Video',
        newsNetwork: 'Leonida News Network',
        description: 'Simula a live broadcast from Vice City. Use your camera or upload a video to see the "Live from Leonida" overlay in action.',
        placeholder: 'Start camera or upload video',
        breaking: 'BREAKING NEWS',
        overlays: 'Overlay Settings',
        titleCard: 'Broadcast Title',
        viewerCount: 'Viewer Count',
        newSub: 'Newest Subscriber',
        subAlert: 'New Subscriber!',
        viewers: 'Viewers'
      },
      social: {
        locked: 'Social Vault Locked',
        lockedDesc: 'You must be signed in to the Social Club to upload and share files with the community.',
        upload: 'Upload to Vault',
        drop: 'Drop files or click to upload',
        anyFile: 'Any file type supported',
        security: 'Vault Security',
        securityDesc: 'Your uploads are encrypted and stored in the Leonida State Cloud. Only Social Club members can access the community vault.',
        activity: 'Recent Vault Activity',
        noActivity: 'No recent activity',
        details: {
          name: 'Name',
          type: 'Type',
          size: 'Size',
          date: 'Date',
          uploader: 'Uploader'
        }
      },
      sharing: {
        title: 'Share Asset',
        twitter: 'Post to X',
        facebook: 'Share on Facebook',
        whatsapp: 'Send via WhatsApp',
        telegram: 'Share on Telegram',
        copy: 'Copy Media Link',
        copied: 'Media link copied!',
        shareText: 'Check out this GTA VI leak I generated in the Leonida Creator Lab! 🌴🔥 #GTAVI #Leonida #RockstarGames'
      },
      location: {
        tracking: 'Satellite Tracking Active',
        transmitting: 'Transmitting live coordinates to the Master Creator...',
        status: 'Signal Strength: High',
        coordinates: 'GPS Locked'
      }
    },
    chat: {
      support: '24/7 Member Support',
      creatorCommand: 'Creator Command',
      premiumAccess: 'Premium Social Club Access',
      masterAccess: 'Master Access Active',
      online: 'Online',
      placeholder: 'Ask about Vice City...',
      informant: 'Informant',
      welcome: (name: string) => `Welcome to 24/7 Social Club Support & Intel, ${name}. I'm your dedicated Leonida informant. How can I assist you today?`,
      creatorWelcome: (name: string) => `Greetings, Master Creator ${name}. The system is at your command. How shall we shape Leonida today?`,
      error: "The signal is weak... try asking again, Social Club member.",
      requestSupport: "Request Support",
      supportRequested: "Support Requested",
      supportDesc: "Need help? Click to notify the Master Creator.",
      supportNotification: "New Support Request!",
      supportFrom: (name: string) => `Support requested by ${name}`
    },
    subscription: {
      title: 'Subscription Plans',
      monthly: '$1.99 / Month',
      lifetime: '$4.99 / Lifetime',
      lifetimeCriminal: 'Lifetime Criminal',
      currentPlan: 'Current Plan',
      upgrade: 'Upgrade Now',
      features: 'Features',
      wantedLevel: 'Wanted Level',
      freeStars: '3 Stars (Standard)',
      premiumStars: '5 Stars (Maximum)',
      plans: [
        {
          id: 'premium',
          name: 'Vice City Premium',
          price: '$1.99',
          features: [
            'Remove Ads',
            'Exclusive Neon Backgrounds',
            'Night Crime Dark Mode',
            'Custom Countdown'
          ]
        },
        {
          id: 'fivestar',
          name: '5-Star Mode',
          price: '$4.99',
          features: [
            'Exclusive Daily Sounds',
            'Rockstar News Alerts',
            'Exclusive Widgets',
            '5-Star Wanted Level'
          ]
        },
        {
          id: 'ai',
          name: 'AI Early Access',
          price: 'Included',
          features: [
            'GTA Character Generator',
            'Mission Generator',
            'NPC Style Chat'
          ]
        }
      ]
    },
    analytics: {
      title: 'Analytics Dashboard',
      activeUsers: 'Live Connections',
      totalUsers: 'Total Members',
      sessions: 'Active Sessions',
      traffic: 'Network Traffic',
      realTime: 'Real-Time Feed',
      platform: 'Platform Distribution',
      region: 'Regional Access',
      liveConnections: 'Live Connections',
      totalMembers: 'Total Members',
      regionalData: 'Regional Data'
    },
    achievements: {
      title: 'Social Club Achievements',
      locked: 'Locked Achievement',
      unlocked: 'Achievement Unlocked!',
      progress: 'Progress',
      list: [
        { id: 'first_visit', title: 'Fresh Meat', description: 'Joined the Leonida Social Club.', icon: 'UserPlus' },
        { id: 'time_10m', title: 'Citizen of Vice', description: 'Spent 10 minutes in the simulation.', icon: 'Clock' },
        { id: 'chat_active', title: 'Informant', description: 'Sent your first message in live chat.', icon: 'MessageSquare' },
        { id: 'map_explorer', title: 'Tourist', description: 'Explored the interactive map of Leonida.', icon: 'Map' }
      ]
    },
    map: {
      title: 'Leonida Interactive Map',
      rumors: 'Map Rumors & Intel',
      explore: 'Explore the State of Leonida',
      hotspot: 'Intel Point',
      locations: {
        viceCity: 'Vice City',
        everglades: 'The Everglades',
        portGellhorn: 'Port Gellhorn',
        keys: 'The Keys'
      }
    },
    mapExplorer: {
      title: 'Leonida Map Explorer',
      subtitle: 'SATELLITE INTEL SYSTEM',
      locTypeAll: 'All Locations',
      locTypeBeaches: 'Beaches & Coasts',
      locTypeUrban: 'Urban & Districts',
      locTypeIndustrial: 'Industrial & Ports',
      locTypeNature: 'Swamps & Nature',
      locTypeLuxury: 'Luxury & Estates',
      coordinates: 'COORDINATES',
      decryptIntel: 'DECRYPT SATELLITE INTEL',
      rescanIntel: 'RE-SCAN SECTOR',
      loading: 'DECRYPTING SATELLITE RADAR DATA...',
      defaultLore: 'Select any sector on the tactical radar grid to decrypt local lore, rumored underworld activity, and leaked intelligence from the streets of Vice City.',
      error: 'Connection timed out. Satellite encryption signal lost.',
      sector: 'SECTOR'
    },
    weatherWidget: {
      title: 'Vice City Weather Radar',
      subtitle: 'LEONIDA METEOROLOGICAL NETWORK',
      zoneLabel: 'Leonida Zones',
      refreshRadar: 'REFRESH RADAR',
      simulateStorm: 'SIMULATE TROPICAL SHIFT',
      tempScale: 'UNIT',
      humidity: 'HUMIDITY',
      wind: 'WIND SPEED',
      uvIndex: 'UV INDEX',
      airQuality: 'AIR QUALITY',
      advisory: 'METEO ADVISORY',
      loreTip: 'FIELD CONDITIONS',
      forecastTitle: '5-DAY ATMOSPHERIC FORECAST',
      lastUpdated: 'RADAR SYNC',
      liveRadarStatus: 'LIVE METEO RADAR'
    }
  },
  es: {
    countdown: {
      years: 'Años',
      days: 'Días',
      hours: 'Horas',
      minutes: 'Minutos',
      seconds: 'Segundos',
      until: 'Hasta la Grandeza',
      released: 'La espera ha terminado',
      intel: {
        title: 'Información de Lanzamiento',
        official: 'Ventana Oficial: Otoño 2025 (Take-Two)',
        rumor1: 'Rumor: Evento de Revelación Mayo 2026',
        rumor2: 'Objetivo de Lanzamiento: Otoño 2026',
        source: 'Fuente: Feed de R* Insider'
      },
      gta5: {
        title: 'Precio de GTA V',
        price: 'Precio Actual: $14.99 - $29.99',
        platforms: 'PS5 • Xbox Series X/S • PC',
        button: 'Ver Precio de GTA V'
      }
    },
    home: {
      releaseWindow: 'Ventana de Lanzamiento Oficial',
      location: 'Vice City • 19 de Noviembre, 2026',
      welcome: 'Bienvenido a Leonida',
      available: 'GTA 6 ya está disponible',
      detectedLocation: (loc: string) => `Días restantes en ${loc}`
    },
    liveChat: {
      title: 'Chat en Vivo Leonida',
      placeholder: 'Escribe un mensaje...',
      noMessages: 'No hay mensajes todavía. ¡Inicia la conversación!',
      button: 'Chat en Vivo',
      online: 'En línea',
      requestMod: 'Solicitar Moderador',
      modRequested: 'Solicitud Enviada',
      modApproved: '¡Ahora eres Moderador!',
      modDenied: 'Solicitud de moderador denegada.'
    },
    share: {
      title: 'Compartir Cuenta Regresiva',
      twitter: 'Compartir en Twitter',
      facebook: 'Compartir en Facebook',
      whatsapp: 'Compartir en WhatsApp',
      telegram: 'Compartir en Telegram',
      more: 'Más Opciones',
      es_more: 'Más Opciones',
      copyLink: 'Copiar Enlace',
      copied: '¡Enlace copiado al portapapeles!',
      totalShares: 'Total Compartido',
      liveUpdates: 'En Vivo',
      tweet: (days: number) => `¡Contando los días para GTA 6! 🌴 Solo quedan ${days} días para el 19 de noviembre de 2026. #GTA6 #RockstarGames`
    },
    ui: {
      applyChanges: 'Aplicar Cambios',
      resetCountdown: 'Reiniciar Cuenta Regresiva',
      testRelease: 'Probar Estado de Lanzamiento',
      liveFromLeonida: 'En vivo desde Leonida',
      signalEncrypted: 'Señal: Encriptada',
      sourceNetwork: 'Fuente: Red Global de R*',
      complete: 'Completado'
    },
    nav: {
      watchTrailer: 'Ver Tráiler',
      officialTrailer: 'Tráiler Oficial',
      signIn: 'Iniciar Sesión',
      logOut: 'Cerrar Sesión',
      creatorLab: 'Laboratorio del Creador',
      settings: 'Ajustes',
      share: 'Compartir',
      premium: 'Premium',
      radio: 'Radio',
      fullscreen: 'Pantalla Completa',
      mapExplorer: 'Explorador del Mapa',
      weather: 'Clima Vice'
    },
    radio: {
      title: 'Radio Vice City',
      nowPlaying: 'Reproduciendo Ahora',
      switching: 'Cambiando de Estación...',
      off: 'Radio Apagada',
      stations: {
        vTheme: 'Vice Theme',
        flashFM: 'Flash FM',
        emotion: 'Emotion 98.3',
        vRock: 'V-Rock',
        if99: 'IF99',
        vibe: 'Vibe 105.1',
        lowdown: 'The Lowdown',
        wave: 'Leonida Wave'
      }
    },
    auth: {
      socialClub: 'Social Club',
      masterCreator: 'Maestro Creador',
      signIn: 'Iniciar Sesión',
      createAccount: 'Crear Cuenta',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      username: 'Nombre de usuario',
      rememberMe: 'Recuérdame',
      forgotPassword: '¿Olvidaste tu contraseña?',
      alreadyHaveAccount: '¿Ya tienes una cuenta? Inicia sesión',
      dontHaveAccount: '¿No tienes una cuenta? Crea una',
      secure: 'Conexión Segura • Rockstar Games'
    },
    rewards: {
      unlocked: '¡Recompensa Desbloqueada!',
      creatorActive: '¡Modo Creador Activo!',
      intelEnabled: 'Feed de Inteligencia Social Club Activado',
      accessGranted: 'Acceso Total al Sistema Concedido'
    },
    tooltips: {
      googleDocs: 'Abre la integración de Google Docs para crear, leer y escribir informes de la cuenta regresiva y documentos de planificación de GTA VI.',
      liveChat: 'Abre el chat comunitario en tiempo real para interactuar con otros fans.',
      creatorLab: 'Accede a herramientas de IA para generar personajes, misiones y más.',
      radio: 'Escucha estaciones de radio seleccionadas de Vice City mientras esperas.',
      gta5Price: 'Consulta el precio actual de GTA V en diferentes plataformas.',
      mapExplorer: 'Explora ubicaciones icónicas de Vice City y descubre historias generadas por IA.',
      weather: 'Consulta el radar meteorológico en vivo y las condiciones atmosféricas de Leonida.',
      settings: 'Personaliza la cuenta regresiva y los ajustes de la aplicación.',
      hackMode: 'Activa el modo Hack de Vice City para una estética retro.',
      mute: 'Silencia o activa la música de fondo y los efectos de sonido.',
      share: 'Comparte la cuenta regresiva con tus amigos en redes sociales.',
      watchTrailer: 'Mira el tráiler oficial de GTA VI.',
      signIn: 'Inicia sesión en tu cuenta de Social Club para desbloquear recompensas.',
      logOut: 'Cierra la sesión actual.',
      premium: 'Mejora a Premium para obtener funciones y contenido exclusivos.',
      imageGen: 'Genera imágenes de alta calidad usando la IA de Gemini.',
      videoGen: 'Anima tus imágenes en videos usando la IA de Veo.',
      characterGen: 'Crea personajes únicos de Vice City con biografías detalladas.',
      missionGen: 'Diseña misiones y robos personalizados para Leonida.',
      liveFeed: 'Monitorea el estado del sistema y las transmisiones en tiempo real.',
      socialVault: 'Accede a creaciones y activos compartidos de la comunidad.',
      userMgmt: 'Gestiona cuentas de usuario y solicitudes de moderador.',
      support: 'Maneja tickets de soporte y comentarios de la comunidad.',
      analytics: 'Ver métricas de tráfico y compromiso en tiempo real.',
      achievements: 'Rastrea tu progreso y desbloquea recompensas visuales.',
      map: 'Explora rumores e información en el mapa de Leonida.',
      build: 'Compila y renderiza activos de Vice City.',
      fullscreen: 'Activa o desactiva el modo de pantalla completa para una experiencia cinematográfica.'
    },
    settings: {
      title: 'Ajustes',
      language: 'Idioma',
      notifications: 'Notificaciones',
      enableNotifications: 'Activar Notificaciones',
      soundEffects: 'Efectos de Sonido',
      uiDensity: 'Densidad de Interfaz',
      compact: 'Compacto',
      standard: 'Estándar',
      theme: 'Tema',
      viceCity: 'Vice City (Neón)',
      noir: 'Vice Noir (Oscuro)',
      classic: 'Clásico (Retro)',
      save: 'Guardar Cambios',
      releaseNotifications: 'Alertas de Lanzamiento GTA 6',
      enableReleaseNotifications: 'Activar Alertas de Cuenta Regresiva',
      releaseNotificationsDesc: 'Notificar 24 horas y 1 hora antes del lanzamiento el 19 de noviembre de 2026.',
      test24hAlert: 'Simular Alerta 24h',
      test1hAlert: 'Simular Alerta 1h',
      browserPermission: 'Permiso del Navegador',
      requestPermission: 'Solicitar Acceso',
      permissionGranted: 'Concedido',
      permissionDenied: 'Bloqueado',
      trailerSection: 'Personalización de Tráiler',
      trailerDesc: 'Personaliza el ID o enlace de YouTube que se reproduce al pulsar el botón del tráiler.',
      trailerPlaceholder: 'Introduce el ID o enlace completo de YouTube...',
      trailerPresetLabel: 'Preajustes',
      trailerCustomLabel: 'Video Personalizado',
      trailerPreset1: 'Tráiler Oficial 1 de GTA VI',
      trailerPreset2: 'Banda Sonora Vice City',
      trailerPreset3: 'Hype Cinemático de GTA VI',
      bgVideoLabel: 'Video de Fondo',
      bgVideoDesc: 'Reproduce el video del tráiler como un fondo animado detrás del contador.'
    },
    creatorLab: {
      title: 'Laboratorio del Creador',
      poweredBy: 'Impulsado por Gemini y Veo',
      connected: 'Conectado',
      build: {
        title: 'Compilación del Sistema',
        description: 'Compila y renderiza activos de Vice City.',
        start: 'Iniciar Compilación',
        rendering: 'Renderizando...',
        connected: 'CONECTADO',
        logs: {
          start: 'Inicio de Renderizado',
          end: 'Fin de Renderizado'
        }
      },
      masterAccess: 'Acceso Maestro Creador',
      tabs: {
        image: 'Gen de Imagen',
        video: 'Gen de Vídeo',
        character: 'Gen de Personaje',
        mission: 'Gen de Misión',
        build: 'Compilación',
        live: 'Transmisión',
        social: 'Bóveda Social',
        users: 'Gestión de Usuarios',
        support: 'Solicitudes de Soporte',
        analytics: 'Analíticas',
        achievements: 'Logros',
        map: 'Mapa Interactivo',
        soundtrack: 'Intel de Banda Sonora'
      },
      soundtrack: {
        title: 'Intel de Banda Sonora de Leonida',
        description: 'Rastrea artistas rumoreados y confirmados para GTA VI.',
        confirmed: 'Pistas Confirmadas',
        rumors: 'Artistas Rumoreados',
        stations: 'Estaciones Proyectadas',
        status: 'Estado',
        tracks: [
          { artist: 'Tom Petty', song: 'Love Is a Long Road', station: 'V-Rock', status: 'Confirmado (Tráiler 1)' },
          { artist: 'Rick James', song: 'Give It to Me Baby', station: 'The Lowdown', status: 'Rumoreado (Filtración)' },
          { artist: 'The Weeknd', song: 'Blinding Lights', station: 'IF99', status: 'Muy Rumoreado' },
          { artist: 'Pet Shop Boys', song: 'West End Girls', station: 'Flash FM', status: 'Rumoreado (Clásico 80s)' }
        ]
      },
      character: {
        title: 'Generador de Personajes',
        description: 'Crea un residente único de Vice City con IA.',
        prompt: 'Concepto de Personaje',
        promptPlaceholder: 'ej. Un sicario retirado que vive en un parque de caravanas...',
        generate: 'Generar Personaje',
        generating: 'Reclutando...',
        placeholder: 'Los detalles del personaje generado aparecerán aquí',
        stats: {
          name: 'Nombre',
          role: 'Rol',
          background: 'Trasfondo',
          traits: 'Rasgos',
          outfit: 'Atuendo Distintivo'
        }
      },
      mission: {
        title: 'Generador de Misiones',
        description: 'Diseña un atraco de alto riesgo o un trapicheo callejero.',
        prompt: 'Concepto de Misión',
        promptPlaceholder: 'ej. Una persecución a alta velocidad por el distrito neón...',
        generate: 'Generar Misión',
        generating: 'Planeando Atraco...',
        placeholder: 'El informe de la misión generada aparecerá aquí',
        details: {
          title: 'Título de la Misión',
          objective: 'Objetivo',
          difficulty: 'Dificultad',
          payout: 'Pago Estimado',
          briefing: 'Informe'
        }
      },
      users: {
        title: 'Gestión de Usuarios',
        email: 'Correo',
        username: 'Usuario',
        role: 'Rol',
        lastLogin: 'Último Acceso',
        noUsers: 'No hay usuarios registrados todavía.',
        requests: 'Solicitudes de Mod',
        approve: 'Aprobar',
        deny: 'Denegar',
        noRequests: 'No hay solicitudes pendientes.'
      },
      image: {
        prompt: 'Indicación',
        promptPlaceholder: 'Describe la imagen que quieres generar...',
        resolution: 'Resolución',
        generate: 'Generar Imagen',
        generating: 'Generando...',
        placeholder: 'La imagen generada aparecerá aquí',
        styles: {
          label: 'Estilo Visual',
          neon: 'Noche de Neón',
          retro: 'Retro de los 80',
          cinematic: 'Cinemático',
          noir: 'Vice Noir',
          vibrant: 'Día Vibrante'
        },
        presets: {
          label: 'Ajustes de Vice City',
          oceanDrive: 'Ocean Drive al Atardecer',
          neonDistrict: 'Skyline del Distrito Neón',
          everglades: 'Pantano de los Everglades',
          luxuryVilla: 'Villa de Lujo en Star Island'
        }
      },
      video: {
        source: 'Imagen de Origen',
        sourceLabel: 'Imagen de Origen',
        uploadPlaceholder: 'Haz clic para subir imagen',
        prompt: 'Indicación de Animación',
        promptPlaceholder: 'Describe cómo quieres animar la imagen...',
        resolution: 'Resolución',
        generate: 'Generar Vídeo',
        animating: 'Animando...',
        placeholder: 'El vídeo generado aparecerá aquí',
        download: 'Descargar Vídeo',
        presets: {
          label: 'Ajustes de Animación',
          sunset: 'Atardecer sobre el océano con olas en movimiento',
          neon: 'Letreros de neón parpadeando bajo la lluvia',
          traffic: 'Tráfico rápido en la autopista por la noche',
          beach: 'Palmeras meciéndose con el viento en la playa'
        }
      },
      live: {
        controls: 'Controles de Transmisión',
        start: 'Iniciar Cámara',
        stop: 'Detener Cámara',
        upload: 'Subir Vídeo',
        newsNetwork: 'Red de Noticias Leonida',
        description: 'Simula una transmisión en vivo desde Vice City. Usa tu cámara o sube un vídeo para ver la superposición "En vivo desde Leonida" en acción.',
        placeholder: 'Inicia la cámara o sube un vídeo',
        breaking: 'NOTICIAS DE ÚLTIMA HORA',
        overlays: 'Ajustes de Superposición',
        titleCard: 'Título de Transmisión',
        viewerCount: 'Contador de Espectadores',
        newSub: 'Último Suscriptor',
        subAlert: '¡Nuevo Suscriptor!',
        viewers: 'Espectadores'
      },
      social: {
        locked: 'Bóveda Social Bloqueada',
        lockedDesc: 'Debes iniciar sesión en el Social Club para subir y compartir archivos con la comunidad.',
        upload: 'Subir a la Bóveda',
        drop: 'Suelta archivos o haz clic para subir',
        anyFile: 'Cualquier tipo de archivo soportado',
        security: 'Seguridad de la Bóveda',
        securityDesc: 'Tus subidas están encriptadas y almacenadas en la Nube del Estado de Leonida. Solo los miembros del Social Club pueden acceder a la bóveda comunitaria.',
        activity: 'Actividad Reciente de la Bóveda',
        noActivity: 'Sin actividad reciente',
        details: {
          name: 'Nombre',
          type: 'Tipo',
          size: 'Tamaño',
          date: 'Fecha',
          uploader: 'Subido por'
        }
      },
      sharing: {
        title: 'Compartir Recurso',
        twitter: 'Publicar en X',
        facebook: 'Compartir en Facebook',
        whatsapp: 'Enviar por WhatsApp',
        telegram: 'Compartir en Telegram',
        copy: 'Copiar Enlace de Media',
        copied: '¡Enlace de media copiado!',
        shareText: '¡Mira esta filtración de GTA VI que generé en el Laboratorio del Creador de Leonida! 🌴🔥 #GTAVI #Leonida #RockstarGames'
      },
      location: {
        tracking: 'Rastreo Satelital Activo',
        transmitting: 'Transmitiendo coordenadas en vivo al Maestro Creador...',
        status: 'Fuerza de Señal: Alta',
        coordinates: 'GPS Bloqueado'
      }
    },
    chat: {
      support: 'Soporte para Miembros 24/7',
      creatorCommand: 'Comando del Creador',
      premiumAccess: 'Acceso Premium Social Club',
      masterAccess: 'Acceso Maestro Activo',
      online: 'En línea',
      placeholder: 'Pregunta sobre Vice City...',
      informant: 'Informante',
      welcome: (name: string) => `Bienvenido al Soporte e Inteligencia del Social Club 24/7, ${name}. Soy tu informante dedicado de Leonida. ¿Cómo puedo ayudarte hoy?`,
      creatorWelcome: (name: string) => `Saludos, Maestro Creador ${name}. El sistema está a sus órdenes. ¿Cómo daremos forma a Leonida hoy?`,
      error: "La señal es débil... intenta preguntar de nuevo, miembro del Social Club.",
      requestSupport: "Solicitar Soporte",
      supportRequested: "Soporte Solicitado",
      supportDesc: "¿Necesitas ayuda? Haz clic para notificar al Maestro Creador.",
      supportNotification: "¡Nueva Solicitud de Soporte!",
      supportFrom: (name: string) => `Soporte solicitado por ${name}`
    },
    subscription: {
      title: 'Planes de Suscripción',
      monthly: '$1.99 / Mes',
      lifetime: '$4.99 / Vitalicio',
      lifetimeCriminal: 'Criminal de por Vida',
      currentPlan: 'Plan Actual',
      upgrade: 'Mejorar Ahora',
      features: 'Funciones',
      wantedLevel: 'Nivel de Búsqueda',
      freeStars: '3 Estrellas (Estándar)',
      premiumStars: '5 Estrellas (Máximo)',
      plans: [
        {
          id: 'premium',
          name: 'Vice City Premium',
          price: '$1.99',
          features: [
            'Sin Anuncios',
            'Fondos Neón Exclusivos',
            'Modo Oscuro Crimen Nocturno',
            'Cuenta Regresiva Personalizada'
          ]
        },
        {
          id: 'fivestar',
          name: 'Modo 5 Estrellas',
          price: '$4.99',
          features: [
            'Sonidos Diarios Exclusivos',
            'Alertas de Noticias Rockstar',
            'Widgets Exclusivos',
            'Nivel de Búsqueda 5 Estrellas'
          ]
        },
        {
          id: 'ai',
          name: 'Acceso Anticipado IA',
          price: 'Incluido',
          features: [
            'Generador de Personajes GTA',
            'Generador de Misiones',
            'Chat Estilo NPC'
          ]
        }
      ]
    },
    analytics: {
      title: 'Panel de Analíticas',
      activeUsers: 'Conexiones en Vivo',
      totalUsers: 'Miembros Totales',
      sessions: 'Sesiones Activas',
      traffic: 'Tráfico de Red',
      realTime: 'Feed en Tiempo Real',
      platform: 'Distribución de Plataforma',
      region: 'Acceso Regional',
      liveConnections: 'Conexiones en Vivo',
      totalMembers: 'Miembros Totales',
      regionalData: 'Datos Regionales'
    },
    achievements: {
      title: 'Logros del Social Club',
      locked: 'Logro Bloqueado',
      unlocked: '¡Logro Desbloqueado!',
      progress: 'Progreso',
      list: [
        { id: 'first_visit', title: 'Carne Fresca', description: 'Te uniste al Social Club de Leonida.', icon: 'UserPlus' },
        { id: 'time_10m', title: 'Ciudadano de Vice', description: 'Pasaste 10 minutos en la simulación.', icon: 'Clock' },
        { id: 'chat_active', title: 'Informante', description: 'Enviaste tu primer mensaje en el chat en vivo.', icon: 'MessageSquare' },
        { id: 'map_explorer', title: 'Turista', description: 'Exploraste el mapa interactivo de Leonida.', icon: 'Map' }
      ]
    },
    map: {
      title: 'Mapa Interactivo de Leonida',
      rumors: 'Rumores e Inteligencia del Mapa',
      explore: 'Explora el Estado de Leonida',
      hotspot: 'Punto de Inteligencia',
      locations: {
        viceCity: 'Vice City',
        everglades: 'Los Everglades',
        portGellhorn: 'Port Gellhorn',
        keys: 'Los Cayos'
      }
    },
    mapExplorer: {
      title: 'Explorador del Mapa Leonida',
      subtitle: 'SISTEMA DE INTELIGENCIA SATELITAL',
      locTypeAll: 'Todas las Zonas',
      locTypeBeaches: 'Playas y Costas',
      locTypeUrban: 'Zonas Urbanas',
      locTypeIndustrial: 'Puertos e Industrias',
      locTypeNature: 'Pantanos y Naturaleza',
      locTypeLuxury: 'Lujo y Mansiones',
      coordinates: 'COORDENADAS',
      decryptIntel: 'DECODIFICAR INTELIGENCIA SATELITAL',
      rescanIntel: 'ESCANEAR SECTOR DE NUEVO',
      loading: 'DECODIFICANDO DATOS DEL RADAR SATELITAL...',
      defaultLore: 'Selecciona cualquier sector en la cuadrícula táctica del radar para decodificar historias locales, actividad criminal rumoreada e inteligencia filtrada de las calles de Vice City.',
      error: 'Tiempo de espera agotado. Se perdió la señal de encriptación satelital.',
      sector: 'SECTOR'
    },
    weatherWidget: {
      title: 'Radar Meteorológico de Vice City',
      subtitle: 'RED METEOROLÓGICA DE LEONIDA',
      zoneLabel: 'Zonas de Leonida',
      refreshRadar: 'ACTUALIZAR RADAR',
      simulateStorm: 'SIMULAR CAMBIO TROPICAL',
      tempScale: 'UNIDAD',
      humidity: 'HUMEDAD',
      wind: 'VELOCIDAD DEL VIENTO',
      uvIndex: 'ÍNDICE UV',
      airQuality: 'CALIDAD DEL AIRE',
      advisory: 'AVISO METEOROLÓGICO',
      loreTip: 'CONDICIONES DE CAMPO',
      forecastTitle: 'PRONÓSTICO ATMOSFÉRICO DE 5 DÍAS',
      lastUpdated: 'SINCRONIZACIÓN RADAR',
      liveRadarStatus: 'RADAR METEO EN VIVO'
    }
  }
};

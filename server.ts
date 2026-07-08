import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  const PORT = 3000;

  // Real-time Chat State
  const messages: any[] = [];
  const privateMessages: any[] = [];
  const clients = new Map<WebSocket, { email: string; role: string }>();

  // User State (In-memory for demo)
  const users = new Map<string, any>();
  const modRequests = new Map<string, any>();
  const supportRequests: any[] = [];
  const activeBroadcasters = new Map<string, any>();
  const activeScreenShares = new Map<string, any>();
  const bannedUsers = new Set<string>();
  let twitchLiveStatus = false;

  // Pre-seed creators for demo
  const admins = ['oreviera1@gmail.com'];
  
  admins.forEach(email => {
    users.set(email, {
      email: email,
      username: email.split('@')[0],
      role: 'creator',
      last_login: new Date().toISOString()
    });
  });

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === "join") {
          if (bannedUsers.has(message.user.email.toLowerCase())) {
            ws.send(JSON.stringify({ type: "error", message: "You are banned from this chat." }));
            ws.close();
            return;
          }
          clients.set(ws, { email: message.user.email, role: message.user.role });
          ws.send(JSON.stringify({ type: "history", data: messages.slice(-50) }));
          
          // Send relevant private history
          const relevantPrivate = privateMessages.filter(m => 
            message.user.role === 'creator' || 
            m.from.email === message.user.email || 
            m.to === message.user.email
          ).slice(-100);
          
          ws.send(JSON.stringify({ type: "private_history", data: relevantPrivate }));

          // Send support requests to creator
          if (message.user.role === 'creator') {
            ws.send(JSON.stringify({ type: "support_history", data: supportRequests }));
          }

          // Send active broadcasters to everyone
          ws.send(JSON.stringify({ type: "broadcasters_update", data: Array.from(activeBroadcasters.values()) }));
          
          // Send Twitch status
          ws.send(JSON.stringify({ type: "twitch_status_update", isLive: twitchLiveStatus }));

          // Send initial analytics to creator
          if (message.user.role === 'creator') {
            ws.send(JSON.stringify({
              type: "analytics_update",
              data: {
                activeUsers: wss.clients.size,
                totalMembers: users.size,
                timestamp: new Date().toISOString(),
                traffic: Math.floor(Math.random() * 100),
                sessions: Math.floor(wss.clients.size * 1.2)
              }
            }));
          }
          return;
        }

        if (message.type === "broadcast_start") {
          const broadcaster = {
            id: message.user.email,
            user: message.user,
            title: message.title || "LIVE FROM LEONIDA",
            timestamp: new Date().toISOString()
          };
          activeBroadcasters.set(message.user.email, broadcaster);
          
          const update = JSON.stringify({ type: "broadcasters_update", data: Array.from(activeBroadcasters.values()) });
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) client.send(update);
          });
          return;
        }

        if (message.type === "broadcast_stop") {
          activeBroadcasters.delete(message.user.email);
          
          const update = JSON.stringify({ type: "broadcasters_update", data: Array.from(activeBroadcasters.values()) });
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) client.send(update);
          });
          return;
        }

        if (message.type === "screen_share_start") {
          const share = {
            id: message.user.email,
            user: message.user,
            timestamp: new Date().toISOString()
          };
          activeScreenShares.set(message.user.email, share);
          
          const update = JSON.stringify({ type: "screen_shares_update", data: Array.from(activeScreenShares.values()) });
          wss.clients.forEach(client => {
            const clientInfo = clients.get(client);
            if (client.readyState === WebSocket.OPEN && (clientInfo?.role === 'creator' || clientInfo?.email === message.user.email)) {
              client.send(update);
            }
          });
          return;
        }

        if (message.type === "screen_share_frame") {
          const frameData = JSON.stringify({ 
            type: "screen_share_frame", 
            from: message.user.email, 
            frame: message.frame 
          });
          
          wss.clients.forEach(client => {
            const clientInfo = clients.get(client);
            // Only send frames to creators
            if (client.readyState === WebSocket.OPEN && clientInfo?.role === 'creator') {
              client.send(frameData);
            }
          });
          return;
        }

        if (message.type === "screen_share_stop") {
          activeScreenShares.delete(message.user.email);
          
          const update = JSON.stringify({ type: "screen_shares_update", data: Array.from(activeScreenShares.values()) });
          wss.clients.forEach(client => {
            const clientInfo = clients.get(client);
            if (client.readyState === WebSocket.OPEN && (clientInfo?.role === 'creator' || clientInfo?.email === message.user.email)) {
              client.send(update);
            }
          });
          return;
        }

        if (message.type === "support_request") {
          const request = {
            id: Date.now().toString(),
            user: message.user,
            timestamp: new Date().toISOString(),
            status: 'pending'
          };
          supportRequests.push(request);
          if (supportRequests.length > 100) supportRequests.shift();

          const broadcastData = JSON.stringify({ type: "support_notification", data: request });
          wss.clients.forEach((client) => {
            const clientInfo = clients.get(client);
            if (client.readyState === WebSocket.OPEN && clientInfo?.role === 'creator') {
              client.send(broadcastData);
            }
          });
          return;
        }

        if (message.type === "chat") {
          const clientInfo = clients.get(ws);
          if (clientInfo && bannedUsers.has(clientInfo.email.toLowerCase())) {
            ws.send(JSON.stringify({ type: "error", message: "You are banned." }));
            return;
          }
          const chatMsg = {
            id: Date.now().toString(),
            user: message.user,
            text: message.text,
            timestamp: new Date().toISOString(),
          };
          messages.push(chatMsg);
          if (messages.length > 100) messages.shift();

          const broadcastData = JSON.stringify({ type: "message", data: chatMsg });
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });
        }

        if (message.type === "private_chat") {
          const clientInfo = clients.get(ws);
          if (clientInfo && bannedUsers.has(clientInfo.email.toLowerCase())) {
            ws.send(JSON.stringify({ type: "error", message: "You are banned." }));
            return;
          }
          const privateMsg = {
            id: Date.now().toString(),
            from: message.from,
            to: message.to,
            text: message.text,
            timestamp: new Date().toISOString(),
          };
          privateMessages.push(privateMsg);
          if (privateMessages.length > 500) privateMessages.shift();

          const msgData = JSON.stringify({ type: "private_message", data: privateMsg });
          
          wss.clients.forEach((client) => {
            const clientInfo = clients.get(client);
            if (client.readyState === WebSocket.OPEN && clientInfo) {
              if (
                clientInfo.email === privateMsg.from.email || 
                clientInfo.email === privateMsg.to || 
                clientInfo.role === 'creator'
              ) {
                client.send(msgData);
              }
            }
          });
        }
        if (message.type === "delete_message") {
          const clientInfo = clients.get(ws);
          if (clientInfo?.role === 'creator' || clientInfo?.role === 'moderator') {
            const index = messages.findIndex(m => m.id === message.messageId);
            if (index !== -1) {
              messages.splice(index, 1);
              const broadcastData = JSON.stringify({ type: "message_deleted", messageId: message.messageId });
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) client.send(broadcastData);
              });
            }
          }
          return;
        }

        if (message.type === "kick_user") {
          const clientInfo = clients.get(ws);
          if (clientInfo?.role === 'creator' || clientInfo?.role === 'moderator') {
            wss.clients.forEach((client) => {
              const targetInfo = clients.get(client);
              if (targetInfo?.email === message.targetEmail) {
                client.send(JSON.stringify({ type: "kicked", reason: message.reason || "Kicked by moderator" }));
                client.close();
              }
            });
          }
          return;
        }

        if (message.type === "ban_user") {
          const clientInfo = clients.get(ws);
          if (clientInfo?.role === 'creator' || clientInfo?.role === 'moderator') {
            bannedUsers.add(message.targetEmail.toLowerCase());
            wss.clients.forEach((client) => {
              const targetInfo = clients.get(client);
              if (targetInfo?.email === message.targetEmail) {
                client.send(JSON.stringify({ type: "banned", reason: message.reason || "Banned by moderator" }));
                client.close();
              }
            });
            // Also notify other creators about the ban update
            const banUpdate = JSON.stringify({ type: "ban_list_update", data: Array.from(bannedUsers) });
            wss.clients.forEach((client) => {
              const cInfo = clients.get(client);
              if (client.readyState === WebSocket.OPEN && cInfo?.role === 'creator') {
                client.send(banUpdate);
              }
            });
          }
          return;
        }

        if (message.type === "unban_user") {
          const clientInfo = clients.get(ws);
          if (clientInfo?.role === 'creator') {
            bannedUsers.delete(message.targetEmail.toLowerCase());
            const banUpdate = JSON.stringify({ type: "ban_list_update", data: Array.from(bannedUsers) });
            wss.clients.forEach((client) => {
              const cInfo = clients.get(client);
              if (client.readyState === WebSocket.OPEN && cInfo?.role === 'creator') {
                client.send(banUpdate);
              }
            });
          }
          return;
        }

        if (message.type === "get_ban_list") {
          const clientInfo = clients.get(ws);
          if (clientInfo?.role === 'creator') {
            ws.send(JSON.stringify({ type: "ban_list_update", data: Array.from(bannedUsers) }));
          }
          return;
        }

        if (message.type === "set_twitch_status") {
          const clientInfo = clients.get(ws);
          if (clientInfo?.role === 'creator') {
            twitchLiveStatus = message.isLive;
            const update = JSON.stringify({ type: "twitch_status_update", isLive: twitchLiveStatus });
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) client.send(update);
            });
          }
          return;
        }
      } catch (err) {
        console.error("WS Message Error:", err);
      }
    });

    ws.on("close", () => {
      const info = clients.get(ws);
      if (info) {
        activeBroadcasters.delete(info.email);
        activeScreenShares.delete(info.email);
        
        const bUpdate = JSON.stringify({ type: "broadcasters_update", data: Array.from(activeBroadcasters.values()) });
        const sUpdate = JSON.stringify({ type: "screen_shares_update", data: Array.from(activeScreenShares.values()) });
        
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(bUpdate);
            client.send(sUpdate);
          }
        });
      }
      clients.delete(ws);
    });
  });

  // Periodic Analytics Update
  setInterval(() => {
    const activeCount = wss.clients.size;
    const analyticsData = {
      type: "analytics_update",
      data: {
        activeUsers: activeCount,
        totalMembers: users.size,
        timestamp: new Date().toISOString(),
        // Mock data for charts
        traffic: Math.floor(Math.random() * 100),
        sessions: Math.floor(activeCount * 1.2)
      }
    };
    
    const updateStr = JSON.stringify(analyticsData);
    wss.clients.forEach(client => {
      const info = clients.get(client);
      if (client.readyState === WebSocket.OPEN && info?.role === 'creator') {
        client.send(updateStr);
      }
    });
  }, 5000);

  // API routes
  app.use(express.json());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/", limiter);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Moderator Requests - Keep for now but could be moved to Firestore
  app.post("/api/mod/request", (req, res) => {
    const { email, username } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = users.get(email.toLowerCase());
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === 'creator' || user.role === 'moderator') {
      return res.status(400).json({ error: "Already privileged" });
    }

    modRequests.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      username: username || user.username,
      status: 'pending',
      timestamp: new Date().toISOString()
    });

    res.json({ status: "requested" });
  });

  app.get("/api/mod/requests", (req, res) => {
    const creatorEmail = req.headers['x-creator-email'] as string;
    const admin = users.get(creatorEmail?.toLowerCase());
    
    if (!admin || admin.role !== 'creator') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(Array.from(modRequests.values()).filter(r => r.status === 'pending'));
  });

  app.post("/api/mod/respond", (req, res) => {
    const creatorEmail = req.headers['x-creator-email'] as string;
    const { userEmail, approve } = req.body;
    
    const admin = users.get(creatorEmail?.toLowerCase());
    if (!admin || admin.role !== 'creator') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const request = modRequests.get(userEmail?.toLowerCase());
    if (!request) return res.status(404).json({ error: "Request not found" });

    if (approve) {
      const user = users.get(userEmail.toLowerCase());
      if (user) {
        user.role = 'moderator';
      }
      request.status = 'approved';
    } else {
      request.status = 'denied';
    }

    res.json({ status: "responded", role: approve ? 'moderator' : 'member' });
  });

  app.get("/api/admin/users", (req, res) => {
    const creatorEmail = req.headers['x-creator-email'] as string;
    const admin = users.get(creatorEmail?.toLowerCase());
    
    if (!admin || admin.role !== 'creator') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(Array.from(users.values()));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

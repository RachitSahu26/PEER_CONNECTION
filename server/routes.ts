import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api, WS_EVENTS, type SignalPayload } from "@shared/routes";
import { z } from "zod";
import { Server as SocketIOServer, type Socket } from "socket.io";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  setupAuth(app);

  // API Routes
  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not logged in" });
    }
  });

  app.post(api.feedback.submit.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const input = api.feedback.submit.input.parse({
        ...req.body,
        fromUserId: req.user.id
      });
      await storage.createFeedback(input);
      res.status(201).send();
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Socket.IO & Matchmaking
  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const waitingQueue: string[] = [];
  const activeCalls = new Map<string, string>(); // socketId -> partnerSocketId

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on(WS_EVENTS.JOIN_QUEUE, () => {
      // Remove from queue if already there to prevent dups
      const existingIdx = waitingQueue.indexOf(socket.id);
      if (existingIdx !== -1) waitingQueue.splice(existingIdx, 1);

      waitingQueue.push(socket.id);
      console.log(`User ${socket.id} joined queue. Queue size: ${waitingQueue.length}`);

      // Matchmaking Logic
      if (waitingQueue.length >= 2) {
        const p1 = waitingQueue.shift();
        const p2 = waitingQueue.shift();

        if (p1 && p2) {
          activeCalls.set(p1, p2);
          activeCalls.set(p2, p1);

          console.log(`Matched ${p1} with ${p2}`);

          // Notify P1 (Initiator)
          io.to(p1).emit(WS_EVENTS.MATCH_FOUND, { partnerId: p2, initiator: true });
          // Notify P2 (Receiver)
          io.to(p2).emit(WS_EVENTS.MATCH_FOUND, { partnerId: p1, initiator: false });
        }
      }
    });

    socket.on(WS_EVENTS.LEAVE_QUEUE, () => {
      const idx = waitingQueue.indexOf(socket.id);
      if (idx !== -1) waitingQueue.splice(idx, 1);
    });

    socket.on(WS_EVENTS.SIGNAL, (payload: SignalPayload) => {
      // Forward signal to specific partner
      io.to(payload.to).emit(WS_EVENTS.SIGNAL, {
        from: socket.id,
        ...payload
      });
    });

    socket.on("disconnect", () => {
      // Remove from queue
      const idx = waitingQueue.indexOf(socket.id);
      if (idx !== -1) waitingQueue.splice(idx, 1);

      // Notify partner if in call
      const partnerId = activeCalls.get(socket.id);
      if (partnerId) {
        io.to(partnerId).emit(WS_EVENTS.PARTNER_DISCONNECTED);
        activeCalls.delete(partnerId);
        activeCalls.delete(socket.id);
      }
    });
  });

  // SEED DATA
  if (process.env.NODE_ENV !== "production") {
    const existingUser = await storage.getUserByUsername("user1");
    if (!existingUser) {
      console.log("Seeding users...");
      const hashedPassword = await hashPassword("password");
      await storage.createUser({ username: "user1", password: hashedPassword, reputation: 100, isPremium: false });
      await storage.createUser({ username: "user2", password: hashedPassword, reputation: 100, isPremium: false });
      await storage.createUser({ username: "user3", password: hashedPassword, reputation: 100, isPremium: true });
      console.log("Seeding complete: user1, user2, user3 (password: password)");
    }
  }

  return httpServer;
}

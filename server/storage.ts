import { User } from "./models/user";
import { Feedback } from "./models/feedback";
import session from "express-session";
import MongoStore from "connect-mongo";
import type { MongoClient } from "mongodb";

export interface IStorage {
  getUser(id: string): Promise<any | null>;
  getUserByUsername(username: string): Promise<any | null>;
  createUser(user: { username: string; password: string }): Promise<any>;
  createFeedback(feedback: {
    fromUserId: string;
    toUserId: string;
    type: "like" | "dislike" | "report";
    comment?: string;
  }): Promise<any>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore!: session.Store;

  initSessionStore(client: MongoClient) {
    this.sessionStore = MongoStore.create({
      client,
      collectionName: "sessions",
    });
  }

  async getUser(id: string) {
    return User.findById(id);
  }

  async getUserByUsername(username: string) {
    return User.findOne({ username });
  }

  async createUser(user: { username: string; password: string }) {
    return User.create(user);
  }

  async createFeedback(feedback: {
    fromUserId: string;
    toUserId: string;
    type: "like" | "dislike" | "report";
    comment?: string;
  }) {
    return Feedback.create(feedback);
  }
}

export const storage = new DatabaseStorage();

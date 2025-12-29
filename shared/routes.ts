import { z } from 'zod';
import { insertUserSchema, insertFeedbackSchema, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: insertUserSchema.pick({ username: true, password: true }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  feedback: {
    submit: {
      method: 'POST' as const,
      path: '/api/feedback',
      input: insertFeedbackSchema,
      responses: {
        201: z.void(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export const WS_EVENTS = {
  CONNECT: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_QUEUE: 'join-queue',
  LEAVE_QUEUE: 'leave-queue',
  MATCH_FOUND: 'match-found',
  SIGNAL: 'signal', // Generic WebRTC signaling (offer, answer, candidate)
  PARTNER_DISCONNECTED: 'partner-disconnected',
  ERROR: 'error'
} as const;

export interface SignalPayload {
  to: string; // socket id of target
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
}

import { z } from "zod";

/* ---------------- ERROR SCHEMAS ---------------- */

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

/* ---------------- API CONTRACTS ---------------- */

export const api = {
  auth: {
    register: {
      method: "POST" as const,
      path: "/api/register",
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },

    login: {
      method: "POST" as const,
      path: "/api/login",
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.any(),
        401: errorSchemas.unauthorized,
      },
    },

    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        200: z.void(),
      },
    },

    me: {
      method: "GET" as const,
      path: "/api/user",
      responses: {
        200: z.any(),
        401: errorSchemas.unauthorized,
      },
    },
  },

  feedback: {
    submit: {
      method: "POST" as const,
      path: "/api/feedback",
      input: z.object({
        fromUserId: z.string(),
        toUserId: z.string(),
        type: z.enum(["like", "dislike", "report"]),
        comment: z.string().optional(),
      }),
      responses: {
        201: z.void(),
        400: errorSchemas.validation,
      },
    },
  },
};

/* ---------------- URL BUILDER ---------------- */

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}

/* ---------------- SOCKET EVENTS ---------------- */

export const WS_EVENTS = {
  CONNECT: "connection",
  DISCONNECT: "disconnect",
  JOIN_QUEUE: "join-queue",
  LEAVE_QUEUE: "leave-queue",
  MATCH_FOUND: "match-found",
  SIGNAL: "signal",
  PARTNER_DISCONNECTED: "partner-disconnected",
  ERROR: "error",
} as const;

/* ---------------- SOCKET PAYLOAD ---------------- */

export interface SignalPayload {
  to: string;
  type: "offer" | "answer" | "ice-candidate";
  data: any;
}

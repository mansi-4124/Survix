import { io, type Socket } from "socket.io-client";

export type PollVoteUpdate = {
  pollId: string;
  questionId: string;
  totalVotes: number;
  optionId?: string;
  optionVotes?: number;
  word?: string;
  wordCount?: number;
  participantName?: string;
};

export type PollWordUpdate = {
  pollId: string;
  questionId: string;
  word: string;
  count: number;
};

export type PollStatsUpdate = {
  pollId: string;
  viewers: number;
  votes: number;
  participationPercent: number;
};

export type PollMomentumUpdate = {
  pollId: string;
  questionId: string;
  surgeDetected: boolean;
  optionMomentum: Record<string, "SURGE" | "TRENDING" | "LOSING" | "STABLE">;
};

export type PollClosedUpdate = {
  pollId: string;
  closedAt: string;
};

type PollRealtimeHandlers = {
  onVoteUpdate?: (payload: PollVoteUpdate) => void;
  onWordUpdate?: (payload: PollWordUpdate) => void;
  onStatsUpdate?: (payload: PollStatsUpdate) => void;
  onMomentumUpdate?: (payload: PollMomentumUpdate) => void;
  onPollClosed?: (payload: PollClosedUpdate) => void;
  onError?: (message: string) => void;
};

const resolveSocketBaseUrl = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_SOCKET_BASE_URL) {
    return import.meta.env.VITE_SOCKET_BASE_URL as string;
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) {
    const base = import.meta.env.VITE_API_BASE_URL as string;
    return base.replace(/\/api\/?$/i, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "http://localhost:3000";
};

const withPollGuard =
  <T extends { pollId: string }>(pollId: string, handler?: (payload: T) => void) =>
  (payload: T) => {
    if (!handler || payload?.pollId !== pollId) {
      return;
    }
    handler(payload);
  };

export const connectPollRealtime = (
  pollId: string,
  handlers: PollRealtimeHandlers = {},
): (() => void) => {
  const socketBase = resolveSocketBaseUrl();
  const socket: Socket = io(`${socketBase}/polls`, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnectionAttempts: 8,
    reconnectionDelay: 800,
    timeout: 10000,
  });

  const joinRoom = () => socket.emit("join_poll", { pollId });
  socket.on("connect", joinRoom);
  if (socket.connected) {
    joinRoom();
  }

  socket.on("poll_error", (payload: { message?: string }) => {
    handlers.onError?.(payload?.message ?? "Unable to join poll room.");
  });

  socket.on("vote_update", withPollGuard(pollId, handlers.onVoteUpdate));
  socket.on("word_update", withPollGuard(pollId, handlers.onWordUpdate));
  socket.on("stats_update", withPollGuard(pollId, handlers.onStatsUpdate));
  socket.on("momentum_update", withPollGuard(pollId, handlers.onMomentumUpdate));
  socket.on("poll_closed", withPollGuard(pollId, handlers.onPollClosed));

  return () => {
    socket.emit("leave_poll", { pollId });
    socket.disconnect();
  };
};

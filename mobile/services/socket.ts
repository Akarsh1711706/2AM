import { io, Socket } from 'socket.io-client';
import {
  JoinQueuePayload,
  MatchFoundPayload,
  PhaseChangePayload,
  ReactionPayload,
  ReportPayload,
  RatingPayload,
  OnlineCountPayload,
} from '../../shared/types';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Typed emit helpers
export const emitJoinQueue = (payload: JoinQueuePayload): void => {
  getSocket().emit('join_queue', payload);
};

export const emitLeaveQueue = (userId: string): void => {
  getSocket().emit('leave_queue', { userId });
};

export const emitReaction = (payload: ReactionPayload): void => {
  getSocket().emit('send_reaction', payload);
};

export const emitReport = (payload: ReportPayload): void => {
  getSocket().emit('report_user', payload);
};

export const emitRating = (payload: RatingPayload): void => {
  getSocket().emit('rate_session', payload);
};

export const emitLeaveSession = (sessionId: string, userId: string): void => {
  getSocket().emit('leave_session', { sessionId, userId });
};

// Typed listener helpers
export const onMatchFound = (cb: (data: MatchFoundPayload) => void): void => {
  getSocket().on('match_found', cb);
};

export const onPhaseChange = (cb: (data: PhaseChangePayload) => void): void => {
  getSocket().on('phase_change', cb);
};

export const onReactionReceived = (cb: (data: ReactionPayload) => void): void => {
  getSocket().on('reaction_received', cb);
};

export const onPartnerLeft = (cb: () => void): void => {
  getSocket().on('partner_left', cb);
};

export const onOnlineCount = (cb: (data: OnlineCountPayload) => void): void => {
  getSocket().on('online_count', cb);
};

export const offMatchFound = (): void => {
  getSocket().off('match_found');
};

export const offPhaseChange = (): void => {
  getSocket().off('phase_change');
};

export const offReactionReceived = (): void => {
  getSocket().off('reaction_received');
};

export const offPartnerLeft = (): void => {
  getSocket().off('partner_left');
};

export const offOnlineCount = (): void => {
  getSocket().off('online_count');
};

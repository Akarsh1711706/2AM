import { Server as SocketServer, Socket } from 'socket.io';
import { getRedis, KEYS } from '../db/redis';
import { addToQueue, clearUserFromAllQueues } from '../matching/queue';
import { tryMatch } from '../matching/engine';
import { sessionManager } from '../session/manager';
import { submitReport } from '../safety/report';
import { isUserBanned } from '../trust/moderation';
import { rewardCompletion, rewardPositiveRating, getTrustScore } from '../trust/score';
import { QueueEntry, Mood, PhaseChangePayload, SessionPhase } from '../../../shared/types';

// Track online users and socket→userId mapping
const onlineUsers = new Map<string, string>(); // socketId → userId

export const registerSocketHandlers = (io: SocketServer): void => {
  // Broadcast online count every 5 seconds
  setInterval(async () => {
    io.emit('online_count', { count: onlineUsers.size });
  }, 5000);

  // Phase change handler — swaps roles between phase1 and phase2
  sessionManager.onPhaseChange(async (sessionId, nextPhase, session) => {
    // In phase2 roles swap: user1 (who was speaker in phase1) becomes listener
    const user1PhaseRole = (nextPhase === 'phase2') ? 'listener' : 'speaker';
    const user2PhaseRole = (nextPhase === 'phase2') ? 'speaker' : 'listener';

    const payload1: PhaseChangePayload = {
      sessionId,
      newPhase: nextPhase,
      newRole: user1PhaseRole,
      phaseStartedAt: Date.now(),
    };
    const payload2: PhaseChangePayload = {
      sessionId,
      newPhase: nextPhase,
      newRole: user2PhaseRole,
      phaseStartedAt: Date.now(),
    };

    io.to(`session:${sessionId}:user1`).emit('phase_change', payload1);
    io.to(`session:${sessionId}:user2`).emit('phase_change', payload2);

    if (nextPhase === 'ended') {
      await sessionManager.endSession(sessionId);
      await rewardCompletion(session.user1Id);
      await rewardCompletion(session.user2Id);
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Online count request
    socket.on('request_online_count', () => {
      socket.emit('online_count', { count: onlineUsers.size });
    });

    // Join queue
    socket.on('join_queue', async (data: { userId: string; mood: Mood; sessionToken: string }) => {
      try {
        const { userId, mood, sessionToken } = data;

        // Check ban
        if (await isUserBanned(userId)) {
          socket.emit('queue_error', { message: 'Account restricted.' });
          return;
        }

        onlineUsers.set(socket.id, userId);
        socket.data.userId = userId;

        const trustScore = await getTrustScore(userId);
        const entry: QueueEntry = {
          userId,
          mood,
          trustScore,
          queuedAt: Date.now(),
          sessionToken,
        };

        // Try to match immediately
        const match = await tryMatch(entry);

        if (match) {
          const { sessionId, user1, user2, payload1, payload2 } = match;

          // Store session with manager
          await sessionManager.startSession(sessionId, {
            id: sessionId,
            user1Id: user1.userId,
            user2Id: user2.userId,
            mood1: user1.mood,
            mood2: user2.mood,
            phase: 'phase1',
            startedAt: Date.now(),
          });

          // Join rooms for phase-change broadcasting
          socket.join(`session:${sessionId}:user1`);

          // Find the other user's socket
          const partnerSocketId = [...onlineUsers.entries()].find(
            ([, uid]) => uid === user2.userId
          )?.[0];
          if (partnerSocketId) {
            const partnerSocket = io.sockets.sockets.get(partnerSocketId);
            partnerSocket?.join(`session:${sessionId}:user2`);
            partnerSocket?.emit('match_found', payload2);
          }

          socket.emit('match_found', payload1);
        } else {
          await addToQueue(entry);
        }
      } catch (err) {
        console.error('[Socket] join_queue error:', err);
        socket.emit('queue_error', { message: 'Matching unavailable.' });
      }
    });

    // Leave queue
    socket.on('leave_queue', async (data: { userId: string }) => {
      await clearUserFromAllQueues(data.userId);
    });

    // Send reaction
    socket.on(
      'send_reaction',
      (data: { sessionId: string; reactionType: string }) => {
        socket.to(`session:${data.sessionId}`).emit('reaction_received', data);
      }
    );

    // Leave session
    socket.on(
      'leave_session',
      async (data: { sessionId: string; userId: string }) => {
        socket.to(`session:${data.sessionId}`).emit('partner_left');
        await sessionManager.endSession(data.sessionId);
      }
    );

    // Report user
    socket.on(
      'report_user',
      async (data: { sessionId: string; reportedUserId: string; category: string }) => {
        const reporterId = socket.data.userId;
        if (!reporterId) return;
        await submitReport(reporterId, data.reportedUserId, data.sessionId, data.category as any);
      }
    );

    // Rate session
    socket.on(
      'rate_session',
      async (data: { sessionId: string; ratedUserId: string; rating: string }) => {
        const raterId = socket.data.userId;
        if (!raterId) return;
        if (['okay', 'good', 'great'].includes(data.rating)) {
          await rewardPositiveRating(data.ratedUserId);
        }
      }
    );

    // Disconnect
    socket.on('disconnect', async () => {
      const userId = onlineUsers.get(socket.id);
      if (userId) {
        await clearUserFromAllQueues(userId);
        onlineUsers.delete(socket.id);
      }
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
};

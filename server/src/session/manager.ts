import { getRedis, KEYS } from '../db/redis';
import { sessionTimer, NEXT_PHASE } from './timer';
import { SessionPhase } from '../../../shared/types';

export interface SessionData {
  id: string;
  user1Id: string;
  user2Id: string;
  mood1: string;
  mood2: string;
  phase: SessionPhase;
  startedAt: number;
}

export type PhaseChangeCallback = (
  sessionId: string,
  nextPhase: SessionPhase,
  session: SessionData
) => void;

class SessionManager {
  private phaseChangeCallbacks: PhaseChangeCallback[] = [];

  onPhaseChange(cb: PhaseChangeCallback): void {
    this.phaseChangeCallbacks.push(cb);
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const redis = await getRedis();
    const data = await redis.get(KEYS.session(sessionId));
    return data ? (JSON.parse(data) as SessionData) : null;
  }

  async startSession(sessionId: string, session: SessionData): Promise<void> {
    const redis = await getRedis();
    await redis.set(KEYS.session(sessionId), JSON.stringify(session), { EX: 3600 });
    sessionTimer.schedule(sessionId, 'phase1', this.handlePhaseExpiry.bind(this));
  }

  async advancePhase(sessionId: string, nextPhase: SessionPhase): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    session.phase = nextPhase;
    const redis = await getRedis();
    await redis.set(KEYS.session(sessionId), JSON.stringify(session), { EX: 3600 });

    if (nextPhase !== 'ended') {
      sessionTimer.schedule(sessionId, nextPhase, this.handlePhaseExpiry.bind(this));
    }

    this.phaseChangeCallbacks.forEach((cb) => cb(sessionId, nextPhase, session));
  }

  async endSession(sessionId: string): Promise<void> {
    sessionTimer.cancel(sessionId);
    const redis = await getRedis();
    await redis.del(KEYS.session(sessionId));
  }

  private async handlePhaseExpiry(sessionId: string, nextPhase: SessionPhase): Promise<void> {
    await this.advancePhase(sessionId, nextPhase);
  }
}

export const sessionManager = new SessionManager();

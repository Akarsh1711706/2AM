import { SessionPhase } from '../../../shared/types';

export const PHASE_DURATIONS_MS: Record<SessionPhase, number> = {
  phase1: 5 * 60 * 1000,
  transition: 5 * 1000,
  phase2: 5 * 60 * 1000,
  open: 2 * 60 * 1000,
  ended: 0,
};

export const NEXT_PHASE: Partial<Record<SessionPhase, SessionPhase>> = {
  phase1: 'transition',
  transition: 'phase2',
  phase2: 'open',
  open: 'ended',
};

export class SessionTimer {
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  schedule(
    sessionId: string,
    phase: SessionPhase,
    onExpire: (sessionId: string, nextPhase: SessionPhase) => void
  ): void {
    this.cancel(sessionId);
    const duration = PHASE_DURATIONS_MS[phase];
    if (!duration) return;

    const nextPhase = NEXT_PHASE[phase];
    if (!nextPhase) return;

    const timer = setTimeout(() => {
      this.timers.delete(sessionId);
      onExpire(sessionId, nextPhase);
    }, duration);

    this.timers.set(sessionId, timer);
  }

  cancel(sessionId: string): void {
    const timer = this.timers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(sessionId);
    }
  }

  cancelAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }
}

export const sessionTimer = new SessionTimer();

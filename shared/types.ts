export type Mood = 'vent' | 'casual' | 'advice' | 'listen';

export type ReactionType = 'hear_you' | 'makes_sense' | 'go_on' | 'hug';

export type SessionPhase = 'phase1' | 'transition' | 'phase2' | 'open' | 'ended';

export type SessionRole = 'speaker' | 'listener';

export interface Session {
  id: string;
  userId: string;
  partnerId: string;
  mood: Mood;
  partnerMood: Mood;
  role: SessionRole;
  phase: SessionPhase;
  agoraChannel: string;
  agoraToken: string;
  startedAt: number;
  phaseStartedAt: number;
}

export interface QueueEntry {
  userId: string;
  mood: Mood;
  trustScore: number;
  queuedAt: number;
  sessionToken: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  sessionId: string;
  category: ReportCategory;
  timestamp: number;
}

export type ReportCategory =
  | 'inappropriate_sexual'
  | 'rude_aggressive'
  | 'shared_personal_info'
  | 'other';

export type RatingEmoji = 'very_bad' | 'bad' | 'okay' | 'good' | 'great';

export interface SessionRating {
  sessionId: string;
  raterId: string;
  ratedId: string;
  rating: RatingEmoji;
  timestamp: number;
}

export interface TrustScore {
  userId: string;
  score: number;
  updatedAt: number;
}

// Socket event payloads
export interface JoinQueuePayload {
  userId: string;
  mood: Mood;
  sessionToken: string;
}

export interface MatchFoundPayload {
  sessionId: string;
  agoraChannel: string;
  agoraToken: string;
  role: SessionRole;
  partnerMood: Mood;
  partnerUserId: string;
  phase: SessionPhase;
}

export interface PhaseChangePayload {
  sessionId: string;
  newPhase: SessionPhase;
  newRole: SessionRole;
  phaseStartedAt: number;
}

export interface ReactionPayload {
  sessionId: string;
  reactionType: ReactionType;
}

export interface ReportPayload {
  sessionId: string;
  reportedUserId: string;
  category: ReportCategory;
}

export interface RatingPayload {
  sessionId: string;
  ratedUserId: string;
  rating: RatingEmoji;
}

export interface OnlineCountPayload {
  count: number;
}

import { ReactionType } from '../../shared/types';

export interface ReactionConfig {
  id: ReactionType;
  label: string;
  emoji: string;
  color: string;
}

export const REACTIONS: ReactionConfig[] = [
  {
    id: 'hear_you',
    label: 'I hear you',
    emoji: '👂',
    color: '#4A90D9',
  },
  {
    id: 'makes_sense',
    label: 'That makes sense',
    emoji: '💡',
    color: '#50C878',
  },
  {
    id: 'go_on',
    label: 'Go on',
    emoji: '➡️',
    color: '#7B68EE',
  },
  {
    id: 'hug',
    label: '🫂',
    emoji: '🫂',
    color: '#FF6B9D',
  },
];

import { Mood } from '../../shared/types';

export interface MoodConfig {
  id: Mood;
  emoji: string;
  label: string;
  description: string;
  matchingText: string;
  color: string;
}

export const MOODS: MoodConfig[] = [
  {
    id: 'vent',
    emoji: '🌊',
    label: 'Vent',
    description: 'I need to get something off my chest',
    matchingText: 'Finding someone who wants to listen...',
    color: '#4A90D9',
  },
  {
    id: 'casual',
    emoji: '💬',
    label: 'Casual',
    description: 'Just want to chat about anything',
    matchingText: 'Finding someone to chat with...',
    color: '#7B68EE',
  },
  {
    id: 'advice',
    emoji: '🧭',
    label: 'Advice',
    description: 'I want a perspective on something',
    matchingText: 'Finding someone with perspective...',
    color: '#50C878',
  },
  {
    id: 'listen',
    emoji: '🤝',
    label: 'Listen',
    description: "I'm in a good place, I want to help",
    matchingText: 'Finding someone who needs to be heard...',
    color: '#FFB347',
  },
];

export const MOOD_COMPATIBILITY: Record<Mood, Mood[]> = {
  vent: ['listen', 'casual'],
  casual: ['casual', 'vent', 'advice'],
  advice: ['listen', 'advice'],
  listen: ['vent', 'advice'],
};

export const getMoodConfig = (id: Mood): MoodConfig =>
  MOODS.find((m) => m.id === id) || MOODS[0];

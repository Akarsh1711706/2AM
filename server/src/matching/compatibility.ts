import { Mood } from '../../../shared/types';
import { SessionRole } from '../../../shared/types';

export const COMPATIBILITY_MATRIX: Record<Mood, Mood[]> = {
  vent: ['listen', 'casual'],
  casual: ['casual', 'vent', 'advice'],
  advice: ['listen', 'advice'],
  listen: ['vent', 'advice'],
};

export const isCompatible = (mood1: Mood, mood2: Mood): boolean =>
  COMPATIBILITY_MATRIX[mood1].includes(mood2);

export const assignRoles = (mood1: Mood, mood2: Mood): [SessionRole, SessionRole] => {
  if (mood1 === 'vent' && mood2 === 'listen') return ['speaker', 'listener'];
  if (mood1 === 'listen' && mood2 === 'vent') return ['listener', 'speaker'];
  if (mood1 === 'advice' && mood2 === 'listen') return ['speaker', 'listener'];
  if (mood1 === 'listen' && mood2 === 'advice') return ['listener', 'speaker'];
  // Casual+Casual and others: random
  return Math.random() < 0.5 ? ['speaker', 'listener'] : ['listener', 'speaker'];
};

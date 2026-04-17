import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MoodConfig } from '../constants/moods';
import { getTheme } from '../constants/theme';

interface Props {
  mood: MoodConfig;
  onSelect: (mood: MoodConfig) => void;
}

export const MoodTile: React.FC<Props> = ({ mood, onSelect }) => {
  const theme = getTheme();

  return (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: theme.colors.card, borderColor: mood.color }]}
      onPress={() => onSelect(mood)}
      activeOpacity={0.75}
    >
      <Text style={styles.emoji}>{mood.emoji}</Text>
      <Text style={[styles.label, { color: theme.colors.text }]}>{mood.label}</Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        {mood.description}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    margin: 8,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});

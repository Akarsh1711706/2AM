import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { formatTime } from '../hooks/useTimer';
import { getTheme } from '../constants/theme';

interface Props {
  seconds: number;
  label?: string;
  urgent?: boolean;
}

export const Timer: React.FC<Props> = ({ seconds, label, urgent = false }) => {
  const theme = getTheme();
  const isUrgent = urgent || seconds <= 30;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      )}
      <Text
        style={[
          styles.time,
          { color: isUrgent ? theme.colors.error : theme.colors.text },
        ]}
      >
        {formatTime(seconds)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  time: {
    fontSize: 48,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
});

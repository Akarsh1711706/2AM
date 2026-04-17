import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTheme } from '../constants/theme';

interface Props {
  count: number;
}

export const OnlineCounter: React.FC<Props> = ({ count }) => {
  const theme = getTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
      <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
        {count.toLocaleString()} {count === 1 ? 'person' : 'people'} online
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 14,
  },
});

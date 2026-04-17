import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { ReactionConfig } from '../constants/reactions';
import { getTheme } from '../constants/theme';

interface Props {
  reaction: ReactionConfig;
  onPress: (reaction: ReactionConfig) => void;
  disabled?: boolean;
}

export const ReactionBubble: React.FC<Props> = ({ reaction, onPress, disabled = false }) => {
  const theme = getTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress(reaction);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.bubble,
          { backgroundColor: theme.colors.card, borderColor: reaction.color },
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Text style={styles.emoji}>{reaction.emoji}</Text>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {reaction.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.3,
  },
});

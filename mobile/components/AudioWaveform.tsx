import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { getTheme } from '../constants/theme';

interface Props {
  volume: number; // 0-100
  isActive: boolean;
  barCount?: number;
  color?: string;
}

export const AudioWaveform: React.FC<Props> = ({
  volume,
  isActive,
  barCount = 20,
  color,
}) => {
  const theme = getTheme();
  const barColor = color || theme.colors.primary;
  const animations = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.2))
  ).current;

  useEffect(() => {
    if (!isActive) {
      animations.forEach((anim) =>
        Animated.timing(anim, { toValue: 0.2, duration: 300, useNativeDriver: true }).start()
      );
      return;
    }

    const animateBar = (anim: Animated.Value, index: number) => {
      const delay = index * 40;
      const heightFactor = Math.max(0.15, (volume / 100) * (0.4 + Math.random() * 0.6));
      Animated.sequence([
        Animated.timing(anim, {
          toValue: heightFactor,
          duration: 150,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.15,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => animateBar(anim, index));
    };

    animations.forEach((anim, i) => animateBar(anim, i));

    return () => animations.forEach((anim) => anim.stopAnimation());
  }, [volume, isActive]);

  return (
    <View style={styles.container}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: barColor,
              transform: [{ scaleY: anim }],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    gap: 3,
  },
  bar: {
    width: 4,
    height: 50,
    borderRadius: 2,
  },
});

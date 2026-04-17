import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTheme } from '../constants/theme';
import { useSession } from '../hooks/useSession';
import { useMatching } from '../hooks/useMatching';
import { getMoodConfig } from '../constants/moods';
import { Mood } from '../../shared/types';

export default function MatchingScreen() {
  const theme = getTheme();
  const router = useRouter();
  const { mood: moodParam } = useLocalSearchParams<{ mood: Mood }>();
  const mood = (moodParam as Mood) || 'casual';
  const moodConfig = getMoodConfig(mood);
  const { userId } = useSession();
  const { status, matchData, waitSeconds, startMatching, cancelMatching } = useMatching();

  // Pulsing animation
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 2.5, duration: 1500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    animate(pulse1, 0);
    animate(pulse2, 500);
    animate(pulse3, 1000);
  }, []);

  useEffect(() => {
    if (userId && status === 'idle') {
      startMatching(userId, mood, `${userId}-${Date.now()}`);
    }
  }, [userId]);

  useEffect(() => {
    if (status === 'matched' && matchData) {
      router.replace({
        pathname: '/chat',
        params: {
          sessionId: matchData.sessionId,
          agoraChannel: matchData.agoraChannel,
          agoraToken: matchData.agoraToken,
          role: matchData.role,
          partnerMood: matchData.partnerMood,
          partnerUserId: matchData.partnerUserId,
          phase: matchData.phase,
          mood,
        },
      });
    }
  }, [status, matchData]);

  const handleCancel = () => {
    if (userId) cancelMatching(userId);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <View style={styles.content}>
        <View style={styles.pulseContainer}>
          {[pulse1, pulse2, pulse3].map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.pulseRing,
                {
                  borderColor: moodConfig.color,
                  transform: [{ scale: anim }],
                  opacity: anim.interpolate({ inputRange: [1, 2.5], outputRange: [0.5, 0] }),
                  position: 'absolute',
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                },
              ]}
            />
          ))}
          <View style={[styles.centerDot, { backgroundColor: moodConfig.color }]}>
            <Text style={styles.centerEmoji}>{moodConfig.emoji}</Text>
          </View>
        </View>

        <Text style={[styles.statusText, { color: theme.colors.text }]}>
          {status === 'timeout'
            ? 'No match found yet...'
            : moodConfig.matchingText}
        </Text>

        <Text style={[styles.waitTimer, { color: theme.colors.textMuted }]}>
          {waitSeconds}s
        </Text>

        {status === 'timeout' && (
          <Text style={[styles.suggestion, { color: theme.colors.textSecondary }]}>
            Try a different mood for a faster match?
          </Text>
        )}

        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
          onPress={handleCancel}
        >
          <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 24,
  },
  pulseContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pulseRing: {
    borderWidth: 2,
  },
  centerDot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerEmoji: { fontSize: 32 },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  waitTimer: {
    fontSize: 14,
  },
  suggestion: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
  },
  cancelText: { fontSize: 16 },
});

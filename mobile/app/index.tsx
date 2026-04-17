import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getTheme } from '../constants/theme';
import { OnlineCounter } from '../components/OnlineCounter';
import { RoomRules } from '../components/RoomRules';
import { useSession } from '../hooks/useSession';
import { onOnlineCount, offOnlineCount, getSocket } from '../services/socket';

const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 4) return "Can't sleep? You're not alone.";
  if (hour >= 4 && hour < 7) return 'Up early? Someone else is too.';
  if (hour >= 7 && hour < 12) return 'Good morning. Need to talk?';
  if (hour >= 12 && hour < 17) return 'Need a study break?';
  if (hour >= 17 && hour < 20) return 'How was today? Want to share?';
  if (hour >= 20 && hour < 22) return 'Winding down? So is someone else.';
  return "Late night? You're not the only one awake.";
};

export default function HomeScreen() {
  const theme = getTheme();
  const router = useRouter();
  const { isFirstTime, dismissFirstTime } = useSession();
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    socket.emit('request_online_count');
    onOnlineCount(({ count }) => setOnlineCount(count));
    return () => offOnlineCount();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <RoomRules visible={isFirstTime} onDismiss={dismissFirstTime} />

      <View style={styles.content}>
        <View style={styles.top}>
          <Text style={[styles.appName, { color: theme.colors.textMuted }]}>2AM</Text>
        </View>

        <View style={styles.middle}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            {getTimeGreeting()}
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
            Anonymous voice conversations.{'\n'}No history. No profiles. Just connection.
          </Text>
        </View>

        <View style={styles.bottom}>
          <OnlineCounter count={onlineCount} />
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/mood')}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaText, { color: theme.colors.white }]}>
              I want to talk →
            </Text>
          </TouchableOpacity>
          <Text style={[styles.note, { color: theme.colors.textMuted }]}>
            Your voice. No name. Safe space.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  top: { alignItems: 'center', paddingTop: 12 },
  appName: { fontSize: 15, fontWeight: '600', letterSpacing: 4, textTransform: 'uppercase' },
  middle: { alignItems: 'center' },
  greeting: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottom: { alignItems: 'center', gap: 20 },
  ctaButton: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 18,
    alignItems: 'center',
  },
  ctaText: { fontSize: 20, fontWeight: '700' },
  note: { fontSize: 13 },
});

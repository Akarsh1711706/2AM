import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getTheme } from '../constants/theme';
import { MoodTile } from '../components/MoodTile';
import { MOODS, MoodConfig } from '../constants/moods';

export default function MoodScreen() {
  const theme = getTheme();
  const router = useRouter();

  const handleMoodSelect = (mood: MoodConfig) => {
    router.push({ pathname: '/matching', params: { mood: mood.id } });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>How are you feeling?</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Pick a mood — we'll match you with the right person
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          <MoodTile mood={MOODS[0]} onSelect={handleMoodSelect} />
          <MoodTile mood={MOODS[1]} onSelect={handleMoodSelect} />
        </View>
        <View style={styles.row}>
          <MoodTile mood={MOODS[2]} onSelect={handleMoodSelect} />
          <MoodTile mood={MOODS[3]} onSelect={handleMoodSelect} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 16 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  grid: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
  },
});

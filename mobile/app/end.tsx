import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTheme } from '../constants/theme';
import { useSession } from '../hooks/useSession';
import { emitRating } from '../services/socket';
import { RatingEmoji, ReportCategory } from '../../shared/types';

const RATINGS: { emoji: string; value: RatingEmoji }[] = [
  { emoji: '😔', value: 'very_bad' },
  { emoji: '😐', value: 'bad' },
  { emoji: '🙂', value: 'okay' },
  { emoji: '😊', value: 'good' },
  { emoji: '🤩', value: 'great' },
];

const BAD_RATINGS: RatingEmoji[] = ['very_bad', 'bad'];

const REPORT_CATEGORIES: { label: string; value: ReportCategory }[] = [
  { label: 'Inappropriate / sexual', value: 'inappropriate_sexual' },
  { label: 'Rude / aggressive', value: 'rude_aggressive' },
  { label: 'Shared personal info', value: 'shared_personal_info' },
  { label: 'Other', value: 'other' },
];

export default function EndScreen() {
  const theme = getTheme();
  const router = useRouter();
  const { userId, updateTrustScore } = useSession();
  const { sessionId, mood, partnerUserId } = useLocalSearchParams<{ sessionId: string; mood: string; partnerUserId: string }>();

  const [selectedRating, setSelectedRating] = useState<RatingEmoji | null>(null);
  const [showReportFollowUp, setShowReportFollowUp] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (rating: RatingEmoji) => {
    setSelectedRating(rating);
    if (BAD_RATINGS.includes(rating)) {
      setShowReportFollowUp(true);
    } else {
      // Positive rating — boost trust score
      updateTrustScore(5);
      submitRating(rating);
    }
  };

  const submitRating = (rating: RatingEmoji) => {
    if (sessionId) {
      emitRating({ sessionId, ratedUserId: partnerUserId || '', rating });
    }
    updateTrustScore(2); // +2 for completing session
    setSubmitted(true);
  };

  const handleReportCategory = (category: ReportCategory) => {
    setSelectedCategory(category);
    submitRating(selectedRating!);
    // Report is handled server-side when rating is submitted
  };

  const handleRequeue = () => {
    router.replace('/mood');
  };

  const handleDismiss = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sparkle}>✨</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Session Complete</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          How did that feel?
        </Text>

        {/* Rating */}
        {!submitted && (
          <View style={styles.ratingRow}>
            {RATINGS.map(({ emoji, value }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.ratingBtn,
                  selectedRating === value && {
                    borderColor: theme.colors.primary,
                    backgroundColor: theme.colors.surface,
                  },
                  { borderColor: theme.colors.border },
                ]}
                onPress={() => handleRating(value)}
              >
                <Text style={styles.ratingEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Follow-up for bad ratings */}
        {showReportFollowUp && !submitted && (
          <View style={[styles.followUp, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.followUpTitle, { color: theme.colors.text }]}>
              Was the other person inappropriate?
            </Text>
            {REPORT_CATEGORIES.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.categoryBtn,
                  { borderColor: theme.colors.border },
                  selectedCategory === value && { borderColor: theme.colors.error },
                ]}
                onPress={() => handleReportCategory(value)}
              >
                <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => submitRating(selectedRating!)}>
              <Text style={[styles.skipText, { color: theme.colors.textMuted }]}>
                No, skip
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {submitted && (
          <View style={styles.thankYou}>
            <Text style={[styles.thankYouText, { color: theme.colors.textSecondary }]}>
              Thank you for sharing. 💜
            </Text>
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity
          style={[styles.requeueBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleRequeue}
        >
          <Text style={[styles.requeueText, { color: theme.colors.white }]}>
            Talk to someone else →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
          <Text style={[styles.dismissText, { color: theme.colors.textMuted }]}>Maybe later</Text>
        </TouchableOpacity>

        <Text style={[styles.erased, { color: theme.colors.textMuted }]}>
          This conversation has been erased.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
    gap: 20,
  },
  sparkle: { fontSize: 52 },
  title: { fontSize: 30, fontWeight: '700' },
  subtitle: { fontSize: 17 },
  ratingRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  ratingBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingEmoji: { fontSize: 28 },
  followUp: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  followUpTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  categoryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryText: { fontSize: 15 },
  skipText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  thankYou: { paddingVertical: 12 },
  thankYouText: { fontSize: 17 },
  requeueBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  requeueText: { fontSize: 18, fontWeight: '700' },
  dismissBtn: { paddingVertical: 8 },
  dismissText: { fontSize: 15 },
  erased: {
    fontSize: 13,
    marginTop: 12,
    fontStyle: 'italic',
  },
});

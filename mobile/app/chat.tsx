import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTheme } from '../constants/theme';
import { useTimer } from '../hooks/useTimer';
import { Timer } from '../components/Timer';
import { ReactionBubble } from '../components/ReactionBubble';
import { AudioWaveform } from '../components/AudioWaveform';
import { REACTIONS } from '../constants/reactions';
import { agoraService } from '../services/agora';
import {
  onPhaseChange,
  onReactionReceived,
  onPartnerLeft,
  offPhaseChange,
  offReactionReceived,
  offPartnerLeft,
  emitReaction,
  emitReport,
  emitLeaveSession,
} from '../services/socket';
import { SessionPhase, SessionRole, ReactionType, ReportCategory } from '../../shared/types';
import { useSession } from '../hooks/useSession';

const PHASE_DURATIONS: Record<SessionPhase, number> = {
  phase1: 5 * 60,
  transition: 5,
  phase2: 5 * 60,
  open: 2 * 60,
  ended: 0,
};

const SILENCE_PROMPT_SECONDS = 60;
const SILENCE_END_SECONDS = 90;

export default function ChatScreen() {
  const theme = getTheme();
  const router = useRouter();
  const { userId, updateTrustScore } = useSession();
  const params = useLocalSearchParams<{
    sessionId: string;
    agoraChannel: string;
    agoraToken: string;
    role: SessionRole;
    partnerMood: string;
    phase: SessionPhase;
    mood: string;
  }>();

  const [phase, setPhase] = useState<SessionPhase>((params.phase as SessionPhase) || 'phase1');
  const [role, setRole] = useState<SessionRole>((params.role as SessionRole) || 'speaker');
  const [volume, setVolume] = useState(0);
  const [silenceSeconds, setSilenceSeconds] = useState(0);
  const [latestReaction, setLatestReaction] = useState<ReactionType | null>(null);

  const silenceRef = useRef(0);
  const silenceInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSpeaker = role === 'speaker';

  const handlePhaseExpire = () => {
    const nextPhase: Partial<Record<SessionPhase, SessionPhase>> = {
      phase1: 'transition',
      transition: 'phase2',
      phase2: 'open',
      open: 'ended',
    };
    const next = nextPhase[phase];
    if (next === 'ended') {
      handleEndSession();
    } else if (next) {
      setPhase(next);
    }
  };

  const { seconds, start: startTimer } = useTimer(handlePhaseExpire);

  useEffect(() => {
    if (PHASE_DURATIONS[phase] > 0) {
      startTimer(PHASE_DURATIONS[phase]);
    }
    if (phase === 'ended') {
      handleEndSession();
    }
  }, [phase]);

  useEffect(() => {
    // Join Agora voice channel
    if (params.agoraChannel && userId) {
      agoraService.join({
        appId: process.env.EXPO_PUBLIC_AGORA_APP_ID || '',
        channel: params.agoraChannel,
        token: params.agoraToken || '',
        uid: parseInt(userId.slice(0, 8), 16) % 100000,
      });
      agoraService.onVolumeIndicator((volumes) => {
        const myVolume = volumes.find((v) => v.uid !== 0);
        setVolume(myVolume?.volume || 0);
      });
    }

    onPhaseChange((data) => {
      setPhase(data.newPhase);
      setRole(data.newRole);
    });

    onReactionReceived((data) => {
      setLatestReaction(data.reactionType);
      setTimeout(() => setLatestReaction(null), 3000);
    });

    onPartnerLeft(() => {
      Alert.alert('Partner left', 'Your conversation partner has disconnected.');
      handleEndSession();
    });

    return () => {
      offPhaseChange();
      offReactionReceived();
      offPartnerLeft();
      agoraService.leave();
      if (silenceInterval.current) clearInterval(silenceInterval.current);
    };
  }, []);

  // Mute listener in phase1/phase2
  useEffect(() => {
    const shouldMute = (phase === 'phase1' || phase === 'phase2') && !isSpeaker;
    agoraService.muteLocalAudio(shouldMute);
  }, [phase, role]);

  // Silence detection
  useEffect(() => {
    if (silenceInterval.current) clearInterval(silenceInterval.current);

    if (phase === 'open' || (isSpeaker && (phase === 'phase1' || phase === 'phase2'))) {
      silenceRef.current = 0;
      silenceInterval.current = setInterval(() => {
        if (volume > 5) {
          silenceRef.current = 0;
          setSilenceSeconds(0);
        } else {
          silenceRef.current += 1;
          setSilenceSeconds(silenceRef.current);
          if (silenceRef.current === SILENCE_PROMPT_SECONDS) {
            Alert.alert('Still there?', 'It\'s been quiet for a while.');
          }
          if (silenceRef.current >= SILENCE_END_SECONDS) {
            handleEndSession();
          }
        }
      }, 1000);
    }

    return () => {
      if (silenceInterval.current) clearInterval(silenceInterval.current);
    };
  }, [phase, role, volume]);

  const handleReaction = (reactionType: ReactionType) => {
    if (!params.sessionId || isSpeaker) return;
    emitReaction({ sessionId: params.sessionId, reactionType });
  };

  const handleReport = () => {
    Alert.alert(
      'Report',
      'What happened?',
      [
        { text: 'Inappropriate/sexual', onPress: () => submitReport('inappropriate_sexual') },
        { text: 'Rude/aggressive', onPress: () => submitReport('rude_aggressive') },
        { text: 'Shared personal info', onPress: () => submitReport('shared_personal_info') },
        { text: 'Other', onPress: () => submitReport('other') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const submitReport = (category: ReportCategory) => {
    if (!params.sessionId || !userId) return;
    emitReport({ sessionId: params.sessionId, reportedUserId: '', category });
    handleEndSession();
  };

  const handleEndSession = () => {
    if (params.sessionId && userId) {
      emitLeaveSession(params.sessionId, userId);
    }
    agoraService.leave();
    router.replace({
      pathname: '/end',
      params: { sessionId: params.sessionId, mood: params.mood },
    });
  };

  const getPhaseLabel = (): string => {
    if (phase === 'transition') return 'Switching roles...';
    if (phase === 'open') return 'Open conversation';
    if (isSpeaker) return 'Speak freely.';
    return 'You are listening.';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.phaseLabel, { color: theme.colors.textSecondary }]}>
          {phase === 'phase1' ? 'Phase 1' : phase === 'phase2' ? 'Phase 2' : phase === 'open' ? 'Open' : ''}
        </Text>
        <TouchableOpacity onPress={handleReport} style={styles.reportBtn}>
          <Text style={styles.reportIcon}>⚠️</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.main}>
        {phase === 'transition' ? (
          <View style={styles.transitionView}>
            <Text style={[styles.transitionText, { color: theme.colors.text }]}>
              Switching roles...
            </Text>
            <Timer seconds={seconds} />
          </View>
        ) : (
          <>
            <Text style={[styles.roleText, { color: theme.colors.text }]}>
              {getPhaseLabel()}
            </Text>

            <Timer
              seconds={seconds}
              label={phase === 'open' ? 'Time left' : undefined}
            />

            {/* Waveform for both speaker and listener */}
            <AudioWaveform
              volume={volume}
              isActive={phase !== 'ended' && phase !== 'transition'}
              color={isSpeaker ? theme.colors.primary : theme.colors.textMuted}
            />

            {/* Reactions (listener only, during phase1/phase2) */}
            {!isSpeaker && (phase === 'phase1' || phase === 'phase2') && (
              <View style={styles.reactions}>
                {REACTIONS.map((r) => (
                  <ReactionBubble
                    key={r.id}
                    reaction={r}
                    onPress={(reaction) => handleReaction(reaction.id)}
                  />
                ))}
              </View>
            )}

            {/* Latest reaction display */}
            {latestReaction && (
              <View style={[styles.reactionToast, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.reactionToastText, { color: theme.colors.text }]}>
                  {REACTIONS.find((r) => r.id === latestReaction)?.label || latestReaction}
                </Text>
              </View>
            )}

            {/* Speaker mic indicator */}
            {isSpeaker && (
              <View style={[styles.micIndicator, { borderColor: theme.colors.primary }]}>
                <Text style={styles.micEmoji}>🎙️</Text>
                <Text style={[styles.micLabel, { color: theme.colors.textSecondary }]}>
                  Your mic is on
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Leave button (open phase only) */}
      {phase === 'open' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.leaveBtn, { borderColor: theme.colors.border }]}
            onPress={handleEndSession}
          >
            <Text style={[styles.leaveText, { color: theme.colors.textSecondary }]}>
              Leave Room 👋
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  phaseLabel: { fontSize: 14, letterSpacing: 1 },
  reportBtn: { padding: 8 },
  reportIcon: { fontSize: 22 },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 28,
  },
  roleText: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  transitionView: { alignItems: 'center', gap: 16 },
  transitionText: { fontSize: 24, fontWeight: '600' },
  reactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  reactionToast: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  reactionToastText: { fontSize: 16, fontWeight: '600' },
  micIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  micEmoji: { fontSize: 20 },
  micLabel: { fontSize: 14 },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  leaveBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  leaveText: { fontSize: 17 },
});

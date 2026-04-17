import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { getTheme } from '../constants/theme';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export const RoomRules: React.FC<Props> = ({ visible, onDismiss }) => {
  const theme = getTheme();

  const rules = [
    '🤝 Listen first. Speak kindly.',
    '🔒 No sharing personal info — ever.',
    '⏱️ Conversations auto-erase when done.',
    '🚫 Hate, harassment, or sexual content = ban.',
    '💜 Treat the voice you hear with care.',
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Welcome to 2AM 🌙
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            This is a listening space. Be kind.{'\n'}Everything disappears.
          </Text>

          <View style={styles.rulesList}>
            {rules.map((rule, i) => (
              <Text key={i} style={[styles.rule, { color: theme.colors.textSecondary }]}>
                {rule}
              </Text>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={onDismiss}
          >
            <Text style={[styles.buttonText, { color: theme.colors.white }]}>Got it 👍</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  rulesList: {
    gap: 12,
    marginBottom: 28,
  },
  rule: {
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});

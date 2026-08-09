import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { colors, radii, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation for actions that cannot be taken back. */
export function ConfirmSheet({
  visible,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.scrim} onPress={onCancel} accessibilityLabel="Άκυρο" />

      <View style={styles.wrap}>
        <View style={styles.card}>
          <View style={styles.icon}>
            <AlertTriangle size={22} color={colors.danger} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          <Pressable onPress={onConfirm} style={styles.confirm} accessibilityRole="button">
            <Text style={styles.confirmLabel}>{confirmLabel}</Text>
          </Pressable>
          <Pressable onPress={onCancel} style={styles.cancel} accessibilityRole="button">
            <Text style={styles.cancelLabel}>Άκυρο</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.scrim,
  },
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    // The scrim behind handles dismissal; this layer only centres the card.
    pointerEvents: 'box-none',
  },
  card: {
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    backgroundColor: '#FBE4E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  confirm: {
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.md,
  },
  confirmLabel: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  cancel: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cancelLabel: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
});

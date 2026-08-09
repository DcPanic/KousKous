import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Ban, Check, Flag, Link2, UserMinus } from 'lucide-react-native';
import { colors, radii, spacing, toGreekUpperCase } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { linkTo, shareLink } from '@/lib/share';
import { useAppState } from '@/state/app-state';

/** The reasons moderation actually needs to triage a report. */
const REPORT_REASONS = [
  'Παρενόχληση ή εκφοβισμός',
  'Ρητορική μίσους',
  'Απάτη ή spam',
  'Ακατάλληλο περιεχόμενο',
  'Δεν αφορά γυναικεία κοινότητα',
  'Κάτι άλλο',
];

interface PostOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  author: string;
}

/**
 * Options behind the "…" on a post: report, block, copy link.
 *
 * Reporting is two steps on purpose — a single tap that silently files a
 * report is easy to hit by accident and tells the reporter nothing.
 */
export function PostOptionsSheet({ visible, onClose, postId, author }: PostOptionsSheetProps) {
  const { isBlocked, toggleBlocked, reportPost, reportedPostIds } = useAppState();

  const [step, setStep] = useState<'menu' | 'reasons' | 'done'>('menu');
  const [copied, setCopied] = useState(false);

  const blocked = isBlocked(author);
  const alreadyReported = reportedPostIds.includes(postId);

  const close = () => {
    setStep('menu');
    setCopied(false);
    onClose();
  };

  const submitReport = () => {
    reportPost(postId);
    setStep('done');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.scrim} onPress={close} accessibilityLabel="Κλείσιμο" />

      <View style={styles.sheet}>
        <View style={styles.grabber} />

        {step === 'menu' ? (
          <>
            <Option
              icon={Link2}
              label={copied ? 'Ο σύνδεσμος αντιγράφηκε' : 'Αντιγραφή συνδέσμου'}
              onPress={() => {
                void shareLink('Δες αυτό στο KousKous', linkTo(`/post/${postId}`));
                setCopied(true);
              }}
            />
            <Option
              icon={Flag}
              label={alreadyReported ? 'Το έχεις ήδη αναφέρει' : 'Αναφορά δημοσίευσης'}
              tone="danger"
              disabled={alreadyReported}
              onPress={() => setStep('reasons')}
            />
            <Option
              icon={blocked ? UserMinus : Ban}
              label={blocked ? `Άρση αποκλεισμού ${author}` : `Αποκλεισμός ${author}`}
              tone="danger"
              onPress={() => {
                toggleBlocked(author);
                close();
              }}
            />
            <Pressable onPress={close} style={styles.cancel} accessibilityRole="button">
              <Text style={styles.cancelLabel}>Άκυρο</Text>
            </Pressable>
          </>
        ) : step === 'reasons' ? (
          <>
            <View style={styles.stepHeader}>
              <Pressable
                onPress={() => setStep('menu')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Πίσω"
              >
                <ArrowLeft size={17} color={colors.text} />
              </Pressable>
              <Text style={styles.stepTitle}>{toGreekUpperCase('Γιατί το αναφέρεις;')}</Text>
            </View>
            {REPORT_REASONS.map((reason) => (
              <Pressable
                key={reason}
                onPress={submitReport}
                style={styles.reason}
                accessibilityRole="button"
              >
                <Text style={styles.reasonLabel}>{reason}</Text>
              </Pressable>
            ))}
          </>
        ) : (
          <View style={styles.done}>
            <View style={styles.doneIcon}>
              <Check size={22} color={colors.white} />
            </View>
            <Text style={styles.doneTitle}>Ευχαριστούμε</Text>
            <Text style={styles.doneBody}>
              Η αναφορά στάλθηκε στην ομάδα μας. Θα την ελέγξουμε και θα σε ενημερώσουμε.
            </Text>
            <Pressable onPress={close} style={styles.doneButton} accessibilityRole="button">
              <Text style={styles.doneButtonLabel}>Εντάξει</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

function Option({
  icon: Icon,
  label,
  onPress,
  tone,
  disabled,
}: {
  icon: typeof Flag;
  label: string;
  onPress: () => void;
  tone?: 'danger';
  disabled?: boolean;
}) {
  const tint = tone === 'danger' ? colors.danger : colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.option, disabled && styles.optionDisabled]}
      accessibilityRole="button"
    >
      <Icon size={18} color={tint} strokeWidth={1.9} />
      <Text style={[styles.optionLabel, { color: tint }]}>{label}</Text>
    </Pressable>
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
  sheet: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  grabber: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.borderChip,
    marginBottom: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
  },
  optionDisabled: {
    opacity: 0.45,
  },
  optionLabel: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: font.medium,
  },
  cancel: {
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  cancelLabel: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  stepTitle: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
  },
  reason: {
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reasonLabel: {
    fontSize: 13,
    fontFamily: font.medium,
    color: colors.textBody,
  },
  done: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  doneIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  doneBody: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: spacing.lg,
  },
  doneButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.md,
  },
  doneButtonLabel: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
});

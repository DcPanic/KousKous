import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, Info, QrCode } from 'lucide-react-native';
import { colors, radii, spacing, toGreekUpperCase } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { people } from '@/data/people';
import { Avatar } from './avatar';

interface CheckInSheetProps {
  visible: boolean;
  onClose: () => void;
  eventTitle: string;
  /** Opened from the QR button rather than the attendee list. */
  scanning?: boolean;
}

/**
 * Door list for one of the host's events.
 *
 * QR scanning needs the camera, which is not wired up, so the sheet says
 * so and falls back to tapping a name — which is what a host does anyway
 * when a phone battery dies at the door.
 */
export function CheckInSheet({ visible, onClose, eventTitle, scanning }: CheckInSheetProps) {
  const [checkedIn, setCheckedIn] = useState<string[]>([]);

  const attendees = people.slice(0, 5);

  const toggle = (id: string) => {
    setCheckedIn((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [id, ...prev],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Κλείσιμο" />

      <View style={styles.sheet}>
        <View style={styles.grabber} />

        <Text style={styles.eyebrow}>{toGreekUpperCase('Check-in')}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {eventTitle}
        </Text>
        <Text style={styles.count}>
          {checkedIn.length} από {attendees.length} έχουν έρθει
        </Text>

        {scanning ? (
          <View style={styles.notice}>
            <QrCode size={15} color={colors.hostPurpleDark} />
            <Text style={styles.noticeLabel}>
              Η σάρωση QR ενεργοποιείται μαζί με την κάμερα. Μέχρι τότε κάνε check-in πατώντας το
              όνομα.
            </Text>
          </View>
        ) : (
          <View style={styles.notice}>
            <Info size={15} color={colors.hostPurpleDark} />
            <Text style={styles.noticeLabel}>
              Πάτα το όνομα μόλις φτάσει. Η λίστα δεν αποθηκεύεται ακόμα στον server.
            </Text>
          </View>
        )}

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {attendees.map((person) => {
            const here = checkedIn.includes(person.id);
            return (
              <Pressable
                key={person.id}
                onPress={() => toggle(person.id)}
                style={styles.row}
                accessibilityRole="button"
                accessibilityState={{ selected: here }}
                accessibilityLabel={`${here ? 'Αναίρεση check-in' : 'Check-in'} ${person.name}`}
              >
                <Avatar size={36} />
                <Text style={[styles.name, here && styles.nameChecked]} numberOfLines={1}>
                  {person.name}
                </Text>
                <View style={[styles.tick, here && styles.tickOn]}>
                  {here ? <Check size={14} color={colors.white} /> : null}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable onPress={onClose} style={styles.done} accessibilityRole="button">
          <Text style={styles.doneLabel}>Κλείσιμο</Text>
        </Pressable>
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
  sheet: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  grabber: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.borderChip,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.hostPurple,
  },
  title: {
    fontSize: 15.5,
    fontFamily: font.extrabold,
    color: colors.text,
    marginTop: 2,
  },
  count: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.hostPurpleTint,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noticeLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.hostPurpleDark,
    lineHeight: 16,
  },
  list: {
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  nameChecked: {
    color: colors.textMuted,
  },
  tick: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.borderChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickOn: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  done: {
    alignItems: 'center',
    backgroundColor: colors.hostPurple,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.md,
  },
  doneLabel: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
});

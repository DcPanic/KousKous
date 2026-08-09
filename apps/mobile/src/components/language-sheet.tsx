import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radii, spacing, toGreekUpperCase } from '@kouskous/shared';
import { font } from '@/theme/typography';

/**
 * Greek is the product language (spec §6); English is there for the women
 * in Greece and Cyprus who do not read Greek comfortably. Nothing else is
 * offered until the copy is actually translated.
 */
const LANGUAGES: { id: string; label: string; native: string; ready: boolean }[] = [
  { id: 'el', label: 'Ελληνικά', native: 'Ελληνικά', ready: true },
  { id: 'en', label: 'Αγγλικά', native: 'English', ready: false },
];

export function LanguageSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState('el');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Κλείσιμο" />

      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <Text style={styles.title}>{toGreekUpperCase('Γλώσσα')}</Text>

        {LANGUAGES.map((language) => {
          const active = language.id === selected;
          return (
            <Pressable
              key={language.id}
              onPress={() => language.ready && setSelected(language.id)}
              disabled={!language.ready}
              style={[styles.row, !language.ready && styles.rowDisabled]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <View style={styles.rowText}>
                <Text style={styles.label}>{language.label}</Text>
                <Text style={styles.native}>
                  {language.native}
                  {language.ready ? '' : ' · σύντομα'}
                </Text>
              </View>
              {active ? <Check size={17} color={colors.pink} /> : null}
            </Pressable>
          );
        })}

        <Pressable onPress={onClose} style={styles.done} accessibilityRole="button">
          <Text style={styles.doneLabel}>Εντάξει</Text>
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
  title: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowDisabled: {
    opacity: 0.45,
  },
  rowText: {
    flex: 1,
  },
  label: {
    fontSize: 13.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  native: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 1,
  },
  done: {
    alignItems: 'center',
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.lg,
  },
  doneLabel: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
});

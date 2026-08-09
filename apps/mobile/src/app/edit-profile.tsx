import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Check, Info, Search, X } from 'lucide-react-native';
import {
  categories,
  colors,
  findPlace,
  radii,
  searchPlaces,
  spacing,
  toGreekUpperCase,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { pickMedia } from '@/lib/media';
import { useSession } from '@/state/session';
import { Avatar } from '@/components/avatar';

const BIO_LIMIT = 160;
const MAX_INTERESTS = 5;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useSession();

  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? '');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(user.avatar_url ?? undefined);
  const [placeId, setPlaceId] = useState<string | null>(user.location ?? null);
  const [placeQuery, setPlaceQuery] = useState('');
  const [editingPlace, setEditingPlace] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);

  const suggestions = useMemo(() => {
    if (placeQuery.trim().length < 2) return [];
    return searchPlaces(placeQuery).slice(0, 6);
  }, [placeQuery]);

  const canSave = name.trim().length > 1;

  const pickAvatar = async () => {
    const picked = await pickMedia('image');
    if (picked.length > 0) setAvatarUri(picked[0].uri);
  };

  const toggleInterest = (id: string) => {
    setInterests((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= MAX_INTERESTS) return prev;
      return [...prev, id];
    });
  };

  const save = () => {
    if (!canSave) return;
    // Saving needs Supabase; until then the screen closes without
    // pretending the profile was updated.
    router.back();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.close}
          accessibilityRole="button"
          accessibilityLabel="Κλείσιμο"
        >
          <X size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Επεξεργασία προφίλ</Text>
        <Pressable
          onPress={save}
          disabled={!canSave}
          style={[styles.save, !canSave && styles.saveDisabled]}
          accessibilityRole="button"
        >
          <Text style={styles.saveLabel}>Αποθήκευση</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarBlock}>
            <Pressable
              onPress={pickAvatar}
              accessibilityRole="button"
              accessibilityLabel="Αλλαγή φωτογραφίας προφίλ"
            >
              <Avatar size={86} uri={avatarUri} />
              <View style={styles.cameraBadge}>
                <Camera size={14} color={colors.white} />
              </View>
            </Pressable>
            <Pressable onPress={pickAvatar} accessibilityRole="button">
              <Text style={styles.avatarAction}>Αλλαγή φωτογραφίας</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>{toGreekUpperCase('Όνομα')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Το όνομά σου"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>{toGreekUpperCase('Λίγα λόγια για εσένα')}</Text>
          <TextInput
            value={bio}
            onChangeText={(text) => setBio(text.slice(0, BIO_LIMIT))}
            placeholder="π.χ. Αθήνα · βιβλία, θάλασσα και πολύ καφέ ☕"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.multiline]}
            multiline
          />
          <Text style={styles.counter}>
            {bio.length}/{BIO_LIMIT}
          </Text>

          <Text style={styles.label}>{toGreekUpperCase('Περιοχή')}</Text>
          {placeId && !editingPlace ? (
            <Pressable
              onPress={() => {
                setEditingPlace(true);
                setPlaceQuery('');
              }}
              style={styles.selectedPlace}
              accessibilityRole="button"
            >
              <Check size={15} color={colors.pink} />
              <Text style={styles.selectedPlaceLabel}>{findPlace(placeId)?.name}</Text>
              <Text style={styles.change}>αλλαγή</Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.inputRow}>
                <Search size={16} color={colors.textMuted} />
                <TextInput
                  value={placeQuery}
                  onChangeText={setPlaceQuery}
                  placeholder="Γράψε πόλη ή χωριό"
                  placeholderTextColor={colors.textMuted}
                  style={styles.inputFlex}
                  autoFocus
                />
              </View>
              {suggestions.map((place) => (
                <Pressable
                  key={place.id}
                  onPress={() => {
                    setPlaceId(place.id);
                    setEditingPlace(false);
                  }}
                  style={styles.suggestion}
                  accessibilityRole="button"
                >
                  <Text style={styles.suggestionName}>{place.name}</Text>
                  <Text style={styles.suggestionMeta}>
                    {place.country === 'CY' ? 'Κύπρος' : 'Ελλάδα'}
                  </Text>
                </Pressable>
              ))}
            </>
          )}

          <Text style={styles.label}>{toGreekUpperCase('Τα ενδιαφέροντά σου')}</Text>
          <Text style={styles.hint}>
            Διάλεξε έως {MAX_INTERESTS} — εμφανίζονται στο προφίλ σου και βοηθούν να σε βρίσκουν
            γυναίκες με τα ίδια ενδιαφέροντα.
          </Text>
          <View style={styles.chipWrap}>
            {categories.map((category) => {
              const selected = interests.includes(category.id);
              const full = interests.length >= MAX_INTERESTS && !selected;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => toggleInterest(category.id)}
                  disabled={full}
                  style={[styles.chip, selected && styles.chipActive, full && styles.chipDisabled]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={styles.chipEmoji}>{category.emoji}</Text>
                  <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.notice}>
            <Info size={15} color={colors.pinkDark} />
            <Text style={styles.noticeLabel}>
              Οι αλλαγές δεν αποθηκεύονται ακόμα — η σύνδεση με τη βάση (Supabase) δεν έχει
              ενεργοποιηθεί.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  save: {
    backgroundColor: colors.pink,
    borderRadius: radii.full,
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
  },
  saveDisabled: {
    backgroundColor: colors.textInactive,
  },
  saveLabel: {
    fontSize: 12.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  avatarBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.cream,
  },
  avatarAction: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.pink,
  },
  label: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  counter: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textFaint,
    textAlign: 'right',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text,
  },
  selectedPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
  },
  selectedPlaceLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.pinkDark,
  },
  change: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.pink,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    marginTop: 6,
  },
  suggestionName: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  suggestionMeta: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.pink,
    backgroundColor: colors.pinkSoft,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipEmoji: {
    fontSize: 13,
  },
  chipLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  chipLabelActive: {
    color: colors.pinkDark,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  noticeLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.pinkDark,
    lineHeight: 16,
  },
});

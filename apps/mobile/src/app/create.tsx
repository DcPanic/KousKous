import { useState } from 'react';
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
import { ImagePlus, MapPin, Video, X } from 'lucide-react-native';
import {
  categories,
  colors,
  findPlace,
  places,
  radii,
  spacing,
  toGreekUpperCase,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import type { Attachment } from '@/data/forum';
import { pickMedia } from '@/lib/media';
import { useAppState } from '@/state/app-state';
import { useSession } from '@/state/session';
import { AttachmentGrid } from '@/components/attachments';
import { Avatar } from '@/components/avatar';

/** Cities and areas only — a post belongs somewhere specific. */
const POSTABLE_PLACES = places.filter(
  (place) => place.kind === 'city' || place.kind === 'area',
);

export default function CreatePostScreen() {
  const router = useRouter();
  const { user } = useSession();
  const { addPost } = useAppState();

  const [caption, setCaption] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [placeId, setPlaceId] = useState<string>(user.location ?? 'athens');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [placePickerOpen, setPlacePickerOpen] = useState(false);

  const attach = async (kind: 'image' | 'video') => {
    const picked = await pickMedia(kind);
    if (picked.length > 0) setAttachments((prev) => [...prev, ...picked]);
  };

  const canPublish = caption.trim().length > 0 || attachments.length > 0;

  const publish = () => {
    if (!canPublish) return;

    const place = findPlace(placeId);
    // Hashtags are written inline; they are pulled out so the card can
    // colour them the way the design does.
    const words = caption.trim().split(/\s+/);
    const hashtags = words.filter((word) => word.startsWith('#'));
    const body = words.filter((word) => !word.startsWith('#')).join(' ');

    addPost({
      id: `local-${Date.now()}`,
      author: user.name,
      verified: user.is_verified,
      location: placeId,
      locationLabel: place ? `${place.name}, ${place.country === 'CY' ? 'Κύπρος' : 'Ελλάδα'}` : '',
      timeAgo: 'μόλις τώρα',
      caption: body,
      hashtags: hashtags.join(' '),
      mediaCount: attachments.length,
      likes: 0,
      comments: 0,
      shares: 0,
      likedByLabel: '',
      commentPreviews: [],
      totalComments: 0,
      categoryId,
      attachments,
    });

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
        <Text style={styles.headerTitle}>Νέα δημοσίευση</Text>
        <Pressable
          onPress={publish}
          disabled={!canPublish}
          style={[styles.publish, !canPublish && styles.publishDisabled]}
          accessibilityRole="button"
        >
          <Text style={styles.publishLabel}>Δημοσίευση</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.authorRow}>
            <Avatar size={38} />
            <Text style={styles.authorName}>{user.name}</Text>
          </View>

          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Τι θέλεις να μοιραστείς;"
            placeholderTextColor={colors.textMuted}
            style={styles.caption}
            multiline
            autoFocus
          />

          <AttachmentGrid
            attachments={attachments}
            onRemove={(id) => setAttachments((prev) => prev.filter((item) => item.id !== id))}
            height={200}
          />

          <Text style={styles.sectionTitle}>{toGreekUpperCase('Τοποθεσία')}</Text>
          <Pressable
            onPress={() => setPlacePickerOpen((open) => !open)}
            style={styles.placeButton}
            accessibilityRole="button"
          >
            <MapPin size={15} color={colors.pink} />
            <Text style={styles.placeLabel}>{findPlace(placeId)?.name}</Text>
            <Text style={styles.placeChange}>{placePickerOpen ? 'κλείσιμο' : 'αλλαγή'}</Text>
          </Pressable>

          {placePickerOpen ? (
            <View style={styles.chipWrap}>
              {POSTABLE_PLACES.map((place) => {
                const selected = place.id === placeId;
                return (
                  <Pressable
                    key={place.id}
                    onPress={() => {
                      setPlaceId(place.id);
                      setPlacePickerOpen(false);
                    }}
                    style={[styles.chip, selected && styles.chipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>
                      {place.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>{toGreekUpperCase('Κοινότητα (προαιρετικό)')}</Text>
          <Text style={styles.sectionHint}>
            Διάλεξε μία και η δημοσίευση εμφανίζεται σε όσες την ακολουθούν.
          </Text>
          <View style={styles.chipWrap}>
            {categories.map((category) => {
              const selected = category.id === categoryId;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => setCategoryId(selected ? null : category.id)}
                  style={[styles.chip, selected && styles.chipActive]}
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
        </ScrollView>

        <View style={styles.toolbar}>
          <Pressable
            onPress={() => attach('image')}
            style={styles.tool}
            accessibilityRole="button"
            accessibilityLabel="Προσθήκη φωτογραφίας"
          >
            <ImagePlus size={19} color={colors.pink} />
            <Text style={styles.toolLabel}>Φωτογραφία</Text>
          </Pressable>
          <Pressable
            onPress={() => attach('video')}
            style={styles.tool}
            accessibilityRole="button"
            accessibilityLabel="Προσθήκη βίντεο"
          >
            <Video size={19} color={colors.pink} />
            <Text style={styles.toolLabel}>Βίντεο</Text>
          </Pressable>
        </View>
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
  publish: {
    backgroundColor: colors.pink,
    borderRadius: radii.full,
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
  },
  publishDisabled: {
    backgroundColor: colors.textInactive,
  },
  publishLabel: {
    fontSize: 12.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  authorName: {
    fontSize: 13.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  caption: {
    fontSize: 15,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 23,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionHint: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  placeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
  },
  placeLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  placeChange: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.pink,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: spacing.sm,
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
  toolbar: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.md,
  },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.full,
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
  },
  toolLabel: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.pinkDark,
  },
});

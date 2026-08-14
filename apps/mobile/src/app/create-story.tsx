import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, ImagePlus, Play, Video, X } from 'lucide-react-native';
import { colors, radii, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { pickMedia } from '@/lib/media';
import { useSession } from '@/state/session';
import { useStories } from '@/state/stories';

const CAPTION_LIMIT = 120;

/**
 * Post a story: one photo or video, gone in 24 hours.
 *
 * The picker opens first because a story is the media — the caption is
 * optional and comes after, over the preview.
 */
export default function CreateStoryScreen() {
  const router = useRouter();
  const { signedIn } = useSession();
  const { publish } = useStories();

  const [uri, setUri] = useState<string | null>(null);
  const [kind, setKind] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (wanted: 'image' | 'video') => {
    const picked = await pickMedia(wanted);
    const file = picked.find((item) => item.uri);
    if (!file?.uri) return;

    setUri(file.uri);
    setKind(wanted);
    setError(null);
  };

  const submit = async () => {
    if (!uri || publishing) return;

    setPublishing(true);
    setError(null);

    const ok = await publish({ kind, uri, caption: caption.trim() });

    setPublishing(false);

    if (!ok) {
      setError(
        signedIn
          ? 'Η ιστορία δεν ανέβηκε. Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.'
          : 'Κάνε σύνδεση για να ανεβάσεις ιστορία.',
      );
      return;
    }

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
        <Text style={styles.headerTitle}>Νέα ιστορία</Text>
        <Pressable
          onPress={() => void submit()}
          disabled={!uri || publishing}
          style={[styles.publish, (!uri || publishing) && styles.publishDisabled]}
          accessibilityRole="button"
        >
          <Text style={styles.publishLabel}>{publishing ? 'Ανέβασμα...' : 'Δημοσίευση'}</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <View style={styles.preview}>
            {uri ? (
              <>
                {kind === 'image' ? (
                  <Image source={{ uri }} style={styles.previewMedia} contentFit="cover" />
                ) : (
                  <View style={styles.videoPreview}>
                    <Play size={30} color={colors.white} fill={colors.white} />
                    <Text style={styles.videoLabel}>Βίντεο έτοιμο</Text>
                  </View>
                )}
                {caption.length > 0 ? (
                  <View style={styles.captionOverlay}>
                    <Text style={styles.captionPreview}>{caption}</Text>
                  </View>
                ) : null}
              </>
            ) : (
              <View style={styles.emptyPreview}>
                <ImagePlus size={26} color={colors.pink} />
                <Text style={styles.emptyLabel}>Διάλεξε φωτογραφία ή βίντεο</Text>
              </View>
            )}
          </View>

          <View style={styles.pickRow}>
            <Pressable
              onPress={() => void pick('image')}
              style={styles.pickButton}
              accessibilityRole="button"
            >
              <ImagePlus size={18} color={colors.pink} />
              <Text style={styles.pickLabel}>Φωτογραφία</Text>
            </Pressable>
            <Pressable
              onPress={() => void pick('video')}
              style={styles.pickButton}
              accessibilityRole="button"
            >
              <Video size={18} color={colors.pink} />
              <Text style={styles.pickLabel}>Βίντεο</Text>
            </Pressable>
          </View>

          <TextInput
            value={caption}
            onChangeText={(text) => setCaption(text.slice(0, CAPTION_LIMIT))}
            placeholder="Γράψε κάτι (προαιρετικό)"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <View style={styles.notice}>
            <Clock size={15} color={colors.pinkDark} />
            <Text style={styles.noticeLabel}>
              Η ιστορία σου εξαφανίζεται αυτόματα μετά από 24 ώρες.
            </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
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
    flex: 1,
    paddingHorizontal: spacing.screen,
  },
  preview: {
    flex: 1,
    borderRadius: radii.card,
    overflow: 'hidden',
    backgroundColor: colors.pinkSoft,
  },
  previewMedia: {
    width: '100%',
    height: '100%',
  },
  videoPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.aubergine,
  },
  videoLabel: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.white,
  },
  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyLabel: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.pinkDark,
  },
  captionOverlay: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    left: spacing.lg,
    alignItems: 'center',
  },
  captionPreview: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: font.extrabold,
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  pickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  pickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
  },
  pickLabel: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.pinkDark,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text,
    marginTop: spacing.sm,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  noticeLabel: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: font.medium,
    color: colors.pinkDark,
  },
  error: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.danger,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});

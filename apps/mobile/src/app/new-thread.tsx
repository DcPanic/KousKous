import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { ImagePlus, Video, X } from 'lucide-react-native';
import {
  can,
  colors,
  findCategory,
  radii,
  shadows,
  spacing,
  subcategoriesFor,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import type { Attachment } from '@/data/forum';
import { pickMedia } from '@/lib/media';
import { useForums } from '@/state/forums';
import { useSession } from '@/state/session';
import { AttachmentGrid } from '@/components/attachments';
import { SimplePicker } from '@/components/simple-picker';
import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function NewThreadScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { publish: publishThread } = useForums();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = typeof categoryId === 'string' ? findCategory(categoryId) : undefined;

  if (!category || !can(user, 'forums_participate')) {
    return (
      <PlaceholderScreen
        title="Νέα συζήτηση"
        subtitle="Χωρίς πρόσβαση"
        body="Η δημιουργία συζήτησης είναι διαθέσιμη στα μέλη."
      />
    );
  }

  const attach = async (kind: 'image' | 'video') => {
    const picked = await pickMedia(kind);
    if (picked.length > 0) setAttachments((prev) => [...prev, ...picked]);
  };

  const canPublish = title.trim().length > 2 && body.trim().length > 0;

  const publish = async () => {
    if (!canPublish || publishing) return;

    setPublishing(true);
    setError(null);

    const id = await publishThread({
      categoryId: category.id,
      subcategoryId,
      title: title.trim(),
      body: body.trim(),
      location: user.location ?? null,
      attachments,
    });

    setPublishing(false);

    if (!id) {
      setError('Η συζήτηση δεν δημοσιεύτηκε. Δοκίμασε ξανά.');
      return;
    }

    // Replace, so the back gesture returns to the forum rather than to
    // the composer the user has just finished with.
    router.replace({ pathname: '/thread/[id]', params: { id } });
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
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Νέα συζήτηση</Text>
          <Text style={styles.headerMeta}>
            {category.emoji} {category.name}
          </Text>
        </View>
        <Pressable
          onPress={() => void publish()}
          disabled={!canPublish || publishing}
          style={[styles.publish, (!canPublish || publishing) && styles.publishDisabled]}
          accessibilityRole="button"
        >
          <Text style={styles.publishLabel}>{publishing ? 'Δημοσίευση...' : 'Δημοσίευση'}</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Τίτλος — τι θέλεις να ρωτήσεις;"
            placeholderTextColor={colors.textMuted}
            style={styles.titleInput}
            multiline
          />
          <View style={styles.divider} />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Γράψε περισσότερα. Όσο πιο συγκεκριμένη, τόσο καλύτερες απαντήσεις."
            placeholderTextColor={colors.textMuted}
            style={styles.bodyInput}
            multiline
          />

          {/* The community is already chosen by the route, so only the
              narrower choice is offered here. */}
          <SimplePicker
            label="Θέμα (προαιρετικό)"
            placeholder={`Διάλεξε θέμα στο ${category.name}`}
            options={subcategoriesFor(category.id)}
            value={subcategoryId}
            onChange={setSubcategoryId}
          />

          <AttachmentGrid
            attachments={attachments}
            onRemove={(id) => setAttachments((prev) => prev.filter((item) => item.id !== id))}
            height={160}
          />
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

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  error: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.danger,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    boxShadow: shadows.card,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  headerMeta: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
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
  titleInput: {
    fontSize: 17,
    fontFamily: font.extrabold,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  bodyInput: {
    fontSize: 13.5,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 21,
    minHeight: 140,
    textAlignVertical: 'top',
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

import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, SendHorizontal, X } from 'lucide-react-native';
import { can, colors, radii, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { useSession } from '@/state/session';
import { useStories } from '@/state/stories';
import { Avatar } from '@/components/avatar';
import { PlaceholderScreen } from '@/components/placeholder-screen';

/** How long a frame stays on screen before advancing. */
const FRAME_MS = 5000;

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { stories, find, markSeen } = useStories();

  const storyId = typeof id === 'string' ? id : '';
  const story = find(storyId);

  const [frameIndex, setFrameIndex] = useState(0);
  const [reply, setReply] = useState('');
  const [liked, setLiked] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const frameCount = story?.frames.length ?? 0;

  // Restart the bar on every frame and move to the next one when it fills.
  useEffect(() => {
    if (frameCount === 0) return;

    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: FRAME_MS,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (!finished) return;
      setFrameIndex((current) => Math.min(current + 1, frameCount));
    });

    return () => animation.stop();
  }, [frameIndex, frameCount, progress]);

  // Past the last frame means the story is over.
  useEffect(() => {
    if (frameCount > 0 && frameIndex >= frameCount) router.back();
  }, [frameIndex, frameCount, router]);

  const currentFrameId = story?.frames[Math.min(frameIndex, frameCount - 1)]?.id;

  useEffect(() => {
    if (currentFrameId) markSeen(currentFrameId);
  }, [currentFrameId, markSeen]);

  if (!story) {
    return (
      <PlaceholderScreen
        title="Η ιστορία δεν βρέθηκε"
        subtitle="Άγνωστη ιστορία"
        body="Ίσως έληξε — οι ιστορίες ζουν 24 ώρες."
      />
    );
  }

  const frame = story.frames[Math.min(frameIndex, frameCount - 1)];
  const canReply = can(user, 'chat');
  const mine = story.authorId === user.id;

  const goBack = () => {
    if (frameIndex > 0) {
      setFrameIndex(frameIndex - 1);
      return;
    }
    // Already at the start: step back to the previous woman's story.
    const position = stories.findIndex((item) => item.id === story.id);
    const previous = stories[position - 1];
    if (previous) {
      router.replace({ pathname: '/story/[id]', params: { id: previous.id } });
    } else {
      router.back();
    }
  };

  const goForward = () => {
    if (frameIndex < frameCount - 1) {
      setFrameIndex(frameIndex + 1);
      return;
    }
    const position = stories.findIndex((item) => item.id === story.id);
    const next = stories[position + 1];
    if (next) {
      router.replace({ pathname: '/story/[id]', params: { id: next.id } });
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: frame.tint }]}>
      {frame.uri && frame.kind === 'image' ? (
        <Image source={{ uri: frame.uri }} style={styles.media} contentFit="cover" />
      ) : null}
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Tap zones sit behind the chrome: left goes back, right forward. */}
        <View style={styles.tapZones}>
          <Pressable
            onPress={goBack}
            style={styles.tapZone}
            accessibilityRole="button"
            accessibilityLabel="Προηγούμενο"
          />
          <Pressable
            onPress={goForward}
            style={styles.tapZone}
            accessibilityRole="button"
            accessibilityLabel="Επόμενο"
          />
        </View>

        <View style={styles.bars}>
          {story.frames.map((item, index) => (
            <View key={item.id} style={styles.barTrack}>
              <Animated.View
                style={[
                  styles.barFill,
                  index < frameIndex && styles.barFilled,
                  index === frameIndex && {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <View style={styles.header}>
          <Avatar size={34} />
          <Text style={styles.name}>{story.name}</Text>
          <Text style={styles.time}>{story.timeAgo}</Text>
          {story.live ? (
            <View style={styles.liveBadge}>
              <Text style={styles.liveLabel}>LIVE</Text>
            </View>
          ) : null}
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={styles.close}
            accessibilityRole="button"
            accessibilityLabel="Κλείσιμο"
          >
            <X size={20} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.captionWrap}>
          <Text style={styles.caption}>{frame.caption}</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.footer}>
            {mine ? (
              <View style={styles.ownFooter}>
                <Text style={styles.ownLabel}>{story.timeAgo}</Text>
              </View>
            ) : canReply ? (
              <>
                <TextInput
                  value={reply}
                  onChangeText={setReply}
                  placeholder={`Απάντησε στη ${story.name}...`}
                  placeholderTextColor="rgba(255,255,255,0.75)"
                  style={styles.input}
                />
                <Pressable
                  onPress={() => setLiked((value) => !value)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={liked ? 'Δεν μου αρέσει πια' : 'Μου αρέσει'}
                  accessibilityState={{ selected: liked }}
                >
                  <Heart
                    size={22}
                    color={colors.white}
                    fill={liked ? colors.white : 'transparent'}
                  />
                </Pressable>
                <Pressable
                  onPress={() => setReply('')}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Αποστολή"
                >
                  <SendHorizontal size={21} color={colors.white} />
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={() => router.push('/membership')}
                style={styles.upgrade}
                accessibilityRole="button"
              >
                <Text style={styles.upgradeLabel}>Γίνε μέλος για να απαντήσεις</Text>
              </Pressable>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  media: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bars: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  barTrack: {
    flex: 1,
    height: 3,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.45)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    width: '0%',
    backgroundColor: colors.white,
  },
  barFilled: {
    width: '100%',
  },
  header: {
    position: 'absolute',
    top: spacing.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  name: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  time: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.white,
    opacity: 0.85,
  },
  liveBadge: {
    backgroundColor: colors.live,
    borderRadius: radii.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  liveLabel: {
    fontSize: 9,
    fontFamily: font.extrabold,
    letterSpacing: 0.5,
    color: colors.white,
  },
  close: {
    marginLeft: 'auto',
  },
  tapZones: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
  },
  tapZone: {
    flex: 1,
  },
  captionWrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    // Decorative: taps must reach the zones underneath.
    pointerEvents: 'none',
  },
  caption: {
    fontSize: 19,
    lineHeight: 27,
    fontFamily: font.extrabold,
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  input: {
    flex: 1,
    borderRadius: radii.pill,
    borderWidth: 1.4,
    borderColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.white,
  },
  ownFooter: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
  },
  ownLabel: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.white,
  },
  upgrade: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
  },
  upgradeLabel: {
    fontSize: 13,
    fontFamily: font.extrabold,
    color: colors.pinkDark,
  },
});

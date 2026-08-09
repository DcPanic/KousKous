import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Heart, Plus } from 'lucide-react-native';
import { colors, gradients, layout, radii, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { stories } from '@/data/mock';
import { DiagonalGradient } from './gradient';

const SIZE = layout.storyAvatar;

/** Horizontal stories rail. The first slot always belongs to the viewer. */
export function StoryRow() {
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Pressable
        onPress={() => router.push('/create')}
        style={styles.item}
        accessibilityRole="button"
        accessibilityLabel="Η ιστορία σας"
      >
        <View style={styles.ownStory}>
          <Heart size={20} color={colors.pink} fill={colors.pink} />
          <View style={styles.addBadge}>
            <Plus size={10} color={colors.white} strokeWidth={3} />
          </View>
        </View>
        <Text style={styles.name}>Η ιστορία σας</Text>
      </Pressable>

      {stories.map((story) => (
        <Pressable
          key={story.id}
          onPress={() => router.push({ pathname: '/story/[id]', params: { id: story.id } })}
          style={styles.item}
          accessibilityRole="button"
          accessibilityLabel={`Ιστορία: ${story.name}`}
        >
          <DiagonalGradient colors={gradients.avatar} style={styles.ring}>
            <View style={styles.ringInner} />
            {story.live ? (
              <View style={styles.liveBadge}>
                <Text style={styles.liveLabel}>LIVE</Text>
              </View>
            ) : null}
          </DiagonalGradient>
          <Text style={styles.name}>{story.name}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 13,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  item: {
    alignItems: 'center',
    gap: 5,
  },
  ownStory: {
    width: SIZE,
    height: SIZE,
    borderRadius: radii.full,
    backgroundColor: colors.pinkTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: radii.full,
    backgroundColor: colors.pink,
    borderWidth: 2,
    borderColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: radii.full,
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: '100%',
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: '#E3AFC0',
    borderWidth: 2.5,
    borderColor: colors.cream,
  },
  liveBadge: {
    position: 'absolute',
    bottom: -3,
    backgroundColor: colors.pink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  liveLabel: {
    color: colors.white,
    fontSize: 7.5,
    fontFamily: font.extrabold,
  },
  name: {
    fontSize: 10,
    fontFamily: font.semibold,
    color: colors.textBody,
  },
});

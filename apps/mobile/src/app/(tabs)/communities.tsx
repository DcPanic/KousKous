import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { accessFor, colors, findCategory, layout, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { forums } from '@/data/mock';
import { useAppState } from '@/state/app-state';
import { useSession } from '@/state/session';
import { LockedOverlay } from '@/components/locked-overlay';
import { SectionEyebrow } from '@/components/section-eyebrow';

export default function CommunitiesScreen() {
  const { user } = useSession();
  const { isFollowing, toggleFollow } = useAppState();
  const router = useRouter();
  const access = accessFor(user, 'forums_view');
  const locked = access === 'preview';

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        // Free members see the grid only as a teaser behind the paywall.
        scrollEnabled={!locked}
      >
        <SectionEyebrow>Κοινότητες</SectionEyebrow>
        <View style={styles.grid}>
          {forums.map((forum) => {
            const category = findCategory(forum.categoryId);
            if (!category) return null;
            const following = isFollowing(category.id);

            return (
              <Pressable
                key={category.id}
                style={styles.card}
                // Free members see the grid only as a teaser, so the card
                // must not open the forum for them.
                disabled={locked}
                onPress={() =>
                  router.push({ pathname: '/community/[id]', params: { id: category.id } })
                }
                accessibilityRole="button"
                accessibilityLabel={`Κοινότητα ${category.name}`}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.emoji}>{category.emoji}</Text>
                  <Pressable
                    onPress={() => !locked && toggleFollow(category.id)}
                    style={[styles.followPill, following && styles.followPillActive]}
                    accessibilityRole="button"
                    accessibilityLabel={`${following ? 'Κατάργηση' : 'Ακολούθησε'} ${category.name}`}
                  >
                    <Text style={[styles.followLabel, following && styles.followLabelActive]}>
                      {following ? '✓' : '+'}
                    </Text>
                  </Pressable>
                </View>
                <Text style={styles.name}>{category.name}</Text>
                <Text style={styles.posts}>{forum.posts}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {locked ? (
        <LockedOverlay
          title="Οι κοινότητες είναι για μέλη"
          subtitle="Απόκτησε πρόσβαση σε συζητήσεις & θεματικά forums."
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    paddingBottom: layout.tabBarHeight,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
  },
  card: {
    // Two columns, accounting for the gap between them.
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md + 2,
    boxShadow: shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  followPill: {
    minWidth: 26,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1.3,
    borderColor: colors.borderPill,
    backgroundColor: colors.surface,
  },
  followPillActive: {
    borderColor: 'transparent',
    backgroundColor: colors.pinkSoft,
  },
  followLabel: {
    fontSize: 9.5,
    fontFamily: font.extrabold,
    color: colors.textMuted,
  },
  followLabelActive: {
    color: colors.pinkDark,
  },
  name: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  posts: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
});

import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, layout, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { posts } from '@/data/mock';
import { useAppState } from '@/state/app-state';
import { FeedTabs, type FeedTab } from '@/components/feed-tabs';
import { PostCard } from '@/components/post-card';
import { PromoBanners } from '@/components/promo-banners';
import { StoryRow } from '@/components/story-row';

export default function FeedScreen() {
  const [tab, setTab] = useState<FeedTab>('foryou');
  const { selectedLocations } = useAppState();

  const visiblePosts = useMemo(() => {
    if (selectedLocations.length === 0) return posts;
    return posts.filter((post) => selectedLocations.includes(post.location));
  }, [selectedLocations]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <StoryRow />
      <FeedTabs value={tab} onChange={setTab} />

      {visiblePosts.length > 0 ? (
        visiblePosts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Δεν βρέθηκαν δημοσιεύσεις</Text>
          <Text style={styles.emptyBody}>
            Δοκίμασε να αλλάξεις ή να καθαρίσεις το φίλτρο τοποθεσίας.
          </Text>
        </View>
      )}

      <PromoBanners />
    </ScrollView>
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
  empty: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14.5,
    fontFamily: font.extrabold,
    color: colors.text,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

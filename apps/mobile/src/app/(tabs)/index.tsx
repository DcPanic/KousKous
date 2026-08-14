import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { colors, layout, matchesPlaces, radii, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';

import { useAppState } from '@/state/app-state';
import { useFeed } from '@/state/feed';
import { FilterBar } from '@/components/filter-bar';
import { FeedTabs, type FeedTab } from '@/components/feed-tabs';
import { PostCard } from '@/components/post-card';
import { PromoBanners } from '@/components/promo-banners';
import { StoryRow } from '@/components/story-row';

export default function FeedScreen() {
  const [tab, setTab] = useState<FeedTab>('foryou');
  const { selectedPlaces, followedCategories, blockedNames } = useAppState();
  const { posts, loading, error, refresh, loadMore } = useFeed();

  const visiblePosts = useMemo(() => {
    // Blocking a woman means not seeing her, so it runs before anything
    // else and applies on every tab.
    const inPlace = posts.filter(
      (post) =>
        !blockedNames.includes(post.author) && matchesPlaces(post.location, selectedPlaces),
    );

    // "Ακολουθείτε" narrows to the communities she follows; "Trending"
    // reorders by reactions rather than filtering, so nothing disappears.
    if (tab === 'following') {
      return inPlace.filter(
        (post) => post.categoryId !== null && followedCategories.includes(post.categoryId),
      );
    }
    if (tab === 'trending') {
      return [...inPlace].sort((a, b) => b.likes - a.likes);
    }
    return inPlace;
  }, [blockedNames, posts, followedCategories, selectedPlaces, tab]);

  // A FlatList only builds the rows on screen. The previous ScrollView
  // laid out every post at once, which is what made a long feed slow to
  // open on a phone.
  const header = (
    <>
      <FilterBar surface="feed" resultCount={visiblePosts.length} />
      <StoryRow />
      <FeedTabs value={tab} onChange={setTab} />

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorLabel}>Δεν φόρτωσαν οι δημοσιεύσεις.</Text>
          <Pressable onPress={() => void refresh()} accessibilityRole="button">
            <Text style={styles.retryLabel}>Δοκίμασε ξανά</Text>
          </Pressable>
        </View>
      ) : null}
    </>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={visiblePosts}
      keyExtractor={(post) => post.id}
      renderItem={({ item }) => <PostCard post={item} />}
      ListHeaderComponent={header}
      ListFooterComponent={<PromoBanners />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {tab === 'following'
              ? 'Καμία δημοσίευση από τις κοινότητές σου'
              : 'Δεν βρέθηκαν δημοσιεύσεις'}
          </Text>
          <Text style={styles.emptyBody}>
            {tab === 'following'
              ? 'Ακολούθησε κοινότητες από το μενού για να γεμίσει αυτή η καρτέλα.'
              : 'Δοκίμασε να αλλάξεις ή να καθαρίσεις το φίλτρο τοποθεσίας.'}
          </Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => void refresh()}
          tintColor={colors.pink}
        />
      }
      // Keep a small window around the viewport: a card carries photos,
      // so holding many of them alive costs memory for nothing.
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={7}
      removeClippedSubviews
      onEndReachedThreshold={0.6}
      onEndReached={() => void loadMore()}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    // The rows carry their own hairlines, so the list sits on white
    // rather than on cream with floating cards.
    backgroundColor: colors.surface,
  },
  content: {
    paddingBottom: layout.tabBarHeight,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.lg,
    marginHorizontal: spacing.screen,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  errorLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: font.medium,
    color: colors.pinkDark,
  },
  retryLabel: {
    fontSize: 12,
    fontFamily: font.extrabold,
    color: colors.pink,
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

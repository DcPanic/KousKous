import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Crown, MapPin } from 'lucide-react-native';
import {
  colors,
  findLocation,
  gradients,
  layout,
  PAID_MEMBER_PRICE_EUR,
  radii,
  spacing,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { profileGridColors, profileStats } from '@/data/mock';
import { useSession } from '@/state/session';
import { Avatar } from '@/components/avatar';

const GRID_COLUMNS = 3;
const GRID_GAP = 2;

export default function ProfileScreen() {
  const { user, tier } = useSession();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const tileSize = (width - GRID_GAP * (GRID_COLUMNS + 1)) / GRID_COLUMNS;
  const cityName = user.location ? findLocation(user.location)?.name : null;
  const isOfficial = tier === 'official';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Avatar
          size={isOfficial ? 82 : 74}
          initial={isOfficial ? 'K' : undefined}
          ringColor={isOfficial ? colors.gold : undefined}
          gradient={isOfficial ? gradients.officialCover : undefined}
        />
        <View style={styles.stats}>
          {profileStats.map(([value, label]) => (
            <View key={label} style={styles.stat}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.identity}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name}</Text>
          {isOfficial ? (
            <View style={styles.officialBadge}>
              <Crown size={9} color={colors.white} fill={colors.white} />
            </View>
          ) : null}
        </View>

        {isOfficial ? <Text style={styles.officialLabel}>Official Account</Text> : null}

        {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

        {cityName ? (
          <View style={styles.locationRow}>
            <MapPin size={12} color={colors.textMuted} />
            <Text style={styles.location}>{cityName}</Text>
          </View>
        ) : null}

        {tier === 'free' ? (
          <Pressable
            style={styles.upgrade}
            onPress={() => router.push('/membership')}
            accessibilityRole="button"
          >
            <Text style={styles.upgradeLabel}>
              Αναβάθμιση σε Μέλος · €{PAID_MEMBER_PRICE_EUR.toFixed(2).replace('.', ',')}
            </Text>
          </Pressable>
        ) : null}

        {tier === 'host' ? (
          <Pressable style={styles.hostCta} onPress={() => router.push('/host')} accessibilityRole="button">
            <Text style={styles.upgradeLabel}>Dashboard Διοργανώτριας</Text>
          </Pressable>
        ) : null}

        {isOfficial ? (
          <Pressable style={styles.officialCta} onPress={() => router.push('/official')} accessibilityRole="button">
            <Crown size={16} color={colors.gold} />
            <Text style={styles.upgradeLabel}>Άνοιγμα Official Dashboard</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.tabs}>
        {['Grid', 'Tagged'].map((label, index) => (
          <View key={label} style={[styles.tab, index === 0 && styles.tabActive]}>
            <Text style={[styles.tabLabel, index === 0 && styles.tabLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {profileGridColors.map((color, index) => (
          <View
            key={`${color}-${index}`}
            style={{ width: tileSize, height: tileSize, backgroundColor: color }}
          />
        ))}
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.screen,
    paddingBottom: spacing.md + 2,
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  identity: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  officialBadge: {
    width: 16,
    height: 16,
    borderRadius: radii.full,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officialLabel: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.hostPurple,
    marginTop: 3,
  },
  bio: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  location: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  upgrade: {
    marginTop: spacing.md,
    backgroundColor: colors.pink,
    borderRadius: radii.md,
    paddingVertical: 11,
    alignItems: 'center',
  },
  hostCta: {
    marginTop: spacing.md,
    backgroundColor: colors.hostPurple,
    borderRadius: radii.md,
    paddingVertical: 11,
    alignItems: 'center',
  },
  officialCta: {
    marginTop: spacing.md,
    backgroundColor: colors.aubergine,
    borderRadius: radii.lg,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  upgradeLabel: {
    fontSize: 13,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.pink,
  },
  tabLabel: {
    fontSize: 12.5,
    fontFamily: font.extrabold,
    color: colors.textFaint,
  },
  tabLabelActive: {
    color: colors.pink,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    padding: GRID_GAP,
  },
});

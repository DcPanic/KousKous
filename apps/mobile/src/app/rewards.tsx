import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Gift, Lock, Sparkles, Trophy } from 'lucide-react-native';
import {
  can,
  colors,
  gradients,
  paidMemberCta,
  radii,
  shadows,
  spacing,
  toGreekUpperCase,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { levelFor, rewardsLevels } from '@/data/rewards';
import {
  enterReward,
  fetchMyEntries,
  fetchPointsHistory,
  fetchRewards,
  type PointsEntry,
  type Reward,
} from '@/lib/rewards-repo';
import { fetchMyPoints } from '@/lib/points';
import { useSession } from '@/state/session';
import { DiagonalGradient } from '@/components/gradient';

/** Card tints, cycled so a list of giveaways is not one flat colour. */
const TINTS = ['#F5E6BE', '#FBE1E9', '#EADFF0', '#DCEAF5', '#E4F0E8', '#F0E4D8'];

export default function RewardsScreen() {
  const router = useRouter();
  const { user, signedIn } = useSession();
  const allowed = can(user, 'rewards');

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [entered, setEntered] = useState<string[]>([]);
  const [history, setHistory] = useState<PointsEntry[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!signedIn || !allowed) return;

    setLoading(true);

    try {
      const [list, mine, balance, log] = await Promise.all([
        fetchRewards(),
        fetchMyEntries(user.id),
        fetchMyPoints(user.id),
        fetchPointsHistory(user.id),
      ]);

      setRewards(list);
      setEntered(mine);
      setPoints(balance);
      setHistory(log);
    } catch {
      // Keep whatever is on screen.
    } finally {
      setLoading(false);
    }
  }, [signedIn, allowed, user.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const { current, next } = levelFor(points);
  const span = next ? next.threshold - current.threshold : 1;
  const progress = next ? Math.min(1, (points - current.threshold) / span) : 1;

  const statusOf = (reward: Reward) => {
    if (entered.includes(reward.id)) return 'entered' as const;
    if (reward.cost > points) return 'locked' as const;
    return 'available' as const;
  };

  const enter = async (reward: Reward) => {
    setError(null);

    try {
      await enterReward(reward.id, user.id);
      await load();
    } catch {
      // The trigger refuses an entry she cannot afford, so this is the
      // honest message rather than a generic failure.
      setError('Η συμμετοχή δεν καταχωρήθηκε. Ίσως δεν έχεις αρκετούς πόντους.');
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Πίσω"
        >
          <ArrowLeft size={17} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Rewards Club</Text>
      </View>

      {allowed ? (
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={() => void load()} tintColor={colors.pink} />
          }
        >
          <DiagonalGradient colors={gradients.officialCover} style={styles.pointsCard}>
            <View style={styles.pointsTop}>
              <Trophy size={18} color={colors.white} />
              <Text style={styles.levelName}>{current.name}</Text>
            </View>
            <Text style={styles.pointsValue}>{points}</Text>
            <Text style={styles.pointsLabel}>πόντοι</Text>

            <View style={styles.track}>
              <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.nextLabel}>
              {next
                ? `${next.threshold - points} πόντοι ακόμα για ${next.name}`
                : 'Έφτασες στο ανώτερο επίπεδο ✨'}
            </Text>
          </DiagonalGradient>

          <Text style={styles.sectionTitle}>{toGreekUpperCase('Επίπεδα')}</Text>
          {rewardsLevels.map((level) => {
            const reached = points >= level.threshold;
            return (
              <View key={level.id} style={styles.levelRow}>
                <View style={[styles.levelDot, reached && styles.levelDotReached]}>
                  {reached ? <Check size={12} color={colors.white} /> : null}
                </View>
                <View style={styles.levelText}>
                  <Text style={styles.levelTitle}>
                    {level.name} · {level.threshold} πόντοι
                  </Text>
                  <Text style={styles.levelPerk}>{level.perk}</Text>
                </View>
              </View>
            );
          })}

          <Text style={styles.sectionTitle}>{toGreekUpperCase('Δώρα & Προσφορές')}</Text>
          {rewards.map((reward, index) => {
            const status = statusOf(reward);
            return (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={[styles.rewardArt, { backgroundColor: TINTS[index % TINTS.length] }]}>
                  <Gift size={20} color={colors.aubergine} />
                </View>
                <View style={styles.rewardText}>
                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  <Text style={styles.rewardPartner}>{reward.partner}</Text>
                  <Text style={styles.rewardEnds}>
                    {[reward.ends, reward.entryCount > 0 ? `${reward.entryCount} συμμετοχές` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <View style={styles.rewardAction}>
                  <Text style={styles.rewardCost}>
                    {reward.cost === 0 ? 'Δωρεάν' : `${reward.cost} π.`}
                  </Text>
                  {status === 'entered' ? (
                    <View style={[styles.enterButton, styles.enterButtonDone]}>
                      <Check size={13} color={colors.white} />
                      <Text style={styles.enterLabel}>Δηλώθηκε</Text>
                    </View>
                  ) : status === 'locked' ? (
                    <View style={[styles.enterButton, styles.enterButtonLocked]}>
                      <Lock size={12} color={colors.textMuted} />
                      <Text style={styles.enterLabelLocked}>Κλειδωμένο</Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => void enter(reward)}
                      style={styles.enterButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Δήλωσε συμμετοχή: ${reward.title}`}
                    >
                      <Text style={styles.enterLabel}>Συμμετοχή</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}

          {rewards.length === 0 && !loading ? (
            <Text style={styles.empty}>
              Κανένα δώρο αυτή τη στιγμή. Θα σε ειδοποιήσουμε μόλις ανοίξει το επόμενο.
            </Text>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.sectionTitle}>{toGreekUpperCase('Πώς κέρδισες πόντους')}</Text>
          {history.map((entry) => (
            <View key={entry.id} style={styles.historyRow}>
              <View style={styles.historyText}>
                <Text style={styles.historyLabel}>{entry.label}</Text>
                <Text style={styles.historyTime}>{entry.timeAgo}</Text>
              </View>
              <Text style={[styles.historyPoints, entry.points < 0 && styles.historySpent]}>
                {entry.points > 0 ? `+${entry.points}` : entry.points}
              </Text>
            </View>
          ))}

          {history.length === 0 && !loading ? (
            <Text style={styles.empty}>
              Δεν έχεις πόντους ακόμα. Κέρδισε γράφοντας, απαντώντας και ερχόμενη σε events.
            </Text>
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.locked}>
          <View style={styles.lockedIcon}>
            <Sparkles size={22} color={colors.gold} />
          </View>
          <Text style={styles.lockedTitle}>Το Rewards Club είναι για μέλη</Text>
          <Text style={styles.lockedBody}>
            Μάζεψε πόντους από κάθε συμμετοχή και κέρδισε δώρα και προσφορές από τις συνεργάτιδες
            επιχειρήσεις μας.
          </Text>
          <Pressable
            onPress={() => router.push('/membership')}
            style={styles.cta}
            accessibilityRole="button"
          >
            <Text style={styles.ctaLabel}>{paidMemberCta}</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  empty: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  error: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.danger,
    lineHeight: 17,
    marginTop: spacing.sm,
  },
  historySpent: {
    color: colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  back: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.card,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  pointsCard: {
    borderRadius: radii.card,
    padding: spacing.lg,
  },
  pointsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  levelName: {
    fontSize: 12.5,
    fontFamily: font.extrabold,
    letterSpacing: 0.6,
    color: colors.white,
  },
  pointsValue: {
    fontSize: 38,
    lineHeight: 46,
    fontFamily: font.extrabold,
    color: colors.white,
    marginTop: spacing.sm,
  },
  pointsLabel: {
    fontSize: 12,
    fontFamily: font.medium,
    color: colors.white,
    opacity: 0.85,
  },
  track: {
    height: 7,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.28)',
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: colors.white,
  },
  nextLabel: {
    fontSize: 11.5,
    fontFamily: font.medium,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  levelDot: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelDotReached: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  levelText: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  levelPerk: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  rewardArt: {
    width: 46,
    height: 46,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardText: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  rewardPartner: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 1,
  },
  rewardEnds: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textFaint,
    marginTop: 1,
  },
  rewardAction: {
    alignItems: 'flex-end',
    gap: 5,
  },
  rewardCost: {
    fontSize: 11,
    fontFamily: font.extrabold,
    color: colors.gold,
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.pink,
    borderRadius: radii.full,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
  },
  enterButtonDone: {
    backgroundColor: colors.success,
  },
  enterButtonLocked: {
    backgroundColor: colors.cream,
  },
  enterLabel: {
    fontSize: 11,
    fontFamily: font.bold,
    color: colors.white,
  },
  enterLabelLocked: {
    fontSize: 11,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyText: {
    flex: 1,
  },
  historyLabel: {
    fontSize: 12.5,
    fontFamily: font.medium,
    color: colors.textBody,
  },
  historyTime: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 1,
  },
  historyPoints: {
    fontSize: 13,
    fontFamily: font.extrabold,
    color: colors.success,
  },
  locked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  lockedIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedTitle: {
    fontSize: 16.5,
    fontFamily: font.extrabold,
    color: colors.text,
    textAlign: 'center',
  },
  lockedBody: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  cta: {
    marginTop: spacing.sm,
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: 26,
  },
  ctaLabel: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
});

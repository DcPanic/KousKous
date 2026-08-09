import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Calendar, ChevronRight, Gift, Users, type LucideIcon } from 'lucide-react-native';
import { colors, radii, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';

interface Banner {
  icon: LucideIcon;
  label: string;
  background: string;
  tint: string;
  href: Href;
}

const BANNERS: Banner[] = [
  {
    icon: Calendar,
    label: 'Εξερευνήστε Events',
    background: colors.pinkSoft,
    tint: colors.pink,
    href: '/events',
  },
  {
    icon: Gift,
    label: 'Δώρα & Προσφορές',
    background: colors.hostPurpleSoft,
    tint: colors.hostPurple,
    href: '/rewards',
  },
  {
    // Finding people happens through the communities, so that is where
    // this leads until a dedicated discovery screen exists.
    icon: Users,
    label: 'Βρες νέες φίλες',
    background: colors.goldSoft,
    tint: colors.gold,
    href: '/communities',
  },
];

export function PromoBanners() {
  const router = useRouter();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {BANNERS.map(({ icon: Icon, label, background, tint, href }) => (
        <Pressable
          key={label}
          onPress={() => router.push(href)}
          style={[styles.banner, { backgroundColor: background }]}
          accessibilityRole="button"
        >
          <Icon size={18} color={tint} strokeWidth={2} />
          <Text style={styles.label}>{label}</Text>
          <View style={styles.chevron}>
            <ChevronRight size={15} color={tint} />
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.lg,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.xl,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    minWidth: 168,
  },
  label: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.text,
  },
  chevron: {
    marginLeft: 'auto',
  },
});

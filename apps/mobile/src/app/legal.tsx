import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';

type LegalTab = 'terms' | 'privacy';

interface Section {
  title: string;
  body: string;
}

/**
 * Plain-language summaries, not the binding text.
 *
 * The final wording has to come from a lawyer before launch; what is here
 * describes honestly how the app actually behaves today.
 */
const TERMS: Section[] = [
  {
    title: 'Ποιες μπορούν να γίνουν μέλη',
    body: 'Το KousKous είναι κοινότητα αποκλειστικά για γυναίκες άνω των 18 ετών σε Ελλάδα και Κύπρο. Δηλώνοντας λογαριασμό επιβεβαιώνεις ότι πληροίς αυτές τις προϋποθέσεις.',
  },
  {
    title: 'Πώς συμπεριφερόμαστε',
    body: 'Δεν επιτρέπεται παρενόχληση, ρητορική μίσους, απάτη ή δημοσίευση περιεχομένου άλλων χωρίς άδεια. Λογαριασμοί που παραβιάζουν τους κανόνες αναστέλλονται.',
  },
  {
    title: 'Συνδρομές',
    body: 'Η συνδρομή μέλους χρεώνεται μηνιαίως και ανανεώνεται αυτόματα μέχρι να την ακυρώσεις. Η ακύρωση ισχύει από την επόμενη περίοδο χρέωσης.',
  },
  {
    title: 'Events και πληρωμές',
    body: 'Τα events διοργανώνονται από τις ίδιες τις χρήστριες. Οι πληρωμές των εισιτηρίων γίνονται απευθείας στη διοργανώτρια μέσω του δικού της λογαριασμού Stripe. Το KousKous δεν κρατάει ποτέ τα χρήματα ενός event και δεν ευθύνεται για τη διεξαγωγή του.',
  },
  {
    title: 'Το περιεχόμενό σου',
    body: 'Ό,τι ανεβάζεις παραμένει δικό σου. Μας δίνεις άδεια να το εμφανίζουμε μέσα στην εφαρμογή, ώστε να το βλέπουν τα άλλα μέλη.',
  },
];

const PRIVACY: Section[] = [
  {
    title: 'Τι στοιχεία κρατάμε',
    body: 'Όνομα, email, περιοχή, φωτογραφία προφίλ και ό,τι δημοσιεύεις. Τίποτα περισσότερο από όσα χρειάζεται η εφαρμογή για να λειτουργεί.',
  },
  {
    title: 'Στοιχεία κάρτας',
    body: 'Δεν αποθηκεύουμε ποτέ αριθμούς καρτών. Οι πληρωμές γίνονται εξ ολοκλήρου μέσα στο Stripe.',
  },
  {
    title: 'Με ποιους τα μοιραζόμαστε',
    body: 'Με κανέναν για διαφημιστικούς σκοπούς. Μόνο με τους παρόχους που χρειάζονται για να δουλέψει η εφαρμογή (φιλοξενία δεδομένων, πληρωμές, ειδοποιήσεις).',
  },
  {
    title: 'Η τοποθεσία σου',
    body: 'Δηλώνεις εσύ την περιοχή σου — δεν παρακολουθούμε το GPS σου. Μπορείς να την κρύψεις από το προφίλ σου στις Ρυθμίσεις.',
  },
  {
    title: 'Τα δικαιώματά σου',
    body: 'Μπορείς να ζητήσεις αντίγραφο ή διαγραφή των δεδομένων σου όποτε θες. Η διαγραφή του λογαριασμού σβήνει το προφίλ και τις δημοσιεύσεις σου.',
  },
];

export default function LegalScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<LegalTab>('terms');

  const sections = tab === 'terms' ? TERMS : PRIVACY;

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
        <Text style={styles.headerTitle}>Όροι & απόρρητο</Text>
      </View>

      <View style={styles.tabs}>
        {([['terms', 'Όροι χρήσης'], ['privacy', 'Απόρρητο']] as [LegalTab, string][]).map(
          ([key, label]) => {
            const active = key === tab;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                style={[styles.tab, active && styles.tabActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
              </Pressable>
            );
          },
        )}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.title}>{section.title}</Text>
            <Text style={styles.text}>{section.body}</Text>
          </View>
        ))}

        <Text style={styles.footnote}>
          Αυτή είναι μια περίληψη σε απλά ελληνικά. Το τελικό νομικό κείμενο θα αναρτηθεί πριν την
          κυκλοφορία της εφαρμογής.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
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
  tabs: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
    paddingVertical: 8,
  },
  tabActive: {
    borderColor: colors.pink,
    backgroundColor: colors.pinkSoft,
  },
  tabLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.pinkDark,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  title: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
    marginBottom: 4,
  },
  text: {
    fontSize: 12,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 19,
  },
  footnote: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textFaint,
    lineHeight: 16,
    marginTop: spacing.lg,
  },
});

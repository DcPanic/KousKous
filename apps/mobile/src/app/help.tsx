import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, AtSign, ChevronDown, ChevronRight, Mail, ShieldAlert } from 'lucide-react-native';
import { colors, radii, shadows, spacing, toGreekUpperCase } from '@kouskous/shared';
import { font } from '@/theme/typography';

const FAQ: { question: string; answer: string }[] = [
  {
    question: 'Τι περιλαμβάνει η συνδρομή μέλους;',
    answer:
      'Συμμετοχή σε όλα τα forums, συμμετοχή στα events που διοργανώνει το KousKous, και πρόσβαση στους διαγωνισμούς και τα δώρα του Rewards Club. Τα μηνύματα και τα events των διοργανωτριών είναι ανοιχτά σε όλες.',
  },
  {
    question: 'Χρειάζομαι συνδρομή για να πάω σε ένα event;',
    answer:
      'Όχι για τα events των διοργανωτριών — αυτά είναι ανοιχτά σε όλες, ακόμα και με δωρεάν λογαριασμό. Συνδρομή χρειάζεσαι μόνο για τα events που διοργανώνει το ίδιο το KousKous.',
  },
  {
    question: 'Μπορώ να ακυρώσω τη συνδρομή μου;',
    answer:
      'Ναι, όποτε θες, από τις Ρυθμίσεις. Η πρόσβαση συνεχίζεται μέχρι το τέλος του μήνα που έχεις ήδη πληρώσει.',
  },
  {
    question: 'Ποιος βλέπει το προφίλ μου;',
    answer:
      'Μόνο εγγεγραμμένες χρήστριες του KousKous. Από τις Ρυθμίσεις μπορείς να κρύψεις την περιοχή σου και να μη σε βρίσκουν στην αναζήτηση.',
  },
  {
    question: 'Πώς αναφέρω κάποια ή κάποιο περιεχόμενο;',
    answer:
      'Πάτα τις τρεις τελείες πάνω δεξιά σε μια δημοσίευση και διάλεξε «Αναφορά». Κάθε αναφορά ελέγχεται από την ομάδα μας.',
  },
  {
    question: 'Πώς πληρώνομαι αν διοργανώνω events;',
    answer:
      'Ως Premium Host συνδέεις τον τραπεζικό σου λογαριασμό μέσω Stripe. Τα χρήματα των εισιτηρίων πάνε απευθείας σε εσένα — το KousKous δεν κρατάει προμήθεια και δεν διαχειρίζεται τα χρήματα του event.',
  },
  {
    question: 'Ξέχασα τον κωδικό μου.',
    answer:
      'Στην οθόνη σύνδεσης πάτα «Ξέχασα τον κωδικό μου» και θα λάβεις email με σύνδεσμο επαναφοράς.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);

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
        <Text style={styles.headerTitle}>Βοήθεια</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{toGreekUpperCase('Συχνές ερωτήσεις')}</Text>
        {FAQ.map(({ question, answer }) => {
          const expanded = open === question;
          return (
            <Pressable
              key={question}
              onPress={() => setOpen(expanded ? null : question)}
              style={styles.card}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
            >
              <View style={styles.questionRow}>
                <Text style={styles.question}>{question}</Text>
                {expanded ? (
                  <ChevronDown size={16} color={colors.textMuted} />
                ) : (
                  <ChevronRight size={16} color={colors.textMuted} />
                )}
              </View>
              {expanded ? <Text style={styles.answer}>{answer}</Text> : null}
            </Pressable>
          );
        })}

        <Text style={styles.sectionTitle}>{toGreekUpperCase('Επικοινωνία')}</Text>
        <ContactRow icon={Mail} label="support@kouskous.app" meta="Απαντάμε εντός 24 ωρών" />
        <ContactRow icon={AtSign} label="@kouskous.app" meta="Instagram" />

        <View style={styles.safety}>
          <ShieldAlert size={16} color={colors.pinkDark} />
          <Text style={styles.safetyLabel}>
            Αν κινδυνεύεις ή αισθάνεσαι ανασφάλεια, κάλεσε το 100 ή τη γραμμή SOS 15900. Το
            KousKous δεν αντικαθιστά τις υπηρεσίες έκτακτης ανάγκης.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactRow({
  icon: Icon,
  label,
  meta,
}: {
  icon: typeof Mail;
  label: string;
  meta: string;
}) {
  return (
    <View style={styles.contact}>
      <View style={styles.contactIcon}>
        <Icon size={17} color={colors.pink} />
      </View>
      <View style={styles.contactText}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactMeta}>{meta}</Text>
      </View>
    </View>
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
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    marginBottom: 6,
    boxShadow: shadows.card,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  question: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  answer: {
    fontSize: 12,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    marginBottom: 6,
    boxShadow: shadows.card,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  contactMeta: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  safety: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  safetyLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.pinkDark,
    lineHeight: 17,
  },
});

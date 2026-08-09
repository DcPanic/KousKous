import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff, Info } from 'lucide-react-native';
import { colors, fontSizes, radii, spacing, toGreekUpperCase } from '@kouskous/shared';
import { font } from '@/theme/typography';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    // Signing in needs Supabase auth; until then this only opens the app.
    router.replace('/');
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
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.logo}>KousKous</Text>
          <Text style={styles.welcome}>Καλώς ήρθες πίσω</Text>

          <Text style={styles.label}>{toGreekUpperCase('Email')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="to@email.sou"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>{toGreekUpperCase('Κωδικός')}</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Ο κωδικός σου"
              placeholderTextColor={colors.textMuted}
              style={styles.inputFlex}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setPasswordVisible((visible) => !visible)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={passwordVisible ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
            >
              {passwordVisible ? (
                <EyeOff size={17} color={colors.textMuted} />
              ) : (
                <Eye size={17} color={colors.textMuted} />
              )}
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/help')}
            style={styles.forgot}
            accessibilityRole="button"
          >
            <Text style={styles.forgotLabel}>Ξέχασα τον κωδικό μου</Text>
          </Pressable>

          <View style={styles.notice}>
            <Info size={15} color={colors.pinkDark} />
            <Text style={styles.noticeLabel}>
              Η σύνδεση δεν ελέγχεται ακόμα — η βάση (Supabase) δεν έχει συνδεθεί. Μέχρι τότε το
              κουμπί σε βάζει στην εφαρμογή για να τη δεις.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            style={[styles.submit, !canSubmit && styles.submitDisabled]}
            accessibilityRole="button"
          >
            <Text style={styles.submitLabel}>Σύνδεση</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace('/signup')}
            style={styles.altAction}
            accessibilityRole="button"
          >
            <Text style={styles.altLabel}>Δεν έχω λογαριασμό</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
  },
  header: {
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
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  logo: {
    fontFamily: font.logo,
    fontSize: fontSizes.logo * 1.6,
    lineHeight: fontSizes.logo * 2.2,
    color: colors.pink,
    textAlign: 'center',
  },
  welcome: {
    fontSize: 14,
    fontFamily: font.medium,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text,
  },
  forgot: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.md,
  },
  forgotLabel: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.pink,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noticeLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.pinkDark,
    lineHeight: 16,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  submit: {
    alignItems: 'center',
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 3,
  },
  submitDisabled: {
    backgroundColor: colors.textInactive,
  },
  submitLabel: {
    fontSize: 14,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  altAction: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  altLabel: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.pink,
  },
});

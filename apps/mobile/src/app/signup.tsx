import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Eye, EyeOff, Info, Search } from 'lucide-react-native';
import {
  colors,
  findPlace,
  radii,
  searchPlaces,
  spacing,
  toGreekUpperCase,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { greekAuthError } from '@/lib/auth-errors';
import { supabase } from '@/lib/supabase';

const MIN_PASSWORD = 8;

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [womenOnly, setWomenOnly] = useState(false);
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const suggestions = useMemo(() => {
    if (placeQuery.trim().length < 2) return [];
    return searchPlaces(placeQuery).slice(0, 6);
  }, [placeQuery]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.length >= MIN_PASSWORD;
  const canSubmit =
    name.trim().length > 1 && emailValid && passwordValid && placeId !== null && womenOnly && terms;


  const submit = async () => {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setFormError(null);

    // The name and place ride along as metadata; the database trigger
    // turns them into the profile row.
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim(), location: placeId } },
    });

    setSubmitting(false);

    if (error) {
      setFormError(greekAuthError(error.message));
      return;
    }

    // With email confirmation on, Supabase returns a user but no session.
    if (!data.session) {
      setNeedsConfirmation(true);
      return;
    }

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
        <Text style={styles.headerTitle}>Δημιουργία λογαριασμού</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>{toGreekUpperCase('Το όνομά σου')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="π.χ. Δανάη Π."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCapitalize="words"
          />

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
          {email.length > 0 && !emailValid ? (
            <Text style={styles.error}>Έλεγξε το email σου.</Text>
          ) : null}

          <Text style={styles.label}>{toGreekUpperCase('Κωδικός')}</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={`Τουλάχιστον ${MIN_PASSWORD} χαρακτήρες`}
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
          {password.length > 0 && !passwordValid ? (
            <Text style={styles.error}>
              Ο κωδικός θέλει τουλάχιστον {MIN_PASSWORD} χαρακτήρες.
            </Text>
          ) : null}

          <Text style={styles.label}>{toGreekUpperCase('Η περιοχή σου')}</Text>
          {placeId ? (
            <Pressable
              onPress={() => {
                setPlaceId(null);
                setPlaceQuery('');
              }}
              style={styles.selectedPlace}
              accessibilityRole="button"
            >
              <Check size={15} color={colors.pink} />
              <Text style={styles.selectedPlaceLabel}>{findPlace(placeId)?.name}</Text>
              <Text style={styles.change}>αλλαγή</Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.inputRow}>
                <Search size={16} color={colors.textMuted} />
                <TextInput
                  value={placeQuery}
                  onChangeText={setPlaceQuery}
                  placeholder="Γράψε πόλη ή χωριό"
                  placeholderTextColor={colors.textMuted}
                  style={styles.inputFlex}
                />
              </View>
              {suggestions.map((place) => (
                <Pressable
                  key={place.id}
                  onPress={() => setPlaceId(place.id)}
                  style={styles.suggestion}
                  accessibilityRole="button"
                >
                  <Text style={styles.suggestionName}>{place.name}</Text>
                  <Text style={styles.suggestionMeta}>
                    {place.country === 'CY' ? 'Κύπρος' : 'Ελλάδα'}
                  </Text>
                </Pressable>
              ))}
            </>
          )}

          <View style={styles.confirmations}>
            <ConfirmRow
              label="Επιβεβαιώνω ότι είμαι γυναίκα άνω των 18 ετών."
              value={womenOnly}
              onChange={setWomenOnly}
            />
            <ConfirmRow
              label="Αποδέχομαι τους όρους χρήσης και την πολιτική απορρήτου."
              value={terms}
              onChange={setTerms}
            />
          </View>

          {formError ? (
            <View style={styles.errorBox}>
              <Info size={15} color={colors.danger} />
              <Text style={styles.errorBoxLabel}>{formError}</Text>
            </View>
          ) : null}

          {needsConfirmation ? (
            <View style={styles.notice}>
              <Info size={15} color={colors.pinkDark} />
              <Text style={styles.noticeLabel}>
                Σου στείλαμε email επιβεβαίωσης στο {email.trim()}. Άνοιξέ το, πάτα τον σύνδεσμο
                και μετά κάνε σύνδεση.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={() => void submit()}
            disabled={!canSubmit || submitting}
            style={[styles.submit, !canSubmit && styles.submitDisabled]}
            accessibilityRole="button"
          >
            <Text style={styles.submitLabel}>
              {submitting ? 'Δημιουργία...' : 'Συνέχεια'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace('/login')}
            style={styles.altAction}
            accessibilityRole="button"
          >
            <Text style={styles.altLabel}>Έχω ήδη λογαριασμό</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ConfirmRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.confirmRow}>
      <Text style={styles.confirmLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderChip, true: colors.pink }}
        thumbColor={colors.white}
        accessibilityLabel={label}
      />
    </View>
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
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
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
  error: {
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.danger,
    marginTop: 5,
  },
  selectedPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
  },
  selectedPlaceLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.pinkDark,
  },
  change: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.pink,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    marginTop: 6,
  },
  suggestionName: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  suggestionMeta: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  confirmations: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
  },
  confirmLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: font.medium,
    color: colors.textBody,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#FBE4E4',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  errorBoxLabel: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.danger,
    lineHeight: 17,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
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

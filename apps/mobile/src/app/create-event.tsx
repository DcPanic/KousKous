import { useState } from 'react';
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
import { CalendarDays, ImagePlus, Info, MapPin, Users, X } from 'lucide-react-native';
import {
  can,
  colors,
  eventCategories,
  findPlace,
  places,
  radii,
  shadows,
  spacing,
  toGreekUpperCase,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import type { Attachment } from '@/data/forum';
import { pickMedia } from '@/lib/media';
import { useSession } from '@/state/session';
import { AttachmentGrid } from '@/components/attachments';
import { DateRangeCalendar } from '@/components/date-range-calendar';
import { PlaceholderScreen } from '@/components/placeholder-screen';

/** An event happens in a city or an area, never in a whole region. */
const EVENT_PLACES = places.filter((place) => place.kind === 'city' || place.kind === 'area');

function euro(value: string): string {
  const parsed = Number(value.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed <= 0) return 'Δωρεάν';
  return `€${parsed.toFixed(2).replace('.', ',')}`;
}

export default function CreateEventScreen() {
  const router = useRouter();
  const { user } = useSession();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState<Attachment[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [placeId, setPlaceId] = useState<string>(user.location ?? 'athens');
  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [time, setTime] = useState('');
  const [spots, setSpots] = useState('');
  const [price, setPrice] = useState('');
  const [womenOnly, setWomenOnly] = useState(true);

  // Only approved hosts can publish paid events (spec §2.3). The screen is
  // reachable from the host dashboard, so a wrong tier means a wrong link
  // rather than a paywall.
  if (!can(user, 'create_events')) {
    return (
      <PlaceholderScreen
        title="Μόνο για διοργανώτριες"
        subtitle="Premium Host"
        body="Η δημιουργία event είναι διαθέσιμη σε εγκεκριμένους λογαριασμούς Premium Host."
      />
    );
  }

  const paid = Number(price.replace(',', '.')) > 0;
  const canPublish =
    title.trim().length > 0 && date !== null && time.trim().length > 0 && venue.trim().length > 0;

  const publish = () => {
    if (!canPublish) return;
    // Persisting an event needs Supabase; until then publishing returns to
    // the dashboard rather than pretending the event went live.
    router.back();
  };

  const pickCover = async () => {
    const picked = await pickMedia('image');
    if (picked.length > 0) setCover([picked[0]]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.close}
          accessibilityRole="button"
          accessibilityLabel="Κλείσιμο"
        >
          <X size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Νέο event</Text>
        <Pressable
          onPress={publish}
          disabled={!canPublish}
          style={[styles.publish, !canPublish && styles.publishDisabled]}
          accessibilityRole="button"
        >
          <Text style={styles.publishLabel}>Δημοσίευση</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={pickCover}
            style={styles.coverPicker}
            accessibilityRole="button"
            accessibilityLabel="Προσθήκη εξωφύλλου"
          >
            {cover.length > 0 ? (
              <AttachmentGrid attachments={cover} onRemove={() => setCover([])} height={160} />
            ) : (
              <View style={styles.coverEmpty}>
                <ImagePlus size={22} color={colors.hostPurple} />
                <Text style={styles.coverLabel}>Πρόσθεσε εξώφυλλο</Text>
              </View>
            )}
          </Pressable>

          <Text style={styles.sectionTitle}>{toGreekUpperCase('Τίτλος')}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="π.χ. Wine & Talk Night"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>{toGreekUpperCase('Περιγραφή')}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Τι θα κάνετε, σε ποιες απευθύνεται, τι περιλαμβάνει..."
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.multiline]}
            multiline
          />

          <Text style={styles.sectionTitle}>{toGreekUpperCase('Κατηγορία')}</Text>
          <View style={styles.chipWrap}>
            {eventCategories.map((category) => {
              const selected = category.id === categoryId;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => setCategoryId(selected ? null : category.id)}
                  style={[styles.chip, selected && styles.chipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={styles.chipEmoji}>{category.emoji}</Text>
                  <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>{toGreekUpperCase('Πού')}</Text>
          <Pressable
            onPress={() => setPlacePickerOpen((open) => !open)}
            style={styles.field}
            accessibilityRole="button"
          >
            <MapPin size={15} color={colors.hostPurple} />
            <Text style={styles.fieldValue}>{findPlace(placeId)?.name}</Text>
            <Text style={styles.fieldAction}>{placePickerOpen ? 'κλείσιμο' : 'αλλαγή'}</Text>
          </Pressable>

          {placePickerOpen ? (
            <View style={styles.chipWrap}>
              {EVENT_PLACES.map((place) => {
                const selected = place.id === placeId;
                return (
                  <Pressable
                    key={place.id}
                    onPress={() => {
                      setPlaceId(place.id);
                      setPlacePickerOpen(false);
                    }}
                    style={[styles.chip, selected && styles.chipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>
                      {place.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <TextInput
            value={venue}
            onChangeText={setVenue}
            placeholder="Όνομα χώρου και διεύθυνση"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.inputSpaced]}
          />

          <Text style={styles.sectionTitle}>{toGreekUpperCase('Πότε')}</Text>
          <Pressable
            onPress={() => setDatePickerOpen((open) => !open)}
            style={styles.field}
            accessibilityRole="button"
          >
            <CalendarDays size={15} color={colors.hostPurple} />
            <Text style={styles.fieldValue}>
              {date ? formatGreekDate(date) : 'Διάλεξε ημερομηνία'}
            </Text>
            <Text style={styles.fieldAction}>{datePickerOpen ? 'κλείσιμο' : 'αλλαγή'}</Text>
          </Pressable>

          {datePickerOpen ? (
            <View style={styles.calendarCard}>
              <DateRangeCalendar
                range={{ start: date, end: date }}
                onChange={(next) => {
                  // An event happens on one day, so only the first tap counts.
                  setDate(next.start);
                  if (next.start) setDatePickerOpen(false);
                }}
              />
            </View>
          ) : null}

          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="Ώρα, π.χ. 20:30"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.inputSpaced]}
          />

          <Text style={styles.sectionTitle}>{toGreekUpperCase('Θέσεις & τιμή')}</Text>
          <View style={styles.row}>
            <View style={styles.half}>
              <View style={styles.field}>
                <Users size={15} color={colors.hostPurple} />
                <TextInput
                  value={spots}
                  onChangeText={setSpots}
                  placeholder="Θέσεις"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  style={styles.fieldInput}
                />
              </View>
            </View>
            <View style={styles.half}>
              <View style={styles.field}>
                <Text style={styles.euroSign}>€</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0,00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  style={styles.fieldInput}
                />
              </View>
            </View>
          </View>
          <Text style={styles.priceHint}>
            Τιμή ανά άτομο: {euro(price)}. Άφησέ το κενό για δωρεάν event.
          </Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Μόνο για μέλη KousKous</Text>
              <Text style={styles.toggleBody}>
                Οι δωρεάν λογαριασμοί βλέπουν το event αλλά δεν δηλώνουν συμμετοχή.
              </Text>
            </View>
            <Switch
              value={womenOnly}
              onValueChange={setWomenOnly}
              trackColor={{ false: colors.borderChip, true: colors.hostPurple }}
              thumbColor={colors.white}
              accessibilityLabel="Μόνο για μέλη KousKous"
            />
          </View>

          {paid ? (
            <View style={styles.notice}>
              <Info size={15} color={colors.hostPurpleDark} />
              <Text style={styles.noticeLabel}>
                Τα χρήματα από τα εισιτήρια πάνε απευθείας στον δικό σου λογαριασμό Stripe. Το
                KousKous δεν κρατάει προμήθεια και δεν διαχειρίζεται τα χρήματα του event.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const MONTHS = [
  'Ιαν',
  'Φεβ',
  'Μαρ',
  'Απρ',
  'Μαΐ',
  'Ιουν',
  'Ιουλ',
  'Αυγ',
  'Σεπ',
  'Οκτ',
  'Νοε',
  'Δεκ',
];

function formatGreekDate(iso: string): string {
  // The calendar hands back a full ISO timestamp; only the date matters.
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
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
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  publish: {
    backgroundColor: colors.hostPurple,
    borderRadius: radii.full,
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
  },
  publishDisabled: {
    backgroundColor: colors.textInactive,
  },
  publishLabel: {
    fontSize: 12.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  coverPicker: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  coverEmpty: {
    height: 130,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.hostPurple,
    backgroundColor: colors.hostPurpleTint,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  coverLabel: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.hostPurpleDark,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.hostPurple,
    marginTop: spacing.xl,
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
  inputSpaced: {
    marginTop: spacing.sm,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.hostPurple,
    backgroundColor: colors.hostPurpleSoft,
  },
  chipEmoji: {
    fontSize: 13,
  },
  chipLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  chipLabelActive: {
    color: colors.hostPurpleDark,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
  },
  fieldValue: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  fieldInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  fieldAction: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.hostPurple,
  },
  euroSign: {
    fontSize: 14,
    fontFamily: font.extrabold,
    color: colors.hostPurple,
  },
  calendarCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    boxShadow: shadows.card,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  half: {
    flex: 1,
  },
  priceHint: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    marginTop: spacing.lg,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  toggleBody: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 1,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.hostPurpleTint,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  noticeLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.hostPurpleDark,
    lineHeight: 16,
  },
});

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, radii, spacing, type DateRange } from '@kouskous/shared';
import { font } from '@/theme/typography';

const MONTHS = [
  'Ιανουάριος',
  'Φεβρουάριος',
  'Μάρτιος',
  'Απρίλιος',
  'Μάιος',
  'Ιούνιος',
  'Ιούλιος',
  'Αύγουστος',
  'Σεπτέμβριος',
  'Οκτώβριος',
  'Νοέμβριος',
  'Δεκέμβριος',
];

/** Monday first, as calendars are read in Greece. */
const WEEKDAYS = ['Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ', 'Κ'];

interface DateRangeCalendarProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toIso(date: Date): string {
  // Midday avoids the date shifting when the string is parsed in another
  // timezone.
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).toISOString();
}

function sameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

/**
 * Two-tap range picker: the first tap sets the start, the second the end.
 * Tapping a day before the start moves the start rather than rejecting it,
 * which is what someone means when they tap an earlier day.
 */
export function DateRangeCalendar({ range, onChange }: DateRangeCalendarProps) {
  const today = startOfDay(new Date());
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const start = range.start ? startOfDay(new Date(range.start)) : null;
  const end = range.end ? startOfDay(new Date(range.end)) : null;

  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  // getDay is Sunday-based; shift so Monday is the first column.
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_unused, index) => new Date(month.getFullYear(), month.getMonth(), index + 1),
    ),
  ];

  const select = (day: Date) => {
    if (!start || end || day < start) {
      onChange({ start: toIso(day), end: null });
      return;
    }
    onChange({ start: range.start, end: toIso(day) });
  };

  const shiftMonth = (delta: number) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const canGoBack =
    month.getFullYear() > today.getFullYear() ||
    (month.getFullYear() === today.getFullYear() && month.getMonth() > today.getMonth());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => shiftMonth(-1)}
          disabled={!canGoBack}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Προηγούμενος μήνας"
        >
          <ChevronLeft size={18} color={canGoBack ? colors.text : colors.textFaint} />
        </Pressable>
        <Text style={styles.monthLabel}>
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </Text>
        <Pressable
          onPress={() => shiftMonth(1)}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Επόμενος μήνας"
        >
          <ChevronRight size={18} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS.map((label, index) => (
          <Text key={`${label}-${index}`} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, index) => {
          if (!day) return <View key={`blank-${index}`} style={styles.cell} />;

          const past = day < today;
          const isStart = start !== null && sameDay(day, start);
          const isEnd = end !== null && sameDay(day, end);
          const inRange = start !== null && end !== null && day > start && day < end;
          const edge = isStart || isEnd;

          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => select(day)}
              disabled={past}
              style={[styles.cell, inRange && styles.cellInRange]}
              accessibilityRole="button"
              accessibilityLabel={`${day.getDate()} ${MONTHS[day.getMonth()]}`}
              accessibilityState={{ selected: edge || inRange, disabled: past }}
            >
              <View style={[styles.day, edge && styles.dayEdge]}>
                <Text
                  style={[
                    styles.dayLabel,
                    past && styles.dayPast,
                    inRange && styles.dayInRangeLabel,
                    edge && styles.dayEdgeLabel,
                  ]}
                >
                  {day.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.hint}>
        {!start
          ? 'Διάλεξε ημερομηνία έναρξης'
          : !end
            ? 'Διάλεξε ημερομηνία λήξης, ή άφησέ το για μία μέρα'
            : 'Πάτα ξανά μια μέρα για νέο εύρος'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
  },
  monthLabel: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  weekdays: {
    flexDirection: 'row',
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 10.5,
    fontFamily: font.bold,
    color: colors.textFaint,
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellInRange: {
    backgroundColor: colors.pinkSoft,
  },
  day: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayEdge: {
    backgroundColor: colors.pink,
  },
  dayLabel: {
    fontSize: 12.5,
    fontFamily: font.semibold,
    color: colors.text,
  },
  dayPast: {
    color: colors.textFaint,
  },
  dayInRangeLabel: {
    color: colors.pinkDark,
    fontFamily: font.bold,
  },
  dayEdgeLabel: {
    color: colors.white,
    fontFamily: font.extrabold,
  },
  hint: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

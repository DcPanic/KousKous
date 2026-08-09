/**
 * Activity feed behind the header bell (spec §7 screen 12).
 *
 * Each item points at a surface that already exists, so tapping one is a
 * real navigation rather than a dead end. `target` is resolved by the
 * screen; keeping it as data means the backend can send the same shape.
 */

export type NotificationKind =
  | 'reply'
  | 'like'
  | 'follow'
  | 'event'
  | 'community'
  | 'system';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  /** Who caused it. Empty for system notices. */
  actor: string;
  /** Greek copy, already written the way it is shown. */
  body: string;
  timeAgo: string;
  read: boolean;
  /** Where tapping it goes, or null when there is nothing to open. */
  target:
    | { screen: 'thread'; id: string }
    | { screen: 'event'; id: string }
    | { screen: 'community'; id: string }
    | { screen: 'chat'; id: string }
    | null;
}

/** Newest first — the screen groups them by age, not by kind. */
export const notifications: AppNotification[] = [
  {
    id: 'n1',
    kind: 'reply',
    actor: 'Ελένη Κ.',
    body: 'απάντησε στη συζήτηση «Ποιο αντηλιακό προσώπου δεν αφήνει λευκά ίχνη;»',
    timeAgo: '12 λεπτά',
    read: false,
    target: { screen: 'thread', id: 'b1' },
  },
  {
    id: 'n2',
    kind: 'like',
    actor: 'Μαρία Π.',
    body: 'και 8 ακόμα έκαναν like στη δημοσίευσή σου',
    timeAgo: '1 ώρα',
    read: false,
    target: null,
  },
  {
    id: 'n3',
    kind: 'event',
    actor: '',
    body: 'Το «Wine & Talk Night» είναι σε 2 ημέρες. Μην ξεχάσεις!',
    timeAgo: '3 ώρες',
    read: false,
    target: { screen: 'event', id: 'e1' },
  },
  {
    id: 'n4',
    kind: 'follow',
    actor: 'Νατάσα Ιωάννου',
    body: 'σε ακολουθεί',
    timeAgo: 'Χθες',
    read: true,
    target: null,
  },
  {
    id: 'n5',
    kind: 'community',
    actor: '',
    body: 'Νέα συζήτηση στην κοινότητα Beauty που ακολουθείς',
    timeAgo: 'Χθες',
    read: true,
    target: { screen: 'community', id: 'beauty' },
  },
  {
    id: 'n6',
    kind: 'system',
    actor: '',
    body: 'Καλώς ήρθες στο KousKous! Συμπλήρωσε το προφίλ σου για να σε βρίσκουν πιο εύκολα.',
    timeAgo: '2 ημέρες',
    read: true,
    target: null,
  },
];

export const unreadNotifications = notifications.filter(
  (notification) => !notification.read,
).length;

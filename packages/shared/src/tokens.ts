/**
 * KousKous design tokens.
 *
 * Single source of truth for both the Expo app and the web admin panel.
 * Values are lifted directly from the approved mockups so the built app
 * matches them pixel for pixel — do not "round" them to a tidier scale.
 */

export const colors = {
  /** Brand pink — primary actions, active states, logo. */
  pink: '#EC3E73',
  /** Darker pink — hover states, emphasised text on light backgrounds. */
  pinkDark: '#C42A5A',
  /** Tinted pink fill for active chips and follow pills. */
  pinkSoft: '#FDE3EC',
  /** Lighter still — story ring start, avatar placeholder gradients. */
  pinkPale: '#FBC2D4',
  pinkTint: '#FBE1E9',

  /** App background. */
  cream: '#FFF6F8',
  surface: '#FFFFFF',
  /** Neutral panel inside cards (payment notes, announcement composer). */
  surfaceMuted: '#F7F5F9',

  /** Official account + Rewards Club accent. */
  gold: '#C99A2E',
  goldSoft: '#FDF1D6',

  /** Host dashboard accents. */
  hostPurple: '#8355C9',
  hostPurpleDark: '#5E3AA8',
  hostPurpleSoft: '#ECE4F7',
  /** Icon-button background inside the host dashboard. */
  hostPurpleTint: '#F5EFF9',

  /** Official dashboard accents. */
  aubergine: '#2E1A24',
  aubergineLight: '#4A2E3B',

  success: '#2E9E6B',
  danger: '#D93A3A',
  /** Live-session red, distinct from `danger`. */
  live: '#E23744',

  /** Warning callout (host without a connected payment account). */
  warningBg: '#FFF4E5',
  warningBorder: '#F5D9A8',
  warningText: '#8A6413',
  warningIcon: '#C98A1E',

  /** Headings and primary UI text. */
  text: '#1A1A1A',
  /** Body copy inside post captions. */
  textBody: '#2A2A2A',
  /** Secondary copy — review text, bios. */
  textSecondary: '#5A5458',
  /** Timestamps, counts, metadata. */
  textMuted: '#A8A0A3',
  /** Inactive tab bar items. */
  textInactive: '#B0AAAD',
  /** Inactive profile tab labels. */
  textFaint: '#C9BFC3',
  /** Drawer section headers. */
  textEyebrow: '#C9A0AE',

  /** Hairline between sections and around the tab bar. */
  border: '#F5E6EB',
  /** Outline on unselected chips and filter pills. */
  borderSoft: '#F0DDE3',
  borderChip: '#EFE0E5',
  borderPill: '#E5D5DA',
  /** Progress track behind the event capacity bar. */
  track: '#F0E4EA',

  /** Scrim behind the drawer. */
  scrim: 'rgba(17, 17, 17, 0.4)',
  /** Carousel index badge on post images. */
  imageBadge: 'rgba(0, 0, 0, 0.4)',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorToken = keyof typeof colors;

/**
 * Gradients are expressed as colour stops. Consumers pick the API that
 * fits — expo-linear-gradient on native, `linear-gradient()` on web.
 * All mockup gradients run at 135deg, i.e. top-left to bottom-right.
 */
export const gradients = {
  /** Ring around story avatars, and the default avatar placeholder. */
  avatar: [colors.pinkPale, colors.pink] as [string, string],
  /** Photo placeholder inside post cards. */
  photo: ['#FBE1E9', '#F3D9DE', '#E9C6CE'] as [string, string, string],
  /** Event cover placeholder. */
  eventCover: [colors.pink, '#8B5A6B'] as [string, string],
  /** Host dashboard surfaces — CTA cards, dashboard entry button. */
  host: [colors.hostPurple, colors.hostPurpleDark] as [string, string],
  /** Host's next-event cover. */
  hostEventCover: [colors.pink, colors.hostPurpleDark] as [string, string],
  /** Official dashboard surfaces. */
  official: [colors.aubergine, colors.aubergineLight] as [string, string],
  /** Official avatar and official event covers. */
  officialCover: [colors.aubergine, colors.pink] as [string, string],
} as const;

/** Shared angle for every gradient above, in degrees. */
export const gradientAngle = 135;

export const fonts = {
  /** Logo and script accents. */
  logo: 'Pacifico',
  /** All UI text. */
  body: 'Manrope',
} as const;

/**
 * Manrope weights the mockups actually use. Keep this in sync with the
 * fonts registered at startup — unused weights cost cold-launch time.
 */
export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

/**
 * Type scale taken from the mockups. The half-point sizes are intentional;
 * they are what the approved designs specify.
 */
export const fontSizes = {
  /** Tab bar labels, LIVE badge. */
  tab: 9.5,
  /** Story names, drawer eyebrows, stat captions. */
  micro: 10.5,
  /** Metadata, section eyebrows, chip labels. */
  caption: 11.5,
  /** Comment previews, secondary body. */
  small: 12.5,
  /** Default body and list items. */
  body: 13.5,
  /** Card titles. */
  title: 14.5,
  /** Screen titles, profile name. */
  heading: 16.5,
  /** Logo. */
  logo: 26,
  /** Big numeric callouts, e.g. the review average. */
  display: 30,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 14,
  /** Standard horizontal screen padding. */
  screen: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radii = {
  sm: 9,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 18,
  card: 20,
  pill: 30,
  full: 999,
} as const;

/**
 * Shadows as CSS shadow strings.
 *
 * React Native 0.86 deprecated the `shadow*` style props in favour of
 * `boxShadow`, which takes the same syntax as CSS — so one string now
 * serves the app and the admin panel alike.
 */
export const shadows = {
  /** The near-universal card shadow in the mockups. */
  card: '0 1px 3px rgba(0, 0, 0, 0.04)',
  /** Raised centre action button in the bottom tab bar. */
  fab: '0 6px 16px -3px rgba(236, 62, 115, 0.55)',
  /** Drawer panel, which casts to the right. */
  drawer: '8px 0 30px rgba(0, 0, 0, 0.15)',
} as const;

/** Layout constants shared between screens. */
export const layout = {
  /** Drawer takes 80% of the screen, capped so it stays usable on tablets. */
  drawerWidthRatio: 0.8,
  drawerMaxWidth: 300,
  storyAvatar: 58,
  tabBarHeight: 82,
} as const;

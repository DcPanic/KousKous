import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Image } from 'expo-image';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { colors, radii, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';

/**
 * Full-screen photo viewer.
 *
 * One viewer for the whole app rather than one per screen: a photo can be
 * tapped in the feed, a forum thread, a chat, a product or an event, and
 * all of them open the same thing.
 *
 * The picture is fitted, never cropped — the point of opening it is to
 * see the parts the card had to cut off.
 */

export interface LightboxImage {
  uri: string;
  /** Shown under the picture when there is something worth saying. */
  caption?: string;
}

interface LightboxValue {
  /** Opens the viewer at one of the pictures. */
  open: (images: LightboxImage[], index?: number) => void;
}

const LightboxContext = createContext<LightboxValue | null>(null);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const open = useCallback((next: LightboxImage[], at = 0) => {
    const usable = next.filter((image) => image.uri);
    if (usable.length === 0) return;

    setImages(usable);
    setIndex(Math.min(Math.max(at, 0), usable.length - 1));
    setVisible(true);
  }, []);

  const value = useMemo<LightboxValue>(() => ({ open }), [open]);

  return (
    <LightboxContext.Provider value={value}>
      {children}
      <Viewer
        visible={visible}
        images={images}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setVisible(false)}
      />
    </LightboxContext.Provider>
  );
}

interface ViewerProps {
  visible: boolean;
  images: LightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

function Viewer({ visible, images, index, onIndexChange, onClose }: ViewerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<LightboxImage>>(null);

  if (!visible || images.length === 0) return null;

  const caption = images[index]?.caption;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.screen}>
        <FlatList
          ref={listRef}
          data={images}
          keyExtractor={(image, position) => `${image.uri}-${position}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={index}
          getItemLayout={(_data, position) => ({
            length: width,
            offset: width * position,
            index: position,
          })}
          onMomentumScrollEnd={(event) => {
            onIndexChange(Math.round(event.nativeEvent.contentOffset.x / width));
          }}
          renderItem={({ item }) => (
            // Tapping the picture closes the viewer, which is what every
            // photo viewer does and what a thumb reaches for first.
            <Pressable
              onPress={onClose}
              style={{ width, height }}
              accessibilityRole="button"
              accessibilityLabel="Κλείσιμο φωτογραφίας"
            >
              <Image
                source={{ uri: item.uri }}
                style={styles.image}
                // Fitted, not cropped: seeing the whole picture is the
                // reason it was opened.
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={120}
              />
            </Pressable>
          )}
        />

        <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
          {images.length > 1 ? (
            <View style={styles.counter}>
              <Text style={styles.counterLabel}>
                {index + 1}/{images.length}
              </Text>
            </View>
          ) : (
            <View />
          )}

          <Pressable
            onPress={onClose}
            style={styles.close}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Κλείσιμο"
          >
            <X size={19} color={colors.white} />
          </Pressable>
        </View>

        {caption ? (
          <View style={[styles.captionBar, { paddingBottom: insets.bottom + spacing.lg }]}>
            <Text style={styles.caption}>{caption}</Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

export function useLightbox(): LightboxValue {
  const value = useContext(LightboxContext);
  if (!value) throw new Error('useLightbox must be used inside a LightboxProvider');
  return value;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    // Near-black rather than the app's cream: a photo is judged against
    // what surrounds it, and cream tints everything warm.
    backgroundColor: '#08050A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
  },
  counter: {
    backgroundColor: colors.imageBadge,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  counterLabel: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.white,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.imageBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionBar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
  },
  caption: {
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.white,
    lineHeight: 20,
    textAlign: 'center',
  },
});

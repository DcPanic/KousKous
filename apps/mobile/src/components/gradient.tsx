import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * Every gradient in the design runs top-left to bottom-right (135deg),
 * so the direction is fixed here rather than repeated at each call site.
 */
const START = { x: 0, y: 0 } as const;
const END = { x: 1, y: 1 } as const;

interface DiagonalGradientProps {
  colors: LinearGradientProps['colors'];
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function DiagonalGradient({ colors, style, children }: DiagonalGradientProps) {
  return (
    <LinearGradient colors={colors} start={START} end={END} style={style}>
      {children}
    </LinearGradient>
  );
}

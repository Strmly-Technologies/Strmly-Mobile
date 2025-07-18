import { TextProps, TextStyle, ViewProps, ViewStyle } from 'react-native';

/** Props for ThemedView */
export interface ThemedViewProps extends ViewProps {
  style?: ViewStyle | ViewStyle[] | null;
  safe?: boolean | null;
}

/** Props for ThemedText */
export interface ThemedTextProps extends TextProps {
  style?: TextStyle | TextStyle[] | null;
  title?: boolean | null;
}

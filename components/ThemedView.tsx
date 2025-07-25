import { Colors } from "@/Constants/Colors";
import { ThemedViewProps } from "@/types/View-Text-type";
import { useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const ThemedView = ({ style, safe = false, ...props }: ThemedViewProps) => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  if(!colorScheme){
    return null;
  }
  const theme = Colors[colorScheme] ?? Colors.light;

  if (!safe)
    return (
      <View style={[{ backgroundColor: theme.background }, style]} {...props} />
    );


  return (
    <View
      style={[
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedView;

import { Colors } from '@/Constants/Colors'
import { ThemedTextProps } from '@/types/View-Text-type'
import { Text, useColorScheme } from 'react-native'

const ThemedText = ({ style, title = false, ...props }: ThemedTextProps) => {
  const colorScheme = useColorScheme() ?? 'dark'
  const theme = Colors[colorScheme]

  const textColor = title ? theme.title : theme.text

  return (
    <Text 
      style={[{ color: textColor }, style]}
      {...props}
    />
  )
}

export default ThemedText
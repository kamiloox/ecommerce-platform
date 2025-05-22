import { Text, TextProps } from 'react-native';

export const Strong = ({ children, style, ...props }: TextProps) => (
  <Text {...props} style={[{ fontWeight: 'bold' }, style]}>
    {children}
  </Text>
);

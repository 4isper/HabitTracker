import type { TextStyle } from 'react-native';

export const text = {
  caption: { fontSize: 13 },
  captionStrong: { fontSize: 13, fontWeight: '600' },
  bodySm: { fontSize: 14 },
  body: { fontSize: 15 },
  bodyLg: { fontSize: 16 },
  label: { fontSize: 14, fontWeight: '600' },
  button: { fontSize: 16, fontWeight: '700' },
  buttonSm: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700' },
  heading: { fontSize: 22, fontWeight: '700' },
} as const satisfies Record<string, TextStyle>;

export const emojiSize = {
  sm: 22,
  md: 26,
  lg: 32,
} as const;

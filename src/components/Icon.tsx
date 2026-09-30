import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import Plus from 'lucide-react-native/icons/plus';

import type { LucideIcon } from 'lucide-react-native';

const ICONS = {
  back: ChevronLeft,
  add: Plus,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

const DEFAULT_SIZE = 22;
const DEFAULT_STROKE_WIDTH = 2.5;

type IconProps = {
  name: IconName;
  color: string;
  size?: number;
  strokeWidth?: number;
};

export function Icon({
  name,
  color,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const Glyph = ICONS[name];

  return (
    <Glyph
      width={size}
      height={size}
      color={color}
      strokeWidth={strokeWidth}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

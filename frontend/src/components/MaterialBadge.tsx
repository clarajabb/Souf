import { MaterialType } from '../types';

// Brown / white / black palette only — no green, lime, teal, emerald
const COLORS: Record<MaterialType, string> = {
  WOOL:     'bg-brand-100 text-brand-800',
  COTTON:   'bg-gray-100 text-gray-700',
  LINEN:    'bg-stone-100 text-stone-700',
  SILK:     'bg-gray-900 text-white',
  LEATHER:  'bg-brand-900 text-brand-100',
  CASHMERE: 'bg-brand-200 text-brand-900',
  ALPACA:   'bg-brand-50 text-brand-700',
  OTHER:    'bg-gray-100 text-gray-600',
};

const LABELS: Record<MaterialType, string> = {
  WOOL:     'Wool',
  COTTON:   'Cotton',
  LINEN:    'Linen',
  SILK:     'Silk',
  LEATHER:  'Leather',
  CASHMERE: 'Cashmere',
  ALPACA:   'Alpaca',
  OTHER:    'Other',
};

interface Props {
  type: MaterialType;
  size?: 'sm' | 'md';
}

export default function MaterialBadge({ type, size = 'sm' }: Props) {
  const color = COLORS[type] ?? COLORS.OTHER;
  const label = LABELS[type] ?? type;
  const sizeClass = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${color} ${sizeClass}`}>
      {label}
    </span>
  );
}

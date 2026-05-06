import { useTranslation } from 'react-i18next';

interface Props {
  size?: 'sm' | 'md';
}

export default function VerifiedBadge({ size = 'sm' }: Props) {
  const { t } = useTranslation();
  const sizeClass = size === 'md' ? 'text-sm gap-1.5' : 'text-xs gap-1';
  const iconSize = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span className={`inline-flex items-center font-medium text-brand-600 ${sizeClass}`}>
      <svg
        className={`${iconSize} text-brand-500`}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      {t('common.verified')}
    </span>
  );
}

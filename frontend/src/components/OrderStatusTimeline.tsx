import { useTranslation } from 'react-i18next';
import { OrderStatus } from '../types';

const STEPS: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];

const STEP_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  DISPUTED: 'Disputed',
  CANCELLED: 'Cancelled',
};


interface Props {
  status: OrderStatus;
}

export default function OrderStatusTimeline({ status }: Props) {
  const { t } = useTranslation();
  const isTerminal = status === 'DISPUTED' || status === 'CANCELLED';

  if (isTerminal) {
    return (
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm ${
        status === 'DISPUTED' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
      }`}>
        <span>{STEP_LABELS[status]}</span>
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(status);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          const upcoming = idx > currentIdx;

          return (
            <div key={step} className="flex flex-col items-center flex-1 relative">
              {/* Connector line */}
              {idx > 0 && (
                <div
                  className={`absolute top-4 right-1/2 w-full h-0.5 ${
                    done ? 'bg-brand-500' : 'bg-gray-200'
                  }`}
                  style={{ left: '-50%', width: '100%' }}
                />
              )}

              {/* Circle */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-colors ${
                  done
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : active
                    ? 'bg-white border-brand-500 text-brand-600'
                    : 'bg-white border-gray-200 text-gray-300'
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-1.5 text-xs font-medium text-center ${
                  active ? 'text-brand-600' : done ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

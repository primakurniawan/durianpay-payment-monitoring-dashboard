import { StatusBadge } from './StatusBadge';

export type SortField =
  | 'payment_id'
  | 'merchant_name'
  | 'created_at'
  | 'amount'
  | 'status';
export type SortDir = 'asc' | 'desc';

interface Payment {
  payment_id: string;
  merchant_name: string;
  amount: number;
  status: string;
  created_at: string;
}

interface Props {
  payments: Payment[];
  loading: boolean;
  error: boolean;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span
      className={`ml-1 inline-flex flex-col gap-px ${active ? 'opacity-100' : 'opacity-30'}`}
    >
      <span
        className={`block w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent ${active && dir === 'asc' ? 'border-b-orange-400' : 'border-b-slate-400'}`}
      />
      <span
        className={`block w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent ${active && dir === 'desc' ? 'border-t-orange-400' : 'border-t-slate-400'}`}
      />
    </span>
  );
}

const COLUMNS: { key: SortField; label: string }[] = [
  { key: 'payment_id', label: 'Payment ID' },
  { key: 'merchant_name', label: 'Merchant Name' },
  { key: 'created_at', label: 'Date' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
];

function SkeletonRow() {
  return (
    <tr>
      {[80, 120, 90, 100, 70].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div
            className="h-4 rounded shimmer-bg animate-shimmer"
            style={{ width: w }}
          />
        </td>
      ))}
    </tr>
  );
}

export function PaymentTable({
  payments,
  loading,
  error,
  sortField,
  sortDir,
  onSort,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors select-none"
                style={{ fontFamily: 'Syne,sans-serif' }}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  <SortIcon active={sortField === col.key} dir={sortDir} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {loading && [...Array(8)].map((_, i) => <SkeletonRow key={i} />)}

          {error && (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-16 text-center text-red-400 text-sm"
              >
                Failed to load payments. Check your connection or try again.
              </td>
            </tr>
          )}

          {!loading && !error && payments.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-16 text-center text-slate-500 text-sm"
              >
                No payments match your current filters.
              </td>
            </tr>
          )}

          {!loading &&
            payments.map((p) => (
              <tr
                key={p.payment_id}
                className="hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-sm text-slate-300">
                    {p.payment_id}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-white font-medium">
                    {p.merchant_name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-400">
                    {p.created_at ? formatDate(p.created_at) : '—'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-white font-semibold tabular-nums">
                    {formatAmount(p.amount)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

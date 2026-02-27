interface Stats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
}

interface Props {
  stats: Stats;
  loading?: boolean;
}

function Card({
  label,
  value,
  accent,
  loading,
}: {
  label: string;
  value: number;
  accent: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
      <span
        className="text-slate-500 text-xs uppercase tracking-wider font-semibold"
        style={{ fontFamily: 'Syne,sans-serif' }}
      >
        {label}
      </span>
      {loading ? (
        <div className="h-8 w-16 rounded-lg shimmer-bg animate-shimmer" />
      ) : (
        <span
          className={`text-3xl font-extrabold ${accent}`}
          style={{ fontFamily: 'Syne,sans-serif' }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

export function StatCards({ stats, loading }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card
        label="Total"
        value={stats.total}
        accent="text-white"
        loading={loading}
      />
      <Card
        label="Completed"
        value={stats.completed}
        accent="text-emerald-400"
        loading={loading}
      />
      <Card
        label="Processing"
        value={stats.processing}
        accent="text-yellow-400"
        loading={loading}
      />
      <Card
        label="Failed"
        value={stats.failed}
        accent="text-red-400"
        loading={loading}
      />
    </div>
  );
}

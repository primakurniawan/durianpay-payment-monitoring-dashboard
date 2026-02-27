interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 4) pages.push('...');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 3) pages.push('...');
    pages.push(totalPages);
  }

  const btn = (
    label: string | number,
    targetPage: number,
    disabled: boolean,
    active = false,
  ) => (
    <button
      key={label}
      onClick={() => !disabled && onPageChange(targetPage)}
      disabled={disabled}
      className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all
        ${
          active
            ? 'bg-orange-500 text-white'
            : disabled
              ? 'text-slate-700 cursor-not-allowed'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
      <span className="text-slate-500 text-sm">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        {btn('←', page - 1, page === 1)}
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="text-slate-600 px-1">
              …
            </span>
          ) : (
            btn(p, p as number, false, p === page)
          ),
        )}
        {btn('→', page + 1, page === totalPages)}
      </div>
    </div>
  );
}

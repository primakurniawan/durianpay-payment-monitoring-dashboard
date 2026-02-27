import { useEffect, useState } from 'react';

interface Props {
  status: string | undefined;
  onStatusChange: (status: string | undefined) => void;
  search: string;
  onSearchChange: (search: string) => void;
  total: number;
}

const FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Completed', value: 'completed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Failed', value: 'failed' },
];

export function SearchBar({
  status,
  onStatusChange,
  search,
  onSearchChange,
  total,
}: Props) {
  const [inputValue, setInputValue] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(inputValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue, onSearchChange]);

  return (
    <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h2
          className="font-semibold text-white text-sm"
          style={{ fontFamily: 'Syne,sans-serif' }}
        >
          Transactions
          <span className="ml-2 text-slate-500 font-normal">({total})</span>
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle
              cx="7"
              cy="7"
              r="5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M11 11l3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search merchant or ID…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 w-full sm:w-52 transition-all"
          />
          {inputValue && (
            <button
              onClick={() => {
                setInputValue('');
                onSearchChange('');
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={String(f.value)}
              onClick={() => onStatusChange(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                status === f.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              style={{ fontFamily: 'Syne,sans-serif' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

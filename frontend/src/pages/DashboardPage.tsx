import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCards } from '../components/StatCards';
import { SearchBar } from '../components/SearchBar';
import { PaymentTable } from '../components/PaymentTable';
import { Pagination } from '../components/Pagination';
import type { SortField, SortDir } from '../components/PaymentTable';
import { useAuthStore } from '../store/authStore';
import { usePayments } from '../hooks/usePayments';

const LIMIT_OPTIONS = [10, 20, 50];
const DEFAULT_LIMIT = 20;

export default function DashboardPage() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const logout = useAuthStore((s) => s.logout);
  const role = useAuthStore((s) => s.role);
  const navigate = useNavigate();

  const { data, isLoading, isError } = usePayments({
    status,
    search,
    sortField,
    sortDir,
    page,
    limit,
  });

  const payments = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const summary = data?.summary ?? {
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
  };

  const handleSort = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('desc');
      }
      setPage(1);
    },
    [sortField],
  );

  const handleStatusChange = (s: string | undefined) => {
    setStatus(s);
    setPage(1);
  };
  const handleSearchChange = useCallback((s: string) => {
    setSearch(s);
    setPage(1);
  }, []);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              aria-label="Durianpay"
              className="inline-block w-[148px] h-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 148 32"
                className="w-full h-full"
              >
                <path
                  d="M 6.007 17.799 L 6.007 13.09 C 6.007 12.817 5.863 12.562 5.631 12.427 L 1.125 9.771 C 0.626 9.478 0 9.846 0 10.434 L 0 20.454 C 0 21.045 0.626 21.413 1.125 21.117 L 5.631 18.461 C 5.866 18.326 6.007 18.074 6.007 17.799 Z"
                  fill="rgb(219,32,68)"
                ></path>
                <path
                  d="M 6.806 11.687 L 10.827 9.316 C 11.059 9.178 11.203 8.926 11.203 8.653 L 11.203 3.342 C 11.203 2.751 10.578 2.383 10.078 2.68 L 1.548 7.703 C 1.049 7.997 1.049 8.734 1.548 9.031 L 6.054 11.687 C 6.289 11.822 6.574 11.822 6.806 11.687 Z"
                  fill="rgb(237,63,97)"
                ></path>
                <path
                  d="M 10.827 21.623 L 6.762 19.228 C 6.53 19.09 6.241 19.09 6.01 19.228 L 1.504 21.884 C 1.004 22.178 1.004 22.915 1.504 23.212 L 10.078 28.263 C 10.577 28.556 11.203 28.188 11.203 27.6 L 11.203 22.289 C 11.203 22.013 11.062 21.761 10.827 21.623 Z"
                  fill="rgb(219,32,68)"
                ></path>
                <path
                  d="M 17.26 5.054 L 17.26 5.078 L 13.171 2.668 C 12.672 2.374 12.046 2.743 12.046 3.33 L 12.046 8.641 C 12.046 8.914 12.19 9.169 12.422 9.304 L 16.426 11.663 C 16.657 11.801 16.946 11.801 17.178 11.663 L 21.704 8.995 C 22.203 8.701 22.203 7.964 21.704 7.667 Z"
                  fill="rgb(237,63,97)"
                ></path>
                <path
                  d="M 23.266 6.277 L 23.266 0.767 C 23.266 0.177 22.641 -0.192 22.141 0.105 L 17.636 2.761 C 17.404 2.898 17.26 3.15 17.26 3.423 L 17.26 3.621 C 17.26 3.894 17.404 4.148 17.636 4.283 L 22.141 6.939 C 22.641 7.236 23.266 6.867 23.266 6.277 Z"
                  fill="rgb(255,95,126)"
                ></path>
                <path
                  d="M 17.26 13.045 L 17.26 17.844 C 17.26 18.116 17.404 18.371 17.636 18.506 L 22.141 21.162 C 22.641 21.456 23.266 21.087 23.266 20.499 L 23.266 10.389 C 23.266 9.799 22.641 9.43 22.141 9.727 L 17.636 12.382 C 17.401 12.517 17.26 12.772 17.26 13.045 Z M 16.467 19.249 L 12.419 21.635 C 12.187 21.773 12.043 22.025 12.043 22.298 L 12.043 27.609 C 12.043 28.199 12.669 28.568 13.168 28.271 L 21.725 23.23 C 22.224 22.936 22.224 22.199 21.725 21.902 L 17.219 19.246 C 16.987 19.114 16.699 19.114 16.467 19.249 Z"
                  fill="rgb(201,0,39)"
                ></path>
                <path
                  d="M 44.336 1.678 L 44.336 23.227 C 44.336 23.868 43.487 24.542 42.32 24.542 C 41.313 24.542 40.497 23.868 40.497 23.227 L 40.497 22.294 C 39.868 23.61 38.135 24.83 36.123 24.83 C 33.197 24.83 30.615 21.683 30.615 18.248 L 30.615 15.613 C 30.615 12.049 33.133 9.094 36.217 9.094 C 38.167 9.094 39.583 10.281 40.276 11.534 L 40.276 1.678 C 40.276 0.908 41.19 0.392 42.32 0.392 C 43.487 0.392 44.336 0.908 44.336 1.678 Z M 34.675 18.248 C 34.675 19.726 35.935 21.203 37.412 21.203 C 39.016 21.203 40.276 19.501 40.276 18.826 L 40.276 15.616 C 40.276 13.818 38.796 12.727 37.445 12.727 C 35.903 12.727 34.675 14.171 34.675 15.616 Z M 46.571 18.314 L 46.571 10.604 C 46.571 9.963 47.484 9.289 48.615 9.289 C 49.684 9.289 50.63 9.963 50.63 10.604 L 50.63 18.311 C 50.63 19.756 51.858 21.2 53.4 21.2 C 54.942 21.2 56.138 19.789 56.138 18.311 L 56.138 10.574 C 56.138 9.9 57.081 9.289 58.185 9.289 C 59.38 9.289 60.2 9.9 60.2 10.574 L 60.2 18.314 C 60.2 21.782 57.116 24.833 53.403 24.833 C 49.655 24.833 46.571 21.749 46.571 18.314 Z M 70.11 12.724 C 68.286 12.724 66.491 14.555 66.491 17.478 L 66.491 23.227 C 66.491 23.868 65.549 24.542 64.415 24.542 C 63.252 24.542 62.432 23.868 62.432 23.227 L 62.432 10.574 C 62.432 9.804 63.252 9.289 64.415 9.289 C 65.422 9.289 66.239 9.801 66.239 10.574 L 66.239 11.89 C 66.867 10.509 68.377 9.097 70.11 9.097 L 71.086 9.097 C 71.84 9.097 72.566 9.933 72.566 10.895 C 72.566 11.89 71.843 12.727 71.086 12.727 L 70.11 12.727 Z M 77.727 3.86 C 77.727 4.921 76.751 5.884 75.524 5.884 C 74.264 5.884 73.288 4.921 73.288 3.86 C 73.288 2.769 74.264 1.837 75.524 1.837 C 76.751 1.837 77.727 2.769 77.727 3.86 Z M 77.568 10.574 L 77.568 23.227 C 77.568 23.868 76.654 24.542 75.524 24.542 C 74.358 24.542 73.509 23.868 73.509 23.227 L 73.509 10.574 C 73.509 9.804 74.358 9.289 75.524 9.289 C 76.654 9.289 77.568 9.801 77.568 10.574 Z M 91.729 15.358 L 91.729 23.227 C 91.729 23.964 90.88 24.542 89.746 24.542 C 88.709 24.542 87.922 23.964 87.922 23.227 L 87.922 22.294 C 86.788 23.61 85.311 24.83 83.137 24.83 C 80.902 24.83 79.045 23.481 79.045 20.559 C 79.045 16.866 82.036 15.838 86.377 15.838 L 87.666 15.838 L 87.666 15.421 C 87.666 14.039 86.973 12.466 84.897 12.466 C 82.473 12.466 82.065 13.461 81.31 13.461 C 80.397 13.461 79.927 12.337 79.927 11.405 C 79.927 10.089 82.726 9.094 84.961 9.094 C 89.872 9.097 91.729 12.115 91.729 15.358 Z M 87.669 17.993 L 87.196 17.993 C 85.088 17.993 83.105 18.218 83.105 20.016 C 83.105 21.203 83.827 21.752 84.773 21.752 C 86.063 21.752 87.669 20.241 87.669 18.667 Z M 98.023 23.227 C 98.023 23.868 97.08 24.542 95.979 24.542 C 94.784 24.542 93.964 23.868 93.964 23.227 L 93.964 10.574 C 93.964 9.804 94.784 9.289 95.979 9.289 C 96.954 9.289 97.774 9.801 97.774 10.574 L 97.774 11.537 C 98.373 10.284 99.883 9.097 101.992 9.097 C 104.888 9.097 107.405 12.052 107.405 15.616 L 107.405 23.227 C 107.405 24.093 106.365 24.542 105.361 24.542 C 104.418 24.542 103.346 24.093 103.346 23.227 L 103.346 15.616 C 103.346 14.171 102.118 12.727 100.608 12.727 C 99.319 12.727 98.026 13.818 98.026 15.616 L 98.026 23.227 Z M 112.028 10.125 L 112.028 11.603 C 112.722 10.35 114.17 9.163 116.246 9.163 C 119.363 9.163 121.909 11.86 121.909 15.17 L 121.909 18.67 C 121.909 21.851 119.298 24.773 116.34 24.773 C 114.419 24.773 112.783 23.616 112.093 22.3 L 112.093 31.197 C 112.093 31.583 111.652 32 111.053 32 C 110.486 32 110.046 31.583 110.046 31.197 L 110.046 10.125 C 110.046 9.675 110.486 9.355 111.053 9.355 C 111.588 9.352 112.028 9.675 112.028 10.125 Z M 119.865 15.167 C 119.865 13.11 118.07 11.087 115.9 11.087 C 114.011 11.087 112.093 12.598 112.093 15.167 L 112.093 19.663 C 112.093 20.625 113.729 22.843 115.964 22.843 C 118.041 22.843 119.865 20.787 119.865 18.667 Z M 134.434 15.358 L 134.434 23.709 C 134.434 24.192 134.026 24.545 133.427 24.545 C 132.892 24.545 132.484 24.192 132.484 23.709 L 132.484 22.297 C 131.382 23.583 129.84 24.77 127.731 24.77 C 125.34 24.77 123.451 23.421 123.451 20.532 C 123.451 17.031 126.409 16.132 130.783 16.132 L 132.387 16.132 L 132.387 15.361 C 132.387 13.305 131.379 10.994 128.674 10.994 C 126.565 10.994 125.81 11.926 125.308 11.926 C 124.773 11.926 124.488 11.285 124.488 10.802 C 124.488 9.966 126.724 9.166 128.736 9.166 C 132.957 9.16 134.434 12.148 134.434 15.358 Z M 132.39 17.573 L 131.068 17.573 C 128.172 17.573 125.499 17.864 125.499 20.334 C 125.499 22.195 126.694 22.999 128.236 22.999 C 130.251 22.999 132.39 21.071 132.39 19.627 Z M 135.788 10.446 C 135.726 10.35 135.694 10.254 135.694 10.158 C 135.694 9.612 136.417 9.163 136.954 9.163 C 137.269 9.163 137.583 9.292 137.677 9.612 L 141.989 21.431 L 146.048 9.612 C 146.174 9.292 146.456 9.163 146.741 9.163 C 147.243 9.163 147.999 9.579 147.999 10.191 C 147.999 10.254 147.999 10.383 147.937 10.449 L 143.058 23.937 C 141.798 27.405 140.226 31.997 136.669 31.997 C 136.135 31.997 135.726 31.772 135.726 31.065 C 135.726 30.582 135.885 30.103 136.355 30.103 C 138.338 30.103 140.132 27.243 140.916 23.904 Z"
                  fill="rgb(78,79,82)"
                ></path>
              </svg>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs font-semibold uppercase">
                {role?.charAt(0) ?? 'U'}
              </div>
              <span className="text-slate-400 text-sm capitalize">{role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1
            className="font-extrabold text-3xl text-white mb-1"
            style={{ fontFamily: 'Syne,sans-serif' }}
          >
            Payment Monitor
          </h1>
        </div>

        {/* Summary always shows global counts — not affected by active filter */}
        <StatCards stats={summary} loading={isLoading && !data} />

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <SearchBar
            status={status}
            onStatusChange={handleStatusChange}
            search={search}
            onSearchChange={handleSearchChange}
            total={total}
          />
          <PaymentTable
            payments={payments}
            loading={isLoading}
            error={isError}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
          />
          <div className="flex items-center justify-between px-6 border-t border-slate-800">
            <div className="flex items-center gap-2 py-4">
              <span className="text-slate-500 text-xs">Rows per page:</span>
              {LIMIT_OPTIONS.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLimit(l);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${limit === l ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

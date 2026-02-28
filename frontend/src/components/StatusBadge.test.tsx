import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders "completed" status with green styling', () => {
    render(<StatusBadge status="completed" />);
    const badge = screen.getByText(/completed/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    );
  });

  it('renders "processing" status with yellow styling', () => {
    render(<StatusBadge status="processing" />);
    const badge = screen.getByText(/processing/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      ' inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    );
  });

  it('renders "failed" status with red styling', () => {
    render(<StatusBadge status="failed" />);
    const badge = screen.getByText(/failed/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-red-500/10 text-red-400 border-red-500/20',
    );
  });
});

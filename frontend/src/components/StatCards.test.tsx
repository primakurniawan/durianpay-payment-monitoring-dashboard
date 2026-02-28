import { render, screen } from '@testing-library/react';
import { StatCards } from './StatCards';

const mockStats = {
  total: 200,
  completed: 118,
  processing: 42,
  failed: 40,
};

describe('StatCards', () => {
  it('displays all summary values', () => {
    render(<StatCards stats={mockStats} />);

    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('118')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('applies correct background colours', () => {
    render(<StatCards stats={mockStats} />);

    const totalCard = screen.getByText('200').closest('div');
    expect(totalCard).toHaveClass(
      'bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2',
    );
  });
});

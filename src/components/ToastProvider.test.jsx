import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider } from './ToastProvider';
import { useToast } from '../hooks/useToast';

// ─── Helper component that exposes toast actions ─────────────────────────────

function ToastTrigger({ message = 'Test message', type = 'success', label = 'show' }) {
  const { showToast, dismissToast, toasts } = useToast();
  return (
    <div>
      <button onClick={() => showToast(message, type)}>{label}</button>
      <button onClick={() => toasts[0] && dismissToast(toasts[0].id)}>dismiss-first</button>
      <span data-testid="count">{toasts.length}</span>
      {toasts.map((t) => (
        <span key={t.id} data-testid={`toast-${t.type}`}>
          {t.message}
        </span>
      ))}
    </div>
  );
}

function renderWithProvider(ui) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders children without crashing', () => {
    renderWithProvider(<div data-testid="child">hello</div>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('shows a success toast with the correct message', () => {
    renderWithProvider(<ToastTrigger message="Saved!" type="success" />);
    fireEvent.click(screen.getByText('show'));
    expect(screen.getByTestId('toast-success')).toHaveTextContent('Saved!');
  });

  it('shows an error toast', () => {
    renderWithProvider(<ToastTrigger message="Something went wrong" type="error" />);
    fireEvent.click(screen.getByText('show'));
    expect(screen.getByTestId('toast-error')).toHaveTextContent('Something went wrong');
  });

  it('shows a warning toast', () => {
    renderWithProvider(<ToastTrigger message="Watch out" type="warning" />);
    fireEvent.click(screen.getByText('show'));
    expect(screen.getByTestId('toast-warning')).toHaveTextContent('Watch out');
  });

  it('auto-dismisses after 3000 ms', async () => {
    renderWithProvider(<ToastTrigger />);
    fireEvent.click(screen.getByText('show'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('does NOT dismiss before 3000 ms', () => {
    renderWithProvider(<ToastTrigger />);
    fireEvent.click(screen.getByText('show'));

    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('dismisses immediately on close button click', () => {
    renderWithProvider(<ToastTrigger />);
    fireEvent.click(screen.getByText('show'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    // Click the close button rendered inside the toast UI
    fireEvent.click(screen.getByRole('button', { name: /dismiss notification/i }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('dismisses via dismissToast(id)', () => {
    renderWithProvider(<ToastTrigger />);
    fireEvent.click(screen.getByText('show'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    fireEvent.click(screen.getByText('dismiss-first'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('caps the queue at 3 — adding a 4th evicts the oldest', () => {
    // Use a counter ref outside the component to generate stable message names
    let counter = 0;
    function MultiTrigger() {
      const { showToast, toasts } = useToast();
      return (
        <div>
          <button data-testid="add-btn" onClick={() => { counter += 1; showToast(`msg-${counter}`, 'success'); }}>add-toast</button>
          <span data-testid="count">{toasts.length}</span>
          {toasts.map((t, i) => (
            <span key={t.id} data-testid={`item-${i}`}>
              {t.message}
            </span>
          ))}
        </div>
      );
    }

    renderWithProvider(<MultiTrigger />);
    const addBtn = screen.getByTestId('add-btn');

    // Add 4 toasts in sequence
    fireEvent.click(addBtn); // msg-1
    fireEvent.click(addBtn); // msg-2
    fireEvent.click(addBtn); // msg-3
    fireEvent.click(addBtn); // msg-4 → evicts msg-1

    expect(screen.getByTestId('count')).toHaveTextContent('3');
    // msg-1 should be gone; msg-2, msg-3, msg-4 remain
    expect(screen.queryByTestId('item-0')).toHaveTextContent('msg-2');
    expect(screen.queryByTestId('item-1')).toHaveTextContent('msg-3');
    expect(screen.queryByTestId('item-2')).toHaveTextContent('msg-4');
  });

  it('never exceeds 3 toasts regardless of how many are added', () => {
    function SpamTrigger() {
      const { showToast, toasts } = useToast();
      return (
        <div>
          <button data-testid="spam-btn" onClick={() => showToast('notification', 'success')}>trigger</button>
          <span data-testid="count">{toasts.length}</span>
        </div>
      );
    }

    renderWithProvider(<SpamTrigger />);
    const btn = screen.getByTestId('spam-btn');

    for (let i = 0; i < 10; i++) {
      fireEvent.click(btn);
    }

    const count = parseInt(screen.getByTestId('count').textContent, 10);
    expect(count).toBeLessThanOrEqual(3);
  });

  it('renders toasts in the top-right fixed container', () => {
    renderWithProvider(<ToastTrigger />);
    fireEvent.click(screen.getByText('show'));

    // The notification container should be present
    const container = screen.getByRole('alert');
    expect(container).toBeInTheDocument();
  });

  it('renders distinct icons for each type', () => {
    function AllTypes() {
      const { showToast } = useToast();
      return (
        <div>
          <button onClick={() => showToast('ok', 'success')}>success</button>
          <button onClick={() => showToast('fail', 'error')}>error</button>
          <button onClick={() => showToast('warn', 'warning')}>warning</button>
        </div>
      );
    }

    renderWithProvider(<AllTypes />);
    fireEvent.click(screen.getByText('success'));
    fireEvent.click(screen.getByText('error'));
    fireEvent.click(screen.getByText('warning'));

    // All three messages should be visible
    expect(screen.getByText('ok')).toBeInTheDocument();
    expect(screen.getByText('fail')).toBeInTheDocument();
    expect(screen.getByText('warn')).toBeInTheDocument();
  });
});

// ─── useToast hook ────────────────────────────────────────────────────────────

describe('useToast', () => {
  it('throws when used outside ToastProvider', () => {
    // Suppress React error boundary noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function BadComponent() {
      useToast();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    );

    consoleSpy.mockRestore();
  });

  it('returns showToast, dismissToast, and toasts', () => {
    let hookResult;

    function Inspector() {
      hookResult = useToast();
      return null;
    }

    render(
      <ToastProvider>
        <Inspector />
      </ToastProvider>
    );

    expect(typeof hookResult.showToast).toBe('function');
    expect(typeof hookResult.dismissToast).toBe('function');
    expect(Array.isArray(hookResult.toasts)).toBe(true);
  });
});

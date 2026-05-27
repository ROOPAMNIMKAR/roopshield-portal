/**
 * LoginPage unit tests
 *
 * Covers Requirements 2.1, 2.2, 2.3, 2.4
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import LoginPage from './LoginPage';
import { ToastContext } from '../../components/ToastProvider';
import useAuthStore from '../../store/authStore';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Render LoginPage inside a MemoryRouter with a ToastContext mock.
 * Returns the showToast spy and the navigate spy (via route tracking).
 */
function renderLoginPage({ loginResult = { success: false, error: 'Invalid credentials. Please try again.' } } = {}) {
  const showToast = vi.fn();
  const dismissToast = vi.fn();

  // Spy on the authStore login action
  const loginSpy = vi.fn().mockReturnValue(loginResult);
  useAuthStore.setState({ currentUser: null, login: loginSpy });

  let navigatedTo = null;

  const { unmount } = render(
    <ToastContext.Provider value={{ toasts: [], showToast, dismissToast }}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin/dashboard"
            element={<div data-testid="admin-dashboard">Admin Dashboard</div>}
          />
          <Route
            path="/intern/dashboard"
            element={<div data-testid="intern-dashboard">Intern Dashboard</div>}
          />
        </Routes>
      </MemoryRouter>
    </ToastContext.Provider>
  );

  return { showToast, loginSpy, unmount };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('LoginPage — Requirement 2.1: UI elements', () => {
  it('renders the RoopShield logo text', () => {
    renderLoginPage();
    expect(screen.getByText(/roopshield/i)).toBeInTheDocument();
  });

  it('renders the tagline "Empowering Tomorrow\'s Professionals"', () => {
    renderLoginPage();
    expect(
      screen.getByText("Empowering Tomorrow's Professionals")
    ).toBeInTheDocument();
  });

  it('renders an email input', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders a password input', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders Admin and Intern role toggle buttons', () => {
    renderLoginPage();
    expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /intern/i })).toBeInTheDocument();
  });

  it('renders a Sign In submit button', () => {
    renderLoginPage();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders a "Forgot password?" link/button', () => {
    renderLoginPage();
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('defaults the role toggle to Admin', () => {
    renderLoginPage();
    const adminBtn = screen.getByRole('button', { name: /admin/i });
    expect(adminBtn).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('LoginPage — Requirement 2.2: Client-side validation', () => {
  it('shows an error when email is empty on submit', async () => {
    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('shows an error when email format is invalid', async () => {
    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it('shows an error when password is empty on submit', async () => {
    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('does NOT call login() when validation fails', async () => {
    const { loginSpy } = renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('clears the email error when the user starts typing', async () => {
    renderLoginPage();
    // Trigger email error
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    // Start typing — error should disappear
    await userEvent.type(screen.getByLabelText(/email/i), 'a');
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });

  it('clears the password error when the user starts typing', async () => {
    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/password/i), 'x');
    expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
  });
});

describe('LoginPage — Requirement 2.3: Invalid credentials toast', () => {
  it('shows error toast when login returns failure', async () => {
    const { showToast, loginSpy } = renderLoginPage({
      loginResult: { success: false, error: 'Invalid credentials. Please try again.' },
    });

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith('wrong@example.com', 'wrongpass', 'admin');
    });

    expect(showToast).toHaveBeenCalledWith(
      'Invalid credentials. Please try again.',
      'error'
    );
  });

  it('stays on the login page when credentials are invalid', async () => {
    renderLoginPage({
      loginResult: { success: false, error: 'Invalid credentials. Please try again.' },
    });

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // The login form should still be visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
    expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('intern-dashboard')).not.toBeInTheDocument();
  });
});

describe('LoginPage — Requirement 2.4: Successful login navigation', () => {
  it('redirects Admin to /admin/dashboard on success', async () => {
    renderLoginPage({
      loginResult: { success: true, user: { id: '1', name: 'Priya', email: 'admin@roopshield.com', role: 'admin' } },
    });

    await userEvent.type(screen.getByLabelText(/email/i), 'admin@roopshield.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'admin123');
    // Role is already 'admin' by default
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByTestId('admin-dashboard')).toBeInTheDocument();
  });

  it('redirects Intern to /intern/dashboard on success', async () => {
    renderLoginPage({
      loginResult: { success: true, user: { id: '2', name: 'Rahul', email: 'intern@roopshield.com', role: 'intern' } },
    });

    await userEvent.type(screen.getByLabelText(/email/i), 'intern@roopshield.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'intern123');
    // Switch role to Intern
    fireEvent.click(screen.getByRole('button', { name: /intern/i }));
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByTestId('intern-dashboard')).toBeInTheDocument();
  });

  it('calls login() with trimmed email, password, and selected role', async () => {
    const { loginSpy } = renderLoginPage({
      loginResult: { success: true, user: { id: '1', name: 'Priya', email: 'admin@roopshield.com', role: 'admin' } },
    });

    await userEvent.type(screen.getByLabelText(/email/i), '  admin@roopshield.com  ');
    await userEvent.type(screen.getByLabelText(/password/i), 'admin123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith('admin@roopshield.com', 'admin123', 'admin');
    });
  });
});

describe('LoginPage — Role toggle interaction', () => {
  it('switches role to Intern when Intern button is clicked', () => {
    renderLoginPage();
    const internBtn = screen.getByRole('button', { name: /intern/i });
    fireEvent.click(internBtn);
    expect(internBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /admin/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches role back to Admin when Admin button is clicked', () => {
    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: /intern/i }));
    fireEvent.click(screen.getByRole('button', { name: /admin/i }));
    expect(screen.getByRole('button', { name: /admin/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /intern/i })).toHaveAttribute('aria-pressed', 'false');
  });
});

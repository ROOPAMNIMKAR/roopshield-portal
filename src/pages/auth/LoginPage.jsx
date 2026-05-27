import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { authApi } from '../../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(email, password) {
  const errors = {};
  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  }
  return errors;
}

// ─── Forgot Password Modal ────────────────────────────────────────────────────

function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!EMAIL_REGEX.test(email.trim())) { setError('Enter a valid email.'); return; }

    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <h2 className="text-xl font-bold mb-1" style={{ color: '#0A2240' }}>Forgot Password</h2>

        {sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📧</div>
            <p className="text-sm text-gray-600 mb-4">
              If <strong>{email}</strong> is registered, a password reset link has been sent.
              Check your inbox (and spam folder).
            </p>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: '#0A2240' }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              Enter your registered email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} noValidate>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className={`w-full rounded-lg border px-3 py-2 text-sm mb-1 focus:outline-none focus:ring-2 transition
                  ${error ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'}`}
              />
              {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: '#1D6FA4' }}
                >
                  {loading ? 'Sending…' : 'Send Link'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── LoginPage ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const result = await login(email.trim(), password, role);

    setIsSubmitting(false);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (result.user.role === 'hr') {
        navigate('/hr/dashboard', { replace: true });
      } else {
        navigate('/intern/dashboard', { replace: true });
      }
    } else {
      showToast(result.error || 'Invalid credentials. Please try again.', 'error');
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0A2240' }}
    >
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      {/* Login card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl px-8 py-10">

        {/* Logo + tagline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#0A2240' }}>
            <span aria-hidden="true">Roop<span style={{ color: '#1D6FA4' }}>Shield</span></span>
            <span className="sr-only">RoopShield</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Empowering Tomorrow's Professionals
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="you@example.com"
              className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 transition
                ${errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'}`}
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-xs font-medium text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                placeholder="••••••••"
                className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 transition
                  ${errors.password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'}`}
                aria-describedby={errors.password ? 'password-error' : undefined}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" role="alert" className="mt-1 text-xs font-medium text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          {/* Role toggle */}
          <div className="mb-6">
            <span className="block text-sm font-semibold text-gray-700 mb-2">Sign in as</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-300" role="group" aria-label="Select role">
              {['admin', 'hr', 'intern'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400
                    ${role === r ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  style={role === r ? { backgroundColor: '#1D6FA4' } : {}}
                  aria-pressed={role === r}
                >
                  {r === 'hr' ? 'HR' : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Sign In button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-opacity
              hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#0A2240' }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>

        </form>

        {/* Forgot password */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="text-sm font-medium hover:underline focus:outline-none focus:underline"
            style={{ color: '#1D6FA4' }}
          >
            Forgot password?
          </button>
        </div>

      </div>
    </div>
  );
}

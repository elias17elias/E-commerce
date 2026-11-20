import { useState } from 'react';
import { ArrowRight, Leaf, LoaderCircle, X } from 'lucide-react';
import { api } from '../api.js';

function AuthModal({ mode, onModeChange, onClose, onAuthenticated, onNotice }) {
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const update = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === 'reset') {
        const resetToken = new URLSearchParams(window.location.search).get('token');
        if (!resetToken) {
          throw new Error('This password reset link is missing its token.');
        }
        await api('/auth/reset-password', {
          body: { token: resetToken, newPassword: values.password },
        });
        window.history.replaceState({}, '', '/');
        onNotice('Your password has been updated. Sign in with your new password.');
        onModeChange('login');
        return;
      }

      if (mode === 'forgot') {
        const result = await api('/auth/forgot-password', {
          body: { email: values.email },
        });
        onNotice(result.message || 'If an account exists, we sent a reset link.');
        onClose();
        return;
      }

      if (mode === 'register') {
        await api('/auth/register', {
          body: { name: values.name.trim(), email: values.email.trim(), password: values.password },
        });
      }

      const session = await api('/auth/login', {
        body: { email: values.email.trim(), password: values.password },
      });
      await onAuthenticated(session.accessToken);
      onClose();
    } catch (error) {
      onNotice(error.message || 'Unable to continue. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const isForgot = mode === 'forgot';
  const isReset = mode === 'reset';
  const isRegister = mode === 'register';
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="relative w-full max-w-[440px] rounded-[28px] bg-white p-6 shadow-soft sm:p-9" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button onClick={onClose} aria-label="Close dialog" className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-paper text-muted hover:text-ink">
          <X size={17} />
        </button>
        <div className="mb-7 grid h-12 w-12 place-items-center rounded-2xl bg-lime/70 text-forest">
          <Leaf size={23} />
        </div>
        <p className="eyebrow mb-2">{isForgot || isReset ? 'A fresh start' : isRegister ? 'Join the good list' : 'Welcome back'}</p>
        <h2 id="auth-title" className="font-display text-3xl font-extrabold tracking-[-0.05em] text-ink">
          {isForgot || isReset ? 'Reset your password' : isRegister ? 'Make yourself at home.' : 'Good to see you.'}
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
          {isForgot ? 'We’ll email you a secure link if an account matches.' : isReset ? 'Choose a new password for your account.' : isRegister ? 'Create an account to check out and keep track of your balance.' : 'Sign in to pick up where you left off.'}
        </p>
        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="field-label">
              Your name
              <input required maxLength={100} value={values.name} onChange={update('name')} autoComplete="name" className="field-input" placeholder="Alex Morgan" />
            </label>
          )}
          {!isReset && (
            <label className="field-label">
              Email address
              <input required type="email" value={values.email} onChange={update('email')} autoComplete="email" className="field-input" placeholder="you@example.com" />
            </label>
          )}
          {!isForgot && (
            <label className="field-label">
              {isReset ? 'New password' : 'Password'}
              <input required type="password" minLength={isRegister || isReset ? 8 : undefined} maxLength={128} value={values.password} onChange={update('password')} autoComplete={isRegister || isReset ? 'new-password' : 'current-password'} className="field-input" placeholder={isRegister || isReset ? 'At least 8 characters' : 'Your password'} />
            </label>
          )}
          <button type="submit" disabled={busy} className="primary-button mt-2 w-full">
            {busy ? <LoaderCircle size={17} className="animate-spin" /> : null}
            {isForgot ? 'Send reset link' : isReset ? 'Update password' : isRegister ? 'Create account' : 'Sign in'}
            {!busy && <ArrowRight size={16} />}
          </button>
        </form>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          {!isRegister && !isForgot && !isReset && (
            <button type="button" onClick={() => onModeChange('forgot')} className="font-semibold text-forest hover:underline">
              Forgot password?
            </button>
          )}
          {(isForgot || isReset) ? (
            <button type="button" onClick={() => onModeChange('login')} className="ml-auto font-semibold text-forest hover:underline">Back to sign in</button>
          ) : (
            <button type="button" onClick={() => onModeChange(isRegister ? 'login' : 'register')} className="ml-auto font-semibold text-forest hover:underline">
              {isRegister ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export default AuthModal;

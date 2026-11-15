import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  WalletCards,
} from 'lucide-react';

const pageCopy = {
  login: {
    eyebrow: 'WELCOME BACK',
    title: 'Your money, in focus.',
    description: 'Sign in to pick up where you left off.',
    submit: 'Sign in',
  },
  register: {
    eyebrow: 'START WITH CLARITY',
    title: 'Make room for better money habits.',
    description: 'Create your secure Spendly account.',
    submit: 'Create account',
  },
  forgot: {
    eyebrow: 'ACCOUNT RECOVERY',
    title: 'A fresh start is one email away.',
    description: 'We’ll send a secure link if an account exists for that address.',
    submit: 'Send reset link',
  },
  'update-password': {
    eyebrow: 'SECURE YOUR ACCOUNT',
    title: 'Choose a new password.',
    description: 'Use at least eight characters to protect your account.',
    submit: 'Update password',
  },
};

export default function AuthPage({
  onSignIn,
  onSignUp,
  onRequestPasswordReset,
  onUpdatePassword,
  onContinueDemo,
  authError = '',
  configurationError = '',
  passwordRecovery = false,
  onClearError,
}) {
  const [mode, setMode] = useState(passwordRecovery ? 'update-password' : 'login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const emailRef = useRef(null);
  const page = pageCopy[mode];
  const visibleError = formError || authError;
  const secureAccountMode = !configurationError;

  useEffect(() => {
    emailRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (passwordRecovery) setMode('update-password');
  }, [passwordRecovery]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setFormError('');
    setMessage('');
    setPassword('');
    setConfirmPassword('');
    onClearError?.();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setMessage('');
    setSubmitting(true);

    try {
      if (mode !== 'update-password' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw new Error('Enter a valid email address.');
      }
      if (mode === 'register') {
        if (!fullName.trim()) throw new Error('Enter your full name.');
        if (password.length < 8) throw new Error('Use a password with at least eight characters.');
        if (password !== confirmPassword) throw new Error('Your passwords do not match.');
        const result = await onSignUp(fullName, email.trim(), password);
        if (!result.session) {
          setMessage('Your account was created. Check your email to confirm it before signing in.');
        }
      } else if (mode === 'forgot') {
        await onRequestPasswordReset(email.trim());
        setMessage('If an account exists for that email, a secure reset link is on its way.');
      } else if (mode === 'update-password') {
        if (password.length < 8) throw new Error('Use a password with at least eight characters.');
        if (password !== confirmPassword) throw new Error('Your passwords do not match.');
        await onUpdatePassword(password);
        setMessage('Your password has been updated. You can continue to Spendly.');
      } else {
        if (!password) throw new Error('Enter your password.');
        await onSignIn(email.trim(), password, rememberMe);
      }
    } catch (error) {
      setFormError(error.message || 'We could not complete that request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <header className="auth-brand">
        <div className="auth-brand-mark"><WalletCards size={21} /></div>
        <div>
          <strong>spendly<span>.</span></strong>
          <small>Smart Money. Better Decisions.</small>
        </div>
      </header>

      <div className="auth-layout">
        <section className="auth-story" aria-label="Spendly benefits">
          <span className="auth-story-eyebrow"><span /> A CLEARER WAY TO MANAGE MONEY</span>
          <h1>Small steps.<br /><span>Stronger finances.</span></h1>
          <p>Bring your everyday money into one calm, clear view. Spendly helps you build a better relationship with every dollar.</p>
          <div className="auth-trust-card">
            <div className="auth-trust-icon"><ShieldCheck size={18} /></div>
            <div>
              <strong>{secureAccountMode ? 'Private by design' : 'Supabase-ready accounts'}</strong>
              <span>{secureAccountMode
                ? 'Your account transactions are isolated with Supabase authentication and row-level security.'
                : 'Configure Supabase to enable private accounts. The local demo uses shared sample data.'}</span>
            </div>
          </div>
          <div className="auth-story-foot"><span>01</span><i /><span>SMART MONEY. BETTER DECISIONS.</span></div>
        </section>

        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-card-glow" />
          <div className="auth-card-content">
            <div className="auth-card-eyebrow">{page.eyebrow}</div>
            <h2 id="auth-title">{page.title}</h2>
            <p className="auth-card-description">{page.description}</p>

            {configurationError && (
              <div className="auth-config-note" role="status">
                <LockKeyhole size={16} />
                <span>{configurationError}</span>
              </div>
            )}
            {visibleError && <p className="auth-error" role="alert">{visibleError}</p>}
            {message && <p className="auth-success" role="status"><CheckCircle2 size={16} />{message}</p>}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {mode === 'register' && (
                <label className="auth-field">
                  <span>Full name</span>
                  <span className="auth-input-wrap">
                    <UserRound size={17} />
                    <input
                      autoComplete="name"
                      maxLength={80}
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Your name"
                    />
                  </span>
                </label>
              )}

              {mode !== 'update-password' && (
                <label className="auth-field">
                  <span>Email address</span>
                  <span className="auth-input-wrap">
                    <Mail size={17} />
                    <input
                      ref={emailRef}
                      autoComplete="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                    />
                  </span>
                </label>
              )}

              {mode !== 'forgot' && (
                <label className="auth-field">
                  <span>{mode === 'update-password' ? 'New password' : 'Password'}</span>
                  <span className="auth-input-wrap">
                    <LockKeyhole size={17} />
                    <input
                      autoComplete={mode === 'register' || mode === 'update-password' ? 'new-password' : 'current-password'}
                      minLength={8}
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={mode === 'login' ? 'Enter your password' : 'At least 8 characters'}
                    />
                    <button
                      className="auth-password-toggle"
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((shown) => !shown)}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </span>
                </label>
              )}

              {(mode === 'register' || mode === 'update-password') && (
                <label className="auth-field">
                  <span>Confirm password</span>
                  <span className="auth-input-wrap">
                    <LockKeyhole size={17} />
                    <input
                      autoComplete="new-password"
                      minLength={8}
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Enter your password again"
                    />
                    <button
                      className="auth-password-toggle"
                      type="button"
                      aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                      onClick={() => setShowConfirmPassword((shown) => !shown)}
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </span>
                </label>
              )}

              {mode === 'login' && (
                <div className="auth-form-options">
                  <label className="auth-remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Remember me</span></label>
                  <button type="button" className="auth-text-button" onClick={() => changeMode('forgot')}>Forgot password?</button>
                </div>
              )}

              <button className="auth-submit" type="submit" disabled={submitting}>
                {submitting ? 'Please wait…' : page.submit}
                {!submitting && <ArrowRight size={17} />}
              </button>
            </form>

            {mode === 'login' && (
              <p className="auth-switch">New to Spendly? <button type="button" onClick={() => changeMode('register')}>Create an account</button></p>
            )}
            {mode === 'register' && (
              <p className="auth-switch">Already have an account? <button type="button" onClick={() => changeMode('login')}>Sign in</button></p>
            )}
            {(mode === 'forgot' || mode === 'update-password') && (
              <button className="auth-back-link" type="button" onClick={() => changeMode('login')}><ArrowLeft size={15} /> Back to sign in</button>
            )}

            {onContinueDemo && (
              <div className="auth-demo">
                <span>Just exploring?</span>
                <button type="button" onClick={onContinueDemo}>Continue with demo data <ArrowRight size={14} /></button>
              </div>
            )}
            <div className="auth-card-footer"><LockKeyhole size={13} /><span>{secureAccountMode ? 'Encrypted sessions. Your data stays yours.' : 'Account protection activates after Supabase setup.'}</span></div>
          </div>
        </section>
      </div>
      <footer className="auth-footer"><span>© {new Date().getFullYear()} Spendly</span><span>Thoughtful tools for your financial life</span></footer>
    </main>
  );
}

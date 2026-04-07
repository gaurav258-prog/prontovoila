import { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ArchIcon from '../components/ArchIcon';
import '../styles/app.css';

export default function LoginPage() {
  const { isLoggedIn, signup, login, loginWithGoogle, resetPassword, updatePassword, loading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset-password'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Handle URL params from email verification and password reset callbacks
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccess('Email verified successfully! You can now sign in.');
      setMode('signin');
    }
    if (searchParams.get('reset') === 'true') {
      setMode('reset-password');
      setSuccess('Enter your new password below.');
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--ink3)' }}>Loading...</div>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  const clearMessages = () => { setError(''); setSuccess(''); };
  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimEmail = email.trim().toLowerCase();
    const trimName = name.trim();

    if (!trimName) { setError('Please enter your full name.'); return; }
    if (!trimEmail) { setError('Please enter your email address.'); return; }
    if (!validateEmail(trimEmail)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setSubmitting(true);
    const result = await signup(trimEmail, trimName, password);
    setSubmitting(false);

    if (result.success) {
      if (result.needsVerification) {
        setSuccess('Account created! Please check your email to verify your address.');
        setMode('signin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Signup failed.');
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimEmail = email.trim().toLowerCase();

    if (!trimEmail) { setError('Please enter your email address.'); return; }
    if (!validateEmail(trimEmail)) { setError('Please enter a valid email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setSubmitting(true);
    const result = await login(trimEmail, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimEmail = email.trim().toLowerCase();

    if (!trimEmail) { setError('Please enter your email address.'); return; }
    if (!validateEmail(trimEmail)) { setError('Please enter a valid email address.'); return; }

    setSubmitting(true);
    const result = await resetPassword(trimEmail);
    setSubmitting(false);

    if (result.success) {
      setSuccess('Password reset link sent! Check your email.');
    } else {
      setError(result.error || 'Failed to send reset email.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setSubmitting(true);
    const result = await updatePassword(password);
    setSubmitting(false);

    if (result.success) {
      setSuccess('Password updated successfully! You can now sign in.');
      setMode('signin');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error || 'Failed to update password.');
    }
  };

  const handleGoogleSignin = async () => {
    setSubmitting(true);
    const result = await loginWithGoogle();
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Google sign-in failed.');
    }
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'forgot' | 'reset-password') => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--cream)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <ArchIcon size={36} />
            <div className="wordmark" style={{ fontSize: 32 }}>
              Pronto<em>Voil&agrave;</em>
            </div>
          </Link>
          <div style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 4 }}>
            Fill any form, in any language
          </div>
        </div>

        {/* Mode tabs — only show for signin/signup */}
        {(mode === 'signin' || mode === 'signup') && (
          <div style={{ display: 'flex', marginBottom: 0, borderBottom: '2px solid var(--border-light)' }}>
            <button
              onClick={() => switchMode('signin')}
              style={{
                flex: 1, padding: '12px 0', fontSize: 14, fontWeight: mode === 'signin' ? 600 : 400,
                color: mode === 'signin' ? 'var(--navy)' : 'var(--ink4)',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: mode === 'signin' ? '2px solid var(--gold)' : '2px solid transparent',
                marginBottom: -2, fontFamily: 'var(--sans)',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              style={{
                flex: 1, padding: '12px 0', fontSize: 14, fontWeight: mode === 'signup' ? 600 : 400,
                color: mode === 'signup' ? 'var(--navy)' : 'var(--ink4)',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: mode === 'signup' ? '2px solid var(--gold)' : '2px solid transparent',
                marginBottom: -2, fontFamily: 'var(--sans)',
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Card */}
        <div className="card" style={{ borderTopLeftRadius: (mode === 'signin' || mode === 'signup') ? 0 : undefined, borderTopRightRadius: (mode === 'signin' || mode === 'signup') ? 0 : undefined }}>

          {/* Success message */}
          {success && (
            <div style={{ fontSize: 12, color: 'var(--navy)', marginBottom: 12, padding: '10px 12px', background: '#e8f5e9', borderRadius: 'var(--rad)', border: '1px solid #c8e6c9' }}>
              {success}
            </div>
          )}

          {mode === 'signup' ? (
            /* ── SIGNUP FORM ── */
            <form onSubmit={handleSignup}>
              <div className="card-title" style={{ fontSize: 20, marginBottom: 4 }}>Create your account</div>
              <div className="card-sub">Get started filling forms in any language.</div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4, display: 'block' }}>Full name</label>
                <input
                  className="chat-in" type="text" placeholder="e.g. Maria Garcia"
                  value={name} onChange={(e) => { setName(e.target.value); clearMessages(); }}
                  style={{ width: '100%', padding: '11px 14px' }} autoFocus
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4, display: 'block' }}>Email address</label>
                <input
                  className="chat-in" type="email" placeholder="your.email@example.com"
                  value={email} onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                  style={{ width: '100%', padding: '11px 14px' }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4, display: 'block' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="chat-in" type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters"
                    value={password} onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                    style={{ width: '100%', padding: '11px 14px', paddingRight: 48 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--ink4)', fontFamily: 'var(--sans)' }}
                  >{showPassword ? 'Hide' : 'Show'}</button>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4, display: 'block' }}>Confirm password</label>
                <input
                  className="chat-in" type={showPassword ? 'text' : 'password'} placeholder="Re-enter your password"
                  value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); clearMessages(); }}
                  style={{ width: '100%', padding: '11px 14px' }}
                />
              </div>

              {error && <div style={{ fontSize: 12, color: 'var(--err)', marginBottom: 12, padding: '8px 12px', background: 'var(--err-bg)', borderRadius: 'var(--rad)' }}>{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={submitting}
                style={{ width: '100%', padding: '13px 20px', fontSize: 14, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

          ) : mode === 'forgot' ? (
            /* ── FORGOT PASSWORD ── */
            <form onSubmit={handleForgotPassword}>
              <div className="card-title" style={{ fontSize: 20, marginBottom: 4 }}>Reset your password</div>
              <div className="card-sub">Enter your email and we'll send you a reset link.</div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4, display: 'block' }}>Email address</label>
                <input
                  className="chat-in" type="email" placeholder="your.email@example.com"
                  value={email} onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                  style={{ width: '100%', padding: '11px 14px' }} autoFocus
                />
              </div>

              {error && <div style={{ fontSize: 12, color: 'var(--err)', marginBottom: 12, padding: '8px 12px', background: 'var(--err-bg)', borderRadius: 'var(--rad)' }}>{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={submitting}
                style={{ width: '100%', padding: '13px 20px', fontSize: 14, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Sending...' : 'Send reset link'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button onClick={() => switchMode('signin')}
                  style={{ fontSize: 12, color: 'var(--ink4)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--sans)' }}
                >
                  Back to sign in
                </button>
              </div>
            </form>

          ) : mode === 'reset-password' ? (
            /* ── SET NEW PASSWORD ── */
            <form onSubmit={handleResetPassword}>
              <div className="card-title" style={{ fontSize: 20, marginBottom: 4 }}>Set new password</div>
              <div className="card-sub">Choose a strong password for your account.</div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4, display: 'block' }}>New password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="chat-in" type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters"
                    value={password} onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                    style={{ width: '100%', padding: '11px 14px', paddingRight: 48 }} autoFocus
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--ink4)', fontFamily: 'var(--sans)' }}
                  >{showPassword ? 'Hide' : 'Show'}</button>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4, display: 'block' }}>Confirm new password</label>
                <input
                  className="chat-in" type={showPassword ? 'text' : 'password'} placeholder="Re-enter your password"
                  value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); clearMessages(); }}
                  style={{ width: '100%', padding: '11px 14px' }}
                />
              </div>

              {error && <div style={{ fontSize: 12, color: 'var(--err)', marginBottom: 12, padding: '8px 12px', background: 'var(--err-bg)', borderRadius: 'var(--rad)' }}>{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={submitting}
                style={{ width: '100%', padding: '13px 20px', fontSize: 14, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Updating...' : 'Update password'}
              </button>
            </form>

          ) : (
            /* ── SIGNIN FORM ── */
            <form onSubmit={handleSignin}>
              <div className="card-title" style={{ fontSize: 20, marginBottom: 4 }}>Welcome back</div>
              <div className="card-sub">Sign in to continue filling forms.</div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4, display: 'block' }}>Email address</label>
                <input
                  className="chat-in" type="email" placeholder="your.email@example.com"
                  value={email} onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                  style={{ width: '100%', padding: '11px 14px' }} autoFocus
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4, display: 'block' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="chat-in" type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                    value={password} onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                    style={{ width: '100%', padding: '11px 14px', paddingRight: 48 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--ink4)', fontFamily: 'var(--sans)' }}
                  >{showPassword ? 'Hide' : 'Show'}</button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginBottom: 16 }}>
                <button type="button" onClick={() => switchMode('forgot')}
                  style={{ fontSize: 11, color: 'var(--ink4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)', textDecoration: 'underline' }}
                >
                  Forgot password?
                </button>
              </div>

              {error && <div style={{ fontSize: 12, color: 'var(--err)', marginBottom: 12, padding: '8px 12px', background: 'var(--err-bg)', borderRadius: 'var(--rad)' }}>{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={submitting}
                style={{ width: '100%', padding: '13px 20px', fontSize: 14, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          {/* Google OAuth — show on signin/signup only */}
          {(mode === 'signin' || mode === 'signup') && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.5rem 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                <span style={{ fontSize: 11, color: 'var(--ink4)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
              </div>

              <button
                className="btn btn-ghost"
                style={{ width: '100%', padding: '12px 20px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                onClick={handleGoogleSignin}
                disabled={submitting}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" style={{ fontSize: 12, color: 'var(--ink4)', textDecoration: 'none' }}>
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

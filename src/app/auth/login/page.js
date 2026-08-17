'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'
import HeroCanvas from '@/components/HeroCanvas'
import { Mail, Lock, ChevronRight, ArrowLeft, Eye, EyeOff, Zap, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })
      if (error) throw error
      if (data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })
        window.location.replace('/dashboard')
      } else {
        setError('Login failed. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="eh-auth-page" style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>

      {/* Visual branding panel */}
      <div className="eh-auth-visual">
        <div className="eh-auth-visual-bg" aria-hidden="true">
          <div className="eh-auth-blob eh-auth-blob-1" />
          <div className="eh-auth-blob eh-auth-blob-2" />
          <div className="eh-auth-grid" />
        </div>
        <HeroCanvas />

        <div className="eh-auth-visual-content">
          <Logo height={34} linkTo="/" />
          <h2 className="eh-auth-visual-heading">
            Your time is <span className="eh-gradient-text">worth more</span> than you think.
          </h2>
          <p className="eh-auth-visual-sub">
            Join a community trading real skills for real opportunity — no cash required.
          </p>

          <div className="eh-auth-float-card eh-auth-float-1">
            <Zap size={14} style={{ color: 'var(--brand)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text)' }}>1,240 SPK</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-3)' }}>Sparks Balance</div>
            </div>
          </div>
          <div className="eh-auth-float-card eh-auth-float-2">
            <ShieldCheck size={14} style={{ color: 'var(--green)' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text)' }}>Verified Community</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-3)' }}>Skill-checked members</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="eh-auth-form-panel">
        <div className="eh-auth-form-inner">
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-3)', fontSize: '0.825rem', fontWeight: 500, marginBottom: '2rem', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to home
          </a>

          <div className="eh-auth-mobile-logo">
            <Logo height={30} linkTo="/" />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem', color: 'var(--text)' }}>Welcome back</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>
              New here? <a href="/auth/signup" style={{ color: 'var(--brand)', fontWeight: 600 }}>Create an account</a>
            </p>
          </div>

          <div className="eh-auth-card">
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}>
                    <Mail size={15} />
                  </div>
                  <input
                    type="email" required placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="eh-auth-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}>
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'} required placeholder="Your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="eh-auth-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
                      display: 'flex', padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.825rem', marginBottom: '1rem', fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="eh-auth-submit">
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ChevronRight size={15} />}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <a href="/auth/forgot-password" style={{ color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 600 }}>
                Forgot password?
              </a>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
            Protected with Care
          </p>
        </div>
      </div>

      <style>{`
        .eh-auth-mobile-logo { display: none; margin-bottom: 1.5rem; }

        .eh-auth-visual {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          background: var(--surface);
          border-right: 1px solid var(--border);
        }
        .eh-auth-visual-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .eh-auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: eh-auth-blob-float 16s ease-in-out infinite;
        }
        .eh-auth-blob-1 { width: 340px; height: 340px; background: var(--brand); top: -80px; left: -60px; }
        .eh-auth-blob-2 { width: 260px; height: 260px; background: var(--amber); bottom: -60px; right: -40px; animation-duration: 20s; animation-delay: -4s; }
        @keyframes eh-auth-blob-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(24px, 20px) scale(1.1); }
        }
        .eh-auth-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(var(--border-2) 1px, transparent 1px);
          background-size: 26px 26px;
          opacity: 0.3;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 85%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 85%);
        }

        .eh-auth-visual-content {
          position: relative;
          z-index: 1;
          padding: 3rem 3.5rem;
          max-width: 460px;
        }
        .eh-auth-visual-heading {
          font-size: clamp(1.6rem, 2.6vw, 2.1rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.25;
          color: var(--text);
          margin: 1.75rem 0 0.9rem;
        }
        .eh-auth-visual-sub {
          color: var(--text-2);
          font-size: 0.9rem;
          line-height: 1.65;
          margin-bottom: 2.5rem;
        }
        .eh-gradient-text {
          background: linear-gradient(90deg, var(--brand), var(--green), var(--amber), var(--brand));
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: eh-gradient-shift 6s ease infinite;
        }
        @keyframes eh-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .eh-auth-float-card {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 0.65rem 1rem;
          box-shadow: 0 10px 28px rgba(0,0,0,0.12);
          animation: eh-auth-float-bob 6s ease-in-out infinite;
        }
        .eh-auth-float-1 { display: flex; margin-bottom: 0.75rem; }
        .eh-auth-float-2 { display: flex; animation-delay: -3s; }
        @keyframes eh-auth-float-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .eh-auth-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .eh-auth-form-inner {
          width: 100%;
          max-width: 400px;
          animation: eh-auth-form-in 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes eh-auth-form-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .eh-auth-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow, 0 8px 24px rgba(0,0,0,0.08));
        }

        .eh-auth-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--surface-2);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text);
          font-size: 0.9rem;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .eh-auth-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(13,115,119,0.12);
        }

        .eh-auth-submit {
          width: 100%;
          padding: 0.875rem;
          background: var(--brand);
          color: white;
          border: none;
          border-radius: var(--radius);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-family: inherit;
          box-shadow: var(--shadow-brand, 0 6px 16px rgba(13,115,119,0.3));
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .eh-auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        .eh-auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .eh-auth-visual { display: none; }
          .eh-auth-mobile-logo { display: block; }
        }

        @media (prefers-reduced-motion: reduce) {
          .eh-auth-blob, .eh-gradient-text, .eh-auth-float-card, .eh-auth-form-inner {
            animation: none !important;
          }
          .eh-auth-submit:hover:not(:disabled) {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  )
}

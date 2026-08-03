'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Logo height={32} linkTo="/" />
        </div>

        {sent ? (
          <>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Mail size={22} style={{ color: 'var(--green)' }} />
            </div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text)' }}>Check your email</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              If an account exists for <strong>{email}</strong>, we've sent a link to reset your password. It may take a minute to arrive — check spam too.
            </p>
            <a href="/auth/login" style={{ color: 'var(--brand)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowLeft size={15} /> Back to login
            </a>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text)' }}>Reset your password</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className="form-input" style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <a href="/auth/login" style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.5rem' }}>
              <ArrowLeft size={14} /> Back to login
            </a>
          </>
        )}
      </div>
    </div>
  )
}

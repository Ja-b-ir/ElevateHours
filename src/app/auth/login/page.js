'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      if (error) throw error
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0D7377 0%, #14A085 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: '2.5rem',
        width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Elevate<span style={{ color: '#F5A623' }}>Hours</span>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>Welcome Back</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Log in to your ElevateHours account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Email</label>
            <input
              type="email" required placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Password</label>
            <input
              type="password" required placeholder="Your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem', background: '#fee2e2', padding: '0.75rem', borderRadius: 8 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '0.85rem', background: '#0D7377',
            color: 'white', border: 'none', borderRadius: 10, fontWeight: 700,
            fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
          New to ElevateHours?{' '}
          <a href="/auth/signup" style={{ color: '#0D7377', fontWeight: 600 }}>Sign up here</a>
        </p>
      </div>
    </div>
  )
}

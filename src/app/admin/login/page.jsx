'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const email = loginId.includes('@') ? loginId : `${loginId}@admin.elevatehours.internal`

      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError('Incorrect login ID or password.')
        setLoading(false)
        return
      }

      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!adminRow) {
        await supabase.auth.signOut()
        setError('This account does not have admin access.')
        setLoading(false)
        return
      }

      router.push('/admin/dashboard')
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg, #f7f8f5)', padding: '1.5rem' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%', maxWidth: 380, background: 'var(--surface, #fff)', border: '1px solid var(--border, #e2e2e2)',
          borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-light, #e6f2f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={20} style={{ color: 'var(--brand, #0b7375)' }} />
          </div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Admin Login</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-3, #888)', margin: 0 }}>ElevateHours staff access</p>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-2, #555)' }}>Login ID</label>
          <input
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
            autoComplete="username"
            style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: 8, border: '1px solid var(--border, #e2e2e2)', fontSize: '0.875rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-2, #555)' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: 8, border: '1px solid var(--border, #e2e2e2)', fontSize: '0.875rem', boxSizing: 'border-box' }}
          />
        </div>

        {error && <div style={{ color: '#d33', fontSize: '0.8rem', fontWeight: 600 }}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.8rem', borderRadius: 10, background: 'var(--brand, #0b7375)', color: 'white', border: 'none',
            fontWeight: 700, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

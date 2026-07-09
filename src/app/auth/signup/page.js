'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Mail, Lock, Phone, ChevronRight } from 'lucide-react'

export default function SignupPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', account_type: 'Personal', whatsapp_number: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { emailRedirectTo: undefined, data: { full_name: form.full_name, account_type: form.account_type } }
      })
      if (error) throw error
      if (data?.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, email: form.email, full_name: form.full_name, account_type: form.account_type, whatsapp_number: form.whatsapp_number, sparks_purchased_total: 250 })
        window.location.href = '/dashboard'
      } else { setError('Signup failed. Please try again.') }
    } catch (err) { setError(err.message || JSON.stringify(err)) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* Left panel */}
      <div style={{ flex: 1, background: 'linear-gradient(145deg, var(--brand) 0%, var(--brand-mid) 60%, var(--brand-mid) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', color: 'white' }} className="auth-left">
        <div style={{ maxWidth: 400 }}>
          <div style={{ fontWeight: 900, fontSize: '1.75rem', letterSpacing: '-0.03em', marginBottom: '2.5rem' }}>
            Elevate<span style={{ color: 'var(--amber)' }}>Hours</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
            Start turning your skills into real opportunity.
          </h2>
          <p style={{ opacity: 0.8, lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '2rem' }}>
            Join a community where your time is currency. Earn Sparks, build your verified portfolio, and connect with organizations that need your skills.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['250 SPK welcome bonus on signup', 'Verified certificates for every job', 'Work and Education in one platform'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ChevronRight size={12} />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2.5rem', background: 'var(--surface)', overflowY: 'auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Create your account</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Already have one? <a href="/auth/login" style={{ color: 'var(--brand)', fontWeight: 600 }}>Sign in</a></p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Your full name', icon: User },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com', icon: Mail },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Minimum 6 characters', icon: Lock },
            { label: 'WhatsApp Number', key: 'whatsapp_number', type: 'tel', placeholder: '+880 1XXX XXXXXX', icon: Phone, note: 'Hidden from public — used for direct contact only' },
          ].map(({ label, key, type, placeholder, icon: Icon, note }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}>
                  <Icon size={15} />
                </div>
                <input type={type} required placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className="form-input" style={{ paddingLeft: '2.5rem' }} />
              </div>
              {note && <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.35rem' }}>{note}</p>}
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { value: 'Personal', label: 'Personal', sub: 'Student / Freelancer' },
                { value: 'Organization', label: 'Organization', sub: 'Startup / NGO' }
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => setForm({ ...form, account_type: opt.value })} style={{
                  padding: '0.875rem', borderRadius: 'var(--radius)', border: `2px solid ${form.account_type === opt.value ? 'var(--brand)' : 'var(--border)'}`,
                  background: form.account_type === opt.value ? 'var(--brand-light)' : 'var(--surface-2)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all var(--transition)'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: form.account_type === opt.value ? 'var(--brand)' : 'var(--text)', marginBottom: '0.2rem' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '0.9rem', borderRadius: 'var(--radius)' }}>
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <ChevronRight size={15} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-left { display: none !important; } }
      `}</style>
    </div>
  )
}

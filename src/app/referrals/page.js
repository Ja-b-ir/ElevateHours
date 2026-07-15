'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Gift, Copy, Check, Users, Zap } from 'lucide-react'

export default function ReferralsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [referred, setReferred] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [link, setLink] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      setLink(window.location.origin + '/auth/signup?ref=' + user.id)

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, account_type')
        .eq('referred_by', user.id)
        .order('id', { ascending: false })
      setReferred(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const copyLink = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading...</div></div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap" style={{ maxWidth: 720 }}>
        <div className="page-header">
          <h1 className="page-title">Invite Friends, Earn Sparks</h1>
          <p className="page-subtitle">Share your link — you get 100 SPK, they get 300 SPK to start instead of 250.</p>
        </div>

        <div className="card-brand" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Gift size={22} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Your Referral Link</span>
          </div>
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            <input
              readOnly
              value={link}
              onClick={e => e.target.select()}
              style={{ flex: 1, minWidth: 200, padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '0.85rem' }}
            />
            <button onClick={copyLink} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-sm)', border: 'none', background: 'white', color: 'var(--brand)',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap'
            }}>
              {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy Link'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <Users size={15} style={{ color: 'var(--brand)' }} />
              <span className="stat-label" style={{ marginBottom: 0 }}>People Referred</span>
            </div>
            <div className="stat-value">{referred.length}</div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <Zap size={15} style={{ color: 'var(--amber)' }} />
              <span className="stat-label" style={{ marginBottom: 0 }}>Sparks Earned</span>
            </div>
            <div className="stat-value" style={{ color: 'var(--amber-dark)' }}>{(referred.length * 100).toLocaleString()}</div>
          </div>
        </div>

        <div className="section-label">People You've Referred</div>
        {referred.length === 0 ? (
          <div className="card empty-state">
            <Gift size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No referrals yet</h3>
            <p>Share your link above to start earning Sparks together.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {referred.map(r => (
              <a key={r.id} href={'/profile?id=' + r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem 1.25rem' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700
                }}>
                  {r.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{r.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{r.account_type}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

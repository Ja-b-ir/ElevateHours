'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function FundingRequests() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [giftModal, setGiftModal] = useState(null)
  const [form, setForm] = useState({ amount_requested: '', reason: '' })
  const [giftAmount, setGiftAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [giftSubmitting, setGiftSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [giftError, setGiftError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      await fetchRequests()
      setLoading(false)
    }
    init()
  }, [])

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('funding_requests')
      .select('*, requester:profiles(full_name, account_type)')
      .eq('status', 'Open')
      .order('created_at', { ascending: false })
    setRequests(data || [])
  }

  const permanentBalance = (profile?.sparks_earned || 0) - (profile?.sparks_spent || 0) + (profile?.sparks_purchased_total || 0)
  const totalBalance = permanentBalance + (profile?.active_gifts_received || 0)
  const canRequest = profile?.account_type === 'Personal' && totalBalance <= 500

  const submitRequest = async (e) => {
    e.preventDefault()
    setError('')
    if (parseInt(form.amount_requested) > 2000) { setError('Maximum request is 2,000 SPK'); return }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('funding_requests').insert({
        requester_id: user.id,
        requester_name: profile.full_name,
        amount_requested: parseInt(form.amount_requested),
        reason: form.reason,
        status: 'Open',
        date_requested: new Date().toISOString().split('T')[0]
      })
      if (error) throw error
      setShowForm(false)
      setForm({ amount_requested: '', reason: '' })
      setSuccess('Funding request posted!')
      setTimeout(() => setSuccess(''), 3000)
      await fetchRequests()
    } catch (err) {
      setError(err.message)
    }
    setSubmitting(false)
  }

  const submitGift = async () => {
    setGiftError('')
    const amt = parseInt(giftAmount)
    if (!amt || amt < 100) { setGiftError('Minimum gift is 100 SPK'); return }
    setGiftSubmitting(true)
    try {
      const { error } = await supabase.from('gifts').insert({
        donor_id: user.id,
        funding_request_id: giftModal,
        amount: amt,
        date_given: new Date().toISOString().split('T')[0]
      })
      if (error) throw error
      setGiftModal(null)
      setGiftAmount('')
      setSuccess('Gift sent successfully! 🎁')
      setTimeout(() => setSuccess(''), 3000)
      await fetchRequests()
    } catch (err) {
      setGiftError(err.message)
    }
    setGiftSubmitting(false)
  }

  const daysLeft = (expiryDate) => {
    const diff = new Date(expiryDate) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  if (loading) return <div><Navbar /><div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#64748b' }}>Loading...</div></div>

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Community Funding</h1>
            <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Support your community — every Spark gifted keeps someone moving forward</p>
          </div>
          {canRequest && (
            <button onClick={() => setShowForm(!showForm)} style={{ background: '#0D7377', color: 'white', padding: '0.65rem 1.25rem', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              {showForm ? '✕ Cancel' : '+ Request Funding'}
            </button>
          )}
        </div>

        {success && <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem', fontWeight: 600 }}>{success}</div>}

        {!canRequest && profile?.account_type === 'Personal' && (
          <div style={{ background: '#e8f4f4', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', border: '1px solid #b2d8d8', color: '#0D7377', fontSize: '0.875rem' }}>
            💡 Funding requests are available when your balance drops to 500 SPK or below. Your current balance: <strong>{totalBalance} SPK</strong>
          </div>
        )}

        {profile?.account_type === 'Organization' && (
          <div style={{ background: '#fef3c7', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.875rem' }}>
            ℹ️ Only Personal accounts can request community funding. Organizations can still gift Sparks to community members.
          </div>
        )}

        {/* Request Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(13,115,119,0.08)' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1.1rem' }}>Request Community Funding</h2>
            <form onSubmit={submitRequest}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  How many Sparks do you need? <span style={{ color: '#64748b', fontWeight: 400' }}>(Maximum 2,000 SPK)</span>
                </label>
                <input type="number" required min="100" max="2000" value={form.amount_requested} onChange={e => setForm({ ...form, amount_requested: e.target.value })} placeholder="e.g. 500" style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem' }} />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Why do you need these Sparks?</label>
                <textarea required rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Explain your situation briefly..." style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', resize: 'vertical' }} />
              </div>
              {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.75rem', background: '#fee2e2', padding: '0.6rem', borderRadius: 6 }}>{error}</div>}
              <button type="submit" disabled={submitting} style={{ background: '#0D7377', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Submitting...' : 'Post Request'}
              </button>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Open Requests ({requests.length})
          </h2>
          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#0B132B' }}>No open requests</h3>
              <p>The community is doing well! Check back later.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map(req => {
                const progress = Math.min(100, ((req.amount_funded_so_far || 0) / req.amount_requested) * 100)
                const days = daysLeft(req.expiry_date)
                return (
                  <div key={req.id} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(13,115,119,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{req.requester_name}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>{req.reason}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#F5A623', fontSize: '1.1rem' }}>{req.amount_requested} SPK</div>
                        <div style={{ fontSize: '0.75rem', color: days <= 2 ? '#ef4444' : '#64748b', fontWeight: 600 }}>
                          {days} day{days !== 1 ? 's' : ''} left
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.35rem' }}>
                        <span>{req.amount_funded_so_far || 0} SPK raised</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div style={{ background: '#e2e8f0', borderRadius: 999, height: 8 }}>
                        <div style={{ background: 'linear-gradient(90deg, #0D7377, #14A085)', borderRadius: 999, height: '100%', width: `${progress}%`, transition: 'width 0.3s' }} />
                      </div>
                    </div>

                    {req.requester_id !== user.id && (
                      <button onClick={() => setGiftModal(req.id)} style={{ background: '#e8f4f4', color: '#0D7377', padding: '0.6rem 1.25rem', borderRadius: 8, border: '1.5px solid #0D7377', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                        🎁 Gift Sparks
                      </button>
                    )}
                    {req.requester_id === user.id && (
                      <span style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>This is your request</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Gift Modal */}
      {giftModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 400, width: '100%' }}>
            <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>🎁 Gift Sparks</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Minimum gift is 100 SPK. Gifted Sparks expire after 30 days.
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Spark Amount</label>
              <input type="number" min="100" value={giftAmount} onChange={e => setGiftAmount(e.target.value)} placeholder="e.g. 200" style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem' }} />
            </div>
            {giftError && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.75rem', background: '#fee2e2', padding: '0.6rem', borderRadius: 6 }}>{giftError}</div>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setGiftModal(null); setGiftAmount(''); setGiftError('') }} style={{ flex: 1, padding: '0.75rem', background: '#F8F9FA', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitGift} disabled={giftSubmitting} style={{ flex: 1, padding: '0.75rem', background: '#0D7377', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: giftSubmitting ? 0.7 : 1 }}>
                {giftSubmitting ? 'Sending...' : 'Send Gift'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Heart, Plus, Clock, Check } from 'lucide-react'

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
    const { data } = await supabase.from('funding_requests').select('*, requester:profiles(full_name, account_type)').eq('status', 'Open').order('created_at', { ascending: false })
    setRequests(data || [])
  }

  const permanent = (profile?.sparks_earned || 0) - (profile?.sparks_spent || 0) + (profile?.sparks_purchased_total || 0)
  const total = permanent + (profile?.active_gifts_received || 0)
  const canRequest = profile?.account_type === 'Personal' && total <= 500

  const submitRequest = async (e) => {
    e.preventDefault()
    setError('')
    if (parseInt(form.amount_requested) > 2000) { setError('Maximum request is 2,000 SPK'); return }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('funding_requests').insert({ requester_id: user.id, requester_name: profile.full_name, amount_requested: parseInt(form.amount_requested), reason: form.reason, status: 'Open', date_requested: new Date().toISOString().split('T')[0] })
      if (error) throw error
      setShowForm(false)
      setForm({ amount_requested: '', reason: '' })
      setSuccess('Funding request posted!')
      setTimeout(() => setSuccess(''), 3000)
      await fetchRequests()
    } catch (err) { setError(err.message) }
    setSubmitting(false)
  }

  const submitGift = async () => {
    setGiftError('')
    const amt = parseInt(giftAmount)
    if (!amt || amt < 100) { setGiftError('Minimum gift is 100 SPK'); return }
    if (amt > total) { setGiftError('You only have ' + total.toLocaleString() + ' SPK available'); return }
    setGiftSubmitting(true)
    try {
      const req = requests.find(r => r.id === giftModal)
      if (!req) throw new Error('Request not found')

      const { error } = await supabase.from('gifts').insert({ donor_id: user.id, funding_request_id: giftModal, amount: amt, date_given: new Date().toISOString().split('T')[0] })
      if (error) throw error

      // Deduct from the donor's own balance
      const newSparksSpent = (profile.sparks_spent || 0) + amt
      await supabase.from('profiles').update({ sparks_spent: newSparksSpent }).eq('id', user.id)
      setProfile({ ...profile, sparks_spent: newSparksSpent })

      // Credit the recipient's gifted balance (expires in 30 days per platform rules)
      if (req.requester_id) {
        const { data: recipientProfile } = await supabase.from('profiles').select('active_gifts_received').eq('id', req.requester_id).single()
        await supabase.from('profiles').update({
          active_gifts_received: (recipientProfile?.active_gifts_received || 0) + amt
        }).eq('id', req.requester_id)

        await supabase.from('notifications').insert({
          user_id: req.requester_id,
          title: 'You Received a Gift!',
          message: `${profile.full_name} gifted you ${amt} SPK.`,
          type: 'gift',
          related_id: giftModal
        })
      }

      // Update the funding request's progress, close it out if fully funded
      const newFundedTotal = (req.amount_funded_so_far || 0) + amt
      await supabase.from('funding_requests').update({
        amount_funded_so_far: newFundedTotal,
        status: newFundedTotal >= req.amount_requested ? 'Fulfilled' : 'Open'
      }).eq('id', giftModal)

      setGiftModal(null); setGiftAmount('')
      setSuccess('Gift sent!')
      setTimeout(() => setSuccess(''), 3000)
      await fetchRequests()
    } catch (err) { setGiftError(err.message) }
    setGiftSubmitting(false)
  }

  const daysLeft = (d) => Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000))

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading...</div></div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Community Funding</h1>
            <p className="page-subtitle">Support your community — every Spark gifted matters</p>
          </div>
          {canRequest && (
            <button onClick={() => setShowForm(!showForm)} className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}>
              <Plus size={15} /> {showForm ? 'Cancel' : 'Request Funding'}
            </button>
          )}
        </div>

        {success && <div className="alert alert-success"><Check size={15} /> {success}</div>}

        {!canRequest && profile?.account_type === 'Personal' && (
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            Funding requests available when your balance is 500 SPK or below. Current: {total.toLocaleString()} SPK
          </div>
        )}

        {profile?.account_type === 'Organization' && (
          <div className="alert alert-warn" style={{ marginBottom: '1.5rem' }}>
            Only Personal accounts can request community funding. Organizations can still gift Sparks.
          </div>
        )}

        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Request Community Funding</h3>
            <form onSubmit={submitRequest}>
              <div className="form-group">
                <label className="form-label">How many Sparks? (Max 2,000)</label>
                <input type="number" required min="100" max="2000" value={form.amount_requested} onChange={e => setForm({ ...form, amount_requested: e.target.value })} placeholder="e.g. 500" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Why do you need these Sparks?</label>
                <textarea required rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Explain your situation briefly..." className="form-textarea" />
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? 'Submitting...' : 'Post Request'}
              </button>
            </form>
          </div>
        )}

        <div className="section-label">Open Requests ({requests.length})</div>

        {requests.length === 0 ? (
          <div className="card empty-state">
            <Heart size={40} className="empty-state-icon" style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No open requests</h3>
            <p>The community is doing well! Check back later.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requests.map(req => {
              const progress = Math.min(100, ((req.amount_funded_so_far || 0) / req.amount_requested) * 100)
              const days = daysLeft(req.expiry_date)
              return (
                <div key={req.id} className="card" style={{ transition: 'all var(--transition)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 200 }}>
                      <a href={'/profile?id=' + req.requester_id} style={{
                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '0.85rem'
                      }}>
                        {req.requester_name?.[0]?.toUpperCase()}
                      </a>
                      <div style={{ flex: 1 }}>
                        <a href={'/profile?id=' + req.requester_id} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{req.requester_name}</a>
                        <p style={{ color: 'var(--text-2)', fontSize: '0.825rem', lineHeight: 1.5, marginTop: '0.2rem' }}>{req.reason}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--amber-dark)' }}>{req.amount_requested.toLocaleString()} SPK</div>
                      <div style={{ fontSize: '0.72rem', color: days <= 2 ? 'var(--red)' : 'var(--text-3)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                        <Clock size={10} /> {days}d left
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.4rem' }}>
                      <span>{(req.amount_funded_so_far || 0).toLocaleString()} SPK raised</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {req.requester_id !== user.id ? (
                    <button onClick={() => setGiftModal(req.id)} className="btn btn-secondary btn-sm">
                      <Heart size={13} /> Gift Sparks
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontStyle: 'italic' }}>Your request</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {giftModal && (
        <div className="modal-overlay" onClick={() => setGiftModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '0.5rem' }}>Gift Sparks</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Minimum 100 SPK. Gifted Sparks expire after 30 days.</p>
            <div className="form-group">
              <label className="form-label">Spark Amount</label>
              <input type="number" min="100" value={giftAmount} onChange={e => setGiftAmount(e.target.value)} placeholder="e.g. 200" className="form-input" />
            </div>
            {giftError && <div className="alert alert-error">{giftError}</div>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setGiftModal(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={submitGift} disabled={giftSubmitting} className="btn btn-primary" style={{ flex: 1 }}>
                {giftSubmitting ? 'Sending...' : 'Send Gift'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

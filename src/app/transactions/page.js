'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { ArrowLeftRight, CheckCircle, XCircle, Star, Clock, Filter, Zap, Briefcase, GraduationCap } from 'lucide-react'

const STATUS_BADGE = {
  'Open': 'badge badge-open',
  'In Progress': 'badge badge-progress',
  'Pending Confirmation': 'badge badge-pending',
  'Confirmed': 'badge badge-confirmed',
  'Disputed': 'badge badge-disputed',
  'Cancelled': 'badge badge-cancelled',
}

export default function Transactions() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [endorseModal, setEndorseModal] = useState(null)
  const [endorseForm, setEndorseForm] = useState({ text: '', rating: 5 })

  const statuses = ['All', 'Open', 'In Progress', 'Pending Confirmation', 'Confirmed', 'Disputed', 'Cancelled']

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      await fetchTransactions(user.id)
      setLoading(false)
    }
    init()
  }, [])

  const fetchTransactions = async (uid) => {
    const { data } = await supabase
      .from('transactions')
      .select('*, skill:skills_catalog(skill_name, track), tier:tier_reference(tier_name), receiver:profiles!transactions_receiver_id_fkey(id, full_name), provider:profiles!transactions_provider_id_fkey(id, full_name)')
      .or(`provider_id.eq.${uid},receiver_id.eq.${uid}`)
      .order('created_at', { ascending: false })
    setTransactions(data || [])
  }

  const updateStatus = async (txnId, status) => {
    setUpdating(txnId)
    await supabase.from('transactions').update({ status }).eq('id', txnId)
    await fetchTransactions(user.id)
    setUpdating(null)
  }

  // Requester marks the delivered work as complete — this notifies the provider,
  // who must confirm before anything is finalized or rewarded.
  const markAsComplete = async (txn) => {
    setUpdating(txn.id)
    try {
      await supabase.from('transactions').update({ status: 'Pending Confirmation' }).eq('id', txn.id)

      if (txn.provider_id) {
        await supabase.from('notifications').insert({
          user_id: txn.provider_id,
          title: 'Work Marked as Complete',
          message: `${txn.receiver?.full_name || 'The requester'} marked "${txn.skill?.skill_name || 'your work'}" as complete. Please confirm to receive your Sparks.`,
          type: 'application',
          related_id: txn.id
        })
      }

      await fetchTransactions(user.id)
    } catch (err) {
      console.error(err)
    }
    setUpdating(null)
  }

  // Provider declines — reverts to In Progress and notifies the requester.
  const declineCompletion = async (txn) => {
    setUpdating(txn.id)
    try {
      await supabase.from('transactions').update({ status: 'In Progress' }).eq('id', txn.id)

      if (txn.receiver_id) {
        await supabase.from('notifications').insert({
          user_id: txn.receiver_id,
          title: 'Completion Declined',
          message: `${txn.provider?.full_name || 'The provider'} declined the completion for "${txn.skill?.skill_name || 'this request'}". It's back in progress.`,
          type: 'rejected',
          related_id: txn.id
        })
      }

      await fetchTransactions(user.id)
    } catch (err) {
      console.error(err)
    }
    setUpdating(null)
  }

  // Confirming a transaction is what actually rewards Sparks and updates both profiles.
  const confirmTransaction = async (txn) => {
    setUpdating(txn.id)
    try {
      const sparks = txn.total_sparks_transferred || 0

      await supabase.from('transactions').update({ status: 'Confirmed' }).eq('id', txn.id)

      // Credit the provider: Sparks earned, completed count, impact score
      if (txn.provider_id) {
        const { data: providerProfile } = await supabase
          .from('profiles')
          .select('sparks_earned, completed_transactions, impact_score')
          .eq('id', txn.provider_id)
          .single()

        await supabase.from('profiles').update({
          sparks_earned: (providerProfile?.sparks_earned || 0) + sparks,
          completed_transactions: (providerProfile?.completed_transactions || 0) + 1,
          impact_score: (providerProfile?.impact_score || 0) + 10,
        }).eq('id', txn.provider_id)

        await supabase.from('notifications').insert({
          user_id: txn.provider_id,
          title: 'Transaction Confirmed!',
          message: `You earned ${sparks} SPK for "${txn.skill?.skill_name || 'your work'}". It's now in your balance.`,
          type: 'confirmed',
          related_id: txn.id
        })
      }

      // Debit the receiver: Sparks spent
      if (txn.receiver_id) {
        const { data: receiverProfile } = await supabase
          .from('profiles')
          .select('sparks_spent')
          .eq('id', txn.receiver_id)
          .single()

        await supabase.from('profiles').update({
          sparks_spent: (receiverProfile?.sparks_spent || 0) + sparks,
        }).eq('id', txn.receiver_id)
      }

      await fetchTransactions(user.id)
      setEndorseModal(txn.id) // prompt them to rate right away
    } catch (err) {
      console.error(err)
    }
    setUpdating(null)
  }

  const submitEndorsement = async () => {
    if (!endorseModal) return
    const txn = transactions.find(t => t.id === endorseModal)
    const recipientId = txn.provider_id === user.id ? txn.receiver_id : txn.provider_id
    await supabase.from('endorsements').insert({
      endorser_id: user.id, recipient_id: recipientId, transaction_id: endorseModal,
      endorsement_text: endorseForm.text, rating: endorseForm.rating,
      track: txn.track, skill_id: txn.skill_id, date_given: new Date().toISOString().split('T')[0]
    })
    setEndorseModal(null)
    setEndorseForm({ text: '', rating: 5 })
  }

  const filtered = filter === 'All' ? transactions : transactions.filter(t => t.status === filter)

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading transactions...</div></div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap">
        <div className="page-header">
          <h1 className="page-title">My Transactions</h1>
          <p className="page-subtitle">Track all your work and education exchanges</p>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={13} style={{ color: 'var(--text-3)' }} />
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '0.4rem 0.95rem', borderRadius: 'var(--radius-full)', border: `1.5px solid ${filter === s ? 'var(--brand)' : 'var(--border)'}`,
              background: filter === s ? 'var(--brand)' : 'var(--surface)',
              color: filter === s ? 'white' : 'var(--text-2)', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem', transition: 'all var(--transition)', fontFamily: 'inherit'
            }}>
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card empty-state">
            <ArrowLeftRight size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No transactions found</h3>
            <p>Browse the marketplace to find opportunities.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(txn => {
              const isProvider = txn.provider_id === user.id
              const other = isProvider ? txn.receiver : txn.provider
              const TrackIcon = txn.track === 'Work' ? Briefcase : GraduationCap
              return (
                <div key={txn.id} className="card" style={{ transition: 'box-shadow var(--transition)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>

                    <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: 260 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                        background: other ? 'linear-gradient(135deg, var(--brand), var(--brand-mid))' : 'var(--surface-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '0.9rem'
                      }}>
                        {other?.full_name?.[0]?.toUpperCase() || <TrackIcon size={16} style={{ color: 'var(--text-3)' }} />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{txn.skill?.skill_name}</span>
                          <span className={STATUS_BADGE[txn.status] || 'badge badge-gray'}>{txn.status}</span>
                          <span className={`badge ${txn.track === 'Work' ? 'badge-purple' : 'badge-blue'}`}>
                            <TrackIcon size={10} style={{ marginRight: 3, verticalAlign: -1 }} />{txn.track}
                          </span>
                        </div>

                        <p style={{ color: 'var(--text-2)', fontSize: '0.825rem', marginBottom: '0.625rem' }}>
                          {isProvider ? 'Providing to' : 'Requested from'}:{' '}
                          {other ? (
                            <a href={'/profile?id=' + other.id} style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'underline' }}>{other.full_name}</a>
                          ) : (
                            <strong style={{ color: 'var(--text)' }}>Unassigned</strong>
                          )}
                        </p>

                        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--text-3)', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={11} /> {txn.hours_contributed || txn.agreed_hours}h</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, color: 'var(--amber-dark)' }}><Zap size={11} /> {txn.total_sparks_transferred || 0} SPK</span>
                          {txn.date && <span>{txn.date}</span>}
                          {txn.tier?.tier_name && <span style={{ color: 'var(--text-2)' }}>{txn.tier.tier_name}</span>}
                        </div>

                        {txn.description && (
                          <p style={{ color: 'var(--text-3)', fontSize: '0.78rem', marginTop: '0.625rem', lineHeight: 1.55, borderTop: '1px solid var(--border)', paddingTop: '0.625rem' }}>
                            {txn.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                      {txn.status === 'In Progress' && !isProvider && (
                        <button onClick={() => markAsComplete(txn)} disabled={updating === txn.id} className="btn btn-amber btn-sm">
                          Mark Complete
                        </button>
                      )}
                      {txn.status === 'Pending Confirmation' && isProvider && (
                        <>
                          <button onClick={() => confirmTransaction(txn)} disabled={updating === txn.id} className="btn btn-success btn-sm">
                            <CheckCircle size={13} /> Confirm
                          </button>
                          <button onClick={() => declineCompletion(txn)} disabled={updating === txn.id} className="btn btn-danger btn-sm">
                            <XCircle size={13} /> Decline
                          </button>
                        </>
                      )}
                      {txn.status === 'Pending Confirmation' && !isProvider && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontStyle: 'italic' }}>Waiting on provider to confirm</span>
                      )}
                      {txn.status === 'Confirmed' && (
                        <button onClick={() => setEndorseModal(txn.id)} className="btn btn-secondary btn-sm">
                          <Star size={13} /> Endorse
                        </button>
                      )}
                      {txn.status === 'Open' && !isProvider && (
                        <button onClick={() => updateStatus(txn.id, 'Cancelled')} className="btn btn-secondary btn-sm">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {endorseModal && (
        <div className="modal-overlay" onClick={() => setEndorseModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '0.375rem' }}>Write an Endorsement</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Share your experience working with this person.</p>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setEndorseForm({ ...endorseForm, rating: n })}
                    aria-label={n + ' star' + (n > 1 ? 's' : '')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
                  >
                    <Star size={30} color="var(--amber)" fill={n <= endorseForm.rating ? 'var(--amber)' : 'none'} strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Your Endorsement</label>
              <textarea rows={4} value={endorseForm.text} onChange={e => setEndorseForm({ ...endorseForm, text: e.target.value })} placeholder="Share your experience..." className="form-textarea" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setEndorseModal(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={submitEndorsement} className="btn btn-primary" style={{ flex: 1 }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

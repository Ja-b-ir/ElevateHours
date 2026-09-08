'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { ArrowLeftRight, CheckCircle, XCircle, Star, Clock, Search, Zap, Briefcase, GraduationCap, MessageCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'

const STATUS_BADGE = {
  'Open': 'badge badge-open',
  'In Progress': 'badge badge-progress',
  'Pending Confirmation': 'badge badge-pending',
  'Confirmed': 'badge badge-confirmed',
  'Disputed': 'badge badge-disputed',
  'Cancelled': 'badge badge-cancelled',
}

const STEPS = ['Open', 'In Progress', 'Pending Confirmation', 'Confirmed']
const MAX_ENDORSEMENT_LEN = 500

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function ProgressStepper({ status }) {
  if (status === 'Cancelled' || status === 'Disputed') {
    return <span className={STATUS_BADGE[status]}>{status}</span>
  }
  const currentIdx = STEPS.indexOf(status)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      {STEPS.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <div
            title={step}
            style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: i <= currentIdx ? 'var(--brand)' : 'var(--border)',
            }}
          />
          {i < STEPS.length - 1 && (
            <div style={{ width: 14, height: 2, background: i < currentIdx ? 'var(--brand)' : 'var(--border)' }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function Transactions() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [endorseModal, setEndorseModal] = useState(null)
  const [endorseForm, setEndorseForm] = useState({ text: '', rating: 5 })
  const [endorseError, setEndorseError] = useState('')

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

  // Provider (person who did the work) marks it complete — this notifies the
  // requester (person who posted it), who must confirm before Sparks are awarded.
  const markAsComplete = async (txn) => {
    setUpdating(txn.id)
    try {
      await supabase.from('transactions').update({ status: 'Pending Confirmation' }).eq('id', txn.id)

      if (txn.receiver_id) {
        await supabase.from('notifications').insert({
          user_id: txn.receiver_id,
          title: 'Work Marked as Complete',
          message: `${txn.provider?.full_name || 'The provider'} marked "${txn.skill?.skill_name || 'your request'}" as complete. Please confirm to release their Sparks.`,
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

  // Requester declines — reverts to In Progress and notifies the provider.
  const declineCompletion = async (txn) => {
    setUpdating(txn.id)
    try {
      await supabase.from('transactions').update({ status: 'In Progress' }).eq('id', txn.id)

      if (txn.provider_id) {
        await supabase.from('notifications').insert({
          user_id: txn.provider_id,
          title: 'Completion Declined',
          message: `${txn.receiver?.full_name || 'The requester'} declined the completion for "${txn.skill?.skill_name || 'this request'}". It's back in progress.`,
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

      // Sparks, completed_transactions, impact_score, and tier_level are all
      // credited server-side by the update_profile_balances() database
      // trigger the moment status flips to 'Confirmed' — not by this client
      // code. Grab the provider's tier before confirming so we can tell
      // afterward whether they leveled up, purely for the notification copy.
      let tierBefore = null
      if (txn.provider_id) {
        const { data: providerProfile } = await supabase
          .from('profiles').select('tier_level').eq('id', txn.provider_id).single()
        tierBefore = providerProfile?.tier_level
      }

      await supabase.from('transactions').update({ status: 'Confirmed', completed_at: new Date().toISOString() }).eq('id', txn.id)

      if (txn.provider_id) {
        await supabase.from('notifications').insert({
          user_id: txn.provider_id,
          title: 'Transaction Confirmed!',
          message: `You earned ${sparks} SPK for "${txn.skill?.skill_name || 'your work'}". It's now in your balance.`,
          type: 'confirmed',
          related_id: txn.id
        })

        const { data: providerAfter } = await supabase
          .from('profiles').select('tier_level').eq('id', txn.provider_id).single()

        if (providerAfter?.tier_level && providerAfter.tier_level !== tierBefore) {
          await supabase.from('notifications').insert({
            user_id: txn.provider_id,
            title: 'Tier Upgraded!',
            message: `Congratulations — you've been upgraded to ${providerAfter.tier_level}!`,
            type: 'confirmed',
          })
        }
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
    if (!endorseForm.text.trim()) { setEndorseError('Please write a few words about your experience.'); return }
    const txn = transactions.find(t => t.id === endorseModal)
    const recipientId = txn.provider_id === user.id ? txn.receiver_id : txn.provider_id
    await supabase.from('endorsements').insert({
      endorser_id: user.id, recipient_id: recipientId, transaction_id: endorseModal,
      endorsement_text: endorseForm.text.trim(), rating: endorseForm.rating,
      track: txn.track, skill_id: txn.skill_id, date_given: new Date().toISOString().split('T')[0]
    })
    setEndorseModal(null)
    setEndorseForm({ text: '', rating: 5 })
    setEndorseError('')
  }

  const needsMyAction = (txn) => {
    const isProvider = txn.provider_id === user?.id
    return (isProvider && txn.status === 'In Progress') || (!isProvider && txn.status === 'Pending Confirmation')
  }

  const statusCounts = useMemo(() => {
    const counts = { All: transactions.length }
    for (const s of statuses.slice(1)) counts[s] = transactions.filter(t => t.status === s).length
    return counts
  }, [transactions])

  const stats = useMemo(() => {
    const confirmed = transactions.filter(t => t.status === 'Confirmed')
    const earned = confirmed.filter(t => t.provider_id === user?.id).reduce((sum, t) => sum + (t.total_sparks_transferred || 0), 0)
    const spent = confirmed.filter(t => t.receiver_id === user?.id).reduce((sum, t) => sum + (t.total_sparks_transferred || 0), 0)
    const actionNeeded = transactions.filter(needsMyAction).length
    return { confirmedCount: confirmed.length, earned, spent, actionNeeded }
  }, [transactions, user])

  const matchesSearch = (txn) => {
    if (!search.trim()) return true
    const other = txn.provider_id === user?.id ? txn.receiver : txn.provider
    const haystack = [txn.skill?.skill_name, other?.full_name, txn.description].filter(Boolean).join(' ').toLowerCase()
    return haystack.includes(search.trim().toLowerCase())
  }

  const filtered = transactions.filter(t => (filter === 'All' || t.status === filter) && matchesSearch(t))
  const priorityItems = filter === 'All' && !search.trim() ? transactions.filter(needsMyAction) : []
  const restItems = filtered.filter(t => !(priorityItems.length > 0 && needsMyAction(t)))

  const emptyMessage = () => {
    if (search.trim()) return `No transactions match "${search.trim()}"`
    if (filter === 'All') return "You haven't started any transactions yet. Browse the marketplace to find opportunities."
    return `No transactions with status "${filter}".`
  }

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading transactions...</div></div>

  const renderCard = (txn, highlighted) => {
    const isProvider = txn.provider_id === user.id
    const other = isProvider ? txn.receiver : txn.provider
    const TrackIcon = txn.track === 'Work' ? Briefcase : GraduationCap
    return (
      <div key={txn.id} className="card" style={{ transition: 'box-shadow var(--transition)', border: highlighted ? '1.5px solid var(--brand)' : undefined }}>
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
                <span className={`badge ${txn.track === 'Work' ? 'badge-purple' : 'badge-blue'}`}>
                  <TrackIcon size={10} style={{ marginRight: 3, verticalAlign: -1 }} />{txn.track}
                </span>
                {highlighted && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--brand)', fontSize: '0.72rem', fontWeight: 700 }}>
                    <AlertCircle size={11} /> Needs your action
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <ProgressStepper status={txn.status} />
              </div>

              <p style={{ color: 'var(--text-2)', fontSize: '0.825rem', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span>
                  {isProvider ? 'Providing to' : 'Requested from'}:{' '}
                  {other ? (
                    <a href={'/profile?id=' + other.id} style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'underline' }}>{other.full_name}</a>
                  ) : (
                    <strong style={{ color: 'var(--text)' }}>Unassigned</strong>
                  )}
                </span>
                {other && (
                  <a href={'/messages/conversation?id=' + other.id} title={'Message ' + other.full_name} style={{ display: 'flex', color: 'var(--text-3)' }}>
                    <MessageCircle size={13} />
                  </a>
                )}
              </p>

              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--text-3)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={11} /> {txn.hours_contributed || txn.agreed_hours}h</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, color: 'var(--amber-dark)' }}><Zap size={11} /> {txn.total_sparks_transferred || 0} SPK</span>
                {txn.tier?.tier_name && <span style={{ color: 'var(--text-2)' }}>{txn.tier.tier_name}</span>}
                <span>
                  {txn.status === 'Confirmed' && txn.completed_at
                    ? `Confirmed ${timeAgo(txn.completed_at)}`
                    : `Posted ${timeAgo(txn.created_at)}`}
                </span>
              </div>

              {txn.description && (
                <p style={{ color: 'var(--text-3)', fontSize: '0.78rem', marginTop: '0.625rem', lineHeight: 1.55, borderTop: '1px solid var(--border)', paddingTop: '0.625rem' }}>
                  {txn.description}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
            {txn.status === 'In Progress' && isProvider && (
              <button onClick={() => markAsComplete(txn)} disabled={updating === txn.id} className="btn btn-amber btn-sm">
                Mark Complete
              </button>
            )}
            {txn.status === 'In Progress' && !isProvider && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontStyle: 'italic' }}>Waiting on provider to mark complete</span>
            )}
            {txn.status === 'Pending Confirmation' && !isProvider && (
              <>
                <button onClick={() => confirmTransaction(txn)} disabled={updating === txn.id} className="btn btn-success btn-sm">
                  <CheckCircle size={13} /> Confirm
                </button>
                <button onClick={() => declineCompletion(txn)} disabled={updating === txn.id} className="btn btn-danger btn-sm">
                  <XCircle size={13} /> Decline
                </button>
              </>
            )}
            {txn.status === 'Pending Confirmation' && isProvider && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontStyle: 'italic' }}>Waiting on requester to confirm</span>
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
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap">
        <div className="page-header">
          <h1 className="page-title">My Transactions</h1>
          <p className="page-subtitle">Track all your work and education exchanges</p>
        </div>

        {/* Stats overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.875rem', marginBottom: '1.75rem' }}>
          <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: stats.actionNeeded > 0 ? '3px solid var(--brand)' : undefined }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: stats.actionNeeded > 0 ? 'var(--brand)' : 'var(--text)' }}>{stats.actionNeeded}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600 }}>Needs your action</div>
          </div>
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)' }}>{stats.confirmedCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600 }}>Confirmed total</div>
          </div>
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '1.4rem', fontWeight: 900, color: 'var(--green)' }}>
              <TrendingUp size={16} /> {stats.earned}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600 }}>SPK earned</div>
          </div>
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-2)' }}>
              <TrendingDown size={16} /> {stats.spent}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600 }}>SPK spent</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1rem', maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by skill or person..." className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '0.4rem 0.95rem', borderRadius: 'var(--radius-full)', border: `1.5px solid ${filter === s ? 'var(--brand)' : 'var(--border)'}`,
              background: filter === s ? 'var(--brand)' : 'var(--surface)',
              color: filter === s ? 'white' : 'var(--text-2)', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem', transition: 'all var(--transition)', fontFamily: 'inherit'
            }}>
              {s} {statusCounts[s] > 0 && <span style={{ opacity: 0.75 }}>({statusCounts[s]})</span>}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card empty-state">
            <ArrowLeftRight size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No transactions found</h3>
            <p>{emptyMessage()}</p>
          </div>
        ) : (
          <>
            {priorityItems.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Needs Your Action ({priorityItems.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {priorityItems.map(txn => renderCard(txn, true))}
                </div>
              </div>
            )}

            {restItems.length > 0 && (
              <div>
                {priorityItems.length > 0 && (
                  <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    Everything Else
                  </h2>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {restItems.map(txn => renderCard(txn, false))}
                </div>
              </div>
            )}
          </>
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
              <textarea
                rows={4} maxLength={MAX_ENDORSEMENT_LEN}
                value={endorseForm.text}
                onChange={e => { setEndorseForm({ ...endorseForm, text: e.target.value }); setEndorseError('') }}
                placeholder="Share your experience..." className="form-textarea"
              />
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>
                {endorseForm.text.length}/{MAX_ENDORSEMENT_LEN}
              </div>
              {endorseError && <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{endorseError}</div>}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setEndorseModal(null); setEndorseError('') }} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={submitEndorsement} className="btn btn-primary" style={{ flex: 1 }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

const STATUS_STYLES = {
  'Open': { background: '#dcfce7', color: '#166534' },
  'In Progress': { background: '#dbeafe', color: '#1e40af' },
  'Pending Confirmation': { background: '#fef3c7', color: '#92400e' },
  'Confirmed': { background: '#dcfce7', color: '#166534' },
  'Disputed': { background: '#fee2e2', color: '#991b1b' },
  'Cancelled': { background: '#f1f5f9', color: '#64748b' },
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
      .select(`*, skill:skills_catalog(skill_name, track), tier:tier_reference(tier_name), receiver:profiles!transactions_receiver_id_fkey(id, full_name), provider:profiles!transactions_provider_id_fkey(id, full_name)`)
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

  const submitEndorsement = async () => {
    if (!endorseModal) return
    const txn = transactions.find(t => t.id === endorseModal)
    const recipientId = txn.provider_id === user.id ? txn.receiver_id : txn.provider_id
    await supabase.from('endorsements').insert({
      endorser_id: user.id,
      recipient_id: recipientId,
      transaction_id: endorseModal,
      endorsement_text: endorseForm.text,
      rating: endorseForm.rating,
      track: txn.track,
      skill_id: txn.skill_id,
      date_given: new Date().toISOString().split('T')[0]
    })
    setEndorseModal(null)
    setEndorseForm({ text: '', rating: 5 })
  }

  const filtered = filter === 'All' ? transactions : transactions.filter(t => t.status === filter)

  if (loading) return <div><Navbar /><div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#64748b' }}>Loading transactions...</div></div>

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>My Transactions</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Track all your work and education exchanges</p>
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', flexWrap: 'wrap' }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '0.4rem 1rem', borderRadius: 999, border: 'none',
              background: filter === s ? '#0D7377' : 'white',
              color: filter === s ? 'white' : '#64748b',
              fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
              border: `1.5px solid ${filter === s ? '#0D7377' : '#e2e8f0'}`
            }}>
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#0B132B' }}>No transactions yet</h3>
            <p>Browse the marketplace to find opportunities.</p>
            <a href="/marketplace" style={{ color: '#0D7377', fontWeight: 600, marginTop: '0.5rem', display: 'inline-block' }}>Go to Marketplace →</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(txn => {
              const isProvider = txn.provider_id === user.id
              const otherParty = isProvider ? txn.receiver : txn.provider
              return (
                <div key={txn.id} style={{
                  background: 'white', borderRadius: 16, padding: '1.5rem',
                  border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(13,115,119,0.06)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{txn.skill?.skill_name}</h3>
                        <span style={{
                          ...STATUS_STYLES[txn.status],
                          padding: '0.2rem 0.7rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700
                        }}>
                          {txn.status}
                        </span>
                        <span style={{ background: txn.track === 'Work' ? '#ede9fe' : '#dbeafe', color: txn.track === 'Work' ? '#5b21b6' : '#1e40af', padding: '0.2rem 0.7rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
                          {txn.track}
                        </span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {isProvider ? '📤 You are providing to' : '📥 You requested from'}: <strong>{otherParty?.full_name || 'Unassigned'}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
                        <span>⏱ {txn.hours_contributed || txn.agreed_hours}h</span>
                        <span>⚡ <strong style={{ color: '#F5A623' }}>{txn.total_sparks_transferred || 0} SPK</strong></span>
                        <span>📅 {txn.date || 'N/A'}</span>
                        <span>{txn.tier?.tier_name}</span>
                      </div>
                      {txn.description && (
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                          {txn.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {txn.status === 'In Progress' && isProvider && (
                        <button onClick={() => updateStatus(txn.id, 'Pending Confirmation')} disabled={updating === txn.id} style={{ background: '#F5A623', color: '#0B132B', padding: '0.5rem 1rem', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                          Mark Complete
                        </button>
                      )}
                      {txn.status === 'Pending Confirmation' && !isProvider && (
                        <button onClick={() => updateStatus(txn.id, 'Confirmed')} disabled={updating === txn.id} style={{ background: '#14A085', color: 'white', padding: '0.5rem 1rem', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                          ✓ Confirm Completion
                        </button>
                      )}
                      {txn.status === 'Pending Confirmation' && !isProvider && (
                        <button onClick={() => updateStatus(txn.id, 'Disputed')} style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem 1rem', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                          Dispute
                        </button>
                      )}
                      {txn.status === 'Confirmed' && (
                        <button onClick={() => setEndorseModal(txn.id)} style={{ background: '#e8f4f4', color: '#0D7377', padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid #0D7377', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                          ⭐ Endorse
                        </button>
                      )}
                      {txn.status === 'Open' && !isProvider && (
                        <button onClick={() => updateStatus(txn.id, 'Cancelled')} style={{ background: '#f1f5f9', color: '#64748b', padding: '0.5rem 1rem', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
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

      {/* Endorse Modal */}
      {endorseModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 440, width: '100%' }}>
            <h2 style={{ fontWeight: 800, marginBottom: '1.25rem' }}>Write an Endorsement</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Rating</label>
              <select value={endorseForm.rating} onChange={e => setEndorseForm({ ...endorseForm, rating: parseInt(e.target.value) })} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem' }}>
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'⭐'.repeat(r)} ({r}/5)</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Endorsement</label>
              <textarea rows={4} value={endorseForm.text} onChange={e => setEndorseForm({ ...endorseForm, text: e.target.value })} placeholder="Share your experience working with this person..." style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setEndorseModal(null)} style={{ flex: 1, padding: '0.75rem', background: '#F8F9FA', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitEndorsement} style={{ flex: 1, padding: '0.75rem', background: '#0D7377', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Submit Endorsement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

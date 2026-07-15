'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Bookmark, Clock, Zap, ChevronRight, Check } from 'lucide-react'

export default function SavedOpportunities() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [saved, setSaved] = useState([])
  const [myApplications, setMyApplications] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      await fetchSaved(user.id)
      const { data: apps } = await supabase.from('applications').select('transaction_id').eq('applicant_id', user.id)
      setMyApplications(new Set(apps?.map(a => a.transaction_id) || []))
      setLoading(false)
    }
    init()
  }, [])

  const fetchSaved = async (uid) => {
    const { data: savedRows } = await supabase.from('saved_opportunities').select('transaction_id').eq('user_id', uid)
    const ids = (savedRows || []).map(s => s.transaction_id)
    if (ids.length === 0) { setSaved([]); return }
    const { data: txns } = await supabase
      .from('transactions')
      .select('*, skill:skills_catalog(skill_name, track), tier:tier_reference(tier_name), receiver:profiles!transactions_receiver_id_fkey(full_name)')
      .in('id', ids)
    setSaved(txns || [])
  }

  const removeSaved = async (txnId) => {
    setSaved(prev => prev.filter(t => t.id !== txnId))
    await supabase.from('saved_opportunities').delete().eq('user_id', user.id).eq('transaction_id', txnId)
  }

  const applyToTransaction = async (txn) => {
    setApplying(txn.id)
    try {
      const { error } = await supabase.from('applications').insert({ transaction_id: txn.id, applicant_id: user.id, status: 'Pending' })
      if (error) throw error
      setMyApplications(prev => new Set([...prev, txn.id]))
      if (txn.receiver_id) {
        const { data: myProf } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        await supabase.from('notifications').insert({
          user_id: txn.receiver_id,
          title: 'New Application',
          message: `${myProf?.full_name || 'Someone'} applied to your request for "${txn.skill?.skill_name || 'a request'}".`,
          type: 'application',
          related_id: txn.id
        })
      }
      setSuccess('Application submitted!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { console.error(err) }
    setApplying(null)
  }

  const tierBadgeClass = (tierName) => {
    if (!tierName) return 'badge badge-gray'
    if (tierName.includes('1')) return 'badge badge-tier1'
    if (tierName.includes('2')) return 'badge badge-tier2'
    return 'badge badge-tier3'
  }

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading saved opportunities...</div></div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap">
        <div className="page-header">
          <h1 className="page-title">Saved Opportunities</h1>
          <p className="page-subtitle">Opportunities you've bookmarked to revisit later</p>
        </div>

        {success && <div className="alert alert-success"><Check size={15} /> {success}</div>}

        {saved.length === 0 ? (
          <div className="card empty-state">
            <Bookmark size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No saved opportunities yet</h3>
            <p>Tap the bookmark icon on any listing in the <a href="/marketplace" style={{ color: 'var(--brand)', fontWeight: 700 }}>Marketplace</a> to save it here.</p>
          </div>
        ) : (
          <div className="grid-auto">
            {saved.map(txn => {
              const applied = myApplications.has(txn.id)
              return (
                <div key={txn.id} className="card" style={{ border: applied ? '1.5px solid var(--brand)' : '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.625rem' }}>
                    <h3 style={{ fontSize: '0.9rem', flex: 1, color: 'var(--text)' }}>{txn.skill?.skill_name}</h3>
                    <span className={tierBadgeClass(txn.tier?.tier_name)}>{txn.tier?.tier_name?.split(':')[0]}</span>
                    <button
                      onClick={() => removeSaved(txn.id)}
                      title="Remove from saved"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', padding: 0, flexShrink: 0, display: 'flex' }}
                    >
                      <Bookmark size={17} fill="var(--brand)" />
                    </button>
                  </div>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>
                    {txn.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--surface-3)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-2)', fontWeight: 600 }}>
                      <Clock size={10} /> {txn.agreed_hours}h
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--amber-light)', color: 'var(--amber-dark)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                      <Zap size={11} /> {txn.total_sparks_transferred || 0} SPK
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>by {txn.receiver?.full_name}</span>
                    {applied ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.78rem', border: '1px solid var(--brand)' }}>
                        <Check size={11} /> Applied
                      </span>
                    ) : (
                      <button onClick={() => applyToTransaction(txn)} disabled={applying === txn.id} className="btn btn-primary btn-sm">
                        {applying === txn.id ? 'Applying...' : 'Apply'} <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

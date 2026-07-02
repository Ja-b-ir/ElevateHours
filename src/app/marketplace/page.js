'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function Marketplace() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('Find Work')
  const [transactions, setTransactions] = useState([])
  const [profiles, setProfiles] = useState([])
  const [tiers, setTiers] = useState([])
  const [filterTier, setFilterTier] = useState('')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)

  const tabs = ['Find Work', 'Find Education', 'Find Help (Work)', 'Find Help (Education)']

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      const { data: tierData } = await supabase.from('tier_reference').select('*').order('multiplier')
      setTiers(tierData || [])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [activeTab, filterTier, user])

  const fetchData = async () => {
    if (activeTab === 'Find Work' || activeTab === 'Find Education') {
      const track = activeTab === 'Find Work' ? 'Work' : 'Education'
      let query = supabase
        .from('transactions')
        .select(`*, skill:skills_catalog(skill_name, track), tier:tier_reference(tier_name, work_sparks_per_hour, education_sparks_per_hour), receiver:profiles!transactions_receiver_id_fkey(full_name, account_type)`)
        .eq('status', 'Open')
        .eq('track', track)
        .is('provider_id', null)
        .neq('receiver_id', user.id)
      if (filterTier) query = query.eq('tier_id', filterTier)
      const { data } = await query.order('created_at', { ascending: false })
      setTransactions(data || [])
    } else {
      const track = activeTab === 'Find Help (Work)' ? 'Work' : 'Education'
      const { data } = await supabase
        .from('profiles')
        .select(`*, skills:profile_skills_offered(skill:skills_catalog(skill_name, track, tier:tier_reference(tier_name)))`)
        .eq('account_type', 'Personal')
        .neq('id', user.id)
      const filtered = (data || []).filter(p =>
        p.skills?.some(s => s.skill?.track === track)
      )
      setProfiles(filtered)
    }
  }

  const applyToTransaction = async (txnId) => {
    setApplying(txnId)
    try {
      await supabase.from('transactions').update({
        provider_id: user.id,
        status: 'In Progress'
      }).eq('id', txnId)
      fetchData()
    } catch (err) {
      console.error(err)
    }
    setApplying(null)
  }

  const tierBadgeStyle = (tierName) => {
    if (!tierName) return {}
    if (tierName.includes('1')) return { background: '#dcfce7', color: '#166534' }
    if (tierName.includes('2')) return { background: '#e8f4f4', color: '#0D7377' }
    return { background: '#fef3c7', color: '#92400e' }
  }

  if (loading) return <div><Navbar /><div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#64748b' }}>Loading marketplace...</div></div>

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Marketplace</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Find work, find talent, find knowledge — all powered by Sparks</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '0.65rem 1.2rem', background: 'none', border: 'none',
              borderBottom: `3px solid ${activeTab === tab ? '#0D7377' : 'transparent'}`,
              marginBottom: -2, color: activeTab === tab ? '#0D7377' : '#64748b',
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.9rem'
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Filter */}
        {(activeTab === 'Find Work' || activeTab === 'Find Education') && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={filterTier}
              onChange={e => setFilterTier(e.target.value)}
              style={{ padding: '0.6rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 8, background: 'white', fontSize: '0.9rem', minWidth: 180 }}
            >
              <option value="">All Tiers</option>
              {tiers.map(t => <option key={t.id} value={t.id}>{t.tier_name}</option>)}
            </select>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {transactions.length} opportunities found
            </span>
          </div>
        )}

        {/* Find Work / Education */}
        {(activeTab === 'Find Work' || activeTab === 'Find Education') && (
          <>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#0B132B' }}>No opportunities yet</h3>
                <p>Check back soon or post a request yourself.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {transactions.map(txn => (
                  <div key={txn.id} style={{
                    background: 'white', borderRadius: 16, padding: '1.5rem',
                    border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(13,115,119,0.06)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '1.05rem', flex: 1, marginRight: '0.5rem' }}>
                        {txn.skill?.skill_name}
                      </h3>
                      <span style={{
                        ...tierBadgeStyle(txn.tier?.tier_name),
                        padding: '0.2rem 0.7rem', borderRadius: 999,
                        fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap'
                      }}>
                        {txn.tier?.tier_name?.split(':')[0]}
                      </span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {txn.description || 'No description provided.'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#F8F9FA', padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>
                        ⏱ {txn.agreed_hours}h
                      </span>
                      <span style={{ background: '#fff7ed', color: '#c2410c', padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700 }}>
                        ⚡ {txn.total_sparks_transferred || 0} SPK
                      </span>
                      <span style={{ background: '#f0fdf4', color: '#166534', padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>
                        {txn.track}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        by {txn.receiver?.full_name}
                      </span>
                      <button
                        onClick={() => applyToTransaction(txn.id)}
                        disabled={applying === txn.id}
                        style={{
                          background: '#0D7377', color: 'white',
                          padding: '0.5rem 1.25rem', borderRadius: 8,
                          border: 'none', fontWeight: 600, fontSize: '0.875rem',
                          cursor: 'pointer', opacity: applying === txn.id ? 0.7 : 1
                        }}
                      >
                        {applying === txn.id ? 'Applying...' : 'Apply →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Find Help */}
        {(activeTab === 'Find Help (Work)' || activeTab === 'Find Help (Education)') && (
          <>
            {profiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👥</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#0B132B' }}>No individuals found yet</h3>
                <p>Check back as more members join the community.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {profiles.map(p => (
                  <div key={p.id} style={{
                    background: 'white', borderRadius: 16, padding: '1.5rem',
                    border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(13,115,119,0.06)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0D7377, #14A085)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0
                      }}>
                        {p.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{p.full_name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                          {p.tier_level || 'Tier 1: Foundational'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0D7377' }}>{p.completed_transactions || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Completed</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#F5A623' }}>{p.impact_score || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Impact Score</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                      {p.skills?.slice(0, 4).map((s, i) => (
                        <span key={i} style={{
                          background: '#F8F9FA', color: '#374151',
                          padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 500
                        }}>
                          {s.skill?.skill_name}
                        </span>
                      ))}
                      {p.skills?.length > 4 && (
                        <span style={{ color: '#64748b', fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}>
                          +{p.skills.length - 4} more
                        </span>
                      )}
                    </div>
                    <a href={`/profile?id=${p.id}`} style={{
                      display: 'block', textAlign: 'center', background: '#F8F9FA',
                      color: '#0D7377', padding: '0.6rem', borderRadius: 8,
                      fontWeight: 600, fontSize: '0.875rem', border: '1.5px solid #e2e8f0'
                    }}>
                      View Profile →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

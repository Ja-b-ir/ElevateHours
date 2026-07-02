'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [activeTab, setActiveTab] = useState('Work')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      const { data: txns } = await supabase
        .from('transactions')
        .select(`*, skill:skills_catalog(skill_name, track), tier:tier_reference(tier_name), receiver:profiles!transactions_receiver_id_fkey(full_name), provider:profiles!transactions_provider_id_fkey(full_name)`)
        .or(`provider_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'Open')
        .order('created_at', { ascending: false })
        .limit(6)
      setTransactions(txns || [])
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#64748b' }}>
        Loading your dashboard...
      </div>
    </div>
  )

  const permanentBalance = (profile?.sparks_earned || 0) - (profile?.sparks_spent || 0) + (profile?.sparks_purchased_total || 0)
  const totalUsable = permanentBalance + (profile?.active_gifts_received || 0)
  const filtered = transactions.filter(t => t.skill?.track === activeTab)

  const quickActions = [
    { label: '🔍 Browse Marketplace', href: '/marketplace' },
    { label: '📋 Post a Request', href: '/post-request' },
    { label: '📊 My Transactions', href: '/transactions' },
    { label: '👤 My Profile', href: '/profile' },
    { label: '⚡ Buy Sparks', href: '/buy-sparks' },
    { label: '🤝 Funding Requests', href: '/funding-requests' },
  ]

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Welcome back, {profile?.full_name?.split(' ')[0]} 👋
            </h1>
            <span style={{
              background: profile?.account_type === 'Personal' ? '#e8f4f4' : '#fef3c7',
              color: profile?.account_type === 'Personal' ? '#0D7377' : '#92400e',
              padding: '0.2rem 0.75rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700
            }}>
              {profile?.account_type}
            </span>
          </div>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
            Tier Level: <strong>{profile?.tier_level || 'Tier 1: Foundational'}</strong> · Impact Score: <strong>{profile?.impact_score || 0}</strong>
          </p>
        </div>

        {/* Balance Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {[
            { label: 'Permanent Balance', value: permanentBalance, color: '#0D7377', icon: '💎', desc: 'Earned + Purchased' },
            { label: 'Gifted Balance', value: profile?.active_gifts_received || 0, color: '#14A085', icon: '🎁', desc: 'Expires in 30 days' },
            { label: 'Total Usable Balance', value: totalUsable, color: '#F5A623', icon: '⚡', desc: 'Available to spend' },
          ].map((card, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 16, padding: '1.5rem',
              boxShadow: '0 2px 12px rgba(13,115,119,0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {card.label}
                </span>
                <span style={{ fontSize: '1.25rem' }}>{card.icon}</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: card.color, lineHeight: 1 }}>
                {card.value.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
                SPK · {card.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '1.5rem',
          marginBottom: '2rem', border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(13,115,119,0.08)'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {quickActions.map(action => (
              <a key={action.href} href={action.href} style={{
                background: '#F8F9FA', color: '#0B132B',
                padding: '0.6rem 1.1rem', borderRadius: 8,
                fontWeight: 600, fontSize: '0.875rem',
                border: '1.5px solid #e2e8f0',
                transition: 'all 0.2s',
                textDecoration: 'none'
              }}>
                {action.label}
              </a>
            ))}
          </div>
        </div>

        {/* Recent Open Transactions */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '1.5rem',
          border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(13,115,119,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Open Opportunities</h2>
            <a href="/marketplace" style={{ color: '#0D7377', fontWeight: 600, fontSize: '0.875rem' }}>
              View all →
            </a>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0' }}>
            {['Work', 'Education'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '0.5rem 1rem', background: 'none', border: 'none',
                borderBottom: `3px solid ${activeTab === tab ? '#0D7377' : 'transparent'}`,
                marginBottom: -2, color: activeTab === tab ? '#0D7377' : '#64748b',
                fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem'
              }}>
                {tab}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
              <p>No open {activeTab} opportunities right now.</p>
              <a href="/marketplace" style={{ color: '#0D7377', fontWeight: 600, fontSize: '0.875rem' }}>
                Browse the marketplace →
              </a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {filtered.map(txn => (
                <div key={txn.id} style={{
                  border: '1.5px solid #e2e8f0', borderRadius: 12,
                  padding: '1.25rem', background: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{txn.skill?.skill_name}</span>
                    <span style={{
                      background: '#fef3c7', color: '#92400e',
                      padding: '0.15rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700
                    }}>
                      {txn.tier?.tier_name?.split(':')[0]}
                    </span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    {txn.description?.slice(0, 80)}{txn.description?.length > 80 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#F5A623', fontWeight: 700, fontSize: '0.9rem' }}>
                      {txn.total_sparks_transferred || 0} SPK
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {txn.agreed_hours}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

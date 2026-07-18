'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import {
  TrendingUp, Users, Clock, Zap, ArrowRight, Briefcase,
  GraduationCap, Plus, BarChart3, Award, Target, ChevronRight, Gift, Flame
} from 'lucide-react'

const TIERS = [
  { name: 'Tier 1: Foundational', min: 0, next: 5000 },
  { name: 'Tier 2: Specialized', min: 5000, next: 10000 },
  { name: 'Tier 3: Strategic', min: 10000, next: null },
]

function tierInfo(sparksEarned) {
  if (sparksEarned >= 10000) return TIERS[2]
  if (sparksEarned >= 5000) return TIERS[1]
  return TIERS[0]
}

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [workOpportunities, setWorkOpportunities] = useState([])
  const [eduOpportunities, setEduOpportunities] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [streakDays, setStreakDays] = useState({}) // { 'YYYY-MM-DD': sparksThatDay }
  const [activeTab, setActiveTab] = useState('Work')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.replace('/auth/login'); return }
      const user = session.user

      let { data: prof } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()

      // Self-heal: if tier_level doesn't match sparks_earned (e.g. from older data
      // or manual edits), correct it here rather than trusting a stale stored value.
      if (prof) {
        const correctTier = tierInfo(prof.sparks_earned || 0).name
        if (correctTier !== prof.tier_level) {
          await supabase.from('profiles').update({ tier_level: correctTier }).eq('id', user.id)
          prof = { ...prof, tier_level: correctTier }
        }
      }
      setProfile(prof)

      const { data: workTxns } = await supabase
        .from('transactions')
        .select('*, skill:skills_catalog(skill_name, track), tier:tier_reference(tier_name), receiver:profiles!transactions_receiver_id_fkey(full_name)')
        .eq('status', 'Open')
        .eq('track', 'Work')
        .is('provider_id', null)
        .neq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setWorkOpportunities(workTxns || [])

      const { data: eduTxns } = await supabase
        .from('transactions')
        .select('*, skill:skills_catalog(skill_name, track), tier:tier_reference(tier_name), receiver:profiles!transactions_receiver_id_fkey(full_name)')
        .eq('status', 'Open')
        .eq('track', 'Education')
        .is('provider_id', null)
        .neq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setEduOpportunities(eduTxns || [])

      const { data: activity } = await supabase
        .from('transactions')
        .select('*, skill:skills_catalog(skill_name, track), tier:tier_reference(tier_name), receiver:profiles!transactions_receiver_id_fkey(full_name), provider:profiles!transactions_provider_id_fkey(full_name)')
        .or(`provider_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentActivity(activity || [])

      // Activity streak: every day this user completed work as the provider
      const { data: completed } = await supabase
        .from('transactions')
        .select('completed_at, total_sparks_transferred')
        .eq('provider_id', user.id)
        .eq('status', 'Confirmed')
        .not('completed_at', 'is', null)
      const dayMap = {}
      for (const t of completed || []) {
        const day = t.completed_at.split('T')[0]
        dayMap[day] = (dayMap[day] || 0) + (t.total_sparks_transferred || 0)
      }
      setStreakDays(dayMap)

      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '0.75rem', color: 'var(--text-3)' }}>
        <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        Loading your dashboard...
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  // Educators and Organizations/NGOs get a distinct dashboard focused on Programs,
  // instead of the Personal dashboard's marketplace-opportunity feed.
  if (profile && profile.account_type !== 'Personal') {
    return <OrgDashboard profile={profile} />
  }

  const permanent = (profile?.sparks_earned || 0) - (profile?.sparks_spent || 0) + (profile?.sparks_purchased_total || 0)
  const total = permanent + (profile?.active_gifts_received || 0)
  const filtered = activeTab === 'Work' ? workOpportunities : eduOpportunities
  const viewAllHref = activeTab === 'Work' ? '/marketplace?tab=work' : '/marketplace?tab=education'

  const statusColor = (status) => {
    const map = {
      'Open': 'var(--green)', 'In Progress': 'var(--blue)',
      'Pending Confirmation': 'var(--amber)', 'Confirmed': 'var(--green)',
      'Disputed': 'var(--red)', 'Cancelled': 'var(--text-3)',
    }
    return map[status] || 'var(--text-3)'
  }

  const statusBg = (status) => {
    const map = {
      'Open': 'var(--green-light)', 'In Progress': 'var(--blue-light)',
      'Pending Confirmation': 'var(--amber-light)', 'Confirmed': 'var(--green-light)',
      'Disputed': 'var(--red-light)', 'Cancelled': 'var(--surface-3)',
    }
    return map[status] || 'var(--surface-3)'
  }

  const tierColor = (tierName) => {
    if (!tierName) return { bg: 'var(--surface-3)', color: 'var(--text-3)' }
    if (tierName.includes('1')) return { bg: 'var(--green-light)', color: 'var(--green)' }
    if (tierName.includes('2')) return { bg: 'var(--brand-light)', color: 'var(--brand)' }
    return { bg: 'var(--amber-light)', color: 'var(--amber-dark)' }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.75rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)' }}>
                  Welcome back, {profile?.full_name?.split(' ')[0]}
                </h1>
                <span style={{
                  background: profile?.account_type === 'Personal' ? 'var(--brand-light)' : 'var(--amber-light)',
                  color: profile?.account_type === 'Personal' ? 'var(--brand)' : 'var(--amber-dark)',
                  padding: '0.2rem 0.75rem', borderRadius: '999px',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase'
                }}>
                  {profile?.account_type}
                </span>
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>
                {profile?.tier_level || 'Tier 1: Foundational'} &nbsp;·&nbsp; Impact Score: {profile?.impact_score || 0} &nbsp;·&nbsp; {profile?.completed_transactions || 0} completed
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <a href="/referrals" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.125rem', borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--amber), var(--amber-dark))', color: '#1B1C25',
                fontSize: '0.825rem', fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(221,162,45,0.3)'
              }}>
                <Gift size={14} /> Invite Friends
              </a>
              <a href="/post-request" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.125rem', borderRadius: 'var(--radius-sm)',
                background: 'var(--brand)', color: 'white',
                fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(13,115,119,0.25)'
              }}>
                <Plus size={14} /> Post Request
              </a>
              <a href="/marketplace" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.125rem', borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-3)', color: 'var(--text)',
                border: '1px solid var(--border)', fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none'
              }}>
                Browse <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>

          <div style={{
            background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)',
            borderRadius: 'var(--radius-lg)', padding: '1.5rem',
            color: 'white', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={11} /> Total Usable Balance
              </div>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.4rem' }}>
                {total.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>SPK &nbsp;·&nbsp; ≈ ${(total * 0.10).toFixed(2)} USD</div>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--brand)', borderRadius: '16px 16px 0 0' }} />
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Permanent Balance</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1, marginBottom: '0.3rem' }}>{permanent.toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>SPK · Earned + Purchased</div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '0.15rem' }}>Earned</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--green)' }}>{(profile?.sparks_earned || 0).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '0.15rem' }}>Spent</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--red)' }}>{(profile?.sparks_spent || 0).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '0.15rem' }}>Bought</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--blue)' }}>{(profile?.sparks_purchased_total || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--green)', borderRadius: '16px 16px 0 0' }} />
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Gifted Balance</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1, marginBottom: '0.3rem' }}>{(profile?.active_gifts_received || 0).toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>SPK · Expires in 30 days</div>
            <div style={{ marginTop: '1rem', padding: '0.5rem 0.75rem', background: 'var(--green-light)', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
              <TrendingUp size={11} style={{ color: 'var(--green)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--green)' }}>Community supported</span>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--amber)', borderRadius: '16px 16px 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tier Progress</div>
              <Award size={15} style={{ color: 'var(--amber)' }} />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', marginBottom: '0.6rem' }}>
              {tierInfo(profile?.sparks_earned || 0).name}
            </div>
            {tierInfo(profile?.sparks_earned || 0).next ? (
              <>
                <div style={{ background: 'var(--surface-3)', borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: '0.5rem' }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    background: 'linear-gradient(90deg, var(--amber), var(--brand))',
                    width: Math.min(100, (((profile?.sparks_earned || 0) - tierInfo(profile?.sparks_earned || 0).min) / (tierInfo(profile?.sparks_earned || 0).next - tierInfo(profile?.sparks_earned || 0).min)) * 100) + '%'
                  }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                  {(profile?.sparks_earned || 0).toLocaleString()} / {tierInfo(profile?.sparks_earned || 0).next.toLocaleString()} SPK to next tier
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>You've reached the highest tier</div>
            )}
          </div>
        </div>

        {/* Activity Streak */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <ActivityStreak streakDays={streakDays} />
        </div>

        <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.15rem' }}>Open Opportunities</h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Latest requests from the community</p>
                </div>
                <a href={viewAllHref} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                  View all <ArrowRight size={13} />
                </a>
              </div>

              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
                {['Work', 'Education'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.75rem 0', marginRight: '1.5rem',
                    background: 'none', border: 'none',
                    borderBottom: `2px solid ${activeTab === tab ? 'var(--brand)' : 'transparent'}`,
                    color: activeTab === tab ? 'var(--brand)' : 'var(--text-3)',
                    fontWeight: 600, cursor: 'pointer', fontSize: '0.825rem',
                    fontFamily: 'inherit', transition: 'all 0.15s'
                  }}>
                    {tab === 'Work' ? <Briefcase size={13} /> : <GraduationCap size={13} />}
                    {tab}
                  </button>
                ))}
              </div>

              <div style={{ padding: '1.25rem 1.5rem' }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-3)' }}>
                    <Users size={36} style={{ margin: '0 auto 0.875rem', opacity: 0.3 }} />
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-2)' }}>No open {activeTab} opportunities</p>
                    <p style={{ fontSize: '0.8rem' }}>Check the marketplace or post a request.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {filtered.map(txn => {
                        const tc = tierColor(txn.tier?.tier_name)
                        return (
                          <div key={txn.id} style={{
                            padding: '1.125rem', background: 'var(--surface-2)',
                            borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'flex-start', gap: '1rem', transition: 'border-color 0.15s, box-shadow 0.15s'
                          }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,115,119,0.08)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{txn.skill?.skill_name}</span>
                                <span style={{ background: tc.bg, color: tc.color, padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700 }}>
                                  {txn.tier?.tier_name?.split(':')[0]}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.5, marginBottom: '0.625rem' }}>
                                {txn.description?.slice(0, 90)}{txn.description?.length > 90 ? '...' : ''}
                              </p>
                              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={11} /> {txn.agreed_hours}h</span>
                                <span>by {txn.receiver?.full_name}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--amber)', letterSpacing: '-0.02em' }}>
                                ⚡ {txn.total_sparks_transferred || 0}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginTop: '0.1rem' }}>SPK</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <a href={viewAllHref} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border)', background: 'var(--surface-2)',
                      color: 'var(--text)', fontWeight: 600, fontSize: '0.825rem', textDecoration: 'none'
                    }}>
                      View All {activeTab} Opportunities <ArrowRight size={14} />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>Quick Actions</h3>
              </div>
              <div style={{ padding: '0.75rem' }}>
                {[
                  { label: 'Browse Marketplace', href: '/marketplace', icon: Users, accent: 'var(--brand)' },
                  { label: 'Post a Request', href: '/post-request', icon: Plus, accent: 'var(--brand-mid)' },
                  { label: 'My Requests', href: '/my-requests', icon: BarChart3, accent: 'var(--amber)' },
                  { label: 'Buy Sparks', href: '/buy-sparks', icon: Zap, accent: 'var(--green)' },
                  { label: 'Community Funding', href: '/funding-requests', icon: TrendingUp, accent: 'var(--red)' },
                  { label: 'My Transactions', href: '/transactions', icon: ArrowRight, accent: 'var(--purple)' },
                ].map((action, i) => (
                  <a key={i} href={action.href} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.7rem 0.75rem', borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-2)', fontSize: '0.825rem', fontWeight: 600,
                    textDecoration: 'none', transition: 'all 0.15s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <action.icon size={14} style={{ color: action.accent }} />
                    </div>
                    {action.label}
                    <ChevronRight size={13} style={{ marginLeft: 'auto', color: 'var(--text-3)' }} />
                  </a>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>Recent Activity</h3>
                <a href="/transactions" style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>View all</a>
              </div>
              <div style={{ padding: '0.75rem' }}>
                {recentActivity.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-3)', fontSize: '0.8rem' }}>No activity yet</div>
                ) : (
                  recentActivity.map((txn, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-sm)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(txn.status), flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{txn.skill?.skill_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{txn.status}</div>
                      </div>
                      <div style={{ background: statusBg(txn.status), color: statusColor(txn.status), padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {txn.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function OrgDashboard({ profile }) {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: progs } = await supabase.from('programs').select('*').eq('creator_id', profile.id).order('created_at', { ascending: false })
      const progIds = (progs || []).map(p => p.id)
      let counts = {}
      if (progIds.length > 0) {
        const { data: allEnrollments } = await supabase.from('program_enrollments').select('program_id').in('program_id', progIds)
        for (const e of allEnrollments || []) counts[e.program_id] = (counts[e.program_id] || 0) + 1
      }
      setPrograms((progs || []).map(p => ({ ...p, enrolledCount: counts[p.id] || 0 })))
      setLoading(false)
    }
    load()
  }, [profile.id])

  const totalStudents = programs.reduce((sum, p) => sum + p.enrolledCount, 0)
  const openCount = programs.filter(p => p.status === 'Open').length
  const permanent = (profile?.sparks_earned || 0) - (profile?.sparks_spent || 0) + (profile?.sparks_purchased_total || 0)
  const totalSparks = permanent + (profile?.active_gifts_received || 0)

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="loading-wrap"><div className="spinner" /> Loading your dashboard...</div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.75rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)' }}>
                  Welcome back, {profile?.full_name?.split(' ')[0]}
                </h1>
                <span style={{ background: 'var(--amber-light)', color: 'var(--amber-dark)', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {profile?.account_type === 'Educator' ? 'Educator' : 'Organization / NGO'}
                </span>
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Manage your programs and track student enrollment</p>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <a href="/programs/create" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.125rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand)', color: 'white', fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 12px rgba(13,115,119,0.25)' }}>
                <Plus size={14} /> Start a Program
              </a>
              <a href="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.125rem', borderRadius: 'var(--radius-sm)', background: 'var(--surface-3)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none' }}>
                Browse Marketplace <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', color: 'white' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={11} /> Sparks Balance
            </div>
            <div style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>{totalSparks.toLocaleString()}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.4rem' }}>SPK</div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Total Programs</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text)' }}>{programs.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.3rem' }}>{openCount} currently open</div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Total Students</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand)' }}>{totalStudents}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.3rem' }}>across all programs</div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/my-programs" style={{ fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Manage Programs →</a>
              <a href="/post-request" style={{ fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Post a Work Request →</a>
              <a href="/buy-sparks" style={{ fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Buy Sparks →</a>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.15rem' }}>Your Programs</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Courses and internships you've created</p>
            </div>
            <a href="/my-programs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
              Manage all <ArrowRight size={13} />
            </a>
          </div>

          <div style={{ padding: '1.25rem 1.5rem' }}>
            {programs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-3)' }}>
                <GraduationCap size={36} style={{ margin: '0 auto 0.875rem', opacity: 0.3 }} />
                <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-2)' }}>No programs yet</p>
                <p style={{ fontSize: '0.8rem' }}>Create your first course or internship to start accepting students.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {programs.slice(0, 5).map(p => {
                  const TypeIcon = p.program_type === 'Internship' ? Briefcase : GraduationCap
                  return (
                    <a key={p.id} href="/my-programs" style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                      padding: '1rem 1.125rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)', textDecoration: 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                        <TypeIcon size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{p.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{p.status}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand)', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                        <Users size={14} /> {p.enrolledCount}{p.capacity ? ' / ' + p.capacity : ''}
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityStreak({ streakDays }) {
  const todayStr = new Date().toISOString().split('T')[0]

  // Current streak: count backwards from today (or yesterday, if today has no activity yet)
  const dayKey = (d) => d.toISOString().split('T')[0]
  let cursor = new Date()
  if (!streakDays[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1)
  let currentStreak = 0
  while (streakDays[dayKey(cursor)]) {
    currentStreak++
    cursor.setDate(cursor.getDate() - 1)
  }

  // Longest streak across all recorded history
  const sortedDates = Object.keys(streakDays).sort()
  let longestStreak = 0, run = 0, prevDate = null
  for (const d of sortedDates) {
    if (prevDate) {
      const diff = (new Date(d) - new Date(prevDate)) / 86400000
      run = diff === 1 ? run + 1 : 1
    } else {
      run = 1
    }
    longestStreak = Math.max(longestStreak, run)
    prevDate = d
  }

  const activeDays = Object.keys(streakDays).length

  // Build last 18 weeks as a 7-row x N-column grid, GitHub-style
  const WEEKS = 18
  const totalDays = WEEKS * 7
  const start = new Date()
  start.setDate(start.getDate() - totalDays + 1)
  // Align start to a Sunday so columns line up as full weeks
  start.setDate(start.getDate() - start.getDay())

  const cells = []
  const cursor2 = new Date(start)
  while (cells.length < WEEKS * 7 + 7) {
    cells.push(new Date(cursor2))
    cursor2.setDate(cursor2.getDate() + 1)
  }

  const colorFor = (sparks) => {
    if (!sparks) return 'var(--surface-3)'
    if (sparks < 50) return 'var(--green-light)'
    if (sparks < 150) return 'var(--green)'
    if (sparks < 300) return 'var(--brand)'
    return 'var(--brand-dark)'
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.15rem' }}>Activity Streak</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Days you completed work, shaded by Sparks earned</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center', color: currentStreak > 0 ? 'var(--amber)' : 'var(--text-3)' }}>
              <Flame size={16} fill={currentStreak > 0 ? 'var(--amber)' : 'none'} />
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{currentStreak}</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>Current streak</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' }}>{longestStreak}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>Longest streak</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' }}>{activeDays}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>Active days</div>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {week.map((date, di) => {
                const key = dayKey(date)
                const sparks = streakDays[key] || 0
                const isFuture = date > new Date()
                return (
                  <div
                    key={di}
                    title={isFuture ? '' : key + (sparks ? ' · ' + sparks + ' SPK earned' : ' · no activity')}
                    style={{
                      width: 11, height: 11, borderRadius: 2,
                      background: isFuture ? 'transparent' : colorFor(sparks),
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-3)' }}>
        Less
        {['var(--surface-3)', 'var(--green-light)', 'var(--green)', 'var(--brand)', 'var(--brand-dark)'].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
        ))}
        More
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Award, Target, Trophy, Globe, Zap } from 'lucide-react'

export default function BadgesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [userBadges, setUserBadges] = useState([])
  const [allBadges, setAllBadges] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      const { data: myBadges } = await supabase.from('user_badges').select('*, badge:badges(*, skill:skills_catalog(skill_name), tier:tier_reference(tier_name))').eq('profile_id', user.id).order('date_awarded', { ascending: false })
      setUserBadges(myBadges || [])
      const { data: badges } = await supabase.from('badges').select('*, skill:skills_catalog(skill_name), tier:tier_reference(tier_name)').order('sparks_required')
      setAllBadges(badges || [])
      setLoading(false)
    }
    init()
  }, [])

  const earnedIds = new Set(userBadges.map(b => b.badge_id))
  const sparksEarned = profile?.sparks_earned || 0

  const getIcon = (type) => {
    if (type === 'Skill Badge') return <Target size={20} />
    if (type === 'Achievement Badge') return <Trophy size={20} />
    return <Globe size={20} />
  }

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading badges...</div></div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap">
        <div className="page-header">
          <h1 className="page-title">My Badges</h1>
          <p className="page-subtitle">Every badge represents real skill, real work, real impact</p>
        </div>

        <div className="section-label">Earned Badges ({userBadges.length})</div>

        {userBadges.length === 0 ? (
          <div className="card empty-state" style={{ marginBottom: '2rem' }}>
            <Award size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No badges yet</h3>
            <p>Complete transactions to start earning badges.</p>
            <a href="/marketplace" className="btn btn-primary btn-sm" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Browse Marketplace
            </a>
          </div>
        ) : (
          <div className="grid-auto-sm" style={{ marginBottom: '2rem' }}>
            {userBadges.map((ub, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--amber)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem', color: 'var(--amber-dark)' }}>
                  {getIcon(ub.badge?.badge_type)}
                </div>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>{ub.badge?.badge_name}</h3>
                <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>{ub.badge?.description}</p>
                <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {ub.badge?.skill && <span className="badge badge-brand">{ub.badge.skill.skill_name}</span>}
                  <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Zap size={11} /> {ub.badge?.sparks_required?.toLocaleString()} SPK</span>
                </div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.7rem', marginTop: '0.75rem' }}>Awarded {ub.date_awarded}</div>
              </div>
            ))}
          </div>
        )}

        {allBadges.length > 0 && (
          <>
            <div className="section-label">All Available Badges</div>
            <div className="grid-auto-sm">
              {allBadges.map((badge, i) => {
                const earned = earnedIds.has(badge.id)
                const progress = Math.min(100, (sparksEarned / badge.sparks_required) * 100)
                return (
                  <div key={i} style={{
                    background: 'var(--surface)', border: `1px solid ${earned ? 'var(--brand)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)', padding: '1.125rem',
                    opacity: earned ? 1 : 0.6, transition: 'all var(--transition)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                      <div style={{ color: earned ? 'var(--amber-dark)' : 'var(--text-3)' }}>{getIcon(badge.badge_type)}</div>
                      {earned && <span className="badge badge-green">Earned</span>}
                    </div>
                    <h3 style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>{badge.badge_name}</h3>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>{badge.description}</p>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '0.4rem' }}>
                      {sparksEarned.toLocaleString()} / {badge.sparks_required.toLocaleString()} SPK
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%`, background: earned ? 'var(--amber)' : undefined }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

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

      const { data: myBadges } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*, skill:skills_catalog(skill_name), tier:tier_reference(tier_name))')
        .eq('profile_id', user.id)
        .order('date_awarded', { ascending: false })
      setUserBadges(myBadges || [])

      const { data: badges } = await supabase
        .from('badges')
        .select('*, skill:skills_catalog(skill_name), tier:tier_reference(tier_name)')
        .order('sparks_required')
      setAllBadges(badges || [])

      setLoading(false)
    }
    init()
  }, [])

  const earnedIds = new Set(userBadges.map(b => b.badge_id))
  const sparksEarned = profile?.sparks_earned || 0

  if (loading) return <div><Navbar /><div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#64748b' }}>Loading badges...</div></div>

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>My Badges</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Every badge represents real skill, real work, real impact</p>
        </div>

        {/* Earned badges */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>
            Earned Badges ({userBadges.length})
          </h2>
          {userBadges.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, padding: '3rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏅</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No badges yet</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Complete transactions to start earning badges. Your first badge is closer than you think.</p>
              <a href="/marketplace" style={{ display: 'inline-block', marginTop: '1rem', background: '#0D7377', color: 'white', padding: '0.65rem 1.5rem', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem' }}>Browse Marketplace →</a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {userBadges.map((ub, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(13,115,119,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                    {ub.badge?.badge_type === 'Skill Badge' ? '🎯' : ub.badge?.badge_type === 'Achievement Badge' ? '🏆' : '🌍'}
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.4rem' }}>{ub.badge?.badge_name}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>{ub.badge?.description}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {ub.badge?.skill && <span style={{ background: '#e8f4f4', color: '#0D7377', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>{ub.badge.skill.skill_name}</span>}
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>⚡ {ub.badge?.sparks_required} SPK</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.75rem' }}>Awarded {ub.date_awarded}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All available badges */}
        {allBadges.length > 0 && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>All Badges</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {allBadges.map((badge, i) => {
                const earned = earnedIds.has(badge.id)
                const progress = Math.min(100, (sparksEarned / badge.sparks_required) * 100)
                return (
                  <div key={i} style={{ background: 'white', borderRadius: 14, padding: '1.25rem', border: `1px solid ${earned ? '#0D7377' : '#e2e8f0'}`, opacity: earned ? 1 : 0.65 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {badge.badge_type === 'Skill Badge' ? '🎯' : badge.badge_type === 'Achievement Badge' ? '🏆' : '🌍'}
                      </span>
                      {earned && <span style={{ background: '#dcfce7', color: '#166534', padding: '0.15rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700 }}>EARNED</span>}
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{badge.badge_name}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>{badge.description}</p>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' }}>
                      {sparksEarned.toLocaleString()} / {badge.sparks_required.toLocaleString()} SPK
                    </div>
                    <div style={{ background: '#e2e8f0', borderRadius: 999, height: 6 }}>
                      <div style={{ background: earned ? '#14A085' : '#0D7377', borderRadius: 999, height: '100%', width: `${progress}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewId = searchParams.get('id')
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState([])
  const [endorsements, setEndorsements] = useState([])
  const [badges, setBadges] = useState([])
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setCurrentUser(user)
      const targetId = viewId || user.id
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', targetId).single()
      setProfile(prof)
      setEditForm({ bio: prof?.bio || '' })
      const { data: skillsData } = await supabase
        .from('profile_skills_offered')
        .select('skill:skills_catalog(id, skill_name, track, tier:tier_reference(tier_name))')
        .eq('profile_id', targetId)
      setSkills(skillsData?.map(s => s.skill) || [])
      const { data: endData } = await supabase
        .from('endorsements')
        .select('*, endorser:profiles!endorsements_endorser_id_fkey(full_name), skill:skills_catalog(skill_name)')
        .eq('recipient_id', targetId)
        .order('created_at', { ascending: false })
        .limit(10)
      setEndorsements(endData || [])
      const { data: badgeData } = await supabase
        .from('user_badges')
        .select('*, badge:badges(badge_name, description, badge_type)')
        .eq('profile_id', targetId)
      setBadges(badgeData || [])
      setLoading(false)
    }
    init()
  }, [viewId])

  const saveProfile = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ bio: editForm.bio }).eq('id', currentUser.id)
    setProfile({ ...profile, bio: editForm.bio })
    setEditing(false)
    setSuccess('Profile updated!')
    setTimeout(() => setSuccess(''), 3000)
    setSaving(false)
  }

  const isOwnProfile = !viewId || viewId === currentUser?.id
  const permanentBalance = (profile?.sparks_earned || 0) - (profile?.sparks_spent || 0) + (profile?.sparks_purchased_total || 0)
  const totalBalance = permanentBalance + (profile?.active_gifts_received || 0)

  const tierColor = (tierName) => {
    if (!tierName) return { bg: '#F8F9FA', color: '#64748b' }
    if (tierName.includes('1')) return { bg: '#dcfce7', color: '#166534' }
    if (tierName.includes('2')) return { bg: '#e8f4f4', color: '#0D7377' }
    return { bg: '#fef3c7', color: '#92400e' }
  }

  if (loading) return <div><Navbar /><div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#64748b' }}>Loading profile...</div></div>
  if (!profile) return <div><Navbar /><div style={{ textAlign: 'center', padding: '4rem' }}>Profile not found</div></div>

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(13,115,119,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #0D7377, #14A085)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.75rem', flexShrink: 0 }}>
                {profile.full_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem' }}>{profile.full_name}</h1>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ background: profile.account_type === 'Personal' ? '#e8f4f4' : '#fef3c7', color: profile.account_type === 'Personal' ? '#0D7377' : '#92400e', padding: '0.2rem 0.75rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700 }}>
                    {profile.account_type}
                  </span>
                  <span style={{ background: '#F8F9FA', color: '#64748b', padding: '0.2rem 0.75rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600 }}>
                    {profile.tier_level || 'Tier 1: Foundational'}
                  </span>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <button onClick={() => setEditing(!editing)} style={{ background: editing ? '#F8F9FA' : '#e8f4f4', color: '#0D7377', padding: '0.6rem 1.2rem', borderRadius: 8, border: '1.5px solid #0D7377', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                {editing ? '✕ Cancel' : '✏️ Edit Profile'}
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Completed', value: profile.completed_transactions || 0, icon: '✅' },
              { label: 'Impact Score', value: profile.impact_score || 0, icon: '📊' },
              { label: 'Trust Score', value: profile.organization_trust_score || 0, icon: '⭐' },
              { label: 'Sparks Earned', value: (profile.sparks_earned || 0).toLocaleString(), icon: '⚡' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0.75rem', background: '#F8F9FA', borderRadius: 10 }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0D7377' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {editing ? (
  <>
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
        Full Name
      </label>
      <input
        type="text"
        value={editForm.full_name || profile.full_name}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            full_name: e.target.value,
          })
        }
        style={{
          width: '100%',
          padding: '0.7rem',
          border: '1.5px solid #e2e8f0',
          borderRadius: 8,
          fontSize: '0.95rem',
        }}
      />
    </div>

    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
        Tier Level
      </label>
      <select
        value={editForm.tier_level || profile.tier_level}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            tier_level: e.target.value,
          })
        }
        style={{
          width: '100%',
          padding: '0.7rem',
          border: '1.5px solid #e2e8f0',
          borderRadius: 8,
          fontSize: '0.95rem',
          background: 'white',
        }}
      >
        <option value="Tier 1: Foundational">Tier 1: Foundational</option>
        <option value="Tier 2: Specialized">Tier 2: Specialized</option>
        <option value="Tier 3: Strategic">Tier 3: Strategic</option>
      </select>
    </div>

    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
        Bio
      </label>
      <textarea
        rows={3}
        value={editForm.bio || ''}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            bio: e.target.value,
          })
        }
        style={{
          width: '100%',
          padding: '0.7rem',
          border: '1.5px solid #e2e8f0',
          borderRadius: 8,
          fontSize: '0.95rem',
          resize: 'vertical',
        }}
      />
    </div>
  </>
) : (
  profile.bio && (
    <p style={{ color: '#374151', lineHeight: 1.7, fontSize: '0.95rem' }}>
      {profile.bio}
    </p>
  )
)}

          {isOwnProfile && (
            <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'linear-gradient(135deg, #0D7377, #14A085)', borderRadius: 12, color: 'white' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Balance</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{permanentBalance.toLocaleString()}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Permanent SPK</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{(profile.active_gifts_received || 0).toLocaleString()}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Gifted SPK</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F5A623' }}>{totalBalance.toLocaleString()}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total Usable SPK</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(13,115,119,0.06)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Skills Offered</h2>
            {skills.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No skills listed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skills.map((s, i) => {
                  const tc = tierColor(s?.tier?.tier_name)
                  return <span key={i} style={{ background: tc.bg, color: tc.color, padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>{s?.skill_name}</span>
                })}
              </div>
            )}
          </div>
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(13,115,119,0.06)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Badges</h2>
            {badges.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No badges earned yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {badges.map((b, i) => <span key={i} style={{ background: '#fef3c7', color: '#92400e', padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>🏅 {b.badge?.badge_name}</span>)}
              </div>
            )}
          </div>
        </div>

        {endorsements.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', marginTop: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(13,115,119,0.06)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Endorsements</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {endorsements.map((e, i) => (
                <div key={i} style={{ padding: '1rem 1.25rem', background: '#F8F9FA', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{e.endorser?.full_name}</span>
                    <span style={{ color: '#F5A623' }}>{'⭐'.repeat(e.rating || 0)}</span>
                  </div>
                  <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.6 }}>{e.endorsement_text}</p>
                  {e.skill && <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>{e.skill.skill_name} · {e.date_given}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#64748b' }}>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  )
}

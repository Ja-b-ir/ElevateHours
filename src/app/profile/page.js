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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setCurrentUser(user)
      const targetId = viewId || user.id
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', targetId).single()
      setProfile(prof)
      setEditForm({
        bio: prof?.bio || '',
        full_name: prof?.full_name || '',
        tier_level: prof?.tier_level || 'Tier 1: Foundational',
        whatsapp_number: prof?.whatsapp_number || ''
      })
      const { data: skillsData } = await supabase
        .from('profile_skills_offered')
        .select('skill:skills_catalog(id, skill_name, track, tier:tier_reference(tier_name))')
        .eq('profile_id', targetId)
      setSkills(skillsData?.map(function(s) { return s.skill }) || [])
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
    const updates = {
      bio: editForm.bio,
      full_name: editForm.full_name || profile.full_name,
      tier_level: editForm.tier_level || profile.tier_level,
      whatsapp_number: editForm.whatsapp_number
    }
    await supabase.from('profiles').update(updates).eq('id', currentUser.id)
    setProfile({ ...profile, ...updates })
    setEditing(false)
    setSuccess('Profile updated successfully!')
    setTimeout(function() { setSuccess('') }, 3000)
    setSaving(false)
  }

  const deleteAccount = async () => {
    if (deleteConfirmText !== 'Delete Permanently') return
    setDeleting(true)
    try {
      await supabase.from('profiles').delete().eq('id', currentUser.id)
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (err) {
      console.error(err)
      setDeleting(false)
    }
  }

  const isOwnProfile = !viewId || viewId === currentUser?.id
  const permanentBalance = (profile?.sparks_earned || 0) - (profile?.sparks_spent || 0) + (profile?.sparks_purchased_total || 0)
  const totalBalance = permanentBalance + (profile?.active_gifts_received || 0)

  const tierColor = function(tierName) {
    if (!tierName) return { bg: 'var(--surface-3)', color: 'var(--text-2)' }
    if (tierName.includes('1')) return { bg: 'var(--green-light)', color: 'var(--green)' }
    if (tierName.includes('2')) return { bg: 'var(--brand-light)', color: 'var(--brand)' }
    return { bg: 'var(--amber-light)', color: 'var(--amber-dark)' }
  }

  if (loading) return (
    <div>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-2)' }}>Loading profile...</div>
    </div>
  )

  if (!profile) return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text)' }}>Profile not found</div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Profile Header Card */}
        <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.75rem', flexShrink: 0 }}>
                {profile.full_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text)' }}>{profile.full_name}</h1>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ background: profile.account_type === 'Personal' ? 'var(--brand-light)' : 'var(--amber-light)', color: profile.account_type === 'Personal' ? 'var(--brand)' : 'var(--amber-dark)', padding: '0.2rem 0.75rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700 }}>
                    {profile.account_type}
                  </span>
                  <span style={{ background: 'var(--surface-3)', color: 'var(--text-2)', padding: '0.2rem 0.75rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600 }}>
                    {profile.tier_level || 'Tier 1: Foundational'}
                  </span>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <button onClick={function() { setEditing(!editing) }} style={{ background: editing ? 'var(--surface-3)' : 'var(--brand-light)', color: 'var(--brand)', padding: '0.6rem 1.2rem', borderRadius: 8, border: '1.5px solid var(--brand)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Completed', value: profile.completed_transactions || 0, icon: '✅' },
              { label: 'Impact Score', value: profile.impact_score || 0, icon: '📊' },
              { label: 'Trust Score', value: profile.organization_trust_score || 0, icon: '⭐' },
              { label: 'Sparks Earned', value: (profile.sparks_earned || 0).toLocaleString(), icon: '⚡' },
            ].map(function(stat, i) {
              return (
                <div key={i} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 10 }}>
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand)' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', fontWeight: 500 }}>{stat.label}</div>
                </div>
              )
            })}
          </div>

          {/* Contact buttons for other users */}
          {!isOwnProfile && (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <a href={'mailto:' + profile.email} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.6rem 1.25rem', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', border: '1.5px solid var(--brand)', textDecoration: 'none' }}>
                ✉️ Send Email
              </a>
              {profile.whatsapp_number && (
                <a href={'https://wa.me/' + profile.whatsapp_number.replace(/[^0-9]/g, '')} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--green-light)', color: 'var(--green)', padding: '0.6rem 1.25rem', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', border: '1.5px solid var(--brand-mid)', textDecoration: 'none' }}>
                  💬 WhatsApp
                </a>
              )}
            </div>
          )}

          {/* Bio display */}
          {!editing && profile.bio && (
            <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: '0.95rem' }}>{profile.bio}</p>
          )}

          {/* Edit Form */}
          {editing && isOwnProfile && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--brand)' }}>Edit Your Profile</h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text)' }}>Full Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={function(e) { setEditForm({ ...editForm, full_name: e.target.value }) }}
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.95rem', outline: 'none', background: 'var(--surface-2)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text)' }}>Tier Level</label>
                <select
                  value={editForm.tier_level}
                  onChange={function(e) { setEditForm({ ...editForm, tier_level: e.target.value }) }}
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.95rem', background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}
                >
                  <option value="Tier 1: Foundational">Tier 1: Foundational</option>
                  <option value="Tier 2: Specialized">Tier 2: Specialized</option>
                  <option value="Tier 3: Strategic">Tier 3: Strategic</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text)' }}>WhatsApp Number</label>
                <input
                  type="tel"
                  value={editForm.whatsapp_number}
                  onChange={function(e) { setEditForm({ ...editForm, whatsapp_number: e.target.value }) }}
                  placeholder="+880 1XXX XXXXXX"
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.95rem', outline: 'none', background: 'var(--surface-2)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text)' }}>Bio</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={function(e) { setEditForm({ ...editForm, bio: e.target.value }) }}
                  placeholder="Tell the community about yourself..."
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.95rem', resize: 'vertical', outline: 'none', background: 'var(--surface-2)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  style={{ background: 'var(--brand)', color: 'white', padding: '0.75rem 1.75rem', borderRadius: 8, border: 'none', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontSize: '0.95rem' }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={function() { setEditing(false) }}
                  style={{ background: 'var(--surface-3)', color: 'var(--text-2)', padding: '0.75rem 1.25rem', borderRadius: 8, border: '1.5px solid var(--border)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
                >
                  Cancel
                </button>
                {success && (
                  <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.875rem' }}>{success}</span>
                )}
              </div>
            </div>
          )}

          {/* Balance — own profile only */}
          {isOwnProfile && !editing && (
            <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))', borderRadius: 12, color: 'white' }}>
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
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--amber)' }}>{totalBalance.toLocaleString()}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total Usable SPK</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skills and Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: 'var(--text)' }}>Skills Offered</h2>
            {skills.length === 0 ? (
              <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>No skills listed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skills.map(function(s, i) {
                  const tc = tierColor(s?.tier?.tier_name)
                  return (
                    <span key={i} style={{ background: tc.bg, color: tc.color, padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>
                      {s?.skill_name}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: 'var(--text)' }}>Badges</h2>
            {badges.length === 0 ? (
              <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>No badges earned yet. Complete transactions to unlock badges.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {badges.map(function(b, i) {
                  return (
                    <span key={i} title={b.badge?.description} style={{ background: 'var(--amber-light)', color: 'var(--amber-dark)', padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>
                      🏅 {b.badge?.badge_name}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Endorsements */}
        {endorsements.length > 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: 'var(--text)' }}>Endorsements</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {endorsements.map(function(e, i) {
                return (
                  <div key={i} style={{ padding: '1rem 1.25rem', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{e.endorser?.full_name}</span>
                      <span style={{ color: 'var(--amber)' }}>{'⭐'.repeat(e.rating || 0)}</span>
                    </div>
                    <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.6 }}>{e.endorsement_text}</p>
                    {e.skill && <div style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: '0.5rem' }}>{e.skill.skill_name} · {e.date_given}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Danger Zone — own profile only */}
        {isOwnProfile && (
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.5rem', border: '1.5px solid var(--red)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem', color: 'var(--red)' }}>Danger Zone</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={function() { setShowDeleteModal(true) }}
              style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '0.65rem 1.25rem', borderRadius: 8, border: '1.5px solid var(--red)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Delete My Account
            </button>
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '2rem', maxWidth: 440, width: '100%' }}>
            <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--red)', textAlign: 'center' }}>Delete Account Permanently</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem', textAlign: 'center' }}>
              This will permanently delete your profile, all your transactions, Sparks, badges, and endorsements. This cannot be undone.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                Type <strong style={{ color: 'var(--red)' }}>Delete Permanently</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={function(e) { setDeleteConfirmText(e.target.value) }}
                placeholder="Delete Permanently"
                style={{ width: '100%', padding: '0.7rem', border: '1.5px solid var(--red)', borderRadius: 8, fontSize: '0.95rem', outline: 'none', background: 'var(--surface-2)', color: 'var(--text)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={function() { setShowDeleteModal(false); setDeleteConfirmText('') }}
                style={{ flex: 1, padding: '0.75rem', background: 'var(--surface-3)', color: 'var(--text-2)', border: '1.5px solid var(--border)', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleteConfirmText !== 'Delete Permanently' || deleting}
                style={{ flex: 1, padding: '0.75rem', background: deleteConfirmText === 'Delete Permanently' ? 'var(--red)' : 'var(--border-2)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: deleteConfirmText === 'Delete Permanently' ? 'pointer' : 'not-allowed', opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-2)' }}>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  )
}

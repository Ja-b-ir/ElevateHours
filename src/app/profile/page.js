'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Mail, MessageCircle, MessageSquare, CheckCircle2, BarChart3, Star, Zap, Award, AlertTriangle, Globe, Clock } from 'lucide-react'

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria',
  'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad',
  'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Republic of the)', 'Congo (DR)', 'Costa Rica', "Cote d'Ivoire",
  'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland',
  'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
  'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
  'Ireland', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
  'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
  'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea',
  'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
  'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
  'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain',
  'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
  'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
]

const COOLDOWN_DAYS = 60

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewId = searchParams.get('id')
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState([])
  const [reviewStats, setReviewStats] = useState({ count: 0, average: 0 })
  const [badges, setBadges] = useState([])
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [newCountry, setNewCountry] = useState('')
  const [countrySubmitting, setCountrySubmitting] = useState(false)
  const [countryError, setCountryError] = useState('')
  const [pendingRequest, setPendingRequest] = useState(null)

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
      const { data: ratingsData } = await supabase
        .from('endorsements')
        .select('rating')
        .eq('recipient_id', targetId)
      const ratings = (ratingsData || []).map(function(r) { return r.rating }).filter(function(r) { return r != null })
      setReviewStats({
        count: ratings.length,
        average: ratings.length ? ratings.reduce(function(a, b) { return a + b }, 0) / ratings.length : 0
      })
      const { data: badgeData } = await supabase
        .from('user_badges')
        .select('*, badge:badges(badge_name, description, badge_type)')
        .eq('profile_id', targetId)
      setBadges(badgeData || [])
      if (!viewId || viewId === user.id) {
        const { data: pending } = await supabase
          .from('country_change_requests')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'Pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        setPendingRequest(pending || null)
      }
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

  const daysUntilEligible = () => {
    if (!profile?.country_updated_at) return 0
    const diffDays = (new Date() - new Date(profile.country_updated_at)) / 86400000
    return Math.max(0, Math.ceil(COOLDOWN_DAYS - diffDays))
  }

  const submitCountryRequest = async () => {
    setCountryError('')
    if (!newCountry) { setCountryError('Please select a country'); return }
    if (newCountry === profile.country) { setCountryError('That is already your current country'); return }
    setCountrySubmitting(true)
    try {
      const { data, error } = await supabase.from('country_change_requests').insert({
        user_id: currentUser.id,
        current_country: profile.country || '',
        requested_country: newCountry,
        status: 'Pending'
      }).select().single()
      if (error) throw error
      setPendingRequest(data)
      setShowCountryModal(false)
      setNewCountry('')
      setSuccess('Country change request submitted for review.')
      setTimeout(function() { setSuccess('') }, 4000)
    } catch (err) {
      setCountryError(err.message)
    }
    setCountrySubmitting(false)
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
        {success && !editing && (
          <div style={{ background: 'var(--green-light)', color: 'var(--green)', padding: '0.75rem 1.125rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            {success}
          </div>
        )}

        {/* Profile Header Card */}
        <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.75rem', flexShrink: 0 }}>
                {profile.full_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{profile.full_name}</h1>
                  {reviewStats.count > 0 && (
                    <a href={'/reviews?id=' + profile.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text)', fontSize: '0.85rem', fontWeight: 700 }}>
                      <Star size={14} color="var(--amber)" fill="var(--amber)" />
                      {reviewStats.average.toFixed(1)}
                      <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>({reviewStats.count})</span>
                    </a>
                  )}
                </div>
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
              { label: 'Completed', value: profile.completed_transactions || 0, icon: <CheckCircle2 size={18} /> },
              { label: 'Impact Score', value: profile.impact_score || 0, icon: <BarChart3 size={18} /> },
              { label: 'Trust Score', value: profile.organization_trust_score || 0, icon: <Star size={18} /> },
              { label: 'Sparks Earned', value: (profile.sparks_earned || 0).toLocaleString(), icon: <Zap size={18} /> },
            ].map(function(stat, i) {
              return (
                <div key={i} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 10 }}>
                  <div style={{ color: 'var(--brand)', marginBottom: '0.4rem', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand)' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', fontWeight: 500 }}>{stat.label}</div>
                </div>
              )
            })}
          </div>

          {/* Contact icons for other users */}
          {!isOwnProfile && (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
              <a
                href={'/messages/conversation?id=' + profile.id}
                title={'Message ' + profile.full_name}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: 44, padding: '0 1.25rem', borderRadius: 999, background: 'var(--brand)', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}
              >
                <MessageSquare size={16} /> Message
              </a>
              <a
                href={'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(profile.email || '')}
                target="_blank"
                rel="noopener noreferrer"
                title={'Email ' + profile.full_name}
                style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--brand-light)', color: 'var(--brand)', border: '1.5px solid var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <Mail size={18} />
              </a>
              {profile.whatsapp_number && (
                <a
                  href={'https://wa.me/' + profile.whatsapp_number.replace(/[^0-9]/g, '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={'WhatsApp ' + profile.full_name}
                  style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-light)', color: 'var(--green)', border: '1.5px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <MessageCircle size={18} />
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

          {/* Country — own profile only */}
          {isOwnProfile && !editing && (
            <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Globe size={18} style={{ color: 'var(--text-2)' }} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Country</div>
                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{profile.country || 'Not set'}</div>
                </div>
              </div>
              {pendingRequest ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--amber-dark)', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Clock size={14} /> Change to {pendingRequest.requested_country} pending review
                </span>
              ) : daysUntilEligible() > 0 ? (
                <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>
                  Next request available in {daysUntilEligible()} day{daysUntilEligible() === 1 ? '' : 's'}
                </span>
              ) : (
                <button
                  onClick={function() { setShowCountryModal(true) }}
                  style={{ background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.45rem 1rem', borderRadius: 8, border: '1.5px solid var(--brand)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Request Country Change
                </button>
              )}
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
                    <span key={i} title={b.badge?.description} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'var(--amber-light)', color: 'var(--amber-dark)', padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>
                      <Award size={13} /> {b.badge?.badge_name}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Reviews summary */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {reviewStats.count > 0 ? reviewStats.average.toFixed(1) : '—'}
            </div>
            <div>
              <div style={{ display: 'flex', gap: '0.15rem', marginBottom: '0.25rem' }}>
                {[1, 2, 3, 4, 5].map(function(n) {
                  const filled = n <= Math.round(reviewStats.average)
                  return <Star key={n} size={16} color="var(--amber)" fill={filled ? 'var(--amber)' : 'none'} />
                })}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>
                {reviewStats.count} review{reviewStats.count === 1 ? '' : 's'}
              </div>
            </div>
          </div>
          <a href={'/reviews?id=' + profile.id} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--brand-light)', color: 'var(--brand)',
            padding: '0.6rem 1.25rem', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem',
            border: '1.5px solid var(--brand)'
          }}>
            <Star size={15} /> Reviews
          </a>
        </div>


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

      {/* Country Change Request Modal */}
      {showCountryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '2rem', maxWidth: 440, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--brand)', marginBottom: '1rem' }}><Globe size={36} /></div>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text)', textAlign: 'center' }}>Request Country Change</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem', textAlign: 'center' }}>
              Your current country is <strong style={{ color: 'var(--text)' }}>{profile.country || 'Not set'}</strong>. This request will be reviewed before it takes effect, and you won't be able to request again for {COOLDOWN_DAYS} days after approval.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text)' }}>New Country</label>
              <select
                value={newCountry}
                onChange={function(e) { setNewCountry(e.target.value) }}
                style={{ width: '100%', padding: '0.7rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.95rem', outline: 'none', background: 'var(--surface-2)', color: 'var(--text)' }}
              >
                <option value="">Select a country...</option>
                {COUNTRIES.map(function(c) { return <option key={c} value={c}>{c}</option> })}
              </select>
            </div>
            {countryError && <div style={{ color: 'var(--red)', fontSize: '0.825rem', marginBottom: '1rem' }}>{countryError}</div>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={function() { setShowCountryModal(false); setNewCountry(''); setCountryError('') }}
                style={{ flex: 1, padding: '0.75rem', background: 'var(--surface-3)', color: 'var(--text-2)', border: '1.5px solid var(--border)', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={submitCountryRequest}
                disabled={countrySubmitting || !newCountry}
                style={{ flex: 1, padding: '0.75rem', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: countrySubmitting ? 'not-allowed' : 'pointer', opacity: countrySubmitting || !newCountry ? 0.6 : 1 }}
              >
                {countrySubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '2rem', maxWidth: 440, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--red)', marginBottom: '1rem' }}><AlertTriangle size={40} /></div>
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

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function PostRequest() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [skills, setSkills] = useState([])
  const [tiers, setTiers] = useState([])
  const [form, setForm] = useState({
    track: 'Work', skill_id: '', tier_id: '', agreed_hours: '', description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      const { data: tierData } = await supabase.from('tier_reference').select('*').order('multiplier')
      setTiers(tierData || [])
    }
    init()
  }, [])

  useEffect(() => {
    if (!form.track) return
    supabase.from('skills_catalog').select('*, tier:tier_reference(tier_name)')
      .eq('track', form.track)
      .order('skill_name')
      .then(({ data }) => setSkills(data || []))
  }, [form.track])

  const calcSparks = () => {
    const tier = tiers.find(t => t.id === form.tier_id)
    if (!tier || !form.agreed_hours) return 0
    const rate = form.track === 'Work' ? tier.work_sparks_per_hour : tier.education_sparks_per_hour
    return Math.round(parseFloat(form.agreed_hours) * rate)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const sparks = calcSparks()
      const { error } = await supabase.from('transactions').insert({
        receiver_id: user.id,
        skill_id: form.skill_id,
        tier_id: form.tier_id,
        track: form.track,
        agreed_hours: parseFloat(form.agreed_hours),
        hours_contributed: parseFloat(form.agreed_hours),
        total_sparks_transferred: sparks,
        description: form.description,
        status: 'Open',
        date: new Date().toISOString().split('T')[0]
      })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/marketplace'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Post a Request</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Tell the community what you need — Work support or Education</p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(13,115,119,0.08)' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Request Posted!</h2>
              <p style={{ color: '#64748b' }}>Redirecting to marketplace...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Track</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['Work', 'Education'].map(t => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, track: t, skill_id: '', tier_id: '' })} style={{
                      flex: 1, padding: '0.75rem', borderRadius: 10,
                      border: `2px solid ${form.track === t ? '#0D7377' : '#e2e8f0'}`,
                      background: form.track === t ? '#e8f4f4' : 'white',
                      color: form.track === t ? '#0D7377' : '#64748b',
                      fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem'
                    }}>
                      {t === 'Work' ? '💼' : '🎓'} {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Skill Needed</label>
                <select required value={form.skill_id} onChange={e => {
                  const skill = skills.find(s => s.id === e.target.value)
                  setForm({ ...form, skill_id: e.target.value, tier_id: skill?.tier_id || '' })
                }} style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', background: 'white' }}>
                  <option value="">Select a skill...</option>
                  {skills.map(s => <option key={s.id} value={s.id}>{s.skill_name} ({s.tier?.tier_name})</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Tier</label>
                <select required value={form.tier_id} onChange={e => setForm({ ...form, tier_id: e.target.value })} style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', background: 'white' }}>
                  <option value="">Select tier...</option>
                  {tiers.map(t => <option key={t.id} value={t.id}>{t.tier_name} ({form.track === 'Work' ? t.work_sparks_per_hour : t.education_sparks_per_hour} SPK/hr)</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Hours Required</label>
                <input type="number" required min="0.5" step="0.5" placeholder="e.g. 5" value={form.agreed_hours} onChange={e => setForm({ ...form, agreed_hours: e.target.value })} style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem' }} />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Description</label>
                <textarea required rows={4} placeholder="Describe what you need in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', resize: 'vertical' }} />
              </div>

              {form.tier_id && form.agreed_hours && (
                <div style={{ background: '#e8f4f4', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.25rem', border: '1px solid #b2d8d8' }}>
                  <div style={{ fontWeight: 700, color: '#0D7377', fontSize: '0.9rem' }}>
                    💡 Estimated cost: <span style={{ fontSize: '1.1rem' }}>{calcSparks()} SPK</span>
                  </div>
                  <div style={{ color: '#0D7377', fontSize: '0.8rem', opacity: 0.8, marginTop: '0.2rem' }}>
                    {form.agreed_hours} hours × {tiers.find(t => t.id === form.tier_id)?.[form.track === 'Work' ? 'work_sparks_per_hour' : 'education_sparks_per_hour']} SPK/hr
                  </div>
                </div>
              )}

              {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem', background: '#fee2e2', padding: '0.75rem', borderRadius: 8 }}>{error}</div>}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '0.9rem', background: '#0D7377',
                color: 'white', border: 'none', borderRadius: 10,
                fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}>
                {loading ? 'Posting...' : 'Post Request →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

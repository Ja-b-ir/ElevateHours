'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Briefcase, GraduationCap, Zap, Clock, CheckCircle } from 'lucide-react'

export default function PostRequest() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [skills, setSkills] = useState([])
  const [tiers, setTiers] = useState([])
  const [form, setForm] = useState({ track: 'Work', skill_id: '', tier_id: '', agreed_hours: '', description: '' })
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
    supabase.from('skills_catalog').select('*, tier:tier_reference(tier_name, id)').eq('track', form.track).order('skill_name').then(({ data }) => setSkills(data || []))
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
        receiver_id: user.id, skill_id: form.skill_id, tier_id: form.tier_id,
        track: form.track, agreed_hours: parseFloat(form.agreed_hours),
        hours_contributed: parseFloat(form.agreed_hours), total_sparks_transferred: sparks,
        description: form.description, status: 'Open', date: new Date().toISOString().split('T')[0]
      })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/marketplace'), 2000)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const selectedTier = tiers.find(t => t.id === form.tier_id)
  const sparks = calcSparks()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap" style={{ maxWidth: 720 }}>
        <div className="page-header">
          <h1 className="page-title">Post a Request</h1>
          <p className="page-subtitle">Tell the community what you need — Work support or Education</p>
        </div>

        <div className="card">
          {success ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <CheckCircle size={48} style={{ color: 'var(--green)', margin: '0 auto 1rem' }} />
              <h2 style={{ marginBottom: '0.5rem' }}>Request Posted!</h2>
              <p style={{ color: 'var(--text-2)' }}>Redirecting to marketplace...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Track selector */}
              <div className="form-group">
                <div className="section-label" style={{ marginBottom: '0.75rem' }}>Step 1 · Choose a Track</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { value: 'Work', label: 'Work', sub: 'Get skilled services', icon: Briefcase },
                    { value: 'Education', label: 'Education', sub: 'Learn from experts', icon: GraduationCap }
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm({ ...form, track: opt.value, skill_id: '', tier_id: '' })} style={{
                      padding: '1.125rem', borderRadius: 'var(--radius)', border: `2px solid ${form.track === opt.value ? 'var(--brand)' : 'var(--border)'}`,
                      background: form.track === opt.value ? 'var(--brand-light)' : 'var(--surface-2)',
                      cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all var(--transition)',
                      boxShadow: form.track === opt.value ? 'var(--shadow-sm)' : 'none'
                    }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: form.track === opt.value ? 'var(--brand)' : 'var(--surface-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <opt.icon size={18} style={{ color: form.track === opt.value ? 'white' : 'var(--text-3)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: form.track === opt.value ? 'var(--brand)' : 'var(--text)' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{opt.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="section-label" style={{ marginBottom: '0.75rem', marginTop: '1.75rem' }}>Step 2 · Request Details</div>

              <div className="form-group">
                <label className="form-label">Skill Needed</label>
                <select required value={form.skill_id} onChange={e => {
                  const skill = skills.find(s => s.id === e.target.value)
                  setForm({ ...form, skill_id: e.target.value, tier_id: skill?.tier_id || '' })
                }} className="form-select">
                  <option value="">Select a skill...</option>
                  {skills.map(s => <option key={s.id} value={s.id}>{s.skill_name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tier</label>
                <select required value={form.tier_id} onChange={e => setForm({ ...form, tier_id: e.target.value })} className="form-select">
                  <option value="">Select tier...</option>
                  {tiers.map(t => <option key={t.id} value={t.id}>{t.tier_name} · {form.track === 'Work' ? t.work_sparks_per_hour : t.education_sparks_per_hour} SPK/hr</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hours Required</label>
                <input type="number" required min="0.5" step="0.5" placeholder="e.g. 5" value={form.agreed_hours} onChange={e => setForm({ ...form, agreed_hours: e.target.value })} className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea required rows={4} placeholder="Describe what you need in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="form-textarea" />
              </div>

              {/* Spark preview */}
              {form.tier_id && form.agreed_hours && (
                <div style={{ background: 'var(--brand-light)', border: '1px solid var(--brand)', borderRadius: 'var(--radius)', padding: '1.125rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={16} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--brand)', fontSize: '0.9rem' }}>
                      Estimated cost: {sparks.toLocaleString()} SPK
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--brand)', opacity: 0.75, marginTop: '0.15rem' }}>
                      {form.agreed_hours}h × {selectedTier?.[form.track === 'Work' ? 'work_sparks_per_hour' : 'education_sparks_per_hour']} SPK/hr
                    </div>
                  </div>
                </div>
              )}

              {error && <div className="alert alert-error">{error}</div>}

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '0.9rem', borderRadius: 'var(--radius)' }}>
                {loading ? 'Posting...' : 'Post Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

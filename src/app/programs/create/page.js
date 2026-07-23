'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { GraduationCap, Briefcase } from 'lucide-react'

const CURRENCIES = ['USD', 'BDT', 'EUR', 'GBP', 'INR', 'PKR', 'AUD', 'CAD']

export default function CreateProgram() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({
    title: '', program_type: 'Course', description: '', capacity: '', level: 'Beginner',
    cost_type: 'Free', cost_amount: '', cost_payment_method: 'Real Money', cost_currency: 'USD',
    is_paid: false, pay_type: 'Per Month', pay_amount: '', pay_payment_method: 'Real Money', pay_currency: 'USD',
    interview_required: false, start_date: '', end_date: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof?.account_type === 'Personal') { router.push('/dashboard'); return }
      setProfile(prof)
      setLoading(false)
    }
    init()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) { setError('Please give your program a title'); return }
    if (form.start_date && form.end_date && form.end_date < form.start_date) { setError('End date cannot be before the start date'); return }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('programs').insert({
        creator_id: user.id,
        title: form.title,
        program_type: form.program_type,
        description: form.description,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        level: form.level,
        cost_type: form.cost_type,
        cost_amount: form.cost_type === 'Free' ? null : (form.cost_amount ? parseFloat(form.cost_amount) : null),
        cost_payment_method: form.cost_type === 'Free' ? null : form.cost_payment_method,
        cost_currency: form.cost_type !== 'Free' && form.cost_payment_method === 'Real Money' ? form.cost_currency : null,
        is_paid: form.program_type === 'Internship' ? form.is_paid : false,
        pay_type: form.program_type === 'Internship' && form.is_paid ? form.pay_type : null,
        pay_amount: form.program_type === 'Internship' && form.is_paid && form.pay_amount ? parseFloat(form.pay_amount) : null,
        pay_payment_method: form.program_type === 'Internship' && form.is_paid ? form.pay_payment_method : null,
        pay_currency: form.program_type === 'Internship' && form.is_paid && form.pay_payment_method === 'Real Money' ? form.pay_currency : null,
        interview_required: form.program_type === 'Internship' ? form.interview_required : false,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: 'Open',
      })
      if (error) throw error
      router.push('/my-programs')
    } catch (err) { setError(err.message) }
    setSubmitting(false)
  }

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading...</div></div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap" style={{ maxWidth: 640 }}>
        <div className="page-header">
          <h1 className="page-title">Start a Program</h1>
          <p className="page-subtitle">Create a course or internship for students to join — free, no Sparks involved to enroll</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Program Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { value: 'Course', label: 'Course', icon: GraduationCap },
                  { value: 'Internship', label: 'Internship', icon: Briefcase },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setForm({ ...form, program_type: opt.value })} style={{
                    padding: '1rem', borderRadius: 'var(--radius)', border: `2px solid ${form.program_type === opt.value ? 'var(--brand)' : 'var(--border)'}`,
                    background: form.program_type === opt.value ? 'var(--brand-light)' : 'var(--surface-2)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.625rem', transition: 'all var(--transition)'
                  }}>
                    <opt.icon size={18} style={{ color: form.program_type === opt.value ? 'var(--brand)' : 'var(--text-3)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: form.program_type === opt.value ? 'var(--brand)' : 'var(--text)' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" required placeholder="e.g. Intro to Web Development" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea rows={5} placeholder="What will students learn or do? Schedule, requirements..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="form-textarea" />
            </div>

            <div className="form-group">
              <label className="form-label">{form.program_type} Duration (optional)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-3)', display: 'block', marginBottom: '0.3rem' }}>Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-3)', display: 'block', marginBottom: '0.3rem' }}>End Date</label>
                  <input type="date" min={form.start_date || undefined} value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="form-input" />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Level</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                  <button key={lvl} type="button" onClick={() => setForm({ ...form, level: lvl })} style={{
                    padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: `2px solid ${form.level === lvl ? 'var(--brand)' : 'var(--border)'}`,
                    background: form.level === lvl ? 'var(--brand-light)' : 'var(--surface-2)',
                    cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', color: form.level === lvl ? 'var(--brand)' : 'var(--text)',
                    transition: 'all var(--transition)'
                  }}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cost</label>
              <select value={form.cost_type} onChange={e => setForm({ ...form, cost_type: e.target.value })} className="form-select" style={{ marginBottom: '0.75rem' }}>
                <option value="Free">Free</option>
                <option value="Per Hour">Priced — Per Hour</option>
                <option value="Per Class">Priced — Per Class</option>
                <option value="Per Month">Priced — Per Month</option>
                <option value="Whole Course">Priced — Whole Course</option>
              </select>

              {form.cost_type !== 'Free' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <button type="button" onClick={() => setForm({ ...form, cost_payment_method: 'Real Money' })} style={{
                      padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: `2px solid ${form.cost_payment_method === 'Real Money' ? 'var(--brand)' : 'var(--border)'}`,
                      background: form.cost_payment_method === 'Real Money' ? 'var(--brand-light)' : 'var(--surface-2)', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.82rem', color: form.cost_payment_method === 'Real Money' ? 'var(--brand)' : 'var(--text)'
                    }}>
                      Real Money
                    </button>
                    <button type="button" onClick={() => setForm({ ...form, cost_payment_method: 'Sparks' })} style={{
                      padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: `2px solid ${form.cost_payment_method === 'Sparks' ? 'var(--brand)' : 'var(--border)'}`,
                      background: form.cost_payment_method === 'Sparks' ? 'var(--brand-light)' : 'var(--surface-2)', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.82rem', color: form.cost_payment_method === 'Sparks' ? 'var(--brand)' : 'var(--text)'
                    }}>
                      Sparks (SPK)
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    {form.cost_payment_method === 'Real Money' && (
                      <select value={form.cost_currency} onChange={e => setForm({ ...form, cost_currency: e.target.value })} className="form-select" style={{ width: 100, flexShrink: 0 }}>
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    )}
                    <input
                      type="number" min="0" step="0.01"
                      placeholder={`Amount (${form.cost_type.toLowerCase()})`}
                      value={form.cost_amount}
                      onChange={e => setForm({ ...form, cost_amount: e.target.value })}
                      className="form-input" style={{ flex: 1 }}
                    />
                  </div>
                </>
              )}
              <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.4rem' }}>
                This is informational only — joining through ElevateHours never charges Sparks automatically. Any payment (real money or Sparks) is arranged directly between you and the student.
              </p>
            </div>

            {form.program_type === 'Internship' && (
              <>
                <div className="form-group">
                  <label className="form-label">Compensation</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: form.is_paid ? '0.75rem' : 0 }}>
                    <button type="button" onClick={() => setForm({ ...form, is_paid: false })} style={{
                      padding: '0.75rem', borderRadius: 'var(--radius)', border: `2px solid ${!form.is_paid ? 'var(--brand)' : 'var(--border)'}`,
                      background: !form.is_paid ? 'var(--brand-light)' : 'var(--surface-2)', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.85rem', color: !form.is_paid ? 'var(--brand)' : 'var(--text)'
                    }}>
                      Unpaid
                    </button>
                    <button type="button" onClick={() => setForm({ ...form, is_paid: true })} style={{
                      padding: '0.75rem', borderRadius: 'var(--radius)', border: `2px solid ${form.is_paid ? 'var(--brand)' : 'var(--border)'}`,
                      background: form.is_paid ? 'var(--brand-light)' : 'var(--surface-2)', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.85rem', color: form.is_paid ? 'var(--brand)' : 'var(--text)'
                    }}>
                      Paid
                    </button>
                  </div>

                  {form.is_paid && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
                        <button type="button" onClick={() => setForm({ ...form, pay_payment_method: 'Real Money' })} style={{
                          padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: `2px solid ${form.pay_payment_method === 'Real Money' ? 'var(--brand)' : 'var(--border)'}`,
                          background: form.pay_payment_method === 'Real Money' ? 'var(--brand-light)' : 'var(--surface-2)', cursor: 'pointer',
                          fontWeight: 700, fontSize: '0.82rem', color: form.pay_payment_method === 'Real Money' ? 'var(--brand)' : 'var(--text)'
                        }}>
                          Real Money
                        </button>
                        <button type="button" onClick={() => setForm({ ...form, pay_payment_method: 'Sparks' })} style={{
                          padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: `2px solid ${form.pay_payment_method === 'Sparks' ? 'var(--brand)' : 'var(--border)'}`,
                          background: form.pay_payment_method === 'Sparks' ? 'var(--brand-light)' : 'var(--surface-2)', cursor: 'pointer',
                          fontWeight: 700, fontSize: '0.82rem', color: form.pay_payment_method === 'Sparks' ? 'var(--brand)' : 'var(--text)'
                        }}>
                          Sparks (SPK)
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <select value={form.pay_type} onChange={e => setForm({ ...form, pay_type: e.target.value })} className="form-select" style={{ flex: 1 }}>
                          <option value="Per Hour">Per Hour</option>
                          <option value="Per Month">Per Month</option>
                          <option value="One-time">One-time</option>
                        </select>
                        {form.pay_payment_method === 'Real Money' && (
                          <select value={form.pay_currency} onChange={e => setForm({ ...form, pay_currency: e.target.value })} className="form-select" style={{ width: 100, flexShrink: 0 }}>
                            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        )}
                        <input
                          type="number" min="0" step="0.01" placeholder="Amount"
                          value={form.pay_amount}
                          onChange={e => setForm({ ...form, pay_amount: e.target.value })}
                          className="form-input" style={{ flex: 1 }}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Interview Process</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button type="button" onClick={() => setForm({ ...form, interview_required: false })} style={{
                      padding: '0.75rem', borderRadius: 'var(--radius)', border: `2px solid ${!form.interview_required ? 'var(--brand)' : 'var(--border)'}`,
                      background: !form.interview_required ? 'var(--brand-light)' : 'var(--surface-2)', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.85rem', color: !form.interview_required ? 'var(--brand)' : 'var(--text)'
                    }}>
                      No Interview
                    </button>
                    <button type="button" onClick={() => setForm({ ...form, interview_required: true })} style={{
                      padding: '0.75rem', borderRadius: 'var(--radius)', border: `2px solid ${form.interview_required ? 'var(--brand)' : 'var(--border)'}`,
                      background: form.interview_required ? 'var(--brand-light)' : 'var(--surface-2)', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.85rem', color: form.interview_required ? 'var(--brand)' : 'var(--text)'
                    }}>
                      Interview Required
                    </button>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.4rem' }}>
                    If required, students will see an "Interview Required" badge on Marketplace.
                  </p>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Capacity (optional)</label>
              <input type="number" min="1" placeholder="Leave blank for unlimited" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="form-input" />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
              {submitting ? 'Creating...' : 'Create Program'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

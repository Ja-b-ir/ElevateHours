'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { GraduationCap, Briefcase } from 'lucide-react'

export default function CreateProgram() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ title: '', program_type: 'Course', description: '', capacity: '' })
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
    setSubmitting(true)
    try {
      const { error } = await supabase.from('programs').insert({
        creator_id: user.id,
        title: form.title,
        program_type: form.program_type,
        description: form.description,
        capacity: form.capacity ? parseInt(form.capacity) : null,
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
          <p className="page-subtitle">Create a course or internship for students to join — free, no Sparks involved</p>
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
              <textarea rows={5} placeholder="What will students learn or do? Duration, schedule, requirements..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="form-textarea" />
            </div>

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

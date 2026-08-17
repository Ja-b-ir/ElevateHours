'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Send, CheckCircle2 } from 'lucide-react'

export default function DynamicApplicationForm({ program, onClose, onSubmitted }) {
  const [values, setValues] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!program) return null
  const fields = program.application_form || []

  const setValue = (id, val) => setValues(prev => ({ ...prev, [id]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    for (const field of fields) {
      if (field.required && !String(values[field.id] || '').trim()) {
        setError(`Please fill in "${field.label || 'a required field'}"`)
        return
      }
    }

    setSubmitting(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error('You must be signed in to apply.')

      const formData = fields.map(f => ({ label: f.label, type: f.type, value: values[f.id] || '' }))

      const { error: insertError } = await supabase.from('program_applications').insert({
        program_id: program.id,
        applicant_id: user.id,
        form_data: formData,
      })
      if (insertError) throw insertError

      const { data: profileData } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      await supabase.from('notifications').insert({
        user_id: program.creator_id,
        title: 'New Application',
        message: `${profileData?.full_name || 'Someone'} applied to "${program.title}".`,
        type: 'application',
        related_id: program.id,
      })

      setDone(true)
      onSubmitted?.(program.id)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto',
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)', padding: '2rem', position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem', width: 32, height: 32, borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {done ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <CheckCircle2 size={24} style={{ color: 'var(--green)' }} />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Application submitted!</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>
              The educator has been notified and will review your application.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.3rem', paddingRight: '2rem' }}>{program.title}</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>Fill out this application to be considered.</p>

            <form onSubmit={handleSubmit}>
              {fields.map((field) => (
                <div key={field.id} className="form-group">
                  <label className="form-label">{field.label || 'Untitled question'}{field.required && ' *'}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="form-input" rows={4}
                      value={values[field.id] || ''} onChange={e => setValue(field.id, e.target.value)}
                    />
                  ) : field.type === 'select' ? (
                    <select className="form-select" value={values[field.id] || ''} onChange={e => setValue(field.id, e.target.value)}>
                      <option value="">Select an option</option>
                      {(field.options || []).filter(Boolean).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                      className="form-input"
                      value={values[field.id] || ''} onChange={e => setValue(field.id, e.target.value)}
                    />
                  )}
                </div>
              ))}

              {error && <div className="alert alert-error">{error}</div>}

              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {submitting ? 'Sending...' : <>Send Application <Send size={14} /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

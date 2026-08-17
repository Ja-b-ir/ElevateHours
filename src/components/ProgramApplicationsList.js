'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Inbox } from 'lucide-react'

// Drop this into your program detail/management view, passing the program's id:
// <ProgramApplicationsList programId={program.id} />
export default function ProgramApplicationsList({ programId }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!programId) return
    supabase
      .from('program_applications')
      .select('*, applicant:profiles!program_applications_applicant_id_fkey(full_name, email)')
      .eq('program_id', programId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setApplications(data || [])
        setLoading(false)
      })
  }, [programId])

  if (loading) {
    return <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', padding: '1rem 0' }}>Loading applications...</div>
  }

  if (applications.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-3)' }}>
        <Inbox size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
        <p style={{ fontSize: '0.85rem' }}>No applications yet.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {applications.map((app) => (
        <div key={app.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{app.applicant?.full_name || 'Unknown applicant'}</div>
              {app.applicant?.email && <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{app.applicant.email}</div>}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{new Date(app.created_at).toLocaleDateString()}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(app.form_data || []).map((entry, i) => (
              <div key={i}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{entry.label || 'Untitled question'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{entry.value || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

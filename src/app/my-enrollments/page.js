'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import LoadingScreen from '@/components/LoadingScreen'
import { GraduationCap, Briefcase, MessageSquare, Zap, Calendar } from 'lucide-react'

export default function MyEnrollments() {
  const router = useRouter()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: myEnroll } = await supabase
        .from('program_enrollments')
        .select('program_id, enrolled_at')
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false })

      const programIds = (myEnroll || []).map(e => e.program_id)

      let progsById = {}
      let creatorsById = {}
      if (programIds.length > 0) {
        const { data: progs } = await supabase.from('programs').select('*').in('id', programIds)
        progsById = Object.fromEntries((progs || []).map(p => [p.id, p]))

        const creatorIds = [...new Set((progs || []).map(p => p.creator_id))]
        if (creatorIds.length > 0) {
          const { data: creators } = await supabase.from('profiles').select('id, full_name').in('id', creatorIds)
          creatorsById = Object.fromEntries((creators || []).map(c => [c.id, c]))
        }
      }

      const merged = (myEnroll || [])
        .map(e => {
          const program = progsById[e.program_id]
          if (!program) return null // program may have been deleted since enrolling
          return {
            enrolled_at: e.enrolled_at,
            program,
            creator: creatorsById[program.creator_id],
          }
        })
        .filter(Boolean)

      setEnrollments(merged)
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <LoadingScreen text="Loading your programs..." />
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap">
        <div className="page-header">
          <h1 className="page-title">My Enrolled Programs</h1>
          <p className="page-subtitle">Every course and internship you've joined, in one place</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="card empty-state">
            <GraduationCap size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No enrollments yet</h3>
            <p>Browse the marketplace to find a course or internship to join.</p>
            <a href="/marketplace?tab=courses" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Browse Programs
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {enrollments.map(({ program: p, creator, enrolled_at }) => {
              const TypeIcon = p.program_type === 'Internship' ? Briefcase : GraduationCap
              return (
                <div key={p.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text)' }}>{p.title}</h3>
                        <span className={`badge ${p.program_type === 'Internship' ? 'badge-purple' : 'badge-blue'}`}>
                          <TypeIcon size={10} style={{ marginRight: 3, verticalAlign: -1 }} />{p.program_type}
                        </span>
                        <span className={p.status === 'Open' ? 'badge badge-open' : 'badge badge-gray'}>{p.status}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '0.6rem' }}>
                        <Calendar size={12} /> Enrolled {new Date(enrolled_at).toLocaleDateString()}
                        {creator?.full_name && <> · by {creator.full_name}</>}
                      </div>

                      {p.description && (
                        <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                          {p.description.slice(0, 140)}{p.description.length > 140 ? '...' : ''}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                      {p.group_chat_enabled && (
                        <a href={'/programs/chat?id=' + p.id} className="btn btn-primary btn-sm">
                          <MessageSquare size={13} /> Open Chat
                        </a>
                      )}
                      <a href={'/profile?id=' + p.creator_id} className="btn btn-secondary btn-sm">
                        View Educator
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

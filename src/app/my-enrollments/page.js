'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import LoadingScreen from '@/components/LoadingScreen'
import { GraduationCap, Briefcase, MessageSquare, Zap, Calendar, BookOpen } from 'lucide-react'

const TYPE_ICON = { Education: BookOpen, Course: GraduationCap, Internship: Briefcase }
const TYPE_BADGE = { Education: 'badge-green', Course: 'badge-blue', Internship: 'badge-purple' }

export default function MyEnrollments() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [tab, setTab] = useState('All')
  const [loading, setLoading] = useState(true)
  const [leaving, setLeaving] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const { data: myProf } = await supabase.from('profiles').select('account_type').eq('id', user.id).single()
      if (myProf?.account_type === 'Educator' || myProf?.account_type === 'Organization') {
        router.push('/my-programs')
        return
      }

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
            kind: 'program',
            enrolled_at: e.enrolled_at,
            program,
            creator: creatorsById[program.creator_id],
          }
        })
        .filter(Boolean)

      // Education-track marketplace transactions this person took on as the
      // provider (via Find Education → Apply) also count as "Education"
      // involvement here, alongside actual Education-type programs.
      const { data: eduTxns } = await supabase
        .from('transactions')
        .select('*, skill:skills_catalog(skill_name), receiver:profiles!transactions_receiver_id_fkey(id, full_name)')
        .eq('provider_id', user.id)
        .eq('track', 'Education')
        .order('created_at', { ascending: false })

      const txnItems = (eduTxns || []).map(t => ({
        kind: 'transaction',
        enrolled_at: t.created_at,
        transaction: t,
      }))

      const combined = [...merged, ...txnItems].sort((a, b) => new Date(b.enrolled_at) - new Date(a.enrolled_at))
      setEnrollments(combined)
      setLoading(false)
    }
    init()
  }, [])

  const leaveProgram = async (program) => {
    if (!confirm(`Leave "${program.title}"? You can re-join later if it's still open.`)) return
    setLeaving(program.id)
    try {
      const { error } = await supabase.from('program_enrollments').delete().eq('program_id', program.id).eq('student_id', user.id)
      if (error) throw error
      setEnrollments(prev => prev.filter(e => e.kind !== 'program' || e.program.id !== program.id))
    } catch (err) { console.error(err) }
    setLeaving(null)
  }

  const typeOf = (item) => item.kind === 'transaction' ? 'Education' : item.program.program_type

  const counts = {
    All: enrollments.length,
    Education: enrollments.filter(e => typeOf(e) === 'Education').length,
    Course: enrollments.filter(e => typeOf(e) === 'Course').length,
    Internship: enrollments.filter(e => typeOf(e) === 'Internship').length,
  }
  const visibleEnrollments = tab === 'All' ? enrollments : enrollments.filter(e => typeOf(e) === tab)

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

        {enrollments.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['All', 'Education', 'Course', 'Internship'].map(t => (
              <button
                key={t} onClick={() => setTab(t)}
                style={{
                  padding: '0.45rem 0.95rem', borderRadius: 'var(--radius-full)', border: `1.5px solid ${tab === t ? 'var(--brand)' : 'var(--border)'}`,
                  background: tab === t ? 'var(--brand)' : 'var(--surface)',
                  color: tab === t ? 'white' : 'var(--text-2)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit',
                }}
              >
                {t === 'All' ? 'All' : `${t}s`} {counts[t] > 0 && <span style={{ opacity: 0.75 }}>({counts[t]})</span>}
              </button>
            ))}
          </div>
        )}

        {enrollments.length === 0 ? (
          <div className="card empty-state">
            <GraduationCap size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No enrollments yet</h3>
            <p>Browse the marketplace to find a course or internship to join.</p>
            <a href="/marketplace?tab=courses" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Browse Programs
            </a>
          </div>
        ) : visibleEnrollments.length === 0 ? (
          <div className="card empty-state">
            <GraduationCap size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No {tab.toLowerCase()} enrollments</h3>
            <p>You're not enrolled in any {tab.toLowerCase()} programs yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {visibleEnrollments.map((item) => {
              if (item.kind === 'transaction') {
                const t = item.transaction
                return (
                  <div key={'t-' + t.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1rem', color: 'var(--text)' }}>{t.skill?.skill_name || 'Education request'}</h3>
                          <span className="badge badge-green">
                            <BookOpen size={10} style={{ marginRight: 3, verticalAlign: -1 }} />Education
                          </span>
                          <span className={t.status === 'Confirmed' ? 'badge badge-confirmed' : 'badge badge-gray'}>{t.status}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                          <Calendar size={12} /> Applied {new Date(item.enrolled_at).toLocaleDateString()}
                          {t.receiver?.full_name && <> · requested by {t.receiver.full_name}</>}
                          <Zap size={11} style={{ marginLeft: '0.3rem' }} /> {t.total_sparks_transferred || 0} SPK
                        </div>
                        <p style={{ color: 'var(--text-3)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                          From a one-off Find Education request, not a structured program.
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                        {t.receiver?.id && (
                          <a href={'/profile?id=' + t.receiver.id} className="btn btn-secondary btn-sm">View Requester</a>
                        )}
                        <a href="/transactions" className="btn btn-primary btn-sm">Manage in Transactions</a>
                      </div>
                    </div>
                  </div>
                )
              }

              const p = item.program
              const creator = item.creator
              const TypeIcon = TYPE_ICON[p.program_type] || GraduationCap
              return (
                <div key={p.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text)' }}>{p.title}</h3>
                        <span className={`badge ${TYPE_BADGE[p.program_type] || 'badge-blue'}`}>
                          <TypeIcon size={10} style={{ marginRight: 3, verticalAlign: -1 }} />{p.program_type}
                        </span>
                        <span className={p.status === 'Open' ? 'badge badge-open' : 'badge badge-gray'}>{p.status}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '0.6rem' }}>
                        <Calendar size={12} /> Enrolled {new Date(item.enrolled_at).toLocaleDateString()}
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
                      <button
                        onClick={() => leaveProgram(p)}
                        disabled={leaving === p.id}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--red, #d33)', borderColor: 'var(--red, #d33)' }}
                      >
                        {leaving === p.id ? 'Leaving...' : 'Leave'}
                      </button>
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

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { GraduationCap, Briefcase, Users, Plus, X, MessageSquare } from 'lucide-react'

export default function MyPrograms() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [students, setStudents] = useState({}) // { programId: [ {id, full_name, enrolled_at} ] }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      await fetchPrograms(user.id)
      setLoading(false)
    }
    init()
  }, [])

  const fetchPrograms = async (uid) => {
    const { data: progs } = await supabase.from('programs').select('*').eq('creator_id', uid).order('created_at', { ascending: false })
    const progIds = (progs || []).map(p => p.id)
    let counts = {}
    if (progIds.length > 0) {
      const { data: allEnrollments } = await supabase.from('program_enrollments').select('program_id').in('program_id', progIds)
      for (const e of allEnrollments || []) counts[e.program_id] = (counts[e.program_id] || 0) + 1
    }
    setPrograms((progs || []).map(p => ({ ...p, enrolledCount: counts[p.id] || 0 })))
  }

  const toggleExpand = async (programId) => {
    if (expanded === programId) { setExpanded(null); return }
    setExpanded(programId)
    if (!students[programId]) {
      const { data: enrollments } = await supabase.from('program_enrollments').select('student_id, enrolled_at').eq('program_id', programId).order('enrolled_at', { ascending: false })
      const studentIds = (enrollments || []).map(e => e.student_id)
      let profilesById = {}
      if (studentIds.length > 0) {
        const { data: profs } = await supabase.from('profiles').select('id, full_name, account_type').in('id', studentIds)
        profilesById = Object.fromEntries((profs || []).map(p => [p.id, p]))
      }
      setStudents(prev => ({
        ...prev,
        [programId]: (enrollments || []).map(e => ({ ...profilesById[e.student_id], enrolled_at: e.enrolled_at, id: e.student_id }))
      }))
    }
  }

  const toggleStatus = async (program) => {
    const newStatus = program.status === 'Open' ? 'Closed' : 'Open'
    await supabase.from('programs').update({ status: newStatus }).eq('id', program.id)
    setPrograms(prev => prev.map(p => p.id === program.id ? { ...p, status: newStatus } : p))
  }

  const toggleGroupChat = async (program) => {
    const next = !program.group_chat_enabled
    const { error } = await supabase.from('programs').update({ group_chat_enabled: next }).eq('id', program.id)
    if (error) { alert('Could not update group chat setting: ' + error.message); return }
    setPrograms(prev => prev.map(p => p.id === program.id ? { ...p, group_chat_enabled: next } : p))
  }

  const toggleStudentsSend = async (program) => {
    const next = !program.chat_students_can_send
    const { error } = await supabase.from('programs').update({ chat_students_can_send: next }).eq('id', program.id)
    if (error) { alert('Could not update setting: ' + error.message); return }
    setPrograms(prev => prev.map(p => p.id === program.id ? { ...p, chat_students_can_send: next } : p))
  }

  const deleteProgram = async (programId) => {
    const confirmed = window.confirm('Delete this program and all enrollment records? This cannot be undone.')
    if (!confirmed) return
    await supabase.from('program_enrollments').delete().eq('program_id', programId)
    await supabase.from('programs').delete().eq('id', programId)
    setPrograms(prev => prev.filter(p => p.id !== programId))
  }

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading your programs...</div></div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">My Programs</h1>
            <p className="page-subtitle">Manage your courses and internships, and track enrollment</p>
          </div>
          <a href="/programs/create" className="btn btn-primary">
            <Plus size={15} /> New Program
          </a>
        </div>

        {programs.length === 0 ? (
          <div className="card empty-state">
            <GraduationCap size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No programs yet</h3>
            <p>Create your first course or internship to start accepting students.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {programs.map(p => {
              const TypeIcon = p.program_type === 'Internship' ? Briefcase : GraduationCap
              const isExpanded = expanded === p.id
              return (
                <div key={p.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text)' }}>{p.title}</h3>
                        <span className={`badge ${p.program_type === 'Internship' ? 'badge-purple' : 'badge-blue'}`}>
                          <TypeIcon size={10} style={{ marginRight: 3, verticalAlign: -1 }} />{p.program_type}
                        </span>
                        {p.level && <span className="badge badge-gray">{p.level}</span>}
                        <span className={p.cost_type === 'Free' || !p.cost_type ? 'badge badge-green' : 'badge badge-amber'}>
                          {!p.cost_type || p.cost_type === 'Free' ? 'Free' : p.cost_amount ? `$${p.cost_amount} / ${p.cost_type.replace('Per ', '').toLowerCase()}` : p.cost_type}
                        </span>
                        {p.program_type === 'Internship' && (
                          <span className={p.is_paid ? 'badge badge-green' : 'badge badge-gray'}>
                            {p.is_paid ? (p.pay_amount ? `Paid — $${p.pay_amount}/${p.pay_type === 'One-time' ? 'one-time' : p.pay_type.replace('Per ', '').toLowerCase()}` : 'Paid') : 'Unpaid'}
                          </span>
                        )}
                        {p.interview_required && <span className="badge badge-red">Interview Required</span>}
                        <span className={p.status === 'Open' ? 'badge badge-open' : 'badge badge-gray'}>{p.status}</span>
                      </div>
                      <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{p.description}</p>
                      <button onClick={() => toggleExpand(p.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--brand)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>
                        <Users size={14} /> {p.enrolledCount}{p.capacity ? ' / ' + p.capacity : ''} enrolled — {isExpanded ? 'hide' : 'view'} students
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                      <a href={'/programs/chat?id=' + p.id} className="btn btn-primary btn-sm">
                        <MessageSquare size={13} /> Open Chat
                      </a>
                      <button onClick={() => toggleStatus(p)} className="btn btn-secondary btn-sm">
                        {p.status === 'Open' ? 'Close' : 'Reopen'}
                      </button>
                      <button onClick={() => deleteProgram(p.id)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)' }}>Group Chat</span>
                      <button
                        onClick={() => toggleGroupChat(p)}
                        style={{
                          width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer',
                          background: p.group_chat_enabled ? 'var(--brand)' : 'var(--surface-3)', position: 'relative', transition: 'all var(--transition)'
                        }}
                      >
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3,
                          left: p.group_chat_enabled ? 21 : 3, transition: 'all var(--transition)'
                        }} />
                      </button>
                    </div>
                    {p.group_chat_enabled && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)' }}>Students Can Send Messages</span>
                        <button
                          onClick={() => toggleStudentsSend(p)}
                          style={{
                            width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer',
                            background: p.chat_students_can_send ? 'var(--brand)' : 'var(--surface-3)', position: 'relative', transition: 'all var(--transition)'
                          }}
                        >
                          <div style={{
                            width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3,
                            left: p.chat_students_can_send ? 21 : 3, transition: 'all var(--transition)'
                          }} />
                        </button>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{p.chat_students_can_send ? 'Everyone can post' : 'Announcements only'}</span>
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                      {!students[p.id] ? (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Loading students...</div>
                      ) : students[p.id].length === 0 ? (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>No students enrolled yet.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {students[p.id].map((s, i) => (
                            <a key={i} href={'/profile?id=' + s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                                {s.full_name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>{s.full_name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Enrolled {new Date(s.enrolled_at).toLocaleDateString()}</div>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { GraduationCap, Briefcase, Users, Check } from 'lucide-react'

export default function ProgramsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [programs, setPrograms] = useState([])
  const [myEnrollments, setMyEnrollments] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const { data: progs } = await supabase
        .from('programs')
        .select('*')
        .eq('status', 'Open')
        .order('created_at', { ascending: false })

      const creatorIds = Array.from(new Set((progs || []).map(p => p.creator_id)))
      let creatorById = {}
      if (creatorIds.length > 0) {
        const { data: creators } = await supabase.from('profiles').select('id, full_name, account_type').in('id', creatorIds)
        creatorById = Object.fromEntries((creators || []).map(c => [c.id, c]))
      }

      const progIds = (progs || []).map(p => p.id)
      let enrollCounts = {}
      if (progIds.length > 0) {
        const { data: allEnrollments } = await supabase.from('program_enrollments').select('program_id').in('program_id', progIds)
        for (const e of allEnrollments || []) enrollCounts[e.program_id] = (enrollCounts[e.program_id] || 0) + 1
      }

      setPrograms((progs || []).map(p => ({ ...p, creator: creatorById[p.creator_id], enrolledCount: enrollCounts[p.id] || 0 })))

      const { data: myEnroll } = await supabase.from('program_enrollments').select('program_id').eq('student_id', user.id)
      setMyEnrollments(new Set((myEnroll || []).map(e => e.program_id)))

      setLoading(false)
    }
    init()
  }, [])

  const joinProgram = async (program) => {
    setJoining(program.id)
    try {
      const { error } = await supabase.from('program_enrollments').insert({ program_id: program.id, student_id: user.id })
      if (error) {
        if (error.message?.includes('PROGRAM_FULL')) {
          alert('This program just reached its capacity — no more spots available.')
          setPrograms(prev => prev.map(p => p.id === program.id ? { ...p, status: 'Closed' } : p).filter(p => p.status === 'Open'))
          setJoining(null)
          return
        }
        throw error
      }
      setMyEnrollments(prev => new Set([...prev, program.id]))
      setPrograms(prev => prev.map(p => p.id === program.id ? { ...p, enrolledCount: p.enrolledCount + 1 } : p))

      await supabase.from('notifications').insert({
        user_id: program.creator_id,
        title: 'New Enrollment',
        message: `Someone joined your program "${program.title}".`,
        type: 'application',
        related_id: program.id
      })

      setSuccess('Enrolled successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { console.error(err) }
    setJoining(null)
  }

  const formatCost = (p) => {
    if (!p.cost_type || p.cost_type === 'Free') return 'Free'
    if (!p.cost_amount) return p.cost_type
    return `$${p.cost_amount} / ${p.cost_type.replace('Per ', '').toLowerCase()}`
  }

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading programs...</div></div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap">
        <div className="page-header">
          <h1 className="page-title">Programs</h1>
          <p className="page-subtitle">Courses and internships from educators and organizations — free to join</p>
        </div>

        {success && <div className="alert alert-success"><Check size={15} /> {success}</div>}

        {programs.length === 0 ? (
          <div className="card empty-state">
            <GraduationCap size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No programs open right now</h3>
            <p>Check back soon for new courses and internships.</p>
          </div>
        ) : (
          <div className="grid-auto">
            {programs.map(p => {
              const enrolled = myEnrollments.has(p.id)
              const full = p.capacity && p.enrolledCount >= p.capacity
              const TypeIcon = p.program_type === 'Internship' ? Briefcase : GraduationCap
              return (
                <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
                    <span className={`badge ${p.program_type === 'Internship' ? 'badge-purple' : 'badge-blue'}`}>
                      <TypeIcon size={10} style={{ marginRight: 3, verticalAlign: -1 }} />{p.program_type}
                    </span>
                    {p.level && <span className="badge badge-gray">{p.level}</span>}
                    <span className={p.cost_type === 'Free' || !p.cost_type ? 'badge badge-green' : 'badge badge-amber'}>{formatCost(p)}</span>
                  </div>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text)' }}>{p.title}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>
                    {p.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Users size={11} /> {p.enrolledCount}{p.capacity ? ' / ' + p.capacity : ''} enrolled
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>by {p.creator?.full_name || 'Unknown'}</span>
                    {enrolled ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.78rem', border: '1px solid var(--brand)' }}>
                        <Check size={11} /> Enrolled
                      </span>
                    ) : full ? (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600 }}>Full</span>
                    ) : (
                      <button onClick={() => joinProgram(p)} disabled={joining === p.id} className="btn btn-primary btn-sm">
                        {joining === p.id ? 'Joining...' : 'Join'}
                      </button>
                    )}
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

'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Search, Clock, Users, Briefcase, GraduationCap, ChevronRight, Check, Zap, MessageCircle, Mail, Bookmark } from 'lucide-react'

function MarketplaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const initialTab = tabParam === 'education' ? 'Find Education' : tabParam === 'work' ? 'Find Work' : 'Find Work'

  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [transactions, setTransactions] = useState([])
  const [profiles, setProfiles] = useState([])
  const [tiers, setTiers] = useState([])
  const [myApplications, setMyApplications] = useState(new Set())
  const [filterTier, setFilterTier] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [success, setSuccess] = useState('')
  const [myName, setMyName] = useState('')
  const [savedIds, setSavedIds] = useState(new Set())
  const [programs, setPrograms] = useState([])
  const [myEnrollments, setMyEnrollments] = useState(new Set())
  const [joiningProgram, setJoiningProgram] = useState(null)

  const tabs = [
    { key: 'Find Work', label: 'Find Work', icon: Briefcase },
    { key: 'Find Education', label: 'Find Education', icon: GraduationCap },
    { key: 'Programs', label: 'Programs', icon: GraduationCap },
    { key: 'Find Help (Work)', label: 'Find Talent', icon: Users },
    { key: 'Find Help (Education)', label: 'Find Educator', icon: GraduationCap },
  ]

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      const { data: myProf } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      setMyName(myProf?.full_name || 'Someone')
      const { data: tierData } = await supabase.from('tier_reference').select('*').order('multiplier')
      setTiers(tierData || [])
      const { data: apps } = await supabase.from('applications').select('transaction_id').eq('applicant_id', user.id)
      setMyApplications(new Set(apps?.map(a => a.transaction_id) || []))
      const { data: saved } = await supabase.from('saved_opportunities').select('transaction_id').eq('user_id', user.id)
      setSavedIds(new Set(saved?.map(s => s.transaction_id) || []))
      const { data: myEnroll } = await supabase.from('program_enrollments').select('program_id').eq('student_id', user.id)
      setMyEnrollments(new Set((myEnroll || []).map(e => e.program_id)))
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [activeTab, filterTier, user])

  const fetchData = async () => {
    if (activeTab === 'Find Work' || activeTab === 'Find Education') {
      const track = activeTab === 'Find Work' ? 'Work' : 'Education'
      let query = supabase
        .from('transactions')
        .select('*, receiver_id, skill:skills_catalog(skill_name, track), tier:tier_reference(tier_name, work_sparks_per_hour, education_sparks_per_hour), receiver:profiles!transactions_receiver_id_fkey(full_name, account_type)')
        .eq('status', 'Open').eq('track', track).is('provider_id', null).neq('receiver_id', user.id)
      if (filterTier) query = query.eq('tier_id', filterTier)
      const { data } = await query.order('created_at', { ascending: false })
      setTransactions(data || [])
    } else if (activeTab === 'Programs') {
      const { data: progs } = await supabase.from('programs').select('*').eq('status', 'Open').order('created_at', { ascending: false })
      const creatorIds = Array.from(new Set((progs || []).map(p => p.creator_id)))
      let creatorById = {}
      if (creatorIds.length > 0) {
        const { data: creators } = await supabase.from('profiles').select('id, full_name, account_type').in('id', creatorIds)
        creatorById = Object.fromEntries((creators || []).map(c => [c.id, c]))
      }
      const progIds = (progs || []).map(p => p.id)
      let counts = {}
      if (progIds.length > 0) {
        const { data: allEnrollments } = await supabase.from('program_enrollments').select('program_id').in('program_id', progIds)
        for (const e of allEnrollments || []) counts[e.program_id] = (counts[e.program_id] || 0) + 1
      }
      setPrograms((progs || []).map(p => ({ ...p, creator: creatorById[p.creator_id], enrolledCount: counts[p.id] || 0 })))
    } else {
      const track = activeTab === 'Find Help (Work)' ? 'Work' : 'Education'
      if (track === 'Education') {
        // Education helpers = dedicated Educator accounts + any Personal account offering education skills
        const { data: educators } = await supabase.from('profiles').select('*').eq('account_type', 'Educator').neq('id', user.id)
        const { data: personalWithSkills } = await supabase.from('profiles').select('*, skills:profile_skills_offered(skill:skills_catalog(skill_name, track, tier:tier_reference(tier_name)))').eq('account_type', 'Personal').neq('id', user.id)
        const filteredPersonal = (personalWithSkills || []).filter(p => p.skills?.some(s => s.skill?.track === 'Education'))
        setProfiles([...(educators || []), ...filteredPersonal])
      } else {
        const { data } = await supabase.from('profiles').select('*, skills:profile_skills_offered(skill:skills_catalog(skill_name, track, tier:tier_reference(tier_name)))').eq('account_type', 'Personal').neq('id', user.id)
        setProfiles((data || []).filter(p => p.skills?.some(s => s.skill?.track === track)))
      }
    }
  }

  const joinProgram = async (program) => {
    setJoiningProgram(program.id)
    try {
      if (program.capacity && program.enrolledCount >= program.capacity) {
        alert('This program is full.')
        setJoiningProgram(null)
        return
      }
      const { error } = await supabase.from('program_enrollments').insert({ program_id: program.id, student_id: user.id })
      if (error) throw error
      setMyEnrollments(prev => new Set([...prev, program.id]))
      setPrograms(prev => prev.map(p => p.id === program.id ? { ...p, enrolledCount: p.enrolledCount + 1 } : p))
      await supabase.from('notifications').insert({
        user_id: program.creator_id,
        title: 'New Enrollment',
        message: `${myName} joined your program "${program.title}".`,
        type: 'application',
        related_id: program.id
      })
      setSuccess('Enrolled successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { console.error(err) }
    setJoiningProgram(null)
  }

  const applyToTransaction = async (txnId) => {
    setApplying(txnId)
    try {
      const { error } = await supabase.from('applications').insert({ transaction_id: txnId, applicant_id: user.id, status: 'Pending' })
      if (error) throw error
      setMyApplications(prev => new Set([...prev, txnId]))

      const txn = transactions.find(t => t.id === txnId)
      if (txn?.receiver_id) {
        await supabase.from('notifications').insert({
          user_id: txn.receiver_id,
          title: 'New Application',
          message: `${myName} applied to your request for "${txn.skill?.skill_name || 'a request'}".`,
          type: 'application',
          related_id: txnId
        })
      }

      setSuccess('Application submitted!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { console.error(err) }
    setApplying(null)
  }

  const toggleSaved = async (txnId) => {
    const isSaved = savedIds.has(txnId)
    if (isSaved) {
      setSavedIds(prev => { const next = new Set(prev); next.delete(txnId); return next })
      await supabase.from('saved_opportunities').delete().eq('user_id', user.id).eq('transaction_id', txnId)
    } else {
      setSavedIds(prev => new Set([...prev, txnId]))
      await supabase.from('saved_opportunities').insert({ user_id: user.id, transaction_id: txnId })
    }
  }

  const tierBadgeClass = (tierName) => {
    if (!tierName) return 'badge badge-gray'
    if (tierName.includes('1')) return 'badge badge-tier1'
    if (tierName.includes('2')) return 'badge badge-tier2'
    return 'badge badge-tier3'
  }

  const filteredTxns = transactions.filter(t => !search || t.skill?.skill_name?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()))
  const filteredProfiles = profiles.filter(p => !search || p.full_name?.toLowerCase().includes(search.toLowerCase()))
  const filteredPrograms = programs.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading marketplace...</div></div>

  const isListTab = activeTab === 'Find Work' || activeTab === 'Find Education'
  const isProgramsTab = activeTab === 'Programs'
  const isProfileTab = activeTab === 'Find Help (Work)' || activeTab === 'Find Help (Education)'

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap">
        <div className="page-header">
          <h1 className="page-title">Marketplace</h1>
          <p className="page-subtitle">Find work, find talent, find knowledge — all powered by Sparks</p>
        </div>

        {success && <div className="alert alert-success"><Check size={15} /> {success}</div>}

        {/* Search + filter bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search skills, descriptions..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: '2.5rem' }} />
          </div>
          {isListTab && (
            <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="form-select" style={{ width: 'auto', minWidth: 160 }}>
              <option value="">All Tiers</option>
              {tiers.map(t => <option key={t.id} value={t.id}>{t.tier_name}</option>)}
            </select>
          )}
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`tab-item ${activeTab === key ? 'active' : ''}`}>
              <Icon size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />{label}
            </button>
          ))}
        </div>

        {/* Opportunity cards */}
        {isListTab && (
          filteredTxns.length === 0 ? (
            <div className="card empty-state">
              <Search size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
              <h3>No opportunities found</h3>
              <p>Try a different filter or check back soon.</p>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--text-3)', fontSize: '0.78rem', marginBottom: '1rem' }}>{filteredTxns.length} opportunities found</p>
              <div className="grid-auto">
                {filteredTxns.map(txn => {
                  const applied = myApplications.has(txn.id)
                  const saved = savedIds.has(txn.id)
                  return (
                    <div key={txn.id} className="card" style={{ border: applied ? '1.5px solid var(--brand)' : '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.625rem' }}>
                        <h3 style={{ fontSize: '0.9rem', flex: 1, color: 'var(--text)' }}>{txn.skill?.skill_name}</h3>
                        <span className={tierBadgeClass(txn.tier?.tier_name)}>{txn.tier?.tier_name?.split(':')[0]}</span>
                        <button
                          onClick={() => toggleSaved(txn.id)}
                          title={saved ? 'Remove from saved' : 'Save opportunity'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: saved ? 'var(--brand)' : 'var(--text-3)', padding: 0, flexShrink: 0, display: 'flex' }}
                        >
                          <Bookmark size={17} fill={saved ? 'var(--brand)' : 'none'} />
                        </button>
                      </div>
                      <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>
                        {txn.description || 'No description provided.'}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--surface-3)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-2)', fontWeight: 600 }}>
                          <Clock size={10} /> {txn.agreed_hours}h
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--amber-light)', color: 'var(--amber-dark)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                          <Zap size={11} /> {txn.total_sparks_transferred || 0} SPK
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <a href={'/profile?id=' + txn.receiver_id} style={{ fontSize: '0.75rem', color: 'var(--text-3)', textDecoration: 'underline' }}>by {txn.receiver?.full_name}</a>
                        {applied ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.78rem', border: '1px solid var(--brand)' }}>
                            <Check size={11} /> Applied
                          </span>
                        ) : (
                          <button onClick={() => applyToTransaction(txn.id)} disabled={applying === txn.id} className="btn btn-primary btn-sm">
                            {applying === txn.id ? 'Applying...' : 'Apply'} <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )
        )}

        {/* Profile cards */}
        {isProfileTab && (
          filteredProfiles.length === 0 ? (
            <div className="card empty-state">
              <Users size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
              <h3>No individuals found yet</h3>
              <p>Check back as more members join.</p>
            </div>
          ) : (
            <div className="grid-auto">
              {filteredProfiles.map(p => (
                <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                    <div className="avatar avatar-md">{p.full_name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.full_name}</span>
                        {p.account_type === 'Educator' && <span className="badge badge-brand">Educator</span>}
                      </div>
                      <div style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>{p.tier_level || 'Tier 1: Foundational'}</div>
                    </div>
                  </div>

                  {p.account_type === 'Educator' && p.teaching_focus && (
                    <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.875rem', background: 'var(--surface-3)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      {p.teaching_focus}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.875rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--brand)' }}>{p.completed_transactions || 0}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Completed</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--amber)' }}>{p.impact_score || 0}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Impact Score</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem', flex: 1 }}>
                    {p.skills?.slice(0, 4).map((s, i) => (
                      <span key={i} style={{ background: 'var(--surface-3)', color: 'var(--text-2)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontWeight: 500 }}>
                        {s.skill?.skill_name}
                      </span>
                    ))}
                    {p.skills?.length > 4 && <span style={{ color: 'var(--text-3)', fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}>+{p.skills.length - 4}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a href={`/profile?id=${p.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      View Profile
                    </a>
                    <a href={'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(p.email || '')} target="_blank" rel="noopener noreferrer" className="btn btn-icon" style={{ background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--brand)' }} title="Email">
                      <Mail size={14} />
                    </a>
                    {p.whatsapp_number && (
                      <a href={`https://wa.me/${p.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm btn-icon" title="WhatsApp">
                        <MessageCircle size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Programs */}
        {isProgramsTab && (
          filteredPrograms.length === 0 ? (
            <div className="card empty-state">
              <GraduationCap size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
              <h3>No programs open right now</h3>
              <p>Check back soon for new courses and internships.</p>
            </div>
          ) : (
            <div className="grid-auto">
              {filteredPrograms.map(p => {
                const enrolled = myEnrollments.has(p.id)
                const full = p.capacity && p.enrolledCount >= p.capacity
                return (
                  <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.625rem' }}>
                      <span className={`badge ${p.program_type === 'Internship' ? 'badge-purple' : 'badge-blue'}`}>
                        {p.program_type}
                      </span>
                      {p.level && <span className="badge badge-gray">{p.level}</span>}
                      <span className={p.cost_type === 'Free' || !p.cost_type ? 'badge badge-green' : 'badge badge-amber'}>
                        {!p.cost_type || p.cost_type === 'Free' ? 'Free' : p.cost_amount ? `$${p.cost_amount} / ${p.cost_type.replace('Per ', '').toLowerCase()}` : p.cost_type}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text)' }}>{p.title}</h3>
                    <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>
                      {p.description || 'No description provided.'}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Users size={11} /> {p.enrolledCount}{p.capacity ? ' / ' + p.capacity : ''} enrolled
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <a href={'/profile?id=' + p.creator_id} style={{ fontSize: '0.75rem', color: 'var(--text-3)', textDecoration: 'underline' }}>by {p.creator?.full_name || 'Unknown'}</a>
                      {enrolled ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.78rem', border: '1px solid var(--brand)' }}>
                          <Check size={11} /> Enrolled
                        </span>
                      ) : full ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600 }}>Full</span>
                      ) : (
                        <button onClick={() => joinProgram(p)} disabled={joiningProgram === p.id} className="btn btn-primary btn-sm">
                          {joiningProgram === p.id ? 'Joining...' : 'Join'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default function Marketplace() {
  return (
    <Suspense fallback={<div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading marketplace...</div></div>}>
      <MarketplaceContent />
    </Suspense>
  )
}

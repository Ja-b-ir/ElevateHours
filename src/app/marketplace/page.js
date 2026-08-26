'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import LoadingScreen from '@/components/LoadingScreen'
import DynamicApplicationForm from '@/components/DynamicApplicationForm'
import { Search, Clock, Users, Briefcase, GraduationCap, ChevronRight, Check, Zap, MessageCircle, Mail, Bookmark, Award, X, Sparkles, TrendingUp } from 'lucide-react'

function isRecent(dateStr, days = 3) {
  if (!dateStr) return false
  return (Date.now() - new Date(dateStr).getTime()) < days * 24 * 3600 * 1000
}

const cardHover = (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.1)' }
const cardLeave = (e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }

function MarketplaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const TAB_MAP = { education: 'Find Education', work: 'Find Work', courses: 'Courses', internships: 'Internships' }
  const initialTab = TAB_MAP[tabParam] || 'Find Work'

  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [transactions, setTransactions] = useState([])
  const [profiles, setProfiles] = useState([])
  const [tiers, setTiers] = useState([])
  const [myApplications, setMyApplications] = useState(new Set())
  const [filterTier, setFilterTier] = useState('')
  const [skillChips, setSkillChips] = useState([])
  const [searchDraft, setSearchDraft] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)

  // Debounced skill autocomplete — queries skills_catalog as the person types
  useEffect(() => {
    if (!searchDraft.trim()) { setSuggestions([]); return }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('skills_catalog')
        .select('id, skill_name, track')
        .ilike('skill_name', `%${searchDraft.trim()}%`)
        .limit(8)
      setSuggestions((data || []).filter(s => !skillChips.includes(s.skill_name)))
    }, 250)
    return () => clearTimeout(timeout)
  }, [searchDraft, skillChips])
  const [applying, setApplying] = useState(null)
  const [success, setSuccess] = useState('')
  const [myName, setMyName] = useState('')
  const [savedIds, setSavedIds] = useState(new Set())
  const [programs, setPrograms] = useState([])
  const [myEnrollments, setMyEnrollments] = useState(new Set())
  const [joiningProgram, setJoiningProgram] = useState(null)
  const [appliedProgramIds, setAppliedProgramIds] = useState(new Set())
  const [applyingFormProgram, setApplyingFormProgram] = useState(null)

  const tabs = [
    { key: 'Find Work', label: 'Find Work', icon: Briefcase },
    { key: 'Find Education', label: 'Find Education', icon: GraduationCap },
    { key: 'Courses', label: 'Courses', icon: GraduationCap },
    { key: 'Internships', label: 'Internships', icon: Award },
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
      const { data: myProgApps } = await supabase.from('program_applications').select('program_id').eq('applicant_id', user.id)
      setAppliedProgramIds(new Set((myProgApps || []).map(a => a.program_id)))
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [activeTab, filterTier, user])

  // Sort options depend on what kind of content the active tab shows,
  // so reset to a sensible default whenever the tab changes.
  useEffect(() => {
    setSortBy('newest')
  }, [activeTab])

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
    } else if (activeTab === 'Courses' || activeTab === 'Internships') {
      const programType = activeTab === 'Courses' ? 'Course' : 'Internship'
      const { data: progs } = await supabase.from('programs').select('*').eq('status', 'Open').eq('program_type', programType).order('created_at', { ascending: false })
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
        const { data: educators } = await supabase.from('profiles').select('*, skills:profile_skills_offered(skill:skills_catalog(skill_name, track, tier:tier_reference(tier_name)))').eq('account_type', 'Educator').neq('id', user.id)
        const { data: personalWithSkills } = await supabase.from('profiles').select('*, skills:profile_skills_offered(skill:skills_catalog(skill_name, track, tier:tier_reference(tier_name)))').eq('account_type', 'Personal').neq('id', user.id)
        const filteredPersonal = (personalWithSkills || []).filter(p => p.skills?.some(s => s.skill?.track === 'Education'))
        setProfiles([...(educators || []), ...filteredPersonal])
      } else {
        // Find Talent shows every Personal account, whether or not they've added skills yet
        const { data } = await supabase.from('profiles').select('*, skills:profile_skills_offered(skill:skills_catalog(skill_name, track, tier:tier_reference(tier_name)))').eq('account_type', 'Personal').neq('id', user.id)
        setProfiles(data || [])
      }
    }
  }

  const joinProgram = async (program) => {
    setJoiningProgram(program.id)
    try {
      const { error } = await supabase.from('program_enrollments').insert({ program_id: program.id, student_id: user.id })
      if (error) {
        if (error.message?.includes('PROGRAM_FULL')) {
          alert('This program just reached its capacity — no more spots available.')
          setPrograms(prev => prev.filter(p => p.id !== program.id))
          setJoiningProgram(null)
          return
        }
        throw error
      }
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

  const matchesChips = (texts) => skillChips.length === 0 || skillChips.some(chip => texts.some(t => t?.toLowerCase().includes(chip.toLowerCase())))
  const filteredTxns = transactions.filter(t => matchesChips([t.skill?.skill_name, t.description]))
  const filteredProfiles = profiles.filter(p => matchesChips([p.full_name, ...(p.skills || []).map(s => s.skill?.skill_name)]))
  const filteredPrograms = programs.filter(p => matchesChips([p.title, p.description]))

  const isListTab = activeTab === 'Find Work' || activeTab === 'Find Education'
  const isProgramsTab = activeTab === 'Courses' || activeTab === 'Internships'
  const isProfileTab = activeTab === 'Find Help (Work)' || activeTab === 'Find Help (Education)'

  // Client-side sorting — the underlying Supabase query already orders by
  // created_at, this just lets the user reorder what's already loaded.
  const sortedTxns = [...filteredTxns].sort((a, b) => {
    if (sortBy === 'sparks') return (b.total_sparks_transferred || 0) - (a.total_sparks_transferred || 0)
    if (sortBy === 'hours') return (b.agreed_hours || 0) - (a.agreed_hours || 0)
    return new Date(b.created_at) - new Date(a.created_at)
  })
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    if (sortBy === 'enrolled') return b.enrolledCount - a.enrolledCount
    return new Date(b.created_at) - new Date(a.created_at)
  })
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (sortBy === 'rated') return (b.completed_transactions || 0) - (a.completed_transactions || 0)
    return new Date(b.created_at || 0) - new Date(a.created_at || 0)
  })

  const avgSparks = filteredTxns.length
    ? filteredTxns.reduce((s, t) => s + (t.total_sparks_transferred || 0), 0) / filteredTxns.length
    : 0

  const activeFilterChips = []
  skillChips.forEach(chip => activeFilterChips.push({ key: `skill-${chip}`, label: chip, clear: () => setSkillChips(prev => prev.filter(c => c !== chip)) }))
  if (filterTier) {
    const t = tiers.find(t => String(t.id) === String(filterTier))
    if (t) activeFilterChips.push({ key: 'tier', label: t.tier_name, clear: () => setFilterTier('') })
  }

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <LoadingScreen text="Loading marketplace..." />
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap" style={{ position: 'relative' }}>
        <div className="eh-mkt-decor" aria-hidden="true">
          <div className="eh-mkt-blob" style={{ top: -60, right: '8%', background: 'var(--brand)' }} />
        </div>

        <div className="page-header eh-mkt-fade-in">
          <h1 className="page-title">
            <span className="eh-mkt-gradient-text">Marketplace</span>
          </h1>
          <p className="page-subtitle">Find work, find talent, find knowledge — all powered by Sparks</p>
        </div>

        {success && <div className="alert alert-success"><Check size={15} /> {success}</div>}

        {/* Search + filter + sort bar */}
        <div className="eh-mkt-fade-in" style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap', position: 'relative', zIndex: 30 }}>
          <form
            onSubmit={e => {
              e.preventDefault()
              if (searchDraft.trim() && !skillChips.includes(searchDraft.trim())) setSkillChips(prev => [...prev, searchDraft.trim()])
              setSearchDraft('')
              setShowSuggestions(false)
            }}
            style={{ position: 'relative', flex: 1, minWidth: 200, display: 'flex', gap: '0.5rem' }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <div
                className="form-input"
                style={{
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem',
                  paddingLeft: '2.5rem', minHeight: 42, height: 'auto', paddingTop: skillChips.length ? '0.4rem' : undefined, paddingBottom: skillChips.length ? '0.4rem' : undefined,
                }}
              >
                <Search size={14} style={{ position: 'absolute', left: '0.875rem', top: skillChips.length ? '1.1rem' : '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                {skillChips.map(chip => (
                  <span
                    key={chip}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'var(--brand-light)', color: 'var(--brand)',
                      border: '1px solid var(--brand)', borderRadius: 999, padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                    }}
                  >
                    {chip}
                    <button
                      type="button" onClick={() => setSkillChips(prev => prev.filter(c => c !== chip))}
                      style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', display: 'flex', padding: 0 }}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={skillChips.length ? 'Add another skill...' : 'Search by skill (e.g. React, Spanish tutoring...)'}
                  value={searchDraft}
                  onChange={e => { setSearchDraft(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && !searchDraft && skillChips.length) {
                      setSkillChips(prev => prev.slice(0, -1))
                    }
                  }}
                  style={{ flex: 1, minWidth: 120, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', padding: '0.2rem 0' }}
                />
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.35rem', background: 'var(--surface, #fff)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius, 8px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 40, overflow: 'hidden', maxHeight: 260, overflowY: 'auto',
                  }}
                >
                  {suggestions.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        setSkillChips(prev => [...prev, s.skill_name])
                        setSearchDraft('')
                        setShowSuggestions(false)
                      }}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textAlign: 'left',
                        padding: '0.55rem 0.9rem', border: 'none', borderBottom: '1px solid var(--border)', background: 'none',
                        cursor: 'pointer', fontSize: '0.83rem',
                      }}
                    >
                      <span>{s.skill_name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{s.track}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0 1.1rem', borderRadius: 'var(--radius, 8px)',
                border: 'none', background: 'var(--brand)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <Search size={14} /> Search
            </button>
          </form>

          {isListTab && (
            <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="form-select" style={{ width: 'auto', minWidth: 160 }}>
              <option value="">All Tiers</option>
              {tiers.map(t => <option key={t.id} value={t.id}>{t.tier_name}</option>)}
            </select>
          )}

          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-select" style={{ width: 'auto', minWidth: 150 }}>
            {isListTab && (
              <>
                <option value="newest">Newest First</option>
                <option value="sparks">Highest Sparks</option>
                <option value="hours">Most Hours</option>
              </>
            )}
            {isProgramsTab && (
              <>
                <option value="newest">Newest First</option>
                <option value="enrolled">Most Enrolled</option>
              </>
            )}
            {isProfileTab && (
              <>
                <option value="newest">Newest Members</option>
                <option value="rated">Top Rated</option>
              </>
            )}
          </select>
        </div>

        {/* Active filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="eh-mkt-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {activeFilterChips.map(chip => (
              <button
                key={chip.key}
                onClick={chip.clear}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--brand)',
                  borderRadius: 999, padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {chip.label} <X size={12} />
              </button>
            ))}
            {activeFilterChips.length > 1 && (
              <button
                onClick={() => { setSkillChips([]); setSearchDraft(''); setFilterTier('') }}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="tab-bar eh-mkt-fade-in">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`tab-item ${activeTab === key ? 'active' : ''}`}>
              <Icon size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />{label}
            </button>
          ))}
        </div>

        {/* Opportunity cards */}
        {isListTab && (
          sortedTxns.length === 0 ? (
            <div className="card empty-state eh-mkt-fade-in">
              <Search size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
              <h3>No opportunities found</h3>
              <p>Try a different filter or check back soon.</p>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--text-3)', fontSize: '0.78rem', marginBottom: '1rem' }}>{sortedTxns.length} opportunities found</p>
              <div className="grid-auto">
                {sortedTxns.map((txn, i) => {
                  const applied = myApplications.has(txn.id)
                  const saved = savedIds.has(txn.id)
                  const fresh = isRecent(txn.created_at)
                  const popular = (txn.total_sparks_transferred || 0) > avgSparks && avgSparks > 0
                  return (
                    <div
                      key={txn.id} className="card eh-mkt-card eh-mkt-reveal"
                      onMouseEnter={cardHover} onMouseLeave={cardLeave}
                      style={{ border: applied ? '1.5px solid var(--brand)' : '1px solid var(--border)', display: 'flex', flexDirection: 'column', transitionDelay: `${(i % 8) * 40}ms` }}
                    >
                      {(fresh || popular) && (
                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
                          {fresh && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--green-light)', color: 'var(--green)', padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.65rem', fontWeight: 700 }}>
                              <Sparkles size={9} /> New
                            </span>
                          )}
                          {popular && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--amber-light)', color: 'var(--amber-dark)', padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.65rem', fontWeight: 700 }}>
                              <TrendingUp size={9} /> Popular
                            </span>
                          )}
                        </div>
                      )}
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
          sortedProfiles.length === 0 ? (
            <div className="card empty-state eh-mkt-fade-in">
              <Users size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
              <h3>No individuals found yet</h3>
              <p>Check back as more members join.</p>
            </div>
          ) : (
            <div className="grid-auto">
              {sortedProfiles.map((p, i) => (
                <div key={p.id} className="card eh-mkt-card eh-mkt-reveal" onMouseEnter={cardHover} onMouseLeave={cardLeave} style={{ display: 'flex', flexDirection: 'column', transitionDelay: `${(i % 8) * 40}ms` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                    <div className="avatar avatar-md" style={{ background: ['var(--brand)', 'var(--green)', 'var(--amber)'][i % 3], color: 'white' }}>{p.full_name?.[0]?.toUpperCase()}</div>
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
                    {p.skills?.slice(0, 4).map((s, si) => (
                      <span key={si} style={{ background: 'var(--surface-3)', color: 'var(--text-2)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontWeight: 500 }}>
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
          sortedPrograms.length === 0 ? (
            <div className="card empty-state eh-mkt-fade-in">
              <GraduationCap size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
              <h3>No programs open right now</h3>
              <p>Check back soon for new courses and internships.</p>
            </div>
          ) : (
            <div className="grid-auto">
              {sortedPrograms.map((p, i) => {
                const enrolled = myEnrollments.has(p.id)
                const full = p.capacity && p.enrolledCount >= p.capacity
                const fresh = isRecent(p.created_at)
                return (
                  <div key={p.id} className="card eh-mkt-card eh-mkt-reveal" onMouseEnter={cardHover} onMouseLeave={cardLeave} style={{ display: 'flex', flexDirection: 'column', transitionDelay: `${(i % 8) * 40}ms` }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.625rem' }}>
                      {fresh && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--green-light)', color: 'var(--green)', padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.65rem', fontWeight: 700 }}>
                          <Sparkles size={9} /> New
                        </span>
                      )}
                      <span className={`badge ${p.program_type === 'Internship' ? 'badge-purple' : 'badge-blue'}`}>
                        {p.program_type}
                      </span>
                      {p.level && <span className="badge badge-gray">{p.level}</span>}
                      <span className={p.cost_type === 'Free' || !p.cost_type ? 'badge badge-green' : 'badge badge-amber'}>
                        {!p.cost_type || p.cost_type === 'Free' ? 'Free' : p.cost_amount ? (
                          p.cost_payment_method === 'Sparks'
                            ? <>{p.cost_amount} <Zap size={10} style={{ display: 'inline', verticalAlign: -1 }} fill="currentColor" /> / {p.cost_type.replace('Per ', '').toLowerCase()}</>
                            : `${p.cost_amount} ${p.cost_currency || 'USD'} / ${p.cost_type.replace('Per ', '').toLowerCase()}`
                        ) : p.cost_type}
                      </span>
                      {p.program_type === 'Internship' && (
                        <span className={p.is_paid ? 'badge badge-green' : 'badge badge-gray'}>
                          {!p.is_paid ? 'Unpaid' : !p.pay_amount ? 'Paid' : (
                            p.pay_payment_method === 'Sparks'
                              ? <>Paid — {p.pay_amount} <Zap size={10} style={{ display: 'inline', verticalAlign: -1 }} fill="currentColor" /> / {p.pay_type === 'One-time' ? 'one-time' : p.pay_type?.replace('Per ', '').toLowerCase()}</>
                              : `Paid — ${p.pay_amount} ${p.pay_currency || 'USD'}/${p.pay_type === 'One-time' ? 'one-time' : p.pay_type?.replace('Per ', '').toLowerCase()}`
                          )}
                        </span>
                      )}
                      {p.interview_required && <span className="badge badge-red">Interview Required</span>}
                    </div>
                    {(p.start_date || p.end_date) && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.5rem' }}>
                        {p.start_date && p.end_date
                          ? `${new Date(p.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${new Date(p.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
                          : p.start_date ? `Starts ${new Date(p.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
                          : `Ends ${new Date(p.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      </div>
                    )}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {p.group_chat_enabled && (
                            <a href={'/programs/chat?id=' + p.id} style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 700, textDecoration: 'underline' }}>Chat</a>
                          )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.78rem', border: '1px solid var(--brand)' }}>
                            <Check size={11} /> Enrolled
                          </span>
                        </div>
                      ) : full ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600 }}>Full</span>
                      ) : (p.application_form && p.application_form.length > 0) ? (
                        appliedProgramIds.has(p.id) ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--surface-3)', color: 'var(--text-2)', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.78rem' }}>
                            <Check size={11} /> Applied
                          </span>
                        ) : (
                          <button onClick={() => setApplyingFormProgram(p)} className="btn btn-primary btn-sm">
                            Apply
                          </button>
                        )
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

      <DynamicApplicationForm
        program={applyingFormProgram}
        onClose={() => setApplyingFormProgram(null)}
        onSubmitted={(programId) => setAppliedProgramIds(prev => new Set([...prev, programId]))}
      />

      <style>{`
        .eh-mkt-decor {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .eh-mkt-blob {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.1;
          animation: eh-mkt-blob-float 20s ease-in-out infinite;
        }
        @keyframes eh-mkt-blob-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 16px) scale(1.1); }
        }
        .eh-mkt-gradient-text {
          background: linear-gradient(90deg, var(--brand), var(--green), var(--amber), var(--brand));
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: eh-mkt-gradient-shift 6s ease infinite;
        }
        @keyframes eh-mkt-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .eh-mkt-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .eh-mkt-fade-in {
          animation: eh-mkt-fade-in-kf 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .eh-mkt-reveal {
          animation: eh-mkt-fade-in-kf 0.45s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes eh-mkt-fade-in-kf {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .eh-mkt-blob, .eh-mkt-gradient-text, .eh-mkt-fade-in, .eh-mkt-reveal { animation: none !important; }
          .eh-mkt-card { transition: none !important; }
        }
      `}</style>
    </div>
  )
}

export default function Marketplace() {
  return (
    <Suspense fallback={<div style={{ background: 'var(--bg)', minHeight: '100vh' }}><Navbar /><LoadingScreen text="Loading marketplace..." /></div>}>
      <MarketplaceContent />
    </Suspense>
  )
}
